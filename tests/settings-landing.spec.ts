import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * Settings Landing Page Tests
 *
 * Tests for the main Settings hub page at /settings
 * This page provides navigation to all settings sections.
 */

test.describe('Settings Landing Page', () => {
  test.describe.configure({ mode: 'parallel' });

  test('should display settings page with all navigation cards', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings');
    await expect(page).toHaveURL('/settings');

    // Verify page title
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

    // Verify description
    await expect(page.getByText('Configure your application preferences and manage your account')).toBeVisible();

    // Verify all navigation cards are present (wait for page to fully load)
    // Use data-slot="card-title" to match card titles specifically
    await expect(page.locator('[data-slot="card-title"]:has-text("User Preferences")')).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });
    await expect(page.locator('[data-slot="card-title"]:has-text("Petition Settings")')).toBeVisible();
    await expect(page.locator('[data-slot="card-title"]:has-text("Reading Settings")')).toBeVisible();
    await expect(page.locator('[data-slot="card-title"]:has-text("Parish Settings")')).toBeVisible();
  });

  test('should navigate to User Preferences page', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings');

    // Click the User Preferences link
    await page.getByRole('link', { name: 'Configure Preferences' }).click();

    // Should navigate to user settings
    await expect(page).toHaveURL('/settings/user', { timeout: TEST_TIMEOUTS.NAVIGATION });
  });

  test('should navigate to Petition Settings page', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings');

    // Click the Petition Settings link
    await page.getByRole('link', { name: 'Manage Petitions' }).click();

    // Should navigate to petitions settings
    await expect(page).toHaveURL('/settings/petitions', { timeout: TEST_TIMEOUTS.NAVIGATION });
  });

  test('should navigate to Reading Settings page', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings');

    // Click the Reading Settings link
    await page.getByRole('link', { name: 'Manage Readings' }).click();

    // Should navigate to readings settings
    await expect(page).toHaveURL('/settings/readings', { timeout: TEST_TIMEOUTS.NAVIGATION });
  });

  test('should navigate to Parish Settings page', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings');

    // Click the Parish Settings link
    await page.getByRole('link', { name: 'Manage Parish' }).click();

    // Should navigate to parish settings (redirects to /settings/parish/general)
    await expect(page).toHaveURL('/settings/parish/general', { timeout: TEST_TIMEOUTS.NAVIGATION });
  });

  test('should show breadcrumbs with Dashboard link', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings');

    // Verify breadcrumbs
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByText('Settings')).toBeVisible();

    // Click Dashboard breadcrumb to navigate back
    await breadcrumbNav.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL('/dashboard', { timeout: TEST_TIMEOUTS.NAVIGATION });
  });

  test('should display card descriptions', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings');

    // Verify card descriptions are visible
    await expect(page.getByText('Customize your language, liturgical preferences, and default settings.')).toBeVisible();
    await expect(page.getByText('Configure default petition templates for different liturgical occasions.')).toBeVisible();
    await expect(page.getByText('Import liturgical readings and manage your reading collections.')).toBeVisible();
    await expect(page.getByText('Manage your current parish information and administrative settings.')).toBeVisible();
  });
});
