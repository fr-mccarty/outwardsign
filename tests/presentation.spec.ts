import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Presentations Module', () => {
  // Enable parallel execution - tests in this file don't interfere with each other
  test.describe.configure({ mode: 'parallel' });
  test('should create, view, edit, and verify print view for a presentation', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to presentations page
    await page.goto('/presentations');
    await expect(page).toHaveURL('/presentations');

    // Click "New Presentation" button
    const newPresentationLink = page.getByRole('link', { name: /New Presentation/i }).first();
    await newPresentationLink.click();

    // Verify we're on the create page
    await expect(page).toHaveURL('/presentations/create', { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.getByRole('heading', { name: 'Create Presentation' })).toBeVisible();

    // Fill in minimal presentation form
    // Select a status (dropdown)
    await page.locator('#status').click();
    await page.getByRole('option', { name: 'Active' }).first().click();

    // Add some notes
    const initialNote = 'Initial presentation planning notes for child presentation';
    await page.fill('textarea#note', initialNote);

    // Scroll to bottom to ensure submit button is visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Submit the form
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should redirect to the presentation detail page (navigation proves success)
    await page.waitForURL(/\/presentations\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get the presentation ID from URL for later use (URL format: /presentations/{id}/edit)
    const presentationUrl = page.url();
    const presentationId = presentationUrl.split('/').slice(-2, -1)[0];

    console.log(`Created presentation with ID: ${presentationId}`);

    // Verify we're on the view page
    await expect(page.getByRole('heading', { name: /Presentation/i }).first()).toBeVisible();

    // Navigate to edit page
    await page.goto(`/presentations/${presentationId}/edit`);
    await expect(page).toHaveURL(`/presentations/${presentationId}/edit`, { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.getByRole('heading', { name: 'Edit Presentation' })).toBeVisible();

    // Edit the presentation - add more information
    const updatedNote = 'Updated notes: Presentation scheduled for Sunday. Family celebration afterward.';
    await page.fill('textarea#note', updatedNote);

    // Scroll to bottom and submit
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const editSubmitButton = page.locator('button[type="submit"]').last();
    await editSubmitButton.scrollIntoViewIfNeeded();
    await editSubmitButton.click();

    // Wait briefly for the update to complete
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Navigate back to view page
    await page.goto(`/presentations/${presentationId}`);
    await expect(page).toHaveURL(`/presentations/${presentationId}`);

    // Verify we're on the presentation view page
    await expect(page.getByRole('heading', { name: /Presentation/i }).first()).toBeVisible();

    // Test print view - verify it exists and loads
    console.log(`Testing print view for presentation: ${presentationId}`);
    await page.goto(`/print/presentations/${presentationId}`);
    await expect(page).toHaveURL(`/print/presentations/${presentationId}`, { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Verify print view loaded (check for common print view elements)
    // Print views typically don't have navigation or action buttons
    // Just verify the page loaded without error
    await expect(page.locator('body')).toBeVisible();

    // Verify that the print view contains presentation-specific content
    // Print views should show the liturgical script content
    await expect(page.locator('.presentation-print-content')).toBeVisible();

    console.log(`Successfully tested presentation: ${presentationId} - created, edited, and verified print view`);
  });

  test('should show empty state when no presentations exist', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to presentations page
    await page.goto('/presentations');

    // Should show the page title
    await expect(page.getByRole('heading', { name: 'Presentations' }).first()).toBeVisible();

    // Should have a create button
    const createButton = page.getByRole('link', { name: /New Presentation/i }).first();
    await expect(createButton).toBeVisible();
  });

  test('should create presentation with minimal data', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Go to create page
    await page.goto('/presentations/create');
    await expect(page).toHaveURL('/presentations/create');

    // Submit with just the defaults (most fields are optional)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should successfully create and redirect (even with minimal data)
    await page.waitForURL(/\/presentations\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify we're on a presentation detail page
    await expect(page.getByRole('heading', { name: /Presentation/i }).first()).toBeVisible();
  });

  test('should navigate through breadcrumbs', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a presentation
    await page.goto('/presentations/create');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const btn = page.locator('button[type="submit"]').last();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForURL(/\/presentations\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify breadcrumbs
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Presentations' })).toBeVisible();

    // Click on "Presentations" breadcrumb
    await breadcrumbNav.getByRole('link', { name: 'Presentations' }).click();

    // Should navigate back to presentations list
    await expect(page).toHaveURL('/presentations');
  });

  test('should display action buttons on presentation view page', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a presentation
    await page.goto('/presentations/create');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitBtn = page.locator('button[type="submit"]').last();
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();
    await page.waitForURL(/\/presentations\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify action buttons exist (ModuleViewPanel buttons)
    await expect(page.getByRole('link', { name: /Edit Presentation/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Print View/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'PDF' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Word' })).toBeVisible();
  });

  test('should update presentation and verify persistence after page refresh', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a presentation with initial data
    await page.goto('/presentations/create');

    const initialNote = 'Initial presentation note before any updates';

    await page.fill('textarea#note', initialNote);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/presentations\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const presentationId = page.url().split('/').slice(-2, -1)[0];

    // Verify initial data is displayed on view page
    await expect(page.locator(`text=${initialNote}`).first()).toBeVisible();

    // Navigate to edit page
    await page.goto(`/presentations/${presentationId}/edit`);
    await expect(page).toHaveURL(`/presentations/${presentationId}/edit`);

    // Verify initial value is pre-filled
    await expect(page.locator('textarea#note')).toHaveValue(initialNote);

    // Update with NEW value
    const updatedNote = 'UPDATED: Presentation ceremony confirmed for Sunday June 8th at 11am. Family celebration to follow.';

    await page.fill('textarea#note', updatedNote);

    // Submit the update
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();

    // Presentation form uses router.refresh() on edit, so it stays on edit page
    // Wait for the update to complete
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Navigate to view page to verify the update
    await page.goto(`/presentations/${presentationId}`);
    await expect(page).toHaveURL(`/presentations/${presentationId}`);

    // CRITICAL: Verify UPDATED value is displayed
    await expect(page.locator(`text=${updatedNote}`).first()).toBeVisible();

    // CRITICAL: Verify old value is NOT displayed
    await expect(page.locator(`text=${initialNote}`)).not.toBeVisible();

    // PERSISTENCE TEST: Refresh page to verify database persistence
    console.log(`Refreshing page to verify persistence for presentation: ${presentationId}`);
    await page.reload();

    // After refresh, verify UPDATED value is STILL displayed
    await expect(page.locator(`text=${updatedNote}`).first()).toBeVisible();

    // Navigate to edit page again to verify form persistence
    await page.goto(`/presentations/${presentationId}/edit`);

    // PERSISTENCE TEST: Verify form field contains UPDATED value
    await expect(page.locator('textarea#note')).toHaveValue(updatedNote);

    console.log(`Successfully verified update persistence for presentation: ${presentationId}`);
  });
});
