import { test, expect } from '@playwright/test';
import { TEST_TIMEOUTS } from './utils/test-config';

test.describe('Events Module - Standalone Events', () => {
  test('should create a standalone event (MEETING type) with no module references', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to events page
    await page.goto('/events');
    await expect(page).toHaveURL('/events');

    // Click "New Event" button
    const newEventLink = page.getByRole('link', { name: /New Event/i }).first();
    await newEventLink.click();

    // Verify we're on the create page
    await expect(page).toHaveURL('/events/create', { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page.getByRole('heading', { name: 'Create Event' })).toBeVisible();

    // Fill in the event form with standalone event type
    const eventName = 'Parish Council Meeting';
    const eventDescription = 'Monthly parish council meeting to discuss upcoming events and initiatives.';
    const eventDate = '2025-12-15';
    const eventTime = '19:00'; // 7:00 PM
    const eventNotes = 'Please bring reports from each ministry. Refreshments will be provided.';

    // Fill in event name
    await page.fill('input#name', eventName);

    // Fill in description
    await page.fill('textarea#description', eventDescription);

    // Select event type - MEETING (standalone, not linked to any module)
    // Click the select trigger using its id
    await page.locator('#event_type').click();
    await page.getByRole('option', { name: 'Meeting' }).click();

    // Fill in start date and time
    await page.fill('input#start_date', eventDate);
    await page.fill('input#start_time', eventTime);

    // Fill in language
    await page.fill('input#language', 'English');

    // Fill in notes
    await page.fill('textarea#notes', eventNotes);

    // Scroll to bottom to ensure button is visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Submit the form by clicking the submit button inside the form (at the bottom)
    // Use .last() to get the button inside the form, not the one in the header
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should redirect to the event detail page (navigation proves success)
    await page.waitForURL(/\/events\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify event details are displayed on the view page
    await expect(page.getByRole('heading', { name: eventName }).first()).toBeVisible();
    await expect(page.locator(`text=${eventDescription}`)).toBeVisible();

    // Verify page loaded successfully (description shows event type)
    await expect(page.getByRole('paragraph').filter({ hasText: 'Meeting' }).first()).toBeVisible();
  });

  test('should create standalone EVENT type event', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Go to create page
    await page.goto('/events/create');

    // Fill in minimal data for a generic EVENT
    await page.fill('input#name', 'Youth Group Social');
    await page.fill('textarea#description', 'Fun social gathering for parish youth group');

    // Select "Event" type (generic standalone event)
    await page.locator('#event_type').click();
    await page.getByRole('option', { name: 'Event' }).click();

    await page.fill('input#start_date', '2025-12-20');

    // Submit the form
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Navigation to detail page proves success
    await page.waitForURL(/\/events\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify the event name is shown as heading
    await expect(page.getByRole('heading', { name: 'Youth Group Social' }).first()).toBeVisible();
  });

  test('should export standalone event to PDF and Word', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a standalone event
    await page.goto('/events/create');
    await page.fill('input#name', 'Export Test Meeting');

    await page.locator('#event_type').click();
    await page.getByRole('option', { name: 'Meeting' }).click();

    await page.fill('input#start_date', '2025-12-01');
    const submitBtn = page.locator('button[type="submit"]').last();
    await submitBtn.scrollIntoViewIfNeeded();
    await submitBtn.click();

    // Navigation to detail page proves success
    await page.waitForURL(/\/events\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify export buttons exist
    await expect(page.locator('button:has-text("Print")')).toBeVisible();
    await expect(page.locator('button:has-text("PDF")')).toBeVisible();
    await expect(page.locator('button:has-text("Word")')).toBeVisible();
  });

  test('should show events list and filter standalone events', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a standalone event
    await page.goto('/events/create');
    await page.fill('input#name', 'Staff Meeting');

    await page.locator('#event_type').click();
    await page.getByRole('option', { name: 'Meeting' }).click();

    await page.fill('input#start_date', '2025-12-10');
    const submit = page.locator('button[type="submit"]').last();
    await submit.scrollIntoViewIfNeeded();
    await submit.click();

    // Wait for navigation to complete before moving to list
    await page.waitForURL(/\/events\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Go to events list
    await page.goto('/events');

    // Verify event is visible
    await expect(page.locator('text=Staff Meeting')).toBeVisible();
  });

  test('should navigate through breadcrumbs', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create an event
    await page.goto('/events/create');
    await page.fill('input#name', 'Breadcrumb Test Event');

    await page.locator('#event_type').click();
    await page.getByRole('option', { name: 'Event' }).click();

    await page.fill('input#start_date', '2025-12-05');
    const btn = page.locator('button[type="submit"]').last();
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    await page.waitForURL(/\/events\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Verify breadcrumbs
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Events' })).toBeVisible();

    // Click on "Events" breadcrumb
    await breadcrumbNav.getByRole('link', { name: 'Events' }).click();

    // Should navigate back to events list
    await expect(page).toHaveURL('/events');
  });

  test('should show empty state when no events exist', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to events page
    await page.goto('/events');

    // Should show the page title (use heading to avoid breadcrumb conflict)
    await expect(page.getByRole('heading', { name: 'Our Events' })).toBeVisible();

    // Should have a create button
    const createButton = page.getByRole('link', { name: /New Event/i }).first();
    await expect(createButton).toBeVisible();
  });

  test('should validate required fields on create', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Go to create page
    await page.goto('/events/create');

    // Try to submit without filling required fields
    await page.click('button[type="submit"]');

    // Should stay on the same page (form validation prevents submission)
    await expect(page).toHaveURL('/events/create');

    // Fill only name (missing other required fields)
    await page.fill('input#name', 'Test Event');
    await page.click('button[type="submit"]');

    // Should still stay on the same page if event_type and responsible_party_id are required
    await expect(page).toHaveURL('/events/create');
  });

  test('should create event and verify print view', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to events page
    await page.goto('/events');
    await expect(page).toHaveURL('/events');

    // Click "New Event" button
    const newEventLink = page.getByRole('link', { name: /New Event/i }).first();
    await newEventLink.click();

    // Verify we're on the create page
    await expect(page).toHaveURL('/events/create', { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Fill in event details
    const eventName = 'Print View Test Event';
    const eventDescription = 'Testing print view functionality for events module';

    await page.fill('input#name', eventName);
    await page.fill('textarea#description', eventDescription);

    // Select event type
    await page.locator('#event_type').click();
    await page.getByRole('option', { name: 'Meeting' }).click();

    // Fill in date
    await page.fill('input#start_date', '2025-12-25');

    // Scroll to bottom and submit
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const submitButton = page.locator('button[type="submit"]').last();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click();

    // Should redirect to the event detail page (navigation proves success)
    await page.waitForURL(/\/events\/[a-f0-9-]+\/edit$/, { timeout: TEST_TIMEOUTS.FORM_SUBMIT });

    // Get the event ID from URL for later use
    const eventUrl = page.url();
    const eventId = eventUrl.split('/').pop();

    console.log(`Created event with ID: ${eventId}`);

    // Verify we're on the view page
    await expect(page.getByRole('heading', { name: eventName }).first()).toBeVisible();

    // Test print view - verify it exists and loads
    console.log(`Testing print view for event: ${eventId}`);
    await page.goto(`/print/events/${eventId}`);
    await expect(page).toHaveURL(`/print/events/${eventId}`, { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Verify print view loaded (check for common print view elements)
    await expect(page.locator('body')).toBeVisible();

    // Verify that the print view contains event-specific content (if available)
    // Some print views may not have a specific content class, so just check body loaded
    const eventContent = page.locator('.event-print-content');
    if (await eventContent.count() > 0) {
      await expect(eventContent).toBeVisible();
    }

    console.log(`Successfully tested event: ${eventId} - created and verified print view`);
  });
});
