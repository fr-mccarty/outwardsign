/**
 * Mass Intention Summary Template
 *
 * Simple summary of mass intention details
 */

import { MassIntentionWithRelations } from '@/lib/actions/mass-intentions'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName } from '@/lib/utils/formatters'

/**
 * Build summary section for mass intention
 */
function buildSummarySection(massIntention: MassIntentionWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Mass Intention Information
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
 * Build Mass Intention summary document
 */
export function buildIntentionSummary(massIntention: MassIntentionWithRelations): LiturgyDocument {
  const sections: ContentSection[] = []

  // Summary section
  sections.push(buildSummarySection(massIntention))

  return {
    id: massIntention.id,
    type: 'mass-intention',
    language: 'en',
    template: 'intention-summary',
    title: 'Mass Intention',
    sections,
  }
}
