"use client"

// deleteEvent will be used for delete functionality
// import { deleteEvent } from '@/lib/actions/dynamic-events'
import type { DynamicEventWithRelations, DynamicEventType } from '@/lib/types'
import { ModuleViewContainer } from '@/components/module-view-container'
import { Button } from '@/components/ui/button'
import { FormSectionCard } from '@/components/form-section-card'
import { Edit } from 'lucide-react'
import Link from 'next/link'
import { formatDatePretty } from '@/lib/utils/formatters'

interface DynamicEventViewClientProps {
  event: DynamicEventWithRelations
  eventType: DynamicEventType
}

export function DynamicEventViewClient({ event, eventType }: DynamicEventViewClientProps) {
  // Generate action buttons
  const actionButtons = (
    <>
      <Button asChild className="w-full">
        <Link href={`/events/${eventType.id}/${event.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit {eventType.name}
        </Link>
      </Button>
    </>
  )

  // For now, we'll display basic event information
  // Field values resolution and occasions will be added in future phases
  const details = (
    <>
      {event.updated_at !== event.created_at && (
        <div>
          <span className="font-medium">Last Updated:</span> {formatDatePretty(new Date(event.updated_at))}
        </div>
      )}
    </>
  )

  return (
    <ModuleViewContainer
      entity={event}
      entityType={eventType.name}
      modulePath={`events/${eventType.id}`}
      actionButtons={actionButtons}
      details={details}
    >
      {/* Field Values Section */}
      <FormSectionCard title="Details">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Field values will be displayed here once field resolution is implemented.
          </p>
          {/* TODO: Display resolved field values based on input field definitions */}
          {/* TODO: Map field types to appropriate display components */}
        </div>
      </FormSectionCard>

      {/* Occasions Section */}
      <FormSectionCard title="Occasions">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Occasions will be displayed here once the occasions table is integrated.
          </p>
          {/* TODO: Display occasions with date, time, location, and primary indicator */}
        </div>
      </FormSectionCard>

      {/* Scripts Section */}
      <FormSectionCard title="Scripts & Programs">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Scripts and export options will be available once the script system is integrated.
          </p>
          {/* TODO: List available scripts for this event type */}
          {/* TODO: Add preview and export buttons (PDF, Word, Print, Text) */}
        </div>
      </FormSectionCard>
    </ModuleViewContainer>
  )
}
