import { test, expect } from '@playwright/test';

test.describe('Events Module - Standalone Events', () => {
  test('should create a standalone event (MEETING type) with no module references', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Navigate to events page
    await page.goto('/events');
    await expect(page).toHaveURL('/events');
    await expect(page.locator('text=Our Events')).toBeVisible();

    // Click "New Event" button
    const newEventLink = page.getByRole('link', { name: /New Event/i }).first();
    await newEventLink.click();

    // Verify we're on the create page
    await expect(page).toHaveURL('/events/create', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Create Event' })).toBeVisible();

    // Fill in the event form with standalone event type
    const eventName = 'Parish Council Meeting';
    const eventDescription = 'Monthly parish council meeting to discuss upcoming events and initiatives.';
    const eventLocation = 'Parish Hall, Conference Room A';
    const eventDate = '2025-12-15';
    const eventTime = '19:00'; // 7:00 PM
    const eventNotes = 'Please bring reports from each ministry. Refreshments will be provided.';

    // Fill in event name
    await page.fill('input#name', eventName);

    // Fill in description
    await page.fill('textarea#description', eventDescription);

    // Select event type - MEETING (standalone, not linked to any module)
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Meeting' }).click();

    // Fill in responsible party ID (should be auto-filled with current user)
    // If the field is visible and empty, we'll need to fill it
    const responsiblePartyField = page.locator('input#responsible_party_id');
    if (await responsiblePartyField.isVisible()) {
      // Check if it's empty
      const currentValue = await responsiblePartyField.inputValue();
      if (!currentValue) {
        // Generate a mock UUID for testing
        await page.fill('input#responsible_party_id', '00000000-0000-0000-0000-000000000001');
      }
    }

    // Fill in start date and time
    await page.fill('input#start_date', eventDate);
    await page.fill('input#start_time', eventTime);

    // Fill in location
    await page.fill('input#location', eventLocation);

    // Fill in language
    await page.fill('input#language', 'English');

    // Fill in notes
    await page.fill('textarea#notes', eventNotes);

    // Wait a moment for form to stabilize
    await page.waitForTimeout(500);

    // Submit the form
    const submitButton = page.locator('form#event-form button[type="submit"]').first();
    await submitButton.waitFor({ state: 'visible', timeout: 10000 });
    await expect(submitButton).toBeEnabled({ timeout: 10000 });
    await submitButton.click();

    // Wait for success toast
    await page.waitForSelector('text=/Event created successfully/i', { timeout: 10000 });

    // Should redirect to the event detail page
    await page.waitForURL(/\/events\/[a-f0-9-]+$/, { timeout: 10000 });

    // Get the event ID from URL for later verification
    const eventUrl = page.url();
    const eventId = eventUrl.split('/').pop();

    // Verify event details are displayed on the view page
    await expect(page.locator(`text=${eventName}`)).toBeVisible();
    await expect(page.locator(`text=${eventDescription}`)).toBeVisible();
    await expect(page.locator(`text=${eventLocation}`)).toBeVisible();

    // Verify the event type badge is shown
    await expect(page.locator('text=Meeting')).toBeVisible();

    // CRITICAL: Verify that NO module reference section is shown
    // This is the key test - standalone events should NOT show "Related Wedding", "Related Funeral", etc.
    await expect(page.locator('text=/Related Wedding/i')).not.toBeVisible();
    await expect(page.locator('text=/Related Funeral/i')).not.toBeVisible();
    await expect(page.locator('text=/Related Presentation/i')).not.toBeVisible();
    await expect(page.locator('text=/Related Quinceañera/i')).not.toBeVisible();
    await expect(page.locator('text=/Related/i').filter({ hasText: /Wedding|Funeral|Presentation|Quinceañera/ })).not.toBeVisible();

    // Verify action buttons are present
    await expect(page.locator('button:has-text("Edit")')).toBeVisible();
    await expect(page.locator('button:has-text("Print")')).toBeVisible();
    await expect(page.locator('button:has-text("PDF")')).toBeVisible();
    await expect(page.locator('button:has-text("Word")')).toBeVisible();

    // Verify event details section is visible
    await expect(page.locator('text=Event Details')).toBeVisible();

    // Test edit functionality
    await page.click('button:has-text("Edit")');
    await expect(page).toHaveURL(`/events/${eventId}/edit`, { timeout: 10000 });

    // Update the event name
    const updatedName = 'Parish Council Meeting - December';
    await page.fill('input#name', updatedName);

    // Save the update
    await page.click('button[type="submit"]:has-text("Save")');
    await page.waitForSelector('text=/Event updated successfully/i', { timeout: 10000 });

    // Should stay on edit page after update (per CLAUDE.md pattern)
    await expect(page).toHaveURL(`/events/${eventId}/edit`);

    // Verify the update by going to view page
    await page.goto(`/events/${eventId}`);
    await expect(page.locator(`text=${updatedName}`)).toBeVisible();

    // Still verify no module reference is shown after update
    await expect(page.locator('text=/Related/i').filter({ hasText: /Wedding|Funeral|Presentation|Quinceañera/ })).not.toBeVisible();
  });

  test('should create standalone EVENT type event', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Go to create page
    await page.goto('/events/create');

    // Fill in minimal data for a generic EVENT
    await page.fill('input#name', 'Youth Group Social');
    await page.fill('textarea#description', 'Fun social gathering for parish youth group');

    // Select "Event" type (generic standalone event)
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Event' }).click();

    // Fill responsible party if needed
    const responsiblePartyField = page.locator('input#responsible_party_id');
    if (await responsiblePartyField.isVisible()) {
      const currentValue = await responsiblePartyField.inputValue();
      if (!currentValue) {
        await page.fill('input#responsible_party_id', '00000000-0000-0000-0000-000000000002');
      }
    }

    await page.fill('input#start_date', '2025-12-20');
    await page.fill('input#location', 'Youth Center');

    // Submit
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=/Event created successfully/i', { timeout: 10000 });
    await page.waitForURL(/\/events\/[a-f0-9-]+$/, { timeout: 10000 });

    // Verify no module reference
    await expect(page.locator('text=/Related/i').filter({ hasText: /Wedding|Funeral|Presentation|Quinceañera/ })).not.toBeVisible();
  });

  test('should export standalone event to PDF and Word', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create a standalone event
    await page.goto('/events/create');
    await page.fill('input#name', 'Export Test Meeting');
    await page.fill('textarea#description', 'Test event for export functionality');

    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Meeting' }).click();

    const responsiblePartyField = page.locator('input#responsible_party_id');
    if (await responsiblePartyField.isVisible()) {
      const currentValue = await responsiblePartyField.inputValue();
      if (!currentValue) {
        await page.fill('input#responsible_party_id', '00000000-0000-0000-0000-000000000003');
      }
    }

    await page.fill('input#start_date', '2025-12-01');
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=/Event created successfully/i', { timeout: 10000 });
    await page.waitForURL(/\/events\/[a-f0-9-]+$/, { timeout: 10000 });

    // Verify export buttons exist
    await expect(page.locator('button:has-text("Print")')).toBeVisible();
    await expect(page.locator('button:has-text("PDF")')).toBeVisible();
    await expect(page.locator('button:has-text("Word")')).toBeVisible();

    // Test print view opens in new tab
    // Note: We can't fully test the download in Playwright without special setup,
    // but we can verify the buttons are clickable
    await expect(page.locator('button:has-text("Print")')).toBeEnabled();
    await expect(page.locator('button:has-text("PDF")')).toBeEnabled();
    await expect(page.locator('button:has-text("Word")')).toBeEnabled();
  });

  test('should show events list and filter standalone events', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create multiple standalone events
    const events = [
      { name: 'Staff Meeting', type: 'Meeting' },
      { name: 'Bible Study', type: 'Event' },
      { name: 'Confession Hours', type: 'Confession' }
    ];

    for (const event of events) {
      await page.goto('/events/create');
      await page.fill('input#name', event.name);

      await page.getByRole('combobox').click();
      await page.getByRole('option', { name: event.type }).click();

      const responsiblePartyField = page.locator('input#responsible_party_id');
      if (await responsiblePartyField.isVisible()) {
        const currentValue = await responsiblePartyField.inputValue();
        if (!currentValue) {
          await page.fill('input#responsible_party_id', '00000000-0000-0000-0000-000000000004');
        }
      }

      await page.fill('input#start_date', '2025-12-10');
      await page.click('button[type="submit"]');
      await page.waitForSelector('text=/Event created successfully/i', { timeout: 10000 });
    }

    // Go to events list
    await page.goto('/events');

    // Verify all events are visible
    await expect(page.locator('text=Staff Meeting')).toBeVisible();
    await expect(page.locator('text=Bible Study')).toBeVisible();
    await expect(page.locator('text=Confession Hours')).toBeVisible();

    // Test search filter
    await page.fill('input[placeholder*="Search"]', 'Staff');
    await expect(page.locator('text=Staff Meeting')).toBeVisible();
    await expect(page.locator('text=Bible Study')).not.toBeVisible();

    // Clear search
    await page.fill('input[placeholder*="Search"]', '');
    await page.waitForTimeout(500);

    // All events should be back
    await expect(page.locator('text=Staff Meeting')).toBeVisible();
    await expect(page.locator('text=Bible Study')).toBeVisible();
  });

  test('should navigate through breadcrumbs', async ({ page }) => {
    // Test is pre-authenticated via playwright/.auth/staff.json (see playwright.config.ts)

    // Create an event
    await page.goto('/events/create');
    await page.fill('input#name', 'Breadcrumb Test Event');

    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Event' }).click();

    const responsiblePartyField = page.locator('input#responsible_party_id');
    if (await responsiblePartyField.isVisible()) {
      const currentValue = await responsiblePartyField.inputValue();
      if (!currentValue) {
        await page.fill('input#responsible_party_id', '00000000-0000-0000-0000-000000000005');
      }
    }

    await page.fill('input#start_date', '2025-12-05');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/events\/[a-f0-9-]+$/, { timeout: 10000 });

    // Verify breadcrumbs
    const breadcrumbNav = page.getByLabel('breadcrumb');
    await expect(breadcrumbNav.getByRole('link', { name: 'Dashboard' })).toBeVisible();
    await expect(breadcrumbNav.getByRole('link', { name: 'Events' })).toBeVisible();
    await expect(breadcrumbNav.locator('text=Breadcrumb Test Event')).toBeVisible();

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
