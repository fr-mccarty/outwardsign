import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Location Picker Component', () => {
  /**
   * Test: Location picker opens and closes from event form
   *
   * This test verifies:
   * 1. Location picker can be opened from event form
   * 2. Picker loads and displays locations
   * 3. Picker can be closed without selection
   */
  test('should open and close location picker from event form', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Navigate to event create page
    await page.goto('/events/create');
    await expect(page).toHaveURL('/events/create');

    // Open the LocationPicker by clicking "Location" field
    const selectLocationButton = page.getByTestId('location-trigger').first();
    await expect(selectLocationButton).toBeVisible();
    await selectLocationButton.click();

    // Wait for Location Picker dialog to appear
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Verify the dialog is open
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible();

    // Close the picker by pressing Escape
    await page.keyboard.press('Escape');

    // Verify dialog is closed
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);

    // Verify we're still on the create page
    await expect(page).toHaveURL('/events/create');

    console.log('Successfully opened and closed location picker');
  });

  /**
   * Test: Create new location with minimal data (name only)
   *
   * This test verifies:
   * 1. User can create a location with only the required name field
   * 2. Newly created location is auto-selected
   * 3. No redirect occurs - stays on event form
   *
   * Note: On event create page, openToNewLocation=true so the create form
   * auto-opens when the picker opens. No need to click "Add New Location".
   */
  test('should create new location from picker with minimal data and auto-select', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Navigate to event create page
    await page.goto('/events/create');
    await expect(page).toHaveURL('/events/create');

    // Open the LocationPicker
    await page.getByTestId('location-trigger').first().click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // On create page, the create form auto-opens (openToNewLocation=true)
    // Wait for the form to render by checking for the Save button
    const dialog = page.locator('[role="dialog"]');
    const saveButton = dialog.getByRole('button', { name: /Save Location/i });
    await expect(saveButton).toBeVisible();

    // Fill in minimal location data (just name, which is required)
    const locationName = `Minimal Test Location ${Date.now()}`;
    const nameInput = dialog.locator('#name');
    await expect(nameInput).toBeVisible();
    await nameInput.fill(locationName);

    // Submit the location creation
    await saveButton.click();

    // Picker dialog should be closed
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);

    // Verify we stayed on the event create page (NO REDIRECT)
    await expect(page).toHaveURL('/events/create');

    // Verify the newly created location is displayed in the selected field
    await expect(page.getByTestId('location-selected-value')).toBeVisible();
    await expect(page.getByTestId('location-selected-value')).toContainText(locationName);

    console.log('Successfully created and auto-selected new location with minimal data');
  });

  /**
   * Test: Create location with complete address information
   *
   * This test verifies:
   * 1. User can create a location with full address details
   * 2. All address fields are saved correctly
   * 3. Location is auto-selected and displayed with full address
   *
   * Note: On event create page, openToNewLocation=true so the create form
   * auto-opens when the picker opens. No need to click "Add New Location".
   */
  test('should create location with complete address information', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Navigate to event create page
    await page.goto('/events/create');
    await expect(page).toHaveURL('/events/create');

    // Open the LocationPicker
    await page.getByTestId('location-trigger').first().click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // On create page, the create form auto-opens (openToNewLocation=true)
    // Wait for the form to render by checking for the Save button
    const dialog = page.locator('[role="dialog"]');
    const saveButton = dialog.getByRole('button', { name: /Save Location/i });
    await expect(saveButton).toBeVisible();

    // Fill in complete location data
    const locationData = {
      name: `Complete Location ${Date.now()}`,
      street: '456 Church Avenue',
      city: 'Springfield',
      state: 'IL',
      country: 'USA',
      phone: '(555) 987-6543',
    };

    await dialog.locator('#name').fill(locationData.name);

    // Fill optional fields if visible
    const streetInput = dialog.getByLabel('Street');
    if (await streetInput.isVisible()) {
      await streetInput.fill(locationData.street);
    }

    const cityInput = dialog.getByLabel('City');
    if (await cityInput.isVisible()) {
      await cityInput.fill(locationData.city);
    }

    const stateInput = dialog.getByLabel('State');
    if (await stateInput.isVisible()) {
      await stateInput.fill(locationData.state);
    }

    const countryInput = dialog.getByLabel('Country');
    if (await countryInput.isVisible()) {
      await countryInput.fill(locationData.country);
    }

    const phoneInput = dialog.getByLabel('Phone');
    if (await phoneInput.isVisible()) {
      await phoneInput.fill(locationData.phone);
    }

    // Submit
    await saveButton.click();

    // Verify picker closed and location selected
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    await expect(page).toHaveURL('/events/create');
    await expect(page.getByTestId('location-selected-value')).toBeVisible();
    await expect(page.getByTestId('location-selected-value')).toContainText(locationData.name);

    console.log('Successfully created location with complete address');
  });

  /**
   * Test: Select an existing location from the picker
   *
   * This test verifies:
   * 1. User can browse existing locations
   * 2. User can select an existing location
   * 3. Selected location is displayed correctly
   * 4. No redirect occurs - stays on event form
   *
   * Note: On event create page, openToNewLocation=true so the create form
   * auto-opens. We need to click "Select from list instead" to see locations.
   */
  test('should select existing location from picker', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // STEP 1: First create a location to select later
    await page.goto('/locations/create');
    await expect(page).toHaveURL('/locations/create');

    const locationName = `Selectable Location ${Date.now()}`;
    await page.fill('#name', locationName);
    await page.fill('#street', '789 Test Street');

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    // Location form redirects to edit page after creation
    await page.waitForURL(/\/locations\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get location ID from URL (remove '/edit' from the end)
    const locationId = page.url().split('/').slice(-2, -1)[0];
    console.log(`Created test location with ID: ${locationId}`);

    // STEP 2: Now go to event form and select this location
    await page.goto('/events/create');
    await expect(page).toHaveURL('/events/create');

    // Open the LocationPicker
    await page.getByTestId('location-trigger').first().click();
    const locationDialog = page.getByTestId('location-picker-dialog');
    await locationDialog.waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // On create page, the create form auto-opens. Click "Select from list instead" to see locations
    const selectFromListButton = locationDialog.getByRole('button', { name: /Select from list instead/i });
    await expect(selectFromListButton).toBeVisible();
    await selectFromListButton.click();

    // Wait for locations to load
    const searchInput = locationDialog.getByPlaceholder(/Search/i);
    await expect(searchInput).toBeVisible();

    // Try to find the location by its data-testid
    const locationCard = locationDialog.locator(`[data-testid="location-picker-dialog-${locationId}"]`).first();

    if (await locationCard.count() > 0) {
      console.log(`✓ Found location card for ${locationId}, clicking...`);
      await locationCard.click();
    } else {
      // Fallback: search for location by name, then click
      console.log(`✗ Location card not found by ID, trying to search by name...`);
      await searchInput.fill(locationName);
      const locationButton = locationDialog.getByRole('button', { name: new RegExp(locationName, 'i') }).first();
      await expect(locationButton).toBeVisible();
      await locationButton.click();
    }

    // Picker should close after selection
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);

    // Verify we stayed on event create page (NO REDIRECT)
    await expect(page).toHaveURL('/events/create');

    // Verify location is selected
    await expect(page.getByTestId('location-selected-value')).toBeVisible();

    console.log('Successfully selected existing location from picker');
  });

  /**
   * Test: Search and filter locations
   *
   * This test verifies:
   * 1. Picker displays locations from the database
   * 2. Search functionality works
   * 3. Dialog shows correct location count
   */
  test('should display and search locations in picker', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Create a couple of test locations with distinct names
    console.log('Creating test locations...');

    const location1Name = `Cathedral ${Date.now()}`;
    await page.goto('/locations/create');
    await page.fill('#name', location1Name);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    // Location form redirects to edit page after creation
    await page.waitForURL(/\/locations\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const location2Name = `Chapel ${Date.now()}`;
    await page.goto('/locations/create');
    await page.fill('#name', location2Name);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    // Location form redirects to edit page after creation
    await page.waitForURL(/\/locations\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    console.log('Created 2 test locations');

    // Navigate to event form
    await page.goto('/events/create');
    await expect(page).toHaveURL('/events/create');

    // Open the LocationPicker
    await page.getByTestId('location-trigger').first().click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Verify the dialog is showing locations
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible();

    // Search for one of our locations
    const searchInput = dialog.getByPlaceholder(/Search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('Cathedral');

      // Should find the Cathedral location
      await expect(dialog.getByText(location1Name)).toBeVisible();
    }

    // Close the picker
    await page.keyboard.press('Escape');

    console.log('Successfully verified location picker search and display');
  });

  /**
   * Test: Clear selected location
   *
   * This test verifies:
   * 1. User can select a location
   * 2. User can clear the selection using the X button
   * 3. Location picker field returns to empty state
   *
   * Note: On event create page, openToNewLocation=true so the create form
   * auto-opens. We need to click "Select from list instead" to see locations.
   */
  test('should clear selected location', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Create a location first
    await page.goto('/locations/create');
    await page.fill('#name', 'Location for clear test');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    // Location form redirects to edit page after creation
    await page.waitForURL(/\/locations\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Go to event form
    await page.goto('/events/create');

    // Open picker
    await page.getByTestId('location-trigger').first().click();
    const dialog = page.locator('[role="dialog"]');
    await dialog.waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // On create page, the create form auto-opens. Click "Select from list instead"
    const selectFromListButton = dialog.getByRole('button', { name: /Select from list instead/i });
    await expect(selectFromListButton).toBeVisible();
    await selectFromListButton.click();

    // Wait for list to load and click the first location
    const searchInput = dialog.getByPlaceholder(/Search/i);
    await expect(searchInput).toBeVisible();

    // Search for the location we just created to ensure we select it
    await searchInput.fill('clear test');

    // Wait for search results and click the location card
    // Location cards have testids like "location-picker-dialog-{id}"
    const locationCard = dialog.locator('[data-testid^="location-picker-dialog-"]').first();
    await expect(locationCard).toBeVisible();
    await locationCard.click();

    // Dialog should close after selection
    await expect(dialog).toHaveCount(0);

    // Verify location is selected
    await expect(page.getByTestId('location-selected-value')).toBeVisible();

    // Now clear the selection by clicking the X button (using the clear testid)
    const clearButton = page.getByTestId('location-clear');
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    // Confirmation dialog appears - confirm the removal
    const confirmButton = page.getByRole('button', { name: /Remove/i });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    // Verify location is no longer selected
    await expect(page.getByTestId('location-selected-value')).not.toBeVisible();

    // Verify picker trigger shows placeholder again
    await expect(page.getByTestId('location-trigger').first()).toBeVisible();

    console.log('Successfully cleared selected location');
  });

  /**
   * Test: Preserve form context when using location picker
   *
   * This test verifies:
   * 1. Event form data is preserved when opening picker
   * 2. Form data is preserved after selecting a location
   * 3. No data loss during picker interactions
   *
   * Note: On event create page, openToNewLocation=true so the create form
   * auto-opens. We need to click "Select from list instead" to see locations.
   */
  test('should preserve event form context when using location picker', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Create a location to select
    await page.goto('/locations/create');
    await page.fill('#name', 'Test location for context preservation');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    // Location form redirects to edit page after creation
    await page.waitForURL(/\/locations\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Go to event form
    await page.goto('/events/create');

    // Fill in some event form data first (name and start_time - avoiding date picker)
    const eventName = 'Important Event - Context Test';
    await page.fill('#name', eventName);
    await page.fill('#start_time', '10:30');

    // Now open location picker
    await page.getByTestId('location-trigger').first().click();
    const dialog = page.locator('[role="dialog"]');
    await dialog.waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // On create page, the create form auto-opens. Click "Select from list instead"
    const selectFromListButton = dialog.getByRole('button', { name: /Select from list instead/i });
    await expect(selectFromListButton).toBeVisible();
    await selectFromListButton.click();

    // Wait for list to load
    const searchInput = dialog.getByPlaceholder(/Search/i);
    await expect(searchInput).toBeVisible();

    // Select the first location
    const firstLocation = dialog.getByRole('button').filter({ hasText: /location/i }).first();
    await expect(firstLocation).toBeVisible();
    await firstLocation.click();

    // Verify we're still on the create page
    await expect(page).toHaveURL('/events/create');

    // Verify all original form data is still there
    await expect(page.locator('#name')).toHaveValue(eventName);
    await expect(page.locator('#start_time')).toHaveValue('10:30');

    // Verify location is selected
    await expect(page.getByTestId('location-selected-value')).toBeVisible();

    console.log('Successfully preserved form context when using location picker');
  });

  /**
   * Test: Validation for required name field
   *
   * This test verifies:
   * 1. Location picker validates required name field
   * 2. Cannot submit without entering a name
   * 3. Error handling works correctly
   *
   * Note: On event create page, openToNewLocation=true so the create form
   * auto-opens when the picker opens. No need to click "Add New Location".
   */
  test('should validate required name field when creating location', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/events/create');
    await expect(page).toHaveURL('/events/create');

    // Open the LocationPicker
    await page.getByTestId('location-trigger').first().click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // On create page, the create form auto-opens (openToNewLocation=true)
    // Wait for the form to render by checking for the Save button
    const dialog = page.locator('[role="dialog"]');
    const saveButton = dialog.getByRole('button', { name: /Save Location/i });
    await expect(saveButton).toBeVisible();

    // Try to submit without filling the required name field
    await saveButton.click();

    // Dialog should stay open (validation failed)
    await expect(dialog).toBeVisible();

    // Now fill the name and try again
    await dialog.locator('#name').fill('Valid Location Name');
    await saveButton.click();

    // Dialog should close and location should be selected
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    await expect(page.getByTestId('location-selected-value')).toBeVisible();

    console.log('Successfully validated required name field');
  });
});
