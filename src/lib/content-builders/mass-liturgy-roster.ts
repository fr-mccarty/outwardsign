/**
 * Mass Roster Content Builder
 *
 * Generates printable rosters showing ALL mass times for ONE liturgical day
 * with their role assignments
 */

import type { ParishEventWithRelations } from '@/lib/types'
import type { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatDatePretty, formatTime } from '@/lib/utils/formatters'

/**
 * Build mass roster document
 *
 * Creates a roster-style report listing all mass times for a liturgical day
 * with minister assignments for each mass.
 *
 * Example output:
 * FOURTH SUNDAY IN ADVENT
 * December 22, 2024
 *
 * 10:00 AM English Mass
 * Ministers:
 *   Presider: Fr. John Smith
 *   Lector 1: Jane Doe
 *   Lector 2: Bob Johnson
 *   Cantor: Mary Williams
 *
 * 12:00 PM Spanish Mass
 * Ministers:
 *   Presider: Fr. Miguel Rodriguez
 *   Lector 1: Maria Garcia
 *   Cantor: Luis Martinez
 */
export function buildMassRosterContent(mass: ParishEventWithRelations): LiturgyDocument {
  const sections: ContentSection[] = []

  // 1. COVER SECTION - Mass name and date
  const coverElements: ContentElement[] = []

  // Mass name as event title (use event type name or fallback)
  const massTitle = mass.event_type?.name || 'Mass Roster'
  coverElements.push({
    type: 'event-title',
    text: massTitle,
  })

  // Get date from first calendar event
  const primaryCalendarEvent = mass.calendar_events?.find(ce => ce.show_on_calendar) || mass.calendar_events?.[0]
  if (primaryCalendarEvent?.start_datetime) {
    coverElements.push({
      type: 'event-datetime',
      text: formatDatePretty(new Date(primaryCalendarEvent.start_datetime)),
    })
  }

  // Add spacing after cover
  coverElements.push({
    type: 'spacer',
    size: 'large',
  })

  sections.push({
    id: 'cover',
    elements: coverElements,
  })

  // 2. MASS TIMES & ASSIGNMENTS SECTIONS
  if (mass.calendar_events && mass.calendar_events.length > 0) {
    // Get occurrence-level person field definitions (for minister assignments)
    const occurrenceLevelPersonFields = mass.event_type?.input_field_definitions?.filter(
      field => field.type === 'person' && field.is_per_calendar_event
    ) || []

    mass.calendar_events.forEach((calendarEvent, index) => {
      const elements: ContentElement[] = []

      // Get the field definition for this calendar event (to show the mass time name)
      const calendarEventField = mass.event_type?.input_field_definitions?.find(
        field => field.id === calendarEvent.input_field_definition_id
      )

      // Mass time header (e.g., "10:00 AM English Mass")
      let massTimeLabel = calendarEventField?.name || 'Mass Time'
      if (calendarEvent.start_datetime) {
        const timeStr = formatTime(new Date(calendarEvent.start_datetime).toTimeString().slice(0, 8))
        massTimeLabel = `${timeStr} ${massTimeLabel}`
      }

      elements.push({
        type: 'section-title',
        text: massTimeLabel,
      })

      // Get assignments for this specific calendar event
      const eventAssignments = mass.people_event_assignments?.filter(
        a => a.calendar_event_id === calendarEvent.id
      ) || []

      if (eventAssignments.length > 0) {
        // "Ministers:" label
        elements.push({
          type: 'text',
          text: 'Ministers:',
        })

        // Add each assignment as an info row
        occurrenceLevelPersonFields.forEach((fieldDef) => {
          const assignment = eventAssignments.find(a => a.field_definition_id === fieldDef.id)
          if (assignment?.person) {
            elements.push({
              type: 'info-row',
              label: `  ${fieldDef.name}:`,
              value: assignment.person.full_name,
            })
          }
        })
      } else {
        elements.push({
          type: 'text',
          text: 'No ministers assigned',
        })
      }

      // Add spacing between mass times (but not after the last one)
      if (index < mass.calendar_events!.length - 1) {
        elements.push({
          type: 'spacer',
          size: 'large',
        })
      }

      sections.push({
        id: `mass-time-${calendarEvent.id}`,
        elements,
      })
    })
  } else {
    // No mass times defined
    const elements: ContentElement[] = []
    elements.push({
      type: 'text',
      text: 'No mass times defined for this liturgical day.',
    })
    sections.push({
      id: 'no-mass-times',
      elements,
    })
  }

  return {
    id: mass.id,
    type: 'mass',
    language: 'en',
    template: 'mass-roster',
    title: massTitle,
    subtitle: 'Minister Assignments',
    sections,
  }
}
