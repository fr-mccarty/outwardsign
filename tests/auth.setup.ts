import { test as setup, expect } from '@playwright/test';
import path from 'path';

// Path to store authenticated state
const authFile = path.join(__dirname, '../playwright/.auth/staff.json');

setup('authenticate as staff user', async ({ page }) => {
  // Credentials are passed dynamically from run-tests-with-temp-user.js
  // via environment variables in the Playwright process
  const testEmail = process.env.TEST_USER_EMAIL!;
  const testPassword = process.env.TEST_USER_PASSWORD!;

  if (!testEmail || !testPassword) {
    throw new Error(
      'TEST_USER_EMAIL and TEST_USER_PASSWORD must be set.\n' +
      'These are automatically provided when running via "npm test".\n' +
      'If running Playwright directly, ensure credentials are set in environment.'
    );
  }

  console.log(`Authenticating as ${testEmail}...`);

  // Go to login page
  await page.goto('/login');

  // Fill in credentials
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPassword);

  // Submit login form (use force: true to bypass NextJS dev overlay if present)
  await page.click('button[type="submit"]', { force: true });

  // Wait for successful login - could redirect to dashboard or onboarding
  // Use networkidle instead of load event (dashboard has slow client hydration)
  await page.waitForURL(/\/(dashboard|onboarding)/, { waitUntil: 'networkidle', timeout: 20000 });

  // Wait for the page to actually be ready by checking for a visible element
  const isDashboard = page.url().includes('/dashboard');
  const isOnboarding = page.url().includes('/onboarding');

  if (isDashboard) {
    // Wait for dashboard to be fully loaded
    await page.waitForSelector('[data-testid="dashboard-page"]', { state: 'visible', timeout: 15000 });
  } else if (isOnboarding) {
    // Wait for onboarding form to be visible
    await page.waitForSelector('input#parishName', { state: 'visible', timeout: 15000 });
  }

  // If redirected to onboarding, complete it
  if (page.url().includes('/onboarding')) {
    console.log('Completing onboarding for test user...');

    await page.fill('input#parishName', process.env.TEST_PARISH_NAME || 'Playwright Test Parish');
    await page.fill('input#city', process.env.TEST_PARISH_CITY || 'Test City');
    await page.fill('input#state', process.env.TEST_PARISH_STATE || 'TS');

    await page.click('button[type="submit"]');

    // Wait for preparing screen and then dashboard
    await expect(page.locator('text=/One minute while we get your parish ready for you/i')).toBeVisible({ timeout: 5000 });
    await page.waitForURL('/dashboard', { waitUntil: 'networkidle', timeout: 25000 });

    // Wait for dashboard to be fully loaded
    await page.waitForSelector('[data-testid="dashboard-page"]', { state: 'visible', timeout: 20000 });
  }

  // Verify we're authenticated by checking we're on dashboard
  await expect(page).toHaveURL('/dashboard');

  // Verify dashboard is fully loaded
  await expect(page.locator('[data-testid="dashboard-page"]')).toBeVisible();
  console.log('Successfully authenticated and on dashboard');

  // Save authentication state to file
  await page.context().storageState({ path: authFile });
  console.log(`Auth state saved to ${authFile}`);
});
