import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * Petition Templates CRUD Tests
 *
 * Comprehensive tests for Petition Templates management at /settings/petitions
 * Tests Create, Read, Update, and Delete operations.
 */

test.describe('Petition Templates - List Page', () => {
  test.describe.configure({ mode: 'parallel' });

  test('should display petition templates list page', async ({ page }) => {
    await page.goto('/settings/petitions');
    await expect(page).toHaveURL('/settings/petitions');

    // Verify page title
    await expect(page.getByRole('heading', { name: 'Petition Templates' })).toBeVisible();

    // Verify description
    await expect(page.getByText('Manage petition templates for your liturgical celebrations')).toBeVisible();
  });

  test('should display New Template button', async ({ page }) => {
    await page.goto('/settings/petitions');

    await expect(page.getByRole('link', { name: /New Template/i })).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });
  });

  test('should display search input', async ({ page }) => {
    await page.goto('/settings/petitions');

    await expect(page.getByPlaceholder('Search templates...')).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });
  });

  test('should display module filter dropdown', async ({ page }) => {
    await page.goto('/settings/petitions');

    await expect(page.getByRole('combobox').filter({ hasText: 'All modules' })).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });
  });

  test('should display language filter dropdown', async ({ page }) => {
    await page.goto('/settings/petitions');

    await expect(page.getByRole('combobox').filter({ hasText: 'All languages' })).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });
  });

  test('should show breadcrumbs with correct navigation', async ({ page }) => {
    await page.goto('/settings/petitions');

    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Settings' })).toBeVisible();
    await expect(breadcrumbNav.getByText('Petition Templates')).toBeVisible();

    // Navigate back via breadcrumb
    await breadcrumbNav.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL('/settings', { timeout: TEST_TIMEOUTS.NAVIGATION });
  });

  test('should filter templates by search term', async ({ page }) => {
    await page.goto('/settings/petitions');

    // Search for a non-existent term
    await page.getByPlaceholder('Search templates...').fill('NonExistentTemplate12345XYZ');

    // Should show no results message
    await expect(page.getByText(/No templates found/i)).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });
  });

  test('should filter templates by module', async ({ page }) => {
    await page.goto('/settings/petitions');

    // Click module filter
    await page.getByRole('combobox').filter({ hasText: 'All modules' }).click();

    // Select Wedding module
    await page.getByRole('option', { name: /Wedding/i }).click();

    // Page should still be accessible
    await expect(page).toHaveURL('/settings/petitions');
  });

  test('should filter templates by language', async ({ page }) => {
    await page.goto('/settings/petitions');

    // Click language filter
    await page.getByRole('combobox').filter({ hasText: 'All languages' }).click();

    // Select English
    await page.getByRole('option', { name: /English/i }).click();

    // Page should still be accessible
    await expect(page).toHaveURL('/settings/petitions');
  });
});

test.describe('Petition Templates - Create (C)', () => {
  test.describe.configure({ mode: 'parallel' });

  test('should navigate to create page from list', async ({ page }) => {
    await page.goto('/settings/petitions');

    await page.getByRole('link', { name: /New Template/i }).click();
    await expect(page).toHaveURL('/settings/petitions/create', { timeout: TEST_TIMEOUTS.NAVIGATION });
  });

  test('should display create form with all fields', async ({ page }) => {
    await page.goto('/settings/petitions/create');

    // Verify page title
    await expect(page.getByRole('heading', { name: 'Create Petition Template' })).toBeVisible();

    // Verify form fields
    await expect(page.getByLabel('Template Title')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
    await expect(page.getByLabel('Module')).toBeVisible();
    await expect(page.getByLabel('Language')).toBeVisible();
    await expect(page.locator('#context')).toBeVisible();

    // Verify buttons
    await expect(page.getByRole('button', { name: /Insert Default Text/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Create Petition Template/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Cancel/i })).toBeVisible();
  });

  test('should create a new petition template', async ({ page }) => {
    await page.goto('/settings/petitions/create');

    // Fill in form
    const uniqueTitle = `Test Petition Template ${Date.now()}`;
    await page.getByLabel('Template Title').fill(uniqueTitle);
    await page.getByLabel('Description').fill('A test petition template for automated testing');

    // Select module
    await page.getByLabel('Module').click();
    await page.getByRole('option', { name: /Wedding/i }).click();

    // Select language (English should be default)
    await page.getByLabel('Language').click();
    await page.getByRole('option', { name: /English/i }).click();

    // Add template text
    await page.locator('#context').fill('Lord, hear our prayer.\nFor the church, we pray to the Lord.');

    // Submit
    await page.getByRole('button', { name: /Create Petition Template/i }).click();

    // Should redirect to view page
    await page.waitForURL(/\/settings\/petitions\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify template was created
    await expect(page.getByText(uniqueTitle)).toBeVisible();
  });

  test('should load default petition text', async ({ page }) => {
    await page.goto('/settings/petitions/create');

    // Click Insert Default Text
    await page.getByRole('button', { name: /Insert Default Text/i }).click();

    // Verify template text was populated
    const templateText = await page.locator('#context').inputValue();
    expect(templateText.length).toBeGreaterThan(0);
    expect(templateText).toContain('Lord');
  });

  test('should validate required title field', async ({ page }) => {
    await page.goto('/settings/petitions/create');

    // Select language (required)
    await page.getByLabel('Language').click();
    await page.getByRole('option', { name: /English/i }).click();

    // Try to submit without title
    await page.getByRole('button', { name: /Create Petition Template/i }).click();

    // Should stay on create page (validation failed)
    await expect(page).toHaveURL('/settings/petitions/create');
  });

  test('should cancel creation and return to list', async ({ page }) => {
    await page.goto('/settings/petitions/create');

    // Fill in some data
    await page.getByLabel('Template Title').fill('Cancelled Template');

    // Click cancel
    await page.getByRole('link', { name: /Cancel/i }).click();

    // Should navigate back to list
    await expect(page).toHaveURL('/settings/petitions', { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Cancelled template should not appear
    await expect(page.getByText('Cancelled Template')).toBeHidden();
  });

  test('should show breadcrumbs on create page', async ({ page }) => {
    await page.goto('/settings/petitions/create');

    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Settings' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Petitions' })).toBeVisible();
    await expect(breadcrumbNav.getByText('Create Template')).toBeVisible();
  });
});

test.describe('Petition Templates - Read (R)', () => {
  test('should view a petition template after creation', async ({ page }) => {
    // First create a template
    await page.goto('/settings/petitions/create');

    const viewTitle = `View Test Template ${Date.now()}`;
    await page.getByLabel('Template Title').fill(viewTitle);
    await page.getByLabel('Description').fill('Template for view testing');
    await page.getByLabel('Language').click();
    await page.getByRole('option', { name: /English/i }).click();
    await page.locator('#context').fill('Test petition content for viewing.');

    await page.getByRole('button', { name: /Create Petition Template/i }).click();
    await page.waitForURL(/\/settings\/petitions\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify view page displays all details
    await expect(page.getByText(viewTitle)).toBeVisible();
    await expect(page.getByText('Template for view testing')).toBeVisible();
    await expect(page.getByText('Test petition content for viewing.')).toBeVisible();

    // Verify Template Details section
    await expect(page.getByRole('heading', { name: 'Template Details' })).toBeVisible();
    await expect(page.getByText('Title')).toBeVisible();
    await expect(page.getByText('Description')).toBeVisible();
    await expect(page.getByText('Module')).toBeVisible();
    await expect(page.getByText('Language')).toBeVisible();
    await expect(page.getByText('Created')).toBeVisible();
    await expect(page.getByText('Updated')).toBeVisible();
  });

  test('should display actions on view page', async ({ page }) => {
    // Create a template first
    await page.goto('/settings/petitions/create');

    const actionsTitle = `Actions Test ${Date.now()}`;
    await page.getByLabel('Template Title').fill(actionsTitle);
    await page.getByLabel('Language').click();
    await page.getByRole('option', { name: /English/i }).click();

    await page.getByRole('button', { name: /Create Petition Template/i }).click();
    await page.waitForURL(/\/settings\/petitions\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify Actions section
    await expect(page.getByRole('heading', { name: 'Actions' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Edit Template/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Delete Template/i })).toBeVisible();
  });

  test('should display Template Text section on view page', async ({ page }) => {
    // Create a template with content
    await page.goto('/settings/petitions/create');

    const textTitle = `Text Section Test ${Date.now()}`;
    await page.getByLabel('Template Title').fill(textTitle);
    await page.getByLabel('Language').click();
    await page.getByRole('option', { name: /English/i }).click();
    await page.locator('#context').fill('For the Church, that she may always be a beacon of hope.');

    await page.getByRole('button', { name: /Create Petition Template/i }).click();
    await page.waitForURL(/\/settings\/petitions\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify Template Text section
    await expect(page.getByRole('heading', { name: 'Template Text' })).toBeVisible();
    await expect(page.getByText('For the Church, that she may always be a beacon of hope.')).toBeVisible();
  });
});

test.describe('Petition Templates - Update (U)', () => {
  test('should navigate to edit page from view page', async ({ page }) => {
    // Create a template
    await page.goto('/settings/petitions/create');

    const editNavTitle = `Edit Nav Test ${Date.now()}`;
    await page.getByLabel('Template Title').fill(editNavTitle);
    await page.getByLabel('Language').click();
    await page.getByRole('option', { name: /English/i }).click();

    await page.getByRole('button', { name: /Create Petition Template/i }).click();
    await page.waitForURL(/\/settings\/petitions\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get template ID from URL
    const viewUrl = page.url();
    const templateId = viewUrl.split('/').pop();

    // Click Edit Template
    await page.getByRole('link', { name: /Edit Template/i }).click();

    // Should navigate to edit page
    await expect(page).toHaveURL(`/settings/petitions/${templateId}/edit`, { timeout: TEST_TIMEOUTS.NAVIGATION });
  });

  test('should update petition template', async ({ page }) => {
    // Create a template
    await page.goto('/settings/petitions/create');

    const originalTitle = `Original Title ${Date.now()}`;
    await page.getByLabel('Template Title').fill(originalTitle);
    await page.getByLabel('Description').fill('Original description');
    await page.getByLabel('Language').click();
    await page.getByRole('option', { name: /English/i }).click();
    await page.locator('#context').fill('Original petition text.');

    await page.getByRole('button', { name: /Create Petition Template/i }).click();
    await page.waitForURL(/\/settings\/petitions\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get template ID
    const viewUrl = page.url();
    const templateId = viewUrl.split('/').pop();

    // Navigate to edit page
    await page.goto(`/settings/petitions/${templateId}/edit`);

    // Verify edit page loads with existing data
    await expect(page.getByLabel('Template Title')).toHaveValue(originalTitle, { timeout: TEST_TIMEOUTS.DATA_LOAD });

    // Update the template
    const updatedTitle = `Updated Title ${Date.now()}`;
    await page.getByLabel('Template Title').fill(updatedTitle);
    await page.getByLabel('Description').fill('Updated description for testing');
    await page.locator('#context').fill('Updated petition text content.');

    // Save changes
    await page.getByRole('button', { name: /Update Petition Template/i }).click();

    // Should redirect to view page
    await page.waitForURL(`/settings/petitions/${templateId}`, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify updates are displayed
    await expect(page.getByText(updatedTitle)).toBeVisible();
    await expect(page.getByText('Updated description for testing')).toBeVisible();
    await expect(page.getByText('Updated petition text content.')).toBeVisible();
  });

  test('should cancel edit and return to view page', async ({ page }) => {
    // Create a template
    await page.goto('/settings/petitions/create');

    const cancelEditTitle = `Cancel Edit Test ${Date.now()}`;
    await page.getByLabel('Template Title').fill(cancelEditTitle);
    await page.getByLabel('Language').click();
    await page.getByRole('option', { name: /English/i }).click();

    await page.getByRole('button', { name: /Create Petition Template/i }).click();
    await page.waitForURL(/\/settings\/petitions\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get template ID
    const viewUrl = page.url();
    const templateId = viewUrl.split('/').pop();

    // Navigate to edit page
    await page.goto(`/settings/petitions/${templateId}/edit`);

    // Make changes but don't save
    await page.getByLabel('Template Title').fill('Changed Title That Should Not Be Saved');

    // Click cancel
    await page.getByRole('link', { name: /Cancel/i }).click();

    // Should return to view page
    await expect(page).toHaveURL(`/settings/petitions/${templateId}`, { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Original title should still be displayed
    await expect(page.getByText(cancelEditTitle)).toBeVisible();
    await expect(page.getByText('Changed Title That Should Not Be Saved')).toBeHidden();
  });

  test('should preserve existing data when editing', async ({ page }) => {
    // Create a template with all fields
    await page.goto('/settings/petitions/create');

    const preserveTitle = `Preserve Data Test ${Date.now()}`;
    await page.getByLabel('Template Title').fill(preserveTitle);
    await page.getByLabel('Description').fill('Description to preserve');
    await page.getByLabel('Module').click();
    await page.getByRole('option', { name: /Funeral/i }).click();
    await page.getByLabel('Language').click();
    await page.getByRole('option', { name: /Spanish/i }).click();
    await page.locator('#context').fill('Petition text to preserve.');

    await page.getByRole('button', { name: /Create Petition Template/i }).click();
    await page.waitForURL(/\/settings\/petitions\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get template ID
    const viewUrl = page.url();
    const templateId = viewUrl.split('/').pop();

    // Navigate to edit page
    await page.goto(`/settings/petitions/${templateId}/edit`);

    // Verify all fields are populated
    await expect(page.getByLabel('Template Title')).toHaveValue(preserveTitle, { timeout: TEST_TIMEOUTS.DATA_LOAD });
    await expect(page.getByLabel('Description')).toHaveValue('Description to preserve');
    await expect(page.locator('#context')).toHaveValue('Petition text to preserve.');
  });
});

test.describe('Petition Templates - Delete (D)', () => {
  test('should delete template from view page', async ({ page }) => {
    // Create a template to delete
    await page.goto('/settings/petitions/create');

    const deleteTitle = `Delete From View ${Date.now()}`;
    await page.getByLabel('Template Title').fill(deleteTitle);
    await page.getByLabel('Language').click();
    await page.getByRole('option', { name: /English/i }).click();

    await page.getByRole('button', { name: /Create Petition Template/i }).click();
    await page.waitForURL(/\/settings\/petitions\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Click Delete Template button
    await page.getByRole('button', { name: /Delete Template/i }).click();

    // Confirm deletion in dialog
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: TEST_TIMEOUTS.DIALOG });
    await expect(page.getByText(deleteTitle)).toBeVisible(); // Item name in dialog

    await page.getByRole('button', { name: /Delete/i }).click();

    // Should redirect to list page
    await expect(page).toHaveURL('/settings/petitions', { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Deleted template should not appear
    await expect(page.getByText(deleteTitle)).toBeHidden();
  });

  test('should delete template from list page', async ({ page }) => {
    // Create a template to delete
    await page.goto('/settings/petitions/create');

    const deleteFromListTitle = `Delete From List ${Date.now()}`;
    await page.getByLabel('Template Title').fill(deleteFromListTitle);
    await page.getByLabel('Language').click();
    await page.getByRole('option', { name: /English/i }).click();

    await page.getByRole('button', { name: /Create Petition Template/i }).click();
    await page.waitForURL(/\/settings\/petitions\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Navigate to list
    await page.goto('/settings/petitions');

    // Find and click the actions menu for our template
    const templateRow = page.locator('tr').filter({ hasText: deleteFromListTitle });
    await templateRow.getByRole('button').last().click();

    // Click Delete from dropdown
    await page.getByRole('menuitem', { name: /Delete/i }).click();

    // Confirm deletion in dialog
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: TEST_TIMEOUTS.DIALOG });
    await page.getByRole('button', { name: /Delete/i }).click();

    // Wait for dialog to close and verify deletion
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Template should be removed from list
    await expect(page.getByText(deleteFromListTitle)).toBeHidden();
  });

  test('should cancel deletion and keep template', async ({ page }) => {
    // Create a template
    await page.goto('/settings/petitions/create');

    const cancelDeleteTitle = `Cancel Delete Test ${Date.now()}`;
    await page.getByLabel('Template Title').fill(cancelDeleteTitle);
    await page.getByLabel('Language').click();
    await page.getByRole('option', { name: /English/i }).click();

    await page.getByRole('button', { name: /Create Petition Template/i }).click();
    await page.waitForURL(/\/settings\/petitions\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Click Delete Template button
    await page.getByRole('button', { name: /Delete Template/i }).click();

    // Cancel deletion
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: TEST_TIMEOUTS.DIALOG });
    await page.getByRole('button', { name: /Cancel/i }).click();

    // Dialog should close
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: TEST_TIMEOUTS.DIALOG });

    // Template should still exist
    await expect(page.getByText(cancelDeleteTitle)).toBeVisible();
  });
});

test.describe('Petition Templates - Data Table', () => {
  test.describe.configure({ mode: 'parallel' });

  test('should display table with correct columns', async ({ page }) => {
    await page.goto('/settings/petitions');

    // Verify table headers
    await expect(page.getByRole('columnheader', { name: /Title/i })).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });
    await expect(page.getByRole('columnheader', { name: /Actions/i })).toBeVisible();
  });

  test('should show empty state when no templates match', async ({ page }) => {
    await page.goto('/settings/petitions');

    // Search for non-existent template
    await page.getByPlaceholder('Search templates...').fill('ZZZNonExistentTemplate999');

    // Should show empty state
    await expect(page.getByText(/No templates found/i)).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });
  });
});
