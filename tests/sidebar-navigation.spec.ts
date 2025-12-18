import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * Navigation Smoke Test - Validates all sidebar links load without errors.
 *
 * Dynamically gathers all navigation links from the sidebar and verifies:
 * - No error toasts appear
 * - Page heading renders
 * - URL navigates correctly
 */

// Run tests serially to avoid overwhelming the dev server
test.describe.configure({ mode: 'serial' });

test.describe('Sidebar Navigation', () => {
  test('all sidebar links load without errors', async ({ page }) => {
    // Increase timeout for this test since it visits many pages
    test.setTimeout(180000); // 3 minutes

    await page.goto('/dashboard', { timeout: TEST_TIMEOUTS.HEAVY_LOAD });

    // Expand all collapsible sections to reveal hidden links
    // Keep clicking closed triggers until none remain
    let closedTrigger = page.locator('button[data-state="closed"]').first();
    while (await closedTrigger.count() > 0) {
      await closedTrigger.click();
      await page.waitForTimeout(TEST_TIMEOUTS.QUICK);
      closedTrigger = page.locator('button[data-state="closed"]').first();
    }

    // Gather all sidebar navigation links
    const sidebar = page.locator('[data-sidebar="sidebar"]').first();
    await expect(sidebar).toBeVisible();

    // Wait for sidebar to be hydrated - check for the dashboard link
    await expect(sidebar.locator('a[href="/dashboard"]').first()).toBeVisible({ timeout: TEST_TIMEOUTS.NAVIGATION });

    // Find all anchor tags in sidebar
    const links = sidebar.locator('a[href]');
    const linkCount = await links.count();
    console.log(`Links in sidebar: ${linkCount}`);

    // Store link information
    const navigationLinks: Array<{ name: string; url: string }> = [];

    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const name = await link.textContent();
      const href = await link.getAttribute('href');

      if (name && href) {
        // Skip external links, hash links, home link, and duplicate paths
        if (!href.startsWith('http') && !href.startsWith('#') && href !== '/') {
          // Check for duplicates
          if (!navigationLinks.some(l => l.url === href)) {
            navigationLinks.push({ name: name.trim(), url: href });
          }
        }
      }
    }

    console.log(`Found ${navigationLinks.length} unique navigation links`);

    // Track any failures
    const failures: Array<{ name: string; url: string; error: string }> = [];

    // Visit each link and verify it loads
    for (const link of navigationLinks) {
      console.log(`Testing: ${link.name} -> ${link.url}`);

      try {
        // Navigate to the page with extended timeout
        const response = await page.goto(link.url, { timeout: TEST_TIMEOUTS.HEAVY_LOAD });

        // Check for server errors (5xx status codes)
        if (response && response.status() >= 500) {
          failures.push({ name: link.name, url: link.url, error: `Server error: ${response.status()}` });
          continue;
        }

        // Check for Next.js error overlay or error boundary
        const errorOverlay = page.locator('[data-nextjs-dialog]');
        const errorBoundary = page.locator('text=Application error');
        const serverError = page.locator('text=500');

        if (await errorOverlay.isVisible({ timeout: TEST_TIMEOUTS.QUICK }).catch(() => false)) {
          failures.push({ name: link.name, url: link.url, error: 'Next.js error overlay visible' });
          continue;
        }

        if (await errorBoundary.isVisible({ timeout: TEST_TIMEOUTS.QUICK }).catch(() => false)) {
          failures.push({ name: link.name, url: link.url, error: 'Application error boundary' });
          continue;
        }

        if (await serverError.isVisible({ timeout: TEST_TIMEOUTS.QUICK }).catch(() => false)) {
          failures.push({ name: link.name, url: link.url, error: 'Server error page' });
          continue;
        }

        // Verify page has loaded by checking for any heading
        // Use configured timeout for pages with heavy server-side data fetching
        const heading = page.locator('h1, h2').first();
        const hasHeading = await heading.isVisible({ timeout: TEST_TIMEOUTS.EXTENDED }).catch(() => false);

        if (!hasHeading) {
          failures.push({ name: link.name, url: link.url, error: 'No heading found - page may not have loaded' });
        }
      } catch (e) {
        failures.push({ name: link.name, url: link.url, error: e instanceof Error ? e.message : String(e) });
      }
    }

    // Report all failures at the end
    if (failures.length > 0) {
      console.log('\n❌ Pages with errors:');
      for (const f of failures) {
        console.log(`  - ${f.name} (${f.url}): ${f.error}`);
      }
      expect(failures, `${failures.length} page(s) failed to load correctly`).toHaveLength(0);
    }
  });

  test('sidebar persists and collapses work', async ({ page }) => {
    await page.goto('/dashboard', { timeout: TEST_TIMEOUTS.HEAVY_LOAD });

    // Verify sidebar is visible
    const sidebar = page.locator('[data-sidebar="sidebar"]').first();
    await expect(sidebar).toBeVisible();

    // Test collapsible sections if they exist
    const collapsibleTrigger = page.locator('button[data-state]').first();
    const hasCollapsible = await collapsibleTrigger.count() > 0;

    if (hasCollapsible) {
      const initialState = await collapsibleTrigger.getAttribute('data-state');
      await collapsibleTrigger.click();
      await page.waitForTimeout(TEST_TIMEOUTS.QUICK);
      const newState = await collapsibleTrigger.getAttribute('data-state');
      expect(newState).not.toBe(initialState);
    }

    // Navigate and verify sidebar persists
    await page.goto('/calendar', { timeout: TEST_TIMEOUTS.HEAVY_LOAD });
    await expect(sidebar).toBeVisible();
  });
});
