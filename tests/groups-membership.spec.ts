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
    await this.page.waitForURL(/\/people\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const personUrl = this.page.url();
    const personId = personUrl.split('/').pop();

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
    await this.page.waitForTimeout(1000);

    // Find the people picker dialog (the second/nested dialog)
    const pickerDialog = this.page.locator('[role="dialog"]').last();
    await expect(pickerDialog.getByRole('heading', { name: /Select Person/i })).toBeVisible();

    // Search for the person
    const searchInput = pickerDialog.getByPlaceholder(/Search/i);
    await searchInput.fill(personName);

    // Wait for search to process (same timing as working person-picker tests)
    await this.page.waitForTimeout(500);

    // Click on the person from search results using getByRole (like working tests)
    const personButton = pickerDialog.getByRole('button', { name: new RegExp(personName, 'i') });
    await personButton.click();

    // Wait for people picker to close
    await this.page.waitForTimeout(500);
  }

  /**
   * Create a new person inline from the people picker
   */
  async createPersonInModal(firstName: string, lastName: string, email?: string) {
    // Click "Select Person" to open people picker
    const dialog = this.page.locator('[role="dialog"]').first();
    await dialog.getByRole('button', { name: /Select Person/i }).click();

    await this.page.waitForTimeout(500);

    // Find the people picker dialog
    const pickerDialog = this.page.locator('[role="dialog"]').last();

    // Click "Add New Person" button in people picker
    const addNewButton = pickerDialog.getByRole('button', { name: /Add New Person/i });
    await addNewButton.click();

    // Wait for create form to appear
    await this.page.waitForTimeout(500);

    // Fill in person details
    await pickerDialog.getByLabel('First Name').fill(firstName);
    await pickerDialog.getByLabel('Last Name').fill(lastName);
    if (email) {
      await pickerDialog.getByLabel('Email').fill(email);
    }

    // Submit the create form
    await pickerDialog.getByRole('button', { name: /Save Person/i }).click();

    // Wait for creation and auto-selection
    await this.page.waitForTimeout(1500);
  }

  /**
   * Select roles in the Add Member modal
   * @param roles Array of role keys (e.g., ['LECTOR', 'CANTOR'])
   */
  async selectRoles(roles: string[]) {
    const dialog = this.page.locator('[role="dialog"]').first();

    for (const role of roles) {
      const checkbox = dialog.locator(`input#${role}`);
      await checkbox.check();
    }
  }

  /**
   * Submit the Add Member form
   */
  async submitAddMember() {
    const dialog = this.page.locator('[role="dialog"]').first();
    const addButton = dialog.getByRole('button', { name: /Add Member/i });
    await addButton.click();

    // Wait for dialog to close
    await expect(this.page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });
  }

  /**
   * Cancel the Add Member form
   */
  async cancelAddMember() {
    const dialog = this.page.locator('[role="dialog"]').first();
    const cancelButton = dialog.getByRole('button', { name: /Cancel/i });
    await cancelButton.click();

    // Wait for dialog to close
    await expect(this.page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 3000 });
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
   * Edit a member's roles
   */
  async editMemberRoles(personName: string, newRoles: string[]) {
    // Find the member card and click the Edit button
    const memberCard = this.page.locator(`div:has-text("${personName}")`).first();
    const editButton = memberCard.getByRole('button').filter({ has: this.page.locator('svg') }).first();
    await editButton.click();

    // Wait for edit mode to activate
    await this.page.waitForTimeout(500);

    // First, uncheck all existing roles
    const checkboxes = memberCard.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      const checkbox = checkboxes.nth(i);
      if (await checkbox.isChecked()) {
        await checkbox.uncheck();
      }
    }

    // Then check the new roles
    for (const role of newRoles) {
      const checkbox = memberCard.locator(`input[type="checkbox"][id*="${role}"]`);
      await checkbox.check();
    }

    // Click Save button (checkmark icon)
    const saveButton = memberCard.getByRole('button').filter({ has: this.page.locator('svg[class*="lucide-save"]') });
    await saveButton.click();

    // Wait for save to complete
    await this.page.waitForTimeout(1000);
  }

  /**
   * Cancel editing a member's roles
   */
  async cancelEditMemberRoles(personName: string) {
    const memberCard = this.page.locator(`div:has-text("${personName}")`).first();

    // Click Cancel button (X icon)
    const cancelButton = memberCard.getByRole('button').filter({ has: this.page.locator('svg[class*="lucide-x"]') });
    await cancelButton.click();

    await this.page.waitForTimeout(500);
  }

  /**
   * Remove a member from the group
   */
  async removeMember(personName: string, confirm: boolean = true) {
    const memberCard = this.page.locator(`div:has-text("${personName}")`).first();

    // Find and click the delete button (trash icon)
    const deleteButton = memberCard.getByRole('button').filter({ has: this.page.locator('svg[class*="lucide-trash"]') });
    await deleteButton.click();

    // Wait for confirmation dialog
    await this.page.waitForTimeout(500);

    // Handle browser confirmation dialog
    this.page.once('dialog', async dialog => {
      if (confirm) {
        await dialog.accept();
      } else {
        await dialog.dismiss();
      }
    });

    await this.page.waitForTimeout(1000);
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
   * Verify member has specific role badges
   */
  async expectMemberHasRoles(personName: string, expectedRoles: string[]) {
    const memberCard = this.page.locator(`div:has-text("${personName}")`).first();

    for (const role of expectedRoles) {
      // Look for badge with role text
      const badge = memberCard.locator(`text=${role}`);
      await expect(badge).toBeVisible();
    }
  }

  /**
   * Verify member shows "No roles assigned" text
   */
  async expectMemberHasNoRoles(personName: string) {
    const memberCard = this.page.locator(`div:has-text("${personName}")`).first();
    await expect(memberCard.locator('text=/No roles assigned/i')).toBeVisible();
  }
}

test.describe('Group Membership - Add Member Tests', () => {
  let groupPage: GroupMembershipPage;
  let testGroupId: string;

  test.beforeEach(async ({ page }) => {
    groupPage = new GroupMembershipPage(page);

    // Create a test group for each test
    testGroupId = await groupPage.createTestGroup('Test Group ' + Date.now(), 'Group for membership testing');
    await groupPage.navigateToGroup(testGroupId);
  });

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
    await groupPage.expectMemberHasRoles(`${firstName} ${lastName}`, ['Lector']);
  });

  test('TC-002: Add member with multiple roles', async ({ page }) => {
    // Create a test person
    const firstName = 'MultiRole';
    const lastName = 'TestPerson';
    await groupPage.createTestPerson(firstName, lastName, 'multirole@test.com');

    // Navigate back to group
    await groupPage.navigateToGroup(testGroupId);

    // Open Add Member modal
    await groupPage.openAddMemberModal();

    // Select the person
    await groupPage.selectPersonInModal(`${firstName} ${lastName}`);

    // Select multiple roles
    await groupPage.selectRoles(['LECTOR', 'CANTOR', 'EMHC']);

    // Submit the form
    await groupPage.submitAddMember();

    // Verify member appears in list
    await groupPage.expectMemberInList(`${firstName} ${lastName}`);

    // Verify all role badges are displayed
    await groupPage.expectMemberHasRoles(`${firstName} ${lastName}`, [
      'Lector',
      'Cantor',
      'Extraordinary Minister of Holy Communion'
    ]);
  });

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

    // Verify "No roles assigned" text is displayed
    await groupPage.expectMemberHasNoRoles(`${firstName} ${lastName}`);
  });

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

    // Verify person is auto-selected (the modal should show "Change Person" instead of "Select Person")
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog.locator('text=/Person selected/i')).toBeVisible();

    // Select roles for the newly created person
    await groupPage.selectRoles(['CANTOR', 'MUSIC_MINISTER']);

    // Submit the form
    await groupPage.submitAddMember();

    // Verify member appears in list
    await groupPage.expectMemberInList(`${firstName} ${lastName}`);

    // Verify roles are assigned
    await groupPage.expectMemberHasRoles(`${firstName} ${lastName}`, ['Cantor', 'Music Minister']);
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
    await groupPage.submitAddMember();

    // Wait a moment for potential error handling
    await page.waitForTimeout(1000);

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

  test('TC-006: Edit roles - add additional roles', async ({ page }) => {
    // Edit the member's roles to add more
    await groupPage.editMemberRoles(testPersonName, ['LECTOR', 'CANTOR', 'USHER']);

    // Verify all roles are now displayed
    await groupPage.expectMemberHasRoles(testPersonName, ['Lector', 'Cantor', 'Usher']);

    // Reload page to verify persistence
    await page.reload();
    await groupPage.expectMemberHasRoles(testPersonName, ['Lector', 'Cantor', 'Usher']);
  });

  test('TC-007: Edit roles - remove roles', async ({ page }) => {
    // First add multiple roles
    await groupPage.editMemberRoles(testPersonName, ['LECTOR', 'CANTOR', 'EMHC']);
    await groupPage.expectMemberHasRoles(testPersonName, ['Lector', 'Cantor', 'Extraordinary Minister of Holy Communion']);

    // Now remove some roles
    await groupPage.editMemberRoles(testPersonName, ['LECTOR']);

    // Verify only Lector remains
    await groupPage.expectMemberHasRoles(testPersonName, ['Lector']);

    // Verify removed roles are not displayed
    const memberCard = page.locator(`div:has-text("${testPersonName}")`).first();
    await expect(memberCard.locator('text=Cantor')).not.toBeVisible();
    await expect(memberCard.locator('text=Extraordinary Minister of Holy Communion')).not.toBeVisible();
  });

  test('TC-008: Edit roles - remove all roles', async ({ page }) => {
    // Remove all roles
    await groupPage.editMemberRoles(testPersonName, []);

    // Verify "No roles assigned" is displayed
    await groupPage.expectMemberHasNoRoles(testPersonName);

    // Verify member is still in the group
    await groupPage.expectMemberInList(testPersonName);
  });

  test('TC-009: Cancel editing member roles', async ({ page }) => {
    // Start editing roles
    const memberCard = page.locator(`div:has-text("${testPersonName}")`).first();
    const editButton = memberCard.getByRole('button').filter({ has: page.locator('svg') }).first();
    await editButton.click();
    await page.waitForTimeout(500);

    // Make some changes (check additional roles)
    const cantorCheckbox = memberCard.locator(`input[type="checkbox"][id*="CANTOR"]`);
    await cantorCheckbox.check();

    // Cancel the edit
    await groupPage.cancelEditMemberRoles(testPersonName);

    // Verify original roles are still displayed (only Lector)
    await groupPage.expectMemberHasRoles(testPersonName, ['Lector']);

    // Verify Cantor was not added
    const badge = memberCard.locator('text=Cantor');
    await expect(badge).not.toBeVisible();
  });
});

test.describe('Group Membership - Remove Member Tests', () => {
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

  test('TC-011: Cancel removing member', async ({ page }) => {
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
  test('TC-012: All liturgical roles are available', async ({ page }) => {
    const groupPage = new GroupMembershipPage(page);

    // Create a group
    const testGroupId = await groupPage.createTestGroup('Roles Test Group ' + Date.now());
    await groupPage.navigateToGroup(testGroupId);

    // Open Add Member modal
    await groupPage.openAddMemberModal();

    const dialog = page.locator('[role="dialog"]').first();

    // Verify all roles from ROLE_VALUES constant are available
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
      // Verify checkbox exists
      const checkbox = dialog.locator(`input#${role.key}`);
      await expect(checkbox).toBeVisible();

      // Verify English label is shown
      const englishLabel = dialog.locator(`text=${role.en}`);
      await expect(englishLabel).toBeVisible();

      // Verify Spanish label is shown
      const spanishLabel = dialog.locator(`text=${role.es}`);
      await expect(spanishLabel).toBeVisible();
    }
  });
});

test.describe('Group Membership - Accessibility Tests', () => {
  test('TC-016: Keyboard navigation', async ({ page }) => {
    const groupPage = new GroupMembershipPage(page);

    // Create a test group and person
    const testGroupId = await groupPage.createTestGroup('Keyboard Test Group ' + Date.now());
    const firstName = 'KeyboardTest';
    const lastName = 'Person';
    await groupPage.createTestPerson(firstName, lastName, 'keyboard@test.com');

    await groupPage.navigateToGroup(testGroupId);

    // Open Add Member modal
    await groupPage.openAddMemberModal();

    const dialog = page.locator('[role="dialog"]').first();

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

  test('TC-017: Screen reader labels', async ({ page }) => {
    const groupPage = new GroupMembershipPage(page);

    // Create a test group
    const testGroupId = await groupPage.createTestGroup('Accessibility Test Group ' + Date.now());
    await groupPage.navigateToGroup(testGroupId);

    // Open Add Member modal
    await groupPage.openAddMemberModal();

    const dialog = page.locator('[role="dialog"]').first();

    // Verify person selector has proper label
    const personLabel = dialog.getByText(/Person/i);
    await expect(personLabel).toBeVisible();

    // Verify each checkbox has proper label
    const lectorCheckbox = dialog.locator('input#LECTOR');
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
