/**
 * Baptism Summary (Spanish) Template
 *
 * Simple summary of baptism information for sacristy use (Spanish)
 */

import { BaptismWithRelations } from '@/lib/actions/baptisms'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatPersonWithPhone, formatEventDateTime } from '@/lib/utils/formatters'
import { formatLocationText } from '../helpers'

/**
 * Build summary section with all baptism data (Spanish)
 */
function buildSummarySection(baptism: BaptismWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Baptism Event
  elements.push({
    type: 'section-title',
    text: 'Celebración del Bautismo',
  })

  if (baptism.baptism_event?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Fecha y Hora:',
      value: formatEventDateTime(baptism.baptism_event),
    })
  }

  if (baptism.baptism_event?.location) {
    elements.push({
      type: 'info-row',
      label: 'Ubicación:',
      value: formatLocationText(baptism.baptism_event.location),
    })
  }

  // Child
  elements.push({
    type: 'section-title',
    text: 'Niño/a a ser Bautizado/a',
  })

  if (baptism.child) {
    elements.push({
      type: 'info-row',
      label: 'Nombre:',
      value: formatPersonWithPhone(baptism.child),
    })
  }

  // Parents
  elements.push({
    type: 'section-title',
    text: 'Padres',
  })

  if (baptism.mother) {
    elements.push({
      type: 'info-row',
      label: 'Madre:',
      value: formatPersonWithPhone(baptism.mother),
    })
  }

  if (baptism.father) {
    elements.push({
      type: 'info-row',
      label: 'Padre:',
      value: formatPersonWithPhone(baptism.father),
    })
  }

  // Sponsors/Godparents
  elements.push({
    type: 'section-title',
    text: 'Padrinos',
  })

  if (baptism.sponsor_1) {
    elements.push({
      type: 'info-row',
      label: 'Padrino/Madrina 1:',
      value: formatPersonWithPhone(baptism.sponsor_1),
    })
  }

  if (baptism.sponsor_2) {
    elements.push({
      type: 'info-row',
      label: 'Padrino/Madrina 2:',
      value: formatPersonWithPhone(baptism.sponsor_2),
    })
  }

  // Presider
  elements.push({
    type: 'section-title',
    text: 'Ministro',
  })

  if (baptism.presider) {
    elements.push({
      type: 'info-row',
      label: 'Presidente:',
      value: formatPersonWithPhone(baptism.presider),
    })
  }

  // Note
  if (baptism.note) {
    elements.push({
      type: 'section-title',
      text: 'Nota Adicional',
    })
    elements.push({
      type: 'text',
      text: baptism.note,
    })
  }

  return {
    id: 'baptism-summary',
    title: 'Resumen del Bautismo',
    elements,
  }
}

/**
 * Main builder function for baptism summary template (Spanish)
 */
export function buildSummarySpanish(baptism: BaptismWithRelations): LiturgyDocument {
  const sections: ContentSection[] = []

  // Summary section
  sections.push(buildSummarySection(baptism))

  return {
    id: `baptism-summary-${baptism.id}`,
    type: 'baptism',
    language: 'es',
    template: 'summary-spanish',
    title: 'Resumen del Bautismo',
    sections,
  }
}
