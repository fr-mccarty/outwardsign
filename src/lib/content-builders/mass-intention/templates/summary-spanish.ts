/**
 * Mass Intention Summary Template (Spanish)
 *
 * Simple summary of mass intention details in Spanish
 */

import { MassIntentionWithRelations } from '@/lib/actions/mass-intentions'
import { LiturgyDocument, ContentSection } from '@/lib/types/liturgy-content'
import { formatPersonWithPhone } from '@/lib/utils/formatters'
import {
  buildCoverPage,
  type CoverPageSection,
} from '@/lib/content-builders/shared/builders'

/**
 * Build Mass Intention summary document (Spanish)
 */
export function buildSummarySpanish(massIntention: MassIntentionWithRelations): LiturgyDocument {
  const subtitle = massIntention.date_requested
    ? new Date(massIntention.date_requested).toLocaleDateString('es-ES', {
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
    detailRows.push({ label: 'Misa Ofrecida Por:', value: massIntention.mass_offered_for })
  }
  if (massIntention.requested_by) {
    detailRows.push({ label: 'Solicitado Por:', value: formatPersonWithPhone(massIntention.requested_by) })
  }
  if (massIntention.date_requested) {
    const dateRequested = new Date(massIntention.date_requested)
    detailRows.push({
      label: 'Fecha Solicitada:',
      value: dateRequested.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
    })
  }
  if (massIntention.date_received) {
    const dateReceived = new Date(massIntention.date_received)
    detailRows.push({
      label: 'Fecha Recibida:',
      value: dateReceived.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
    })
  }
  if (massIntention.stipend_in_cents !== null && massIntention.stipend_in_cents !== undefined) {
    const stipendDollars = (massIntention.stipend_in_cents / 100).toFixed(2)
    detailRows.push({ label: 'Estipendio:', value: `$${stipendDollars}` })
  }
  if (massIntention.status) {
    detailRows.push({ label: 'Estado:', value: massIntention.status })
  }
  if (detailRows.length > 0) {
    coverSections.push({ title: 'Detalles de la Intención de Misa', rows: detailRows })
  }

  // Notes subsection
  if (massIntention.note) {
    const noteRows = []
    noteRows.push({ label: 'Nota:', value: massIntention.note })
    coverSections.push({ title: 'Notas', rows: noteRows })
  }

  sections.push(buildCoverPage(coverSections))

  return {
    id: massIntention.id,
    type: 'mass-intention',
    language: 'es',
    template: 'mass-intention-summary-spanish',
    title: 'Intención de Misa',
    subtitle,
    sections,
  }
}
