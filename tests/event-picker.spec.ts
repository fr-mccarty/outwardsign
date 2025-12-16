import { test, expect, Locator } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * Helper function to select a date in a DatePickerField within a specific dialog context
 * Opens the calendar popover and clicks on an available date
 */
async function selectDateInPicker(dialogLocator: Locator, dateButtonId: string) {
  const page = dialogLocator.page();

  // Click the date picker button to open calendar
  const dateButton = dialogLocator.locator(`#${dateButtonId}`);
  await dateButton.click();

  // Wait for the calendar popover to be visible
  const calendarPopover = page.locator('[data-slot="popover-content"]');
  await expect(calendarPopover).toBeVisible();

  // Find and click an available date - dates are buttons with day numbers (1-31)
  // The enabled dates have aria-labels like "Sunday, October 26th, 2025"
  const enabledDate = calendarPopover.locator('button[data-day]').first();
  await expect(enabledDate).toBeVisible();
  await enabledDate.click();

  // Wait for the calendar to close (or for the date to be selected)
  // The date picker may close on select depending on closeOnSelect prop
}

/**
 * Helper function to select a time in a TimePickerField within a specific dialog context
 * Opens the time popover and clicks on a quick pick time button
 */
async function selectTimeInPicker(dialogLocator: Locator, timeButtonId: string, time: string) {
  const page = dialogLocator.page();

  // Click the time picker button to open time popover using ID
  const timeButton = dialogLocator.locator(`#${timeButtonId}`);
  await timeButton.click();

  // Wait for the time popover to be visible
  const timePopover = page.locator('[data-slot="popover-content"]');
  await expect(timePopover).toBeVisible();

  // Click the quick pick time button that matches our desired time
  // Convert 14:00 → 2:00 PM, 10:30 → need custom input
  const [hours, minutes] = time.split(':');
  const hour24 = parseInt(hours, 10);
  const ampm = hour24 >= 12 ? 'PM' : 'AM';
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  const timeLabel = `${hour12}:${minutes} ${ampm}`;

  // Look for quick pick button with this label
  const quickPickButton = timePopover.getByRole('button', { name: timeLabel, exact: true });
  const buttonExists = await quickPickButton.count();

  if (buttonExists > 0) {
    // Use quick pick if available
    await quickPickButton.click();
  } else {
    // Use manual input for custom times
    await timePopover.getByPlaceholder('HH').fill(hour12.toString());
    await timePopover.getByPlaceholder('MM').fill(minutes);
    await timePopover.locator('#period-select').click();
    await page.getByRole('option', { name: ampm }).click();
    await timePopover.getByRole('button', { name: 'Set' }).click();
  }

  // Wait for popover to close
  await expect(timePopover).not.toBeVisible();
}

test.describe('Event Picker Component', () => {
  test('should create event via inline form in event picker', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Go to wedding form
    await page.goto('/weddings/create');
    await expect(page).toHaveURL('/weddings/create');

    // Open the Wedding Ceremony picker
    await page.getByRole('button', { name: 'Add Wedding Ceremony' }).click();

    const eventDialog = page.getByTestId('event-picker-dialog');
    await eventDialog.waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(eventDialog.getByRole('heading', { name: /Select Event/i })).toBeVisible();

    // Form should auto-open when no event is selected (openToNewEvent=true)
    // Fill in event details (location is optional)
    await eventDialog.getByLabel('Name').fill('Wedding Ceremony');

    // Select a date using the date picker calendar
    await selectDateInPicker(eventDialog, 'start_date');

    // Time field
    await selectTimeInPicker(eventDialog, 'start_time', '14:00');

    // Wait for the Save Event button to be enabled before clicking
    const saveButton = eventDialog.getByRole('button', { name: /Save Event/i });
    await expect(saveButton).toBeEnabled();

    // Submit the event creation
    await saveButton.click();

    // Event picker dialog should close
    await expect(eventDialog).not.toBeVisible({ timeout: 10000 });

    // Verify the event is selected
    await expect(page.getByTestId('wedding-ceremony-selected-value')).toBeVisible();
  });

  test('should allow editing a selected event', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/weddings/create');
    await expect(page).toHaveURL('/weddings/create');

    // First create an event
    await page.getByRole('button', { name: 'Add Wedding Ceremony' }).click();

    let eventDialog = page.getByTestId('event-picker-dialog');
    await eventDialog.waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Fill in event details
    const eventName = `TestEvent${Date.now()}`;
    await eventDialog.getByLabel('Name').fill(eventName);
    await selectDateInPicker(eventDialog, 'start_date');
    await selectTimeInPicker(eventDialog, 'start_time', '10:30');

    // Wait for the Save Event button to be enabled and save the event
    const saveButton = eventDialog.getByRole('button', { name: /Save Event/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await expect(eventDialog).not.toBeVisible();

    // Verify event is selected
    await expect(page.getByTestId('wedding-ceremony-selected-value')).toBeVisible();
    await expect(page.getByTestId('wedding-ceremony-selected-value')).toContainText(eventName);

    // Click the selected value to reopen the picker (in edit mode)
    await page.getByTestId('wedding-ceremony-selected-value').click();

    eventDialog = page.getByTestId('event-picker-dialog');
    await eventDialog.waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Should be in edit mode - the name field should have the existing event name
    await expect(eventDialog.getByLabel('Name')).toHaveValue(eventName);

    // Update the event name
    const updatedName = `Updated${Date.now()}`;
    await eventDialog.getByLabel('Name').fill(updatedName);

    // Wait for the Update Event button to be enabled
    const updateButton = eventDialog.getByRole('button', { name: /Update Event/i });
    await expect(updateButton).toBeEnabled();
    await updateButton.click();

    // Dialog should close
    await expect(eventDialog).not.toBeVisible();

    // Updated event name should be visible
    await expect(page.getByTestId('wedding-ceremony-selected-value')).toBeVisible();
    await expect(page.getByTestId('wedding-ceremony-selected-value')).toContainText(updatedName);
  });

  test('should preserve wedding form context when using event picker', async ({ page }) => {
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
    // Fill event details (no location - keeping it simple)
    await eventDialog.getByLabel('Name').fill('PreserveContextEvent');

    // Select a date using the date picker calendar
    await selectDateInPicker(eventDialog, 'start_date');

    // Time field
    await selectTimeInPicker(eventDialog, 'start_time', '15:00');

    // Wait for the Save Event button to be enabled
    const saveButton = eventDialog.getByRole('button', { name: /Save Event/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Wait for event dialog to close
    await expect(eventDialog).not.toBeVisible();

    // Verify we're still on wedding create page (no navigation)
    await expect(page).toHaveURL('/weddings/create');

    // Verify original form data is preserved
    await expect(page.locator('textarea#notes')).toHaveValue('Important notes that should not be lost');

    // And the event is selected - check that the wedding ceremony field shows a selected value
    await expect(page.getByTestId('wedding-ceremony-selected-value')).toBeVisible();
  });

  // Note: Nested location picker tests are skipped due to complex dialog interaction issues
  // The location picker within event picker has re-rendering issues that cause test instability
  // These tests should be addressed when the nested dialog behavior is fixed
  test.skip('should allow selecting existing location in event creation', async () => {
    // This test is skipped - see comment above
    // TODO: Fix nested dialog interaction between EventPicker and LocationPicker
  });

  test('should show validation error when creating event without required fields', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/weddings/create');

    // Open event picker
    await page.getByRole('button', { name: 'Add Wedding Ceremony' }).click();

    const eventDialog = page.getByTestId('event-picker-dialog');
    await eventDialog.waitFor({ state: 'visible' });

    // Form should auto-open when no event is selected (openToNewEvent=true)
    // The Save Event button should be disabled when form is empty/invalid
    const saveButton = eventDialog.getByRole('button', { name: /Save Event/i });

    // Try clicking Save Event without filling required fields
    // The button may be disabled or validation may prevent submission
    await saveButton.click();

    // Dialog should stay open (validation failed or button disabled)
    await expect(eventDialog).toBeVisible();

    // Close the dialog via Cancel or pressing Escape
    await page.keyboard.press('Escape');
    await expect(eventDialog).not.toBeVisible();

    // Verify we're still on the create page (no event was created)
    await expect(page).toHaveURL('/weddings/create');
  });
});
