"use client"

import type { DynamicEventWithRelations, DynamicEventType, Script } from '@/lib/types'
import { ModuleViewContainer } from '@/components/module-view-container'
import { Button } from '@/components/ui/button'
import { ScriptCard } from '@/components/script-card'
import { Edit } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDatePretty } from '@/lib/utils/formatters'
import { deleteEvent } from '@/lib/actions/dynamic-events'

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

  return (
    <ModuleViewContainer
      entity={event}
      entityType={eventType.name}
      modulePath={`events/${eventType.slug}`}
      actionButtons={actionButtons}
      details={details}
      onDelete={deleteEvent}
    >
      {/* Script cards stacked vertically */}
      <div className="space-y-4">
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
