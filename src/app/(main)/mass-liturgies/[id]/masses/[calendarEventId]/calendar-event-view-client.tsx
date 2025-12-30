"use client"

import { useRouter } from 'next/navigation'
import type { ParishEventWithRelations, CalendarEvent, InputFieldDefinition } from '@/lib/types'
import type { MassIntentionWithNames } from '@/lib/actions/mass-intentions'
import type { PeopleEventAssignmentWithPerson } from '@/lib/actions/people-event-assignments'
import { Button } from '@/components/ui/button'
import { ContentCard } from '@/components/content-card'
import { ModuleViewPanel } from '@/components/module-view-panel'
import { ArrowLeft, Clock, MapPin, Calendar, Heart, Edit, Palette } from 'lucide-react'
import Link from 'next/link'
import { formatDatePretty, formatTime } from '@/lib/utils/formatters'
import { CalendarEventAssignmentSection } from '@/components/calendar-event-assignment-section'
import { LITURGICAL_COLOR_LABELS } from '@/lib/constants'
import { LiturgicalColorDot } from '@/components/liturgical-color-dot'
import { PAGE_SECTIONS_SPACING } from '@/lib/constants/form-spacing'

interface CalendarEventViewClientProps {
  massLiturgy: ParishEventWithRelations
  calendarEvent: CalendarEvent
  intentions: MassIntentionWithNames[]
  assignments: PeopleEventAssignmentWithPerson[]
  occurrenceLevelPersonFields: InputFieldDefinition[]
}

export function CalendarEventViewClient({
  massLiturgy,
  calendarEvent,
  intentions,
  assignments,
  occurrenceLevelPersonFields
}: CalendarEventViewClientProps) {
  const router = useRouter()

  const handleAssignmentChange = () => {
    router.refresh()
  }

  const dateStr = calendarEvent.start_datetime
    ? formatDatePretty(new Date(calendarEvent.start_datetime))
    : 'Date TBD'
  const timeStr = calendarEvent.start_datetime
    ? formatTime(new Date(calendarEvent.start_datetime).toTimeString().slice(0, 8))
    : 'Time TBD'

  // Action buttons for side panel
  const actionButtons = (
    <>
      <Button asChild className="w-full">
        <Link href={`/mass-liturgies/${massLiturgy.id}/edit`}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Mass Liturgy
        </Link>
      </Button>
      <Button variant="outline" asChild className="w-full">
        <Link href={`/mass-liturgies/${massLiturgy.id}`}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Liturgy
        </Link>
      </Button>
    </>
  )

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Side Panel */}
      <ModuleViewPanel
        entity={{ id: calendarEvent.id, created_at: calendarEvent.created_at }}
        entityType="Mass"
        modulePath={`mass-liturgies/${massLiturgy.id}/masses`}
        actionButtons={actionButtons}
      />

      {/* Main Content */}
      <div className={`flex-1 order-2 md:order-1 ${PAGE_SECTIONS_SPACING}`}>
        {/* Mass Details */}
        <ContentCard title="Mass Details">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Date:</span>
              <span>{dateStr}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Time:</span>
              <span>{timeStr}</span>
            </div>
            {calendarEvent.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Location:</span>
                <span>{calendarEvent.location.name}</span>
              </div>
            )}
            {massLiturgy.liturgical_color && LITURGICAL_COLOR_LABELS[massLiturgy.liturgical_color] && (
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Liturgical Color:</span>
                <div className="flex items-center gap-1.5">
                  <LiturgicalColorDot color={massLiturgy.liturgical_color} />
                  <span>{LITURGICAL_COLOR_LABELS[massLiturgy.liturgical_color].en}</span>
                </div>
              </div>
            )}
            {calendarEvent.is_cancelled && (
              <div className="text-destructive font-medium">
                This mass has been cancelled
              </div>
            )}
          </div>
        </ContentCard>

        {/* Mass Intentions */}
        <ContentCard title="Mass Intentions">
          {intentions.length > 0 ? (
            <div className="space-y-2">
              {intentions.map((intention) => (
                <div
                  key={intention.id}
                  className="flex items-center gap-2 p-2 bg-muted/50 rounded"
                >
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span>{intention.mass_offered_for || 'Unnamed intention'}</span>
                  {intention.requested_by && (
                    <span className="text-sm text-muted-foreground ml-auto">
                      Requested by {intention.requested_by.full_name}
                    </span>
                  )}
                </div>
              ))}
              <Link
                href={`/mass-intentions?calendar_event=${calendarEvent.id}`}
                className="text-sm text-primary hover:underline mt-2 inline-block"
              >
                Manage intentions
              </Link>
            </div>
          ) : (
            <div className="text-muted-foreground text-center py-4">
              No mass intentions for this mass.
              <div className="mt-2">
                <Link
                  href={`/mass-intentions?calendar_event=${calendarEvent.id}`}
                  className="text-sm text-primary hover:underline"
                >
                  Add intention
                </Link>
              </div>
            </div>
          )}
        </ContentCard>

        {/* Minister Assignments */}
        {occurrenceLevelPersonFields.length > 0 && (
          <ContentCard title="Minister Assignments">
            <CalendarEventAssignmentSection
              masterEventId={massLiturgy.id}
              calendarEventId={calendarEvent.id}
              calendarEventDateTime={calendarEvent.start_datetime}
              eventTypeId={massLiturgy.event_type_id!}
              currentAssignments={assignments}
              fieldDefinitions={occurrenceLevelPersonFields}
              onAssignmentChange={handleAssignmentChange}
            />
          </ContentCard>
        )}
      </div>
    </div>
  )
}
