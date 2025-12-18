import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Weddings Module - Add People', () => {
  test('should add bride via person picker and save to wedding', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Navigate to weddings create page
    await page.goto('/weddings/create');
    await expect(page).toHaveURL('/weddings/create');

    // Open bride picker using testId
    await page.getByTestId('bride-trigger').click();

    // Wait for dialog to open
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Form should auto-open when no person is selected (openToNewPerson=true in create mode)
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Create a new bride
    const dialog = page.locator('[role="dialog"]');
    const firstName = `Bride${Date.now()}`;
    const lastName = 'Smith';

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

    // Verify bride is selected in the form
    await expect(page.locator(`button:has-text("${firstName} ${lastName}")`)).toBeVisible();

    // Save the wedding
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Wait for redirect to wedding edit page
    await page.waitForURL(/\/weddings\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const urlParts = page.url().split('/');
    const weddingId = urlParts[urlParts.length - 2]; // Get ID before '/edit'
    console.log(`Created wedding with ID: ${weddingId} with bride: ${firstName} ${lastName}`);

    // Verify we're on the edit page
    await expect(page).toHaveURL(`/weddings/${weddingId}/edit`);

    // Test persistence: Refresh the page
    await page.reload();

    // Verify bride is still selected in the edit form after refresh
    await expect(page.getByTestId('bride-selected-value')).toContainText(`${firstName} ${lastName}`);

    console.log(`Successfully verified bride persistence for wedding: ${weddingId}`);
  });

  test('should add groom via person picker and save to wedding', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Navigate to weddings create page
    await page.goto('/weddings/create');
    await expect(page).toHaveURL('/weddings/create');

    // Open groom picker using testId
    await page.getByTestId('groom-trigger').click();

    // Wait for dialog to open
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Form should auto-open when no person is selected
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Create a new groom
    const dialog = page.locator('[role="dialog"]');
    const firstName = `Groom${Date.now()}`;
    const lastName = 'Johnson';

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

    // Verify groom is selected in the form
    await expect(page.locator(`button:has-text("${firstName} ${lastName}")`)).toBeVisible();

    // Save the wedding
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Wait for redirect to wedding edit page
    await page.waitForURL(/\/weddings\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const urlParts = page.url().split('/');
    const weddingId = urlParts[urlParts.length - 2]; // Get ID before '/edit'
    console.log(`Created wedding with ID: ${weddingId} with groom: ${firstName} ${lastName}`);

    // Verify we're on the edit page
    await expect(page).toHaveURL(`/weddings/${weddingId}/edit`);

    // Test persistence: Refresh the page
    await page.reload();

    // Verify groom is still selected in the edit form after refresh
    await expect(page.getByTestId('groom-selected-value')).toContainText(`${firstName} ${lastName}`);

    console.log(`Successfully verified groom persistence for wedding: ${weddingId}`);
  });

  test('should add both bride and groom to wedding and save', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/weddings/create');
    await expect(page).toHaveURL('/weddings/create');

    // Add bride
    await page.getByTestId('bride-trigger').click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    const brideFirstName = `Bride${Date.now()}`;
    const brideLastName = 'Anderson';

    let dialog = page.locator('[role="dialog"]');
    await dialog.locator('#first_name').fill(brideFirstName);
    await dialog.locator('#last_name').fill(brideLastName);
    await dialog.getByRole('button', { name: /Save Person/i }).click();
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: TEST_TIMEOUTS.TOAST });

    // Verify bride selected
    await expect(page.locator(`button:has-text("${brideFirstName} ${brideLastName}")`)).toBeVisible();

    // Add groom
    await page.getByTestId('groom-trigger').click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    const groomFirstName = `Groom${Date.now()}`;
    const groomLastName = 'Martinez';

    dialog = page.locator('[role="dialog"]');
    await dialog.locator('#first_name').fill(groomFirstName);
    await dialog.locator('#last_name').fill(groomLastName);
    await dialog.getByRole('button', { name: /Save Person/i }).click();
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: TEST_TIMEOUTS.TOAST });

    // Verify groom selected
    await expect(page.locator(`button:has-text("${groomFirstName} ${groomLastName}")`)).toBeVisible();

    // Save the wedding
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/weddings\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const urlParts = page.url().split('/');
    const weddingId = urlParts[urlParts.length - 2]; // Get ID before '/edit'
    console.log(`Created wedding with ID: ${weddingId} with both bride and groom`);

    // Verify both are selected in the edit form
    await expect(page.getByTestId('bride-selected-value')).toContainText(`${brideFirstName} ${brideLastName}`);
    await expect(page.getByTestId('groom-selected-value')).toContainText(`${groomFirstName} ${groomLastName}`);

    // Test persistence
    await page.reload();
    await expect(page.getByTestId('bride-selected-value')).toContainText(`${brideFirstName} ${brideLastName}`);
    await expect(page.getByTestId('groom-selected-value')).toContainText(`${groomFirstName} ${groomLastName}`);

    console.log(`Successfully verified both bride and groom persistence for wedding: ${weddingId}`);
  });
});
