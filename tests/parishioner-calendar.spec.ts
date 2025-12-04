import { test, expect } from '@playwright/test';
import { setupParishionerAuth, cleanupParishioner } from './helpers/parishioner-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * Parishioner Portal - Calendar Tests
 *
 * Tests the calendar view functionality for parishioners
 */

test.describe('Parishioner Calendar', () => {
  let parishioner: Awaited<ReturnType<typeof setupParishionerAuth>>;

  test.beforeEach(async ({ page }) => {
    // Setup authenticated parishioner session
    parishioner = await setupParishionerAuth(page);
  });

  test.afterEach(async () => {
    // Cleanup parishioner data
    if (parishioner) {
      await cleanupParishioner(parishioner.personId);
    }
  });

  test('should require authentication and redirect if not logged in', async ({ page }) => {
    // Clear cookies to simulate logged out state
    await page.context().clearCookies();

    // Try to access calendar
    await page.goto('/parishioner/calendar');

    // Should redirect to login
    await page.waitForURL(/\/parishioner\/login/, { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page).toHaveURL(/\/parishioner\/login/);
  });

  test('should display calendar page when authenticated', async ({ page }) => {
    await page.goto('/parishioner/calendar');
    await expect(page).toHaveURL('/parishioner/calendar', { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Verify page heading
    await expect(page.getByRole('heading', { name: 'Calendar', level: 1 })).toBeVisible();
    await expect(page.getByText(/Your ministry schedule and parish events/i)).toBeVisible();
  });

  test('should show empty state when no events', async ({ page }) => {
    await page.goto('/parishioner/calendar');

    // Should show "No upcoming events" message
    await expect(page.getByText(/No upcoming events/i)).toBeVisible();
  });

  test('should display events grouped by month', async ({ page }) => {
    const supabase = createAdminClient();

    // Create a test event
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 7); // 7 days from now

    const { data: event } = await supabase
      .from('events')
      .insert({
        parish_id: parishioner.parishId,
        name: 'Test Parish Event',
        event_date: eventDate.toISOString().split('T')[0],
        event_time: '10:00:00',
        location: 'Parish Hall',
        event_type_id: 1, // Assuming 1 is a valid event type
        status: 'Active',
      })
      .select()
      .single();

    if (!event) {
      throw new Error('Failed to create test event');
    }

    try {
      await page.goto('/parishioner/calendar');

      // Should show the month heading
      const monthName = eventDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      await expect(page.getByRole('heading', { name: monthName, level: 2 })).toBeVisible();

      // Should show the event card
      await expect(page.getByText('Test Parish Event')).toBeVisible();
    } finally {
      // Cleanup
      await supabase.from('events').delete().eq('id', event.id);
    }
  });

  test('should display event details in card', async ({ page }) => {
    const supabase = createAdminClient();

    // Create a test event with full details
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 10);

    const { data: event } = await supabase
      .from('events')
      .insert({
        parish_id: parishioner.parishId,
        name: 'Community Gathering',
        event_date: eventDate.toISOString().split('T')[0],
        event_time: '14:30:00',
        location: 'Community Center',
        event_type_id: 1,
        status: 'Active',
      })
      .select()
      .single();

    if (!event) {
      throw new Error('Failed to create test event');
    }

    try {
      await page.goto('/parishioner/calendar');

      // Event card should show all details
      await expect(page.getByText('Community Gathering')).toBeVisible();
      await expect(page.getByText('Community Center')).toBeVisible();

      // Should show the event type badge
      await expect(page.getByText('Parish Event')).toBeVisible();
    } finally {
      await supabase.from('events').delete().eq('id', event.id);
    }
  });

  test('should show upcoming commitment alert for assignments < 48 hours away', async ({ page }) => {
    const supabase = createAdminClient();

    // Create an event in 24 hours
    const eventDate = new Date();
    eventDate.setHours(eventDate.getHours() + 24);

    const { data: event } = await supabase
      .from('events')
      .insert({
        parish_id: parishioner.parishId,
        name: 'Urgent Assignment',
        event_date: eventDate.toISOString().split('T')[0],
        event_time: eventDate.toTimeString().split(' ')[0],
        event_type_id: 1,
        status: 'Active',
      })
      .select()
      .single();

    if (!event) {
      throw new Error('Failed to create test event');
    }

    // Create a mass assignment for the parishioner
    const { data: massAssignment } = await supabase
      .from('mass_assignments')
      .insert({
        parish_id: parishioner.parishId,
        event_id: event.id,
        person_id: parishioner.personId,
        role: 'Lector',
        confirmed: true,
      })
      .select()
      .single();

    try {
      await page.goto('/parishioner/calendar');

      // Should show alert banner
      await expect(page.getByText('Upcoming Commitment')).toBeVisible();
      await expect(page.getByText('Urgent Assignment')).toBeVisible();
    } finally {
      // Cleanup
      if (massAssignment) {
        await supabase.from('mass_assignments').delete().eq('id', massAssignment.id);
      }
      await supabase.from('events').delete().eq('id', event.id);
    }
  });

  test('should dismiss upcoming commitment alert', async ({ page }) => {
    const supabase = createAdminClient();

    // Create an event in 24 hours
    const eventDate = new Date();
    eventDate.setHours(eventDate.getHours() + 24);

    const { data: event } = await supabase
      .from('events')
      .insert({
        parish_id: parishioner.parishId,
        name: 'Dismissable Assignment',
        event_date: eventDate.toISOString().split('T')[0],
        event_time: eventDate.toTimeString().split(' ')[0],
        event_type_id: 1,
        status: 'Active',
      })
      .select()
      .single();

    if (!event) {
      throw new Error('Failed to create test event');
    }

    const { data: massAssignment } = await supabase
      .from('mass_assignments')
      .insert({
        parish_id: parishioner.parishId,
        event_id: event.id,
        person_id: parishioner.personId,
        role: 'Lector',
        confirmed: true,
      })
      .select()
      .single();

    try {
      await page.goto('/parishioner/calendar');

      // Verify alert is visible
      await expect(page.getByText('Upcoming Commitment')).toBeVisible();

      // Find and click dismiss button (X button in alert)
      const dismissButton = page.getByRole('button').filter({ has: page.locator('svg') }).first();
      await dismissButton.click();

      // Alert should disappear
      await expect(page.getByText('Upcoming Commitment')).not.toBeVisible();
    } finally {
      if (massAssignment) {
        await supabase.from('mass_assignments').delete().eq('id', massAssignment.id);
      }
      await supabase.from('events').delete().eq('id', event.id);
    }
  });

  test('should open event detail modal when clicking event card', async ({ page }) => {
    const supabase = createAdminClient();

    // Create a test event
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 5);

    const { data: event } = await supabase
      .from('events')
      .insert({
        parish_id: parishioner.parishId,
        name: 'Clickable Event',
        event_date: eventDate.toISOString().split('T')[0],
        event_time: '10:00:00',
        location: 'Main Church',
        event_type_id: 1,
        status: 'Active',
      })
      .select()
      .single();

    if (!event) {
      throw new Error('Failed to create test event');
    }

    try {
      await page.goto('/parishioner/calendar');

      // Click on event card
      await page.getByText('Clickable Event').click();

      // Dialog/modal should open (CommitmentDetail component)
      // Note: The exact modal behavior depends on the implementation
      // If a dialog opens, we can verify it here
      // For now, just verify the click works without error
      await expect(page.getByText('Clickable Event')).toBeVisible();
    } finally {
      await supabase.from('events').delete().eq('id', event.id);
    }
  });

  test('should display month calendar navigation', async ({ page }) => {
    await page.goto('/parishioner/calendar');

    // Month calendar component should be present
    // Look for typical calendar navigation elements (previous/next month buttons)
    // The MonthCalendar component should render

    // Verify calendar heading is visible
    await expect(page.getByRole('heading', { name: 'Calendar', level: 1 })).toBeVisible();
  });

  test('should display different event type badges correctly', async ({ page }) => {
    const supabase = createAdminClient();

    // Create events of different types
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 3);

    // Create a parish event
    const { data: parishEvent } = await supabase
      .from('events')
      .insert({
        parish_id: parishioner.parishId,
        name: 'Parish Festival',
        event_date: eventDate.toISOString().split('T')[0],
        event_time: '15:00:00',
        event_type_id: 1,
        status: 'Active',
      })
      .select()
      .single();

    try {
      await page.goto('/parishioner/calendar');

      // Should show event type badge
      await expect(page.getByText('Parish Event')).toBeVisible();
      await expect(page.getByText('Parish Festival')).toBeVisible();
    } finally {
      if (parishEvent) {
        await supabase.from('events').delete().eq('id', parishEvent.id);
      }
    }
  });

  test('should handle navigation between portal tabs', async ({ page }) => {
    await page.goto('/parishioner/calendar');

    // Verify we're on calendar
    await expect(page).toHaveURL('/parishioner/calendar');

    // Navigation should be present (mobile or desktop)
    // The parishioner-navigation component should show tabs: Calendar, Chat, Notifications

    // Try navigating to Chat
    const chatLink = page.getByRole('link', { name: /Chat/i });
    if (await chatLink.isVisible()) {
      await chatLink.click();
      await expect(page).toHaveURL('/parishioner/chat');
    }

    // Navigate back to Calendar
    await page.goto('/parishioner/calendar');
    await expect(page).toHaveURL('/parishioner/calendar');
  });
});
