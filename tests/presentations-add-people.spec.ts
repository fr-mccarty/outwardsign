import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Presentations Module - Add People', () => {
  test('should add child via person picker and save to presentation', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Navigate to presentations create page
    await page.goto('/presentations/create');
    await expect(page).toHaveURL('/presentations/create');

    // Open child picker using testId
    await page.getByTestId('child-trigger').click();

    // Wait for dialog to open
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Form should auto-open when no person is selected (openToNewPerson=true in create mode)
    await page.waitForTimeout(300);

    // Create a new child
    const dialog = page.locator('[role="dialog"]');
    const firstName = `Child${Date.now()}`;
    const lastName = 'Hernandez';

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
    await page.waitForTimeout(1500);

    // Dialog should close automatically
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });

    // Verify child is selected in the form
    await expect(page.locator(`button:has-text("${firstName} ${lastName}")`)).toBeVisible();

    // Save the presentation
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Wait for redirect to presentation edit page
    await page.waitForURL(/\/presentations\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const urlParts = page.url().split('/');
    const presentationId = urlParts[urlParts.length - 2]; // Get ID before '/edit'
    console.log(`Created presentation with ID: ${presentationId} for child: ${firstName} ${lastName}`);

    // Verify we're on the edit page
    await expect(page).toHaveURL(`/presentations/${presentationId}/edit`);

    // Test persistence: Refresh the page
    await page.reload();

    // Verify child is still selected in the edit form after refresh
    await expect(page.getByTestId('child-selected-value')).toContainText(`${firstName} ${lastName}`);

    console.log(`Successfully verified child persistence for presentation: ${presentationId}`);
  });

  test('should add mother via person picker and save to presentation', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Navigate to presentations create page
    await page.goto('/presentations/create');
    await expect(page).toHaveURL('/presentations/create');

    // Open mother picker using testId
    await page.getByTestId('mother-trigger').click();

    // Wait for dialog to open
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Form should auto-open when no person is selected
    await page.waitForTimeout(300);

    // Create a new mother
    const dialog = page.locator('[role="dialog"]');
    const firstName = `Mother${Date.now()}`;
    const lastName = 'Morales';

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
    await page.waitForTimeout(1500);

    // Dialog should close automatically
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });

    // Verify mother is selected in the form
    await expect(page.locator(`button:has-text("${firstName} ${lastName}")`)).toBeVisible();

    // Save the presentation
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Wait for redirect to presentation edit page
    await page.waitForURL(/\/presentations\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const urlParts = page.url().split('/');
    const presentationId = urlParts[urlParts.length - 2]; // Get ID before '/edit'
    console.log(`Created presentation with ID: ${presentationId} with mother: ${firstName} ${lastName}`);

    // Verify we're on the edit page
    await expect(page).toHaveURL(`/presentations/${presentationId}/edit`);

    // Test persistence: Refresh the page
    await page.reload();

    // Verify mother is still selected in the edit form after refresh
    await expect(page.getByTestId('mother-selected-value')).toContainText(`${firstName} ${lastName}`);

    console.log(`Successfully verified mother persistence for presentation: ${presentationId}`);
  });

  test('should add father via person picker and save to presentation', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Navigate to presentations create page
    await page.goto('/presentations/create');
    await expect(page).toHaveURL('/presentations/create');

    // Open father picker using testId
    await page.getByTestId('father-trigger').click();

    // Wait for dialog to open
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Form should auto-open when no person is selected
    await page.waitForTimeout(300);

    // Create a new father
    const dialog = page.locator('[role="dialog"]');
    const firstName = `Father${Date.now()}`;
    const lastName = 'Ortiz';

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
    await page.waitForTimeout(1500);

    // Dialog should close automatically
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });

    // Verify father is selected in the form
    await expect(page.locator(`button:has-text("${firstName} ${lastName}")`)).toBeVisible();

    // Save the presentation
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Wait for redirect to presentation edit page
    await page.waitForURL(/\/presentations\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const urlParts = page.url().split('/');
    const presentationId = urlParts[urlParts.length - 2]; // Get ID before '/edit'
    console.log(`Created presentation with ID: ${presentationId} with father: ${firstName} ${lastName}`);

    // Verify we're on the edit page
    await expect(page).toHaveURL(`/presentations/${presentationId}/edit`);

    // Test persistence: Refresh the page
    await page.reload();

    // Verify father is still selected in the edit form after refresh
    await expect(page.getByTestId('father-selected-value')).toContainText(`${firstName} ${lastName}`);

    console.log(`Successfully verified father persistence for presentation: ${presentationId}`);
  });

  test('should add child, mother, and father to presentation and save', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/presentations/create');
    await expect(page).toHaveURL('/presentations/create');

    // Add child
    await page.getByTestId('child-trigger').click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.waitForTimeout(300);

    const childFirstName = `Child${Date.now()}`;
    const childLastName = 'PresentationFamily';

    let dialog = page.locator('[role="dialog"]');
    await dialog.locator('#first_name').fill(childFirstName);
    await dialog.locator('#last_name').fill(childLastName);
    await dialog.getByRole('button', { name: /Save Person/i }).click();
    await page.waitForTimeout(1500);
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });

    // Verify child selected
    await expect(page.locator(`button:has-text("${childFirstName} ${childLastName}")`)).toBeVisible();

    // Add mother
    await page.getByTestId('mother-trigger').click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.waitForTimeout(300);

    const motherFirstName = `Mother${Date.now()}`;
    const motherLastName = 'PresentationFamily';

    dialog = page.locator('[role="dialog"]');
    await dialog.locator('#first_name').fill(motherFirstName);
    await dialog.locator('#last_name').fill(motherLastName);
    await dialog.getByRole('button', { name: /Save Person/i }).click();
    await page.waitForTimeout(1500);
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });

    // Verify mother selected
    await expect(page.locator(`button:has-text("${motherFirstName} ${motherLastName}")`)).toBeVisible();

    // Add father
    await page.getByTestId('father-trigger').click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.waitForTimeout(300);

    const fatherFirstName = `Father${Date.now()}`;
    const fatherLastName = 'PresentationFamily';

    dialog = page.locator('[role="dialog"]');
    await dialog.locator('#first_name').fill(fatherFirstName);
    await dialog.locator('#last_name').fill(fatherLastName);
    await dialog.getByRole('button', { name: /Save Person/i }).click();
    await page.waitForTimeout(1500);
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });

    // Verify father selected
    await expect(page.locator(`button:has-text("${fatherFirstName} ${fatherLastName}")`)).toBeVisible();

    // Save the presentation
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/presentations\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const urlParts = page.url().split('/');
    const presentationId = urlParts[urlParts.length - 2]; // Get ID before '/edit'
    console.log(`Created presentation with ID: ${presentationId} with child, mother, and father`);

    // Verify all are selected in the edit form
    await expect(page.getByTestId('child-selected-value')).toContainText(`${childFirstName} ${childLastName}`);
    await expect(page.getByTestId('mother-selected-value')).toContainText(`${motherFirstName} ${motherLastName}`);
    await expect(page.getByTestId('father-selected-value')).toContainText(`${fatherFirstName} ${fatherLastName}`);

    // Test persistence
    await page.reload();
    await expect(page.getByTestId('child-selected-value')).toContainText(`${childFirstName} ${childLastName}`);
    await expect(page.getByTestId('mother-selected-value')).toContainText(`${motherFirstName} ${motherLastName}`);
    await expect(page.getByTestId('father-selected-value')).toContainText(`${fatherFirstName} ${fatherLastName}`);

    console.log(`Successfully verified all family members persistence for presentation: ${presentationId}`);
  });
});
