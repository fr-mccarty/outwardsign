import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Funerals Module', () => {
  // Enable parallel execution - tests in this file don't interfere with each other
  test.describe.configure({ mode: 'parallel' });

  test('should create, view, edit, and verify print view for a funeral', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to funerals page
    await page.goto('/funerals');
    await expect(page).toHaveURL('/funerals');

    // Click "New Funeral" button
    const newFuneralLink = page.getByRole('link', { name: /New Funeral/i }).first();
    await newFuneralLink.click();

    // Verify we're on the create page
    await expect(page).toHaveURL('/funerals/create', { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.getByRole('heading', { name: 'Create Funeral' })).toBeVisible();

    // Fill in minimal funeral form
    // Select a status (dropdown)
    await page.locator('#status').click();
    await page.getByRole('option', { name: 'Active' }).first().click();

    // Add some notes
    const initialNotes = 'Initial funeral planning notes for memorial service';
    await page.fill('textarea#note', initialNotes);

    // Scroll to bottom to ensure submit button is visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Submit the form
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should redirect to the funeral edit page (navigation proves success)
    await page.waitForURL(/\/funerals\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get the funeral ID from URL
    const urlParts = page.url().split('/');
    const funeralId = urlParts[urlParts.length - 2]; // Get ID before /edit

    console.log(`Created funeral with ID: ${funeralId}`);

    // Verify we're on the edit page (heading is dynamic based on deceased name or just "Funeral")
    await expect(page.getByRole('heading', { name: /Funeral/i }).first()).toBeVisible();

    // Edit the funeral - add more information
    const updatedNotes = 'Updated notes: Memorial service scheduled for Saturday. Family gathering afterward.';
    await page.fill('textarea#note', updatedNotes);

    // Scroll to bottom and submit
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const editSubmitButton = page.locator('button[type="submit"]').last();
    await editSubmitButton.scrollIntoViewIfNeeded();
    await editSubmitButton.click();

    // Wait briefly for the update to complete
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Navigate back to view page
    await page.goto(`/funerals/${funeralId}`);
    await expect(page).toHaveURL(`/funerals/${funeralId}`);

    // Verify we're on the funeral view page
    await expect(page.getByRole('heading', { name: /Funeral/i }).first()).toBeVisible();

    // Test print view - verify it exists and loads
    console.log(`Testing print view for funeral: ${funeralId}`);
    await page.goto(`/print/funerals/${funeralId}`);
    await expect(page).toHaveURL(`/print/funerals/${funeralId}`, { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Verify print view loaded
    await expect(page.locator('body')).toBeVisible();

    console.log(`Successfully tested funeral: ${funeralId} - created, edited, and verified print view`);
  });

  test('should show empty state when no funerals exist', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to funerals page
    await page.goto('/funerals');

    // Should show the page title
    await expect(page.getByRole('heading', { name: 'Funerals' }).first()).toBeVisible();

    // Should have a create button
    const createButton = page.getByRole('link', { name: /New Funeral/i }).first();
    await expect(createButton).toBeVisible();
  });

  test('should create funeral with minimal data', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Go to create page
    await page.goto('/funerals/create');
    await expect(page).toHaveURL('/funerals/create');

    // Submit with just the defaults
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should successfully create and redirect
    await page.waitForURL(/\/funerals\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify we're on a funeral detail page
    await expect(page.getByRole('heading', { name: /Funeral/i }).first()).toBeVisible();
  });

  test('should navigate through breadcrumbs', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a funeral
    await page.goto('/funerals/create');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const btn = page.locator('button[type="submit"]').last();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForURL(/\/funerals\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify breadcrumbs
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Funerals' })).toBeVisible();

    // Click on "Funerals" breadcrumb
    await breadcrumbNav.getByRole('link', { name: 'Funerals' }).click();

    // Should navigate back to funerals list
    await expect(page).toHaveURL('/funerals');
  });

  test('should display action buttons on funeral view page', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a funeral
    await page.goto('/funerals/create');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitBtn = page.locator('button[type="submit"]').last();
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();
    await page.waitForURL(/\/funerals\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Extract funeral ID and navigate to view page to check action buttons
    const urlParts = page.url().split('/');
    const funeralId = urlParts[urlParts.length - 2];
    await page.goto(`/funerals/${funeralId}`);

    // Verify action buttons exist on view page
    await expect(page.getByRole('link', { name: /Edit/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Print View/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Download PDF/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Download Word/i })).toBeVisible();
  });

  test('should update funeral and verify persistence after page refresh', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a funeral with initial data
    await page.goto('/funerals/create');

    const initialNote = 'Initial funeral note before any updates';

    await page.fill('textarea#note', initialNote);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/funerals\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const urlParts = page.url().split('/');
    const funeralId = urlParts[urlParts.length - 2];

    // Verify initial value is pre-filled on edit page
    await expect(page.locator('textarea#note').first()).toHaveValue(initialNote);

    // Update with NEW value
    const updatedNote = 'UPDATED: Memorial service confirmed for Saturday April 20th at 10am. Reception to follow in parish hall.';

    await page.fill('textarea#note', updatedNote);

    // Submit the update
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();

    // Funeral form uses router.refresh() on edit, so it stays on edit page
    // Wait for the update to complete
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Navigate to view page to verify the update
    await page.goto(`/funerals/${funeralId}`);
    await expect(page).toHaveURL(`/funerals/${funeralId}`);

    // CRITICAL: Verify UPDATED value is displayed
    await expect(page.locator(`text=${updatedNote}`).first()).toBeVisible();

    // CRITICAL: Verify old value is NOT displayed
    await expect(page.locator(`text=${initialNote}`)).not.toBeVisible();

    // PERSISTENCE TEST: Refresh page to verify database persistence
    console.log(`Refreshing page to verify persistence for funeral: ${funeralId}`);
    await page.reload();

    // After refresh, verify UPDATED value is STILL displayed
    await expect(page.locator(`text=${updatedNote}`).first()).toBeVisible();

    // Navigate to edit page again to verify form persistence
    await page.goto(`/funerals/${funeralId}/edit`);

    // PERSISTENCE TEST: Verify form field contains UPDATED value
    await expect(page.locator('textarea#note').first()).toHaveValue(updatedNote);

    console.log(`Successfully verified update persistence for funeral: ${funeralId}`);
  });
});
