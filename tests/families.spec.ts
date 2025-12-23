import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * Families Module Tests
 *
 * Tests CRUD operations for family management.
 */

test.describe('Families', () => {
  test('create family', async ({ page }) => {
    await page.goto('/families/create');

    // Fill family name using label
    const familyNameInput = page.getByLabel(/Family Name/i);
    await familyNameInput.fill(`Test Family ${Date.now()}`);

    // Submit
    await page.locator('button[type="submit"]').click();

    // Redirects to view page after creation
    await page.waitForURL(/\/families\/[a-f0-9-]+$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });
  });

  test('list page loads', async ({ page }) => {
    await page.goto('/families');
    await expect(page).toHaveURL('/families');
    await expect(page.locator('main')).toBeVisible({ timeout: TEST_TIMEOUTS.RENDER });
  });

  test('can access create page', async ({ page }) => {
    await page.goto('/families/create');
    await expect(page).toHaveURL('/families/create');
    await expect(page.getByLabel(/Family Name/i)).toBeVisible({ timeout: TEST_TIMEOUTS.RENDER });
  });
});
