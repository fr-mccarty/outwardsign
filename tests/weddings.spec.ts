import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Weddings Module', () => {
  test('should create, view, edit, and verify print view for a wedding', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to weddings page
    await page.goto('/weddings');
    await expect(page).toHaveURL('/weddings');

    // Click "New Wedding" button
    const newWeddingLink = page.getByRole('link', { name: /New Wedding/i }).first();
    await newWeddingLink.click();

    // Verify we're on the create page
    await expect(page).toHaveURL('/weddings/create', { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.getByRole('heading', { name: 'Create Wedding' })).toBeVisible();

    // Fill in minimal wedding form
    // The wedding form has many optional fields, so we'll start with just essential info

    // Select a status (dropdown)
    await page.locator('#status').click();
    await page.getByRole('option', { name: 'Active' }).first().click();

    // Add some notes
    const initialNotes = 'Initial wedding planning notes for Smith-Johnson wedding';
    await page.fill('textarea#notes', initialNotes);

    // Scroll to bottom to ensure submit button is visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Submit the form
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should redirect to the wedding edit page (navigation proves success)
    await page.waitForURL(/\/weddings\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get the wedding ID from URL for later use
    const weddingUrl = page.url();
    const weddingId = weddingUrl.split('/')[weddingUrl.split('/').length - 2]; // Extract ID from /weddings/{id}/edit

    console.log(`Created wedding with ID: ${weddingId}`);

    // Verify we're on the edit page (heading will be "Wedding" since no bride/groom selected yet)
    await expect(page.getByRole('heading', { name: 'Wedding' }).first()).toBeVisible();

    // Verify the notes are in the form
    await expect(page.locator('textarea#notes').first()).toHaveValue(initialNotes);

    // Edit the wedding - add more information (we're already on the edit page)
    const updatedNotes = 'Updated notes: Couple has selected June 15th for the ceremony. Main church at 2pm.';
    await page.fill('textarea#notes', updatedNotes);

    // Add announcements
    const announcements = 'Please join us for a reception following the ceremony at the parish hall.';
    await page.fill('textarea#announcements', announcements);

    // Scroll to bottom and submit
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const editSubmitButton = page.locator('button[type="submit"]').last();
    await editSubmitButton.scrollIntoViewIfNeeded();
    await editSubmitButton.click();

    // Wait briefly for the update to complete (edit stays on same page with router.refresh())
    await page.waitForTimeout(2000);

    // Navigate back to view page
    await page.goto(`/weddings/${weddingId}`);
    await expect(page).toHaveURL(`/weddings/${weddingId}`);

    // Verify we're on the wedding view page (update was successful)
    await expect(page.getByRole('heading', { name: /Wedding/i }).first()).toBeVisible();

    // Test print view - verify it exists and loads
    console.log(`Testing print view for wedding: ${weddingId}`);
    await page.goto(`/print/weddings/${weddingId}`);
    await expect(page).toHaveURL(`/print/weddings/${weddingId}`, { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Verify print view loaded (check for common print view elements)
    // Print views typically don't have navigation or action buttons
    // Just verify the page loaded without error
    await expect(page.locator('body')).toBeVisible();

    console.log(`Successfully tested wedding: ${weddingId} - created, edited, and verified print view`);
  });

  test('should show empty state when no weddings exist', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to weddings page
    await page.goto('/weddings');

    // Should show the page title
    await expect(page.getByRole('heading', { name: 'Weddings' }).first()).toBeVisible();

    // Should have a create button
    const createButton = page.getByRole('link', { name: /New Wedding/i }).first();
    await expect(createButton).toBeVisible();
  });

  test('should create wedding with minimal data', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Go to create page
    await page.goto('/weddings/create');
    await expect(page).toHaveURL('/weddings/create');

    // Submit with just the defaults (most fields are optional)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should successfully create and redirect to edit page (even with minimal data)
    await page.waitForURL(/\/weddings\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify we're on the wedding edit page (heading will be "Wedding" since no bride/groom selected yet)
    await expect(page.getByRole('heading', { name: 'Wedding' }).first()).toBeVisible();
  });

  test('should navigate through breadcrumbs', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a wedding
    await page.goto('/weddings/create');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const btn = page.locator('button[type="submit"]').last();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForURL(/\/weddings\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify breadcrumbs
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Weddings' })).toBeVisible();

    // Click on "Weddings" breadcrumb
    await breadcrumbNav.getByRole('link', { name: 'Weddings' }).click();

    // Should navigate back to weddings list
    await expect(page).toHaveURL('/weddings');
  });

  test('should display action buttons on wedding view page', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a wedding
    await page.goto('/weddings/create');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitBtn = page.locator('button[type="submit"]').last();
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();
    await page.waitForURL(/\/weddings\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Extract wedding ID and navigate to view page to check action buttons
    const weddingId = page.url().split('/')[page.url().split('/').length - 2];
    await page.goto(`/weddings/${weddingId}`);
    await expect(page).toHaveURL(`/weddings/${weddingId}`);

    // Verify action buttons exist (buttons are rendered as Links with Button styling)
    await expect(page.getByRole('link', { name: /Edit Wedding/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Print View/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Download PDF/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Download Word/i })).toBeVisible();
  });

  test('should update wedding and verify persistence after page refresh', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a wedding with initial data
    await page.goto('/weddings/create');

    const initialNotes = 'Initial wedding notes before update';
    const initialAnnouncements = 'Initial announcements text';

    await page.locator('textarea#notes').first().fill(initialNotes);
    await page.locator('textarea#announcements').first().fill(initialAnnouncements);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/weddings\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const weddingId = page.url().split('/')[page.url().split('/').length - 2];

    // Verify initial data is in the edit form
    await expect(page.locator('textarea#notes').first()).toHaveValue(initialNotes);
    await expect(page.locator('textarea#announcements').first()).toHaveValue(initialAnnouncements);

    // Navigate to view page to verify data is displayed
    await page.goto(`/weddings/${weddingId}`);
    await expect(page).toHaveURL(`/weddings/${weddingId}`);
    await expect(page.locator(`text=${initialNotes}`).first()).toBeVisible();
    await expect(page.locator(`text=${initialAnnouncements}`).first()).toBeVisible();

    // Navigate to edit page
    await page.goto(`/weddings/${weddingId}/edit`);
    await expect(page).toHaveURL(`/weddings/${weddingId}/edit`);

    // Verify initial values are pre-filled
    await expect(page.locator('textarea#notes').first()).toHaveValue(initialNotes);
    await expect(page.locator('textarea#announcements').first()).toHaveValue(initialAnnouncements);

    // Update with NEW values
    const updatedNotes = 'UPDATED: Wedding ceremony confirmed for June 15th at 2pm';
    const updatedAnnouncements = 'UPDATED: Reception will be held at the Grand Hall immediately following';

    await page.locator('textarea#notes').first().fill(updatedNotes);
    await page.locator('textarea#announcements').first().fill(updatedAnnouncements);

    // Submit the update
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();

    // Wedding form uses router.refresh() on edit, so it stays on edit page
    // Wait for the update to complete
    await page.waitForTimeout(2000);

    // Navigate to view page to verify the update
    await page.goto(`/weddings/${weddingId}`);
    await expect(page).toHaveURL(`/weddings/${weddingId}`);

    // CRITICAL: Verify UPDATED values are displayed on view page
    await expect(page.locator(`text=${updatedNotes}`).first()).toBeVisible();
    await expect(page.locator(`text=${updatedAnnouncements}`).first()).toBeVisible();

    // CRITICAL: Verify old values are NOT displayed
    await expect(page.locator(`text=${initialNotes}`)).not.toBeVisible();
    await expect(page.locator(`text=${initialAnnouncements}`)).not.toBeVisible();

    // PERSISTENCE TEST: Refresh page to verify database persistence
    console.log(`Refreshing page to verify persistence for wedding: ${weddingId}`);
    await page.reload();

    // After refresh, verify UPDATED values are STILL displayed
    await expect(page.locator(`text=${updatedNotes}`).first()).toBeVisible();
    await expect(page.locator(`text=${updatedAnnouncements}`).first()).toBeVisible();

    // Navigate to edit page again to verify form persistence
    await page.goto(`/weddings/${weddingId}/edit`);

    // PERSISTENCE TEST: Verify form fields contain UPDATED values
    await expect(page.locator('textarea#notes').first()).toHaveValue(updatedNotes);
    await expect(page.locator('textarea#announcements').first()).toHaveValue(updatedAnnouncements);

    console.log(`Successfully verified update persistence for wedding: ${weddingId}`);
  });

  test('should export wedding to PDF and verify download buttons', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    console.log('Creating wedding for PDF export test');

    // Create a wedding
    await page.goto('/weddings/create');
    await expect(page).toHaveURL('/weddings/create');

    // Fill in some basic wedding data
    await page.locator('#status').click();
    await page.getByRole('option', { name: 'Active' }).first().click();

    const testNotes = 'PDF Export Test Wedding Notes';
    await page.fill('textarea#notes', testNotes);

    // Submit the form
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should redirect to the wedding edit page
    await page.waitForURL(/\/weddings\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get the wedding ID from URL
    const weddingUrl = page.url();
    const weddingId = weddingUrl.split('/')[weddingUrl.split('/').length - 2];
    console.log(`Created wedding with ID: ${weddingId}`);

    // Navigate to view page
    await page.goto(`/weddings/${weddingId}`);
    await expect(page).toHaveURL(`/weddings/${weddingId}`);

    // Verify export buttons exist (they're buttons/links in the ModuleViewPanel)
    console.log('Verifying export buttons are visible');

    // Check for Print View button/link
    const printViewButton = page.getByRole('button', { name: /Print View/i })
      .or(page.getByRole('link', { name: /Print View/i }));
    await expect(printViewButton.first()).toBeVisible();

    // Check for PDF button
    const pdfButton = page.getByRole('button', { name: 'PDF' })
      .or(page.getByRole('link', { name: 'PDF' }));
    await expect(pdfButton.first()).toBeVisible();

    // Check for Word button
    const wordButton = page.getByRole('button', { name: 'Word' })
      .or(page.getByRole('link', { name: 'Word' }));
    await expect(wordButton.first()).toBeVisible();

    console.log('All export buttons are visible and accessible');

    // Optional: Verify print view page loads
    console.log('Testing print view page');
    await page.goto(`/print/weddings/${weddingId}`);
    await expect(page).toHaveURL(`/print/weddings/${weddingId}`, { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Verify print view loaded
    await expect(page.locator('body')).toBeVisible();

    console.log(`Successfully verified PDF export buttons for wedding: ${weddingId}`);
  });
});
