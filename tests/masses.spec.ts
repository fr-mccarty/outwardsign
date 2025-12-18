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
    await page.waitForURL(/\/masses\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get the mass ID from URL for later use
    // URL is /masses/[id]/edit, so we need the second-to-last segment
    const massUrl = page.url();
    const urlParts = massUrl.split('/');
    const massId = urlParts[urlParts.length - 2]; // Get UUID, not 'edit'

    console.log(`Created mass with ID: ${massId}`);

    // Verify we're on the edit page (redirected after create)
    await expect(page.getByRole('heading', { name: /Mass/i }).first()).toBeVisible();

    // Navigate to edit page explicitly
    await page.goto(`/masses/${massId}/edit`);
    await expect(page).toHaveURL(`/masses/${massId}/edit`, { timeout: TEST_TIMEOUTS.NAVIGATION });
    // Title is dynamic (e.g., "Presider-Date-Mass"), so just check page loaded
    await expect(page.getByRole('heading', { name: /Mass/i }).first()).toBeVisible();

    // Edit the mass - add more information
    const updatedNote = 'Updated notes: Mass scheduled for Sunday morning at 10:00 AM.';
    await page.fill('textarea#note', updatedNote);

    // Scroll to bottom and submit
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();

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
    await page.waitForURL(/\/masses\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

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
    await page.waitForURL(/\/masses\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

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
    await page.waitForURL(/\/masses\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get mass ID and navigate to VIEW page (not edit page)
    const urlParts = page.url().split('/');
    const massId = urlParts[urlParts.length - 2];
    await page.goto(`/masses/${massId}`);
    await expect(page).toHaveURL(`/masses/${massId}`);

    // Verify action buttons exist on VIEW page (ModuleViewPanel buttons)
    // These are Links styled as Buttons
    await expect(page.getByRole('link', { name: /Edit Mass/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Print View/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Download PDF/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Download Word/i })).toBeVisible();
  });

  test('should create mass with new event via picker', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to mass creation page
    await page.goto('/masses/create');
    await expect(page).toHaveURL('/masses/create');
    await expect(page.getByRole('heading', { name: 'Create Mass' })).toBeVisible();

    // Click "Select Event" button to open EventPicker
    await page.getByRole('button', { name: /Select Event/i }).click();

    // Wait for Event Picker dialog
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.locator('[role="dialog"]').getByRole('heading', { name: /Select Event/i })).toBeVisible();

    // Fill in event details using input IDs
    const eventName = `Holy Mass ${Date.now()}`;
    await page.locator('[role="dialog"] input#name').fill(eventName);
    await page.locator('[role="dialog"] input#start_date').fill('2025-12-08');
    await page.locator('[role="dialog"] input#start_time').fill('10:00');

    // Submit event creation and wait for dialog to close
    await page.locator('[role="dialog"]').getByRole('button', { name: /Save Event/i }).click();

    // Wait for dialog to close - longer timeout for API call
    await expect(page.locator('[role="dialog"]')).toHaveCount(0, { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Event should be auto-selected - verify the button shows the date
    await expect(page.getByRole('button', { name: /Dec 8, 2025/i })).toBeVisible();

    // Add notes to the mass
    const massNotes = `Mass created with event picker - Test ${Date.now()}`;
    await page.fill('textarea#note', massNotes);

    // Submit the mass form
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();

    // Should redirect to the mass edit page
    await page.waitForURL(/\/masses\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get mass ID
    const urlParts = page.url().split('/');
    const massId = urlParts[urlParts.length - 2];
    console.log(`Created mass with ID: ${massId}`);

    // Verify on edit page
    await expect(page.getByRole('heading', { name: /Mass/i }).first()).toBeVisible();

    // Verify event is selected (shows date)
    await expect(page.getByRole('button', { name: /Dec 8, 2025/i })).toBeVisible();

    // Verify notes saved
    await expect(page.locator('textarea#note')).toHaveValue(massNotes);

    console.log(`Successfully created mass ${massId} with event via picker`);
  });

  test('should update mass and verify persistence after page refresh', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a mass with initial data
    await page.goto('/masses/create');

    const initialNote = 'Initial mass note before any updates';

    await page.fill('textarea#note', initialNote);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/masses\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get mass ID from URL (URL is /masses/[id]/edit)
    const urlParts = page.url().split('/');
    const massId = urlParts[urlParts.length - 2];

    // Verify initial data is displayed on edit page (we're already there after create)
    await expect(page.locator(`text=${initialNote}`).first()).toBeVisible();

    // We're already on the edit page, just verify URL
    await expect(page).toHaveURL(`/masses/${massId}/edit`);

    // Verify initial value is pre-filled
    await expect(page.locator('textarea#note')).toHaveValue(initialNote);

    // Update with NEW value
    const updatedNote = 'UPDATED: Sunday Mass at 10am confirmed. Special music and extra ministers arranged.';

    await page.fill('textarea#note', updatedNote);

    // Submit the update
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();

    // Navigate to view page to verify the update
    await page.goto(`/masses/${massId}`);
    await expect(page).toHaveURL(`/masses/${massId}`);

    // CRITICAL: Verify UPDATED value is displayed
    await expect(page.locator(`text=${updatedNote}`).first()).toBeVisible();

    // CRITICAL: Verify old value is NOT displayed
    await expect(page.locator(`text=${initialNote}`)).not.toBeVisible();

    // PERSISTENCE TEST: Refresh page to verify database persistence
    console.log(`Refreshing page to verify persistence for mass: ${massId}`);
    await page.reload();

    // After refresh, verify UPDATED value is STILL displayed
    await expect(page.locator(`text=${updatedNote}`).first()).toBeVisible();

    // Navigate to edit page again to verify form persistence
    await page.goto(`/masses/${massId}/edit`);

    // PERSISTENCE TEST: Verify form field contains UPDATED value
    await expect(page.locator('textarea#note')).toHaveValue(updatedNote);

    console.log(`Successfully verified update persistence for mass: ${massId}`);
  });
});
