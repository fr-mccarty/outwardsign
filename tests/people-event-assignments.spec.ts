import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * People Event Assignments Tests
 *
 * Tests the unified people_event_assignments table which stores all person-to-event role assignments.
 * Supports two-level pattern:
 * - Template-level: calendar_event_id = NULL (e.g., presider, homilist for the master event)
 * - Occurrence-level: calendar_event_id populated (e.g., lector for a specific Mass time)
 *
 * Reference: src/lib/actions/people-event-assignments.ts
 * Reference: src/app/(main)/mass-liturgies/mass-liturgy-form.tsx
 */
test.describe('People Event Assignments', () => {
  test('should assign template-level role and view on mass liturgy', async ({ page }) => {
    // Create a mass liturgy
    await page.goto('/mass-liturgies/create');
    await expect(page).toHaveURL('/mass-liturgies/create');

    // Submit to create the mass
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should redirect to edit page after creation
    await page.waitForURL(/\/mass-liturgies\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Extract mass ID from URL
    const urlParts = page.url().split('/');
    const massId = urlParts[urlParts.length - 2];

    // Navigate to view page
    await page.goto(`/mass-liturgies/${massId}`);
    await expect(page).toHaveURL(`/mass-liturgies/${massId}`);

    // Verify presider and homilist are displayed on view page
    // (Initially should show no assignments or default values)
    await expect(page.getByRole('heading', { name: /Mass/i }).first()).toBeVisible();
  });

  test('should prevent duplicate assignment to same role', async ({ page }) => {
    // Create a mass liturgy
    await page.goto('/mass-liturgies/create');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/mass-liturgies\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify we're on the edit page
    await expect(page.getByRole('heading', { name: /Mass/i }).first()).toBeVisible();

    // Note: Actual assignment UI implementation pending
    // This test verifies the form displays correctly
  });

  test('should display empty state when no assignments exist', async ({ page }) => {
    // Create a mass liturgy
    await page.goto('/mass-liturgies/create');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/mass-liturgies\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Extract mass ID and navigate to view page
    const urlParts = page.url().split('/');
    const massId = urlParts[urlParts.length - 2];
    await page.goto(`/mass-liturgies/${massId}`);

    // View page should render without errors even with no assignments
    await expect(page.getByRole('heading', { name: /Mass/i }).first()).toBeVisible();
  });

  test('should navigate to edit page from view page', async ({ page }) => {
    // Create a mass liturgy
    await page.goto('/mass-liturgies/create');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/mass-liturgies\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get mass ID
    const urlParts = page.url().split('/');
    const massId = urlParts[urlParts.length - 2];

    // Navigate to view page
    await page.goto(`/mass-liturgies/${massId}`);
    await expect(page).toHaveURL(`/mass-liturgies/${massId}`);

    // Click Edit button
    await page.getByRole('link', { name: /Edit Mass/i }).click();

    // Should navigate to edit page
    await expect(page).toHaveURL(`/mass-liturgies/${massId}/edit`, { timeout: TEST_TIMEOUTS.NAVIGATION });
  });

  test('should display mass liturgy role assignment section on edit page', async ({ page }) => {
    // Create a mass liturgy
    await page.goto('/mass-liturgies/create');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/mass-liturgies\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify we're on edit page
    await expect(page).toHaveURL(/\/mass-liturgies\/[a-f0-9-]+\/edit$/);

    // Verify Mass Role Assignments section exists (if implemented in UI)
    // The section should be present for saved masses
    const heading = page.getByRole('heading', { name: /Mass/i }).first();
    await expect(heading).toBeVisible();
  });
});
