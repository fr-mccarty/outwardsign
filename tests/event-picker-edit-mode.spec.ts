import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

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
    await eventDialog.getByLabel('Date').fill('2025-12-25');
    await eventDialog.locator('input#start_time').fill('14:00');

    // Submit the event creation
    await eventDialog.getByRole('button', { name: /Save Event/i }).click();

    // Wait for dialog to close
    await expect(eventDialog).not.toBeVisible({ timeout: 5000 });

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
    await eventDialog.getByLabel('Date').fill('2025-06-15');
    await eventDialog.locator('input#start_time').fill('10:30');

    await eventDialog.getByRole('button', { name: /Save Event/i }).click();
    await expect(eventDialog).not.toBeVisible({ timeout: 5000 });

    // **THE KEY CHECK**: The selected value should display the event NAME, not just date/time
    const selectedValue = page.getByTestId('wedding-ceremony-selected-value');
    await expect(selectedValue).toBeVisible();

    // The selected value should contain the event name
    await expect(selectedValue).toContainText(eventName);
  });
});
