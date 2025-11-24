import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Person Picker Component', () => {
  test('should open picker, search for existing person, and select', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // First, create a test person that we can search for
    await page.goto('/people/create');
    await page.locator('#first_name').fill('Sarah');
    await page.locator('#last_name').fill('Johnson');
    await page.locator('#email').fill('sarah.johnson@test.com');
    // Use .last() to get the actual submit button (there are duplicate buttons on the page)
    await page.getByRole('button', { name: /Save Person/i }).last().click();
    await page.waitForURL(/\/people\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Now go to a wedding form to test the picker
    await page.goto('/weddings/create');
    await expect(page).toHaveURL('/weddings/create');

    // Find and click the Bride picker button using testId
    await page.getByTestId('bride-trigger').click();

    // Wait for the dialog to open
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Verify dialog title
    await expect(page.locator('[role="dialog"]').getByRole('heading', { name: /Select Person/i })).toBeVisible();

    // Form auto-opens when no person is selected (openToNewPerson=true in create mode)
    // Click Cancel to close the auto-opened create form and return to list view
    const cancelButton = page.locator('[role="dialog"]').getByRole('button', { name: /Cancel/i });
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      await page.waitForTimeout(300);
    }

    // Now search for the person we just created
    const searchInput = page.locator('[role="dialog"]').getByPlaceholder(/Search/i);
    await searchInput.fill('Sarah');

    // Wait a moment for search to filter
    await page.waitForTimeout(500);

    // Click on the person from the search results
    const personButton = page.locator('[role="dialog"]').getByRole('button', { name: /Sarah Johnson/i });
    await personButton.click();

    // Dialog should close and person should be selected
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();

    // Verify the selected person appears in the trigger button
    await expect(page.locator('button:has-text("Sarah Johnson")')).toBeVisible();
  });

  test('should create new person inline and auto-select', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Go to wedding form
    await page.goto('/weddings/create');
    await expect(page).toHaveURL('/weddings/create');

    // Open the Groom picker using testId
    await page.getByTestId('groom-trigger').click();

    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Form should auto-open when no person is selected (openToNewPerson=true in create mode)
    // Wait a moment for form to be ready
    await page.waitForTimeout(300);

    // Fill in the create form within the dialog
    const dialog = page.locator('[role="dialog"]');

    const firstName = `TestGroom${Date.now()}`;
    const lastName = 'Smith';

    await dialog.locator('#first_name').fill(firstName);
    await dialog.locator('#last_name').fill(lastName);

    // Optional: Fill email if visible
    const emailInput = dialog.getByLabel('Email');
    if (await emailInput.isVisible()) {
      await emailInput.fill(`${firstName.toLowerCase()}@test.com`);
    }

    // Submit the create form (button text is "Save Person")
    const createButton = dialog.getByRole('button', { name: /Save Person/i });
    await createButton.click();

    // Wait briefly for creation
    await page.waitForTimeout(1500);

    // Dialog should close automatically after creation and auto-selection
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });

    // Verify the newly created person is selected in the form
    await expect(page.locator(`button:has-text("${firstName} ${lastName}")`)).toBeVisible();
  });

  test('should show empty state when no people match search', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/weddings/create');

    // Open picker using testId
    await page.getByTestId('presider-trigger').click();

    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Form auto-opens when no person is selected (openToNewPerson=true in create mode)
    // Click Cancel to close the auto-opened create form and return to list view
    const cancelButton = page.locator('[role="dialog"]').getByRole('button', { name: /Cancel/i });
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      await page.waitForTimeout(300);
    }

    // Search for something that doesn't exist
    const searchInput = page.locator('[role="dialog"]').getByPlaceholder(/Search/i);
    await searchInput.fill('NonExistentPersonXYZ123');

    // Wait for search to filter
    await page.waitForTimeout(500);

    // Should show "No results found" or similar message
    await expect(page.locator('[role="dialog"]').locator('text=/No.*found/i')).toBeVisible();
  });

  test('should allow clearing selection and reselecting different person', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Create two test people
    await page.goto('/people/create');
    await page.locator('#first_name').fill('Alice');
    await page.locator('#last_name').fill('Cooper');
    // Use .last() to get the actual submit button (there are duplicate buttons on the page)
    await page.getByRole('button', { name: /Save Person/i }).last().click();
    await page.waitForURL(/\/people\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    await page.goto('/people/create');
    await page.locator('#first_name').fill('Bob');
    await page.locator('#last_name').fill('Dylan');
    // Use .last() to get the actual submit button (there are duplicate buttons on the page)
    await page.getByRole('button', { name: /Save Person/i }).last().click();
    await page.waitForURL(/\/people\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Go to wedding form
    await page.goto('/weddings/create');

    // Select first person (Alice) using testId
    await page.getByTestId('homilist-trigger').click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    // Form auto-opens when no person is selected - close it to search
    const cancelButton = page.locator('[role="dialog"]').getByRole('button', { name: /Cancel/i });
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      await page.waitForTimeout(300);
    }

    await page.locator('[role="dialog"]').getByPlaceholder(/Search/i).fill('Alice');
    await page.waitForTimeout(500);
    await page.locator('[role="dialog"]').getByRole('button', { name: /Alice Cooper/i }).click();

    // Verify Alice is selected (use testid to avoid strict mode violation)
    await expect(page.getByTestId('homilist-selected-value')).toContainText('Alice Cooper');

    // Reopen picker and select different person (Bob) using testId
    await page.getByTestId('homilist-selected-value').click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    // If form auto-opened, close it to see the search
    await page.waitForTimeout(300);
    const cancelBtn = page.locator('[role="dialog"]').getByRole('button', { name: /Cancel/i });
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      await page.waitForTimeout(300);
    }

    // Clear search and search for Bob
    const searchInput = page.locator('[role="dialog"]').getByPlaceholder(/Search/i);
    await searchInput.clear();
    await searchInput.fill('Bob');
    await page.waitForTimeout(500);
    await page.locator('[role="dialog"]').getByRole('button', { name: /Bob Dylan/i }).click();

    // Verify Bob is now selected instead of Alice
    await expect(page.getByTestId('homilist-selected-value')).toContainText('Bob Dylan');
    await expect(page.getByTestId('homilist-selected-value')).not.toContainText('Alice Cooper');
  });

  test('should validate required fields when creating person inline', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/weddings/create');

    // Open picker using testId
    await page.getByTestId('coordinator-trigger').click();

    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    // Form should auto-open when no person is selected (openToNewPerson=true in create mode)
    // Wait a moment for form to be ready
    await page.waitForTimeout(300);

    // Try to submit without filling required fields (button text is "Save Person")
    const createButton = page.locator('[role="dialog"]').getByRole('button', { name: /Save Person/i });
    await createButton.click();

    // Should show validation errors (form should stay open)
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Validation error text might appear (implementation-specific)
    // The form should NOT submit and the dialog should stay open

    // Now fill in required fields
    await page.locator('[role="dialog"]').locator('#first_name').fill('Valid');
    await page.locator('[role="dialog"]').locator('#last_name').fill('Person');

    // Submit should now work (button text is "Save Person")
    await createButton.click();
    await page.waitForTimeout(1500);

    // Dialog should close this time
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator('button:has-text("Valid Person")')).toBeVisible();
  });

  test('should preserve form context when using picker (no navigation away)', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/weddings/create');

    // Fill in some form data first
    await page.locator('#status').click();
    await page.getByRole('option', { name: 'Active' }).first().click();

    await page.fill('textarea#notes', 'Important wedding notes that should not be lost');

    // Now open picker and create a person using testId
    await page.getByTestId('bride-trigger').click();

    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    // Form should auto-open when no person is selected - wait for it
    await page.waitForTimeout(300);

    const firstName = `ContextTest${Date.now()}`;
    await page.locator('[role="dialog"]').locator('#first_name').fill(firstName);
    await page.locator('[role="dialog"]').locator('#last_name').fill('TestLast');
    // Submit the create form (button text is "Save Person")
    await page.locator('[role="dialog"]').getByRole('button', { name: /Save Person/i }).click();

    await page.waitForTimeout(1500);

    // Verify we're still on the create page (no navigation occurred)
    await expect(page).toHaveURL('/weddings/create');

    // Verify our original form data is still there
    await expect(page.locator('textarea#notes')).toHaveValue('Important wedding notes that should not be lost');

    // And the new person is selected (use testid to avoid strict mode violation)
    await expect(page.getByTestId('bride-selected-value')).toContainText(`${firstName} TestLast`);
  });

  test('should reopen picker in edit mode when clicking on selected person field', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Create two test people that we can select between
    await page.goto('/people/create');
    await page.locator('#first_name').fill('Emily');
    await page.locator('#last_name').fill('Watson');
    await page.locator('#email').fill('emily.watson@test.com');
    // Use .last() to get the actual submit button (there are duplicate buttons on the page)
    await page.getByRole('button', { name: /Save Person/i }).last().click();
    await page.waitForURL(/\/people\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    await page.goto('/people/create');
    await page.locator('#first_name').fill('Michael');
    await page.locator('#last_name').fill('Chen');
    await page.locator('#email').fill('michael.chen@test.com');
    // Use .last() to get the actual submit button (there are duplicate buttons on the page)
    await page.getByRole('button', { name: /Save Person/i }).last().click();
    await page.waitForURL(/\/people\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Go to wedding form
    await page.goto('/weddings/create');
    await expect(page).toHaveURL('/weddings/create');

    // Select the first person (Emily) for Lead Musician using testId
    await page.getByTestId('lead-musician-trigger').click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Form auto-opens when no person is selected - close it to search
    const cancelButton = page.locator('[role="dialog"]').getByRole('button', { name: /Cancel/i });
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      await page.waitForTimeout(300);
    }

    await page.locator('[role="dialog"]').getByPlaceholder(/Search/i).fill('Emily');
    await page.waitForTimeout(500);
    await page.locator('[role="dialog"]').getByRole('button', { name: /Emily Watson/i }).click();

    // Dialog should close and Emily should be selected
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    await expect(page.getByTestId('lead-musician-selected-value')).toContainText('Emily Watson');

    // NOW: Click on the selected person field itself (not the X button) to reopen picker
    await page.getByTestId('lead-musician-selected-value').click();

    // Dialog should open
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.locator('[role="dialog"]').getByRole('heading', { name: /Select Person/i })).toBeVisible();

    // If form auto-opened when clicking selected value, close it to see the search
    await page.waitForTimeout(300);
    const cancelBtn = page.locator('[role="dialog"]').getByRole('button', { name: /Cancel/i });
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      await page.waitForTimeout(300);
    }

    // Search for and select Michael instead
    const searchInput = page.locator('[role="dialog"]').getByPlaceholder(/Search/i);
    await searchInput.fill('Michael');
    await page.waitForTimeout(500);
    await page.locator('[role="dialog"]').getByRole('button', { name: /Michael Chen/i }).click();

    // Dialog should close and Michael should now be selected instead of Emily
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    await expect(page.getByTestId('lead-musician-selected-value')).toContainText('Michael Chen');

    // Emily should no longer be displayed in the Lead Musician field
    await expect(page.getByTestId('lead-musician-selected-value')).not.toContainText('Emily Watson');
  });
});
