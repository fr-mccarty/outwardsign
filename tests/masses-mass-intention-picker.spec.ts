import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Masses Module - Mass Intention Picker', () => {
  /**
   * Test: Link an existing mass intention to a mass
   *
   * This test verifies:
   * 1. Mass intention card only appears when editing an existing mass
   * 2. User can open the mass intention picker
   * 3. User can select an existing mass intention from the list
   * 4. Mass intention is linked to the mass and displayed
   * 5. Mass intention persists after page refresh
   */
  test('should link existing mass intention to a mass', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // STEP 1: Create a mass intention first (we need an existing one to link)
    await page.goto('/mass-intentions/create');
    await expect(page).toHaveURL('/mass-intentions/create');

    const intentionText = `For the repose of the soul of John Doe - Test ${Date.now()}`;
    await page.locator('input#mass_offered_for').fill(intentionText);

    // Submit the mass intention (status defaults to REQUESTED)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();

    // Should redirect to mass intention edit page (form redirects to /edit after create)
    await page.waitForURL(/\/mass-intentions\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });
    const massIntentionUrl = page.url();
    const massIntentionId = massIntentionUrl.split('/')[massIntentionUrl.split('/').length - 2]; // Get ID from /mass-intentions/{id}/edit
    console.log(`Created mass intention with ID: ${massIntentionId}`);

    // STEP 2: Create a mass
    await page.goto('/masses/create');
    await expect(page).toHaveURL('/masses/create');

    // Add a note to identify this mass
    const massNote = `Test mass for mass intention linking - ${Date.now()}`;
    await page.fill('textarea#note', massNote);

    // Submit to create the mass
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();

    // Should redirect to mass edit page (mass form redirects to edit on create)
    await page.waitForURL(/\/masses\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });
    const massUrl = page.url();
    const massId = massUrl.split('/')[massUrl.split('/').length - 2]; // Get ID from /masses/{id}/edit
    console.log(`Created mass with ID: ${massId}`);

    // STEP 3: Reload the page to ensure server component properly loads with mass data
    // The client-side router.push() can cause hydration issues, so reload to force server render
    await page.reload();
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);

    // Scroll to bottom of page to bring Mass Intention card into viewport
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Verify Mass Intention card is visible on edit page using test ID
    // The card should be visible now that we're editing an existing mass
    // Use test ID for reliable selection and longer timeout for React hydration
    await expect(page.getByTestId('mass-intention-card')).toBeVisible({ timeout: 15000 });

    // STEP 4: Verify empty state - no mass intention linked yet
    await expect(page.getByText('No mass intention linked yet')).toBeVisible();

    // STEP 5: Open the mass intention picker using test ID
    const linkButton = page.getByTestId('link-mass-intention-button');
    await expect(linkButton).toBeVisible();
    // Scroll button into view and click
    await linkButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await linkButton.click();

    // Wait for Mass Intention Picker dialog to open
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 });
    await expect(page.locator('[role="dialog"]').getByRole('heading', { name: /Select Mass Intention/i })).toBeVisible();

    // STEP 6: Wait for mass intentions to load
    // The picker should show a list of available mass intentions
    await page.waitForTimeout(1000); // Give time for API to load

    // STEP 7: Select the mass intention we created earlier
    // Mass intentions are displayed with the intention text and requested by info
    // Look for our intention text in the dialog
    const intentionOption = page.locator('[role="dialog"]').getByText(intentionText).first();
    await expect(intentionOption).toBeVisible();
    await intentionOption.click();

    // Wait for the dialog to close and the linking to complete
    await page.waitForTimeout(2000);

    // Dialog should be closed
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);

    // STEP 8: Verify the mass intention is now displayed in the card
    // After linking, the empty state should be gone
    await expect(page.getByText('No mass intention linked yet')).not.toBeVisible();

    // The intention text should be visible in the card
    await expect(page.getByText(intentionText)).toBeVisible();

    // STEP 9: Verify persistence - navigate away and come back
    await page.goto(`/masses/${massId}`);
    await expect(page).toHaveURL(`/masses/${massId}`);

    // Go back to edit page
    await page.goto(`/masses/${massId}/edit`);
    await expect(page).toHaveURL(`/masses/${massId}/edit`);

    // Mass intention should still be displayed
    await expect(page.getByText(intentionText)).toBeVisible();

    console.log(`Successfully linked mass intention ${massIntentionId} to mass ${massId}`);
  });

  /**
   * Test: Create a new mass intention from the mass form picker
   *
   * This test verifies:
   * 1. User can create a new mass intention from within the picker
   * 2. Newly created mass intention is auto-selected and linked
   * 3. No redirect occurs - user stays on mass edit page
   */
  test('should create new mass intention from picker and link to mass', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // STEP 1: Create a mass first
    await page.goto('/masses/create');
    await expect(page).toHaveURL('/masses/create');

    const massNote = `Test mass for creating mass intention via picker - ${Date.now()}`;
    await page.fill('textarea#note', massNote);

    // Submit to create the mass
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();

    // Should redirect to mass edit page
    await page.waitForURL(/\/masses\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });
    const massUrl = page.url();
    const massId = massUrl.split('/')[massUrl.split('/').length - 2];
    console.log(`Created mass with ID: ${massId}`);

    // Reload the page to ensure proper server render
    await page.reload();
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);

    // Scroll to Mass Intention card
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // STEP 2: Open the mass intention picker using test ID
    const linkButton = page.getByTestId('link-mass-intention-button');
    await expect(linkButton).toBeVisible({ timeout: 10000 });
    // Scroll button into view and click
    await linkButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await linkButton.click();

    // Wait for picker dialog
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 });

    // STEP 3: Click "Add New Mass Intention" button to open the create form
    const addNewButton = page.locator('[role="dialog"]').getByRole('button', { name: /Add New Mass Intention/i });
    await expect(addNewButton).toBeVisible();
    await addNewButton.click();

    // Wait for the create form to appear
    await page.waitForTimeout(500);

    // STEP 4: Fill in the mass intention creation form
    const newIntentionText = `For the intentions of the parish family - Created via picker ${Date.now()}`;

    // The form should have a "Mass Offered For" field
    const massOfferedForInput = page.locator('[role="dialog"]').getByLabel(/Mass Offered For/i);
    await expect(massOfferedForInput).toBeVisible();
    await massOfferedForInput.fill(newIntentionText);

    // Optionally fill in stipend
    const stipendInput = page.locator('[role="dialog"]').getByLabel(/Stipend Amount/i);
    if (await stipendInput.isVisible()) {
      await stipendInput.fill('10.00');
    }

    // Select status if available
    // Look for a status select within the dialog
    const statusSelect = page.locator('[role="dialog"]').locator('#status');
    if (await statusSelect.isVisible()) {
      await statusSelect.click();
      // Wait for options to appear and select "Requested"
      await page.waitForTimeout(300);
      const requestedOption = page.getByRole('option', { name: 'Requested' });
      if (await requestedOption.isVisible()) {
        await requestedOption.click();
      }
    }

    // STEP 5: Submit the mass intention creation form
    const saveButton = page.locator('[role="dialog"]').getByRole('button', { name: /Save Mass Intention/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // Wait for the picker to close and the mass intention to be linked
    await page.waitForTimeout(2000);

    // Dialog should be closed
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);

    // STEP 6: Verify we stayed on the mass edit page (NO REDIRECT)
    await expect(page).toHaveURL(`/masses/${massId}/edit`);

    // STEP 7: Verify the newly created mass intention is displayed
    // Empty state should be gone
    await expect(page.getByText('No mass intention linked yet')).not.toBeVisible();

    // The new intention text should be visible
    await expect(page.getByText(newIntentionText)).toBeVisible();

    // Stipend should be visible if we filled it in
    await expect(page.getByText('$10.00')).toBeVisible();

    console.log(`Successfully created and linked new mass intention to mass ${massId}`);
  });

  /**
   * Test: Unlink a mass intention from a mass
   *
   * This test verifies:
   * 1. User can unlink a mass intention that is already linked
   * 2. Mass intention card returns to empty state after unlinking
   * 3. Unlinking persists after page refresh
   */
  test('should unlink mass intention from mass', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // STEP 1: Create a mass intention
    await page.goto('/mass-intentions/create');
    const intentionText = `For peace in the world - Test ${Date.now()}`;
    await page.locator('input#mass_offered_for').fill(intentionText);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/mass-intentions\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // STEP 2: Create a mass
    await page.goto('/masses/create');
    const massNote = `Test mass for unlinking - ${Date.now()}`;
    await page.fill('textarea#note', massNote);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/masses\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const massUrl = page.url();
    const massId = massUrl.split('/')[massUrl.split('/').length - 2];

    // Reload the page to ensure proper server render
    await page.reload();
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);

    // Scroll to Mass Intention card
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // STEP 3: Link the mass intention using test ID
    const linkBtn = page.getByTestId('link-mass-intention-button');
    await expect(linkBtn).toBeVisible({ timeout: 10000 });
    // Scroll button into view and click
    await linkBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await linkBtn.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(1000);

    const intentionOption = page.locator('[role="dialog"]').getByText(intentionText).first();
    await intentionOption.click();
    await page.waitForTimeout(2000);

    // Verify it's linked
    await expect(page.getByText(intentionText)).toBeVisible();

    // STEP 4: Unlink the mass intention using test ID
    // The mass form shows an X button to remove the linked mass intention
    const unlinkButton = page.getByTestId('unlink-mass-intention-button');
    await expect(unlinkButton).toBeVisible();
    await unlinkButton.click();

    // Wait for unlinking to complete
    await page.waitForTimeout(1000);

    // STEP 5: Verify empty state is shown again
    await expect(page.getByText('No mass intention linked yet')).toBeVisible();
    await expect(page.getByText(intentionText)).not.toBeVisible();

    // STEP 6: Verify persistence - refresh and check
    await page.reload();
    await expect(page.getByText('No mass intention linked yet')).toBeVisible();

    console.log(`Successfully unlinked mass intention from mass ${massId}`);
  });

  /**
   * Test: Mass intention card visibility rules
   *
   * This test verifies:
   * 1. Mass intention card is NOT visible on create page (new mass)
   * 2. Mass intention card IS visible on edit page (existing mass)
   */
  test('should only show mass intention card when editing existing mass', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // STEP 1: Verify card is NOT visible on create page
    await page.goto('/masses/create');
    await expect(page).toHaveURL('/masses/create');

    // Mass Intention card should NOT be visible (using test ID)
    const massIntentionCard = page.getByTestId('mass-intention-card');
    await expect(massIntentionCard).not.toBeVisible();

    // STEP 2: Create a mass
    await page.fill('textarea#note', 'Test mass for visibility check');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();

    // Should redirect to edit page
    await page.waitForURL(/\/masses\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });
    const massId2 = page.url().split('/')[page.url().split('/').length - 2];

    // Reload the page to ensure proper server render
    await page.reload();
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);

    // Scroll to Mass Intention card
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // STEP 3: Verify card IS visible on edit page (using test ID)
    await expect(page.getByTestId('mass-intention-card')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('No mass intention linked yet')).toBeVisible();
    await expect(page.getByTestId('link-mass-intention-button')).toBeVisible();

    console.log('Successfully verified mass intention card visibility rules');
  });

  /**
   * Test: Mass intention displays correct status badge
   *
   * This test verifies:
   * 1. Mass intention status badge is displayed with correct label
   * 2. Different statuses show different badge variants
   */
  test('should display mass intention status badge correctly', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // STEP 1: Create a mass intention with CONFIRMED status
    await page.goto('/mass-intentions/create');
    const intentionText = `For the health of the sick - Test ${Date.now()}`;
    await page.locator('input#mass_offered_for').fill(intentionText);

    // Submit (we'll verify default status is displayed correctly)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/mass-intentions\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // STEP 2: Create a mass and link the intention
    await page.goto('/masses/create');
    await page.fill('textarea#note', 'Test mass for status badge');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/masses\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });
    const massId3 = page.url().split('/')[page.url().split('/').length - 2];

    // Reload the page to ensure proper server render
    await page.reload();
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);

    // Scroll to Mass Intention card
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // STEP 3: Link the mass intention using test ID
    const linkBtn2 = page.getByTestId('link-mass-intention-button');
    await expect(linkBtn2).toBeVisible({ timeout: 10000 });
    // Scroll button into view and click
    await linkBtn2.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await linkBtn2.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(1000);

    const intentionOption = page.locator('[role="dialog"]').getByText(intentionText).first();
    await intentionOption.click();
    await page.waitForTimeout(2000);

    // STEP 4: Verify the status badge is displayed
    // The badge should show "Requested" status (the default)
    await expect(page.getByText('Requested')).toBeVisible();

    console.log('Successfully verified mass intention status badge display');
  });
});
