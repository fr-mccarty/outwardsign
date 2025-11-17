/**
 * Event Full Script (Spanish) Template
 *
 * Complete event details for printing and export (Spanish)
 */

import { EventWithRelations } from '@/lib/actions/events'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import {
  getEventTypeLabel,
  formatLocationText,
  formatLocationAddress,
  formatEventDate,
  formatEventTime,
  formatEventDateTime,
  hasEndDateTime,
  formatEventEndDateTime,
} from '../helpers'

/**
 * Build event details section (Spanish)
 */
function buildEventDetailsSection(event: EventWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Event title and type
  elements.push({
    type: 'event-title',
    text: event.name,
  })

  const eventTypeLabel = getEventTypeLabel(event.event_type, 'es')
  elements.push({
    type: 'event-datetime',
    text: eventTypeLabel,
  })

  // Description
  if (event.description) {
    elements.push({
      type: 'section-title',
      text: 'Descripción',
    })
    elements.push({
      type: 'text',
      text: event.description,
    })
  }

  // Date and time details (only show section if there's at least one detail)
  if (event.start_date || hasEndDateTime(event) || event.location || (event.timezone && event.timezone !== 'UTC')) {
    elements.push({
      type: 'section-title',
      text: 'Detalles del Evento',
    })

    if (event.start_date) {
      const dateValue = formatEventDate(event.start_date, 'es')
      const timeValue = formatEventTime(event.start_time)

      if (timeValue) {
        elements.push({
          type: 'info-row',
          label: 'Fecha y Hora de Inicio:',
          value: `${dateValue} a las ${timeValue}`,
        })
      } else {
        elements.push({
          type: 'info-row',
          label: 'Fecha de Inicio:',
          value: dateValue,
        })
      }
    }

    if (hasEndDateTime(event)) {
      const endDateTime = formatEventEndDateTime(event, 'es')
      if (endDateTime) {
        elements.push({
          type: 'info-row',
          label: 'Fecha y Hora de Finalización:',
          value: endDateTime,
        })
      }
    }

    if (event.location) {
      elements.push({
        type: 'info-row',
        label: 'Ubicación:',
        value: formatLocationText(event.location),
      })
    }

    if (event.timezone && event.timezone !== 'UTC') {
      elements.push({
        type: 'info-row',
        label: 'Zona Horaria:',
        value: event.timezone,
      })
    }
  }

  // Notes
  if (event.note) {
    elements.push({
      type: 'section-title',
      text: 'Notas',
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
 * Build full event script (Spanish)
 */
export function buildFullScriptSpanish(event: EventWithRelations): LiturgyDocument {
  const eventTitle = event.name
  const eventSubtitle = formatEventDateTime(event, 'es')

  const sections: ContentSection[] = []

  // Add event details section
  sections.push(buildEventDetailsSection(event))

  return {
    id: event.id,
    type: 'event',
    language: 'es',
    template: 'event-full-script-spanish',
    title: eventTitle,
    subtitle: eventSubtitle,
    sections,
  }
}
