import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local for test credentials
dotenv.config({ path: path.join(__dirname, '.env.local') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Ignore unit tests - those are run by Vitest, not Playwright */
  testIgnore: ['**/unit/**'],
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Run tests in parallel - use 1 worker on CI for stability, 50% of CPU cores locally for speed */
  workers: process.env.CI ? 1 : '50%',
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'], // Terminal output
    ['html', { open: 'never' }] // Generate HTML report but don't auto-open
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Timeout for each action (click, fill, etc.) */
    actionTimeout: 10000, // 10 seconds for actions
    /* Timeout for navigation operations */
    navigationTimeout: 15000, // 15 seconds for page navigation
  },
  /* Global test timeout - maximum time for a single test */
  timeout: 60000, // 60 seconds per test

  /* Configure projects for major browsers */
  projects: [
    // Setup project - runs first to authenticate and save state
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    // Chromium tests with authenticated state (excludes signup tests and template)
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use the authenticated state from setup
        storageState: path.join(__dirname, 'playwright/.auth/staff.json'),
      },
      dependencies: ['setup'], // Run setup before this project
      testIgnore: [/signup\.spec\.ts/, /login\.spec\.ts/, /TEST_TEMPLATE\.spec\.ts/], // Exclude auth tests and template from authenticated project
    },
    // Unauthenticated tests project (for signup and login flows)
    {
      name: 'chromium-unauth',
      use: {
        ...devices['Desktop Chrome'],
        // No storageState - tests run without authentication
      },
      testMatch: [/signup\.spec\.ts/, /login\.spec\.ts/], // Run authentication tests in this project
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'NEXT_DISABLE_OVERLAY=1 npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
