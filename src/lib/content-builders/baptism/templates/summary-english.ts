/**
 * Baptism Summary (English) Template
 *
 * Simple summary of baptism information for sacristy use
 */

import { BaptismWithRelations } from '@/lib/actions/baptisms'
import { LiturgyDocument, ContentSection } from '@/lib/types/liturgy-content'
import { formatPersonWithPhone, formatEventDateTime, formatLocationWithAddress } from '@/lib/utils/formatters'
import {
  buildCoverPage,
  type CoverPageSection,
} from '@/lib/content-builders/shared/builders'

/**
 * Main builder function for baptism summary template
 */
export function buildSummaryEnglish(baptism: BaptismWithRelations): LiturgyDocument {
  const subtitle =
    baptism.baptism_event?.start_date && baptism.baptism_event?.start_time
      ? formatEventDateTime(baptism.baptism_event)
      : undefined

  const sections: ContentSection[] = []

  // Build cover page sections array conditionally
  const coverSections: CoverPageSection[] = []

  // Baptism Celebration subsection
  const celebrationRows = []
  if (baptism.baptism_event?.start_date) {
    celebrationRows.push({ label: 'Date & Time:', value: formatEventDateTime(baptism.baptism_event) })
  }
  if (baptism.baptism_event?.location) {
    celebrationRows.push({ label: 'Location:', value: formatLocationWithAddress(baptism.baptism_event.location) })
  }
  if (celebrationRows.length > 0) {
    coverSections.push({ title: 'Baptism Celebration', rows: celebrationRows })
  }

  // Child subsection (only show section if child exists)
  if (baptism.child) {
    const childRows = []
    childRows.push({ label: 'Name:', value: formatPersonWithPhone(baptism.child) })
    coverSections.push({ title: 'Child to be Baptized', rows: childRows })
  }

  // Parents subsection (only show section if at least one parent exists)
  if (baptism.mother || baptism.father) {
    const parentRows = []
    if (baptism.mother) {
      parentRows.push({ label: 'Mother:', value: formatPersonWithPhone(baptism.mother) })
    }
    if (baptism.father) {
      parentRows.push({ label: 'Father:', value: formatPersonWithPhone(baptism.father) })
    }
    coverSections.push({ title: 'Parents', rows: parentRows })
  }

  // Sponsors/Godparents subsection (only show section if at least one sponsor exists)
  if (baptism.sponsor_1 || baptism.sponsor_2) {
    const sponsorRows = []
    if (baptism.sponsor_1) {
      sponsorRows.push({ label: 'Sponsor 1:', value: formatPersonWithPhone(baptism.sponsor_1) })
    }
    if (baptism.sponsor_2) {
      sponsorRows.push({ label: 'Sponsor 2:', value: formatPersonWithPhone(baptism.sponsor_2) })
    }
    coverSections.push({ title: 'Sponsors (Godparents)', rows: sponsorRows })
  }

  // Presider subsection (only show section if presider exists)
  if (baptism.presider) {
    const presiderRows = []
    presiderRows.push({ label: 'Presider:', value: formatPersonWithPhone(baptism.presider) })
    coverSections.push({ title: 'Minister', rows: presiderRows })
  }

  // Note subsection
  if (baptism.note) {
    const noteRows = []
    noteRows.push({ label: 'Note:', value: baptism.note })
    coverSections.push({ title: 'Additional Note', rows: noteRows })
  }

  sections.push(buildCoverPage(coverSections))

  return {
    id: `baptism-summary-${baptism.id}`,
    type: 'baptism',
    language: 'en',
    template: 'summary-english',
    title: 'Baptism Summary',
    subtitle,
    sections,
  }
}
