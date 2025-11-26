import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * Reading Settings Page Tests
 *
 * Tests for the Reading Settings page at /settings/readings
 * This page allows users to import liturgical readings and view stats.
 */

test.describe('Reading Settings Page', () => {
  test.describe.configure({ mode: 'parallel' });

  test('should display reading settings page with title and description', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/readings');
    await expect(page).toHaveURL('/settings/readings');

    // Verify page title (appears twice - in header and in content)
    await expect(page.getByRole('heading', { name: 'Reading Settings' }).first()).toBeVisible();

    // Verify description
    await expect(page.getByText('Import liturgical readings and manage your reading collections.').first()).toBeVisible();
  });

  test('should display back to settings link', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/readings');

    // Verify back link exists
    const backLink = page.getByRole('link', { name: /Back to Settings/i });
    await expect(backLink).toBeVisible();

    // Click back link
    await backLink.click();
    await expect(page).toHaveURL('/settings', { timeout: TEST_TIMEOUTS.NAVIGATION });
  });

  test('should display current reading collection statistics', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/readings');

    // Wait for stats to load - the section title is not a heading, it's a div with text
    await expect(page.getByText('Current Reading Collection')).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });

    // Verify stat labels
    await expect(page.getByText('Total Readings')).toBeVisible();
    await expect(page.getByText('Categories')).toBeVisible();
    await expect(page.getByText('Translations')).toBeVisible();
  });

  test('should display import readings section', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/readings');

    // Verify Import Readings section - the section title is a div with text
    await expect(page.getByText('Import Readings').first()).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });

    // Verify import button
    await expect(page.getByRole('button', { name: /Import Readings/i })).toBeVisible();

    // Verify info boxes (using heading level 4)
    await expect(page.getByRole('heading', { name: 'What will be imported:' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Important Notes:' })).toBeVisible();
  });

  test('should display what will be imported information', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/readings');

    // Verify import details
    await expect(page.getByText(/Wedding readings/i)).toBeVisible();
    await expect(page.getByText(/Funeral readings/i)).toBeVisible();
    await expect(page.getByText(/Complete biblical texts/i)).toBeVisible();
  });

  test('should display important notes about import', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/readings');

    // Verify important notes
    await expect(page.getByText(/add readings to your personal collection/i)).toBeVisible();
    await expect(page.getByText(/Duplicate readings will be skipped/i)).toBeVisible();
  });

  test('should display reading management section with links', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/readings');

    // Verify Reading Management section - the section title is a div with text
    await expect(page.getByText('Reading Management')).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });

    // Verify management links
    await expect(page.getByRole('link', { name: /View All Readings/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Add New Reading/i })).toBeVisible();
  });

  test('should navigate to readings list from management section', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/readings');

    // Wait for page to load
    await expect(page.getByText('Reading Management')).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });

    // Click View All Readings link (the full link text includes the description)
    const viewAllLink = page.getByRole('link', { name: /View All Readings.*Browse and search/i });
    await viewAllLink.click();

    // Should navigate to readings page
    await expect(page).toHaveURL('/readings', { timeout: TEST_TIMEOUTS.NAVIGATION });
  });

  test('should navigate to create reading page from management section', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/readings');

    // Wait for page to load
    await expect(page.getByText('Reading Management')).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });

    // Click Add New Reading link
    await page.getByRole('link', { name: /Add New Reading/i }).click();

    // Should navigate to readings create page
    await expect(page).toHaveURL('/readings/create', { timeout: TEST_TIMEOUTS.NAVIGATION });
  });

  test('should show breadcrumbs with correct navigation', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/readings');

    // Wait for page to load
    await expect(page.getByText('Reading Management')).toBeVisible({ timeout: TEST_TIMEOUTS.DATA_LOAD });

    // Verify breadcrumbs
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    // Use exact match to avoid matching "Reading Settings"
    await expect(breadcrumbNav.getByRole('link', { name: 'Settings', exact: true })).toBeVisible();
    await expect(breadcrumbNav.getByText('Reading Settings')).toBeVisible();

    // Click Settings breadcrumb to navigate back (use exact match)
    await breadcrumbNav.getByRole('link', { name: 'Settings', exact: true }).click();
    await expect(page).toHaveURL('/settings', { timeout: TEST_TIMEOUTS.NAVIGATION });
  });

  test('should trigger import readings process', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/readings');

    // Click Import Readings button
    const importButton = page.getByRole('button', { name: /Import Readings/i });
    await importButton.click();

    // Button should change to show loading state
    await expect(page.getByRole('button', { name: /Importing Readings/i })).toBeVisible({
      timeout: TEST_TIMEOUTS.FORM_SUBMIT,
    });

    // Wait for import to complete (button returns to normal state or shows result)
    await expect(page.getByRole('button', { name: /Import Readings/i })).toBeVisible({
      timeout: TEST_TIMEOUTS.EXTENDED,
    });
  });

  test('should display categories when readings exist', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json

    await page.goto('/settings/readings');

    // Wait for stats to load - the section title is a div with text
    await expect(page.getByText('Current Reading Collection')).toBeVisible({
      timeout: TEST_TIMEOUTS.DATA_LOAD,
    });

    // Check if categories section is visible (only shows if categories exist)
    const categoriesHeading = page.getByRole('heading', { name: 'Available Categories' });

    // If readings have been imported, categories should be shown
    const categoriesCount = await page.locator('div.text-2xl').nth(1).textContent();
    if (categoriesCount && parseInt(categoriesCount) > 0) {
      await expect(categoriesHeading).toBeVisible();
    }
  });
});
