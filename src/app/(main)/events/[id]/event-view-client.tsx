'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, User, ExternalLink } from "lucide-react"
import { EVENT_TYPE_LABELS, MODULE_STATUS_LABELS } from "@/lib/constants"
import type { EventWithRelations } from '@/lib/actions/events'
import type { ModuleReference } from '@/lib/helpers/event-helpers'
import Link from 'next/link'
import { LanguageLabel } from '@/components/language-label'

interface EventViewClientProps {
  event: EventWithRelations
  moduleReference: ModuleReference | null
}

export function EventViewClient({ event, moduleReference }: EventViewClientProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return null
    return timeString
  }

  const isUpcoming = event.start_date && new Date(event.start_date) >= new Date()

  return (
    <div className="space-y-6">
      {/* Title and badges */}
      <div>
        <h1 className="text-3xl font-bold">{event.name}</h1>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Badge variant="outline">
            {EVENT_TYPE_LABELS[event.event_type]?.en || event.event_type}
          </Badge>
          {event.language && (
            <LanguageLabel language={event.language} />
          )}
          {isUpcoming && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              Upcoming
            </Badge>
          )}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(event.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Module Reference Section - NEW FEATURE */}
      {moduleReference && (
        <Card className="border-primary/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Related {moduleReference.moduleDisplay.en}</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={moduleReference.modulePath}>
                  View {moduleReference.moduleDisplay.en}
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h4 className="font-medium">{moduleReference.summary.title}</h4>
              {moduleReference.summary.status && (
                <Badge variant="outline">
                  {MODULE_STATUS_LABELS[moduleReference.summary.status]?.en || moduleReference.summary.status}
                </Badge>
              )}
              <ul className="text-sm text-muted-foreground space-y-1">
                {moduleReference.summary.details.map((detail, index) => (
                  <li key={index}>• {detail}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {event.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {event.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {event.start_date && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </h4>
                <p className="text-sm">
                  {formatDate(event.start_date)}
                  {event.start_time && ` at ${formatTime(event.start_time)}`}
                </p>
              </div>
            )}
            {event.end_date && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  End Date
                </h4>
                <p className="text-sm">
                  {formatDate(event.end_date)}
                  {event.end_time && ` at ${formatTime(event.end_time)}`}
                </p>
              </div>
            )}
            {event.location && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </h4>
                <p className="text-sm">
                  {event.location.name}
                </p>
                {(event.location.street || event.location.city || event.location.state) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {[event.location.street, event.location.city, event.location.state]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {event.note && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">
              {event.note}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Event Information */}
      <Card>
        <CardHeader>
          <CardTitle>Event Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                Created At
              </h4>
              <p className="text-sm">
                {new Date(event.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-1">
                Last Updated
              </h4>
              <p className="text-sm">
                {new Date(event.updated_at).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
