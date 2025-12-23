import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * Groups Membership Tests
 *
 * Tests CRUD operations for group membership:
 * - Add member to group
 * - Edit member role
 * - Remove member from group
 */

test.describe('Groups Membership', () => {
  let groupId: string;
  let personId: string;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();

    // Create a test group
    await page.goto('/groups');
    await page.getByRole('button', { name: /Create Group/i }).click();
    await page.waitForSelector('[role="dialog"]', { timeout: TEST_TIMEOUTS.DIALOG });
    await page.locator('[role="dialog"]').getByLabel('Group Name').fill(`Test Group ${Date.now()}`);
    await page.locator('[role="dialog"]').getByRole('button', { name: /^Create$/i }).click();
    await page.waitForURL(/\/groups\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });
    groupId = page.url().split('/').pop()!;

    // Create a test person
    await page.goto('/people/create');
    await page.fill('input#first_name', 'Test');
    await page.fill('input#last_name', `Member ${Date.now()}`);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/people\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });
    personId = page.url().split('/').at(-2)!;

    await page.close();
  });

  test('add member to group', async ({ page }) => {
    await page.goto(`/groups/${groupId}`);

    // Open add member modal
    await page.getByRole('button', { name: /Add Member/i }).click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: TEST_TIMEOUTS.DIALOG });

    // Select person
    await page.locator('[role="dialog"]').getByRole('button', { name: /Select Person/i }).click();
    await page.getByPlaceholder(/Search/i).fill('Test Member');
    await page.getByRole('option').first().click();

    // Save
    await page.locator('[role="dialog"]').getByRole('button', { name: /Add$/i }).click();

    // Verify member appears in list
    await expect(page.locator('text=Test Member')).toBeVisible({ timeout: TEST_TIMEOUTS.RENDER });
  });

  test('edit member role', async ({ page }) => {
    await page.goto(`/groups/${groupId}`);

    // Find member row and click edit
    const memberRow = page.locator('tr', { hasText: 'Test Member' });
    await memberRow.getByRole('button', { name: /Edit/i }).click();

    // Wait for edit dialog
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: TEST_TIMEOUTS.DIALOG });

    // Update role (select first available role)
    const roleSelect = page.locator('[role="dialog"]').locator('[data-testid="role-select"]');
    if (await roleSelect.isVisible()) {
      await roleSelect.click();
      await page.getByRole('option').first().click();
    }

    // Save changes
    await page.locator('[role="dialog"]').getByRole('button', { name: /Save|Update/i }).click();

    // Verify dialog closed
    await expect(page.locator('[role="dialog"]')).toBeHidden({ timeout: TEST_TIMEOUTS.DIALOG });
  });

  test('remove member from group', async ({ page }) => {
    await page.goto(`/groups/${groupId}`);

    // Find member and click remove
    const memberRow = page.locator('tr', { hasText: 'Test Member' });
    await memberRow.getByRole('button', { name: /Remove|Delete/i }).click();

    // Confirm deletion
    await expect(page.locator('[role="alertdialog"], [role="dialog"]')).toBeVisible({ timeout: TEST_TIMEOUTS.DIALOG });
    await page.getByRole('button', { name: /Remove|Delete|Confirm/i }).click();

    // Verify member removed
    await expect(page.locator('text=Test Member')).toBeHidden({ timeout: TEST_TIMEOUTS.RENDER });
  });
});
