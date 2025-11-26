import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * User Settings Page Tests
 *
 * Tests for the User Preferences page at /settings/user
 * This page allows users to configure language preferences and view account info.
 */

test.describe('User Settings Page', () => {
  test.describe.configure({ mode: 'parallel' });

  test('should display user settings page with tabs', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/user');
    await expect(page).toHaveURL('/settings/user');

    // Verify page title
    await expect(page.getByRole('heading', { name: 'User Preferences' })).toBeVisible();

    // Verify tabs are present
    await expect(page.getByRole('tab', { name: /General/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Account/i })).toBeVisible();
  });

  test('should display language preference selector', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/user');

    // Wait for the page to load (CardTitle is a div, not a heading)
    await expect(page.locator('[data-slot="card-title"]:has-text("Language and Preferences")')).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });

    // Verify language selector is present
    await expect(page.getByText('Preferred Language')).toBeVisible();
    await expect(page.getByText('Your interface language preference')).toBeVisible();
  });

  test('should change language preference', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/user');

    // Wait for page to load
    await expect(page.locator('[data-slot="card-title"]:has-text("Language and Preferences")')).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });

    // Find and click the language selector
    const languageSelect = page.locator('#language');
    await languageSelect.click();

    // Select Spanish
    await page.getByRole('option', { name: /Espa.*Spanish/i }).click();

    // Click Save Changes
    await page.getByRole('button', { name: /Save Changes/i }).click();

    // Wait for save to complete (the button text changes during saving)
    await expect(page.getByRole('button', { name: /Save Changes/i })).toBeEnabled({ timeout: TEST_TIMEOUTS.FORM_SUBMIT });
  });

  test('should display account information tab', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/user');

    // Wait for tabs to load
    await expect(page.getByRole('tab', { name: /Account/i })).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });

    // Click on Account tab
    await page.getByRole('tab', { name: /Account/i }).click();

    // Wait for account info to load (CardTitle is a div, not a heading)
    await expect(page.locator('[data-slot="card-title"]:has-text("Account Information")')).toBeVisible();

    // Verify account information fields are present
    await expect(page.getByText('Email')).toBeVisible();
    await expect(page.getByText('User ID')).toBeVisible();
    await expect(page.getByText('Account Created')).toBeVisible();
  });

  test('should show user email in account tab', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/user');

    // Wait for tabs to load
    await expect(page.getByRole('tab', { name: /Account/i })).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });

    // Click on Account tab
    await page.getByRole('tab', { name: /Account/i }).click();

    // Wait for account info to load
    await expect(page.locator('[data-slot="card-title"]:has-text("Account Information")')).toBeVisible();

    // Verify email is displayed in the Account tab content (test users have email ending in @outwardsign.test)
    await expect(page.getByLabel('Account').locator('p:has-text("@outwardsign.test")')).toBeVisible();
  });

  test('should have refresh button', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/user');

    // Verify refresh button exists (wait for page to load first)
    await expect(page.getByRole('button', { name: /Refresh/i })).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });
  });

  test('should refresh settings when clicking refresh button', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/user');

    // Wait for page to load
    await expect(page.locator('[data-slot="card-title"]:has-text("Language and Preferences")')).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });

    // Click refresh button
    const refreshButton = page.getByRole('button', { name: /Refresh/i });
    await refreshButton.click();

    // Wait for refresh to complete (button should still be visible)
    await expect(refreshButton).toBeVisible();
    await expect(page.locator('[data-slot="card-title"]:has-text("Language and Preferences")')).toBeVisible();
  });

  test('should show breadcrumbs with correct navigation', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/user');

    // Wait for page to load
    await expect(page.getByRole('heading', { name: 'User Preferences' })).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });

    // Verify breadcrumbs
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Settings' })).toBeVisible();
    await expect(breadcrumbNav.getByText('User Preferences')).toBeVisible();

    // Click Settings breadcrumb to navigate back
    await breadcrumbNav.getByRole('link', { name: 'Settings' }).click();
    await expect(page).toHaveURL('/settings', { timeout: TEST_TIMEOUTS.NAVIGATION });
  });

  test('should persist language selection after page reload', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/user');

    // Wait for page to load
    await expect(page.locator('[data-slot="card-title"]:has-text("Language and Preferences")')).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });

    // Change language to French
    const languageSelect = page.locator('#language');
    await languageSelect.click();
    await page.getByRole('option', { name: /Fran.*French/i }).click();

    // Save changes
    await page.getByRole('button', { name: /Save Changes/i }).click();

    // Wait for save to complete
    await expect(page.getByRole('button', { name: /Save Changes/i })).toBeEnabled({ timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Reload the page
    await page.reload();

    // Wait for page to load
    await expect(page.locator('[data-slot="card-title"]:has-text("Language and Preferences")')).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });

    // Verify the language selection is persisted (check that French is selected)
    await expect(languageSelect).toContainText('Fran');
  });
});
