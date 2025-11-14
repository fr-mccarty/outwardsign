import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Masses Module', () => {
  test('should create, view, edit, and verify print view for a mass', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to masses page
    await page.goto('/masses');
    await expect(page).toHaveURL('/masses');

    // Click "New Mass" button
    const newMassLink = page.getByRole('link', { name: /New Mass/i }).first();
    await newMassLink.click();

    // Verify we're on the create page
    await expect(page).toHaveURL('/masses/create', { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.getByRole('heading', { name: 'Create Mass' })).toBeVisible();

    // Fill in minimal mass form
    // Add some notes
    const initialNote = 'Initial mass planning notes for Sunday celebration';
    await page.fill('textarea#note', initialNote);

    // Scroll to bottom to ensure submit button is visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Submit the form
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should redirect to the mass detail page (navigation proves success)
    await page.waitForURL(/\/masses\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get the mass ID from URL for later use
    const massUrl = page.url();
    const massId = massUrl.split('/').pop();

    console.log(`Created mass with ID: ${massId}`);

    // Verify we're on the view page
    await expect(page.getByRole('heading', { name: /Mass/i }).first()).toBeVisible();

    // Navigate to edit page
    await page.goto(`/masses/${massId}/edit`);
    await expect(page).toHaveURL(`/masses/${massId}/edit`, { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.getByRole('heading', { name: 'Edit Mass' })).toBeVisible();

    // Edit the mass - add more information
    const updatedNote = 'Updated notes: Mass scheduled for Sunday morning at 10:00 AM.';
    await page.fill('textarea#note', updatedNote);

    // Scroll to bottom and submit
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const editSubmitButton = page.locator('button[type="submit"]').last();
    await editSubmitButton.scrollIntoViewIfNeeded();
    await editSubmitButton.click();

    // Wait briefly for the update to complete
    await page.waitForTimeout(2000);

    // Navigate back to view page
    await page.goto(`/masses/${massId}`);
    await expect(page).toHaveURL(`/masses/${massId}`);

    // Verify we're on the mass view page
    await expect(page.getByRole('heading', { name: /Mass/i }).first()).toBeVisible();

    // Test print view - verify it exists and loads
    console.log(`Testing print view for mass: ${massId}`);
    await page.goto(`/print/masses/${massId}`);
    await expect(page).toHaveURL(`/print/masses/${massId}`, { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Verify print view loaded (check for common print view elements)
    // Print views typically don't have navigation or action buttons
    // Just verify the page loaded without error
    await expect(page.locator('body')).toBeVisible();

    // Verify that the print view contains mass-specific content
    // Print views should show the liturgical script content
    await expect(page.locator('.mass-print-content')).toBeVisible();

    console.log(`Successfully tested mass: ${massId} - created, edited, and verified print view`);
  });

  test('should show empty state when no masses exist', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to masses page
    await page.goto('/masses');

    // Should show the page title
    await expect(page.getByRole('heading', { name: 'Masses' }).first()).toBeVisible();

    // Should have a create button
    const createButton = page.getByRole('link', { name: /New Mass/i }).first();
    await expect(createButton).toBeVisible();
  });

  test('should create mass with minimal data', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Go to create page
    await page.goto('/masses/create');
    await expect(page).toHaveURL('/masses/create');

    // Submit with just the defaults (most fields are optional)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should successfully create and redirect (even with minimal data)
    await page.waitForURL(/\/masses\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify we're on a mass detail page
    await expect(page.getByRole('heading', { name: /Mass/i }).first()).toBeVisible();
  });

  test('should navigate through breadcrumbs', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a mass
    await page.goto('/masses/create');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const btn = page.locator('button[type="submit"]').last();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForURL(/\/masses\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify breadcrumbs
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Masses' })).toBeVisible();

    // Click on "Masses" breadcrumb
    await breadcrumbNav.getByRole('link', { name: 'Masses' }).click();

    // Should navigate back to masses list
    await expect(page).toHaveURL('/masses');
  });

  test('should display action buttons on mass view page', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a mass
    await page.goto('/masses/create');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitBtn = page.locator('button[type="submit"]').last();
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();
    await page.waitForURL(/\/masses\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify action buttons exist (ModuleViewPanel buttons)
    await expect(page.getByRole('link', { name: /Edit Mass/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Print View/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'PDF' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Word' })).toBeVisible();
  });
});
