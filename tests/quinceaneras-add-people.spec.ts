import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Quinceañeras Module - Add People', () => {
  test('should add quinceañera via person picker and save to quinceanera', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Navigate to quinceaneras create page
    await page.goto('/quinceaneras/create');
    await expect(page).toHaveURL('/quinceaneras/create');

    // Open quinceanera picker using testId
    await page.getByTestId('quinceanera-trigger').click();

    // Wait for dialog to open
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Form should auto-open when no person is selected (openToNewPerson=true in create mode)
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Create a new quinceañera
    const dialog = page.locator('[role="dialog"]');
    const firstName = `Quince${Date.now()}`;
    const lastName = 'Ramirez';

    await dialog.locator('#first_name').fill(firstName);
    await dialog.locator('#last_name').fill(lastName);

    // Optional email
    const emailInput = dialog.getByLabel('Email');
    if (await emailInput.isVisible()) {
      await emailInput.fill(`${firstName.toLowerCase()}@test.com`);
    }

    // Submit the create form (button text is "Save Person")
    const createButton = dialog.getByRole('button', { name: /Save Person/i });
    await createButton.click();

    // Wait for creation and auto-selection
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Dialog should close automatically
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: TEST_TIMEOUTS.TOAST });

    // Verify quinceañera is selected in the form
    await expect(page.locator(`button:has-text("${firstName} ${lastName}")`)).toBeVisible();

    // Save the quinceanera
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Wait for redirect to quinceanera edit page
    await page.waitForURL(/\/quinceaneras\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const urlParts = page.url().split('/');
    const quinceaneraId = urlParts[urlParts.length - 2]; // Get ID before '/edit'
    console.log(`Created quinceañera with ID: ${quinceaneraId} for: ${firstName} ${lastName}`);

    // Verify we're on the edit page
    await expect(page).toHaveURL(`/quinceaneras/${quinceaneraId}/edit`);

    // Test persistence: Refresh the page
    await page.reload();

    // Verify quinceañera is still selected in the edit form after refresh
    await expect(page.getByTestId('quinceanera-selected-value')).toContainText(`${firstName} ${lastName}`);

    console.log(`Successfully verified quinceañera persistence for quinceanera: ${quinceaneraId}`);
  });

  test('should add family contact via person picker and save to quinceanera', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Navigate to quinceaneras create page
    await page.goto('/quinceaneras/create');
    await expect(page).toHaveURL('/quinceaneras/create');

    // Open family contact picker using testId
    await page.getByTestId('family-contact-trigger').click();

    // Wait for dialog to open
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Form should auto-open when no person is selected
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Create a new family contact
    const dialog = page.locator('[role="dialog"]');
    const firstName = `Contact${Date.now()}`;
    const lastName = 'Torres';

    await dialog.locator('#first_name').fill(firstName);
    await dialog.locator('#last_name').fill(lastName);

    // Optional email
    const emailInput = dialog.getByLabel('Email');
    if (await emailInput.isVisible()) {
      await emailInput.fill(`${firstName.toLowerCase()}@test.com`);
    }

    // Submit the create form
    const createButton = dialog.getByRole('button', { name: /Save Person/i });
    await createButton.click();

    // Wait for creation and auto-selection
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Dialog should close automatically
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: TEST_TIMEOUTS.TOAST });

    // Verify family contact is selected in the form
    await expect(page.locator(`button:has-text("${firstName} ${lastName}")`)).toBeVisible();

    // Save the quinceanera
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Wait for redirect to quinceanera edit page
    await page.waitForURL(/\/quinceaneras\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const urlParts = page.url().split('/');
    const quinceaneraId = urlParts[urlParts.length - 2]; // Get ID before '/edit'
    console.log(`Created quinceañera with ID: ${quinceaneraId} with family contact: ${firstName} ${lastName}`);

    // Verify we're on the edit page
    await expect(page).toHaveURL(`/quinceaneras/${quinceaneraId}/edit`);

    // Test persistence: Refresh the page
    await page.reload();

    // Verify family contact is still selected in the edit form after refresh
    await expect(page.getByTestId('family-contact-selected-value')).toContainText(`${firstName} ${lastName}`);

    console.log(`Successfully verified family contact persistence for quinceañera: ${quinceaneraId}`);
  });
});
