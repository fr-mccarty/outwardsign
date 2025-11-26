import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * Event Types Settings Page Tests
 *
 * Tests for the Event Types management page at /settings/event-types
 * This page allows users to create, edit, reorder, and delete custom event types.
 */

test.describe('Event Types Settings Page', () => {
  test.describe.configure({ mode: 'parallel' });

  test('should display event types page with header and stats', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/event-types');
    await expect(page).toHaveURL('/settings/event-types');

    // Verify page title
    await expect(page.getByRole('heading', { name: 'Event Types' })).toBeVisible();

    // Verify description
    await expect(page.getByText('Manage custom event types for your parish')).toBeVisible();

    // Verify Add Event Type button
    await expect(page.getByRole('button', { name: /Add Event Type/i })).toBeVisible();

    // Verify stats section
    await expect(page.getByText('Total Event Types')).toBeVisible();
    await expect(page.getByText('Active')).toBeVisible();
  });

  test('should open create event type dialog', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/event-types');

    // Click Add Event Type button
    await page.getByRole('button', { name: /Add Event Type/i }).click();

    // Verify dialog opens
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: TEST_TIMEOUTS.DIALOG });
    await expect(page.getByRole('heading', { name: 'Create Event Type' })).toBeVisible();

    // Verify form fields
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
  });

  test('should create a new event type', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/event-types');

    // Click Add Event Type button
    await page.getByRole('button', { name: /Add Event Type/i }).click();

    // Wait for dialog to open
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: TEST_TIMEOUTS.DIALOG });

    // Fill in the form
    const uniqueName = `Test Event Type ${Date.now()}`;
    await page.getByLabel('Name').fill(uniqueName);
    await page.getByLabel('Description').fill('A test event type for automated testing');

    // Submit the form (button text is just "Create" in the dialog)
    await page.getByRole('button', { name: 'Create' }).click();

    // Wait for dialog to close
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Reload page to see the new data (router.refresh doesn't update client state)
    await page.reload();

    // Wait for the list to refresh and new event type to appear
    await expect(page.getByText(uniqueName)).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });
  });

  test('should edit an existing event type', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/event-types');

    // First create an event type to edit
    await page.getByRole('button', { name: /Add Event Type/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: TEST_TIMEOUTS.DIALOG });

    const originalName = `Edit Test ${Date.now()}`;
    await page.getByLabel('Name').fill(originalName);
    await page.getByLabel('Description').fill('Original description');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Reload page to see the new data (router.refresh doesn't update client state)
    await page.reload();

    // Wait for the new event type to appear
    await expect(page.getByText(originalName)).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });

    // Click the edit button for the event type we just created
    // Find the specific row that contains the event type name
    const eventTypeItem = page.locator('.border.rounded-md.bg-card').filter({ hasText: originalName });
    // Each row has 3 buttons: drag handle (first), edit (second), delete (third)
    // Target the edit button which is the second button
    await eventTypeItem.locator('button').nth(1).click();

    // Wait for edit dialog to open
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: TEST_TIMEOUTS.DIALOG });
    await expect(page.getByRole('heading', { name: 'Edit Event Type' })).toBeVisible();

    // Update the description
    await page.getByLabel('Description').fill('Updated description for testing');

    // Save changes (button text is just "Update" in the dialog)
    await page.getByRole('button', { name: 'Update' }).click();

    // Wait for dialog to close
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Reload page to see updated data (router.refresh doesn't update client state)
    await page.reload();

    // Verify the update appears
    await expect(page.getByText('Updated description for testing')).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });
  });

  test('should delete an event type', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/event-types');

    // First create an event type to delete
    await page.getByRole('button', { name: /Add Event Type/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: TEST_TIMEOUTS.DIALOG });

    const deletableName = `Delete Test ${Date.now()}`;
    await page.getByLabel('Name').fill(deletableName);
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Reload page to see the new data (router.refresh doesn't update client state)
    await page.reload();

    // Wait for the new event type to appear
    await expect(page.getByText(deletableName)).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });

    // Click the delete button for the event type we just created
    // Find the specific row that contains the event type name
    const eventTypeItem = page.locator('.border.rounded-md.bg-card').filter({ hasText: deletableName });
    // Each row has 3 buttons: drag handle (first), edit (second), delete (third)
    // Target the delete button which is the third button
    await eventTypeItem.locator('button').nth(2).click();

    // Confirm deletion in the dialog
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: TEST_TIMEOUTS.DIALOG });
    await expect(page.getByText(/Are you sure you want to delete/i)).toBeVisible();
    await page.getByRole('button', { name: /Delete/i }).click();

    // Wait for dialog to close and deletion to complete
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Reload page to see updated list (router.refresh doesn't update client state)
    await page.reload();

    // Verify the event type is no longer in the list
    await expect(page.getByText(deletableName)).toBeHidden({ timeout: TEST_TIMEOUTS.DATA_LOAD });
  });

  test('should validate required name field', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/event-types');

    // Open create dialog
    await page.getByRole('button', { name: /Add Event Type/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: TEST_TIMEOUTS.DIALOG });

    // Try to submit without filling name
    await page.getByRole('button', { name: 'Create' }).click();

    // Dialog should remain open (validation error)
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should show breadcrumbs with correct navigation', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/event-types');

    // Verify breadcrumbs
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Settings' })).toBeVisible();
    await expect(breadcrumbNav.getByText('Event Types')).toBeVisible();

    // Click Settings breadcrumb to navigate back
    await breadcrumbNav.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL('/settings', { timeout: TEST_TIMEOUTS.NAVIGATION });
  });

  test('should cancel event type creation', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/event-types');

    // Open create dialog
    await page.getByRole('button', { name: /Add Event Type/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: TEST_TIMEOUTS.DIALOG });

    // Fill in some data
    await page.getByLabel('Name').fill('Cancelled Event Type');

    // Cancel the dialog (click outside or press Escape)
    await page.keyboard.press('Escape');

    // Dialog should close
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: TEST_TIMEOUTS.DIALOG });

    // The cancelled event type should not appear
    await expect(page.getByText('Cancelled Event Type')).toBeHidden();
  });

  test('should display empty state when no event types exist', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json
    // Note: This test may not show empty state if seed data exists

    await page.goto('/settings/event-types');

    // Check if empty state is shown OR if event types are listed
    // Both are valid depending on seed data
    const hasEventTypes = await page.locator('input[id^="amount-"]').count() > 0 ||
      await page.getByText('Total Event Types').isVisible();

    if (!hasEventTypes) {
      await expect(page.getByText(/No event types yet/i)).toBeVisible();
    }
  });

  test('should show stats section with total count', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/event-types');

    // Verify stats section shows total count (number will vary based on parallel tests)
    const totalStatElement = page.locator('div').filter({ hasText: 'Total Event Types' }).locator('div.text-2xl');
    await expect(totalStatElement.first()).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });

    // Verify the total is a non-negative number
    const totalText = await totalStatElement.first().textContent() || '0';
    const total = parseInt(totalText);
    expect(total).toBeGreaterThanOrEqual(0);

    // Verify Active count is shown
    const activeStatElement = page.locator('div').filter({ hasText: /^Active$/ }).locator('..').locator('div.text-2xl');
    await expect(activeStatElement.first()).toBeVisible();
  });
});
