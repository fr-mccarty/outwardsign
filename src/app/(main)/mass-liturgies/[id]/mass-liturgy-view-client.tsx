"use client"

import { useState } from 'react'
import type { ParishEventWithRelations } from '@/lib/types'
import type { MassIntentionWithNames } from '@/lib/actions/mass-intentions'
import { deleteEvent } from '@/lib/actions/parish-events'
import { deleteCalendarEvent } from '@/lib/actions/calendar-events'
import { ModuleViewContainer } from '@/components/module-view-container'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/link-button'
import { ContentCard } from '@/components/content-card'
import { Edit, Printer, FileText, FileDown, Clock, MapPin, Heart, Plus, Settings, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { ModuleStatusLabel } from '@/components/module-status-label'
import { ScriptCard } from '@/components/script-card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Script } from '@/lib/types'
import { formatDatePretty, formatTime } from '@/lib/utils/formatters'
import { AddMassTimeDialog } from '@/components/add-mass-time-dialog'
import { LITURGICAL_COLOR_LABELS } from '@/lib/constants'
import { LiturgicalColorDot } from '@/components/liturgical-color-dot'

interface MassViewClientProps {
  mass: ParishEventWithRelations
  scripts: Script[]
  intentionsByCalendarEvent?: Record<string, MassIntentionWithNames[]>
}

export function MassLiturgyViewClient({ mass, scripts, intentionsByCalendarEvent = {} }: MassViewClientProps) {
  const router = useRouter()
  const [showAddMassTimeDialog, setShowAddMassTimeDialog] = useState(false)

  // Get primary calendar event for main event display
  const primaryCalendarEvent = mass.calendar_events?.find(ce => ce.show_on_calendar) || mass.calendar_events?.[0]

  // Extract presider and homilist from people_event_assignments
  const presider = mass.people_event_assignments?.find(
    a => a.field_definition?.property_name === 'presider'
  )?.person || null
  const homilist = mass.people_event_assignments?.find(
    a => a.field_definition?.property_name === 'homilist'
  )?.person || null

  // Get calendar_event type field definitions (for adding new mass times)
  const calendarEventFieldDefinitions = mass.event_type?.input_field_definitions?.filter(
    field => field.type === 'calendar_event'
  ) || []

  // Get occurrence-level person fields (ministry slots per calendar event)
  const occurrenceLevelPersonFields = mass.event_type?.input_field_definitions?.filter(
    field => field.type === 'person' && field.is_per_calendar_event
  ) || []
  const totalMinistrySlots = occurrenceLevelPersonFields.length

  // Handle assignment change - refresh the page data
  const handleAssignmentChange = () => {
    router.refresh()
  }

  // Handle delete mass time
  const handleDeleteMassTime = async (e: React.MouseEvent, calendarEventId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm('Are you sure you want to delete this mass time?')) {
      return
    }

    try {
      await deleteCalendarEvent(calendarEventId)
      toast.success('Mass time deleted')
      router.refresh()
    } catch (error) {
      if (error instanceof Error && error.message.includes('last calendar event')) {
        toast.error('Cannot delete the only mass time')
      } else {
        toast.error('Failed to delete mass time')
      }
    }
  }

  // Handle script card click
  const handleScriptClick = (scriptId: string) => {
    router.push(`/mass-liturgies/${mass.id}/scripts/${scriptId}`)
  }

  // Generate action buttons
  const actionButtons = (
    <LinkButton href={`/mass-liturgies/${mass.id}/edit`} className="w-full">
      <Edit className="h-4 w-4 mr-2" />
      Edit Mass
    </LinkButton>
  )

  // Settings URL for this event type
  const eventTypeSettingsUrl = mass.event_type?.slug
    ? `/settings/event-types/${mass.event_type.slug}`
    : null

  // Generate export buttons for roster
  const exportButtons = (
    <>
      <LinkButton href={`/print/mass-liturgies/${mass.id}/roster`} variant="outline" className="w-full" target="_blank">
        <Printer className="h-4 w-4 mr-2" />
        Print Roster
      </LinkButton>
      <LinkButton href={`/api/mass-liturgies/${mass.id}/roster/pdf`} variant="default" className="w-full" target="_blank">
        <FileText className="h-4 w-4 mr-2" />
        Download PDF Roster
      </LinkButton>
      <LinkButton href={`/api/mass-liturgies/${mass.id}/roster/word`} variant="default" className="w-full">
        <FileDown className="h-4 w-4 mr-2" />
        Download Word Roster
      </LinkButton>
      {eventTypeSettingsUrl && (
        <LinkButton href={eventTypeSettingsUrl} variant="outline" className="w-full">
          <Settings className="h-4 w-4 mr-2" />
          Configure Mass Type
        </LinkButton>
      )}
    </>
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

      {mass.liturgical_color && LITURGICAL_COLOR_LABELS[mass.liturgical_color] && (
        <div className="flex items-center gap-2 pt-2 border-t">
          <span className="font-medium">Liturgical Color:</span>
          <div className="flex items-center gap-1.5">
            <LiturgicalColorDot color={mass.liturgical_color} />
            <span>{LITURGICAL_COLOR_LABELS[mass.liturgical_color].en}</span>
          </div>
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
      exportButtons={exportButtons}
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

      {/* Mass Times Section - Clickable links to individual masses */}
      {mass.calendar_events && mass.calendar_events.length > 0 && (() => {
        // Calculate overall ministry fulfillment
        const calendarEventCount = mass.calendar_events?.length || 0
        const totalPositionsNeeded = totalMinistrySlots * calendarEventCount
        const totalFilled = mass.people_event_assignments?.filter(
          a => a.calendar_event_id && occurrenceLevelPersonFields.some(f => f.id === a.field_definition_id)
        ).length || 0

        return (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">Mass Times</h3>
              {totalMinistrySlots > 0 && totalPositionsNeeded > 0 && (
                <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                  totalFilled === totalPositionsNeeded
                    ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                    : totalFilled > 0
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <Users className="h-3 w-3" />
                  {totalFilled}/{totalPositionsNeeded} ministries filled
                </span>
              )}
            </div>
            {calendarEventFieldDefinitions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddMassTimeDialog(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Mass Time
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {mass.calendar_events.map((calendarEvent) => {
              // Get assignments for this specific calendar event
              const eventAssignments = mass.people_event_assignments?.filter(
                a => a.calendar_event_id === calendarEvent.id
              ) || []

              // Get the field definition for this calendar event (to show the mass time name)
              const calendarEventField = mass.event_type?.input_field_definitions?.find(
                field => field.id === calendarEvent.input_field_definition_id
              )

              // Get intentions for this calendar event
              const intentions = intentionsByCalendarEvent[calendarEvent.id] || []

              const timeString = calendarEvent.start_datetime
                ? formatTime(new Date(calendarEvent.start_datetime).toTimeString().slice(0, 8))
                : 'Time TBD'

              return (
                <Link
                  key={calendarEvent.id}
                  href={`/mass-liturgies/${mass.id}/masses/${calendarEvent.id}`}
                  className="block border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <div className="font-medium">
                        {calendarEventField?.name || 'Mass Time'}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeString}
                        </span>
                        {calendarEvent.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {calendarEvent.location.name}
                          </span>
                        )}
                        {intentions.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {intentions.length} intention{intentions.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {totalMinistrySlots > 0 && (
                        <span className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                          eventAssignments.length === totalMinistrySlots
                            ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                            : eventAssignments.length > 0
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          <Users className="h-3 w-3" />
                          {eventAssignments.length}/{totalMinistrySlots}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDeleteMassTime(e, calendarEvent.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete mass time</span>
                      </Button>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
        )
      })()}

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

      {/* Add Mass Time Dialog */}
      <AddMassTimeDialog
        open={showAddMassTimeDialog}
        onOpenChange={setShowAddMassTimeDialog}
        masterEventId={mass.id}
        calendarEventFieldDefinitions={calendarEventFieldDefinitions}
        onMassTimeAdded={handleAssignmentChange}
      />
    </ModuleViewContainer>
  )
}
