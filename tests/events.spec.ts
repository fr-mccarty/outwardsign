import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * Helper function to fill in the event type create form (name and icon)
 */
async function fillEventTypeForm(page: any, pickerDialog: any, eventTypeName: string) {
  // Fill in name
  const nameInput = pickerDialog.locator('input#name');
  await nameInput.fill(eventTypeName);

  // Select an icon (required field)
  const iconSelect = pickerDialog.locator('[id="icon"]');
  await iconSelect.click();
  // Select the first option (Calendar) - use exact: true to avoid matching "Calendar Days"
  await page.getByRole('option', { name: 'Calendar', exact: true }).click();

  // Click Save button
  const saveButton = pickerDialog.getByRole('button', { name: /Save Event Type/i });
  await saveButton.click();
}

/**
 * Helper function to select or create an event type in the picker
 * This handles both the case where event types exist and where they need to be created
 */
async function selectOrCreateEventType(page: any, eventTypeName: string = 'Test Event Type') {
  const pickerDialog = page.getByTestId('event-type-picker-dialog');

  // Wait for loading to complete - look for either items or empty message
  await page.waitForTimeout(1000);

  // Check for the empty message which indicates no event types exist
  const emptyMessage = pickerDialog.locator('text=No event types yet');
  const hasEmptyMessage = await emptyMessage.count() > 0;

  if (hasEmptyMessage) {
    // No event types exist - create one
    const newButton = pickerDialog.getByRole('button', { name: /New Event type/i });
    await newButton.click();

    // Fill in the new event type form (name + icon)
    await fillEventTypeForm(page, pickerDialog, eventTypeName);
  } else {
    // Event types exist - select the first one
    // Items are buttons with class containing 'w-full text-left'
    const itemButtons = pickerDialog.locator('button.w-full.text-left');
    const itemCount = await itemButtons.count();

    if (itemCount > 0) {
      await itemButtons.first().click();
    } else {
      // Fallback: try to find any selectable item button
      const anyButton = pickerDialog.locator('button[type="button"]').filter({
        hasNotText: /New|Cancel|Save|Select from list/i
      });
      const count = await anyButton.count();
      if (count > 0) {
        await anyButton.first().click();
      } else {
        // Last resort: create a new one
        const newButton = pickerDialog.getByRole('button', { name: /New Event type/i });
        await newButton.click();
        await fillEventTypeForm(page, pickerDialog, eventTypeName);
      }
    }
  }

  // Wait for picker to close
  await expect(page.getByTestId('event-type-picker-dialog')).toBeHidden({ timeout: 5000 });
}

test.describe('Events Module - User-Defined Events', () => {
  // Enable parallel execution - tests in this file don't interfere with each other
  test.describe.configure({ mode: 'parallel' });

  test('should create an event with event type picker', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to events page
    await page.goto('/events');
    await expect(page).toHaveURL('/events');

    // Click "New Event" button
    const newEventLink = page.getByRole('link', { name: /New Event/i }).first();
    await newEventLink.click();

    // Verify we're on the create page
    await expect(page).toHaveURL('/events/create', { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.getByRole('heading', { name: 'Create Event' })).toBeVisible();

    // Fill in the event form
    const eventName = 'Parish Council Meeting';
    const eventDescription = 'Monthly parish council meeting to discuss upcoming events and initiatives.';

    // Fill in event name
    await page.fill('input#name', eventName);

    // Fill in description
    await page.fill('textarea#description', eventDescription);

    // Select event type via picker - click the trigger button
    const eventTypeTrigger = page.getByTestId('event-type-trigger');
    await eventTypeTrigger.click();

    // Wait for the picker dialog to open
    await expect(page.getByTestId('event-type-picker-dialog')).toBeVisible();

    // Select or create an event type
    await selectOrCreateEventType(page, 'Meeting');

    // Fill in start date using date picker
    const startDateButton = page.locator('button#start_date');
    await startDateButton.click();

    // Wait for calendar popover to open and select a date (click a future date)
    const calendar = page.locator('[role="grid"]');
    await expect(calendar).toBeVisible();

    // Click on a date - find a button with a day number
    const dayButton = calendar.locator('button').filter({ hasText: /^15$/ }).first();
    await dayButton.click();

    // Scroll to bottom to ensure button is visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Submit the form by clicking the submit button inside the form (at the bottom)
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should redirect to the event edit page with event_type_id in URL
    // URL pattern: /events/[event_type_id]/[event_id]/edit
    // Note: The redirect URL proves the event was created successfully in the database
    await page.waitForURL(/\/events\/[a-f0-9-]+\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });
  });

  test('should show events list page', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to events page
    await page.goto('/events');

    // Should show the page title (use heading to avoid breadcrumb conflict)
    await expect(page.getByRole('heading', { name: 'Our Events' })).toBeVisible();

    // Should have a create button
    const createButton = page.getByRole('link', { name: /New Event/i }).first();
    await expect(createButton).toBeVisible();
  });

  test('should navigate through breadcrumbs', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to create page
    await page.goto('/events/create');

    // Verify breadcrumbs
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Our Events' })).toBeVisible();

    // Click on "Our Events" breadcrumb
    await breadcrumbNav.getByRole('link', { name: 'Our Events' }).click();

    // Should navigate back to events list
    await expect(page).toHaveURL('/events');
  });

  test('should validate required fields on create', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Go to create page
    await page.goto('/events/create');

    // Try to submit without filling required fields
    await page.click('button[type="submit"]');

    // Should stay on the same page (form validation prevents submission)
    await expect(page).toHaveURL('/events/create');

    // Fill only name (missing event type which is required)
    await page.fill('input#name', 'Test Event');
    await page.click('button[type="submit"]');

    // Should still stay on the same page since event_type is required
    await expect(page).toHaveURL('/events/create');
  });

  test('should create event with minimal data', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to create page
    await page.goto('/events/create');

    // Fill in minimal data
    const eventName = 'Quick Test Event';
    await page.fill('input#name', eventName);

    // Select event type via picker
    const eventTypeTrigger = page.getByTestId('event-type-trigger');
    await eventTypeTrigger.click();
    await expect(page.getByTestId('event-type-picker-dialog')).toBeVisible();

    // Select or create an event type
    await selectOrCreateEventType(page, 'General Event');

    // Submit the form
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should redirect to edit page with pattern /events/[event_type_id]/[event_id]/edit
    // This proves the event was created successfully
    await page.waitForURL(/\/events\/[a-f0-9-]+\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });
  });

  test('should show events in list after creation', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create an event first
    await page.goto('/events/create');

    const uniqueName = `List Test Event ${Date.now()}`;
    await page.fill('input#name', uniqueName);

    // Select event type
    const eventTypeTrigger = page.getByTestId('event-type-trigger');
    await eventTypeTrigger.click();
    await expect(page.getByTestId('event-type-picker-dialog')).toBeVisible();

    // Select or create an event type
    await selectOrCreateEventType(page, 'Test Event Type');

    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Wait for navigation to complete (proves event was created)
    await page.waitForURL(/\/events\/[a-f0-9-]+\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Go to events list
    await page.goto('/events');

    // Verify event is visible
    await expect(page.locator(`text=${uniqueName}`)).toBeVisible();
  });
});
