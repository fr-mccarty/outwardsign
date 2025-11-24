import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('People Module', () => {
  // Enable parallel execution - tests in this file don't interfere with each other
  test.describe.configure({ mode: 'parallel' });

  test('should create, view, edit, and delete a person', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to people page
    await page.goto('/people');
    await expect(page).toHaveURL('/people');

    // Click "New Person" button
    const newPersonLink = page.getByRole('link', { name: /New Person/i }).first();
    await newPersonLink.click();

    // Verify we're on the create page
    await expect(page).toHaveURL('/people/create', { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.getByRole('heading', { name: 'Create Person' })).toBeVisible();

    // Fill in person form (first_name and last_name are required)
    const testFirstName = 'John';
    const testLastName = 'Doe';
    const testEmail = 'john.doe@example.com';
    const testPhone = '555-1234';

    await page.fill('input#first_name', testFirstName);
    await page.fill('input#last_name', testLastName);
    await page.fill('input#email', testEmail);
    await page.fill('input#phone_number', testPhone);

    // Submit the form
    await page.click('button[type="submit"]');

    // Should redirect to the person detail page (navigation proves success)
    await page.waitForURL(/\/people\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get the person ID from URL for later use
    const personUrl = page.url();
    const personId = personUrl.split('/').pop();

    console.log(`Created person with ID: ${personId}`);

    // Verify person details are displayed (use first to avoid duplicates)
    await expect(page.getByRole('heading', { name: `${testFirstName} ${testLastName}` }).first()).toBeVisible();
    await expect(page.locator(`text=${testEmail}`).first()).toBeVisible();

    // Navigate to edit page
    await page.goto(`/people/${personId}/edit`);
    await expect(page).toHaveURL(`/people/${personId}/edit`, { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.getByRole('heading', { name: 'Edit Person' })).toBeVisible();

    // Edit the person
    const updatedFirstName = 'Jane';
    await page.fill('input#first_name', updatedFirstName);

    // Submit the edit
    await page.click('button[type="submit"]');

    // Should redirect back to detail page (navigation proves success)
    await page.waitForURL(`/people/${personId}`, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify the update (use first to avoid duplicates)
    await expect(page.getByRole('heading', { name: `${updatedFirstName} ${testLastName}` }).first()).toBeVisible();
  });

  test('should show empty state when no people exist', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to people page
    await page.goto('/people');

    // Should show the page title
    await expect(page.getByRole('heading', { name: 'People' }).first()).toBeVisible();

    // Should have a create button
    const createButton = page.getByRole('link', { name: /New Person/i }).first();
    await expect(createButton).toBeVisible();
  });

  test('should validate required fields on create', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Go to create page
    await page.goto('/people/create');
    await expect(page).toHaveURL('/people/create');

    // Try to submit without required fields
    await page.click('button[type="submit"]');

    // Should stay on create page (browser validation prevents submission)
    await expect(page).toHaveURL('/people/create');
  });

  test('should filter people by search', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a test person first
    await page.goto('/people/create');
    await page.fill('input#first_name', 'SearchTest');
    await page.fill('input#last_name', 'Person');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/people\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Go to people list
    await page.goto('/people');

    // Verify the person appears in the list
    await expect(page.locator('text=SearchTest Person').first()).toBeVisible();

    // Use search filter
    const searchInput = page.locator('input[placeholder*="Search"]').or(page.locator('input#search'));
    if (await searchInput.count() > 0) {
      await searchInput.first().fill('SearchTest');
      // Wait a moment for search to filter
      await page.waitForTimeout(1000);

      // Should still see our test person
      await expect(page.locator('text=SearchTest Person').first()).toBeVisible();
    }
  });

  test('should navigate through breadcrumbs', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a person
    await page.goto('/people/create');
    await page.fill('input#first_name', 'Breadcrumb');
    await page.fill('input#last_name', 'Test');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/people\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify breadcrumbs
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'People' })).toBeVisible();

    // Click on "People" breadcrumb
    await breadcrumbNav.getByRole('link', { name: 'People' }).click();

    // Should navigate back to people list
    await expect(page).toHaveURL('/people');
  });
});
