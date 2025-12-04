'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getParishionerSession } from '@/lib/parishioner-auth/actions'

export interface Notification {
  id: string
  notificationType: string
  title: string
  message: string
  senderName: string
  isRead: boolean
  readAt: string | null
  createdAt: string
}

/**
 * Fetch notifications for person (paginated)
 */
export async function getNotifications(
  personId: string,
  limit: number,
  offset: number
): Promise<Notification[]> {
  // Verify session
  const session = await getParishionerSession()
  if (!session || session.personId !== personId) {
    console.error('Unauthorized access attempt to notifications')
    return []
  }

  const supabase = createAdminClient()

  try {
    const { data, error } = await supabase
      .from('parishioner_notifications')
      .select('*')
      .eq('person_id', personId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching notifications:', error)
      return []
    }

    return (
      data?.map((n) => ({
        id: n.id,
        notificationType: n.notification_type,
        title: n.title,
        message: n.message,
        senderName: n.sender_name,
        isRead: n.is_read,
        readAt: n.read_at,
        createdAt: n.created_at,
      })) || []
    )
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string, personId: string): Promise<void> {
  // Verify session
  const session = await getParishionerSession()
  if (!session || session.personId !== personId) {
    console.error('Unauthorized access attempt to mark notification read')
    return
  }

  const supabase = createAdminClient()

  try {
    // Extra security: verify the notification belongs to this person
    await supabase
      .from('parishioner_notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId)
      .eq('person_id', personId)
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

/**
 * Mark all notifications as read for person
 */
export async function markAllNotificationsRead(personId: string): Promise<void> {
  // Verify session
  const session = await getParishionerSession()
  if (!session || session.personId !== personId) {
    console.error('Unauthorized access attempt to mark all notifications read')
    return
  }

  const supabase = createAdminClient()

  try {
    await supabase
      .from('parishioner_notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('person_id', personId)
      .eq('is_read', false)
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string, personId: string): Promise<void> {
  // Verify session
  const session = await getParishionerSession()
  if (!session || session.personId !== personId) {
    console.error('Unauthorized access attempt to delete notification')
    return
  }

  const supabase = createAdminClient()

  try {
    // Extra security: verify the notification belongs to this person
    await supabase
      .from('parishioner_notifications')
      .delete()
      .eq('id', notificationId)
      .eq('person_id', personId)
  } catch (error) {
    console.error('Error deleting notification:', error)
  }
}

/**
 * Get unread notification count for person
 */
export async function getUnreadNotificationCount(personId: string): Promise<number> {
  // Verify session
  const session = await getParishionerSession()
  if (!session || session.personId !== personId) {
    console.error('Unauthorized access attempt to get unread count')
    return 0
  }

  const supabase = createAdminClient()

  try {
    const { count, error } = await supabase
      .from('parishioner_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('person_id', personId)
      .eq('is_read', false)

    if (error) {
      console.error('Error fetching unread count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return 0
  }
}
