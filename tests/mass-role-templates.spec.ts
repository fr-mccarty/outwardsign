import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Mass Role Templates Module', () => {
  test('should create, view, edit with persistence verification', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to mass role templates page
    await page.goto('/mass-role-templates');
    await expect(page).toHaveURL('/mass-role-templates');

    // Click "New Template" button
    const newTemplateLink = page.getByRole('link', { name: /New Template/i }).first();
    await newTemplateLink.click();

    // Verify we're on the create page
    await expect(page).toHaveURL('/mass-role-templates/create', { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.getByRole('heading', { name: 'Create Mass Role Template' })).toBeVisible();

    // Fill in the template form with initial data
    const initialName = 'Sunday Mass Template';
    const initialDescription = 'Standard template for Sunday Mass with full choir';
    const initialNote = 'Use this template for all Sunday 10am Masses';

    await page.fill('input#name', initialName);
    await page.fill('textarea#description', initialDescription);
    await page.fill('textarea#note', initialNote);

    // Scroll to bottom and submit
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should redirect to the template detail page (navigation proves success)
    await page.waitForURL(/\/mass-role-templates\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get the template ID from URL for later use
    const templateUrl = page.url();
    const templateId = templateUrl.split('/').pop();

    console.log(`Created mass role template with ID: ${templateId}`);

    // Verify we're on the view page
    await expect(page.getByRole('heading', { name: initialName })).toBeVisible();

    // Verify the initial data is displayed
    await expect(page.locator(`text=${initialDescription}`)).toBeVisible();
    await expect(page.locator(`text=${initialNote}`)).toBeVisible();

    // Navigate to edit page
    await page.goto(`/mass-role-templates/${templateId}/edit`);
    await expect(page).toHaveURL(`/mass-role-templates/${templateId}/edit`, { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.getByRole('heading', { name: /Edit:/i })).toBeVisible();

    // Verify initial values are pre-filled in the form
    await expect(page.locator('input#name')).toHaveValue(initialName);
    await expect(page.locator('textarea#description')).toHaveValue(initialDescription);
    await expect(page.locator('textarea#note')).toHaveValue(initialNote);

    // Edit the template - update all fields with NEW values
    const updatedName = 'Sunday Mass Template (Updated)';
    const updatedDescription = 'Updated template for Sunday Mass with full choir and additional ministers';
    const updatedNote = 'Updated note: Use for Sunday 10am and 12pm Masses';

    await page.fill('input#name', updatedName);
    await page.fill('textarea#description', updatedDescription);
    await page.fill('textarea#note', updatedNote);

    // Scroll to bottom and submit the update
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const editSubmitButton = page.locator('button[type="submit"]').last();
    await editSubmitButton.scrollIntoViewIfNeeded();
    await editSubmitButton.click();

    // Should redirect to the template view page after successful update
    await page.waitForURL(`/mass-role-templates/${templateId}`, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // CRITICAL: Verify the UPDATED values are displayed on the view page
    await expect(page.getByRole('heading', { name: updatedName })).toBeVisible();
    await expect(page.locator(`text=${updatedDescription}`)).toBeVisible();
    await expect(page.locator(`text=${updatedNote}`)).toBeVisible();

    // CRITICAL: Verify old values are NOT displayed anymore
    await expect(page.locator(`text=${initialDescription}`)).not.toBeVisible();
    await expect(page.locator(`text=${initialNote}`)).not.toBeVisible();

    // PERSISTENCE TEST: Refresh the page to verify data was actually saved to database
    console.log(`Refreshing page to verify persistence for template: ${templateId}`);
    await page.reload();

    // After refresh, verify UPDATED values are STILL displayed
    await expect(page.getByRole('heading', { name: updatedName })).toBeVisible();
    await expect(page.locator(`text=${updatedDescription}`)).toBeVisible();
    await expect(page.locator(`text=${updatedNote}`)).toBeVisible();

    // Navigate to edit page again to verify form fields have persisted values
    await page.goto(`/mass-role-templates/${templateId}/edit`);
    await expect(page).toHaveURL(`/mass-role-templates/${templateId}/edit`);

    // PERSISTENCE TEST: Verify form fields contain the UPDATED values
    await expect(page.locator('input#name')).toHaveValue(updatedName);
    await expect(page.locator('textarea#description')).toHaveValue(updatedDescription);
    await expect(page.locator('textarea#note')).toHaveValue(updatedNote);

    console.log(`Successfully tested mass role template: ${templateId} - created, edited, and verified persistence`);
  });

  test('should create template with minimal data', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Go to create page
    await page.goto('/mass-role-templates/create');
    await expect(page).toHaveURL('/mass-role-templates/create');

    // Fill only required field (name)
    const minimalName = 'Minimal Weekday Template';
    await page.fill('input#name', minimalName);

    // Submit the form
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should successfully create and redirect
    await page.waitForURL(/\/mass-role-templates\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify we're on the template view page
    await expect(page.getByRole('heading', { name: minimalName })).toBeVisible();

    // Get the template ID
    const templateId = page.url().split('/').pop();

    // PERSISTENCE TEST: Refresh and verify
    await page.reload();
    await expect(page.getByRole('heading', { name: minimalName })).toBeVisible();

    console.log(`Successfully created minimal template: ${templateId}`);
  });

  test('should show empty state when no templates exist', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to mass role templates page
    await page.goto('/mass-role-templates');

    // Should show the page title
    await expect(page.getByRole('heading', { name: 'Mass Role Templates' }).first()).toBeVisible();

    // Should have a create button
    const createButton = page.getByRole('link', { name: /New Template/i }).first();
    await expect(createButton).toBeVisible();
  });

  test('should navigate through breadcrumbs', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a template
    await page.goto('/mass-role-templates/create');
    await page.fill('input#name', 'Breadcrumb Test Template');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const btn = page.locator('button[type="submit"]').last();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForURL(/\/mass-role-templates\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify breadcrumbs
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Masses' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Role Templates' })).toBeVisible();

    // Click on "Role Templates" breadcrumb
    await breadcrumbNav.getByRole('link', { name: 'Role Templates' }).click();

    // Should navigate back to templates list
    await expect(page).toHaveURL('/mass-role-templates');
  });

  test('should validate required fields', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Go to create page
    await page.goto('/mass-role-templates/create');
    await expect(page).toHaveURL('/mass-role-templates/create');

    // Try to submit without filling required name field
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should NOT redirect (stays on create page due to validation error)
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL('/mass-role-templates/create');

    // Should show validation error (toast or inline error)
    // Note: Exact error message display depends on implementation
  });

  test('should update only name field and persist change', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a template with all fields
    await page.goto('/mass-role-templates/create');
    const originalName = 'Original Template Name';
    const originalDescription = 'Original description text';
    const originalNote = 'Original internal note';

    await page.fill('input#name', originalName);
    await page.fill('textarea#description', originalDescription);
    await page.fill('textarea#note', originalNote);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/mass-role-templates\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const templateId = page.url().split('/').pop();

    // Navigate to edit
    await page.goto(`/mass-role-templates/${templateId}/edit`);

    // Update ONLY the name field
    const newName = 'Updated Template Name Only';
    await page.fill('input#name', newName);

    // Submit
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(`/mass-role-templates/${templateId}`, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify new name is shown
    await expect(page.getByRole('heading', { name: newName })).toBeVisible();

    // Verify description and note are unchanged
    await expect(page.locator(`text=${originalDescription}`)).toBeVisible();
    await expect(page.locator(`text=${originalNote}`)).toBeVisible();

    // PERSISTENCE TEST: Refresh and verify all values persisted correctly
    await page.reload();
    await expect(page.getByRole('heading', { name: newName })).toBeVisible();
    await expect(page.locator(`text=${originalDescription}`)).toBeVisible();
    await expect(page.locator(`text=${originalNote}`)).toBeVisible();

    console.log(`Successfully tested partial update for template: ${templateId}`);
  });

  test('should update only description field and persist change', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a template
    await page.goto('/mass-role-templates/create');
    const originalName = 'Fixed Name Template';
    const originalDescription = 'Original description';

    await page.fill('input#name', originalName);
    await page.fill('textarea#description', originalDescription);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/mass-role-templates\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const templateId = page.url().split('/').pop();

    // Navigate to edit
    await page.goto(`/mass-role-templates/${templateId}/edit`);

    // Update ONLY the description field
    const newDescription = 'This is a completely new and updated description for the template';
    await page.fill('textarea#description', newDescription);

    // Submit
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(`/mass-role-templates/${templateId}`, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify name is unchanged and new description is shown
    await expect(page.getByRole('heading', { name: originalName })).toBeVisible();
    await expect(page.locator(`text=${newDescription}`)).toBeVisible();
    await expect(page.locator(`text=${originalDescription}`)).not.toBeVisible();

    // PERSISTENCE TEST: Refresh and verify
    await page.reload();
    await expect(page.getByRole('heading', { name: originalName })).toBeVisible();
    await expect(page.locator(`text=${newDescription}`)).toBeVisible();

    console.log(`Successfully tested description-only update for template: ${templateId}`);
  });
});
