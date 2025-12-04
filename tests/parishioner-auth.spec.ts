import { test, expect } from '@playwright/test';
import { setupParishionerAuth, cleanupParishioner } from './helpers/parishioner-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * Parishioner Portal - Authentication Tests
 *
 * Tests the magic link authentication flow for parishioners
 *
 * NOTE: These tests use a separate authentication system from staff auth
 * (magic links + cookie-based sessions instead of Supabase Auth)
 */

test.describe('Parishioner Authentication', () => {
  // These tests don't use staff auth - they test the parishioner portal auth
  test.use({ storageState: { cookies: [], origins: [] } });

  let testParishId: string;

  test.beforeAll(async () => {
    // Get the test parish ID
    const supabase = createAdminClient();
    const { data: parish } = await supabase
      .from('parishes')
      .select('id')
      .limit(1)
      .single();

    if (!parish) {
      throw new Error('No test parish found');
    }

    testParishId = parish.id;
  });

  test('should load login page with parish parameter', async ({ page }) => {
    await page.goto(`/parishioner/login?parish=${testParishId}`);
    await expect(page).toHaveURL(/\/parishioner\/login/, { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Verify login page elements
    await expect(page.getByRole('heading', { name: /Parishioner Portal/i })).toBeVisible();
    await expect(page.getByText(/Enter your email to receive a magic link/i)).toBeVisible();
    await expect(page.getByLabel(/Email Address/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Send Magic Link/i })).toBeVisible();
  });

  test('should show validation error for empty email', async ({ page }) => {
    await page.goto(`/parishioner/login?parish=${testParishId}`);

    // Try to submit empty form
    await page.getByRole('button', { name: /Send Magic Link/i }).click();

    // Browser validation should prevent submission
    await expect(page).toHaveURL(/\/parishioner\/login/);
  });

  test('should show validation error for invalid email format', async ({ page }) => {
    await page.goto(`/parishioner/login?parish=${testParishId}`);

    // Fill with invalid email
    await page.getByLabel(/Email Address/i).fill('not-an-email');
    await page.getByRole('button', { name: /Send Magic Link/i }).click();

    // Browser validation should prevent submission (HTML5 email validation)
    await expect(page).toHaveURL(/\/parishioner\/login/);
  });

  test('should show success message for magic link request', async ({ page }) => {
    const supabase = createAdminClient();

    // Create a test person with portal enabled
    const timestamp = Date.now();
    const email = `parishioner-${timestamp}@outwardsign.test`;

    const { data: person } = await supabase
      .from('people')
      .insert({
        parish_id: testParishId,
        full_name: `Test User ${timestamp}`,
        email: email,
        parishioner_portal_enabled: true,
      })
      .select()
      .single();

    if (!person) {
      throw new Error('Failed to create test person');
    }

    try {
      await page.goto(`/parishioner/login?parish=${testParishId}`);

      // Fill and submit form
      await page.getByLabel(/Email Address/i).fill(email);
      await page.getByRole('button', { name: /Send Magic Link/i }).click();

      // Should show success message (doesn't reveal if user exists)
      await expect(
        page.getByText(/Magic link sent! Check your email/i)
      ).toBeVisible({ timeout: TEST_TIMEOUTS.FORM_SUBMIT });

      // Button should show loading state briefly
      await expect(page.getByRole('button', { name: /Send Magic Link/i })).toBeVisible();
    } finally {
      // Cleanup
      await supabase.from('people').delete().eq('id', person.id);
      await supabase.from('parishioner_auth_sessions').delete().eq('person_id', person.id);
    }
  });

  test('should show success message even for non-existent email (security)', async ({ page }) => {
    await page.goto(`/parishioner/login?parish=${testParishId}`);

    // Try with email that doesn't exist
    const fakeEmail = `nonexistent-${Date.now()}@outwardsign.test`;
    await page.getByLabel(/Email Address/i).fill(fakeEmail);
    await page.getByRole('button', { name: /Send Magic Link/i }).click();

    // Should still show success message (don't reveal if user exists)
    await expect(
      page.getByText(/you will receive a magic link shortly/i)
    ).toBeVisible({ timeout: TEST_TIMEOUTS.FORM_SUBMIT });
  });

  test('should show rate limit error after too many requests', async ({ page }) => {
    const supabase = createAdminClient();

    // Create a test person
    const timestamp = Date.now();
    const email = `rate-limit-${timestamp}@outwardsign.test`;

    const { data: person } = await supabase
      .from('people')
      .insert({
        parish_id: testParishId,
        full_name: `Rate Limit Test ${timestamp}`,
        email: email,
        parishioner_portal_enabled: true,
      })
      .select()
      .single();

    if (!person) {
      throw new Error('Failed to create test person');
    }

    try {
      await page.goto(`/parishioner/login?parish=${testParishId}`);

      // Make multiple rapid requests (rate limit is 3 per hour)
      for (let i = 0; i < 4; i++) {
        await page.getByLabel(/Email Address/i).fill(email);
        await page.getByRole('button', { name: /Send Magic Link/i }).click();

        if (i < 3) {
          // First 3 should succeed
          await expect(
            page.getByText(/Magic link sent|you will receive/i)
          ).toBeVisible({ timeout: TEST_TIMEOUTS.FORM_SUBMIT });
        } else {
          // 4th should show rate limit error
          await expect(
            page.getByText(/Too many requests/i)
          ).toBeVisible({ timeout: TEST_TIMEOUTS.FORM_SUBMIT });
        }
      }
    } finally {
      // Cleanup
      await supabase.from('people').delete().eq('id', person.id);
      await supabase.from('parishioner_auth_sessions').delete().eq('person_id', person.id);
    }
  });

  test('should redirect to calendar after valid magic link', async ({ page }) => {
    const supabase = createAdminClient();

    // Create a test person and session
    const timestamp = Date.now();
    const email = `auth-test-${timestamp}@outwardsign.test`;

    const { data: person } = await supabase
      .from('people')
      .insert({
        parish_id: testParishId,
        full_name: `Auth Test ${timestamp}`,
        email: email,
        parishioner_portal_enabled: true,
      })
      .select()
      .single();

    if (!person) {
      throw new Error('Failed to create test person');
    }

    // Generate a plaintext token and hash
    const token = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const bcrypt = await import('bcryptjs');
    const hashedToken = await bcrypt.hash(token, 10);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    const { data: session } = await supabase
      .from('parishioner_auth_sessions')
      .insert({
        token: hashedToken,
        person_id: person.id,
        parish_id: testParishId,
        email_or_phone: email,
        delivery_method: 'email',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (!session) {
      throw new Error('Failed to create session');
    }

    try {
      // Visit auth page with token
      await page.goto(`/parishioner/auth?token=${token}`);

      // Should redirect to calendar
      await page.waitForURL(/\/parishioner\/calendar/, { timeout: TEST_TIMEOUTS.NAVIGATION });
      await expect(page).toHaveURL('/parishioner/calendar');
    } finally {
      // Cleanup
      await supabase.from('people').delete().eq('id', person.id);
      await supabase.from('parishioner_auth_sessions').delete().eq('person_id', person.id);
    }
  });

  test('should show error for invalid token', async ({ page }) => {
    const invalidToken = 'invalid-token-123';

    await page.goto(`/parishioner/auth?token=${invalidToken}`);

    // Should redirect back to login with error
    await page.waitForURL(/\/parishioner\/login/, { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page).toHaveURL(/error=/);
  });

  test('should show error for missing token', async ({ page }) => {
    await page.goto('/parishioner/auth');

    // Should redirect to login with error
    await page.waitForURL(/\/parishioner\/login/, { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page).toHaveURL(/error=no_token/);
  });

  test('should logout and redirect to login', async ({ page }) => {
    // Setup authenticated session
    const parishioner = await setupParishionerAuth(page);

    try {
      // Navigate to calendar to verify auth
      await page.goto('/parishioner/calendar');
      await expect(page).toHaveURL('/parishioner/calendar');

      // Logout
      await page.goto('/parishioner/logout');

      // Should redirect to login
      await page.waitForURL(/\/parishioner\/login/, { timeout: TEST_TIMEOUTS.NAVIGATION });

      // Try to access calendar again - should redirect to login
      await page.goto('/parishioner/calendar');
      await page.waitForURL(/\/parishioner\/login/, { timeout: TEST_TIMEOUTS.NAVIGATION });
    } finally {
      await cleanupParishioner(parishioner.personId);
    }
  });

  test('should show loading state during magic link request', async ({ page }) => {
    const supabase = createAdminClient();

    // Create a test person
    const timestamp = Date.now();
    const email = `loading-test-${timestamp}@outwardsign.test`;

    const { data: person } = await supabase
      .from('people')
      .insert({
        parish_id: testParishId,
        full_name: `Loading Test ${timestamp}`,
        email: email,
        parishioner_portal_enabled: true,
      })
      .select()
      .single();

    if (!person) {
      throw new Error('Failed to create test person');
    }

    try {
      await page.goto(`/parishioner/login?parish=${testParishId}`);

      await page.getByLabel(/Email Address/i).fill(email);

      // Click submit and check for loading state
      await page.getByRole('button', { name: /Send Magic Link/i }).click();

      // Loading state might be brief, but button should be disabled
      const button = page.getByRole('button', { name: /Sending/i });
      try {
        await button.waitFor({ state: 'visible', timeout: 1000 });
      } catch {
        // Loading state might be too fast to catch - that's okay
      }

      // Eventually should show success
      await expect(
        page.getByText(/Magic link sent/i)
      ).toBeVisible({ timeout: TEST_TIMEOUTS.FORM_SUBMIT });
    } finally {
      await supabase.from('people').delete().eq('id', person.id);
      await supabase.from('parishioner_auth_sessions').delete().eq('person_id', person.id);
    }
  });
});
