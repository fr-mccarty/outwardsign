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

  test('should display user settings page with form sections', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/user');
    await expect(page).toHaveURL('/settings/user');

    // Verify page title
    await expect(page.getByRole('heading', { name: 'User Preferences' })).toBeVisible();

    // Verify form sections are present (single form, no tabs)
    await expect(page.locator('[data-slot="card-title"]:has-text("Language and Preferences")')).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });
    await expect(page.locator('[data-slot="card-title"]:has-text("Account Information")')).toBeVisible();
  });

  test('should display language preference selector', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/user');

    // Wait for the page to load
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

    // Click Save Changes (button in header)
    await page.getByRole('button', { name: /Save Changes/i }).first().click();

    // Wait for save to complete (the button text changes during saving)
    await expect(page.getByRole('button', { name: /Save Changes/i }).first()).toBeEnabled({ timeout: TEST_TIMEOUTS.FORM_SUBMIT });
  });

  test('should display account information section', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/user');

    // Wait for page to load
    await expect(page.locator('[data-slot="card-title"]:has-text("Account Information")')).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });

    // Verify account information fields are present
    await expect(page.getByText('Email')).toBeVisible();
    await expect(page.getByText('User ID')).toBeVisible();
    await expect(page.getByText('Account Created')).toBeVisible();
    await expect(page.getByText('Settings Last Updated')).toBeVisible();
  });

  test('should show user email in account section', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/user');

    // Wait for page to load
    await expect(page.locator('[data-slot="card-title"]:has-text("Account Information")')).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });

    // Verify email is displayed (test users have email ending in @outwardsign.test)
    await expect(page.locator('p:has-text("@outwardsign.test")')).toBeVisible();
  });

  test('should have save button in header and footer', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/user');

    // Wait for page to load
    await expect(page.locator('[data-slot="card-title"]:has-text("Language and Preferences")')).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });

    // Verify save buttons exist (one in header, one at bottom)
    const saveButtons = page.getByRole('button', { name: /Save Changes/i });
    await expect(saveButtons).toHaveCount(2);
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

    // Save changes (use first button - in header)
    await page.getByRole('button', { name: /Save Changes/i }).first().click();

    // Wait for save to complete
    await expect(page.getByRole('button', { name: /Save Changes/i }).first()).toBeEnabled({ timeout: TEST_TIMEOUTS.FORM_SUBMIT });

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
