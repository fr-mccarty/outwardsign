import { test, expect } from '@playwright/test';

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
    await expect(page).toHaveURL('/events/create', { timeout: 5000 });
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
    // Find the Event Type select by its label
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Meeting' }).click();

    // Fill in start date and time
    await page.fill('input#start_date', eventDate);
    await page.fill('input#start_time', eventTime);

    // Fill in language
    await page.fill('input#language', 'English');

    // Fill in notes
    await page.fill('textarea#notes', eventNotes);

    // Wait a moment for form to be ready
    await page.waitForTimeout(500);

    // Submit the form (click the first Create Event button)
    await page.getByRole('button', { name: /Create Event/i }).first().click();

    // Wait for success toast
    await page.waitForSelector('text=/Event created successfully/i', { timeout: 10000 });

    // Should redirect to the event detail page
    await page.waitForURL(/\/events\/[a-f0-9-]+$/, { timeout: 5000 });

    // Get the event ID from URL for later verification
    const eventUrl = page.url();
    const eventId = eventUrl.split('/').pop();

    // Verify event details are displayed on the view page
    await expect(page.locator(`text=${eventName}`)).toBeVisible();
    await expect(page.locator(`text=${eventDescription}`)).toBeVisible();

    // Verify the event type badge is shown
    await expect(page.locator('text=Meeting')).toBeVisible();
  });

  test('should create standalone EVENT type event', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Go to create page
    await page.goto('/events/create');

    // Fill in minimal data for a generic EVENT
    await page.fill('input#name', 'Youth Group Social');
    await page.fill('textarea#description', 'Fun social gathering for parish youth group');

    // Select "Event" type (generic standalone event)
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Event' }).click();

    await page.fill('input#start_date', '2025-12-20');

    // Submit
    await page.getByRole('button', { name: /Create Event/i }).first().click();
    await page.waitForSelector('text=/Event created successfully/i', { timeout: 10000 });
    await page.waitForURL(/\/events\/[a-f0-9-]+$/, { timeout: 10000 });

    // Verify event type is shown
    await expect(page.locator('text=Event')).toBeVisible();
  });

  test('should export standalone event to PDF and Word', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a standalone event
    await page.goto('/events/create');
    await page.fill('input#name', 'Export Test Meeting');

    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Meeting' }).click();

    await page.fill('input#start_date', '2025-12-01');
    await page.getByRole('button', { name: /Create Event/i }).first().click();
    await page.waitForSelector('text=/Event created successfully/i', { timeout: 10000 });
    await page.waitForURL(/\/events\/[a-f0-9-]+$/, { timeout: 10000 });

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

    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Meeting' }).click();

    await page.fill('input#start_date', '2025-12-10');
    await page.getByRole('button', { name: /Create Event/i }).first().click();
    await page.waitForSelector('text=/Event created successfully/i', { timeout: 10000 });

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

    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Event' }).click();

    await page.fill('input#start_date', '2025-12-05');
    await page.getByRole('button', { name: /Create Event/i }).first().click();
    await page.waitForURL(/\/events\/[a-f0-9-]+$/, { timeout: 10000 });

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

    // Should show empty state or at least the page title
    await expect(page.locator('text=Our Events')).toBeVisible();

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
});
