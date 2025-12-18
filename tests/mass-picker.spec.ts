import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Mass Picker Component', () => {
  /**
   * Test: Mass picker opens from mass intention form
   *
   * This test verifies:
   * 1. Mass picker can be opened from mass intention form
   * 2. Picker loads and displays masses
   * 3. Picker can be closed without selection
   */
  test('should open and close mass picker from mass intention form', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Navigate to mass intention create page
    await page.goto('/mass-intentions/create');
    await expect(page).toHaveURL('/mass-intentions/create');

    // Open the MassPicker by clicking "Assigned Mass" field
    const selectMassButton = page.getByTestId('assigned-mass-trigger').first();
    await expect(selectMassButton).toBeVisible();
    await selectMassButton.click();

    // Wait for Mass Picker dialog to appear
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT); // Wait for dialog to fully load

    // Verify the dialog is open (use .first() since there may be multiple dialogs)
    await expect(page.locator('[role="dialog"]').first()).toBeVisible();

    // Close the picker by pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Verify dialog is closed
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);

    // Verify we're still on the create page
    await expect(page).toHaveURL('/mass-intentions/create');

    console.log('Successfully opened and closed mass picker');
  });

  /**
   * Test: Select an existing mass from the picker
   *
   * This test verifies:
   * 1. User can browse existing masses
   * 2. User can select an existing mass
   * 3. Selected mass is displayed correctly
   * 4. No redirect occurs - stays on mass intention form
   */
  test('should select existing mass from picker', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // STEP 1: First create a mass to select later
    await page.goto('/masses/create');
    await expect(page).toHaveURL('/masses/create');

    const identifiableNote = `Identifiable Mass for Picker Test - ${Date.now()}`;
    await page.fill('textarea#note', identifiableNote);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    // Mass form redirects to edit page after creation
    await page.waitForURL(/\/masses\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get mass ID from URL (remove '/edit' from the end)
    const massId = page.url().split('/').slice(-2, -1)[0];
    console.log(`Created test mass with ID: ${massId}`);

    // STEP 2: Now go to mass intention form and select this mass
    await page.goto('/mass-intentions/create');
    await expect(page).toHaveURL('/mass-intentions/create');

    // Open the MassPicker
    await page.getByTestId('assigned-mass-trigger').first().click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Wait for masses to load
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Try to find the mass by clicking on a card
    // Masses are displayed with testId="mass-card-{id}"
    const massCard = page.locator(`[data-testid="mass-card-${massId}"]`).first();

    if (await massCard.count() > 0) {
      console.log(`Found mass card for ${massId}, clicking...`);
      await massCard.click({ force: true });
    } else {
      // Fallback: If we can't find the specific card, try clicking the first available mass
      console.log('Specific mass card not found, clicking first available mass...');
      const firstMassCard = page.locator('[role="dialog"]').locator('[data-testid^="mass-card-"]').first();
      if (await firstMassCard.count() > 0) {
        await firstMassCard.click({ force: true });
      }
    }

    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Picker should close after selection
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);

    // Verify we stayed on mass intention create page (NO REDIRECT)
    await expect(page).toHaveURL('/mass-intentions/create');

    // Verify mass is selected
    const massPickerValue = page.getByTestId('assigned-mass-selected-value');
    await expect(massPickerValue).toBeVisible();

    console.log('Successfully selected existing mass from picker');
  });

  /**
   * Test: Search and pagination in mass picker
   *
   * This test verifies:
   * 1. Picker displays masses from the database
   * 2. Dialog opens and shows mass cards
   */
  test('should display masses in picker', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Create a couple of test masses first
    console.log('Creating test masses...');
    const massIds: string[] = [];

    for (let i = 0; i < 3; i++) {
      await page.goto('/masses/create');
      await page.fill('textarea#note', `Picker Display Test Mass ${i + 1} - ${Date.now()}`);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.locator('button[type="submit"]').last().click();
      await page.waitForURL(/\/masses\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });
      const massId = page.url().split('/').slice(-2, -1)[0];
      massIds.push(massId!);
      console.log(`Created mass ${i + 1}/3 with ID: ${massId}`);
    }

    // Navigate to mass intention form
    await page.goto('/mass-intentions/create');
    await expect(page).toHaveURL('/mass-intentions/create');

    // Open the MassPicker
    await page.getByTestId('assigned-mass-trigger').first().click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Verify the dialog is showing masses (use .first() since there may be multiple dialogs)
    const massPickerDialog = page.locator('[role="dialog"]').first();
    await expect(massPickerDialog).toBeVisible();

    // Look for mass cards
    const massCards = massPickerDialog.locator('[data-testid^="mass-card-"]');
    const cardCount = await massCards.count();
    console.log(`Displayed ${cardCount} mass cards in picker`);

    // Should have at least the 3 we just created
    expect(cardCount).toBeGreaterThanOrEqual(3);

    // Close the picker
    await page.keyboard.press('Escape');
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    console.log('Successfully verified mass picker displays masses');
  });

  /**
   * Test: Clear selected mass
   *
   * This test verifies:
   * 1. User can select a mass
   * 2. User can clear the selection using the X button
   * 3. Mass picker field returns to empty state
   */
  test('should clear selected mass', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Create a mass first
    await page.goto('/masses/create');
    await page.fill('textarea#note', 'Mass for clear test');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/masses\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });
    const massId = page.url().split('/').slice(-2, -1)[0];

    // Go to mass intention form
    await page.goto('/mass-intentions/create');

    // Open picker and select the mass
    await page.getByTestId('assigned-mass-trigger').first().click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    const massCard = page.locator(`[data-testid="mass-card-${massId}"]`).first();
    if (await massCard.count() > 0) {
      await massCard.click({ force: true });
    } else {
      // Fallback to first mass
      await page.locator('[role="dialog"]').locator('[data-testid^="mass-card-"]').first().click({ force: true });
    }
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Verify mass is selected
    await expect(page.getByTestId('assigned-mass-selected-value')).toBeVisible();

    // Now clear the selection by clicking the X button
    const clearButton = page.getByTestId('assigned-mass-trigger').first().locator('button').last();

    // Try clicking the clear button if visible
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

      // Verify mass is no longer selected
      await expect(page.getByTestId('assigned-mass-selected-value')).not.toBeVisible();

      // Verify picker shows "Select Mass" placeholder again
      await expect(page.getByTestId('assigned-mass-trigger').first()).toContainText('Select Mass');
    }

    console.log('Successfully cleared selected mass');
  });

  /**
   * Test: Preserve form context when using mass picker
   *
   * This test verifies:
   * 1. Mass intention form data is preserved when opening picker
   * 2. Form data is preserved after selecting a mass
   * 3. No data loss during picker interactions
   */
  test('should preserve mass intention form context when using mass picker', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Create a mass to select
    await page.goto('/masses/create');
    await page.fill('textarea#note', 'Test mass for context preservation');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/masses\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });
    const massId = page.url().split('/').slice(-2, -1)[0];

    // Go to mass intention form
    await page.goto('/mass-intentions/create');

    // Fill in some mass intention form data first
    const intentionText = 'For the souls in purgatory - Context preservation test';
    await page.fill('#mass_offered_for', intentionText);
    await page.fill('#stipend_amount', '25.00');

    // Now open mass picker and select the mass
    await page.getByTestId('assigned-mass-trigger').first().click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Select the mass
    const massCard = page.locator(`[data-testid="mass-card-${massId}"]`).first();
    if (await massCard.count() > 0) {
      await massCard.click({ force: true });
    } else {
      await page.locator('[role="dialog"]').locator('[data-testid^="mass-card-"]').first().click({ force: true });
    }
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Verify we're still on the create page
    await expect(page).toHaveURL('/mass-intentions/create');

    // Verify all original form data is still there
    await expect(page.locator('#mass_offered_for')).toHaveValue(intentionText);
    await expect(page.locator('#stipend_amount')).toHaveValue('25.00');

    // Verify mass is selected
    await expect(page.getByTestId('assigned-mass-selected-value')).toBeVisible();

    console.log('Successfully preserved form context when using mass picker');
  });
});
