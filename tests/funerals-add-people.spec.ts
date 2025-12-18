import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Funerals Module - Add People', () => {
  test('should add deceased person via person picker and save to funeral', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Navigate to funerals create page
    await page.goto('/funerals/create');
    await expect(page).toHaveURL('/funerals/create');

    // Open deceased picker using testId
    await page.getByTestId('deceased-trigger').click();

    // Wait for dialog to open
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Form should auto-open when no person is selected (openToNewPerson=true in create mode)
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Create a new deceased person
    const dialog = page.locator('[role="dialog"]');
    const firstName = `Deceased${Date.now()}`;
    const lastName = 'Williams';

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

    // Verify deceased person is selected in the form
    await expect(page.locator(`button:has-text("${firstName} ${lastName}")`)).toBeVisible();

    // Save the funeral
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Wait for redirect to funeral edit page
    await page.waitForURL(/\/funerals\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const urlParts = page.url().split('/');
    const funeralId = urlParts[urlParts.length - 2]; // Get ID before '/edit'
    console.log(`Created funeral with ID: ${funeralId} for deceased: ${firstName} ${lastName}`);

    // Verify we're on the edit page
    await expect(page).toHaveURL(`/funerals/${funeralId}/edit`);

    // Test persistence: Refresh the page
    await page.reload();

    // Verify deceased person is still selected in the edit form after refresh
    await expect(page.getByTestId('deceased-selected-value')).toContainText(`${firstName} ${lastName}`);

    console.log(`Successfully verified deceased person persistence for funeral: ${funeralId}`);
  });

  test('should add family contact via person picker and save to funeral', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Navigate to funerals create page
    await page.goto('/funerals/create');
    await expect(page).toHaveURL('/funerals/create');

    // Open family contact picker using testId
    await page.getByTestId('family-contact-trigger').click();

    // Wait for dialog to open
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Form should auto-open when no person is selected
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Create a new family contact
    const dialog = page.locator('[role="dialog"]');
    const firstName = `Contact${Date.now()}`;
    const lastName = 'Brown';

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

    // Save the funeral
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Wait for redirect to funeral edit page
    await page.waitForURL(/\/funerals\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const urlParts = page.url().split('/');
    const funeralId = urlParts[urlParts.length - 2]; // Get ID before '/edit'
    console.log(`Created funeral with ID: ${funeralId} with family contact: ${firstName} ${lastName}`);

    // Verify we're on the edit page
    await expect(page).toHaveURL(`/funerals/${funeralId}/edit`);

    // Test persistence: Refresh the page
    await page.reload();

    // Verify family contact is still selected in the edit form after refresh
    await expect(page.getByTestId('family-contact-selected-value')).toContainText(`${firstName} ${lastName}`);

    console.log(`Successfully verified family contact persistence for funeral: ${funeralId}`);
  });
});
