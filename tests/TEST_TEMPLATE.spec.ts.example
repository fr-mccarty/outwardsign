/**
 * TEST TEMPLATE - Copy this file to create new test files
 *
 * CRITICAL: Follow this pattern for ALL tests to ensure proper authentication
 *
 * Authentication Flow:
 * 1. npm test runs scripts/run-tests-with-temp-user.js
 * 2. That script creates a test user and parish (via setup-test-user.js)
 * 3. Playwright's auth.setup.ts logs in as that user and saves session state
 * 4. YOUR TESTS automatically use that authenticated session (via playwright.config.ts)
 *
 * DO NOT:
 * ❌ Create setupTestUser() functions
 * ❌ Navigate to /signup or /login in tests
 * ❌ Try to authenticate manually
 *
 * DO:
 * ✅ Start tests by navigating directly to the pages you need
 * ✅ Assume the user is already authenticated
 * ✅ Trust the test infrastructure
 */

import { test, expect } from '@playwright/test';

test.describe('Module Name - Feature Group', () => {
  test('should do something specific', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate directly to the page you need to test
    await page.goto('/your-module');

    // Verify you're on the correct page
    await expect(page).toHaveURL('/your-module');

    // Your test logic here
    // Example: Click a button, fill a form, verify results

    // Example assertions:
    await expect(page.locator('text=Some Content')).toBeVisible();
  });

  test('should create a new entity', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to create page
    await page.goto('/your-module/create');

    // Fill in form fields
    await page.fill('input#name', 'Test Entity');
    await page.fill('textarea#description', 'Test description');

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for success message
    await page.waitForSelector('text=/created successfully/i', { timeout: 10000 });

    // Verify redirect to view page
    await page.waitForURL(/\/your-module\/[a-f0-9-]+$/, { timeout: 10000 });

    // Verify entity details are displayed
    await expect(page.locator('text=Test Entity')).toBeVisible();
  });

  test('should edit an entity', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // First create an entity to edit
    await page.goto('/your-module/create');
    await page.fill('input#name', 'Entity to Edit');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/your-module\/[a-f0-9-]+$/, { timeout: 10000 });

    // Extract entity ID from URL
    const entityId = page.url().split('/').pop();

    // Navigate to edit page
    await page.click('button:has-text("Edit")');
    await expect(page).toHaveURL(`/your-module/${entityId}/edit`);

    // Update the entity
    await page.fill('input#name', 'Updated Entity Name');
    await page.click('button[type="submit"]:has-text("Save")');

    // Wait for success message
    await page.waitForSelector('text=/updated successfully/i', { timeout: 10000 });

    // Per CLAUDE.md pattern: UPDATE stays on edit page
    await expect(page).toHaveURL(`/your-module/${entityId}/edit`);

    // Navigate to view page to verify changes
    await page.goto(`/your-module/${entityId}`);
    await expect(page.locator('text=Updated Entity Name')).toBeVisible();
  });

  test('should list entities with filters', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create test entities
    const entities = ['Entity One', 'Entity Two', 'Entity Three'];
    for (const name of entities) {
      await page.goto('/your-module/create');
      await page.fill('input#name', name);
      await page.click('button[type="submit"]');
      await page.waitForSelector('text=/created successfully/i', { timeout: 10000 });
    }

    // Navigate to list page
    await page.goto('/your-module');

    // Verify all entities are visible
    for (const name of entities) {
      await expect(page.locator(`text=${name}`)).toBeVisible();
    }

    // Test search filter
    await page.fill('input[placeholder*="Search"]', 'One');
    await expect(page.locator('text=Entity One')).toBeVisible();
    await expect(page.locator('text=Entity Two')).not.toBeVisible();

    // Clear search
    await page.fill('input[placeholder*="Search"]', '');
    await page.waitForTimeout(500);

    // All entities should be back
    for (const name of entities) {
      await expect(page.locator(`text=${name}`)).toBeVisible();
    }
  });

  test('should navigate breadcrumbs', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create an entity
    await page.goto('/your-module/create');
    await page.fill('input#name', 'Breadcrumb Test');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/your-module\/[a-f0-9-]+$/, { timeout: 10000 });

    // Verify breadcrumbs
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Your Module' })).toBeVisible();

    // Click breadcrumb to navigate back
    await breadcrumbNav.getByRole('link', { name: 'Your Module' }).click();
    await expect(page).toHaveURL('/your-module');
  });

  test('should validate required fields', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to create page
    await page.goto('/your-module/create');

    // Try to submit without filling required fields
    await page.click('button[type="submit"]');

    // Should stay on the same page (form validation prevents submission)
    await expect(page).toHaveURL('/your-module/create');
  });
});

/**
 * COMMON PATTERNS & BEST PRACTICES
 *
 * 1. AUTHENTICATION
 *    - Never create setupTestUser() functions
 *    - Tests are pre-authenticated automatically
 *    - Start with page.goto() to your target page
 *
 * 2. TIMEOUTS
 *    - Use { timeout: 10000 } for operations that might be slow
 *    - Common slow operations: form submissions, page redirects
 *    - Example: await page.waitForURL('/path', { timeout: 10000 })
 *
 * 3. WAITING FOR ELEMENTS
 *    - Use waitForSelector for toast messages:
 *      await page.waitForSelector('text=/success message/i', { timeout: 10000 })
 *    - Use waitForURL for page redirects:
 *      await page.waitForURL(/\/module\/[a-f0-9-]+$/, { timeout: 10000 })
 *
 * 4. ASSERTIONS
 *    - Use expect(page).toHaveURL() for URL checks
 *    - Use expect(locator).toBeVisible() for element visibility
 *    - Use expect(locator).not.toBeVisible() for absence checks
 *
 * 5. FORM INTERACTIONS
 *    - Use page.fill() for text inputs
 *    - Use page.click() for buttons
 *    - For select/combobox:
 *      await page.getByRole('combobox').click()
 *      await page.getByRole('option', { name: 'Option' }).click()
 *
 * 6. TEST ISOLATION
 *    - Each test creates its own entities
 *    - Tests should not depend on data from other tests
 *    - The test infrastructure creates a fresh user/parish for each run
 *    - All data is cleaned up automatically after tests complete
 *
 * 7. EXTRACTING IDS FROM URLS
 *    - After creation: const id = page.url().split('/').pop()
 *    - Use for navigation to edit/view pages
 *
 * 8. MODAL/DIALOG INTERACTIONS
 *    - Wait for dialog: await page.waitForSelector('[role="dialog"]', { timeout: 5000 })
 *    - Interact with elements inside dialog
 *    - Dialog should close automatically after successful actions
 */
