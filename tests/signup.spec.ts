import { test, expect } from '@playwright/test';

test.describe('Signup Flow', () => {
  test('should sign up a new user and redirect to onboarding', async ({ page }) => {
    // Generate unique email for this test run
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@example.com`;
    const testPassword = 'TestPassword123!';

    // 1. Go to home page
    await page.goto('/');
    await expect(page).toHaveTitle(/Outward Sign/);

    // 2. Click on Sign up link (use first() since there are multiple)
    await page.locator('a[href="/signup"]').first().click();
    await expect(page).toHaveURL('/signup');

    // 3. Fill in the signup form
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);

    // 4. Submit the form
    await page.click('button[type="submit"]');

    // 5. Wait for the success message before redirect
    await page.waitForSelector('text=/Account created successfully/i', { timeout: 10000 });

    // 6. Wait for redirect to onboarding (may take a moment)
    await page.waitForURL('/onboarding', { timeout: 15000 });

    // 6. Verify we're on the onboarding page
    await expect(page).toHaveURL('/onboarding');
    await expect(page.locator('text=Create Your Parish')).toBeVisible();

    // Optional: Fill out onboarding form and verify it works
    await page.fill('input#parishName', 'Test Parish');
    await page.fill('input#city', 'Test City');
    await page.fill('input#state', 'TS');

    await page.click('button[type="submit"]');

    // Wait for preparing screen
    await expect(page.locator('text=/One minute while we get your parish ready for you/i')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/Creating categories and sample readings/i')).toBeVisible();

    // Should redirect to dashboard after creating parish and populating data
    await page.waitForURL('/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL('/dashboard');

    // Navigate to readings module to verify initial readings were populated
    // The readings link is in a collapsible section, so let's navigate directly
    await page.goto('/readings');
    await expect(page).toHaveURL('/readings');

    // Verify that the 3 initial readings were created
    await expect(page.locator('text=/1 Corinthians 13:4-13/i')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/John 14:1-6/i')).toBeVisible();
    await expect(page.locator('text=/Matthew 28:18-20/i')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/signup');

    // Try to sign up with invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'short');

    await page.click('button[type="submit"]');

    // Should show validation error (form won't submit)
    // The browser's built-in validation should prevent submission
    await expect(page).toHaveURL('/signup');
  });

  test('should navigate from home to signup', async ({ page }) => {
    await page.goto('/');

    // Find and click the first signup link (there are multiple on the page)
    const signupLink = page.locator('a[href="/signup"]').first();
    await expect(signupLink).toBeVisible();
    await signupLink.click();

    // Should be on signup page
    await expect(page).toHaveURL('/signup');
    await expect(page.locator('text=Sign up').first()).toBeVisible();
  });
});
