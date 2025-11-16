/**
 * Mass Intention Summary Template (Spanish)
 *
 * Simple summary of mass intention details in Spanish
 */

import { MassIntentionWithRelations } from '@/lib/actions/mass-intentions'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName } from '@/lib/utils/formatters'

/**
 * Build summary section for mass intention (Spanish)
 */
function buildSummarySectionSpanish(massIntention: MassIntentionWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Mass Intention Information
  elements.push({
    type: 'section-title',
    text: 'Detalles de la Intención de Misa',
  })

  if (massIntention.mass_offered_for) {
    elements.push({
      type: 'info-row',
      label: 'Misa Ofrecida Por:',
      value: massIntention.mass_offered_for,
    })
  }

  if (massIntention.requested_by) {
    elements.push({
      type: 'info-row',
      label: 'Solicitado Por:',
      value: formatPersonName(massIntention.requested_by),
    })
  }

  if (massIntention.date_requested) {
    const dateRequested = new Date(massIntention.date_requested)
    elements.push({
      type: 'info-row',
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
    elements.push({
      type: 'info-row',
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
    elements.push({
      type: 'info-row',
      label: 'Estipendio:',
      value: `$${stipendDollars}`,
    })
  }

  if (massIntention.status) {
    elements.push({
      type: 'info-row',
      label: 'Estado:',
      value: massIntention.status,
    })
  }

  if (massIntention.note) {
    elements.push({
      type: 'section-title',
      text: 'Notas',
    })
    elements.push({
      type: 'text',
      text: massIntention.note,
    })
  }

  return {
    id: 'summary',
    title: 'Resumen de Intención de Misa',
    elements,
  }
}

/**
 * Build Mass Intention summary document (Spanish)
 */
export function buildSummarySpanish(massIntention: MassIntentionWithRelations): LiturgyDocument {
  const sections: ContentSection[] = []

  // Summary section
  sections.push(buildSummarySectionSpanish(massIntention))

  return {
    id: massIntention.id,
    type: 'mass-intention',
    language: 'es',
    template: 'mass-intention-summary-spanish',
    title: 'Intención de Misa',
    sections,
  }
}
