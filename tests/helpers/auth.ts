import { Page, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from '../utils/test-config';

/**
 * Verify that the user is authenticated by checking for auth indicators
 */
export async function verifyAuthenticated(page: Page) {
  // Check that we're not on login/signup pages
  expect(page.url()).not.toContain('/login');
  expect(page.url()).not.toContain('/signup');

  // Optionally navigate to dashboard to verify auth
  await page.goto('/dashboard');
  await expect(page).toHaveURL('/dashboard', { timeout: TEST_TIMEOUTS.TOAST });
}

/**
 * Navigate to a clean state before each test
 * Useful if a test leaves the app in a specific state
 */
export async function resetToDashboard(page: Page) {
  await page.goto('/dashboard');
  await expect(page).toHaveURL('/dashboard');
}

/**
 * Get the test user credentials from environment
 */
export function getTestCredentials() {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error('TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in .env.production.local');
  }

  return { email, password };
}
