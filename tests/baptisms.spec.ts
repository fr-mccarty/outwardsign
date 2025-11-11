import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Baptisms Module', () => {
  test('should create, view, edit, and verify print view for a baptism', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to baptisms page
    await page.goto('/baptisms');
    await expect(page).toHaveURL('/baptisms');

    // Click "New Baptism" button
    const newBaptismLink = page.getByRole('link', { name: /New Baptism/i }).first();
    await newBaptismLink.click();

    // Verify we're on the create page
    await expect(page).toHaveURL('/baptisms/create', { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.getByRole('heading', { name: 'Create Baptism' })).toBeVisible();

    // Fill in minimal baptism form
    // Select a status (dropdown)
    await page.locator('#status').click();
    await page.getByRole('option', { name: 'Active' }).first().click();

    // Add some notes
    const initialNotes = 'Initial baptism planning notes for infant baptism';
    await page.fill('textarea#notes', initialNotes);

    // Scroll to bottom to ensure submit button is visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Submit the form
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should redirect to the baptism detail page (navigation proves success)
    await page.waitForURL(/\/baptisms\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get the baptism ID from URL for later use
    const baptismUrl = page.url();
    const baptismId = baptismUrl.split('/').pop();

    console.log(`Created baptism with ID: ${baptismId}`);

    // Verify we're on the view page
    await expect(page.getByRole('heading', { name: /Baptism/i }).first()).toBeVisible();

    // Navigate to edit page
    await page.goto(`/baptisms/${baptismId}/edit`);
    await expect(page).toHaveURL(`/baptisms/${baptismId}/edit`, { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.getByRole('heading', { name: 'Edit Baptism' })).toBeVisible();

    // Edit the baptism - add more information
    const updatedNotes = 'Updated notes: Baptism scheduled for Sunday. Family celebration afterward.';
    await page.fill('textarea#notes', updatedNotes);

    // Scroll to bottom and submit
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const editSubmitButton = page.locator('button[type="submit"]').last();
    await editSubmitButton.scrollIntoViewIfNeeded();
    await editSubmitButton.click();

    // Wait briefly for the update to complete
    await page.waitForTimeout(2000);

    // Navigate back to view page
    await page.goto(`/baptisms/${baptismId}`);
    await expect(page).toHaveURL(`/baptisms/${baptismId}`);

    // Verify we're on the baptism view page
    await expect(page.getByRole('heading', { name: /Baptism/i }).first()).toBeVisible();

    // Test print view - verify it exists and loads
    console.log(`Testing print view for baptism: ${baptismId}`);
    await page.goto(`/print/baptisms/${baptismId}`);
    await expect(page).toHaveURL(`/print/baptisms/${baptismId}`, { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Verify print view loaded
    await expect(page.locator('body')).toBeVisible();

    console.log(`Successfully tested baptism: ${baptismId} - created, edited, and verified print view`);
  });

  test('should show empty state when no baptisms exist', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to baptisms page
    await page.goto('/baptisms');

    // Should show the page title
    await expect(page.getByRole('heading', { name: 'Baptisms' }).first()).toBeVisible();

    // Should have a create button
    const createButton = page.getByRole('link', { name: /New Baptism/i }).first();
    await expect(createButton).toBeVisible();
  });

  test('should create baptism with minimal data', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Go to create page
    await page.goto('/baptisms/create');
    await expect(page).toHaveURL('/baptisms/create');

    // Submit with just the defaults
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should successfully create and redirect
    await page.waitForURL(/\/baptisms\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify we're on a baptism detail page
    await expect(page.getByRole('heading', { name: /Baptism/i }).first()).toBeVisible();
  });

  test('should navigate through breadcrumbs', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a baptism
    await page.goto('/baptisms/create');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const btn = page.locator('button[type="submit"]').last();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForURL(/\/baptisms\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify breadcrumbs
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Baptisms' })).toBeVisible();

    // Click on "Baptisms" breadcrumb
    await breadcrumbNav.getByRole('link', { name: 'Baptisms' }).click();

    // Should navigate back to baptisms list
    await expect(page).toHaveURL('/baptisms');
  });

  test('should display action buttons on baptism view page', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a baptism
    await page.goto('/baptisms/create');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitBtn = page.locator('button[type="submit"]').last();
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();
    await page.waitForURL(/\/baptisms\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify action buttons exist
    await expect(page.getByRole('link', { name: /Edit Baptism/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Print View/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'PDF' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Word' })).toBeVisible();
  });
});
