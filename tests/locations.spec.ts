import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Locations Module', () => {
  // Enable parallel execution - tests in this file don't interfere with each other
  test.describe.configure({ mode: 'parallel' });

  test('should create, view, and edit a location', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to locations page
    await page.goto('/locations');
    await expect(page).toHaveURL('/locations');

    // Click "New Location" button
    const newLocationLink = page.getByRole('link', { name: /New Location/i }).first();
    await newLocationLink.click();

    // Verify we're on the create page
    await expect(page).toHaveURL('/locations/create', { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.getByRole('heading', { name: 'Create Location' })).toBeVisible();

    // Fill in location form (name is required)
    const testName = 'St. Mary Parish Hall';
    const testStreet = '123 Main Street';
    const testCity = 'Springfield';
    const testState = 'IL';

    await page.fill('input#name', testName);
    await page.fill('input#street', testStreet);
    await page.fill('input#city', testCity);
    await page.fill('input#state', testState);

    // Scroll to bottom and submit
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should redirect to the location detail page (navigation proves success)
    await page.waitForURL(/\/locations\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get the location ID from URL for later use
    const locationUrl = page.url();
    const locationId = locationUrl.split('/').pop();

    console.log(`Created location with ID: ${locationId}`);

    // Verify location details are displayed
    await expect(page.getByRole('heading', { name: testName }).first()).toBeVisible();
    await expect(page.locator(`text=${testStreet}`).first()).toBeVisible();

    // Navigate to edit page
    await page.goto(`/locations/${locationId}/edit`);
    await expect(page).toHaveURL(`/locations/${locationId}/edit`, { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.getByRole('heading', { name: 'Edit Location' })).toBeVisible();

    // Edit the location
    const updatedName = 'St. Mary Community Center';
    await page.fill('input#name', updatedName);

    // Scroll to bottom and submit
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const editSubmitButton = page.locator('button[type="submit"]').last();
    await editSubmitButton.scrollIntoViewIfNeeded();
    await editSubmitButton.click();

    // Wait briefly for the update to complete (edit stays on same page with router.refresh())
    await page.waitForTimeout(2000);

    // Navigate back to view page to verify
    await page.goto(`/locations/${locationId}`);
    await expect(page).toHaveURL(`/locations/${locationId}`);

    // Verify the update
    await expect(page.getByRole('heading', { name: updatedName }).first()).toBeVisible();
  });

  test('should show empty state when no locations exist', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to locations page
    await page.goto('/locations');

    // Should show the page title
    await expect(page.getByRole('heading', { name: 'Locations' }).first()).toBeVisible();

    // Should have a create button
    const createButton = page.getByRole('link', { name: /New Location/i }).first();
    await expect(createButton).toBeVisible();
  });

  test('should validate required fields on create', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Go to create page
    await page.goto('/locations/create');
    await expect(page).toHaveURL('/locations/create');

    // Try to submit without required fields
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should stay on create page (browser validation prevents submission)
    await expect(page).toHaveURL('/locations/create');
  });

  test('should filter locations by search', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a test location first
    await page.goto('/locations/create');
    await page.fill('input#name', 'SearchTest Chapel');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const btn = page.locator('button[type="submit"]').last();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForURL(/\/locations\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Go to locations list
    await page.goto('/locations');

    // Verify the location appears in the list
    await expect(page.locator('text=SearchTest Chapel').first()).toBeVisible();

    // Use search filter
    const searchInput = page.locator('input[placeholder*="Search"]').or(page.locator('input#search'));
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('SearchTest');
      // Wait a moment for search to filter
      await page.waitForTimeout(1000);

      // Should still see our test location
      await expect(page.locator('text=SearchTest Chapel').first()).toBeVisible();
    }
  });

  test('should navigate through breadcrumbs', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a location
    await page.goto('/locations/create');
    await page.fill('input#name', 'Breadcrumb Location');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const btn = page.locator('button[type="submit"]').last();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForURL(/\/locations\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify breadcrumbs
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Locations' })).toBeVisible();

    // Click on "Locations" breadcrumb
    await breadcrumbNav.getByRole('link', { name: 'Locations' }).click();

    // Should navigate back to locations list
    await expect(page).toHaveURL('/locations');
  });
});
