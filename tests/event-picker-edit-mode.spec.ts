import { test, expect, Locator } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * Helper function to select a date in a DatePickerField within a specific dialog context
 * Opens the calendar popover and clicks on an available date
 */
async function selectDateInPicker(dialogLocator: Locator, dateButtonId: string) {
  const page = dialogLocator.page();

  // Click the date picker button to open calendar using ID
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

test.describe('Event Picker Edit Mode', () => {
  test('should show event name in form when editing existing event', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Step 1: Create a wedding with an event
    await page.goto('/weddings/create');
    await expect(page).toHaveURL('/weddings/create');

    // Open the Wedding Ceremony picker
    await page.getByRole('button', { name: 'Add Wedding Ceremony' }).click();

    // Wait for Event Picker dialog
    const eventDialog = page.getByTestId('event-picker-dialog');
    await eventDialog.waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Fill in event details with a specific name
    const eventName = 'Test Wedding Event Name';
    await eventDialog.getByLabel('Name').fill(eventName);
    await selectDateInPicker(eventDialog, 'start_date');
    await selectTimeInPicker(eventDialog, 'start_time', '14:00');

    // Submit the event creation
    await eventDialog.getByRole('button', { name: /Save Event/i }).click();

    // Wait for dialog to close
    await expect(eventDialog).not.toBeVisible({ timeout: TEST_TIMEOUTS.TOAST });

    // Verify the event is selected - check the selected value displays
    const selectedValue = page.getByTestId('wedding-ceremony-selected-value');
    await expect(selectedValue).toBeVisible();

    // Step 2: Click on the selected event to open edit mode
    await selectedValue.click();

    // Wait for Event Picker dialog to open again (in edit mode)
    await eventDialog.waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // **THE KEY CHECK**: The Name field should be pre-populated with the event name
    const nameInput = eventDialog.getByLabel('Name');
    await expect(nameInput).toHaveValue(eventName);

    // Also verify the dialog shows we're in edit mode (Update button instead of Save)
    await expect(eventDialog.getByRole('button', { name: /Update Event/i })).toBeVisible();
  });

  test('should display event name in selected field (not just date/time)', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/weddings/create');

    // Open the Wedding Ceremony picker
    await page.getByRole('button', { name: 'Add Wedding Ceremony' }).click();

    const eventDialog = page.getByTestId('event-picker-dialog');
    await eventDialog.waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Create an event with a specific name
    const eventName = 'Smith-Jones Wedding Ceremony';
    await eventDialog.getByLabel('Name').fill(eventName);
    await selectDateInPicker(eventDialog, 'start_date');
    await selectTimeInPicker(eventDialog, 'start_time', '10:30');

    await eventDialog.getByRole('button', { name: /Save Event/i }).click();
    await expect(eventDialog).not.toBeVisible({ timeout: TEST_TIMEOUTS.TOAST });

    // **THE KEY CHECK**: The selected value should display the event NAME, not just date/time
    const selectedValue = page.getByTestId('wedding-ceremony-selected-value');
    await expect(selectedValue).toBeVisible();

    // The selected value should contain the event name
    await expect(selectedValue).toContainText(eventName);
  });
});
