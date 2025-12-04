'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCheck, Trash2 } from 'lucide-react'
import { markNotificationRead, markAllNotificationsRead, deleteNotification } from './actions'
import type { Notification } from './actions'
import { useCsrfToken } from '@/components/csrf-token'

interface NotificationsViewProps {
  initialNotifications: Notification[]
  personId: string
}

const notificationTypeIcons: Record<string, string> = {
  ministry_message: '💬',
  schedule_update: '📅',
  reminder: '⏰',
  system: '🔔',
}

const notificationTypeLabels: Record<string, string> = {
  ministry_message: 'Ministry Message',
  schedule_update: 'Schedule Update',
  reminder: 'Reminder',
  system: 'System',
}

export function NotificationsView({ initialNotifications, personId }: NotificationsViewProps) {
  const csrfToken = useCsrfToken()
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkRead = async (notificationId: string) => {
    await markNotificationRead(notificationId, personId, csrfToken || undefined)
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
    )
  }

  const handleMarkAllRead = async () => {
    setIsMarkingAllRead(true)
    await markAllNotificationsRead(personId, csrfToken || undefined)
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        isRead: true,
        readAt: n.readAt || new Date().toISOString(),
      }))
    )
    setIsMarkingAllRead(false)
  }

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId, personId, csrfToken || undefined)
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-2">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllRead} disabled={isMarkingAllRead} variant="outline" size="sm">
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No notifications</p>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 transition-colors ${!notification.isRead ? 'border-primary bg-accent/50' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl">{notificationTypeIcons[notification.notificationType] || '🔔'}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground">{notification.senderName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!notification.isRead && <Badge variant="default">New</Badge>}
                      <Badge variant="secondary">{notificationTypeLabels[notification.notificationType]}</Badge>
                    </div>
                  </div>

                  <p className="text-sm mb-2">{notification.message}</p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatRelativeTime(notification.createdAt)}</span>
                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <Button onClick={() => handleMarkRead(notification.id)} variant="ghost" size="sm">
                          <CheckCheck className="h-4 w-4 mr-1" />
                          Mark Read
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDelete(notification.id)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
