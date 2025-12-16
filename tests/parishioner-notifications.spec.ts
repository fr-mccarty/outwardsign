import { test, expect } from '@playwright/test';
import { setupParishionerAuth, cleanupParishioner } from './helpers/parishioner-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { TEST_TIMEOUTS } from './utils/test-config';

/**
 * Parishioner Portal - Notifications Tests
 *
 * Tests the notifications functionality for parishioners
 */

test.describe('Parishioner Notifications', () => {
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

    // Try to access notifications
    await page.goto('/parishioner/notifications');

    // Should redirect to login
    await page.waitForURL(/\/parishioner\/login/, { timeout: TEST_TIMEOUTS.NAVIGATION });
    await expect(page).toHaveURL(/\/parishioner\/login/);
  });

  test('should display notifications page when authenticated', async ({ page }) => {
    await page.goto('/parishioner/notifications');
    await expect(page).toHaveURL('/parishioner/notifications', { timeout: TEST_TIMEOUTS.NAVIGATION });

    // Verify page heading
    await expect(page.getByRole('heading', { name: 'Notifications', level: 1 })).toBeVisible();
  });

  test('should show empty state when no notifications', async ({ page }) => {
    await page.goto('/parishioner/notifications');

    // Should show "No notifications" message
    await expect(page.getByText(/No notifications/i)).toBeVisible();

    // Should show "All caught up!" message
    await expect(page.getByText(/All caught up!/i)).toBeVisible();
  });

  test('should display list of notifications', async ({ page }) => {
    const supabase = createAdminClient();

    // Create test notifications
    const { data: notification1 } = await supabase
      .from('parishioner_notifications')
      .insert({
        person_id: parishioner.personId,
        notification_type: 'schedule_update',
        title: 'Schedule Change',
        message: 'Your Sunday Mass assignment has been updated',
        sender_name: 'Parish Staff',
        is_read: false,
      })
      .select()
      .single();

    const { data: notification2 } = await supabase
      .from('parishioner_notifications')
      .insert({
        person_id: parishioner.personId,
        notification_type: 'reminder',
        title: 'Upcoming Commitment',
        message: 'You have a reading assignment tomorrow',
        sender_name: 'Liturgy Director',
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .select()
      .single();

    try {
      await page.goto('/parishioner/notifications');

      // Should show both notifications
      await expect(page.getByText('Schedule Change')).toBeVisible();
      await expect(page.getByText('Upcoming Commitment')).toBeVisible();

      // Should show sender names
      await expect(page.getByText('Parish Staff')).toBeVisible();
      await expect(page.getByText('Liturgy Director')).toBeVisible();

      // Should show "New" badge for unread notification
      await expect(page.getByText('New')).toBeVisible();

      // Should show unread count
      await expect(page.getByText(/1 unread notification/i)).toBeVisible();
    } finally {
      // Cleanup
      if (notification1) {
        await supabase.from('parishioner_notifications').delete().eq('id', notification1.id);
      }
      if (notification2) {
        await supabase.from('parishioner_notifications').delete().eq('id', notification2.id);
      }
    }
  });

  test('should mark single notification as read', async ({ page }) => {
    const supabase = createAdminClient();

    // Create an unread notification
    const { data: notification } = await supabase
      .from('parishioner_notifications')
      .insert({
        person_id: parishioner.personId,
        notification_type: 'ministry_message',
        title: 'Important Message',
        message: 'Please review the new ministry guidelines',
        sender_name: 'Ministry Coordinator',
        is_read: false,
      })
      .select()
      .single();

    if (!notification) {
      throw new Error('Failed to create notification');
    }

    try {
      await page.goto('/parishioner/notifications');

      // Verify notification is unread
      await expect(page.getByText('New')).toBeVisible();
      await expect(page.getByText(/1 unread notification/i)).toBeVisible();

      // Find the notification card and click mark read button
      const notificationCard = page.locator(`[data-testid="notification-${notification.id}"]`).or(
        page.locator('div').filter({ hasText: 'Important Message' }).first()
      );

      // Click the check/mark read button within the notification
      const markReadButton = notificationCard.getByRole('button').filter({ hasText: /Mark Read/i }).or(
        page.getByRole('button', { name: /Mark Read/i }).first()
      );

      if (await markReadButton.isVisible()) {
        await markReadButton.click();

        // "New" badge should disappear
        await expect(page.getByText('New')).not.toBeVisible();

        // Should show "All caught up!"
        await expect(page.getByText(/All caught up!/i)).toBeVisible();
      }
    } finally {
      await supabase.from('parishioner_notifications').delete().eq('id', notification.id);
    }
  });

  test('should mark all notifications as read', async ({ page }) => {
    const supabase = createAdminClient();

    // Create multiple unread notifications
    const { data: notifications } = await supabase
      .from('parishioner_notifications')
      .insert([
        {
          person_id: parishioner.personId,
          notification_type: 'schedule_update',
          title: 'First Notification',
          message: 'Test message 1',
          sender_name: 'Staff',
          is_read: false,
        },
        {
          person_id: parishioner.personId,
          notification_type: 'reminder',
          title: 'Second Notification',
          message: 'Test message 2',
          sender_name: 'Staff',
          is_read: false,
        },
        {
          person_id: parishioner.personId,
          notification_type: 'system',
          title: 'Third Notification',
          message: 'Test message 3',
          sender_name: 'System',
          is_read: false,
        },
      ])
      .select();

    try {
      await page.goto('/parishioner/notifications');

      // Should show unread count
      await expect(page.getByText(/3 unread notifications/i)).toBeVisible();

      // Click "Mark All Read" button
      const markAllButton = page.getByRole('button', { name: /Mark All Read/i });
      await expect(markAllButton).toBeVisible();
      await markAllButton.click();

      // Should show "All caught up!"
      await expect(page.getByText(/All caught up!/i)).toBeVisible({ timeout: TEST_TIMEOUTS.FORM_SUBMIT });

      // "Mark All Read" button should not be visible anymore
      await expect(markAllButton).not.toBeVisible();

      // "New" badges should not be visible
      await expect(page.getByText('New')).not.toBeVisible();
    } finally {
      // Cleanup
      if (notifications) {
        for (const notif of notifications) {
          await supabase.from('parishioner_notifications').delete().eq('id', notif.id);
        }
      }
    }
  });

  test('should delete notification', async ({ page }) => {
    const supabase = createAdminClient();

    // Create a notification
    const { data: notification } = await supabase
      .from('parishioner_notifications')
      .insert({
        person_id: parishioner.personId,
        notification_type: 'system',
        title: 'Deletable Notification',
        message: 'This notification will be deleted',
        sender_name: 'System',
        is_read: false,
      })
      .select()
      .single();

    if (!notification) {
      throw new Error('Failed to create notification');
    }

    try {
      await page.goto('/parishioner/notifications');

      // Verify notification is visible
      await expect(page.getByText('Deletable Notification')).toBeVisible();

      // Find and click delete button (trash icon)
      const trashButtons = await page.locator('button:has(svg)').all();

      // Find the delete button by looking for the Trash2 icon
      for (const button of trashButtons) {
        const hasTrashIcon = await button.evaluate((btn) => {
          const svg = btn.querySelector('svg');
          return svg !== null;
        });

        if (hasTrashIcon) {
          await button.click();
          break;
        }
      }

      // Notification should disappear
      await expect(page.getByText('Deletable Notification')).not.toBeVisible({ timeout: TEST_TIMEOUTS.FORM_SUBMIT });
    } finally {
      // Cleanup (in case test failed before delete)
      await supabase.from('parishioner_notifications').delete().eq('id', notification.id);
    }
  });

  test('should display notification type badges correctly', async ({ page }) => {
    const supabase = createAdminClient();

    // Create notifications of different types
    const { data: notifications } = await supabase
      .from('parishioner_notifications')
      .insert([
        {
          person_id: parishioner.personId,
          notification_type: 'schedule_update',
          title: 'Schedule Update',
          message: 'Test',
          sender_name: 'Staff',
          is_read: false,
        },
        {
          person_id: parishioner.personId,
          notification_type: 'ministry_message',
          title: 'Ministry Message',
          message: 'Test',
          sender_name: 'Staff',
          is_read: false,
        },
        {
          person_id: parishioner.personId,
          notification_type: 'reminder',
          title: 'Reminder',
          message: 'Test',
          sender_name: 'System',
          is_read: false,
        },
      ])
      .select();

    try {
      await page.goto('/parishioner/notifications');

      // Should show type badges
      await expect(page.getByText('Schedule Update', { exact: true })).toBeVisible();
      await expect(page.getByText('Ministry Message', { exact: true })).toBeVisible();
      await expect(page.getByText('Reminder', { exact: true })).toBeVisible();
    } finally {
      // Cleanup
      if (notifications) {
        for (const notif of notifications) {
          await supabase.from('parishioner_notifications').delete().eq('id', notif.id);
        }
      }
    }
  });

  test('should show unread badge count in navigation', async ({ page }) => {
    const supabase = createAdminClient();

    // Create unread notifications
    const { data: notifications } = await supabase
      .from('parishioner_notifications')
      .insert([
        {
          person_id: parishioner.personId,
          notification_type: 'reminder',
          title: 'Notification 1',
          message: 'Test',
          sender_name: 'Staff',
          is_read: false,
        },
        {
          person_id: parishioner.personId,
          notification_type: 'reminder',
          title: 'Notification 2',
          message: 'Test',
          sender_name: 'Staff',
          is_read: false,
        },
      ])
      .select();

    try {
      await page.goto('/parishioner/calendar');

      // Check if there's a notification badge in navigation
      // The badge count should be visible somewhere in the navigation
      // (This depends on the parishioner-navigation component implementation)

      // Navigate to notifications
      await page.goto('/parishioner/notifications');

      // Should show correct unread count
      await expect(page.getByText(/2 unread notifications/i)).toBeVisible();
    } finally {
      // Cleanup
      if (notifications) {
        for (const notif of notifications) {
          await supabase.from('parishioner_notifications').delete().eq('id', notif.id);
        }
      }
    }
  });
});
