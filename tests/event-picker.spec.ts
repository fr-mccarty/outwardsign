import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Event Picker Component', () => {
  test('should create event with existing location using nested location picker', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // First, create a test location to use
    await page.goto('/locations/create');
    await page.getByLabel('Name').fill('St. Mary Cathedral');
    await page.getByLabel('Street').fill('123 Church Street');
    await page.getByLabel('City').fill('Springfield');
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/locations\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Now go to wedding form to test event picker
    await page.goto('/weddings/create');
    await expect(page).toHaveURL('/weddings/create');

    // Open the Wedding Ceremony picker
    await page.getByRole('button', { name: 'Add Wedding Ceremony' }).click();

    // Wait for Event Picker dialog
    const eventDialog = page.getByTestId('event-picker-dialog');
    await eventDialog.waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(eventDialog.getByRole('heading', { name: /Select Event/i })).toBeVisible();

    // Form should auto-open when no event is selected (openToNewEvent=true)
    // Wait a moment for form to be ready
    await page.waitForTimeout(300);

    // Fill in event details
    await eventDialog.getByLabel('Name').fill('Wedding Ceremony');
    await eventDialog.getByLabel('Date').fill('2025-12-25');
    // Time field - use input#start_time since label includes asterisk
    await eventDialog.locator('input#start_time').fill('14:00');

    // Click "Select Location" button to open nested LocationPicker
    await eventDialog.getByRole('button', { name: /Select Location/i }).click();

    // Wait for the nested location picker dialog to appear
    const locationDialog = page.getByTestId('location-picker-dialog');
    await locationDialog.waitFor({ state: 'visible', timeout: 5000 });

    // Location picker auto-opens creation form when no location is selected
    // We need to cancel this and use the search instead
    await locationDialog.getByRole('button', { name: /Cancel/i }).waitFor({ state: 'visible', timeout: 5000 });
    await locationDialog.getByRole('button', { name: /Cancel/i }).click();
    await page.waitForTimeout(300);

    // Now we should see the search interface
    await locationDialog.getByPlaceholder(/Search/i).fill('St. Mary');
    await page.waitForTimeout(500);

    // Click on the location
    await locationDialog.getByRole('button', { name: /St. Mary Cathedral/i }).click();

    // Wait for location picker to close
    await page.waitForTimeout(500);

    // Verify location is selected in the event form
    await expect(eventDialog.getByTestId('event-location-selected')).toBeVisible();
    await expect(eventDialog.getByTestId('event-location-selected')).toContainText('St. Mary Cathedral');

    // Submit the event creation (button text is "Save Event")
    await eventDialog.getByRole('button', { name: /Save Event/i }).click();

    // Wait for event picker to close and event to be selected
    await page.waitForTimeout(1500);

    // Event picker dialog should close
    await expect(eventDialog).not.toBeVisible({ timeout: 5000 });

    // Verify the event is selected
    await expect(page.getByTestId('wedding-ceremony-selected-value')).toBeVisible();
  });

  test('should create event and location inline via nested pickers', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/weddings/create');
    await expect(page).toHaveURL('/weddings/create');

    // Open the Wedding Ceremony picker
    await page.getByRole('button', { name: 'Add Wedding Ceremony' }).click();

    // Wait for Event Picker dialog
    const eventDialog = page.getByTestId('event-picker-dialog');
    await eventDialog.waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Form should auto-open when no event is selected (openToNewEvent=true)
    // Wait a moment for form to be ready
    await page.waitForTimeout(300);

    // Fill in event details
    const eventName = `TestEvent${Date.now()}`;
    await eventDialog.getByLabel('Name').fill(eventName);
    await eventDialog.getByLabel('Date').fill('2025-06-15');
    // Time field - use input#start_time since label includes asterisk
    await eventDialog.locator('input#start_time').fill('10:30');

    // Open nested LocationPicker
    await eventDialog.getByRole('button', { name: /Select Location/i }).click();

    const locationDialog = page.getByTestId('location-picker-dialog');
    await locationDialog.waitFor({ state: 'visible', timeout: 5000 });

    // Click "Add New Location" to open the creation form
    await locationDialog.getByRole('button', { name: /Add New Location/i }).click();

    // Wait for the form to be visible
    await locationDialog.getByRole('button', { name: /Save Location/i }).waitFor({ state: 'visible', timeout: 5000 });

    // Find and fill the name input (first text input in the form)
    const locationNameInput = locationDialog.locator('input[type="text"]').first();
    await locationNameInput.fill('InlineTestChurch');

    // Submit location creation (button text is "Save Location")
    await locationDialog.getByRole('button', { name: /Save Location/i }).click();

    // Wait for location dialog to close (indicates successful creation and selection)
    await expect(locationDialog).not.toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(500);

    // Location should be auto-selected in event form
    await expect(eventDialog.getByTestId('event-location-selected')).toBeVisible();
    await expect(eventDialog.getByTestId('event-location-selected')).toContainText('InlineTestChurch');

    // Now submit the event creation (button text is "Save Event")
    await eventDialog.getByRole('button', { name: /Save Event/i }).click();
    await page.waitForTimeout(1500);

    // Event picker should close and event should be selected
    await expect(eventDialog).not.toBeVisible({ timeout: 5000 });

    // Verify event is selected by checking the wedding ceremony field shows a selected value
    await expect(page.getByTestId('wedding-ceremony-selected-value')).toBeVisible();
  });

  test('should preserve wedding form context when using nested pickers', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/weddings/create');

    // Fill in some wedding form data first
    await page.locator('#status').click();
    await page.getByRole('option', { name: 'Active' }).first().click();

    await page.fill('textarea#notes', 'Important notes that should not be lost');

    // Now open event picker
    await page.getByRole('button', { name: 'Add Wedding Ceremony' }).click();

    const eventDialog = page.getByTestId('event-picker-dialog');
    await eventDialog.waitFor({ state: 'visible' });

    // Form should auto-open when no event is selected (openToNewEvent=true)
    // Wait a moment for form to be ready
    await page.waitForTimeout(300);

    // Fill event
    await eventDialog.getByLabel('Name').fill('PreserveContextEvent');
    await eventDialog.getByLabel('Date').fill('2025-08-20');
    // Time field - use input#start_time since label includes asterisk
    await eventDialog.locator('input#start_time').fill('15:00');

    // Open nested location picker and create location
    await eventDialog.getByRole('button', { name: /Select Location/i }).click();

    const locationDialog = page.getByTestId('location-picker-dialog');
    await locationDialog.waitFor({ state: 'visible', timeout: 5000 });

    // Click "Add New Location" to open the creation form
    await locationDialog.getByRole('button', { name: /Add New Location/i }).click();

    // Wait for the form to be visible
    await locationDialog.getByRole('button', { name: /Save Location/i }).waitFor({ state: 'visible', timeout: 5000 });

    // Find and fill the name input (first text input in the form)
    const locationNameInput = locationDialog.locator('input[type="text"]').first();
    await locationNameInput.fill('ContextTestLocation');
    // Submit location creation (button text is "Save Location")
    await locationDialog.getByRole('button', { name: /Save Location/i }).click();
    await page.waitForTimeout(1000);

    // Submit event (button text is "Save Event")
    await eventDialog.getByRole('button', { name: /Save Event/i }).click();
    await page.waitForTimeout(1500);

    // Verify we're still on wedding create page (no navigation)
    await expect(page).toHaveURL('/weddings/create');

    // Verify original form data is preserved
    await expect(page.locator('textarea#notes')).toHaveValue('Important notes that should not be lost');

    // And the event is selected - check that the wedding ceremony field shows a selected value
    await expect(page.getByTestId('wedding-ceremony-selected-value')).toBeVisible();
  });

  test('should allow selecting existing location in event creation', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Create a location first
    await page.goto('/locations/create');
    await page.getByLabel('Name').fill('Blessed Sacrament Church');
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/locations\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Go to wedding form
    await page.goto('/weddings/create');

    // Open event picker
    await page.getByRole('button', { name: 'Add Wedding Ceremony' }).click();

    const eventDialog = page.getByTestId('event-picker-dialog');
    await eventDialog.waitFor({ state: 'visible' });

    // Form should auto-open when no event is selected (openToNewEvent=true)
    // Wait a moment for form to be ready
    await page.waitForTimeout(300);

    // Fill event
    await eventDialog.getByLabel('Name').fill('Saturday Evening Mass');
    await eventDialog.getByLabel('Date').fill('2025-11-01');
    // Time field - use input#start_time since label includes asterisk
    await eventDialog.locator('input#start_time').fill('17:30');

    // Open location picker
    await eventDialog.getByRole('button', { name: /Select Location/i }).click();
    await page.waitForTimeout(500);

    const locationDialog = page.getByTestId('location-picker-dialog');
    await locationDialog.waitFor({ state: 'visible', timeout: 5000 });

    // Location picker auto-opens creation form when no location is selected
    // We need to cancel this and use the search instead
    // Wait for the Cancel button to be visible
    await locationDialog.getByRole('button', { name: /Cancel/i }).waitFor({ state: 'visible', timeout: 5000 });
    await locationDialog.getByRole('button', { name: /Cancel/i }).click();
    await page.waitForTimeout(300);

    // Search and select existing location
    await locationDialog.getByPlaceholder(/Search/i).fill('Blessed');
    await page.waitForTimeout(500);
    await locationDialog.getByRole('button', { name: /Blessed Sacrament/i }).click();
    await page.waitForTimeout(500);

    // Verify location is selected in event form
    await expect(eventDialog.getByTestId('event-location-selected')).toBeVisible();
    await expect(eventDialog.getByTestId('event-location-selected')).toContainText('Blessed Sacrament Church');

    // Submit event (button text is "Save Event")
    await eventDialog.getByRole('button', { name: /Save Event/i }).click();
    await page.waitForTimeout(1500);

    // Verify event is selected - check that the wedding ceremony field shows a selected value
    await expect(page.getByTestId('wedding-ceremony-selected-value')).toBeVisible();
  });

  test('should show validation error when creating event without required fields', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/weddings/create');

    // Open event picker
    await page.getByRole('button', { name: 'Add Wedding Ceremony' }).click();

    const eventDialog = page.getByTestId('event-picker-dialog');
    await eventDialog.waitFor({ state: 'visible' });

    // Form should auto-open when no event is selected (openToNewEvent=true)
    // Wait a moment for form to be ready
    await page.waitForTimeout(300);

    // Try to submit without filling required fields (button text is "Save Event")
    await eventDialog.getByRole('button', { name: /Save Event/i }).click();

    // Dialog should stay open (validation failed)
    await page.waitForTimeout(500);
    await expect(eventDialog).toBeVisible();

    // Now fill required fields
    await eventDialog.getByLabel('Name').fill('ValidEvent');
    await eventDialog.getByLabel('Date').fill('2025-09-10');
    // Time field - use input#start_time since label includes asterisk
    await eventDialog.locator('input#start_time').fill('12:00');

    // Submit should work now (button text is "Save Event")
    await eventDialog.getByRole('button', { name: /Save Event/i }).click();

    // Dialog should close and event should be selected
    await expect(eventDialog).not.toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('wedding-ceremony-selected-value')).toBeVisible();
  });
});
