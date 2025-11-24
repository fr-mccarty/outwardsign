/**
 * Weekend Summary Template (English)
 *
 * Generates a comprehensive summary of all weekend parish activities
 */

import { WeekendSummaryData, WeekendSummaryParams } from '@/lib/actions/weekend-summary'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatDatePretty, formatTime } from '@/lib/utils/formatters'

// Helper type for sortable events
interface SortableEvent {
  date: string
  time: string
  sortKey: string
  type: string
  text: string
}

export function buildSummaryEnglish(
  data: WeekendSummaryData,
  params: WeekendSummaryParams
): LiturgyDocument {
  const sections: ContentSection[] = []
  const elements: ContentElement[] = []
  const allEvents: SortableEvent[] = []

  // Collect Masses
  if (params.includeMasses && data.masses.length > 0) {
    data.masses.forEach(mass => {
      const date = mass.event?.start_date || ''
      const time = mass.event?.start_time || ''
      const name = mass.event?.location?.name || 'Unknown Location'
      const presider = mass.presider?.full_name || 'TBD'

      allEvents.push({
        date,
        time,
        sortKey: `${date} ${time}`,
        type: 'Masses',
        text: `${formatDatePretty(date)} ${formatTime(time)} — ${name} — ${presider}`,
      })
    })
  }

  // Collect Weddings
  if (params.includeSacraments && data.weddings.length > 0) {
    data.weddings.forEach(wedding => {
      const bride = wedding.bride?.full_name || 'Unknown'
      const groom = wedding.groom?.full_name || 'Unknown'
      const date = wedding.wedding_event?.start_date || ''
      const time = wedding.wedding_event?.start_time || ''
      const name = `${bride} & ${groom}`
      const presider = wedding.presider?.full_name || 'TBD'

      allEvents.push({
        date,
        time,
        sortKey: `${date} ${time}`,
        type: 'Weddings',
        text: `${formatDatePretty(date)} ${formatTime(time)} — ${name} — ${presider}`,
      })
    })
  }

  // Collect Baptisms
  if (params.includeSacraments && data.baptisms.length > 0) {
    data.baptisms.forEach(baptism => {
      const date = baptism.baptism_event?.start_date || ''
      const time = baptism.baptism_event?.start_time || ''
      const name = baptism.child?.full_name || 'Unknown'
      const presider = baptism.presider?.full_name || 'TBD'

      allEvents.push({
        date,
        time,
        sortKey: `${date} ${time}`,
        type: 'Baptisms',
        text: `${formatDatePretty(date)} ${formatTime(time)} — ${name} — ${presider}`,
      })
    })
  }

  // Collect Funerals
  if (params.includeSacraments && data.funerals.length > 0) {
    data.funerals.forEach(funeral => {
      const date = funeral.funeral_event?.start_date || ''
      const time = funeral.funeral_event?.start_time || ''
      const name = funeral.deceased?.full_name || 'Unknown'
      const presider = funeral.presider?.full_name || 'TBD'

      allEvents.push({
        date,
        time,
        sortKey: `${date} ${time}`,
        type: 'Funerals',
        text: `${formatDatePretty(date)} ${formatTime(time)} — ${name} — ${presider}`,
      })
    })
  }

  // Collect Presentations
  if (params.includeSacraments && data.presentations.length > 0) {
    data.presentations.forEach(presentation => {
      const date = presentation.presentation_event?.start_date || ''
      const time = presentation.presentation_event?.start_time || ''
      const name = presentation.child?.full_name || 'Unknown'
      const presider = presentation.presider?.full_name || 'TBD'

      allEvents.push({
        date,
        time,
        sortKey: `${date} ${time}`,
        type: 'Presentations',
        text: `${formatDatePretty(date)} ${formatTime(time)} — ${name} — ${presider}`,
      })
    })
  }

  // Collect Quinceañeras
  if (params.includeSacraments && data.quinceaneras.length > 0) {
    data.quinceaneras.forEach(quince => {
      const date = quince.quinceanera_event?.start_date || ''
      const time = quince.quinceanera_event?.start_time || ''
      const name = quince.quinceanera?.full_name || 'Unknown'
      const presider = quince.presider?.full_name || 'TBD'

      allEvents.push({
        date,
        time,
        sortKey: `${date} ${time}`,
        type: 'Quinceañeras',
        text: `${formatDatePretty(date)} ${formatTime(time)} — ${name} — ${presider}`,
      })
    })
  }

  // Sort all events by date and time
  allEvents.sort((a, b) => a.sortKey.localeCompare(b.sortKey))

  // Group by type and build sections
  const eventsByType: Record<string, SortableEvent[]> = {}
  allEvents.forEach(event => {
    if (!eventsByType[event.type]) {
      eventsByType[event.type] = []
    }
    eventsByType[event.type].push(event)
  })

  // Build sections in order: Masses, Weddings, Baptisms, Funerals, Presentations, Quinceañeras
  const typeOrder = ['Masses', 'Weddings', 'Baptisms', 'Funerals', 'Presentations', 'Quinceañeras']

  typeOrder.forEach(type => {
    if (eventsByType[type] && eventsByType[type].length > 0) {
      elements.push({
        type: 'section-title',
        text: type,
      })

      eventsByType[type].forEach(event => {
        elements.push({
          type: 'text',
          text: event.text,
        })
      })

      elements.push({ type: 'spacer', size: 'medium' })
    }
  })

  // Empty state
  if (elements.length === 0) {
    elements.push({
      type: 'section-title',
      text: 'No Activities',
    })
    elements.push({
      type: 'text',
      text: 'No activities scheduled for this weekend.',
    })
  }

  // Build single section with all content (no page break since this is the only section)
  sections.push({
    id: 'summary',
    elements,
  })

  return {
    id: `weekend-summary-${data.sundayDate}`,
    type: 'event',
    language: 'en',
    template: 'weekend-summary-english',
    title: 'Weekend Summary',
    subtitle: `${formatDatePretty(data.saturdayDate)} - ${formatDatePretty(data.sundayDate)}`,
    sections,
  }
}
