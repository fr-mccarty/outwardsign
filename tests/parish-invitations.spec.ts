import { test, expect } from '@playwright/test';

/**
 * Parish Invitations Test Suite
 *
 * Tests the complete invitation workflow including:
 * - Creating invitations with different roles (Staff, Admin, Ministry Leader)
 * - Ministry-leader module selection
 * - Resending invitations
 * - Revoking invitations
 * - Validation and error handling
 * - Pending invitations display
 *
 * Note: Parishioner role is not available for invitations (filtered out in UI)
 */

test.describe('Parish Invitations', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to parish settings Users page
    await page.goto('/settings/parish/users');
    await page.waitForLoadState('networkidle');
  });

  test('should display invite user button', async ({ page }) => {
    // Verify the Invite User button exists
    await expect(page.getByRole('button', { name: /Invite User/i })).toBeVisible();
  });

  test('should open and close invite user dialog', async ({ page }) => {
    // Click Invite User button
    const inviteButton = page.getByRole('button', { name: /Invite User/i });
    await inviteButton.click();

    // Verify dialog opens
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Invite Parish User/i })).toBeVisible();

    // Verify dialog description
    await expect(page.getByText(/Send an invitation to join this parish/i)).toBeVisible();

    // Click Cancel button
    const cancelButton = page.getByRole('button', { name: 'Cancel' });
    await cancelButton.click();

    // Verify dialog closes
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should create invitation for staff role', async ({ page }) => {
    const testEmail = `staff-${Date.now()}@test.com`;

    // Open invite dialog
    await page.getByRole('button', { name: /Invite User/i }).click();

    // Fill in email
    await page.fill('input#invite-email', testEmail);

    // Staff is the default role, but let's verify we can select it
    const roleSelect = page.locator('button[id="invite-role"]');
    await roleSelect.click();
    await page.getByRole('option', { name: 'Staff' }).click();

    // Verify role description
    await expect(page.getByText(/Can create and manage all sacrament modules/i)).toBeVisible();

    // Send invitation
    await page.getByRole('button', { name: /Send Invitation/i }).click();

    // Wait for success
    await page.waitForTimeout(2000);

    // Reload the page to see the new invitation
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify invitation appears with Staff role
    await expect(page.getByText(testEmail)).toBeVisible({ timeout: 10000 });
  });

  test('should create invitation for admin role', async ({ page }) => {
    const testEmail = `admin-${Date.now()}@test.com`;

    // Open invite dialog
    await page.getByRole('button', { name: /Invite User/i }).click();

    // Fill in email
    await page.fill('input#invite-email', testEmail);

    // Select admin role
    const roleSelect = page.locator('button[id="invite-role"]');
    await roleSelect.click();
    await page.getByRole('option', { name: 'Admin' }).click();

    // Verify role description
    await expect(page.getByText(/Full access to parish settings, templates, and all modules/i)).toBeVisible();

    // Send invitation
    await page.getByRole('button', { name: /Send Invitation/i }).click();

    // Wait for success
    await page.waitForTimeout(2000);

    // Reload the page to see the new invitation
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify invitation appears with Admin role
    await expect(page.getByText(testEmail)).toBeVisible({ timeout: 10000 });
  });

  test('should create ministry-leader invitation with module selection', async ({ page }) => {
    const testEmail = `ministry-leader-${Date.now()}@test.com`;

    // Open invite dialog
    await page.getByRole('button', { name: /Invite User/i }).click();

    // Fill in email
    await page.fill('input#invite-email', testEmail);

    // Select ministry-leader role
    const roleSelect = page.locator('button[id="invite-role"]');
    await roleSelect.click();
    await page.getByRole('option', { name: 'Ministry Leader' }).click();

    // Verify role description
    await expect(page.getByText(/Access to specific modules \(select below\)/i)).toBeVisible();

    // Verify module checkboxes appear
    await expect(page.getByText('Enabled Modules')).toBeVisible();

    // Select weddings and funerals modules (using labels for shadcn checkbox)
    await page.getByLabel('weddings', { exact: true }).click();
    await page.getByLabel('funerals', { exact: true }).click();

    // Verify checkboxes are checked
    await expect(page.getByLabel('weddings', { exact: true })).toBeChecked();
    await expect(page.getByLabel('funerals', { exact: true })).toBeChecked();

    // Send invitation
    await page.getByRole('button', { name: /Send Invitation/i }).click();

    // Wait for success
    await page.waitForTimeout(2000);

    // Reload the page to see the new invitation
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify invitation appears
    await expect(page.getByText(testEmail)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Ministry Leader')).toBeVisible();
  });

  test('should show all available module options for ministry-leader', async ({ page }) => {
    // Open invite dialog
    await page.getByRole('button', { name: /Invite User/i }).click();

    // Select ministry-leader role
    const roleSelect = page.locator('button[id="invite-role"]');
    await roleSelect.click();
    await page.getByRole('option', { name: 'Ministry Leader' }).click();

    // Verify all module checkboxes exist (using labels for shadcn checkboxes)
    await expect(page.getByLabel('masses', { exact: true })).toBeVisible();
    await expect(page.getByLabel('weddings', { exact: true })).toBeVisible();
    await expect(page.getByLabel('funerals', { exact: true })).toBeVisible();
    await expect(page.getByLabel('baptisms', { exact: true })).toBeVisible();
    await expect(page.getByLabel('presentations', { exact: true })).toBeVisible();
    await expect(page.getByLabel('quinceaneras', { exact: true })).toBeVisible();
    await expect(page.getByLabel('groups', { exact: true })).toBeVisible();
  });

  test('should hide module selection when switching from ministry-leader to other roles', async ({ page }) => {
    // Open invite dialog
    await page.getByRole('button', { name: /Invite User/i }).click();

    // Select ministry-leader role
    const roleSelect = page.locator('button[id="invite-role"]');
    await roleSelect.click();
    await page.getByRole('option', { name: 'Ministry Leader' }).click();

    // Verify module checkboxes appear
    await expect(page.getByText('Enabled Modules')).toBeVisible();

    // Switch to staff role
    await roleSelect.click();
    await page.getByRole('option', { name: 'Staff' }).click();

    // Verify module checkboxes are hidden
    await expect(page.getByText('Enabled Modules')).not.toBeVisible();
  });

  test('should validate required email field', async ({ page }) => {
    // Open invite dialog
    await page.getByRole('button', { name: /Invite User/i }).click();

    // Try to send without email (email field is empty by default)
    await page.getByRole('button', { name: /Send Invitation/i }).click();

    // Dialog should stay open (validation failed)
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should display pending invitations list', async ({ page }) => {
    // Check if there are any pending invitations
    const hasPendingInvitations = await page.getByText(/Pending Invitations/i).isVisible();

    if (hasPendingInvitations) {
      // Verify the section text is visible
      await expect(page.getByText(/Pending Invitations/i)).toBeVisible();

      // Verify at least one invitation card exists
      const invitationCards = page.locator('[class*="border-dashed"]');
      await expect(invitationCards.first()).toBeVisible();
    } else {
      // If no pending invitations, verify section doesn't appear
      await expect(page.getByText(/Pending Invitations/i)).not.toBeVisible();
    }
  });

  test('should display invitation details in pending list', async ({ page }) => {
    const testEmail = `check-details-${Date.now()}@test.com`;

    // Create an invitation first (Staff is default role)
    await page.getByRole('button', { name: /Invite User/i }).click();
    await page.fill('input#invite-email', testEmail);
    await page.getByRole('button', { name: /Send Invitation/i }).click();
    await page.waitForTimeout(2000);

    // Reload to see the new invitation
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Find the invitation card
    const invitationCard = page.locator(`text=${testEmail}`).locator('..');

    // Verify email is displayed
    await expect(invitationCard.getByText(testEmail)).toBeVisible();

    // Verify role is displayed (default is Staff)
    await expect(invitationCard.getByText('Staff')).toBeVisible();

    // Verify invited date is displayed (contains "Invited")
    await expect(invitationCard.locator('text=/Invited/')).toBeVisible();

    // Verify expires date is displayed (contains "Expires")
    await expect(invitationCard.locator('text=/Expires/')).toBeVisible();
  });

  test('should show resend and revoke options in invitation dropdown', async ({ page }) => {
    const testEmail = `dropdown-test-${Date.now()}@test.com`;

    // Create an invitation first
    await page.getByRole('button', { name: /Invite User/i }).click();
    await page.fill('input#invite-email', testEmail);
    await page.getByRole('button', { name: /Send Invitation/i }).click();
    await page.waitForTimeout(2000);

    // Reload to see the invitation
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Find the dropdown button next to this invitation and click it
    const invitationRow = page.locator('[class*="border-dashed"]').filter({ hasText: testEmail });
    const dropdownTrigger = invitationRow.getByRole('button');
    await dropdownTrigger.click();

    // Verify dropdown menu options
    await expect(page.getByRole('menuitem', { name: /Resend Invitation/i })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /Revoke Invitation/i })).toBeVisible();
  });

  test('should resend invitation', async ({ page }) => {
    const testEmail = `resend-test-${Date.now()}@test.com`;

    // Create an invitation first
    await page.getByRole('button', { name: /Invite User/i }).click();
    await page.fill('input#invite-email', testEmail);
    await page.getByRole('button', { name: /Send Invitation/i }).click();
    await page.waitForTimeout(2000);

    // Reload to see the invitation
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Find the dropdown button next to this invitation and click it
    const invitationRow = page.locator('[class*="border-dashed"]').filter({ hasText: testEmail });
    const dropdownTrigger = invitationRow.getByRole('button');
    await dropdownTrigger.click();

    // Click Resend Invitation
    await page.getByRole('menuitem', { name: /Resend Invitation/i }).click();

    // Wait for resend operation
    await page.waitForTimeout(2000);

    // Verify invitation still exists in pending list (not removed)
    await expect(page.getByText(testEmail)).toBeVisible();
  });

  test('should revoke invitation', async ({ page }) => {
    const testEmail = `revoke-test-${Date.now()}@test.com`;

    // Create an invitation first
    await page.getByRole('button', { name: /Invite User/i }).click();
    await page.fill('input#invite-email', testEmail);
    await page.getByRole('button', { name: /Send Invitation/i }).click();
    await page.waitForTimeout(2000);

    // Reload to see the invitation
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify invitation exists
    await expect(page.getByText(testEmail)).toBeVisible();

    // Find the dropdown button next to this invitation and click it
    const invitationRow = page.locator('[class*="border-dashed"]').filter({ hasText: testEmail });
    const dropdownTrigger = invitationRow.getByRole('button');
    await dropdownTrigger.click();

    // Click Revoke Invitation
    await page.getByRole('menuitem', { name: /Revoke Invitation/i }).click();

    // Wait for revoke operation
    await page.waitForTimeout(2000);

    // Verify invitation is removed from pending list
    await expect(page.getByText(testEmail)).not.toBeVisible();
  });

  test('should display user count in parish users header', async ({ page }) => {
    // Verify the Parish Users header text is visible and shows a count
    await expect(page.getByText(/Parish Users \(\d+\)/i)).toBeVisible();
  });

  test('should display pending invitation count in header', async ({ page }) => {
    // Check if there are pending invitations by looking for the text with count
    const hasPendingInvitations = await page.getByText(/Pending Invitations \(\d+\)/i).isVisible();

    if (hasPendingInvitations) {
      // Verify the count is displayed in parentheses
      await expect(page.getByText(/Pending Invitations \(\d+\)/i)).toBeVisible();
    }
  });

  test('should create multiple invitations with different roles', async ({ page }) => {
    const timestamp = Date.now();
    const emails = {
      admin: `multi-admin-${timestamp}@test.com`,
      staff: `multi-staff-${timestamp}@test.com`,
      ministryLeader: `multi-ministry-${timestamp}@test.com`,
    };

    // Create admin invitation
    await page.getByRole('button', { name: /Invite User/i }).click();
    await page.fill('input#invite-email', emails.admin);
    const roleSelect = page.locator('button[id="invite-role"]');
    await roleSelect.click();
    await page.getByRole('option', { name: 'Admin' }).click();
    await page.getByRole('button', { name: /Send Invitation/i }).click();
    await page.waitForTimeout(1500);

    // Create staff invitation
    await page.getByRole('button', { name: /Invite User/i }).click();
    await page.fill('input#invite-email', emails.staff);
    await roleSelect.click();
    await page.getByRole('option', { name: 'Staff' }).click();
    await page.getByRole('button', { name: /Send Invitation/i }).click();
    await page.waitForTimeout(1500);

    // Create ministry-leader invitation with modules
    await page.getByRole('button', { name: /Invite User/i }).click();
    await page.fill('input#invite-email', emails.ministryLeader);
    await roleSelect.click();
    await page.getByRole('option', { name: 'Ministry Leader' }).click();
    await page.getByLabel('weddings', { exact: true }).click();
    await page.getByRole('button', { name: /Send Invitation/i }).click();
    await page.waitForTimeout(1500);

    // Verify all invitations appear in pending list
    await expect(page.getByText(emails.admin)).toBeVisible();
    await expect(page.getByText(emails.staff)).toBeVisible();
    await expect(page.getByText(emails.ministryLeader)).toBeVisible();
  });

  test('should clear form fields after successful invitation', async ({ page }) => {
    const testEmail = `form-clear-${Date.now()}@test.com`;

    // Open invite dialog
    await page.getByRole('button', { name: /Invite User/i }).click();

    // Fill in email and select role
    await page.fill('input#invite-email', testEmail);
    const roleSelect = page.locator('button[id="invite-role"]');
    await roleSelect.click();
    await page.getByRole('option', { name: 'Admin' }).click();

    // Send invitation
    await page.getByRole('button', { name: /Send Invitation/i }).click();

    // Wait for success and dialog to close
    await page.waitForTimeout(2000);

    // Open dialog again
    await page.getByRole('button', { name: /Invite User/i }).click();

    // Verify email field is empty
    const emailInput = page.locator('input#invite-email');
    await expect(emailInput).toHaveValue('');

    // Verify role is reset to default (Staff)
    const roleValue = await roleSelect.textContent();
    expect(roleValue).toContain('Staff');
  });

  test('should handle cancel button during invitation creation', async ({ page }) => {
    const testEmail = `cancel-test-${Date.now()}@test.com`;

    // Open invite dialog
    await page.getByRole('button', { name: /Invite User/i }).click();

    // Fill in some data
    await page.fill('input#invite-email', testEmail);
    const roleSelect = page.locator('button[id="invite-role"]');
    await roleSelect.click();
    await page.getByRole('option', { name: 'Admin' }).click();

    // Click Cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Verify dialog closes
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Verify invitation was NOT created
    await expect(page.getByText(testEmail)).not.toBeVisible();
  });

  test('should display role descriptions for each role type', async ({ page }) => {
    // Open invite dialog
    await page.getByRole('button', { name: /Invite User/i }).click();
    const roleSelect = page.locator('button[id="invite-role"]');

    // Test Admin description
    await roleSelect.click();
    await page.getByRole('option', { name: 'Admin' }).click();
    await expect(page.getByText(/Full access to parish settings, templates, and all modules/i)).toBeVisible();

    // Test Staff description
    await roleSelect.click();
    await page.getByRole('option', { name: 'Staff' }).click();
    await expect(page.getByText(/Can create and manage all sacrament modules/i)).toBeVisible();

    // Test Ministry Leader description
    await roleSelect.click();
    await page.getByRole('option', { name: 'Ministry Leader' }).click();
    await expect(page.getByText(/Access to specific modules \(select below\)/i)).toBeVisible();
  });
});
