/**
 * Presentation Simple Script - Spanish
 * A shorter, simplified version of the Presentation in the Temple liturgy
 *
 * STRUCTURE:
 * 1. Cover Page - Summary (page break after)
 * 2. Liturgy Section - Simplified ceremony script
 */

import { PresentationWithRelations } from '@/lib/actions/presentations'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonWithPhone, formatEventDateTime, formatLocationWithAddress } from '@/lib/utils/formatters'
import { gendered } from '@/lib/content-builders/shared/builders'
import {
  getChildNameSpanish,
  getMotherNameSpanish,
  getFatherNameSpanish,
  buildTitleSpanish,
} from '../helpers'

/**
 * Build cover page with presentation summary information
 */
function buildCoverPage(presentation: PresentationWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Title and subtitle handled at document level

  // Presentation Information subsection
  elements.push({
    type: 'section-title',
    text: 'Información de la Presentación',
  })

  if (presentation.child) {
    const childLabel = gendered(presentation.child, 'Niño:', 'Niña:')
    elements.push({
      type: 'info-row',
      label: childLabel,
      value: formatPersonWithPhone(presentation.child),
    })
  }

  if (presentation.mother) {
    elements.push({
      type: 'info-row',
      label: 'Madre:',
      value: formatPersonWithPhone(presentation.mother),
    })
  }

  if (presentation.father) {
    elements.push({
      type: 'info-row',
      label: 'Padre:',
      value: formatPersonWithPhone(presentation.father),
    })
  }

  if (presentation.coordinator) {
    elements.push({
      type: 'info-row',
      label: 'Coordinador(a):',
      value: formatPersonWithPhone(presentation.coordinator),
    })
  }

  if (presentation.presentation_event?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Fecha y Hora del Evento:',
      value: formatEventDateTime(presentation.presentation_event),
    })
  }

  if (presentation.presentation_event?.location) {
    elements.push({
      type: 'info-row',
      label: 'Lugar:',
      value: formatLocationWithAddress(presentation.presentation_event.location),
    })
  }

  elements.push({
    type: 'info-row',
    label: 'Estado de Bautismo:',
    value: presentation.is_baptized ? 'Bautizado/a' : 'Aún no bautizado/a',
  })

  if (presentation.note) {
    elements.push({
      type: 'info-row',
      label: 'Notas:',
      value: presentation.note,
    })
  }

  return {
    id: 'cover',
    pageBreakAfter: true,
    elements,
  }
}

/**
 * Build liturgy section with simplified ceremony script
 */
function buildLiturgySection(presentation: PresentationWithRelations): ContentSection {
  // Get names using helpers
  const childName = getChildNameSpanish(presentation)
  const motherName = getMotherNameSpanish(presentation)
  const fatherName = getFatherNameSpanish(presentation)

  // Helper function for gendered text
  const genderedText = (maleText: string, femaleText: string) => {
    return gendered(presentation.child, maleText, femaleText)
  }

  // Build liturgy elements
  const liturgyElements: ContentElement[] = []

  // After the Homily
  liturgyElements.push({
    type: 'section-title',
    text: 'Después de la Homilía',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Celebrant invitation
  liturgyElements.push({
    type: 'presider-dialogue',
    label: 'CELEBRANTE:',
    text: `${motherName} y ${fatherName} presentan a su ${genderedText('hijo', 'hija')} ${childName} al Señor y a esta comunidad. Por favor, pasen adelante.`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  liturgyElements.push({
    type: 'rubric',
    text: 'La familia viene al frente del altar',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Commitment question
  liturgyElements.push({
    type: 'presider-dialogue',
    label: 'CELEBRANTE:',
    text: `¿Se comprometen a criar a ${childName} en la fe católica?`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Parents' response
  liturgyElements.push({
    type: 'response-dialogue',
    label: 'PADRES:',
    text: 'Sí, nos comprometemos.',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Sign of the cross
  liturgyElements.push({
    type: 'presider-dialogue',
    label: 'CELEBRANTE:',
    text: `${genderedText('Lo', 'La')} signo con la señal de la cruz. Padres, por favor hagan lo mismo.`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  liturgyElements.push({
    type: 'rubric',
    text: 'El celebrante y los padres hacen la señal de la cruz sobre el niño/a',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Prayer
  liturgyElements.push({
    type: 'priest-text',
    text: `Padre celestial, bendice a ${genderedText('este niño', 'esta niña')} y a estos padres. Ayúdales a ${genderedText('criarlo', 'criarla')} en la fe y el amor. Te lo pedimos por Cristo nuestro Señor.`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Assembly response
  liturgyElements.push({
    type: 'response-dialogue',
    label: 'ASAMBLEA:',
    text: 'Amén.',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Blessing of religious articles (if applicable)
  liturgyElements.push({
    type: 'rubric',
    text: 'Bendecir artículos religiosos si se presentan',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Dismissal
  liturgyElements.push({
    type: 'presider-dialogue',
    label: 'CELEBRANTE:',
    text: 'Mostremos nuestro apoyo con un aplauso.',
  })

  return {
    id: 'liturgy',
    elements: liturgyElements,
  }
}

/**
 * Build complete presentation liturgy document (Simple Spanish)
 */
export function buildSimpleSpanish(presentation: PresentationWithRelations): LiturgyDocument {
  // Calculate title and subtitle
  const title = buildTitleSpanish(presentation)
  const subtitle = presentation.presentation_event
    ? formatEventDateTime(presentation.presentation_event)
    : undefined

  // Build all sections in order
  const sections: ContentSection[] = []

  // PAGE 1: Cover page
  sections.push(buildCoverPage(presentation))

  // PAGE 2: Liturgy section
  sections.push(buildLiturgySection(presentation))

  // Return complete document
  return {
    id: presentation.id,
    type: 'presentation',
    language: 'es',
    template: 'presentation-simple-spanish',
    title,
    subtitle,
    sections,
  }
}
