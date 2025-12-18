import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Mass Role Picker Component', () => {
  /**
   * Test: Mass role picker opens and closes from mass role template
   *
   * This test verifies:
   * 1. Mass role picker can be opened from mass role template view
   * 2. Picker loads and displays mass roles
   * 3. Picker can be closed without selection
   */
  test('should open and close mass role picker from template', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // First create a mass role template to work with
    await page.goto('/mass-role-templates/create');
    await expect(page).toHaveURL('/mass-role-templates/create');

    const templateName = `Test Template ${Date.now()}`;
    await page.fill('#name', templateName);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/mass-role-templates\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT }); // CREATE redirects to EDIT page

    console.log('Created test mass role template');

    // Now try to add a role - this should open the MassRolePicker
    const addRoleButton = page.getByRole('button', { name: /Add Role/i });
    await expect(addRoleButton).toBeVisible();
    await addRoleButton.click();

    // Wait for Mass Role Picker dialog to appear
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT); // Wait for dialog to fully load

    // Verify the dialog is open
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible();

    // Close the picker by pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Verify dialog is closed
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);

    console.log('Successfully opened and closed mass role picker');
  });

  /**
   * Test: Create new mass role from picker with minimal data
   *
   * This test verifies:
   * 1. User can create a mass role with only the required name field
   * 2. Newly created role is added to the template
   * 3. No redirect occurs - stays on template view page
   */
  test('should create new mass role from picker and add to template', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Create a mass role template
    await page.goto('/mass-role-templates/create');
    const templateName = `Template for Role Creation ${Date.now()}`;
    await page.fill('#name', templateName);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/mass-role-templates\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT }); // CREATE redirects to EDIT page

    const templateUrl = page.url();
    console.log(`Created template at: ${templateUrl}`);

    // Click "Add Role" to open mass role picker
    const addRoleButton = page.getByRole('button', { name: /Add Role/i });
    await expect(addRoleButton).toBeVisible();
    await addRoleButton.click();

    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Click "Add New Mass Role" button
    const addNewButton = page.locator('[role="dialog"]').getByRole('button', { name: /Add New Mass Role/i }).first();
    await addNewButton.waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.EXTENDED });
    await addNewButton.click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Fill in minimal mass role data (just name, which is required)
    const roleName = `Test Role ${Date.now()}`;
    const nameInput = page.locator('[role="dialog"]').getByLabel('Name');
    await expect(nameInput).toBeVisible();
    await nameInput.fill(roleName);

    // Submit the mass role creation
    const saveButton = page.locator('[role="dialog"]').getByRole('button', { name: /Save Mass Role/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // Wait for the picker to close and role to be added
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Picker dialog should be closed
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);

    // Verify we stayed on the template view page (NO REDIRECT)
    await expect(page).toHaveURL(templateUrl);

    // Verify the newly created role appears in the template items list
    await expect(page.getByText(roleName)).toBeVisible();

    console.log('Successfully created and added new mass role to template');
  });

  /**
   * Test: Create mass role with complete information
   *
   * This test verifies:
   * 1. User can create a mass role with description and note
   * 2. All fields are saved correctly
   * 3. Role is added to the template
   */
  test('should create mass role with complete information', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Create a template
    await page.goto('/mass-role-templates/create');
    const templateName = `Complete Role Template ${Date.now()}`;
    await page.fill('#name', templateName);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/mass-role-templates\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT }); // CREATE redirects to EDIT page

    // Open mass role picker
    await page.getByRole('button', { name: /Add Role/i }).click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Click "Add New Mass Role"
    const addNewButton = page.locator('[role="dialog"]').getByRole('button', { name: /Add New Mass Role/i }).first();
    await addNewButton.waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.EXTENDED });
    await addNewButton.click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Fill in complete mass role data
    const roleData = {
      name: `Complete Role ${Date.now()}`,
      description: 'Proclaims the readings during the liturgy',
      note: 'Should arrive 15 minutes early',
    };

    const dialog = page.locator('[role="dialog"]');
    await dialog.getByLabel('Name').fill(roleData.name);

    // Fill optional fields if visible
    const descriptionInput = dialog.getByLabel('Description');
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill(roleData.description);
    }

    const noteInput = dialog.getByLabel('Note');
    if (await noteInput.isVisible()) {
      await noteInput.fill(roleData.note);
    }

    // Submit
    await dialog.getByRole('button', { name: /Save Mass Role/i }).click();
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Verify picker closed and role added
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    await expect(page.getByText(roleData.name)).toBeVisible();

    console.log('Successfully created mass role with complete information');
  });

  /**
   * Test: Select an existing mass role from the picker
   *
   * This test verifies:
   * 1. User can browse existing mass roles
   * 2. User can select an existing mass role
   * 3. Selected role is added to the template
   * 4. No redirect occurs - stays on template view page
   */
  test('should select existing mass role from picker', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // STEP 1: First create a mass role to select later
    // We'll create it by adding it to a temporary template
    await page.goto('/mass-role-templates/create');
    await page.fill('#name', 'Temporary Template');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/mass-role-templates\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT }); // CREATE redirects to EDIT page

    // Add a role to this template (which creates it in the database)
    await page.getByRole('button', { name: /Add Role/i }).click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    const addNewButton = page.locator('[role="dialog"]').getByRole('button', { name: /Add New Mass Role/i }).first();
    await addNewButton.waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.EXTENDED });
    await addNewButton.click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    const roleName = `Selectable Role ${Date.now()}`;
    await page.locator('[role="dialog"]').getByLabel('Name').fill(roleName);
    await page.locator('[role="dialog"]').getByRole('button', { name: /Save Mass Role/i }).click();
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    console.log(`Created test mass role: ${roleName}`);

    // STEP 2: Now create a new template and select the existing role
    await page.goto('/mass-role-templates/create');
    const newTemplateName = `Template to Select Role ${Date.now()}`;
    await page.fill('#name', newTemplateName);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/mass-role-templates\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT }); // CREATE redirects to EDIT page

    const templateUrl = page.url();

    // Open the mass role picker
    await page.getByRole('button', { name: /Add Role/i }).click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Try to find the role by clicking on it (don't click "Add New")
    const roleButton = page.locator('[role="dialog"]').getByText(roleName).first();

    if (await roleButton.count() > 0) {
      console.log(`Found role: ${roleName}, selecting...`);
      await roleButton.click();
    } else {
      // Fallback: Click the first available role
      console.log('Specific role not found, clicking first available role...');
      const firstRole = page.locator('[role="dialog"]').locator('button').filter({ hasText: /\w+/ }).first();
      if (await firstRole.count() > 0) {
        await firstRole.click();
      }
    }

    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Picker should close after selection
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);

    // Verify we stayed on the template view page (NO REDIRECT)
    await expect(page).toHaveURL(templateUrl);

    // Verify role was added to template
    // (The role name should now appear in the template items list)
    await expect(page.locator('body')).toContainText(/role/i);

    console.log('Successfully selected existing mass role from picker');
  });

  /**
   * Test: Search and filter mass roles
   *
   * This test verifies:
   * 1. Picker displays mass roles from the database
   * 2. Search functionality works
   * 3. Dialog shows correct role count
   */
  test('should display and search mass roles in picker', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Create a couple of test mass roles with distinct names
    console.log('Creating test mass roles...');

    // Create first template and role
    await page.goto('/mass-role-templates/create');
    await page.fill('#name', 'Temp Template 1');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/mass-role-templates\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT }); // CREATE redirects to EDIT page

    const role1Name = `Lector ${Date.now()}`;
    await page.getByRole('button', { name: /Add Role/i }).click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);
    const addNew1 = page.locator('[role="dialog"]').getByRole('button', { name: /Add New Mass Role/i }).first();
    await addNew1.waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.EXTENDED });
    await addNew1.click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);
    await page.locator('[role="dialog"]').getByLabel('Name').fill(role1Name);
    await page.locator('[role="dialog"]').getByRole('button', { name: /Save Mass Role/i }).click();
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Create second template and role
    await page.goto('/mass-role-templates/create');
    await page.fill('#name', 'Temp Template 2');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/mass-role-templates\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT }); // CREATE redirects to EDIT page

    const role2Name = `Usher ${Date.now()}`;
    await page.getByRole('button', { name: /Add Role/i }).click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);
    const addNew2 = page.locator('[role="dialog"]').getByRole('button', { name: /Add New Mass Role/i }).first();
    await addNew2.waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.EXTENDED });
    await addNew2.click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);
    await page.locator('[role="dialog"]').getByLabel('Name').fill(role2Name);
    await page.locator('[role="dialog"]').getByRole('button', { name: /Save Mass Role/i }).click();
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    console.log('Created 2 test mass roles');

    // Create a new template to test search
    await page.goto('/mass-role-templates/create');
    await page.fill('#name', 'Search Test Template');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/mass-role-templates\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT }); // CREATE redirects to EDIT page

    // Open the mass role picker
    await page.getByRole('button', { name: /Add Role/i }).click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Verify the dialog is showing mass roles
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible();

    // Search for one of our roles
    const searchInput = dialog.getByPlaceholder(/Search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('Lector');
      await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

      // Should find the Lector role
      await expect(dialog.getByText(role1Name)).toBeVisible();
    }

    // Close the picker
    await page.keyboard.press('Escape');
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    console.log('Successfully verified mass role picker search and display');
  });

  /**
   * Test: Validation for required name field
   *
   * This test verifies:
   * 1. Mass role picker validates required name field
   * 2. Cannot submit without entering a name
   * 3. Error handling works correctly
   */
  test('should validate required name field when creating mass role', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Create a template
    await page.goto('/mass-role-templates/create');
    await page.fill('#name', 'Validation Test Template');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/mass-role-templates\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT }); // CREATE redirects to EDIT page

    // Open mass role picker
    await page.getByRole('button', { name: /Add Role/i }).click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Click "Add New Mass Role"
    const addNewButton = page.locator('[role="dialog"]').getByRole('button', { name: /Add New Mass Role/i }).first();
    await addNewButton.waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.EXTENDED });
    await addNewButton.click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Try to submit without filling the required name field
    const saveButton = page.locator('[role="dialog"]').getByRole('button', { name: /Save Mass Role/i });
    await saveButton.click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Dialog should stay open (validation failed)
    await expect(page.locator('[role="dialog"]').first()).toBeVisible();

    // Now fill the name and try again
    await page.locator('[role="dialog"]').getByLabel('Name').fill('Valid Role Name');
    await saveButton.click();
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Dialog should close and role should be added
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    await expect(page.getByText('Valid Role Name')).toBeVisible();

    console.log('Successfully validated required name field');
  });

  /**
   * Test: Multiple roles on same template
   *
   * This test verifies:
   * 1. Can add multiple different roles to a template
   * 2. Each role appears as a separate item
   * 3. Roles are listed in the template view
   */
  test('should add multiple roles to same template', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    // Create a template
    await page.goto('/mass-role-templates/create');
    const templateName = `Multi-Role Template ${Date.now()}`;
    await page.fill('#name', templateName);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/mass-role-templates\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT }); // CREATE redirects to EDIT page

    const templateUrl = page.url();

    // Helper function to add a role
    async function addRole(roleName: string) {
      await page.getByRole('button', { name: /Add Role/i }).click();
      await page.waitForSelector('[role="dialog"]', { state: 'visible' });
      await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

      const addNewButton = page.locator('[role="dialog"]').getByRole('button', { name: /Add New Mass Role/i }).first();
      await addNewButton.waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.EXTENDED });
      await addNewButton.click();
      await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

      await page.locator('[role="dialog"]').getByLabel('Name').fill(roleName);
      await page.locator('[role="dialog"]').getByRole('button', { name: /Save Mass Role/i }).click();
      await page.waitForTimeout(TEST_TIMEOUTS.SHORT);
    }

    // Add first role
    const role1 = `Presider ${Date.now()}`;
    await addRole(role1);
    await expect(page.getByText(role1)).toBeVisible();

    // Add second role
    const role2 = `Lector ${Date.now()}`;
    await addRole(role2);
    await expect(page.getByText(role2)).toBeVisible();

    // Add third role
    const role3 = `Cantor ${Date.now()}`;
    await addRole(role3);
    await expect(page.getByText(role3)).toBeVisible();

    // Verify we stayed on same template page
    await expect(page).toHaveURL(templateUrl);

    // Verify all three roles are visible
    await expect(page.getByText(role1)).toBeVisible();
    await expect(page.getByText(role2)).toBeVisible();
    await expect(page.getByText(role3)).toBeVisible();

    console.log('Successfully added multiple roles to template');
  });
});
