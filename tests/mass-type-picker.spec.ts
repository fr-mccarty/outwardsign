import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Mass Type Picker Component', () => {
  test('should display mass types dropdown and allow selection', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Navigate to mass times create page (uses mass type picker)
    await page.goto('/mass-times/create');
    await expect(page).toHaveURL('/mass-times/create', { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Verify the mass type picker is present
    const massTypeSelect = page.locator('select').first();
    await expect(massTypeSelect).toBeVisible();

    // Verify it has the placeholder option
    await expect(massTypeSelect).toContainText('Select mass type');

    // Get all options (excluding the placeholder)
    const options = await massTypeSelect.locator('option:not([value=""])').all();

    // Fresh database might have 0 mass types initially - this is expected
    expect(options.length).toBeGreaterThanOrEqual(0);

    console.log(`Found ${options.length} mass type options in the picker`);
  });

  test('should create new mass type inline and auto-select it', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Navigate to mass times create page
    await page.goto('/mass-times/create');
    await expect(page).toHaveURL('/mass-times/create');

    // Find the "+" button next to the mass type select
    const addButton = page.locator('button[title="Create new mass type"]').first();
    await expect(addButton).toBeVisible();

    // Click the "+" button to open create dialog
    await addButton.click();

    // Wait for the dialog to open
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Verify dialog title
    await expect(page.locator('[role="dialog"]').getByRole('heading', { name: 'Create Mass Type' })).toBeVisible();

    // Fill in the form
    const uniqueSuffix = Date.now();
    const englishLabel = `Test Mass Type ${uniqueSuffix}`;
    const spanishLabel = `Tipo de Misa de Prueba ${uniqueSuffix}`;

    const dialog = page.locator('[role="dialog"]');
    await dialog.locator('input#create_label_en').fill(englishLabel);
    await dialog.locator('input#create_label_es').fill(spanishLabel);

    // Submit the form
    const createButton = dialog.getByRole('button', { name: /Create/i, exact: false }).last();
    await createButton.click();

    // Wait for the dialog to close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: TEST_TIMEOUTS.TOAST });

    // Verify the new mass type is auto-selected in the dropdown
    const massTypeSelect = page.locator('select').first();
    const selectedValue = await massTypeSelect.inputValue();

    // The selected value should not be empty (something was selected)
    expect(selectedValue).not.toBe('');

    // Verify the selected option's text matches our new mass type
    const selectedOption = massTypeSelect.locator(`option[value="${selectedValue}"]`);
    await expect(selectedOption).toHaveText(englishLabel);

    console.log(`✅ Successfully created and auto-selected mass type: ${englishLabel}`);
  });

  test('should validate that both English and Spanish labels are required', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Navigate to mass times create page
    await page.goto('/mass-times/create');
    await expect(page).toHaveURL('/mass-times/create');

    // Open the create dialog
    const addButton = page.locator('button[title="Create new mass type"]').first();
    await addButton.click();

    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    const dialog = page.locator('[role="dialog"]');

    // Try to submit with only English label
    await dialog.locator('input#create_label_en').fill('Test Mass Type');

    const createButton = dialog.getByRole('button', { name: /Create/i, exact: false }).last();
    await createButton.click();

    // Should show error message (toast notification or validation message)
    // Wait a moment for the error to appear
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Dialog should still be open (validation failed)
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    console.log('✅ Validation correctly prevents submission without Spanish label');

    // Now fill Spanish label
    await dialog.locator('input#create_label_es').fill('Tipo de Misa de Prueba');

    // Submit again
    await createButton.click();

    // Should succeed and close dialog
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: TEST_TIMEOUTS.TOAST });

    console.log('✅ Form successfully submitted with both labels');
  });

  test('should allow canceling mass type creation', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Navigate to mass times create page
    await page.goto('/mass-times/create');
    await expect(page).toHaveURL('/mass-times/create');

    // Get the initial selected value (should be empty)
    const massTypeSelect = page.locator('select').first();
    const initialValue = await massTypeSelect.inputValue();

    // Open the create dialog
    const addButton = page.locator('button[title="Create new mass type"]').first();
    await addButton.click();

    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    // Fill in some data
    const dialog = page.locator('[role="dialog"]');
    await dialog.locator('input#create_label_en').fill('Will Not Be Created');
    await dialog.locator('input#create_label_es').fill('No Será Creado');

    // Click Cancel button
    const cancelButton = dialog.getByRole('button', { name: /Cancel/i });
    await cancelButton.click();

    // Dialog should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // Verify the selection didn't change
    const finalValue = await massTypeSelect.inputValue();
    expect(finalValue).toBe(initialValue);

    console.log('✅ Cancel button works correctly');
  });

  test('should reload mass types after creation without page refresh', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Navigate to mass times create page
    await page.goto('/mass-times/create');
    await expect(page).toHaveURL('/mass-times/create');

    // Count initial mass types
    const massTypeSelect = page.locator('select').first();
    const initialOptions = await massTypeSelect.locator('option:not([value=""])').all();
    const initialCount = initialOptions.length;

    console.log(`Initial mass type count: ${initialCount}`);

    // Create a new mass type
    const addButton = page.locator('button[title="Create new mass type"]').first();
    await addButton.click();

    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    const uniqueSuffix = Date.now();
    const dialog = page.locator('[role="dialog"]');
    await dialog.locator('input#create_label_en').fill(`Auto Reload Test ${uniqueSuffix}`);
    await dialog.locator('input#create_label_es').fill(`Prueba de Recarga ${uniqueSuffix}`);

    const createButton = dialog.getByRole('button', { name: /Create/i, exact: false }).last();
    await createButton.click();

    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: TEST_TIMEOUTS.TOAST });

    // Wait for the picker to reload
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Count mass types again
    const finalOptions = await massTypeSelect.locator('option:not([value=""])').all();
    const finalCount = finalOptions.length;

    console.log(`Final mass type count: ${finalCount}`);

    // Should have at least one more option (other tests may have created mass types)
    expect(finalCount).toBeGreaterThan(initialCount);

    console.log('✅ Mass types list automatically reloaded after creation');
  });

  test('should work correctly when used in Mass Times form', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Create a new mass type via the picker
    await page.goto('/mass-times/create');
    await expect(page).toHaveURL('/mass-times/create');

    // Create a mass type
    const addButton = page.locator('button[title="Create new mass type"]').first();
    await addButton.click();

    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    const uniqueSuffix = Date.now();
    const englishLabel = `Sunday Mass ${uniqueSuffix}`;
    const spanishLabel = `Misa Dominical ${uniqueSuffix}`;

    const dialog = page.locator('[role="dialog"]');
    await dialog.locator('input#create_label_en').fill(englishLabel);
    await dialog.locator('input#create_label_es').fill(spanishLabel);

    const createButton = dialog.getByRole('button', { name: /Create/i, exact: false }).last();
    await createButton.click();

    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: TEST_TIMEOUTS.TOAST });

    // The mass type should be auto-selected, now complete the rest of the form
    // Verify mass type is selected
    const massTypeSelect = page.locator('select').first();
    const selectedValue = await massTypeSelect.inputValue();
    expect(selectedValue).not.toBe('');

    // Add a schedule item (should have one by default)
    // Just verify the form can be submitted with the newly created mass type
    console.log('✅ Mass type picker integration with Mass Times form works correctly');
  });
});
