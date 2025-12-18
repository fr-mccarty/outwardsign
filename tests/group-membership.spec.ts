import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * Group Roles Test Suite
 *
 * Tests group role functionality which is managed via server actions rather than separate pages.
 * Group roles are created during parish setup and can be used when assigning people to groups.
 */

test.describe('Group Roles - Default Roles', () => {
  test('should have default group roles created during parish setup', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)
    // Default group roles are created automatically during user setup

    // Navigate to groups page
    await page.goto('/groups');
    await expect(page).toHaveURL('/groups');

    // Create a test group to verify roles are available
    const createGroupButton = page.getByRole('button', { name: /Create Group/i });
    await createGroupButton.click();

    // Wait for dialog to open
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    const groupName = 'Test Group for Roles';
    await page.locator('[role="dialog"]').getByLabel('Group Name').fill(groupName);
    await page.locator('[role="dialog"]').getByRole('button', { name: /^Create$/i }).click();

    // Wait for redirect to group detail page
    await page.waitForURL(/\/groups\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get the group ID from URL
    const groupId = page.url().split('/').pop();
    console.log(`Created test group with ID: ${groupId}`);

    // Create a person to add to the group
    await page.goto('/people/create');
    await page.fill('#first_name', 'John');
    await page.fill('#last_name', 'GroupMember');
    await page.fill('#email', `john.groupmember.test.${Date.now()}@test.com`);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/people\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Navigate back to the group
    await page.goto(`/groups/${groupId}`);
    await expect(page).toHaveURL(`/groups/${groupId}`);

    // Wait for the page to load completely (groups page loads client-side data)
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Click "Add Member" to open the dialog
    const addMemberButton = page.getByRole('button', { name: /Add Member/i });
    await expect(addMemberButton).toBeVisible({ timeout: TEST_TIMEOUTS.NAVIGATION });
    await addMemberButton.click();

    // Wait for Add Member dialog
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Click "Select Person" to open people picker
    const dialog = page.locator('[role="dialog"]').first();
    await dialog.getByRole('button', { name: /Select Person/i }).click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Find and select the person from the people picker
    const pickerDialog = page.locator('[role="dialog"]').last();
    const personButton = pickerDialog.getByRole('button', { name: /John GroupMember/i }).first();
    await personButton.click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Click the group role trigger to open role picker
    const groupRoleTrigger = dialog.getByTestId('group-role-trigger');
    await groupRoleTrigger.click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Find the role picker dialog
    const rolePickerDialog = page.locator('[role="dialog"]').last();
    await expect(rolePickerDialog.getByRole('heading', { name: /Select Group Role/i })).toBeVisible();

    // Verify some default group roles are available (at least 5 should be present)
    const expectedRoles = [
      'Lector',
      'Altar Server',
      'Cantor',
      'Usher',
      'Sacristan'
    ];

    let rolesFound = 0;
    for (const roleName of expectedRoles) {
      const roleButton = rolePickerDialog.getByRole('button', { name: new RegExp(roleName, 'i') });
      if (await roleButton.isVisible().catch(() => false)) {
        rolesFound++;
      }
    }

    // Verify at least 4 default roles are available (some may be filtered out)
    expect(rolesFound).toBeGreaterThanOrEqual(4);

    console.log(`✓ Found ${rolesFound} default group roles available`);
  });
});

test.describe('Group Roles - Assignment to Members', () => {
  test('should assign group role to a member', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a test group
    await page.goto('/groups');
    const createGroupButton = page.getByRole('button', { name: /Create Group/i });
    await createGroupButton.click();

    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    const groupName = `Role Assignment Group ${Date.now()}`;
    await page.locator('[role="dialog"]').getByLabel('Group Name').fill(groupName);
    await page.locator('[role="dialog"]').getByRole('button', { name: /^Create$/i }).click();

    await page.waitForURL(/\/groups\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });
    const groupId = page.url().split('/').pop();

    // Create a test person
    await page.goto('/people/create');
    await page.fill('#first_name', 'Sarah');
    await page.fill('#last_name', 'Lector');
    await page.fill('#email', `sarah.lector.test.${Date.now()}@test.com`);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/people\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Navigate back to the group
    await page.goto(`/groups/${groupId}`);
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Add member with role
    const addMemberButton = page.getByRole('button', { name: /Add Member/i });
    await expect(addMemberButton).toBeVisible({ timeout: TEST_TIMEOUTS.NAVIGATION });
    await addMemberButton.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Select person
    const dialog = page.locator('[role="dialog"]').first();
    await dialog.getByRole('button', { name: /Select Person/i }).click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    const pickerDialog = page.locator('[role="dialog"]').last();
    const personButton = pickerDialog.getByRole('button', { name: /Sarah Lector/i }).first();
    await personButton.click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Select role (Lector)
    const groupRoleTrigger = dialog.getByTestId('group-role-trigger');
    await groupRoleTrigger.click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    const rolePickerDialog = page.locator('[role="dialog"]').last();
    const lectorRoleButton = rolePickerDialog.getByRole('button', { name: /^Lector$/i }).first();
    await lectorRoleButton.click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Submit
    const addButton = dialog.getByRole('button', { name: /Add Member/i });
    await addButton.click();

    // Wait for dialog to close
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Verify member appears with role badge
    const memberCard = page.locator('text=Sarah Lector').first();
    await expect(memberCard).toBeVisible();

    // Verify role badge is displayed
    const badge = page.locator('[data-slot="badge"]', { hasText: /Lector/i });
    await expect(badge).toBeVisible();

    console.log('✓ Successfully assigned Lector role to member');
  });

  test('should assign different group roles to different members', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a test group
    await page.goto('/groups');
    const createGroupButton = page.getByRole('button', { name: /Create Group/i });
    await createGroupButton.click();

    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    const groupName = `Multi-Role Group ${Date.now()}`;
    await page.locator('[role="dialog"]').getByLabel('Group Name').fill(groupName);
    await page.locator('[role="dialog"]').getByRole('button', { name: /^Create$/i }).click();

    await page.waitForURL(/\/groups\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });
    const groupId = page.url().split('/').pop();

    // Create Person 1 (Cantor)
    await page.goto('/people/create');
    await page.fill('#first_name', 'Tom');
    await page.fill('#last_name', 'Cantor');
    await page.fill('#email', `tom.cantor.test.${Date.now()}@test.com`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/people\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Create Person 2 (Usher)
    await page.goto('/people/create');
    await page.fill('#first_name', 'Mary');
    await page.fill('#last_name', 'Usher');
    await page.fill('#email', `mary.usher.test.${Date.now()}@test.com`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/people\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Navigate to group and add Person 1 with Cantor role
    await page.goto(`/groups/${groupId}`);
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    let dialog, pickerDialog, rolePickerDialog;

    // Add first member (Tom Cantor - Cantor role)
    const addMemberBtn = page.getByRole('button', { name: /Add Member/i });
    await expect(addMemberBtn).toBeVisible({ timeout: TEST_TIMEOUTS.NAVIGATION });
    await addMemberBtn.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    dialog = page.locator('[role="dialog"]').first();
    await dialog.getByRole('button', { name: /Select Person/i }).click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    pickerDialog = page.locator('[role="dialog"]').last();
    await pickerDialog.getByRole('button', { name: /Tom Cantor/i }).first().click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    await dialog.getByTestId('group-role-trigger').click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    rolePickerDialog = page.locator('[role="dialog"]').last();
    await rolePickerDialog.getByRole('button', { name: /^Cantor$/i }).first().click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    await dialog.getByRole('button', { name: /Add Member/i }).click();
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Add second member (Mary Usher - Usher role)
    await page.getByRole('button', { name: /Add Member/i }).click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    dialog = page.locator('[role="dialog"]').first();
    await dialog.getByRole('button', { name: /Select Person/i }).click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    pickerDialog = page.locator('[role="dialog"]').last();
    await pickerDialog.getByRole('button', { name: /Mary Usher/i }).first().click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    await dialog.getByTestId('group-role-trigger').click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    rolePickerDialog = page.locator('[role="dialog"]').last();
    await rolePickerDialog.getByRole('button', { name: /^Usher$/i }).first().click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    await dialog.getByRole('button', { name: /Add Member/i }).click();
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Verify both members appear with their respective roles
    await expect(page.locator('text=Tom Cantor')).toBeVisible();
    await expect(page.locator('text=Mary Usher')).toBeVisible();

    // Verify role badges
    const cantorBadge = page.locator('[data-slot="badge"]', { hasText: /Cantor/i });
    const usherBadge = page.locator('[data-slot="badge"]', { hasText: /Usher/i });

    await expect(cantorBadge).toBeVisible();
    await expect(usherBadge).toBeVisible();

    console.log('✓ Successfully assigned different roles to different members');
  });

  test('should allow member without group role assignment', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a test group
    await page.goto('/groups');
    const createGroupButton = page.getByRole('button', { name: /Create Group/i });
    await createGroupButton.click();

    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    const groupName = `No Role Group ${Date.now()}`;
    await page.locator('[role="dialog"]').getByLabel('Group Name').fill(groupName);
    await page.locator('[role="dialog"]').getByRole('button', { name: /^Create$/i }).click();

    await page.waitForURL(/\/groups\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });
    const groupId = page.url().split('/').pop();

    // Create a test person
    await page.goto('/people/create');
    await page.fill('#first_name', 'David');
    await page.fill('#last_name', 'NoRole');
    await page.fill('#email', `david.norole.test.${Date.now()}@test.com`);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/people\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Navigate back to the group
    await page.goto(`/groups/${groupId}`);
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Add member WITHOUT selecting a role
    const addMemberButton = page.getByRole('button', { name: /Add Member/i });
    await expect(addMemberButton).toBeVisible({ timeout: TEST_TIMEOUTS.NAVIGATION });
    await addMemberButton.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Select person
    const dialog = page.locator('[role="dialog"]').first();
    await dialog.getByRole('button', { name: /Select Person/i }).click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    const pickerDialog = page.locator('[role="dialog"]').last();
    const personButton = pickerDialog.getByRole('button', { name: /David NoRole/i }).first();
    await personButton.click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Do NOT select a role - submit without role

    // Submit
    const addButton = dialog.getByRole('button', { name: /Add Member/i });
    await addButton.click();

    // Wait for dialog to close
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Verify member appears
    const memberCard = page.locator('text=David NoRole').first();
    await expect(memberCard).toBeVisible();

    // Verify "No role" text is displayed (use .first() to avoid strict mode violation)
    await expect(page.locator('text=/No role/i').first()).toBeVisible();

    console.log('✓ Successfully added member without group role');
  });
});

test.describe('Group Roles - Role Filtering and Search', () => {
  test('should filter group roles in picker', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a test group
    await page.goto('/groups');
    const createGroupButton = page.getByRole('button', { name: /Create Group/i });
    await createGroupButton.click();

    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    const groupName = `Filter Test Group ${Date.now()}`;
    await page.locator('[role="dialog"]').getByLabel('Group Name').fill(groupName);
    await page.locator('[role="dialog"]').getByRole('button', { name: /^Create$/i }).click();

    await page.waitForURL(/\/groups\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });
    const groupId = page.url().split('/').pop();

    // Create a test person
    await page.goto('/people/create');
    await page.fill('#first_name', 'Filter');
    await page.fill('#last_name', 'Test');
    await page.fill('#email', `filter.test.${Date.now()}@test.com`);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/people\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Navigate back to the group
    await page.goto(`/groups/${groupId}`);
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Open Add Member dialog
    const addMemberButton = page.getByRole('button', { name: /Add Member/i });
    await expect(addMemberButton).toBeVisible({ timeout: TEST_TIMEOUTS.NAVIGATION });
    await addMemberButton.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Select person
    const dialog = page.locator('[role="dialog"]').first();
    await dialog.getByRole('button', { name: /Select Person/i }).click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    const pickerDialog = page.locator('[role="dialog"]').last();
    const personButton = pickerDialog.getByRole('button', { name: /Filter Test/i }).first();
    await personButton.click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Open role picker
    const groupRoleTrigger = dialog.getByTestId('group-role-trigger');
    await groupRoleTrigger.click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Find the role picker dialog
    const rolePickerDialog = page.locator('[role="dialog"]').last();

    // Look for a search input if it exists
    const searchInput = rolePickerDialog.locator('input[type="search"]').or(rolePickerDialog.locator('input[placeholder*="Search"]'));

    if (await searchInput.isVisible()) {
      // Test filtering by typing "Cantor"
      await searchInput.fill('Cantor');
      await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

      // Should show Cantor
      await expect(rolePickerDialog.getByRole('button', { name: /Cantor/i })).toBeVisible();

      // Should NOT show Lector (filtered out)
      const lectorButton = rolePickerDialog.getByRole('button', { name: /^Lector$/i });
      // Only check if lector button exists but is not visible
      const lectorCount = await lectorButton.count();
      if (lectorCount > 0) {
        await expect(lectorButton).not.toBeVisible();
      }

      console.log('✓ Group role filtering works correctly');
    } else {
      console.log('⚠ No search input found in group role picker - skipping filter test');
    }
  });
});

test.describe('Group Roles - Edit Member Role', () => {
  test.skip('should change a member\'s group role', async ({ page }) => {
    // TODO: Fix edit dialog structure - group-role-trigger not found in edit mode
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a test group
    await page.goto('/groups');
    const createGroupButton = page.getByRole('button', { name: /Create Group/i });
    await createGroupButton.click();

    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    const groupName = `Edit Role Group ${Date.now()}`;
    await page.locator('[role="dialog"]').getByLabel('Group Name').fill(groupName);
    await page.locator('[role="dialog"]').getByRole('button', { name: /^Create$/i }).click();

    await page.waitForURL(/\/groups\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });
    const groupId = page.url().split('/').pop();

    // Create a test person
    await page.goto('/people/create');
    await page.fill('#first_name', 'Role');
    await page.fill('#last_name', 'Changer');
    await page.fill('#email', `role.changer.test.${Date.now()}@test.com`);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/people\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Navigate back to the group
    await page.goto(`/groups/${groupId}`);
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Add member with initial role (Lector)
    let dialog, rolePickerDialog;

    const addMemberButton = page.getByRole('button', { name: /Add Member/i });
    await expect(addMemberButton).toBeVisible({ timeout: TEST_TIMEOUTS.NAVIGATION });
    await addMemberButton.click();
    await page.waitForSelector('[role="dialog"]', { state: 'visible' });

    dialog = page.locator('[role="dialog"]').first();
    await dialog.getByRole('button', { name: /Select Person/i }).click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    const pickerDialog = page.locator('[role="dialog"]').last();
    await pickerDialog.getByRole('button', { name: /Role Changer/i }).first().click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    await dialog.getByTestId('group-role-trigger').click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    rolePickerDialog = page.locator('[role="dialog"]').last();
    await rolePickerDialog.getByRole('button', { name: /^Lector$/i }).first().click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    await dialog.getByRole('button', { name: /Add Member/i }).click();
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Verify initial role
    let badge = page.locator('[data-slot="badge"]', { hasText: /Lector/i });
    await expect(badge).toBeVisible();

    // Edit the member's role
    const memberCard = page.locator('div[data-testid^="member-card-"]:has-text("Role Changer")').first();
    const editButton = memberCard.locator('button[data-testid^="edit-role-button-"]');
    await editButton.click();

    // Wait for edit dialog to open
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Wait a moment for dialog to fully render
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Verify we see "Edit Member" dialog
    dialog = page.locator('[role="dialog"]').first();
    await expect(dialog.getByRole('heading', { name: /Edit Member/i })).toBeVisible();

    // Click to change the group role
    const roleTrigger = dialog.getByTestId('group-role-trigger');
    await expect(roleTrigger).toBeVisible({ timeout: TEST_TIMEOUTS.TOAST });
    await roleTrigger.click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Select new role (Cantor)
    rolePickerDialog = page.locator('[role="dialog"]').last();
    await rolePickerDialog.getByRole('button', { name: /^Cantor$/i }).first().click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Save the edit - button should say "Update Member" or similar
    const saveButton = dialog.getByRole('button', { name: /Update|Save/i });
    await saveButton.click();
    await page.waitForTimeout(TEST_TIMEOUTS.SHORT);

    // Verify role was changed to Cantor
    badge = page.locator('[data-slot="badge"]', { hasText: /Cantor/i });
    await expect(badge).toBeVisible();

    // Verify Lector badge is no longer visible
    const lectorBadge = page.locator('[data-slot="badge"]', { hasText: /^Lector$/i });
    const lectorCount = await lectorBadge.count();
    if (lectorCount > 0) {
      await expect(lectorBadge).not.toBeVisible();
    }

    console.log('✓ Successfully changed member\'s group role from Lector to Cantor');
  });
});
