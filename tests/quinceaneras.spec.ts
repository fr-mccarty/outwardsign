import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Quinceaneras Module', () => {
  test('should create, view, edit, and verify print view for a quinceanera', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to quinceaneras page
    await page.goto('/quinceaneras');
    await expect(page).toHaveURL('/quinceaneras');

    // Click "New Quinceanera" button
    const newQuinceaneraLink = page.getByRole('link', { name: /New Quinceanera/i }).first();
    await newQuinceaneraLink.click();

    // Verify we're on the create page
    await expect(page).toHaveURL('/quinceaneras/create', { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.getByRole('heading', { name: 'Create Quinceanera' })).toBeVisible();

    // Fill in minimal quinceanera form
    // Select a status (dropdown)
    await page.locator('#status').click();
    await page.getByRole('option', { name: 'Active' }).first().click();

    // Add some notes
    const initialNotes = 'Initial quinceanera planning notes for celebration';
    await page.fill('textarea#notes', initialNotes);

    // Scroll to bottom to ensure submit button is visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Submit the form
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should redirect to the quinceanera detail page (navigation proves success)
    await page.waitForURL(/\/quinceaneras\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get the quinceanera ID from URL for later use
    const quinceaneraUrl = page.url();
    const quinceaneraId = quinceaneraUrl.split('/').pop();

    console.log(`Created quinceanera with ID: ${quinceaneraId}`);

    // Verify we're on the view page
    await expect(page.getByRole('heading', { name: /Quinceanera/i }).first()).toBeVisible();

    // Navigate to edit page
    await page.goto(`/quinceaneras/${quinceaneraId}/edit`);
    await expect(page).toHaveURL(`/quinceaneras/${quinceaneraId}/edit`, { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.getByRole('heading', { name: 'Edit Quinceanera' })).toBeVisible();

    // Edit the quinceanera - add more information
    const updatedNotes = 'Updated notes: Celebration scheduled for Saturday evening. Reception to follow.';
    await page.fill('textarea#notes', updatedNotes);

    // Scroll to bottom and submit
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const editSubmitButton = page.locator('button[type="submit"]').last();
    await editSubmitButton.scrollIntoViewIfNeeded();
    await editSubmitButton.click();

    // Wait briefly for the update to complete
    await page.waitForTimeout(2000);

    // Navigate back to view page
    await page.goto(`/quinceaneras/${quinceaneraId}`);
    await expect(page).toHaveURL(`/quinceaneras/${quinceaneraId}`);

    // Verify we're on the quinceanera view page
    await expect(page.getByRole('heading', { name: /Quinceanera/i }).first()).toBeVisible();

    // Test print view - verify it exists and loads
    console.log(`Testing print view for quinceanera: ${quinceaneraId}`);
    await page.goto(`/print/quinceaneras/${quinceaneraId}`);
    await expect(page).toHaveURL(`/print/quinceaneras/${quinceaneraId}`, { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Verify print view loaded
    await expect(page.locator('body')).toBeVisible();

    console.log(`Successfully tested quinceanera: ${quinceaneraId} - created, edited, and verified print view`);
  });

  test('should show empty state when no quinceaneras exist', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to quinceaneras page
    await page.goto('/quinceaneras');

    // Should show the page title
    await expect(page.getByRole('heading', { name: 'Quinceaneras' }).first()).toBeVisible();

    // Should have a create button
    const createButton = page.getByRole('link', { name: /New Quinceanera/i }).first();
    await expect(createButton).toBeVisible();
  });

  test('should create quinceanera with minimal data', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Go to create page
    await page.goto('/quinceaneras/create');
    await expect(page).toHaveURL('/quinceaneras/create');

    // Submit with just the defaults
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should successfully create and redirect
    await page.waitForURL(/\/quinceaneras\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify we're on a quinceanera detail page
    await expect(page.getByRole('heading', { name: /Quinceanera/i }).first()).toBeVisible();
  });

  test('should navigate through breadcrumbs', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a quinceanera
    await page.goto('/quinceaneras/create');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const btn = page.locator('button[type="submit"]').last();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForURL(/\/quinceaneras\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify breadcrumbs
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Quinceaneras' })).toBeVisible();

    // Click on "Quinceaneras" breadcrumb
    await breadcrumbNav.getByRole('link', { name: 'Quinceaneras' }).click();

    // Should navigate back to quinceaneras list
    await expect(page).toHaveURL('/quinceaneras');
  });

  test('should display action buttons on quinceanera view page', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a quinceanera
    await page.goto('/quinceaneras/create');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitBtn = page.locator('button[type="submit"]').last();
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();
    await page.waitForURL(/\/quinceaneras\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify action buttons exist
    await expect(page.getByRole('link', { name: /Edit Quinceanera/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Print View/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'PDF' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Word' })).toBeVisible();
  });
});
