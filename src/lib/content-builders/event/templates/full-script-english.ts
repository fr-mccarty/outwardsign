/**
 * Event Full Script (English) Template
 *
 * Complete event details for printing and export
 */

import { EventWithRelations } from '@/lib/actions/events'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonWithPhone, formatLocationWithAddress } from '@/lib/utils/formatters'
import {
  getEventTypeLabel,
  formatEventDate,
  formatEventTime,
  formatEventDateTime,
  hasEndDateTime,
  formatEventEndDateTime,
} from '../helpers'

/**
 * Build event details section
 */
function buildEventDetailsSection(event: EventWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Event title and type
  elements.push({
    type: 'event-title',
    text: event.name,
  })

  // Display event type: prefer related_event_type (system-defined) over event_type entity (user-defined)
  const eventTypeLabel = event.related_event_type
    ? getEventTypeLabel(event.related_event_type, 'en')
    : event.event_type?.name || 'Event'
  elements.push({
    type: 'event-datetime',
    text: eventTypeLabel,
  })

  // Description
  if (event.description) {
    elements.push({
      type: 'section-title',
      text: 'Description',
    })
    elements.push({
      type: 'text',
      text: event.description,
    })
  }

  // Responsible Party
  if (event.responsible_party) {
    elements.push({
      type: 'section-title',
      text: 'Responsible Party',
    })
    elements.push({
      type: 'info-row',
      label: 'Contact:',
      value: formatPersonWithPhone(event.responsible_party),
    })
  }

  // Date and time details (only show section if there's at least one detail)
  if (event.start_date || hasEndDateTime(event) || event.location || (event.timezone && event.timezone !== 'UTC')) {
    elements.push({
      type: 'section-title',
      text: 'Event Details',
    })

    if (event.start_date) {
      const dateValue = formatEventDate(event.start_date, 'en')
      const timeValue = formatEventTime(event.start_time)

      if (timeValue) {
        elements.push({
          type: 'info-row',
          label: 'Start Date & Time:',
          value: `${dateValue} at ${timeValue}`,
        })
      } else {
        elements.push({
          type: 'info-row',
          label: 'Start Date:',
          value: dateValue,
        })
      }
    }

    if (hasEndDateTime(event)) {
      const endDateTime = formatEventEndDateTime(event, 'en')
      if (endDateTime) {
        elements.push({
          type: 'info-row',
          label: 'End Date & Time:',
          value: endDateTime,
        })
      }
    }

    if (event.location) {
      elements.push({
        type: 'info-row',
        label: 'Location:',
        value: formatLocationWithAddress(event.location),
      })
    }

    if (event.timezone && event.timezone !== 'UTC') {
      elements.push({
        type: 'info-row',
        label: 'Timezone:',
        value: event.timezone,
      })
    }
  }

  // Notes
  if (event.note) {
    elements.push({
      type: 'section-title',
      text: 'Notes',
    })
    elements.push({
      type: 'text',
      text: event.note,
    })
  }

  return {
    id: 'event-details',
    elements,
  }
}

/**
 * Build full event script (English)
 */
export function buildFullScriptEnglish(event: EventWithRelations): LiturgyDocument {
  const eventTitle = event.name
  const eventSubtitle = formatEventDateTime(event, 'en')

  const sections: ContentSection[] = []

  // Add event details section
  sections.push(buildEventDetailsSection(event))

  return {
    id: event.id,
    type: 'event',
    language: 'en',
    template: 'event-full-script-english',
    title: eventTitle,
    subtitle: eventSubtitle,
    sections,
  }
}
