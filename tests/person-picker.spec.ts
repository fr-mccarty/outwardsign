import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Person Picker Component', () => {
  test('should open picker, search for existing person, and select', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // First, create a test person that we can search for
    await page.goto('/people/create');
    await page.getByLabel('First Name').fill('Sarah');
    await page.getByLabel('Last Name').fill('Johnson');
    await page.getByLabel('Email').fill('sarah.johnson@test.com');
    await page.getByRole('button', { name: /Create Person/i }).click();
    await page.waitForURL(/\/people\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Now go to a wedding form to test the picker
    await page.goto('/weddings/create');
    await expect(page).toHaveURL('/weddings/create');

    // Find and click the Bride picker button
    // Find the container div that has a label with "Bride", then get the button
    await page.locator('div').filter({ has: page.locator('label', { hasText: 'Bride' }) }).getByRole('button').click();

    // Wait for the dialog to open
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Verify dialog title
    await expect(page.locator('[role="dialog"]').getByRole('heading', { name: /Select Person/i })).toBeVisible();

    // Search for the person we just created
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

    // Open the Groom picker
    await page.locator('div').filter({ has: page.locator('label', { hasText: 'Groom' }) }).getByRole('button').click();

    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Click "Add New" button to open create form
    const addNewButton = page.locator('[role="dialog"]').getByRole('button', { name: /Add New/i });
    await addNewButton.click();

    // Fill in the create form within the dialog
    const dialog = page.locator('[role="dialog"]');

    const firstName = `TestGroom${Date.now()}`;
    const lastName = 'Smith';

    await dialog.getByLabel('First Name').fill(firstName);
    await dialog.getByLabel('Last Name').fill(lastName);

    // Optional: Fill email if visible
    const emailInput = dialog.getByLabel('Email');
    if (await emailInput.isVisible()) {
      await emailInput.fill(`${firstName.toLowerCase()}@test.com`);
    }

    // Submit the create form
    const createButton = dialog.getByRole('button', { name: /Create/i });
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

    // Open picker
    await page.locator('div').filter({ has: page.locator('label', { hasText: 'Presider' }) }).getByRole('button').click();

    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

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
    await page.getByLabel('First Name').fill('Alice');
    await page.getByLabel('Last Name').fill('Cooper');
    await page.getByRole('button', { name: /Create Person/i }).click();
    await page.waitForURL(/\/people\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    await page.goto('/people/create');
    await page.getByLabel('First Name').fill('Bob');
    await page.getByLabel('Last Name').fill('Dylan');
    await page.getByRole('button', { name: /Create Person/i }).click();
    await page.waitForURL(/\/people\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Go to wedding form
    await page.goto('/weddings/create');

    // Select first person (Alice)
    await page.locator('div').filter({ has: page.locator('label', { hasText: 'Homilist' }) }).getByRole('button').click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    await page.locator('[role="dialog"]').getByPlaceholder(/Search/i).fill('Alice');
    await page.waitForTimeout(500);
    await page.locator('[role="dialog"]').getByRole('button', { name: /Alice Cooper/i }).click();

    await expect(page.locator('button:has-text("Alice Cooper")')).toBeVisible();

    // Reopen picker and select different person (Bob)
    await page.locator('div').filter({ has: page.locator('label', { hasText: 'Homilist' }) }).getByRole('button').first().click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    // Clear search and search for Bob
    const searchInput = page.locator('[role="dialog"]').getByPlaceholder(/Search/i);
    await searchInput.clear();
    await searchInput.fill('Bob');
    await page.waitForTimeout(500);
    await page.locator('[role="dialog"]').getByRole('button', { name: /Bob Dylan/i }).click();

    // Verify Bob is now selected instead of Alice
    await expect(page.locator('button:has-text("Bob Dylan")')).toBeVisible();
    await expect(page.locator('button:has-text("Alice Cooper")')).not.toBeVisible();
  });

  test('should validate required fields when creating person inline', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/weddings/create');

    // Open picker
    await page.locator('div').filter({ has: page.locator('label', { hasText: 'Coordinator' }) }).getByRole('button').click();

    // Wait for dialog
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    // Open create form
    await page.locator('[role="dialog"]').getByRole('button', { name: /Add New/i }).click();

    // Try to submit without filling required fields
    const createButton = page.locator('[role="dialog"]').getByRole('button', { name: /Create/i });
    await createButton.click();

    // Should show validation errors (form should stay open)
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Validation error text might appear (implementation-specific)
    // The form should NOT submit and the dialog should stay open

    // Now fill in required fields
    await page.locator('[role="dialog"]').getByLabel('First Name').fill('Valid');
    await page.locator('[role="dialog"]').getByLabel('Last Name').fill('Person');

    // Submit should now work
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

    await page.fill('textarea#note', 'Important wedding notes that should not be lost');

    // Now open picker and create a person
    await page.locator('div').filter({ has: page.locator('label', { hasText: 'Bride' }) }).getByRole('button').click();

    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.locator('[role="dialog"]').getByRole('button', { name: /Add New/i }).click();

    const firstName = `ContextTest${Date.now()}`;
    await page.locator('[role="dialog"]').getByLabel('First Name').fill(firstName);
    await page.locator('[role="dialog"]').getByLabel('Last Name').fill('TestLast');
    await page.locator('[role="dialog"]').getByRole('button', { name: /Create/i }).click();

    await page.waitForTimeout(1500);

    // Verify we're still on the create page (no navigation occurred)
    await expect(page).toHaveURL('/weddings/create');

    // Verify our original form data is still there
    await expect(page.locator('textarea#note')).toHaveValue('Important wedding notes that should not be lost');

    // And the new person is selected
    await expect(page.locator(`button:has-text("${firstName} TestLast")`)).toBeVisible();
  });

  test('should reopen picker in edit mode when clicking on selected person field', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Create two test people that we can select between
    await page.goto('/people/create');
    await page.getByLabel('First Name').fill('Emily');
    await page.getByLabel('Last Name').fill('Watson');
    await page.getByLabel('Email').fill('emily.watson@test.com');
    await page.getByRole('button', { name: /Create Person/i }).click();
    await page.waitForURL(/\/people\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    await page.goto('/people/create');
    await page.getByLabel('First Name').fill('Michael');
    await page.getByLabel('Last Name').fill('Chen');
    await page.getByLabel('Email').fill('michael.chen@test.com');
    await page.getByRole('button', { name: /Create Person/i }).click();
    await page.waitForURL(/\/people\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Go to wedding form
    await page.goto('/weddings/create');
    await expect(page).toHaveURL('/weddings/create');

    // Select the first person (Emily) for Lead Musician
    await page.locator('div').filter({ has: page.locator('label', { hasText: 'Lead Musician' }) }).getByRole('button').click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

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

    // The picker should show Emily as currently selected (highlighted/marked)
    // Search for and select Michael instead
    const searchInput = page.locator('[role="dialog"]').getByPlaceholder(/Search/i);
    await searchInput.clear();
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
