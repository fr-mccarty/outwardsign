/**
 * Presentation Full Script - Spanish
 * Based on the traditional Presentation in the Temple liturgy
 *
 * STRUCTURE:
 * 1. Cover Page - Summary (page break after)
 * 2. Liturgy Section - Ceremony script
 */

import { PresentationWithRelations } from '@/lib/actions/presentations'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatEventDateTime } from '@/lib/utils/formatters'
import {
  getChildNameSpanish,
  getMotherNameSpanish,
  getFatherNameSpanish,
  getChildSex,
  isBaptized,
  gendered,
  getParentsTextSpanish,
  getAudienceTextSpanish,
  buildTitleSpanish,
  formatLocationText,
  getEventSubtitleSpanish,
} from '../helpers'

// ============================================================================
// SECTION 1: COVER PAGE
// ============================================================================

/**
 * Build cover page with presentation summary information
 */
function buildCoverPage(presentation: PresentationWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Title and subtitle header
  const title = buildTitleSpanish(presentation)
  const subtitle = getEventSubtitleSpanish(presentation)

  elements.push({
    type: 'event-title',
    text: title,
  })

  elements.push({
    type: 'event-datetime',
    text: subtitle,
  })

  // Presentation Information subsection
  elements.push({
    type: 'section-title',
    text: 'Información de la Presentación',
  })

  if (presentation.child) {
    elements.push({
      type: 'info-row',
      label: 'Niño/a:',
      value: formatPersonName(presentation.child),
    })
  }

  if (presentation.mother) {
    elements.push({
      type: 'info-row',
      label: 'Madre:',
      value: formatPersonName(presentation.mother),
    })
  }

  if (presentation.father) {
    elements.push({
      type: 'info-row',
      label: 'Padre:',
      value: formatPersonName(presentation.father),
    })
  }

  if (presentation.coordinator) {
    elements.push({
      type: 'info-row',
      label: 'Coordinador(a):',
      value: formatPersonName(presentation.coordinator),
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
      value: formatLocationText(presentation.presentation_event.location),
    })
  }

  elements.push({
    type: 'info-row',
    label: 'Estado de Bautismo:',
    value: presentation.is_baptized ? 'Bautizado/a' : 'Aún no bautizado/a',
  })

  if (presentation.status) {
    elements.push({
      type: 'info-row',
      label: 'Estado:',
      value: presentation.status,
    })
  }

  if (presentation.note) {
    elements.push({
      type: 'info-row',
      label: 'Notas:',
      value: presentation.note,
    })
  }

  return {
    id: 'cover',
    pageBreakAfter: true, // Always page break after cover
    elements,
  }
}

// ============================================================================
// SECTION 2: LITURGY
// ============================================================================

/**
 * Build liturgy section with ceremony script
 */
function buildLiturgySection(presentation: PresentationWithRelations): ContentSection {
  // Get names and values using shared helpers
  const childName = getChildNameSpanish(presentation)
  const childSex = getChildSex(presentation)
  const baptized = isBaptized(presentation)

  // Helper function for gendered text in Spanish (wraps shared helper)
  const genderedText = (maleText: string, femaleText: string) => {
    return gendered(presentation, maleText, femaleText)
  }

  const getParentsText = () => getParentsTextSpanish(presentation)
  const getAudienceText = () => getAudienceTextSpanish()

  // Build liturgy elements
  const liturgyElements: ContentElement[] = []

  // After the Homily
  liturgyElements.push({
    type: 'section-title',
    text: 'Presentation',
  })

  liturgyElements.push({
    type: 'rubric',
    text: 'Después de la Homilía',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Celebrant invitation
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: 'CELEBRANTE: ',
      },
      {
        text: `La vida es el mayor regalo de Dios para nosotros. Agradecidos por la vida de su ${genderedText('hijo', 'hija')}, ${getParentsText()} quisieran presentar a su ${genderedText('hijo', 'hija')} ${childName} al Señor y a esta comunidad. Les damos la bienvenida aquí al frente de la iglesia.`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  liturgyElements.push({
    type: 'rubric',
    text: 'Caminar al frente del altar',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Commitment question
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: `CELEBRANTE (a los ${getAudienceText()}): `,
      },
      {
        text: `Al presentar a ${genderedText('este niño', 'esta niña')} al Señor y a esta comunidad hoy, ${baptized ? 'renuevan su compromiso' : 'se comprometen'} a ${genderedText('criarlo', 'criarla')} en los caminos de la fe. ¿Entienden y aceptan esta responsabilidad?`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Parents' response
  liturgyElements.push({
    type: 'response',
    label: 'PADRES:',
    text: 'Sí, aceptamos.',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Sign of the cross
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: `CELEBRANTE (al ${genderedText('niño', 'niña')}): `,
      },
      {
        text: `${baptized ? 'Como en el día de tu bautismo, te' : 'Te'} signo con la señal de la cruz, y pido a tus ${getAudienceText()} que hagan lo mismo.`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Prayer
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: 'CELEBRANTE: ',
      },
      {
        text: `Padre Celestial, tú eres el dador de toda vida. Nos diste ${genderedText('este hijo', 'esta hija')} y te ${genderedText('lo', 'la')} presentamos, como María presentó a Jesús en el templo. Te rogamos por estos ${getAudienceText()}. Bendícelos en sus esfuerzos por criar a ${genderedText('este niño', 'esta niña')} como ${genderedText('un buen cristiano', 'una buena cristiana')} y como ${genderedText('un buen católico', 'una buena católica')}. Bendice a ${genderedText('este niño', 'esta niña')}. Dale buena salud, protége${genderedText('lo', 'la')} de cualquier peligro del cuerpo y del espíritu, y ayúda${genderedText('lo', 'la')} a crecer en edad y en sabiduría, siempre en tu presencia.`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Prayer to Mary
  liturgyElements.push({
    type: 'text',
    text: `Santa María, Madre de Dios y Madre nuestra, pedimos tu protección sobre esta familia y sobre ${genderedText('este hijo', 'esta hija')}. Es siguiendo tu ejemplo que esta familia trae a ${genderedText('este niño', 'esta niña')} para ser presentado a Dios, nuestro creador, y a esta comunidad hoy. Ayuda a estos padres a criar a ${genderedText('este niño', 'esta niña')} con palabra y ejemplo. Hacemos nuestra oración en el nombre de Jesucristo, que es Señor por los siglos de los siglos.`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Assembly response
  liturgyElements.push({
    type: 'response',
    label: 'ASAMBLEA:',
    text: 'Amén.',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Blessing of religious articles
  liturgyElements.push({
    type: 'rubric',
    text: 'Bendecir artículos religiosos',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Dismissal
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: 'CELEBRANTE: ',
      },
      {
        text: 'Ahora los enviamos de regreso a sus lugares, mientras les mostramos nuestro apoyo con un aplauso.',
      },
    ],
  })

  return {
    id: 'liturgy',
    pageBreakBefore: true, // Start on new page after cover
    elements: liturgyElements,
  }
}

// ============================================================================
// MAIN TEMPLATE BUILDER
// ============================================================================

/**
 * Build complete presentation liturgy document (Spanish)
 *
 * DOCUMENT STRUCTURE:
 * 1. Cover Page (summary) [PAGE BREAK]
 * 2. Liturgy Section (ceremony script)
 */
export function buildFullScriptSpanish(presentation: PresentationWithRelations): LiturgyDocument {
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
    template: 'presentation-spanish',
    title,
    subtitle,
    sections,
  }
}
