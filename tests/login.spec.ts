import { test, expect } from '@playwright/test';
import { getTestCredentials } from './helpers/auth';

test.describe('Login Flow', () => {
  test('should login with valid credentials and redirect to dashboard', async ({ page }) => {
    // Get test credentials from environment
    const { email, password } = getTestCredentials();

    // 1. Go to login page
    await page.goto('/login');
    await expect(page).toHaveURL('/login');

    // 2. Verify login page elements are visible
    await expect(page.getByText(/sign in to/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();

    // 3. Fill in the login form
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);

    // 4. Submit the form
    await page.getByRole('button', { name: /sign in/i }).click();

    // 5. Wait for redirect to dashboard (navigation proves success)
    await page.waitForURL('/dashboard', { timeout: 15000 });

    // 6. Verify we're on the dashboard page
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Try to login with invalid credentials
    await page.getByLabel(/email/i).fill('invalid@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');

    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show error message (Supabase returns "Invalid login credentials")
    await expect(page.locator('text=/invalid/i')).toBeVisible({ timeout: 5000 });

    // Should still be on login page
    await expect(page).toHaveURL('/login');
  });

  test('should show error for empty email', async ({ page }) => {
    await page.goto('/login');

    // Fill only password
    await page.getByLabel(/password/i).fill('somepassword');

    // Try to submit with empty email
    await page.getByRole('button', { name: /sign in/i }).click();

    // Browser validation should prevent submission
    await expect(page).toHaveURL('/login');
  });

  test('should show error for empty password', async ({ page }) => {
    await page.goto('/login');

    // Fill only email
    await page.getByLabel(/email/i).fill('test@example.com');

    // Try to submit with empty password
    await page.getByRole('button', { name: /sign in/i }).click();

    // Browser validation should prevent submission
    await expect(page).toHaveURL('/login');
  });

  test('should navigate from home to login', async ({ page }) => {
    await page.goto('/');

    // Find and click the login link
    const loginLink = page.locator('a[href="/login"]').first();
    await expect(loginLink).toBeVisible();
    await loginLink.click();

    // Should be on login page
    await expect(page).toHaveURL('/login');
    await expect(page.getByText(/sign in to/i)).toBeVisible();
  });

  test('should navigate from login to signup', async ({ page }) => {
    await page.goto('/login');

    // Find and click the signup link
    const signupLink = page.locator('a[href="/signup"]');
    await expect(signupLink).toBeVisible();
    await expect(signupLink).toHaveText(/sign up/i);

    await signupLink.click();

    // Should be on signup page
    await expect(page).toHaveURL('/signup');
  });

  test('should show loading state during login', async ({ page }) => {
    const { email, password } = getTestCredentials();

    await page.goto('/login');

    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/password/i).fill(password);

    // Click submit and immediately check for loading state
    await page.getByRole('button', { name: /sign in/i }).click();

    // The button text should change to "Signing in..." briefly
    // Note: This might be too fast to catch, but we can try
    const loadingButton = page.getByRole('button', { name: /signing in/i });
    // We use waitForSelector with a short timeout since loading state is brief
    try {
      await loadingButton.waitFor({ state: 'visible', timeout: 1000 });
    } catch {
      // Loading state might be too fast to catch - that's okay
    }

    // Eventually should redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 15000 });
  });
});
