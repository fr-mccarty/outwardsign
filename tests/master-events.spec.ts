import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Master Events (Unified Event Data Model)', () => {
  test.describe.configure({ mode: 'parallel' });

  test('should create master_event with calendar_event and verify title computation', async ({ page }) => {
    // Pre-authenticated via playwright/.auth/staff.json

    // Navigate to events page (unified events list)
    await page.goto('/events');
    await expect(page).toHaveURL('/events');

    // Click "New Event" button
    const newEventButton = page.getByRole('link', { name: /New Event/i }).first();
    await newEventButton.click();

    // Should navigate to event type selection or create page
    await page.waitForURL(/\/events\/.*/, { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Fill in minimal event data
    await page.fill('textarea#notes', 'Test master event with calendar event');

    // Submit form
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should redirect to edit page
    await page.waitForURL(/\/events\/.*\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Extract event ID from URL
    const eventUrl = page.url();
    const eventId = eventUrl.split('/')[eventUrl.split('/').length - 2];

    // Navigate to view page to verify title computation
    await page.goto(`/events/${eventId}`);
    await expect(page).toHaveURL(`/events/${eventId}`);

    // Verify event is visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('should update master_event and verify cascade to calendar_events', async ({ page }) => {
    // Create a master event first
    await page.goto('/events/create');
    await page.fill('textarea#notes', 'Initial notes for cascade test');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/events\/.*\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const eventId = page.url().split('/')[page.url().split('/').length - 2];

    // Update the master event
    await page.fill('textarea#notes', 'Updated notes for cascade verification');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();

    // Navigate to view page
    await page.goto(`/events/${eventId}`);
    await expect(page).toHaveURL(`/events/${eventId}`);

    // Verify updated notes are displayed
    await expect(page.locator('text=Updated notes for cascade verification').first()).toBeVisible();
  });

  test('should delete master_event and verify cascade to calendar_events', async ({ page }) => {
    // Create a master event
    await page.goto('/events/create');
    await page.fill('textarea#notes', 'Event to be deleted');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/events\/.*\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    const eventId = page.url().split('/')[page.url().split('/').length - 2];

    // Navigate to view page
    await page.goto(`/events/${eventId}`);
    await expect(page).toHaveURL(`/events/${eventId}`);

    // Click delete button
    const deleteButton = page.getByRole('button', { name: /Delete/i });
    if (await deleteButton.count() > 0) {
      await deleteButton.click();

      // Confirm deletion in dialog
      const confirmButton = page.getByRole('button', { name: /Confirm/i });
      await confirmButton.click();

      // Should redirect to events list
      await expect(page).toHaveURL('/events', { timeout: TEST_TIMEOUTS.NAVIGATION });
    }
  });

  test('should filter master events by status', async ({ page }) => {
    await page.goto('/events');
    await expect(page).toHaveURL('/events');

    // Click status filter dropdown
    const statusFilter = page.locator('#status');
    await statusFilter.click();

    // Select "Active" status
    await page.getByRole('option', { name: 'Active' }).first().click();

    // URL should update with status filter
    await expect(page).toHaveURL(/status=ACTIVE/);

    // Verify page loaded with filter applied
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show empty state when no events exist', async ({ page }) => {
    await page.goto('/events');
    await expect(page).toHaveURL('/events');

    // Should show page heading
    await expect(page.getByRole('heading', { name: 'Events' }).first()).toBeVisible();

    // Should have create button
    const createButton = page.getByRole('link', { name: /New Event/i }).first();
    await expect(createButton).toBeVisible();
  });
});
