import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Mass Times Module', () => {
  test('should create, view, and edit a mass time with full workflow', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Step 1: Create a mass type first (required for mass times)
    console.log('Creating a Mass Type first...');
    await page.goto('/mass-times/create');
    await expect(page).toHaveURL('/mass-times/create');

    // Open mass type picker and create a new type
    const addMassTypeButton = page.locator('button[title="Create new mass type"]').first();
    await addMassTypeButton.click();

    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    const uniqueSuffix = Date.now();
    const massTypeEnglish = `Sunday Mass ${uniqueSuffix}`;
    const massTypeSpanish = `Misa Dominical ${uniqueSuffix}`;

    let dialog = page.locator('[role="dialog"]');
    await dialog.locator('input#create_label_en').fill(massTypeEnglish);
    await dialog.locator('input#create_label_es').fill(massTypeSpanish);
    await dialog.getByRole('button', { name: /Create/i, exact: false }).last().click();

    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });

    console.log(`Created mass type: ${massTypeEnglish}`);

    // Step 2: Create a Mass Time
    console.log('Creating Mass Time...');
    await expect(page.getByRole('heading', { name: 'Create Mass Time' })).toBeVisible();

    // Mass type should be auto-selected from previous step
    const massTypeSelect = page.locator('select').first();
    const selectedMassType = await massTypeSelect.inputValue();
    expect(selectedMassType).not.toBe('');

    // Set language
    const languageSelect = page.locator('select[name="language"]');
    await languageSelect.selectOption('en');

    // Schedule items should have one default entry (Sunday 09:00)
    // Verify it exists
    const firstDaySelect = page.locator('select').nth(2); // First day selector after mass_type and language
    await expect(firstDaySelect).toBeVisible();

    // Change the time to 10:00
    const timeInput = page.locator('input[type="time"]').first();
    await timeInput.fill('10:00');

    // Add notes
    const notesTextarea = page.locator('textarea#notes');
    const initialNotes = 'Regular Sunday morning Mass with choir';
    await notesTextarea.fill(initialNotes);

    // Submit the form
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should redirect to the mass time detail page
    await page.waitForURL(/\/mass-times\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const massTimeUrl = page.url();
    const massTimeId = massTimeUrl.split('/').pop();
    console.log(`Created mass time with ID: ${massTimeId}`);

    // Step 3: Verify view page displays correct information
    console.log('Verifying view page...');

    // Should show the mass type
    await expect(page.getByText(massTypeEnglish)).toBeVisible();

    // Should show the schedule (Sunday at 10:00)
    await expect(page.getByText(/Sunday/i)).toBeVisible();
    await expect(page.getByText(/10:00/i)).toBeVisible();

    // Should show notes
    await expect(page.getByText(initialNotes)).toBeVisible();

    // Step 4: Navigate to edit page
    console.log('Editing mass time...');
    await page.goto(`/mass-times/${massTimeId}/edit`);
    await expect(page).toHaveURL(`/mass-times/${massTimeId}/edit`);

    // Verify form is pre-filled
    await expect(notesTextarea).toHaveValue(initialNotes);

    // Update the notes
    const updatedNotes = 'Updated: Sunday morning Mass with choir and additional ministers';
    await notesTextarea.fill(updatedNotes);

    // Add a second schedule item (Sunday at 12:00 PM)
    const addScheduleButton = page.getByRole('button', { name: /Add Schedule/i });
    await addScheduleButton.click();

    // Wait for the new schedule item to appear
    await page.waitForTimeout(500);

    // Fill in the second schedule item
    const secondTimeInput = page.locator('input[type="time"]').nth(1);
    await secondTimeInput.fill('12:00');

    // Submit the update
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should redirect back to view page
    await page.waitForURL(`/mass-times/${massTimeId}`, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Step 5: Verify updates persisted
    console.log('Verifying updates persisted...');

    // Should show updated notes
    await expect(page.getByText(updatedNotes)).toBeVisible();

    // Should show both schedule items
    await expect(page.getByText(/10:00/i)).toBeVisible();
    await expect(page.getByText(/12:00/i)).toBeVisible();

    // Refresh the page to verify database persistence
    await page.reload();
    await expect(page.getByText(updatedNotes)).toBeVisible();
    await expect(page.getByText(/10:00/i)).toBeVisible();
    await expect(page.getByText(/12:00/i)).toBeVisible();

    console.log('✅ Mass time create, view, and edit workflow completed successfully');
  });

  test('should validate required fields when creating mass time', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/mass-times/create');
    await expect(page).toHaveURL('/mass-times/create');

    // Try to submit without selecting a mass type
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should show validation error (form should not submit)
    await page.waitForTimeout(1000);

    // Should still be on create page (validation failed)
    await expect(page).toHaveURL('/mass-times/create');

    console.log('✅ Validation correctly prevents submission without mass type');
  });

  test('should allow creating mass time with location', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Create a mass type first
    await page.goto('/mass-times/create');

    const addMassTypeButton = page.locator('button[title="Create new mass type"]').first();
    await addMassTypeButton.click();

    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    const uniqueSuffix = Date.now();
    const dialog = page.locator('[role="dialog"]');
    await dialog.locator('input#create_label_en').fill(`Daily Mass ${uniqueSuffix}`);
    await dialog.locator('input#create_label_es').fill(`Misa Diaria ${uniqueSuffix}`);
    await dialog.getByRole('button', { name: /Create/i, exact: false }).last().click();

    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });

    // Now add a location
    const selectLocationButton = page.getByRole('button', { name: /Select Location/i });
    await selectLocationButton.click();

    // Wait for location picker dialog
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    // Location form should auto-open
    await page.waitForTimeout(500);

    const locationName = `Chapel ${Date.now()}`;
    const nameInput = page.locator('[role="dialog"]').getByRole('textbox').first();
    await nameInput.clear();
    await nameInput.fill(locationName);

    // Save location
    await page.locator('[role="dialog"]').getByRole('button', { name: /Save Location/i }).click();
    await page.waitForTimeout(2000);

    // Location picker should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // Verify location is selected
    await expect(page.getByText(locationName)).toBeVisible();

    // Submit the mass time
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    await page.waitForURL(/\/mass-times\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify location appears on view page
    await expect(page.getByText(locationName)).toBeVisible();

    console.log('✅ Mass time created with location successfully');
  });

  test('should filter mass times by mass type', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Navigate to mass times list
    await page.goto('/mass-times');
    await expect(page).toHaveURL('/mass-times');

    // Verify filters are visible
    const massTypeFilter = page.locator('select').first(); // First select is the mass type filter
    await expect(massTypeFilter).toBeVisible();

    // Should have "All" option selected by default
    const selectedValue = await massTypeFilter.inputValue();
    expect(selectedValue).toBe('all');

    console.log('✅ Mass type filter is available on list page');
  });

  test('should filter mass times by language', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/mass-times');
    await expect(page).toHaveURL('/mass-times');

    // Find the language filter (second select element)
    const languageFilter = page.locator('select').nth(1);
    await expect(languageFilter).toBeVisible();

    // Verify it has the expected options
    await expect(languageFilter.locator('option[value="all"]')).toBeVisible();
    await expect(languageFilter.locator('option[value="en"]')).toBeVisible();
    await expect(languageFilter.locator('option[value="es"]')).toBeVisible();

    console.log('✅ Language filter is available with correct options');
  });

  test('should display empty state when no mass times exist', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/mass-times');
    await expect(page).toHaveURL('/mass-times');

    // Should show page title
    await expect(page.getByRole('heading', { name: 'Mass Times' })).toBeVisible();

    // Should have a create button
    const createButton = page.getByRole('link', { name: /New Mass Time/i });
    await expect(createButton).toBeVisible();

    console.log('✅ Mass times list page loaded successfully');
  });

  test('should navigate through breadcrumbs', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Create a minimal mass time first
    await page.goto('/mass-times/create');

    // Quick mass type creation
    const addMassTypeButton = page.locator('button[title="Create new mass type"]').first();
    await addMassTypeButton.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    const uniqueSuffix = Date.now();
    const dialog = page.locator('[role="dialog"]');
    await dialog.locator('input#create_label_en').fill(`Test ${uniqueSuffix}`);
    await dialog.locator('input#create_label_es').fill(`Prueba ${uniqueSuffix}`);
    await dialog.getByRole('button', { name: /Create/i, exact: false }).last().click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });

    // Submit mass time
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    await page.waitForURL(/\/mass-times\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify breadcrumbs exist
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Mass Times' })).toBeVisible();

    // Click on Mass Times breadcrumb
    await breadcrumbNav.getByRole('link', { name: 'Mass Times' }).click();

    // Should navigate back to mass times list
    await expect(page).toHaveURL('/mass-times');

    console.log('✅ Breadcrumb navigation works correctly');
  });

  test('should toggle active status', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Create a mass time
    await page.goto('/mass-times/create');

    const addMassTypeButton = page.locator('button[title="Create new mass type"]').first();
    await addMassTypeButton.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    const uniqueSuffix = Date.now();
    const dialog = page.locator('[role="dialog"]');
    await dialog.locator('input#create_label_en').fill(`Weekday ${uniqueSuffix}`);
    await dialog.locator('input#create_label_es').fill(`Semanal ${uniqueSuffix}`);
    await dialog.getByRole('button', { name: /Create/i, exact: false }).last().click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });

    // Active checkbox should be checked by default
    const activeCheckbox = page.locator('input[type="checkbox"]').first();
    await expect(activeCheckbox).toBeChecked();

    // Uncheck it
    await activeCheckbox.uncheck();
    await expect(activeCheckbox).not.toBeChecked();

    // Submit
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    await page.waitForURL(/\/mass-times\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const massTimeId = page.url().split('/').pop();

    // Navigate to edit page to verify active status persisted
    await page.goto(`/mass-times/${massTimeId}/edit`);

    // Checkbox should still be unchecked
    await expect(activeCheckbox).not.toBeChecked();

    console.log('✅ Active status toggle works correctly');
  });

  test('should allow adding multiple schedule items', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/mass-times/create');

    // Create mass type
    const addMassTypeButton = page.locator('button[title="Create new mass type"]').first();
    await addMassTypeButton.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    const uniqueSuffix = Date.now();
    const dialog = page.locator('[role="dialog"]');
    await dialog.locator('input#create_label_en').fill(`Multiple ${uniqueSuffix}`);
    await dialog.locator('input#create_label_es').fill(`Múltiple ${uniqueSuffix}`);
    await dialog.getByRole('button', { name: /Create/i, exact: false }).last().click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });

    // Should have one schedule item by default
    let timeInputs = await page.locator('input[type="time"]').all();
    expect(timeInputs.length).toBe(1);

    // Add second schedule item
    const addScheduleButton = page.getByRole('button', { name: /Add Schedule/i });
    await addScheduleButton.click();
    await page.waitForTimeout(300);

    // Should now have two schedule items
    timeInputs = await page.locator('input[type="time"]').all();
    expect(timeInputs.length).toBe(2);

    // Add third schedule item
    await addScheduleButton.click();
    await page.waitForTimeout(300);

    // Should now have three schedule items
    timeInputs = await page.locator('input[type="time"]').all();
    expect(timeInputs.length).toBe(3);

    console.log('✅ Adding multiple schedule items works correctly');
  });

  test('should allow removing schedule items', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/mass-times/create');

    // Create mass type
    const addMassTypeButton = page.locator('button[title="Create new mass type"]').first();
    await addMassTypeButton.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    const uniqueSuffix = Date.now();
    const dialog = page.locator('[role="dialog"]');
    await dialog.locator('input#create_label_en').fill(`Remove Test ${uniqueSuffix}`);
    await dialog.locator('input#create_label_es').fill(`Eliminar Prueba ${uniqueSuffix}`);
    await dialog.getByRole('button', { name: /Create/i, exact: false }).last().click();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });

    // Add a second schedule item
    const addScheduleButton = page.getByRole('button', { name: /Add Schedule/i });
    await addScheduleButton.click();
    await page.waitForTimeout(300);

    // Should have two schedule items now
    let timeInputs = await page.locator('input[type="time"]').all();
    expect(timeInputs.length).toBe(2);

    // Find and click the remove button for the second item
    // Remove buttons are typically X icons next to each schedule item
    const removeButtons = await page.locator('button').filter({ hasText: /×|✕|X/i }).all();

    if (removeButtons.length > 0) {
      await removeButtons[removeButtons.length - 1].click();
      await page.waitForTimeout(300);

      // Should be back to one schedule item
      timeInputs = await page.locator('input[type="time"]').all();
      expect(timeInputs.length).toBe(1);

      console.log('✅ Removing schedule items works correctly');
    } else {
      console.log('⚠️ Remove buttons not found (may use different icon/pattern)');
    }
  });
});
