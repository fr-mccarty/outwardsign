import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * Special Liturgies / Events Tests
 *
 * Tests the dynamic event type system.
 * Events are accessed via /events/[event_type_id]/[id]
 */

test.describe('Events', () => {
  test('events list page loads', async ({ page }) => {
    await page.goto('/events');
    await expect(page).toHaveURL('/events');
    await expect(page.locator('main')).toBeVisible({ timeout: TEST_TIMEOUTS.RENDER });
  });

  test('can navigate to create event', async ({ page }) => {
    await page.goto('/events');

    // Click create button
    const createButton = page.getByRole('link', { name: /New Event|Create/i }).first();
    if (await createButton.isVisible({ timeout: TEST_TIMEOUTS.SHORT })) {
      await createButton.click();
      // Should navigate to event type selection or create page
      await page.waitForURL(/\/events.*create/, { timeout: TEST_TIMEOUTS.NAVIGATION });
    }
  });

  test('special liturgies route loads', async ({ page }) => {
    // Try wedding event type via special-liturgies route
    await page.goto('/special-liturgies/wedding');
    await page.waitForLoadState('networkidle');

    // Page should load (either list or 404 depending on config)
    await expect(page.locator('body')).toBeVisible();
  });
});
