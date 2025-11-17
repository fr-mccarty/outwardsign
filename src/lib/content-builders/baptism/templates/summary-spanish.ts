/**
 * Baptism Summary (Spanish) Template
 *
 * Simple summary of baptism information for sacristy use (Spanish)
 */

import { BaptismWithRelations } from '@/lib/actions/baptisms'
import { LiturgyDocument, ContentSection } from '@/lib/types/liturgy-content'
import { formatPersonWithPhone, formatEventDateTime, formatLocationWithAddress } from '@/lib/utils/formatters'
import {
  buildCoverPage,
  type CoverPageSection,
} from '@/lib/content-builders/shared/builders'

/**
 * Main builder function for baptism summary template (Spanish)
 */
export function buildSummarySpanish(baptism: BaptismWithRelations): LiturgyDocument {
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
    celebrationRows.push({ label: 'Fecha y Hora:', value: formatEventDateTime(baptism.baptism_event) })
  }
  if (baptism.baptism_event?.location) {
    celebrationRows.push({ label: 'Ubicación:', value: formatLocationWithAddress(baptism.baptism_event.location) })
  }
  if (celebrationRows.length > 0) {
    coverSections.push({ title: 'Celebración del Bautismo', rows: celebrationRows })
  }

  // Child subsection (only show section if child exists)
  if (baptism.child) {
    const childRows = []
    childRows.push({ label: 'Nombre:', value: formatPersonWithPhone(baptism.child) })
    coverSections.push({ title: 'Niño/a a ser Bautizado/a', rows: childRows })
  }

  // Parents subsection (only show section if at least one parent exists)
  if (baptism.mother || baptism.father) {
    const parentRows = []
    if (baptism.mother) {
      parentRows.push({ label: 'Madre:', value: formatPersonWithPhone(baptism.mother) })
    }
    if (baptism.father) {
      parentRows.push({ label: 'Padre:', value: formatPersonWithPhone(baptism.father) })
    }
    coverSections.push({ title: 'Padres', rows: parentRows })
  }

  // Sponsors/Godparents subsection (only show section if at least one sponsor exists)
  if (baptism.sponsor_1 || baptism.sponsor_2) {
    const sponsorRows = []
    if (baptism.sponsor_1) {
      sponsorRows.push({ label: 'Padrino/Madrina 1:', value: formatPersonWithPhone(baptism.sponsor_1) })
    }
    if (baptism.sponsor_2) {
      sponsorRows.push({ label: 'Padrino/Madrina 2:', value: formatPersonWithPhone(baptism.sponsor_2) })
    }
    coverSections.push({ title: 'Padrinos', rows: sponsorRows })
  }

  // Presider subsection (only show section if presider exists)
  if (baptism.presider) {
    const presiderRows = []
    presiderRows.push({ label: 'Presidente:', value: formatPersonWithPhone(baptism.presider) })
    coverSections.push({ title: 'Ministro', rows: presiderRows })
  }

  // Note subsection
  if (baptism.note) {
    const noteRows = []
    noteRows.push({ label: 'Nota:', value: baptism.note })
    coverSections.push({ title: 'Nota Adicional', rows: noteRows })
  }

  sections.push(buildCoverPage(coverSections))

  return {
    id: `baptism-summary-${baptism.id}`,
    type: 'baptism',
    language: 'es',
    template: 'summary-spanish',
    title: 'Resumen del Bautismo',
    subtitle,
    sections,
  }
}
