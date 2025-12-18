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
      // Extract date and time from primary_calendar_event's start_datetime
      const startDatetime = mass.primary_calendar_event?.start_datetime
      const date = startDatetime ? startDatetime.split('T')[0] : ''
      const time = startDatetime ? startDatetime.split('T')[1]?.substring(0, 5) || '' : ''
      const name = mass.primary_calendar_event?.location?.name || 'Location not set'
      const presider = mass.presider?.full_name || 'Presider not assigned'

      allEvents.push({
        date,
        time,
        sortKey: `${date} ${time}`,
        type: 'Masses',
        text: `${formatDatePretty(date)} ${formatTime(time)} — ${name} — ${presider}`,
      })
    })
  }

  // TODO: Add dynamic events (sacraments) when integrated
  // Sacraments have been migrated to a dynamic events system
  // This template will be updated to pull from dynamic events

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

  // Build sections in order
  const typeOrder = ['Masses']

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
