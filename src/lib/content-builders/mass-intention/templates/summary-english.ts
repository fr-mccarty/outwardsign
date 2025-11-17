/**
 * Mass Intention Summary Template (English)
 *
 * Simple summary of mass intention details in English
 */

import { MassIntentionWithRelations } from '@/lib/actions/mass-intentions'
import { LiturgyDocument, ContentSection } from '@/lib/types/liturgy-content'
import { formatPersonWithPhone } from '@/lib/utils/formatters'
import {
  buildCoverPage,
  type CoverPageSection,
  getStatusLabel,
} from '@/lib/content-builders/shared/builders'

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

  // Build cover page sections array conditionally
  const coverSections: CoverPageSection[] = []

  // Mass Intention Details subsection
  const detailRows = []
  if (massIntention.mass_offered_for) {
    detailRows.push({ label: 'Mass Offered For:', value: massIntention.mass_offered_for })
  }
  if (massIntention.requested_by) {
    detailRows.push({ label: 'Requested By:', value: formatPersonWithPhone(massIntention.requested_by) })
  }
  if (massIntention.date_requested) {
    const dateRequested = new Date(massIntention.date_requested)
    detailRows.push({
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
    detailRows.push({
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
    detailRows.push({ label: 'Stipend:', value: `$${stipendDollars}` })
  }
  if (massIntention.status) {
    detailRows.push({
      label: 'Status:',
      value: getStatusLabel(massIntention.status, 'en'),
    })
  }
  if (detailRows.length > 0) {
    coverSections.push({ title: 'Mass Intention Details', rows: detailRows })
  }

  // Notes subsection
  if (massIntention.note) {
    const noteRows = []
    noteRows.push({ label: 'Note:', value: massIntention.note })
    coverSections.push({ title: 'Notes', rows: noteRows })
  }

  sections.push(buildCoverPage(coverSections))

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
