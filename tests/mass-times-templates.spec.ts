import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Mass Times Templates Module', () => {
  test('should create and view a mass times template', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Navigate to create page
    await page.goto('/mass-times-templates/create');
    await expect(page).toHaveURL('/mass-times-templates/create');
    await expect(page.getByRole('heading', { name: 'Create Mass Times Template' })).toBeVisible();

    // Fill in template name
    const templateName = `Sunday Schedule ${Date.now()}`;
    await page.getByLabel('Template Name').fill(templateName);

    // Fill in description
    const description = 'Regular Sunday Mass schedule for the parish';
    await page.getByLabel('Description').fill(description);

    // Check the active checkbox
    await page.getByLabel('Active Template').check();

    // Submit the form
    await page.getByRole('button', { name: /Save/i }).click();

    // Should redirect to view page (use extended timeout for API call)
    await page.waitForURL(/\/mass-times-templates\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.EXTENDED });

    // Verify on view page - template name appears in heading
    await expect(page.getByRole('heading', { level: 1, name: templateName })).toBeVisible();

    console.log('Successfully created mass times template');
  });

  test('should create template with minimal data', async ({ page }) => {
    // Navigate to create page
    await page.goto('/mass-times-templates/create');
    await expect(page).toHaveURL('/mass-times-templates/create');

    // Fill only required field
    const templateName = `Minimal Template ${Date.now()}`;
    await page.getByLabel('Template Name').fill(templateName);

    // Submit
    await page.getByRole('button', { name: /Save/i }).click();

    // Should redirect to view page
    await page.waitForURL(/\/mass-times-templates\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.EXTENDED });

    console.log('Successfully created template with minimal data');
  });

  test('should edit an existing template', async ({ page }) => {
    // Create a template first
    await page.goto('/mass-times-templates/create');
    const originalName = `Original Template ${Date.now()}`;
    await page.getByLabel('Template Name').fill(originalName);
    await page.getByRole('button', { name: /Save/i }).click();
    await page.waitForURL(/\/mass-times-templates\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.EXTENDED });

    // Get template ID
    const templateId = page.url().split('/').pop();

    // Navigate to edit page
    await page.goto(`/mass-times-templates/${templateId}/edit`);
    await expect(page).toHaveURL(`/mass-times-templates/${templateId}/edit`);

    // Verify original name is pre-filled
    await expect(page.getByLabel('Template Name')).toHaveValue(originalName);

    // Update the name
    const updatedName = `Updated Template ${Date.now()}`;
    await page.getByLabel('Template Name').clear();
    await page.getByLabel('Template Name').fill(updatedName);

    // Submit
    await page.getByRole('button', { name: /Save/i }).click();

    // Should redirect to view page
    await page.waitForURL(/\/mass-times-templates\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.EXTENDED });

    // Verify updated name is displayed in heading
    await expect(page.getByRole('heading', { level: 1, name: updatedName })).toBeVisible();

    console.log('Successfully edited template');
  });

  test('should display list page', async ({ page }) => {
    // Navigate to list page
    await page.goto('/mass-times-templates');
    await expect(page).toHaveURL('/mass-times-templates');

    // Should show page title
    await expect(page.getByRole('heading', { name: 'Mass Times Templates' })).toBeVisible();

    // Should have create button
    await expect(page.getByRole('link', { name: /New Template/i })).toBeVisible();

    console.log('Successfully displayed list page');
  });

  test('should navigate through breadcrumbs', async ({ page }) => {
    // Create a template
    await page.goto('/mass-times-templates/create');
    const templateName = `Breadcrumb Test ${Date.now()}`;
    await page.getByLabel('Template Name').fill(templateName);
    await page.getByRole('button', { name: /Save/i }).click();
    await page.waitForURL(/\/mass-times-templates\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.EXTENDED });

    // Verify breadcrumbs exist
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Mass Times Templates' })).toBeVisible();

    // Click on Mass Times Templates breadcrumb
    await breadcrumbNav.getByRole('link', { name: 'Mass Times Templates' }).click();

    // Should navigate to list page
    await expect(page).toHaveURL('/mass-times-templates');

    console.log('Successfully navigated through breadcrumbs');
  });

  test('should toggle active status when editing', async ({ page }) => {
    // Create an inactive template
    await page.goto('/mass-times-templates/create');
    const templateName = `Toggle Test ${Date.now()}`;
    await page.getByLabel('Template Name').fill(templateName);
    // Don't check active - leave it unchecked
    await page.getByRole('button', { name: /Save/i }).click();
    await page.waitForURL(/\/mass-times-templates\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.EXTENDED });

    const templateId = page.url().split('/').pop();

    // Navigate to edit page
    await page.goto(`/mass-times-templates/${templateId}/edit`);

    // Verify checkbox is unchecked
    await expect(page.getByLabel('Active Template')).not.toBeChecked();

    // Check it
    await page.getByLabel('Active Template').check();

    // Submit
    await page.getByRole('button', { name: /Save/i }).click();
    await page.waitForURL(/\/mass-times-templates\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.EXTENDED });

    // Go back to edit and verify it's now checked
    await page.goto(`/mass-times-templates/${templateId}/edit`);
    await expect(page.getByLabel('Active Template')).toBeChecked();

    console.log('Successfully toggled active status');
  });

  test('should validate required fields', async ({ page }) => {
    // Navigate to create page
    await page.goto('/mass-times-templates/create');

    // Try to submit without filling required field
    await page.getByRole('button', { name: /Save/i }).click();

    // Should show validation error (form should not submit)
    // Still on create page
    await expect(page).toHaveURL('/mass-times-templates/create');

    console.log('Successfully validated required fields');
  });
});
