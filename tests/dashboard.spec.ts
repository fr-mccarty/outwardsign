import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * Dashboard Tests
 *
 * Tests that the dashboard loads and displays key information:
 * - Page loads successfully
 * - Key sections are visible
 */

test.describe('Dashboard', () => {
  test('loads and displays main sections', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // Dashboard should have a heading
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: TEST_TIMEOUTS.RENDER });

    // Should show some content (stats, upcoming events, etc.)
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible({ timeout: TEST_TIMEOUTS.RENDER });
  });

  test('displays upcoming events or empty state', async ({ page }) => {
    await page.goto('/dashboard');

    // Should show either upcoming events section or some dashboard content
    const content = page.locator('main');
    await expect(content).toBeVisible({ timeout: TEST_TIMEOUTS.RENDER });

    // Verify page is interactive (not stuck loading)
    await expect(page.locator('text=Loading')).toBeHidden({ timeout: TEST_TIMEOUTS.DATA_LOAD });
  });
});
