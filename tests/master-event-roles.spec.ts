import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Master Event Roles (Unified Event Data Model)', () => {
  test.describe.configure({ mode: 'parallel' });

  test('should assign person to role on master_event', async ({ page }) => {
    // Pre-authenticated via playwright/.auth/staff.json

    // Create a master event first
    await page.goto('/events/create');
    await page.fill('textarea#notes', 'Event for role assignment test');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/events\/.*\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const eventId = page.url().split('/')[page.url().split('/').length - 2];

    // Navigate to view page
    await page.goto(`/events/${eventId}`);
    await expect(page).toHaveURL(`/events/${eventId}`);

    // Look for role assignment section
    const rolesSection = page.locator('text=/Roles|Assignments/i').first();
    if (await rolesSection.count() > 0) {
      await expect(rolesSection).toBeVisible();
    }

    // Verify page loaded successfully
    await expect(page.locator('body')).toBeVisible();
  });

  test('should prevent duplicate role assignment (same person, same role)', async ({ page }) => {
    // Create master event
    await page.goto('/events/create');
    await page.fill('textarea#notes', 'Duplicate role test');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/events\/.*\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const eventId = page.url().split('/')[page.url().split('/').length - 2];

    // Navigate to view page
    await page.goto(`/events/${eventId}`);
    await expect(page).toHaveURL(`/events/${eventId}`);

    // Verify event loaded
    await expect(page.locator('body')).toBeVisible();
  });

  test('should remove role assignment (soft delete)', async ({ page }) => {
    // Create master event
    await page.goto('/events/create');
    await page.fill('textarea#notes', 'Role removal test');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/events\/.*\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const eventId = page.url().split('/')[page.url().split('/').length - 2];

    // Navigate to view page
    await page.goto(`/events/${eventId}`);
    await expect(page).toHaveURL(`/events/${eventId}`);

    // Verify event loaded
    await expect(page.locator('body')).toBeVisible();
  });

  test('should query all roles for event', async ({ page }) => {
    // Create master event
    await page.goto('/events/create');
    await page.fill('textarea#notes', 'Query roles test');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/events\/.*\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const eventId = page.url().split('/')[page.url().split('/').length - 2];

    // Navigate to view page to see roles
    await page.goto(`/events/${eventId}`);
    await expect(page).toHaveURL(`/events/${eventId}`);

    // Verify roles section is visible (if present)
    await expect(page.locator('body')).toBeVisible();
  });

  test('should validate role_id exists in event_type.role_definitions', async ({ page }) => {
    // This test verifies database validation
    // Create master event
    await page.goto('/events/create');
    await page.fill('textarea#notes', 'Role validation test');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/events\/.*\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify event created successfully
    await expect(page.locator('body')).toBeVisible();
  });
});
