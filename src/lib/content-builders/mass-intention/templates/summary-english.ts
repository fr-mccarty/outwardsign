/**
 * Mass Intention Summary Template (English)
 *
 * Simple summary of mass intention details in English
 */

import { MassIntentionWithRelations } from '@/lib/actions/mass-intentions'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName } from '@/lib/utils/formatters'

/**
 * Build summary section for mass intention (English)
 */
function buildSummarySectionEnglish(massIntention: MassIntentionWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Mass Intention Information (only show section if there's at least one detail)
  const hasDetails = massIntention.mass_offered_for || massIntention.requested_by ||
    massIntention.date_requested || massIntention.date_received ||
    (massIntention.stipend_in_cents !== null && massIntention.stipend_in_cents !== undefined) ||
    massIntention.status

  if (hasDetails) {
    elements.push({
      type: 'section-title',
      text: 'Mass Intention Details',
    })

    if (massIntention.mass_offered_for) {
      elements.push({
        type: 'info-row',
        label: 'Mass Offered For:',
        value: massIntention.mass_offered_for,
      })
    }

    if (massIntention.requested_by) {
      elements.push({
        type: 'info-row',
        label: 'Requested By:',
        value: formatPersonName(massIntention.requested_by),
      })
    }

    if (massIntention.date_requested) {
      const dateRequested = new Date(massIntention.date_requested)
      elements.push({
        type: 'info-row',
        label: 'Date Requested:',
        value: dateRequested.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
      })
    }

    if (massIntention.date_received) {
      const dateReceived = new Date(massIntention.date_received)
      elements.push({
        type: 'info-row',
        label: 'Date Received:',
        value: dateReceived.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
      })
    }

    if (massIntention.stipend_in_cents !== null && massIntention.stipend_in_cents !== undefined) {
      const stipendDollars = (massIntention.stipend_in_cents / 100).toFixed(2)
      elements.push({
        type: 'info-row',
        label: 'Stipend:',
        value: `$${stipendDollars}`,
      })
    }

    if (massIntention.status) {
      elements.push({
        type: 'info-row',
        label: 'Status:',
        value: massIntention.status,
      })
    }
  }

  if (massIntention.note) {
    elements.push({
      type: 'section-title',
      text: 'Notes',
    })
    elements.push({
      type: 'text',
      text: massIntention.note,
    })
  }

  return {
    id: 'summary',
    title: 'Mass Intention Summary',
    elements,
  }
}

/**
 * Build Mass Intention summary document (English)
 */
export function buildSummaryEnglish(massIntention: MassIntentionWithRelations): LiturgyDocument {
  const subtitle = massIntention.date_requested
    ? new Date(massIntention.date_requested).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : undefined

  const sections: ContentSection[] = []

  // Summary section
  sections.push(buildSummarySectionEnglish(massIntention))

  return {
    id: massIntention.id,
    type: 'mass-intention',
    language: 'en',
    template: 'mass-intention-summary-english',
    title: 'Mass Intention',
    subtitle,
    sections,
  }
}
