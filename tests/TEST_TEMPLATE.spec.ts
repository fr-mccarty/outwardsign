import { test, expect } from '@playwright/test';

/**
 * Test Template for Outward Sign
 *
 * Copy this file to create new test suites for modules.
 *
 * IMPORTANT: Tests are pre-authenticated automatically!
 * - DO NOT create custom authentication functions
 * - DO NOT navigate to /signup or /login
 * - Just start by navigating to the page you need to test
 *
 * The test runner automatically:
 * 1. Creates a unique test user and parish
 * 2. Authenticates and saves session to playwright/.auth/staff.json
 * 3. Your tests use that session automatically
 * 4. Cleans up all test data after completion
 */

test.describe('Module Name', () => {
  test('should create a new record', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to your module
    await page.goto('/your-module');
    await expect(page).toHaveURL('/your-module');

    // Click create button
    const createButton = page.getByRole('link', { name: /New Record/i }).first();
    await createButton.click();

    // Verify we're on the create page
    await expect(page).toHaveURL('/your-module/create');

    // Fill in form fields
    await page.fill('input#field_name', 'Test Value');

    // Select from dropdown (if needed)
    await page.locator('#dropdown_field').click();
    await page.locator('[role="option"]:has-text("Option Text")').click();

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for success toast
    await page.waitForSelector('text=/created successfully/i', { timeout: 5000 });

    // Should redirect to detail page
    await page.waitForURL(/\/your-module\/[a-f0-9-]+$/, { timeout: 5000 });

    // Verify data is displayed
    await expect(page.locator('text=Test Value')).toBeVisible();
  });

  test('should edit an existing record', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Create a record first (setup for the test)
    await page.goto('/your-module/create');
    await page.fill('input#field_name', 'Original Value');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/your-module\/[a-f0-9-]+$/, { timeout: 5000 });

    // Get the record ID from URL
    const recordUrl = page.url();
    const recordId = recordUrl.split('/').pop();

    // Navigate to edit page
    await page.goto(`/your-module/${recordId}/edit`);

    // Update the field
    await page.fill('input#field_name', 'Updated Value');

    // Submit the edit
    await page.click('button[type="submit"]');

    // Wait for success toast
    await page.waitForSelector('text=/updated successfully/i', { timeout: 5000 });

    // Verify the update
    await expect(page.locator('text=Updated Value')).toBeVisible();
  });

  test('should show empty state when no records exist', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/your-module');

    // Should show empty state
    await expect(page.locator('text=/No records yet/i')).toBeVisible();

    // Should have a create button
    const createButton = page.getByRole('link', { name: /Create/i }).first();
    await expect(createButton).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/your-module/create');

    // Try to submit without filling required fields
    await page.click('button[type="submit"]');

    // Should stay on the same page (validation prevents submission)
    await expect(page).toHaveURL('/your-module/create');
  });

  test('should navigate through breadcrumbs', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Create a record
    await page.goto('/your-module/create');
    await page.fill('input#field_name', 'Breadcrumb Test');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/your-module\/[a-f0-9-]+$/, { timeout: 5000 });

    // Verify breadcrumbs
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Module Name' })).toBeVisible();

    // Click breadcrumb to navigate back
    await breadcrumbNav.getByRole('link', { name: 'Module Name' }).click();
    await expect(page).toHaveURL('/your-module');
  });
});

/**
 * Common Playwright Selectors & Patterns
 *
 * Locate by role (preferred):
 *   page.getByRole('button', { name: /Submit/i })
 *   page.getByRole('link', { name: 'Home' })
 *
 * Locate by label:
 *   page.getByLabel('Email')
 *
 * Locate by test ID:
 *   page.locator('[data-testid="submit-button"]')
 *
 * Locate by ID:
 *   page.locator('#field_name')
 *
 * Fill input:
 *   await page.fill('input#email', 'test@example.com')
 *
 * Click button:
 *   await page.click('button[type="submit"]')
 *
 * Select dropdown option:
 *   await page.locator('#dropdown').click()
 *   await page.locator('[role="option"]:has-text("Option")').click()
 *
 * Wait for navigation:
 *   await page.waitForURL('/expected-path')
 *   await page.waitForURL(/\/regex-pattern\//, { timeout: 5000 })
 *
 * Wait for element:
 *   await page.waitForSelector('text=/Success/i', { timeout: 5000 })
 *
 * Assertions:
 *   await expect(page).toHaveURL('/path')
 *   await expect(element).toBeVisible()
 *   await expect(element).toHaveText('Expected text')
 *
 * Get first matching element:
 *   page.locator('button').first()
 *
 * Locator with text:
 *   page.locator('text=Exact text')
 *   page.locator('text=/regex/i')
 */
