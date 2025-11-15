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
    await page.getByRole('button', { name: /Create Location/i }).last().click();
    await page.waitForURL(/\/locations\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Now go to wedding form to test event picker
    await page.goto('/weddings/create');
    await expect(page).toHaveURL('/weddings/create');

    // Open the Wedding Ceremony picker
    await page.getByRole('button', { name: 'Add Wedding Ceremony' }).click();

    // Wait for Event Picker dialog
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.locator('[role="dialog"]').getByRole('heading', { name: /Select Event/i })).toBeVisible();

    // Form should auto-open when no event is selected (openToNewEvent=true)
    // Wait a moment for form to be ready
    await page.waitForTimeout(300);

    // Fill in event details
    await page.locator('[role="dialog"]').getByLabel('Name').fill('Wedding Ceremony');
    await page.locator('[role="dialog"]').getByLabel('Date').fill('2025-12-25');
    // Time field - use input#start_time since label includes asterisk
    await page.locator('[role="dialog"]').locator('input#start_time').fill('14:00');

    // Click "Select Location" button to open nested LocationPicker
    await page.locator('[role="dialog"]').getByRole('button', { name: /Select Location/i }).click();

    // Wait for the nested location picker dialog to appear
    await page.waitForTimeout(500);

    // Location picker auto-opens creation form when no location is selected
    // We need to cancel this and use the search instead
    await page.locator('[role="dialog"]').last().getByRole('button', { name: /Cancel/i }).click();
    await page.waitForTimeout(300);

    // Now we should see the search interface
    await page.locator('[role="dialog"]').last().getByPlaceholder(/Search/i).fill('St. Mary');
    await page.waitForTimeout(500);

    // Click on the location
    await page.locator('[role="dialog"]').last().getByRole('button', { name: /St. Mary Cathedral/i }).click();

    // Wait for location picker to close
    await page.waitForTimeout(500);

    // Verify location is selected in the event form (should show location name)
    await expect(page.locator('[role="dialog"]').getByText('St. Mary Cathedral')).toBeVisible();

    // Submit the event creation (button text is "Save Event")
    await page.locator('[role="dialog"]').getByRole('button', { name: /Save Event/i }).click();

    // Wait for event picker to close and event to be selected
    await page.waitForTimeout(1500);

    // Event picker dialog should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });

    // Verify the event is selected (should show event name and details)
    await expect(page.locator('text=Wedding Ceremony')).toBeVisible();
  });

  test('should create event and location inline via nested pickers', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/weddings/create');
    await expect(page).toHaveURL('/weddings/create');

    // Open the Wedding Ceremony picker
    await page.getByRole('button', { name: 'Add Wedding Ceremony' }).click();

    // Wait for Event Picker dialog
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Form should auto-open when no event is selected (openToNewEvent=true)
    // Wait a moment for form to be ready
    await page.waitForTimeout(300);

    // Fill in event details
    const eventName = `TestEvent${Date.now()}`;
    await page.locator('[role="dialog"]').getByLabel('Name').fill(eventName);
    await page.locator('[role="dialog"]').getByLabel('Date').fill('2025-06-15');
    // Time field - use input#start_time since label includes asterisk
    await page.locator('[role="dialog"]').locator('input#start_time').fill('10:30');

    // Open nested LocationPicker
    await page.locator('[role="dialog"]').getByRole('button', { name: /Select Location/i }).click();
    await page.waitForTimeout(500);

    // Location picker auto-opens creation form when no location is selected
    // The form is already displayed, so we can fill it directly
    await page.waitForTimeout(300);

    // Fill in location details in the auto-opened form
    const locationName = `TestChurch${Date.now()}`;

    // Wait a bit more for the location form to be fully ready
    await page.waitForTimeout(500);

    // Clear and fill the name field (has default value "St. Mary's Church")
    const locationNameInput = page.locator('[role="dialog"]').last().locator('input').first();
    await locationNameInput.click();
    await locationNameInput.clear();
    await locationNameInput.fill(locationName);

    // Fill optional fields if visible
    const streetInput = page.locator('[role="dialog"]').last().getByLabel('Street');
    if (await streetInput.isVisible()) {
      await streetInput.fill('456 Test Ave');
    }

    const cityInput = page.locator('[role="dialog"]').last().getByLabel('City');
    if (await cityInput.isVisible()) {
      await cityInput.fill('TestCity');
    }

    // Submit location creation (button text is "Save Location")
    await page.locator('[role="dialog"]').last().getByRole('button', { name: /Save Location/i }).click();
    await page.waitForTimeout(1000);

    // Location should be auto-selected in event form
    await expect(page.locator('[role="dialog"]').getByText(locationName)).toBeVisible();

    // Now submit the event creation (button text is "Save Event")
    await page.locator('[role="dialog"]').getByRole('button', { name: /Save Event/i }).click();
    await page.waitForTimeout(1500);

    // Event picker should close and event should be selected
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator(`text=${eventName}`)).toBeVisible();
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
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    // Form should auto-open when no event is selected (openToNewEvent=true)
    // Wait a moment for form to be ready
    await page.waitForTimeout(300);

    // Fill event
    await page.locator('[role="dialog"]').getByLabel('Name').fill('PreserveContextEvent');
    await page.locator('[role="dialog"]').getByLabel('Date').fill('2025-08-20');
    // Time field - use input#start_time since label includes asterisk
    await page.locator('[role="dialog"]').locator('input#start_time').fill('15:00');

    // Open nested location picker and create location
    await page.locator('[role="dialog"]').getByRole('button', { name: /Select Location/i }).click();
    await page.waitForTimeout(500);

    // Location picker auto-opens creation form when no location is selected
    await page.waitForTimeout(300);

    // Fill in location details in the auto-opened form
    // Wait for form to be fully ready
    await page.waitForTimeout(500);

    // Clear and fill the name field (has default value "St. Mary's Church")
    const locationNameInput = page.locator('[role="dialog"]').last().locator('input').first();
    await locationNameInput.click();
    await locationNameInput.clear();
    await locationNameInput.fill('ContextTestLocation');
    // Submit location creation (button text is "Save Location")
    await page.locator('[role="dialog"]').last().getByRole('button', { name: /Save Location/i }).click();
    await page.waitForTimeout(1000);

    // Submit event (button text is "Save Event")
    await page.locator('[role="dialog"]').getByRole('button', { name: /Save Event/i }).click();
    await page.waitForTimeout(1500);

    // Verify we're still on wedding create page (no navigation)
    await expect(page).toHaveURL('/weddings/create');

    // Verify original form data is preserved
    await expect(page.locator('textarea#notes')).toHaveValue('Important notes that should not be lost');

    // And the event is selected
    await expect(page.locator('text=PreserveContextEvent')).toBeVisible();
  });

  test('should allow selecting existing location in event creation', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Create a location first
    await page.goto('/locations/create');
    await page.getByLabel('Name').fill('Blessed Sacrament Church');
    await page.getByRole('button', { name: /Create Location/i }).last().click();
    await page.waitForURL(/\/locations\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Go to wedding form
    await page.goto('/weddings/create');

    // Open event picker
    await page.getByRole('button', { name: 'Add Wedding Ceremony' }).click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    // Form should auto-open when no event is selected (openToNewEvent=true)
    // Wait a moment for form to be ready
    await page.waitForTimeout(300);

    // Fill event
    await page.locator('[role="dialog"]').getByLabel('Name').fill('Saturday Evening Mass');
    await page.locator('[role="dialog"]').getByLabel('Date').fill('2025-11-01');
    // Time field - use input#start_time since label includes asterisk
    await page.locator('[role="dialog"]').locator('input#start_time').fill('17:30');

    // Open location picker
    await page.locator('[role="dialog"]').getByRole('button', { name: /Select Location/i }).click();
    await page.waitForTimeout(500);

    // Location picker auto-opens creation form when no location is selected
    // We need to cancel this and use the search instead
    await page.locator('[role="dialog"]').last().getByRole('button', { name: /Cancel/i }).click();
    await page.waitForTimeout(300);

    // Search and select existing location
    await page.locator('[role="dialog"]').last().getByPlaceholder(/Search/i).fill('Blessed');
    await page.waitForTimeout(500);
    await page.locator('[role="dialog"]').last().getByRole('button', { name: /Blessed Sacrament/i }).click();
    await page.waitForTimeout(500);

    // Verify location is selected
    await expect(page.locator('[role="dialog"]').getByText('Blessed Sacrament Church')).toBeVisible();

    // Submit event (button text is "Save Event")
    await page.locator('[role="dialog"]').getByRole('button', { name: /Save Event/i }).click();
    await page.waitForTimeout(1500);

    // Verify event is selected
    await expect(page.locator('text=Saturday Evening Mass')).toBeVisible();
  });

  test('should show validation error when creating event without required fields', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/weddings/create');

    // Open event picker
    await page.getByRole('button', { name: 'Add Wedding Ceremony' }).click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    // Form should auto-open when no event is selected (openToNewEvent=true)
    // Wait a moment for form to be ready
    await page.waitForTimeout(300);

    // Try to submit without filling required fields (button text is "Save Event")
    await page.locator('[role="dialog"]').getByRole('button', { name: /Save Event/i }).click();

    // Dialog should stay open (validation failed)
    await page.waitForTimeout(500);
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Now fill required fields
    await page.locator('[role="dialog"]').getByLabel('Name').fill('ValidEvent');
    await page.locator('[role="dialog"]').getByLabel('Date').fill('2025-09-10');
    // Time field - use input#start_time since label includes asterisk
    await page.locator('[role="dialog"]').locator('input#start_time').fill('12:00');

    // Submit should work now (button text is "Save Event")
    await page.locator('[role="dialog"]').getByRole('button', { name: /Save Event/i }).click();
    await page.waitForTimeout(1500);

    // Dialog should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=ValidEvent')).toBeVisible();
  });
});
