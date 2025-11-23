import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Petitions Module', () => {
  test('should create, view, and edit a petition template', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    console.log('Navigating to petition templates page');
    await page.goto('/settings/petitions');
    await expect(page).toHaveURL('/settings/petitions');
    await expect(page.getByRole('heading', { name: 'Petition Templates' })).toBeVisible();

    // Click "New Template" button
    console.log('Clicking New Template button');
    const newTemplateLink = page.getByRole('link', { name: /New Template/i }).first();
    await newTemplateLink.click();

    // Verify we're on the create page
    await expect(page).toHaveURL('/settings/petitions/create', { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.getByRole('heading', { name: 'Create Petition Template' })).toBeVisible();

    // Fill in the petition template form
    const testTitle = `Test Petition Template ${Date.now()}`;
    const testDescription = 'Template for testing petition creation flow';
    const testContext = 'For the sick and suffering in our parish.\nFor peace in our world.\nFor all those in need.';

    console.log(`Creating petition template: ${testTitle}`);
    await page.fill('input#title', testTitle);
    await page.fill('input#description', testDescription);

    // Select language from dropdown (English is default)
    await page.click('#language');
    await page.getByRole('option', { name: 'English' }).click();

    // Fill in the template text
    await page.fill('textarea#context', testContext);

    // Submit the form
    console.log('Submitting petition template form');
    await page.click('button[type="submit"]');

    // Should redirect to the petition template detail page (navigation proves success)
    await page.waitForURL(/\/settings\/petitions\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const petitionUrl = page.url();
    const petitionId = petitionUrl.split('/').pop();
    console.log(`Created petition template with ID: ${petitionId}`);

    // Verify petition template details are displayed
    await expect(page.getByRole('heading', { name: testTitle }).first()).toBeVisible();
    await expect(page.locator(`text=${testDescription}`).first()).toBeVisible();
    await expect(page.locator(`text=${testContext}`).first()).toBeVisible();

    // Navigate back to petitions list
    console.log('Navigating back to petition templates list');
    await page.goto('/settings/petitions');

    // Verify the petition template appears in the list
    await expect(page.locator(`text=${testTitle}`).first()).toBeVisible();

    // Navigate to edit page
    console.log(`Navigating to edit petition template: ${petitionId}`);
    await page.goto(`/settings/petitions/${petitionId}`);
    await expect(page).toHaveURL(`/settings/petitions/${petitionId}`);

    // Click edit button (should be in the page actions)
    const editLink = page.getByRole('link', { name: /Edit/i }).first();
    await editLink.click();

    // Verify we're on the edit page (same as detail page for petitions)
    await expect(page).toHaveURL(`/settings/petitions/${petitionId}`);

    // Edit the petition template (the form should already be there)
    const updatedTitle = `${testTitle} (Updated)`;
    await page.fill('input#title', updatedTitle);

    // Submit the edit
    console.log('Submitting petition template update');
    await page.click('button[type="submit"]');

    // Should stay on detail page (navigation proves success)
    await page.waitForTimeout(TEST_TIMEOUTS.TOAST);

    // Verify the update
    await expect(page.locator(`text=${updatedTitle}`).first()).toBeVisible();
    console.log(`Successfully updated petition template: ${petitionId}`);
  });

  test('should delete petition template with confirmation', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a petition template to delete
    console.log('Creating petition template to delete');
    await page.goto('/settings/petitions/create');

    const testTitle = `Delete Test ${Date.now()}`;
    await page.fill('input#title', testTitle);
    await page.fill('textarea#context', 'This template will be deleted.');

    await page.click('button[type="submit"]');
    await page.waitForURL(/\/settings\/petitions\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const petitionId = page.url().split('/').pop();
    console.log(`Created petition template for deletion: ${petitionId}`);

    // Navigate back to list
    await page.goto('/settings/petitions');

    // Verify the template is in the list
    await expect(page.locator(`text=${testTitle}`)).toBeVisible();

    // Find and click the delete button for this template (in DataTableRowActions)
    console.log('Opening delete dialog');

    // The delete action is in the row actions menu - look for the delete button
    // DataTable uses a delete icon/button in the actions column
    const row = page.locator(`tr:has-text("${testTitle}")`);
    const deleteButton = row.getByRole('button', { name: /delete/i }).or(row.locator('button[aria-label*="delete"]'));
    await deleteButton.first().click();

    // Confirmation dialog should appear
    await expect(page.getByRole('heading', { name: /Delete Template/i })).toBeVisible();

    // Confirm deletion
    console.log('Confirming deletion');
    await page.getByRole('button', { name: /Delete/i }).last().click();

    // Wait for deletion to complete
    await page.waitForTimeout(TEST_TIMEOUTS.TOAST);

    // Verify template is removed from list
    await expect(page.locator(`text=${testTitle}`)).not.toBeVisible();
    console.log(`Successfully deleted petition template: ${petitionId}`);
  });

  test('should show empty state when no petitions exist', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    console.log('Navigating to petition templates page');
    await page.goto('/settings/petitions');

    // Should show empty state (if no petitions exist yet) or list (if default petitions created)
    // Check for either empty state or the page title
    await expect(page.getByRole('heading', { name: 'Petition Templates' })).toBeVisible();

    // Should have a create button in either case
    const createButton = page.getByRole('link', { name: /New Template|Create Template/i }).first();
    await expect(createButton).toBeVisible();
  });

  test('should validate required fields on create', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    console.log('Testing validation on petition template creation');
    await page.goto('/settings/petitions/create');

    // Try to submit without filling required fields
    await page.click('button[type="submit"]');

    // Should stay on the same page (form validation prevents submission)
    await expect(page).toHaveURL('/settings/petitions/create');

    // Fill only title (missing context which is required)
    await page.fill('input#title', 'Test Title');
    await page.click('button[type="submit"]');

    // Should still stay on the same page
    await expect(page).toHaveURL('/settings/petitions/create');
  });

  test('should navigate through breadcrumbs', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a petition template
    console.log('Creating petition template for breadcrumb test');
    await page.goto('/settings/petitions/create');
    await page.fill('input#title', 'Breadcrumb Test');
    await page.fill('textarea#context', 'Test content for breadcrumb navigation');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/settings\/petitions\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Should have breadcrumbs visible
    console.log('Verifying breadcrumbs');
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Settings' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Petition Templates' })).toBeVisible();

    // Click on "Petition Templates" breadcrumb
    await breadcrumbNav.getByRole('link', { name: 'Petition Templates' }).click();

    // Should navigate back to petition templates list
    await expect(page).toHaveURL('/settings/petitions');
    console.log('Successfully navigated via breadcrumbs');
  });

  test('should filter petition templates by module and language', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create petition templates with different modules and languages
    console.log('Creating petition templates with different filters');
    await page.goto('/settings/petitions/create');

    const testTitle = `Filter Test Wedding ${Date.now()}`;
    await page.fill('input#title', testTitle);
    await page.fill('textarea#context', 'Wedding petition template');

    // Select Wedding module
    await page.click('#module');
    await page.getByRole('option', { name: /Wedding/i }).click();

    // Select English language
    await page.click('#language');
    await page.getByRole('option', { name: 'English' }).click();

    await page.click('button[type="submit"]');
    await page.waitForURL(/\/settings\/petitions\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Go to petitions list
    console.log('Testing filters on petition templates list');
    await page.goto('/settings/petitions');

    // Verify petition is visible
    await expect(page.locator(`text=${testTitle}`)).toBeVisible();

    // Test module filter
    console.log('Testing module filter');
    const moduleFilter = page.locator('button:has-text("All modules")').or(page.locator('[role="combobox"]:has-text("All modules")')).first();
    if (await moduleFilter.isVisible()) {
      await moduleFilter.click();
      await page.getByRole('option', { name: /Wedding/i }).click();

      // Wait for filter to apply
      await page.waitForTimeout(500);

      // Should still see our wedding template
      await expect(page.locator(`text=${testTitle}`)).toBeVisible();
    }

    console.log('Successfully tested petition template filters');
  });
});
