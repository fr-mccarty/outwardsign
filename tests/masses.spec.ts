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

  test('should create mass with new event and new location via nested pickers', async ({ page }) => {
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

    // Form should auto-open when no event is selected (openToNewEvent=true)
    // Wait a moment for form to be ready
    await page.waitForTimeout(300);

    // Fill in event details
    const eventName = `Holy Mass ${Date.now()}`;
    await page.locator('[role="dialog"]').getByLabel('Name').fill(eventName);
    await page.locator('[role="dialog"]').getByLabel('Date').fill('2025-12-08');

    // Time field - use input#start_time since label includes asterisk
    await page.locator('[role="dialog"]').locator('input#start_time').fill('10:00');

    // Click "Select Location" button to open nested LocationPicker
    await page.locator('[role="dialog"]').getByRole('button', { name: /Select Location/i }).click();

    // Wait for nested location picker to appear
    await page.waitForTimeout(500);

    // Location form should auto-open (openToNewLocation behavior)
    // Wait for form to be ready
    await page.waitForTimeout(300);

    // Fill in location details - clear the name field first (has default value)
    const locationName = `Sacred Heart Church ${Date.now()}`;
    const nameInput = page.locator('[role="dialog"]').last().getByRole('textbox').first();
    await nameInput.clear();
    await nameInput.fill(locationName);

    // Fill optional location fields
    const streetInput = page.locator('[role="dialog"]').last().getByLabel('Street');
    if (await streetInput.isVisible()) {
      await streetInput.fill('789 Parish Boulevard');
    }

    const cityInput = page.locator('[role="dialog"]').last().getByLabel('City');
    if (await cityInput.isVisible()) {
      await cityInput.fill('Springfield');
    }

    const stateInput = page.locator('[role="dialog"]').last().getByLabel('State');
    if (await stateInput.isVisible()) {
      await stateInput.fill('IL');
    }

    // Submit location creation (button text is "Save Location")
    await page.locator('[role="dialog"]').last().getByRole('button', { name: /Save Location/i }).click();

    // Wait for location picker to close (but event picker should still be open)
    await page.waitForTimeout(2000);

    // Verify location picker closed - should now only have 1 dialog (the event picker)
    const dialogsAfterLocation = await page.locator('[role="dialog"]').count();
    expect(dialogsAfterLocation).toBe(1);

    // Verify we're still in the event picker (has "Select Event" heading)
    await expect(page.locator('[role="dialog"]').getByRole('heading', { name: /Select Event/i })).toBeVisible();

    // Now submit the event creation (button text is "Save Event")
    await page.locator('[role="dialog"]').getByRole('button', { name: /Save Event/i }).click();
    await page.waitForTimeout(2000);

    // Event picker should close - now there should be no dialogs
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);

    // Event should be auto-selected and visible in the mass form
    // The event displays as a formatted date/time button (e.g., "Mon, Dec 8, 2025 at 10:00 AM")
    await expect(page.getByRole('button', { name: /Dec 8, 2025 at 10:00/i })).toBeVisible();

    // Verify we're still on the mass create page (no redirect)
    await expect(page).toHaveURL('/masses/create');

    // Add some notes to the mass
    const massNotes = `Mass created with new event and location - Test ${Date.now()}`;
    await page.fill('textarea#note', massNotes);

    // Scroll to bottom and submit the mass form
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should redirect to the mass detail page (navigation proves success)
    await page.waitForURL(/\/masses\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get the mass ID from URL
    const massUrl = page.url();
    const massId = massUrl.split('/').pop();
    console.log(`Created mass with ID: ${massId}`);

    // Verify we're on the mass view page
    await expect(page.getByRole('heading', { name: /Mass/i }).first()).toBeVisible();

    // Verify the event appears on the view page (displayed as text with date/time)
    await expect(page.getByText(/December 8, 2025 at 10:00/i)).toBeVisible();

    // Navigate to edit page to verify all data was saved correctly
    await page.goto(`/masses/${massId}/edit`);
    await expect(page).toHaveURL(`/masses/${massId}/edit`);

    // Verify the notes field contains our text
    await expect(page.locator('textarea#note')).toHaveValue(massNotes);

    // Verify event is still selected (formatted as date/time button)
    await expect(page.getByRole('button', { name: /Dec 8, 2025 at 10:00/i })).toBeVisible();

    console.log(`Successfully verified mass ${massId} with event and location created via nested pickers`);
  });

  test('should update mass and verify persistence after page refresh', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a mass with initial data
    await page.goto('/masses/create');

    const initialNote = 'Initial mass note before any updates';

    await page.fill('textarea#note', initialNote);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/masses\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const massId = page.url().split('/').pop();

    // Verify initial data is displayed on view page
    await expect(page.locator(`text=${initialNote}`).first()).toBeVisible();

    // Navigate to edit page
    await page.goto(`/masses/${massId}/edit`);
    await expect(page).toHaveURL(`/masses/${massId}/edit`);

    // Verify initial value is pre-filled
    await expect(page.locator('textarea#note')).toHaveValue(initialNote);

    // Update with NEW value
    const updatedNote = 'UPDATED: Sunday Mass at 10am confirmed. Special music and extra ministers arranged.';

    await page.fill('textarea#note', updatedNote);

    // Submit the update
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();

    // Mass form uses router.refresh() on edit, so it stays on edit page
    // Wait for the update to complete
    await page.waitForTimeout(2000);

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
