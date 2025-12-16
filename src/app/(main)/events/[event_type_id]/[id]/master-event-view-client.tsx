"use client"

import type { DynamicEventWithRelations, DynamicEventType, Script } from '@/lib/types'
import { ModuleViewContainer } from '@/components/module-view-container'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScriptCard } from '@/components/script-card'
import { Edit } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDatePretty } from '@/lib/utils/formatters'
import { deleteEvent } from '@/lib/actions/master-events'

interface DynamicEventViewClientProps {
  event: DynamicEventWithRelations
  eventType: DynamicEventType
  scripts: Script[]
  eventTypeSlug: string
}

export function DynamicEventViewClient({ event, eventType, scripts, eventTypeSlug }: DynamicEventViewClientProps) {
  const router = useRouter()

  // Generate action buttons (Edit only - Delete handled via onDelete prop)
  const actionButtons = (
    <Button asChild className="w-full">
      <Link href={`/events/${eventType.slug}/${event.id}/edit`}>
        <Edit className="h-4 w-4 mr-2" />
        Edit {eventType.name}
      </Link>
    </Button>
  )

  // Handle script card click
  const handleScriptClick = (scriptId: string) => {
    router.push(`/events/${eventTypeSlug}/${event.id}/scripts/${scriptId}`)
  }

  // Show last updated in details if different from created
  const details = (
    <>
      {event.updated_at !== event.created_at && (
        <div>
          <span className="font-medium">Last Updated:</span> {formatDatePretty(new Date(event.updated_at))}
        </div>
      )}
    </>
  )

  // Format time to 12-hour format with AM/PM
  const formatTime = (time: string | null) => {
    if (!time) return null
    try {
      // Parse HH:mm:ss format
      const [hours, minutes] = time.split(':').map(Number)
      const period = hours >= 12 ? 'PM' : 'AM'
      const displayHours = hours % 12 || 12
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
    } catch {
      return time
    }
  }

  // Sort calendar_events by created_at (no position field anymore)
  const sortedOccasions = [...(event.calendar_events || [])].sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  return (
    <ModuleViewContainer
      entity={event}
      entityType={eventType.name}
      modulePath={`events/${eventType.slug}`}
      actionButtons={actionButtons}
      details={details}
      onDelete={deleteEvent}
    >
      {/* Occasions Section */}
      {sortedOccasions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Occasions</h3>
          <div className="space-y-3">
            {sortedOccasions.map((occasion) => (
              <Card key={occasion.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">
                      {occasion.label}
                    </CardTitle>
                    {occasion.is_primary && (
                      <Badge variant="secondary" className="text-xs">
                        Primary
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {occasion.date && (
                    <div>
                      <span className="font-medium">Date:</span>{' '}
                      {formatDatePretty(occasion.date)}
                    </div>
                  )}
                  {occasion.time && (
                    <div>
                      <span className="font-medium">Time:</span>{' '}
                      {formatTime(occasion.time)}
                    </div>
                  )}
                  {occasion.location && (
                    <div>
                      <span className="font-medium">Location:</span>{' '}
                      {occasion.location.name}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Script cards stacked vertically */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Scripts</h3>
        {scripts.length > 0 ? (
          scripts.map((script) => (
            <ScriptCard
              key={script.id}
              script={script}
              onClick={() => handleScriptClick(script.id)}
            />
          ))
        ) : (
          <div className="text-sm text-muted-foreground">
            No scripts available for this event type.
          </div>
        )}
      </div>
    </ModuleViewContainer>
  )
}
