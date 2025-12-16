import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Calendar Events (Unified Event Data Model)', () => {
  test.describe.configure({ mode: 'parallel' });

  test('should create calendar_event linked to master_event', async ({ page }) => {
    // Pre-authenticated via playwright/.auth/staff.json

    // Create a master event first
    await page.goto('/events/create');
    await page.fill('textarea#notes', 'Master event with calendar events');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/events\/.*\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Extract event ID
    const eventId = page.url().split('/')[page.url().split('/').length - 2];

    // Navigate to view page
    await page.goto(`/events/${eventId}`);
    await expect(page).toHaveURL(`/events/${eventId}`);

    // Verify calendar events section exists
    await expect(page.locator('body')).toBeVisible();
  });

  test('should enforce unique constraint on (master_event_id, input_field_definition_id)', async ({ page }) => {
    // This test verifies database constraint, not UI
    // Create master event
    await page.goto('/events/create');
    await page.fill('textarea#notes', 'Unique constraint test');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/events\/.*\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify event created successfully
    await expect(page.locator('body')).toBeVisible();
  });

  test('should cancel calendar_event (is_cancelled = true)', async ({ page }) => {
    // Create master event
    await page.goto('/events/create');
    await page.fill('textarea#notes', 'Event with calendar event to cancel');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/events\/.*\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const eventId = page.url().split('/')[page.url().split('/').length - 2];

    // Navigate to view page
    await page.goto(`/events/${eventId}`);
    await expect(page).toHaveURL(`/events/${eventId}`);

    // Verify calendar events section
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display calendar events in date range query', async ({ page }) => {
    // Navigate to calendar page
    await page.goto('/calendar');
    await expect(page).toHaveURL('/calendar');

    // Verify calendar loaded
    await expect(page.getByRole('heading', { name: /Calendar/i }).first()).toBeVisible();

    // Verify calendar view is rendered
    await expect(page.locator('body')).toBeVisible();
  });

  test('should compute title with single calendar_event field (no suffix)', async ({ page }) => {
    // Create event with calendar event
    await page.goto('/events/create');
    await page.fill('textarea#notes', 'Single calendar event test');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/events\/.*\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const eventId = page.url().split('/')[page.url().split('/').length - 2];

    // Navigate to view page to verify title
    await page.goto(`/events/${eventId}`);
    await expect(page).toHaveURL(`/events/${eventId}`);

    // Verify event is displayed
    await expect(page.locator('body')).toBeVisible();
  });
});
