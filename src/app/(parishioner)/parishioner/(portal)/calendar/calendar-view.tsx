'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin } from 'lucide-react'
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
  // Group events by month
  const eventsByMonth = events.reduce((acc, event) => {
    const month = new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    if (!acc[month]) {
      acc[month] = []
    }
    acc[month].push(event)
    return acc
  }, {} as Record<string, CalendarEvent[]>)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-muted-foreground mt-2">Your ministry schedule and parish events</p>
      </div>

      {/* TODO: Add month calendar view */}
      {/* For MVP, showing agenda list only */}

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
                  <Card key={event.id} className="p-4 hover:bg-accent transition-colors">
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
    </div>
  )
}
