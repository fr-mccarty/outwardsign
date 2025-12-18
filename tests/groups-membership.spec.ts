import { test, expect, Page } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * Page Object Model for Group Membership Testing
 * Provides reusable methods for interacting with group membership UI
 */
class GroupMembershipPage {
  constructor(private page: Page) {}

  /**
   * Navigate to a group's detail page
   */
  async navigateToGroup(groupId: string) {
    await this.page.goto(`/groups/${groupId}`);
    await expect(this.page).toHaveURL(`/groups/${groupId}`);
  }

  /**
   * Create a test group and return its ID
   */
  async createTestGroup(name: string, description?: string): Promise<string> {
    await this.page.goto('/groups');

    // Click "Create Group" button
    const createGroupButton = this.page.getByRole('button', { name: /Create Group/i });
    await createGroupButton.click();

    // Wait for dialog to open
    await this.page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });

    // Fill in group form
    await this.page.locator('[role="dialog"]').getByLabel('Group Name').fill(name);
    if (description) {
      await this.page.locator('[role="dialog"]').getByLabel('Description').fill(description);
    }

    // Submit form
    await this.page.locator('[role="dialog"]').getByRole('button', { name: /^Create$/i }).click();

    // Wait for redirect to group detail page after creation
    await this.page.waitForURL(/\/groups\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Extract group ID from the URL
    const currentUrl = this.page.url();
    const groupId = currentUrl.split('/').pop();

    if (!groupId) {
      throw new Error('Failed to extract group ID from URL');
    }

    return groupId;
  }

  /**
   * Create a test person and return their ID
   */
  async createTestPerson(firstName: string, lastName: string, email?: string): Promise<string> {
    await this.page.goto('/people/create');
    await expect(this.page).toHaveURL('/people/create');

    await this.page.fill('input#first_name', firstName);
    await this.page.fill('input#last_name', lastName);
    if (email) {
      await this.page.fill('input#email', email);
    }

    await this.page.click('button[type="submit"]');
    // Forms now redirect to edit page instead of view page
    await this.page.waitForURL(/\/people\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Extract person ID from URL (before /edit)
    const urlParts = this.page.url().split('/');
    const personId = urlParts[urlParts.length - 2];

    if (!personId) {
      throw new Error('Failed to extract person ID from created person');
    }

    return personId;
  }

  /**
   * Open the "Add Member" modal
   */
  async openAddMemberModal() {
    const addMemberButton = this.page.getByRole('button', { name: /Add Member/i });
    await addMemberButton.click();
    await this.page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(this.page.locator('[role="dialog"]').getByRole('heading', { name: /Add Member/i })).toBeVisible();
  }

  /**
   * Select a person from the people picker within the Add Member modal
   */
  async selectPersonInModal(personName: string) {
    // Click "Select Person" button to open people picker
    const dialog = this.page.locator('[role="dialog"]').first();
    await dialog.getByRole('button', { name: /Select Person/i }).click();

    // Wait for people picker dialog to open (will be a nested dialog)
    await this.page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Find the people picker dialog (the second/nested dialog)
    const pickerDialog = this.page.locator('[role="dialog"]').last();
    await expect(pickerDialog.getByRole('heading', { name: /Select Person/i })).toBeVisible();

    // Search for the person
    const searchInput = pickerDialog.getByPlaceholder(/Search/i);
    await searchInput.fill(personName);

    // Wait for search to process (same timing as working person-picker tests)
    await this.page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Click on the person from search results using getByRole (like working tests)
    // Use .first() in case there are multiple matches
    const personButton = pickerDialog.getByRole('button', { name: new RegExp(personName, 'i') }).first();
    await personButton.click();

    // Wait for people picker to close
    await this.page.waitForTimeout(TEST_TIMEOUTS.QUICK);
  }

  /**
   * Create a new person inline from the people picker
   */
  async createPersonInModal(firstName: string, lastName: string, email?: string) {
    // Click "Select Person" to open people picker
    const dialog = this.page.locator('[role="dialog"]').first();
    await dialog.getByRole('button', { name: /Select Person/i }).click();

    await this.page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Find the people picker dialog
    const pickerDialog = this.page.locator('[role="dialog"]').last();

    // Click "Add New Person" button in people picker
    const addNewButton = pickerDialog.getByRole('button', { name: /Add New Person/i });
    await addNewButton.click();

    // Wait for create form to appear
    await this.page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Fill in person details
    await pickerDialog.getByLabel('First Name').fill(firstName);
    await pickerDialog.getByLabel('Last Name').fill(lastName);
    if (email) {
      await pickerDialog.getByLabel('Email').fill(email);
    }

    // Submit the create form
    await pickerDialog.getByRole('button', { name: /Save Person/i }).click();

    // Wait for creation and auto-selection
    await this.page.waitForTimeout(TEST_TIMEOUTS.SHORT);
  }

  /**
   * Select a group role in the Add Member modal
   * Note: Uses GroupRolePickerField which opens a modal dialog (not a Select dropdown)
   */
  async selectRole(roleName: string) {
    const dialog = this.page.locator('[role="dialog"]').first();

    // Click the "Group Role" button to open the group role picker modal
    const groupRoleTrigger = dialog.getByTestId('group-role-trigger');
    await groupRoleTrigger.click();

    // Wait for the group role picker modal to open (will be a nested dialog)
    await this.page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Find the group role picker dialog (the second/nested dialog)
    const pickerDialog = this.page.locator('[role="dialog"]').last();
    await expect(pickerDialog.getByRole('heading', { name: /Select Group Role/i })).toBeVisible();

    // Click on the role from the list
    const roleButton = pickerDialog.getByRole('button', { name: new RegExp(roleName, 'i') }).first();
    await roleButton.click();

    // Wait for picker to close
    await this.page.waitForTimeout(TEST_TIMEOUTS.QUICK);
  }

  /**
   * Legacy method for backward compatibility - converts array to single role
   */
  async selectRoles(roles: string | string[]) {
    // Group membership only supports one role, so take the first if array
    const roleName = Array.isArray(roles) ? this.getRoleLabelFromConstant(roles[0]) : this.getRoleLabelFromConstant(roles);
    await this.selectRole(roleName);
  }

  /**
   * Convert role constant to display label
   */
  private getRoleLabelFromConstant(roleConstant: string): string {
    const roleLabels: Record<string, string> = {
      'LECTOR': 'Lector',
      'EMHC': 'Extraordinary Minister of Holy Communion',
      'ALTAR_SERVER': 'Altar Server',
      'CANTOR': 'Cantor',
      'USHER': 'Usher',
      'SACRISTAN': 'Sacristan',
      'MUSIC_MINISTER': 'Music Minister',
    };
    return roleLabels[roleConstant] || roleConstant;
  }

  /**
   * Submit the Add Member form
   */
  async submitAddMember() {
    const dialog = this.page.locator('[role="dialog"]').first();
    const addButton = dialog.getByRole('button', { name: /Add Member/i });
    await addButton.click();

    // Wait for dialog to close
    await expect(this.page.locator('[role="dialog"]')).not.toBeVisible({ timeout: TEST_TIMEOUTS.TOAST });
  }

  /**
   * Cancel the Add Member form
   */
  async cancelAddMember() {
    const dialog = this.page.locator('[role="dialog"]').first();
    const cancelButton = dialog.getByRole('button', { name: /Cancel/i });
    await cancelButton.click();

    // Wait for dialog to close
    await expect(this.page.locator('[role="dialog"]')).not.toBeVisible({ timeout: TEST_TIMEOUTS.DIALOG });
  }

  /**
   * Verify a member appears in the group members list
   */
  async expectMemberInList(personName: string) {
    const memberCard = this.page.locator(`text=${personName}`);
    await expect(memberCard).toBeVisible();
  }

  /**
   * Verify a member does not appear in the group members list
   */
  async expectMemberNotInList(personName: string) {
    const memberCard = this.page.locator(`text=${personName}`);
    await expect(memberCard).not.toBeVisible();
  }

  /**
   * Get member roles displayed on a member card
   */
  async getMemberRoles(personName: string): Promise<string[]> {
    const memberCard = this.page.locator(`div:has-text("${personName}")`).first();
    const badges = memberCard.locator('[data-role="badge"]');
    const count = await badges.count();

    const roles: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await badges.nth(i).textContent();
      if (text) {
        roles.push(text.trim());
      }
    }

    return roles;
  }

  /**
   * Edit a member's role (single role using Select dropdown)
   */
  async editMemberRole(personName: string, newRole: string | null) {
    // Find the member card containing this person's name
    const memberCard = this.page.locator(`div[data-testid^="member-card-"]:has-text("${personName}")`).first();

    // Find and click the Edit button
    const editButton = memberCard.locator('button[data-testid^="edit-role-button-"]');
    await editButton.click();

    // Wait for edit UI to appear - wait for the "Select Role" label
    await memberCard.locator('text=Select Group Role').waitFor({ state: 'visible', timeout: TEST_TIMEOUTS.TOAST });

    // Give it a moment for the Select dropdown to render
    await this.page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Click the Select trigger to open the dropdown
    const selectTrigger = memberCard.locator('[id^="role-select-"]');
    await selectTrigger.click();
    await this.page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Select the new role (or "none" to clear)
    const roleValue = newRole === null ? 'none' : newRole;
    const roleOption = this.page.getByRole('option', { name: roleValue === 'none' ? /No Group Role/i : new RegExp(roleValue, 'i') });
    await roleOption.click();
    await this.page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Click Save button
    const saveButton = memberCard.locator('button[data-testid^="save-role-button-"]');
    await saveButton.click();

    // Wait for save to complete
    await this.page.waitForTimeout(TEST_TIMEOUTS.QUICK);
  }

  /**
   * Cancel editing a member's role
   */
  async cancelEditMemberRole(personName: string) {
    const memberCard = this.page.locator(`div[data-testid^="member-card-"]:has-text("${personName}")`).first();

    // Click Cancel button (X icon)
    const cancelButton = memberCard.locator('button[data-testid^="cancel-edit-button-"]');
    await cancelButton.click();

    await this.page.waitForTimeout(TEST_TIMEOUTS.QUICK);
  }

  /**
   * Remove a member from the group
   */
  async removeMember(personName: string, confirm: boolean = true) {
    const memberCard = this.page.locator(`div[data-testid^="member-card-"]:has-text("${personName}")`).first();

    // Find and click the delete button
    const deleteButton = memberCard.locator('button[data-testid^="delete-member-button-"]');
    await deleteButton.click();

    // Wait for AlertDialog to appear
    await this.page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Click the appropriate button in the AlertDialog
    if (confirm) {
      await this.page.getByRole('button', { name: /Remove Member/i }).click();
    } else {
      await this.page.getByRole('button', { name: /Cancel/i }).click();
    }

    await this.page.waitForTimeout(TEST_TIMEOUTS.QUICK);
  }

  /**
   * Verify the Add Member button is disabled
   */
  async expectAddMemberButtonDisabled() {
    const dialog = this.page.locator('[role="dialog"]').first();
    const addButton = dialog.getByRole('button', { name: /Add Member/i });
    await expect(addButton).toBeDisabled();
  }

  /**
   * Verify empty state is displayed
   */
  async expectEmptyState() {
    await expect(this.page.locator('text=/No members in this group/i')).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Add First Member/i })).toBeVisible();
  }

  /**
   * Verify member has specific group role badge (single role)
   */
  async expectMemberHasRole(personName: string, expectedRoleLabel: string | string[]) {
    const memberCard = this.page.locator(`div:has-text("${personName}")`).first();

    // Support both string and array (take first if array for backward compat)
    const roleLabel = Array.isArray(expectedRoleLabel) ? expectedRoleLabel[0] : expectedRoleLabel;

    // Look for badge component with role label text (more specific to avoid strict mode violations)
    // The badge is rendered as a Badge component with variant="secondary"
    // Use case-insensitive regex since role names may be stored in different cases
    const badge = memberCard.locator('[data-slot="badge"]', { hasText: new RegExp(roleLabel, 'i') });
    await expect(badge).toBeVisible();
  }

  /**
   * Verify member shows "No role" text
   */
  async expectMemberHasNoRole(personName: string) {
    const memberCard = this.page.locator(`div:has-text("${personName}")`).first();
    await expect(memberCard.locator('text=/No role/i')).toBeVisible();
  }
}

test.describe('Group Membership - Add Member Tests', () => {
  // Enable parallel execution - tests in this file don't interfere with each other
  test.describe.configure({ mode: 'parallel' });

  let groupPage: GroupMembershipPage;
  let testGroupId: string;

  test.beforeEach(async ({ page }) => {
    groupPage = new GroupMembershipPage(page);

    // Create a test group for each test
    testGroupId = await groupPage.createTestGroup('Test Group ' + Date.now(), 'Group for membership testing');
    await groupPage.navigateToGroup(testGroupId);
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  test('TC-001: Add member with single role', async ({ page }) => {
    // Create a test person
    const firstName = 'SingleRole';
    const lastName = 'TestPerson';
    await groupPage.createTestPerson(firstName, lastName, 'singlerole@test.com');

    // Navigate back to group
    await groupPage.navigateToGroup(testGroupId);

    // Open Add Member modal
    await groupPage.openAddMemberModal();

    // Select the person
    await groupPage.selectPersonInModal(`${firstName} ${lastName}`);

    // Select one role (Lector)
    await groupPage.selectRoles(['LECTOR']);

    // Submit the form
    await groupPage.submitAddMember();

    // Verify member appears in list
    await groupPage.expectMemberInList(`${firstName} ${lastName}`);

    // Verify the role badge is displayed
    await groupPage.expectMemberHasRole(`${firstName} ${lastName}`, ['Lector']);
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  test('TC-002: Add member with Cantor role', async ({ page }) => {
    // Create a test person
    const firstName = 'Cantor';
    const lastName = 'TestPerson';
    await groupPage.createTestPerson(firstName, lastName, 'cantor@test.com');

    // Navigate back to group
    await groupPage.navigateToGroup(testGroupId);

    // Open Add Member modal
    await groupPage.openAddMemberModal();

    // Select the person
    await groupPage.selectPersonInModal(`${firstName} ${lastName}`);

    // Select Cantor role (groups only support ONE role per member)
    await groupPage.selectRoles(['CANTOR']);

    // Submit the form
    await groupPage.submitAddMember();

    // Verify member appears in list
    await groupPage.expectMemberInList(`${firstName} ${lastName}`);

    // Verify the role badge is displayed
    await groupPage.expectMemberHasRole(`${firstName} ${lastName}`, 'Cantor');
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  test('TC-003: Add member with no roles', async ({ page }) => {
    // Create a test person
    const firstName = 'NoRole';
    const lastName = 'TestPerson';
    await groupPage.createTestPerson(firstName, lastName, 'norole@test.com');

    // Navigate back to group
    await groupPage.navigateToGroup(testGroupId);

    // Open Add Member modal
    await groupPage.openAddMemberModal();

    // Select the person
    await groupPage.selectPersonInModal(`${firstName} ${lastName}`);

    // Do not select any roles

    // Submit the form
    await groupPage.submitAddMember();

    // Verify member appears in list
    await groupPage.expectMemberInList(`${firstName} ${lastName}`);

    // Verify "No group role assigned" text is displayed
    await groupPage.expectMemberHasNoRole(`${firstName} ${lastName}`);
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  test('TC-004: Cannot add member without selecting person', async ({ page }) => {
    // Open Add Member modal
    await groupPage.openAddMemberModal();

    // Select some roles without selecting a person
    await groupPage.selectRoles(['LECTOR']);

    // Verify the "Add Member" button is disabled
    await groupPage.expectAddMemberButtonDisabled();
  });

  test('TC-005: Create new person from add member modal', async ({ page }) => {
    // Open Add Member modal
    await groupPage.openAddMemberModal();

    // Create a new person inline
    const firstName = 'InlineCreated';
    const lastName = 'Person';
    await groupPage.createPersonInModal(firstName, lastName, 'inlinecreated@test.com');

    // Verify person is auto-selected (should show the person's name in the picker field)
    const dialog = page.locator('[role="dialog"]').first();
    const personName = `${firstName} ${lastName}`;
    // The PickerField shows the selected person's name when a value is selected
    await expect(dialog.locator(`text="${personName}"`)).toBeVisible();

    // Select role for the newly created person (only one role supported)
    await groupPage.selectRoles(['CANTOR']);

    // Submit the form
    await groupPage.submitAddMember();

    // Verify member appears in list
    await groupPage.expectMemberInList(`${firstName} ${lastName}`);

    // Verify role is assigned
    await groupPage.expectMemberHasRole(`${firstName} ${lastName}`, 'Cantor');
  });

  test('TC-014: Cannot add duplicate member', async ({ page }) => {
    // Create a test person
    const firstName = 'DuplicateTest';
    const lastName = 'Person';
    await groupPage.createTestPerson(firstName, lastName, 'duplicate@test.com');

    // Navigate back to group
    await groupPage.navigateToGroup(testGroupId);

    // Add the person to the group (first time)
    await groupPage.openAddMemberModal();
    await groupPage.selectPersonInModal(`${firstName} ${lastName}`);
    await groupPage.selectRoles(['LECTOR']);
    await groupPage.submitAddMember();

    // Verify member was added
    await groupPage.expectMemberInList(`${firstName} ${lastName}`);

    // Try to add the same person again
    await groupPage.openAddMemberModal();
    await groupPage.selectPersonInModal(`${firstName} ${lastName}`);
    await groupPage.selectRoles(['CANTOR']);

    // Click Add Member button but don't expect dialog to close (duplicate error)
    const dialog = page.locator('[role="dialog"]').first();
    const addButton = dialog.getByRole('button', { name: /Add Member/i });
    await addButton.click();

    // Wait a moment for potential error handling
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Close the dialog manually (since duplicate error prevents auto-close)
    const cancelButton = dialog.getByRole('button', { name: /Cancel/i });
    await cancelButton.click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // The person should only appear once in the list (no duplicate)
    // Count occurrences of the person's name
    const memberCards = page.locator(`text=${firstName} ${lastName}`);
    const count = await memberCards.count();
    expect(count).toBe(1);
  });

  test('TC-015: Empty group state displays correctly', async ({ page }) => {
    // Group should be empty (no members added yet)
    await groupPage.expectEmptyState();

    // Click "Add First Member" button
    const addFirstMemberButton = page.getByRole('button', { name: /Add First Member/i });
    await addFirstMemberButton.click();

    // Should open the Add Member modal
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.locator('[role="dialog"]').getByRole('heading', { name: /Add Member/i })).toBeVisible();
  });
});

test.describe('Group Membership - Edit Roles Tests', () => {
  // Enable parallel execution - tests in this file don't interfere with each other
  test.describe.configure({ mode: 'parallel' });

  let groupPage: GroupMembershipPage;
  let testGroupId: string;
  let testPersonName: string;

  test.beforeEach(async ({ page }) => {
    groupPage = new GroupMembershipPage(page);

    // Create a test group
    testGroupId = await groupPage.createTestGroup('Edit Roles Test Group ' + Date.now());

    // Create a test person
    const firstName = 'EditRolesTest';
    const lastName = 'Person';
    testPersonName = `${firstName} ${lastName}`;
    await groupPage.createTestPerson(firstName, lastName, 'editroles@test.com');

    // Navigate to group and add the person with initial roles
    await groupPage.navigateToGroup(testGroupId);
    await groupPage.openAddMemberModal();
    await groupPage.selectPersonInModal(testPersonName);
    await groupPage.selectRoles(['LECTOR']);
    await groupPage.submitAddMember();

    // Verify member was added
    await groupPage.expectMemberInList(testPersonName);
  });

  test.skip('TC-006: Edit roles - add additional roles', async ({ page }) => {
    // Edit the member's roles to add more
    await groupPage.editMemberRole(testPersonName, 'USHER');

    // Verify all roles are now displayed
    await groupPage.expectMemberHasRole(testPersonName, ['Lector', 'Cantor', 'Usher']);

    // Reload page to verify persistence
    await page.reload();
    await groupPage.expectMemberHasRole(testPersonName, ['Lector', 'Cantor', 'Usher']);
  });

  test.skip('TC-007: Edit roles - remove roles', async ({ page }) => {
    // First add multiple roles
    await groupPage.editMemberRole(testPersonName, 'EMHC');
    await groupPage.expectMemberHasRole(testPersonName, ['Lector', 'Cantor', 'Extraordinary Minister of Holy Communion']);

    // Now remove some roles
    await groupPage.editMemberRole(testPersonName, 'LECTOR');

    // Verify only Lector remains
    await groupPage.expectMemberHasRole(testPersonName, ['Lector']);

    // Verify removed roles are not displayed
    const memberCard = page.locator(`div:has-text("${testPersonName}")`).first();
    await expect(memberCard.locator('text=Cantor')).not.toBeVisible();
    await expect(memberCard.locator('text=Extraordinary Minister of Holy Communion')).not.toBeVisible();
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  test.skip('TC-008: Edit roles - remove all roles', async ({ page }) => {
    // Remove all roles
    await groupPage.editMemberRole(testPersonName, null);

    // Verify "No group role assigned" is displayed
    await groupPage.expectMemberHasNoRole(testPersonName);

    // Verify member is still in the group
    await groupPage.expectMemberInList(testPersonName);
  });

  test.skip('TC-009: Cancel editing member roles', async ({ page }) => {
    // Start editing roles
    const memberCard = page.locator(`div[data-testid^="member-card-"]:has-text("${testPersonName}")`).first();
    const editButton = memberCard.locator('button[data-testid^="edit-roles-button-"]');
    await editButton.click();
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Make some changes (check additional roles)
    const cantorCheckbox = memberCard.getByTestId('role-checkbox-CANTOR');
    await cantorCheckbox.click();

    // Cancel the edit
    await groupPage.cancelEditMemberRole(testPersonName);

    // Verify original roles are still displayed (only Lector)
    await groupPage.expectMemberHasRole(testPersonName, ['Lector']);

    // Verify Cantor was not added
    const badge = memberCard.locator('text=Cantor');
    await expect(badge).not.toBeVisible();
  });
});

test.describe('Group Membership - Remove Member Tests', () => {
  // Enable parallel execution - tests in this file don't interfere with each other
  test.describe.configure({ mode: 'parallel' });

  let groupPage: GroupMembershipPage;
  let testGroupId: string;

  test.beforeEach(async ({ page }) => {
    groupPage = new GroupMembershipPage(page);
    testGroupId = await groupPage.createTestGroup('Remove Member Test Group ' + Date.now());
  });

  test('TC-010: Remove member from group', async ({ page }) => {
    // Create and add a test person
    const firstName = 'RemoveTest';
    const lastName = 'Person';
    const fullName = `${firstName} ${lastName}`;
    await groupPage.createTestPerson(firstName, lastName, 'removetest@test.com');

    await groupPage.navigateToGroup(testGroupId);
    await groupPage.openAddMemberModal();
    await groupPage.selectPersonInModal(fullName);
    await groupPage.submitAddMember();

    // Verify member is in the list
    await groupPage.expectMemberInList(fullName);

    // Remove the member (confirm deletion)
    await groupPage.removeMember(fullName, true);

    // Verify member is no longer in the list
    await groupPage.expectMemberNotInList(fullName);

    // Reload page to verify persistence
    await page.reload();
    await groupPage.expectMemberNotInList(fullName);
  });

  test('TC-011: Cancel removing member', async () => {
    // Create and add a test person
    const firstName = 'CancelRemove';
    const lastName = 'Person';
    const fullName = `${firstName} ${lastName}`;
    await groupPage.createTestPerson(firstName, lastName, 'cancelremove@test.com');

    await groupPage.navigateToGroup(testGroupId);
    await groupPage.openAddMemberModal();
    await groupPage.selectPersonInModal(fullName);
    await groupPage.submitAddMember();

    // Verify member is in the list
    await groupPage.expectMemberInList(fullName);

    // Try to remove the member but cancel
    await groupPage.removeMember(fullName, false);

    // Verify member is still in the list
    await groupPage.expectMemberInList(fullName);
  });
});

test.describe('Group Membership - Role Constants Tests', () => {
  // Enable parallel execution - tests in this file don't interfere with each other
  test.describe.configure({ mode: 'parallel' });

  test.skip('TC-012: All liturgical roles are available', async ({ page }) => {
    const groupPage = new GroupMembershipPage(page);

    // Create a group
    const testGroupId = await groupPage.createTestGroup('Roles Test Group ' + Date.now());
    await groupPage.navigateToGroup(testGroupId);

    // Open Add Member modal
    await groupPage.openAddMemberModal();

    const dialog = page.locator('[role="dialog"]').first();

    // Verify all roles from MASS_ROLE_VALUES constant are available
    const expectedRoles = [
      { key: 'LECTOR', en: 'Lector', es: 'Lector' },
      { key: 'EMHC', en: 'Extraordinary Minister of Holy Communion', es: 'Ministro Extraordinario de la Comunión' },
      { key: 'ALTAR_SERVER', en: 'Altar Server', es: 'Monaguillo' },
      { key: 'CANTOR', en: 'Cantor', es: 'Cantor' },
      { key: 'USHER', en: 'Usher', es: 'Ujier' },
      { key: 'SACRISTAN', en: 'Sacristan', es: 'Sacristán' },
      { key: 'MUSIC_MINISTER', en: 'Music Minister', es: 'Ministro de Música' }
    ];

    for (const role of expectedRoles) {
      // Verify checkbox exists using data-testid
      const checkbox = dialog.getByTestId(`role-checkbox-${role.key}`);
      await expect(checkbox).toBeVisible();

      // Verify English label is shown (use .first() in case of duplicates)
      const englishLabel = dialog.locator(`text=${role.en}`).first();
      await expect(englishLabel).toBeVisible();

      // Verify Spanish label is shown (use .first() in case of duplicates)
      const spanishLabel = dialog.locator(`text=${role.es}`).first();
      await expect(spanishLabel).toBeVisible();
    }
  });
});

test.describe('Group Membership - Accessibility Tests', () => {
  // Enable parallel execution - tests in this file don't interfere with each other
  test.describe.configure({ mode: 'parallel' });

  test.skip('TC-016: Keyboard navigation', async ({ page }) => {
    const groupPage = new GroupMembershipPage(page);

    // Create a test group and person
    const testGroupId = await groupPage.createTestGroup('Keyboard Test Group ' + Date.now());
    const firstName = 'KeyboardTest';
    const lastName = 'Person';
    await groupPage.createTestPerson(firstName, lastName, 'keyboard@test.com');

    await groupPage.navigateToGroup(testGroupId);

    // Open Add Member modal
    await groupPage.openAddMemberModal();

    // Tab through role checkboxes
    await page.keyboard.press('Tab'); // Focus moves into dialog
    await page.keyboard.press('Tab'); // Move to first interactive element

    // Verify focus indicators are visible (browser default behavior)
    // Note: Detailed focus indicator testing would require specific CSS checks

    // Space key should toggle checkboxes
    await page.keyboard.press('Space');

    // Escape key should close dialog
    await page.keyboard.press('Escape');

    // Dialog should close
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test.skip('TC-017: Screen reader labels', async ({ page }) => {
    const groupPage = new GroupMembershipPage(page);

    // Create a test group
    const testGroupId = await groupPage.createTestGroup('Accessibility Test Group ' + Date.now());
    await groupPage.navigateToGroup(testGroupId);

    // Open Add Member modal
    await groupPage.openAddMemberModal();

    const dialog = page.locator('[role="dialog"]').first();

    // Verify person selector has proper label
    const personLabel = dialog.getByText('Person *');
    await expect(personLabel).toBeVisible();

    // Verify each checkbox has proper label (using data-testid)
    const lectorCheckbox = dialog.getByTestId('role-checkbox-LECTOR');
    const lectorLabel = dialog.locator('label[for="LECTOR"]');
    await expect(lectorCheckbox).toBeVisible();
    await expect(lectorLabel).toBeVisible();

    // Verify buttons have descriptive labels
    const addButton = dialog.getByRole('button', { name: /Add Member/i });
    await expect(addButton).toBeVisible();

    const cancelButton = dialog.getByRole('button', { name: /Cancel/i });
    await expect(cancelButton).toBeVisible();
  });
});

test.describe('Group Membership - Performance Tests', () => {
  // Enable parallel execution - tests in this file don't interfere with each other
  test.describe.configure({ mode: 'parallel' });

  test.skip('TC-018: Large group performance', async ({ page }) => {
    // This test is skipped by default as it takes time to create 50+ members
    // Run manually when needed: npm test -- --grep "TC-018"

    const groupPage = new GroupMembershipPage(page);

    // Create a test group
    const testGroupId = await groupPage.createTestGroup('Large Group Performance Test');

    // Create 50+ test people and add them to the group
    const startTime = Date.now();

    for (let i = 0; i < 50; i++) {
      const firstName = `Person${i}`;
      const lastName = 'TestMember';
      await groupPage.createTestPerson(firstName, lastName, `person${i}@test.com`);

      await groupPage.navigateToGroup(testGroupId);
      await groupPage.openAddMemberModal();
      await groupPage.selectPersonInModal(`${firstName} ${lastName}`);
      await groupPage.selectRoles(['LECTOR']);
      await groupPage.submitAddMember();
    }

    const setupTime = Date.now() - startTime;
    console.log(`Setup time for 50 members: ${setupTime}ms`);

    // Test page load performance
    const loadStartTime = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - loadStartTime;

    console.log(`Page load time with 50 members: ${loadTime}ms`);

    // Page should load in < 2 seconds
    expect(loadTime).toBeLessThan(2000);

    // Test adding a new member (should not lag)
    const addStartTime = Date.now();
    await groupPage.openAddMemberModal();
    const modalOpenTime = Date.now() - addStartTime;

    console.log(`Modal open time: ${modalOpenTime}ms`);
    expect(modalOpenTime).toBeLessThan(1000);

    // Test editing roles (should not lag)
    await groupPage.cancelAddMember();

    const editStartTime = Date.now();
    const memberCard = page.locator(`div:has-text("Person0 TestMember")`).first();
    const editButton = memberCard.getByRole('button').filter({ has: page.locator('svg') }).first();
    await editButton.click();
    const editOpenTime = Date.now() - editStartTime;

    console.log(`Edit mode activation time: ${editOpenTime}ms`);
    expect(editOpenTime).toBeLessThan(500);
  });
});
