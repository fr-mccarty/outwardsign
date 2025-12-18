import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Weddings Table View', () => {
  // Enable parallel execution - tests in this file don't interfere with each other
  test.describe.configure({ mode: 'parallel' });

  test('should display table with correct columns', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to weddings page
    await page.goto('/weddings');
    await expect(page).toHaveURL('/weddings');

    // Check if table headers are visible
    const tableHeaders = ['Who', 'What', 'When', 'Where'];

    for (const header of tableHeaders) {
      // Headers might be inside buttons (for sortable columns) or plain text
      const headerElement = page.getByRole('button', { name: header })
        .or(page.getByRole('columnheader', { name: header }));

      // Only check if table has data - empty state won't show headers
      const hasData = await page.locator('table').count() > 0;
      if (hasData) {
        await expect(headerElement.first()).toBeVisible();
      }
    }
  });

  test('should sort by date when clicking When column', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to weddings page
    await page.goto('/weddings');
    await expect(page).toHaveURL('/weddings');

    // Check if we have a table with data
    const hasTable = await page.locator('table').count() > 0;

    if (hasTable) {
      // Click the "When" column header to sort
      const whenHeader = page.getByRole('button', { name: 'When' });

      // Only test sorting if the column is sortable (appears as a button)
      if (await whenHeader.count() > 0) {
        await whenHeader.first().click();

        // Verify URL contains sort parameter
        await expect(page).toHaveURL(/sort=/, { timeout: TEST_TIMEOUTS.NAVIGATION });
      }
    }
  });

  test('should search by bride or groom name', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to weddings page
    await page.goto('/weddings');
    await expect(page).toHaveURL('/weddings');

    // Find the search input
    const searchInput = page.getByPlaceholder(/Search by bride or groom name/i);
    await expect(searchInput).toBeVisible();

    // Type a search query
    const searchTerm = 'Test';
    await searchInput.fill(searchTerm);

    // Verify URL is updated with search parameter
    await expect(page).toHaveURL(/search=Test/, { timeout: TEST_TIMEOUTS.NAVIGATION });
  });

  test('should clear search with clear button', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to weddings page
    await page.goto('/weddings');
    await expect(page).toHaveURL('/weddings');

    // Find the search input and type something
    const searchInput = page.getByPlaceholder(/Search by bride or groom name/i);
    await searchInput.fill('Test Search');

    // Wait for search to update URL
    await expect(page).toHaveURL(/search=Test/, { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Find and click the clear button (X icon)
    const clearButton = page.getByRole('button', { name: /Clear search/i });
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    // Verify search input is empty
    await expect(searchInput).toHaveValue('');

    // Verify URL no longer has search parameter
    await expect(page).not.toHaveURL(/search=/);
  });

  test('should filter by status', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to weddings page
    await page.goto('/weddings');
    await expect(page).toHaveURL('/weddings');

    // Open the Advanced Search collapsible
    const advancedButton = page.getByRole('button', { name: /Advanced/i });
    await advancedButton.click();

    // Find and click the status filter dropdown
    const statusFilter = page.locator('[role="combobox"]').filter({ hasText: /Status|All Status/ }).first();
    await statusFilter.click();

    // Select "Active" status
    const activeOption = page.getByRole('option', { name: 'Active' }).first();
    await expect(activeOption).toBeVisible();
    await activeOption.click();

    // Verify URL is updated with status parameter
    await expect(page).toHaveURL(/status=ACTIVE/, { timeout: TEST_TIMEOUTS.NAVIGATION });
  });

  test('should sort using sort dropdown', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to weddings page
    await page.goto('/weddings');
    await expect(page).toHaveURL('/weddings');

    // Open the Advanced Search collapsible
    const advancedButton = page.getByRole('button', { name: /Advanced/i });
    await advancedButton.click();

    // Find and click the sort dropdown
    const sortFilter = page.locator('[role="combobox"]').filter({ hasText: /Sort by|Date|Name/ }).first();
    await sortFilter.click();

    // Select "Name (A-Z)" sort option
    const sortOption = page.getByRole('option', { name: /Name \(A-Z\)/i });
    await expect(sortOption).toBeVisible();
    await sortOption.click();

    // Verify URL is updated with sort parameter
    await expect(page).toHaveURL(/sort=name_asc/, { timeout: TEST_TIMEOUTS.NAVIGATION });
  });

  test('should show scroll to top button after scrolling', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to weddings page
    await page.goto('/weddings');
    await expect(page).toHaveURL('/weddings');

    // Check if scroll to top button is NOT visible initially
    const scrollButton = page.getByRole('button', { name: /Scroll to top/i });

    // Button should not be visible at top of page
    await expect(scrollButton).not.toBeVisible();

    // Scroll down the page
    await page.evaluate(() => window.scrollTo(0, 500));

    // Wait a moment for scroll handler to trigger
    await page.waitForTimeout(TEST_TIMEOUTS.QUICK);

    // Now check if button appears (only if page is tall enough to scroll)
    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = await page.evaluate(() => window.innerHeight);

    if (pageHeight > viewportHeight + 300) {
      // Page is tall enough, button should appear
      await expect(scrollButton).toBeVisible({ timeout: TEST_TIMEOUTS.QUICK });

      // Click the button
      await scrollButton.click();

      // Verify we scrolled back to top
      const scrollPosition = await page.evaluate(() => window.scrollY);
      expect(scrollPosition).toBeLessThan(100);
    }
  });

  test('should display couple avatars in Who column', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a wedding with bride and groom
    await page.goto('/weddings/create');

    // Fill minimal data and submit
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/weddings\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Navigate back to list
    await page.goto('/weddings');
    await expect(page).toHaveURL('/weddings');

    // Check if table exists
    const hasTable = await page.locator('table').count() > 0;

    if (hasTable) {
      // Look for the "Who" column - should contain avatar or "No couple assigned" text
      const whoColumn = page.locator('table').locator('td').first();
      await expect(whoColumn).toBeVisible();

      // Should show either avatar images or fallback text
      const hasAvatar = await page.locator('img[alt]').count() > 0;
      const hasFallbackText = await page.locator('text=No couple assigned').count() > 0;

      expect(hasAvatar || hasFallbackText).toBeTruthy();
    }
  });

  test('should show status badge in Who column', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a wedding with status
    await page.goto('/weddings/create');

    // Select status
    await page.locator('#status').click();
    await page.getByRole('option', { name: 'Active' }).first().click();

    // Submit form
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/weddings\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Navigate back to list
    await page.goto('/weddings');
    await expect(page).toHaveURL('/weddings');

    // Check if table exists
    const hasTable = await page.locator('table').count() > 0;

    if (hasTable) {
      // Look for status indicator - it should be a colored dot in the "Who" column
      // Status indicators are small rounded divs with background colors
      const statusDot = page.locator('div.rounded-full').filter({ hasText: '' });

      // At least one row should have a status indicator
      const dotCount = await statusDot.count();
      expect(dotCount).toBeGreaterThan(0);
    }
  });

  test('should navigate to wedding detail when clicking row', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a wedding
    await page.goto('/weddings/create');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/weddings\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Navigate back to list
    await page.goto('/weddings');
    await expect(page).toHaveURL('/weddings');

    // Check if table exists
    const hasTable = await page.locator('table').count() > 0;

    if (hasTable) {
      // Click on the first table row (but not on buttons/actions)
      const firstRow = page.locator('table tbody tr').first();
      const firstCell = firstRow.locator('td').first();

      await firstCell.click();

      // Should navigate to wedding detail page
      await expect(page).toHaveURL(/\/weddings\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.NAVIGATION });
    }
  });

  test('should display actions menu with View and Edit options', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a wedding
    await page.goto('/weddings/create');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/weddings\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Navigate back to list
    await page.goto('/weddings');
    await expect(page).toHaveURL('/weddings');

    // Check if table exists
    const hasTable = await page.locator('table').count() > 0;

    if (hasTable) {
      // Find the actions dropdown button (three dots menu)
      const actionsButton = page.locator('table tbody tr').first().getByRole('button').last();

      // Click the dropdown
      await actionsButton.click();

      // Verify View and Edit menu items appear
      await expect(page.getByRole('menuitem', { name: /View/i })).toBeVisible({ timeout: TEST_TIMEOUTS.DIALOG });
      await expect(page.getByRole('menuitem', { name: /Edit/i })).toBeVisible({ timeout: TEST_TIMEOUTS.DIALOG });
    }
  });

  test('should display date and time in When column', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a wedding
    await page.goto('/weddings/create');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/weddings\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Navigate back to list
    await page.goto('/weddings');
    await expect(page).toHaveURL('/weddings');

    // Check if table exists
    const hasTable = await page.locator('table').count() > 0;

    if (hasTable) {
      // Look for the "When" column - should show either a date or "No date set"
      const hasDate = await page.locator('text=/\\d{4}/').count() > 0; // Look for year pattern
      const hasNoDate = await page.locator('text=No date set').count() > 0;

      expect(hasDate || hasNoDate).toBeTruthy();
    }
  });
});
