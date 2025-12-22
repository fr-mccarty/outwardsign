"use client"

import type { MasterEventWithRelations } from '@/lib/types'
import { deleteEvent } from '@/lib/actions/master-events'
import { ModuleViewContainer } from '@/components/module-view-container'
import { Button } from '@/components/ui/button'
import { ContentCard } from '@/components/content-card'
import { Edit } from 'lucide-react'
import { ModuleStatusLabel } from '@/components/module-status-label'
import { ScriptCard } from '@/components/script-card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Script } from '@/lib/types'
import { formatDatePretty, formatTime } from '@/lib/utils/formatters'

interface MassViewClientProps {
  mass: MasterEventWithRelations
  scripts: Script[]
}

export function MassViewClient({ mass, scripts }: MassViewClientProps) {
  const router = useRouter()

  // Get primary calendar event for main event display
  const primaryCalendarEvent = mass.calendar_events?.find(ce => ce.show_on_calendar) || mass.calendar_events?.[0]

  // Extract presider and homilist from people_event_assignments
  const presider = mass.people_event_assignments?.find(
    a => a.field_definition?.property_name === 'presider'
  )?.person || null
  const homilist = mass.people_event_assignments?.find(
    a => a.field_definition?.property_name === 'homilist'
  )?.person || null

  // Handle script card click
  const handleScriptClick = (scriptId: string) => {
    router.push(`/masses/${mass.id}/scripts/${scriptId}`)
  }

  // Generate action buttons
  const actionButtons = (
    <Button asChild className="w-full">
      <Link href={`/masses/${mass.id}/edit`}>
        <Edit className="h-4 w-4 mr-2" />
        Edit Mass
      </Link>
    </Button>
  )

  // Generate details section content
  const details = (
    <>
      {mass.status && (
        <div className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <ModuleStatusLabel status={mass.status} statusType="mass" />
        </div>
      )}

      {primaryCalendarEvent?.location && (
        <div className={mass.status ? "pt-2 border-t" : ""}>
          <span className="font-medium">Location:</span> {primaryCalendarEvent.location.name}
          {(primaryCalendarEvent.location.street || primaryCalendarEvent.location.city || primaryCalendarEvent.location.state) && (
            <div className="text-xs text-muted-foreground mt-1">
              {[primaryCalendarEvent.location.street, primaryCalendarEvent.location.city, primaryCalendarEvent.location.state]
                .filter(Boolean).join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Display resolved field values */}
      {mass.resolved_fields && Object.keys(mass.resolved_fields).length > 0 && (
        <div className="pt-2 border-t space-y-2">
          {Object.entries(mass.resolved_fields).map(([fieldName, fieldValue]) => {
            if (!fieldValue.resolved_value) return null

            let displayValue = ''
            if (typeof fieldValue.resolved_value === 'object' && 'full_name' in fieldValue.resolved_value) {
              displayValue = fieldValue.resolved_value.full_name
            } else if (typeof fieldValue.resolved_value === 'object' && 'name' in fieldValue.resolved_value) {
              displayValue = fieldValue.resolved_value.name
            } else {
              displayValue = String(fieldValue.resolved_value)
            }

            return (
              <div key={fieldName}>
                <span className="font-medium">{fieldName}:</span> {displayValue}
              </div>
            )
          })}
        </div>
      )}
    </>
  )

  return (
    <ModuleViewContainer
      entity={mass}
      entityType={mass.event_type?.name || "Mass"}
      modulePath="masses"
      statusType="mass"
      actionButtons={actionButtons}
      details={details}
      onDelete={deleteEvent}
    >
      {/* Mass Details Section */}
      {primaryCalendarEvent && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Mass Details</h3>
          <ContentCard title={mass.event_type?.name || 'Mass'}>
            <div className="space-y-2">
              {primaryCalendarEvent.start_datetime && (
                <div>
                  <span className="font-medium">Date & Time:</span>{' '}
                  {formatDatePretty(new Date(primaryCalendarEvent.start_datetime))} at {formatTime(new Date(primaryCalendarEvent.start_datetime).toTimeString().slice(0, 8))}
                </div>
              )}
              {primaryCalendarEvent.location && (
                <div>
                  <span className="font-medium">Location:</span>{' '}
                  {primaryCalendarEvent.location.name}
                </div>
              )}
              {presider && (
                <div>
                  <span className="font-medium">Presider:</span>{' '}
                  {presider.full_name}
                </div>
              )}
              {homilist && homilist.id !== presider?.id && (
                <div>
                  <span className="font-medium">Homilist:</span>{' '}
                  {homilist.full_name}
                </div>
              )}
            </div>
          </ContentCard>
        </div>
      )}

      {/* Show scripts from event type */}
      {mass.event_type_id && scripts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Scripts</h3>
          {scripts.map((script) => (
            <ScriptCard
              key={script.id}
              script={script}
              onClick={() => handleScriptClick(script.id)}
            />
          ))}
        </div>
      )}
    </ModuleViewContainer>
  )
}
