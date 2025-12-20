/**
 * Tests for Event View and Edit Page UI Changes
 *
 * Verifies:
 * 1. View page shows only scripts (no calendar events section)
 * 2. View page has "Configure Scripts" settings link
 * 3. Edit page has "Configure Input Fields" in three-dot menu
 */

import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Event View and Edit Pages', () => {
  test.describe.configure({ mode: 'parallel' });

  test('view page should show scripts section and settings link', async ({ page }) => {
    // Navigate to events page and create an event
    await page.goto('/events');
    await expect(page).toHaveURL('/events');

    // Click "New Event" button
    const newEventLink = page.getByRole('link', { name: /New Event/i }).first();
    await newEventLink.click();

    // Wait for event type selection or create page
    await page.waitForURL(/\/events\/create|\/events\/[^/]+\/create/, { timeout: TEST_TIMEOUTS.NAVIGATION });

    // If on event type selection page, select first event type
    const eventTypeCard = page.locator('[data-testid="event-type-card"]').first();
    if (await eventTypeCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      await eventTypeCard.click();
      await page.waitForURL(/\/events\/[^/]+\/create/, { timeout: TEST_TIMEOUTS.NAVIGATION });
    }

    // Submit the form to create the event
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Wait for redirect to edit page
    await page.waitForURL(/\/events\/[^/]+\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Extract event ID and navigate to view page
    const urlParts = page.url().split('/');
    const eventId = urlParts[urlParts.length - 2];
    const eventTypeSlug = urlParts[urlParts.length - 3];

    await page.goto(`/events/${eventTypeSlug}/${eventId}`);
    await expect(page).toHaveURL(`/events/${eventTypeSlug}/${eventId}`);

    // Verify Scripts section is visible
    await expect(page.getByRole('heading', { name: 'Scripts' })).toBeVisible();

    // Verify Calendar Events section is NOT visible
    await expect(page.getByRole('heading', { name: 'Calendar Events' })).not.toBeVisible();

    // Verify "Configure Scripts" settings link is visible
    await expect(page.getByRole('link', { name: /Configure Scripts/i })).toBeVisible();
  });

  test('edit page should have Configure Input Fields in menu', async ({ page }) => {
    // Navigate to events page
    await page.goto('/events');
    await expect(page).toHaveURL('/events');

    // Click "New Event" button
    const newEventLink = page.getByRole('link', { name: /New Event/i }).first();
    await newEventLink.click();

    // Wait for create page
    await page.waitForURL(/\/events\/create|\/events\/[^/]+\/create/, { timeout: TEST_TIMEOUTS.NAVIGATION });

    // If on event type selection page, select first event type
    const eventTypeCard = page.locator('[data-testid="event-type-card"]').first();
    if (await eventTypeCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      await eventTypeCard.click();
      await page.waitForURL(/\/events\/[^/]+\/create/, { timeout: TEST_TIMEOUTS.NAVIGATION });
    }

    // Submit the form
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Wait for redirect to edit page
    await page.waitForURL(/\/events\/[^/]+\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify we're on the edit page
    await expect(page.locator('button[type="submit"]').first()).toBeVisible();

    // Click the three-dot menu button
    const moreButton = page.getByRole('button', { name: /More actions/i });
    await expect(moreButton).toBeVisible();
    await moreButton.click();

    // Verify "Configure Input Fields" menu item is visible
    await expect(page.getByRole('menuitem', { name: /Configure Input Fields/i })).toBeVisible();

    // Verify "View" menu item is also visible
    await expect(page.getByRole('menuitem', { name: /View/i })).toBeVisible();
  });

  test('Configure Scripts link should navigate to settings', async ({ page }) => {
    // Create an event first
    await page.goto('/events');
    const newEventLink = page.getByRole('link', { name: /New Event/i }).first();
    await newEventLink.click();

    await page.waitForURL(/\/events\/create|\/events\/[^/]+\/create/, { timeout: TEST_TIMEOUTS.NAVIGATION });

    const eventTypeCard = page.locator('[data-testid="event-type-card"]').first();
    if (await eventTypeCard.isVisible({ timeout: 2000 }).catch(() => false)) {
      await eventTypeCard.click();
      await page.waitForURL(/\/events\/[^/]+\/create/, { timeout: TEST_TIMEOUTS.NAVIGATION });
    }

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.locator('button[type="submit"]').last().click();
    await page.waitForURL(/\/events\/[^/]+\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Navigate to view page
    const urlParts = page.url().split('/');
    const eventId = urlParts[urlParts.length - 2];
    const eventTypeSlug = urlParts[urlParts.length - 3];
    await page.goto(`/events/${eventTypeSlug}/${eventId}`);

    // Click Configure Scripts link
    const configureLink = page.getByRole('link', { name: /Configure Scripts/i });
    await expect(configureLink).toBeVisible();
    await configureLink.click();

    // Should navigate to settings page
    await expect(page).toHaveURL(/\/settings\/events\//, { timeout: TEST_TIMEOUTS.NAVIGATION });
  });
});
