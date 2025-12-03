'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Calendar, Clock, MapPin, AlertCircle, X } from 'lucide-react'
import { CommitmentDetail } from './commitment-detail'
import { MonthCalendar } from './month-calendar'
import type { CalendarEvent } from './actions'

interface CalendarViewProps {
  events: CalendarEvent[]
}

const eventTypeColors = {
  parish: 'bg-blue-500',
  liturgical: 'bg-purple-500',
  assignment: 'bg-orange-500',
  blackout: 'bg-red-500',
}

const eventTypeLabels = {
  parish: 'Parish Event',
  liturgical: 'Liturgical',
  assignment: 'Assignment',
  blackout: 'Unavailable',
}

export function CalendarView({ events }: CalendarViewProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  // Find upcoming commitments (< 48 hours away)
  const now = new Date()
  const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000)

  const upcomingCommitments = events.filter((event) => {
    if (event.type !== 'assignment') return false
    const eventDate = new Date(event.date + (event.time ? ` ${event.time}` : ''))
    return eventDate > now && eventDate <= fortyEightHoursFromNow && !dismissedAlerts.has(event.id)
  })

  // Group events by month
  const eventsByMonth = events.reduce((acc, event) => {
    const month = new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    if (!acc[month]) {
      acc[month] = []
    }
    acc[month].push(event)
    return acc
  }, {} as Record<string, CalendarEvent[]>)

  const handleDismissAlert = (eventId: string) => {
    setDismissedAlerts((prev) => new Set(prev).add(eventId))
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setDetailOpen(true)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground mt-2">Your ministry schedule and parish events</p>
      </div>

      {/* Alert banners for upcoming commitments */}
      {upcomingCommitments.length > 0 && (
        <div className="space-y-3">
          {upcomingCommitments.map((event) => (
            <Alert key={event.id} className="border-orange-500 bg-orange-50 dark:bg-orange-950">
              <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <AlertTitle className="text-orange-900 dark:text-orange-100">
                Upcoming Commitment
              </AlertTitle>
              <AlertDescription className="text-orange-800 dark:text-orange-200">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm">
                      {new Date(event.date + (event.time ? ` ${event.time}` : '')).toLocaleDateString(
                        'en-US',
                        {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          hour: event.time ? 'numeric' : undefined,
                          minute: event.time ? '2-digit' : undefined,
                        }
                      )}
                    </p>
                    {event.location && <p className="text-sm">{event.location}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismissAlert(event.id)}
                    className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Month calendar view */}
      <MonthCalendar events={events} />

      {/* Agenda list */}
      <div className="space-y-6">
        {Object.entries(eventsByMonth).length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No upcoming events</p>
          </Card>
        ) : (
          Object.entries(eventsByMonth).map(([month, monthEvents]) => (
            <div key={month}>
              <h2 className="text-xl font-semibold mb-4">{month}</h2>
              <div className="space-y-3">
                {monthEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="p-4 hover:bg-accent transition-colors cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-1 h-full rounded-full ${eventTypeColors[event.type]}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          <Badge variant="secondary" className="whitespace-nowrap">
                            {eventTypeLabels[event.type]}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(event.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>

                          {event.time && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{event.time}</span>
                            </div>
                          )}

                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          )}

                          {event.role && (
                            <div className="font-medium text-foreground">Role: {event.role}</div>
                          )}

                          {event.description && (
                            <p className="text-muted-foreground">{event.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Commitment detail modal */}
      <CommitmentDetail
        event={selectedEvent}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  )
}
