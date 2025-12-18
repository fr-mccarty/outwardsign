"use client"

import type { MasterEventWithRelations, EventTypeWithRelations, Script } from '@/lib/types'
import { ModuleViewContainer } from '@/components/module-view-container'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ScriptCard } from '@/components/script-card'
import { Edit } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDatePretty, formatTime } from '@/lib/utils/formatters'
import { deleteEvent } from '@/lib/actions/master-events'

interface MasterEventViewClientProps {
  event: MasterEventWithRelations
  eventType: EventTypeWithRelations
  scripts: Script[]
  eventTypeSlug: string
}

export function DynamicEventViewClient({ event, eventType, scripts, eventTypeSlug }: MasterEventViewClientProps) {
  const router = useRouter()

  // Create lookup map for input field definitions by ID (for calendar event labels)
  const fieldDefinitionMap = new Map(
    (eventType.input_field_definitions || []).map(field => [field.id, field])
  )

  // Helper to get field label from input_field_definition_id
  const getFieldLabel = (inputFieldDefinitionId: string): string => {
    const field = fieldDefinitionMap.get(inputFieldDefinitionId)
    return field?.name || 'Calendar Event'
  }

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

  // Sort calendar_events by start_datetime
  const sortedCalendarEvents = [...(event.calendar_events || [])].sort((a, b) =>
    new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
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
      {/* Calendar Events Section */}
      {sortedCalendarEvents.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Calendar Events</h3>
          <div className="space-y-3">
            {sortedCalendarEvents.map((calendarEvent) => (
              <Card key={calendarEvent.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">
                      {getFieldLabel(calendarEvent.input_field_definition_id)}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {calendarEvent.start_datetime && (
                    <div>
                      <span className="font-medium">Date & Time:</span>{' '}
                      {formatDatePretty(new Date(calendarEvent.start_datetime))} at {formatTime(new Date(calendarEvent.start_datetime).toTimeString().slice(0, 8))}
                    </div>
                  )}
                  {calendarEvent.location && (
                    <div>
                      <span className="font-medium">Location:</span>{' '}
                      {calendarEvent.location.name}
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
