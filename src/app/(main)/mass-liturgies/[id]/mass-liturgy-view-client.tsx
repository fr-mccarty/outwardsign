"use client"

import { useState } from 'react'
import type { MasterEventWithRelations } from '@/lib/types'
import type { MassIntentionWithNames } from '@/lib/actions/mass-intentions'
import { deleteEvent } from '@/lib/actions/master-events'
import { ModuleViewContainer } from '@/components/module-view-container'
import { Button } from '@/components/ui/button'
import { ContentCard } from '@/components/content-card'
import { Edit, Printer, FileText, FileDown, ChevronDown, ChevronRight, Clock, MapPin, Heart } from 'lucide-react'
import { ModuleStatusLabel } from '@/components/module-status-label'
import { ScriptCard } from '@/components/script-card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Script } from '@/lib/types'
import { formatDatePretty, formatTime } from '@/lib/utils/formatters'
import { CalendarEventAssignmentSection } from '@/components/calendar-event-assignment-section'

interface MassViewClientProps {
  mass: MasterEventWithRelations
  scripts: Script[]
  intentionsByCalendarEvent?: Record<string, MassIntentionWithNames[]>
}

export function MassLiturgyViewClient({ mass, scripts, intentionsByCalendarEvent = {} }: MassViewClientProps) {
  const router = useRouter()
  const [expandedCalendarEvents, setExpandedCalendarEvents] = useState<Set<string>>(new Set())

  // Toggle expanded state for a calendar event
  const toggleExpanded = (calendarEventId: string) => {
    setExpandedCalendarEvents(prev => {
      const next = new Set(prev)
      if (next.has(calendarEventId)) {
        next.delete(calendarEventId)
      } else {
        next.add(calendarEventId)
      }
      return next
    })
  }

  // Get primary calendar event for main event display
  const primaryCalendarEvent = mass.calendar_events?.find(ce => ce.show_on_calendar) || mass.calendar_events?.[0]

  // Extract presider and homilist from people_event_assignments
  const presider = mass.people_event_assignments?.find(
    a => a.field_definition?.property_name === 'presider'
  )?.person || null
  const homilist = mass.people_event_assignments?.find(
    a => a.field_definition?.property_name === 'homilist'
  )?.person || null

  // Get occurrence-level person field definitions (for minister assignments)
  const occurrenceLevelPersonFields = mass.event_type?.input_field_definitions?.filter(
    field => field.type === 'person' && field.is_per_calendar_event
  ) || []

  // Handle assignment change - refresh the page data
  const handleAssignmentChange = () => {
    router.refresh()
  }

  // Handle script card click
  const handleScriptClick = (scriptId: string) => {
    router.push(`/mass-liturgies/${mass.id}/scripts/${scriptId}`)
  }

  // Generate action buttons
  const actionButtons = (
    <Button asChild className="w-full">
      <Link href={`/mass-liturgies/${mass.id}/edit`}>
        <Edit className="h-4 w-4 mr-2" />
        Edit Mass
      </Link>
    </Button>
  )

  // Generate export buttons for roster
  const exportButtons = (
    <>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/print/mass-liturgies/${mass.id}/roster`} target="_blank">
          <Printer className="h-4 w-4 mr-2" />
          Print Roster
        </Link>
      </Button>
      <Button asChild variant="default" className="w-full">
        <Link href={`/api/mass-liturgies/${mass.id}/roster/pdf`} target="_blank">
          <FileText className="h-4 w-4 mr-2" />
          Download PDF Roster
        </Link>
      </Button>
      <Button asChild variant="default" className="w-full">
        <Link href={`/api/mass-liturgies/${mass.id}/roster/word`}>
          <FileDown className="h-4 w-4 mr-2" />
          Download Word Roster
        </Link>
      </Button>
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

      {/* Mass Times Section - Collapsible cards with intentions */}
      {mass.calendar_events && mass.calendar_events.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Mass Times</h3>
          <div className="space-y-3">
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

              const isExpanded = expandedCalendarEvents.has(calendarEvent.id)
              const timeString = calendarEvent.start_datetime
                ? formatTime(new Date(calendarEvent.start_datetime).toTimeString().slice(0, 8))
                : 'Time TBD'

              return (
                <Collapsible
                  key={calendarEvent.id}
                  open={isExpanded}
                  onOpenChange={() => toggleExpanded(calendarEvent.id)}
                >
                  <div className="border rounded-lg bg-card">
                    {/* Header - always visible */}
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div className="text-left">
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
                        </div>
                        <div className="flex items-center gap-2">
                          {eventAssignments.length > 0 && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {eventAssignments.length} assigned
                            </span>
                          )}
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    {/* Expandable content */}
                    <CollapsibleContent>
                      <div className="border-t p-4 space-y-4">
                        {/* Intentions */}
                        {intentions.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Mass Intentions</h4>
                            <div className="space-y-2">
                              {intentions.map((intention) => (
                                <div
                                  key={intention.id}
                                  className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded"
                                >
                                  <span>{intention.mass_offered_for || 'Unnamed intention'}</span>
                                  {intention.requested_by && (
                                    <span className="text-muted-foreground">
                                      Requested by {intention.requested_by.full_name}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                            <Link
                              href={`/mass-intentions?calendar_event=${calendarEvent.id}`}
                              className="text-sm text-primary hover:underline mt-2 inline-block"
                            >
                              Manage intentions →
                            </Link>
                          </div>
                        )}

                        {/* Minister Assignments */}
                        {occurrenceLevelPersonFields.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Minister Assignments</h4>
                            <CalendarEventAssignmentSection
                              masterEventId={mass.id}
                              calendarEventId={calendarEvent.id}
                              calendarEventDateTime={calendarEvent.start_datetime}
                              eventTypeId={mass.event_type_id!}
                              currentAssignments={eventAssignments}
                              fieldDefinitions={occurrenceLevelPersonFields}
                              onAssignmentChange={handleAssignmentChange}
                            />
                          </div>
                        )}

                        {/* Empty state */}
                        {intentions.length === 0 && occurrenceLevelPersonFields.length === 0 && (
                          <div className="text-sm text-muted-foreground">
                            No intentions or minister assignments for this mass time.
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )
            })}
          </div>
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
