import { test, expect } from '@playwright/test';

test.describe('Signup Flow', () => {
  test('should sign up a new user and redirect to onboarding', async ({ page }) => {
    // Generate unique email for this test run
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@example.com`;
    const testPassword = 'TestPassword123!';

    // 1. Go to home page
    await page.goto('/');
    await expect(page).toHaveTitle(/Liturgy/);

    // 2. Click on Sign up link
    await page.click('a[href="/signup"]');
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

    // Should redirect to dashboard after creating parish
    await page.waitForURL('/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL('/dashboard');
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

    // Find and click the signup link
    const signupLink = page.locator('a[href="/signup"]');
    await expect(signupLink).toBeVisible();
    await signupLink.click();

    // Should be on signup page
    await expect(page).toHaveURL('/signup');
    await expect(page.locator('text=Sign up')).toBeVisible();
  });
});
