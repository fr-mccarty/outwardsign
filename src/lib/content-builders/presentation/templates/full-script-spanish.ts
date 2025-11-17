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
import { formatPersonWithPhone, formatEventDateTime, formatLocationWithAddress } from '@/lib/utils/formatters'
import {
  buildCoverPage,
  type CoverPageSection,
  gendered,
} from '@/lib/content-builders/shared/builders'
import {
  getChildNameSpanish,
  isBaptized,
  getParentsTextSpanish,
  getAudienceTextSpanish,
  buildTitleSpanish,
  getEventSubtitleSpanish,
} from '../helpers'

// ============================================================================
// SECTION 1: COVER PAGE
// ============================================================================
// (Uses shared buildCoverPage builder)

// ============================================================================
// SECTION 2: LITURGY
// ============================================================================

/**
 * Build liturgy section with ceremony script
 */
function buildLiturgySection(presentation: PresentationWithRelations): ContentSection {
  // Get names and values using shared helpers
  const childName = getChildNameSpanish(presentation)
  const baptized = isBaptized(presentation)

  // Helper function for gendered text in Spanish (wraps shared helper)
  const genderedText = (maleText: string, femaleText: string) => {
    return gendered(presentation.child, maleText, femaleText)
  }

  const getParentsText = () => getParentsTextSpanish(presentation)
  const getAudienceText = () => getAudienceTextSpanish()

  // Build liturgy elements
  const liturgyElements: ContentElement[] = []

  // After the Homily
  liturgyElements.push({
    type: 'section-title',
    text: ' Presentación',
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
    type: 'presider-dialogue',
    label: 'CELEBRANTE:',
    text: `La vida es el mayor regalo de Dios para nosotros. Agradecidos por la vida de su ${genderedText('hijo', 'hija')}, ${getParentsText()} quisieran presentar a su ${genderedText('hijo', 'hija')} ${childName} al Señor y a esta comunidad. Les damos la bienvenida aquí al frente de la iglesia.`,
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
    type: 'presider-dialogue',
    label: 'CELEBRANTE:',
    text: `(a los ${getAudienceText()}) Al presentar a ${genderedText('este niño', 'esta niña')} al Señor y a esta comunidad hoy, ${baptized ? 'renuevan su compromiso' : 'se comprometen'} a ${genderedText('criarlo', 'criarla')} en los caminos de la fe. ¿Entienden y aceptan esta responsabilidad?`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Parents' response
  liturgyElements.push({
    type: 'response-dialogue',
    label: 'PADRES:',
    text: 'Sí, aceptamos.',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Sign of the cross
  liturgyElements.push({
    type: 'presider-dialogue',
    label: 'CELEBRANTE:',
    text: `(al ${genderedText('niño', 'niña')}) ${baptized ? 'Como en el día de tu bautismo, te' : 'Te'} signo con la señal de la cruz, y pido a tus ${getAudienceText()} que hagan lo mismo.`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Prayer
  liturgyElements.push({
    type: 'priest-text',
    text: `Padre Celestial, tú eres el dador de toda vida. Nos diste ${genderedText('este hijo', 'esta hija')} y te ${genderedText('lo', 'la')} presentamos, como María presentó a Jesús en el templo. Te rogamos por estos ${getAudienceText()}. Bendícelos en sus esfuerzos por criar a ${genderedText('este niño', 'esta niña')} como ${genderedText('un buen cristiano', 'una buena cristiana')} y como ${genderedText('un buen católico', 'una buena católica')}. Bendice a ${genderedText('este niño', 'esta niña')}. Dale buena salud, protége${genderedText('lo', 'la')} de cualquier peligro del cuerpo y del espíritu, y ayúda${genderedText('lo', 'la')} a crecer en edad y en sabiduría, siempre en tu presencia.`,
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
    type: 'response-dialogue',
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
    type: 'presider-dialogue',
    label: 'CELEBRANTE:',
    text: 'Ahora los enviamos de regreso a sus lugares, mientras les mostramos nuestro apoyo con un aplauso.',
  })

  return {
    id: 'liturgy',
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
  const subtitle = getEventSubtitleSpanish(presentation)

  const sections: ContentSection[] = []

  // 1. COVER PAGE - Build sections array conditionally
  const coverSections: CoverPageSection[] = []

  // Presentation Information subsection
  const presentationRows = []
  if (presentation.child) {
    const childLabel = gendered(presentation.child, 'Niño:', 'Niña:')
    presentationRows.push({ label: childLabel, value: formatPersonWithPhone(presentation.child) })
  }
  if (presentation.mother) {
    presentationRows.push({ label: 'Madre:', value: formatPersonWithPhone(presentation.mother) })
  }
  if (presentation.father) {
    presentationRows.push({ label: 'Padre:', value: formatPersonWithPhone(presentation.father) })
  }
  if (presentation.coordinator) {
    presentationRows.push({ label: 'Coordinador(a):', value: formatPersonWithPhone(presentation.coordinator) })
  }
  if (presentation.presentation_event?.start_date) {
    presentationRows.push({ label: 'Fecha y Hora del Evento:', value: formatEventDateTime(presentation.presentation_event) })
  }
  if (presentation.presentation_event?.location) {
    presentationRows.push({ label: 'Lugar:', value: formatLocationWithAddress(presentation.presentation_event.location) })
  }
  presentationRows.push({
    label: 'Estado de Bautismo:',
    value: presentation.is_baptized ? 'Bautizado/a' : 'Aún no bautizado/a',
  })
  if (presentation.status) {
    presentationRows.push({ label: 'Estado:', value: presentation.status })
  }
  if (presentation.note) {
    presentationRows.push({ label: 'Notas:', value: presentation.note })
  }
  coverSections.push({ title: 'Información de la Presentación', rows: presentationRows })

  sections.push(buildCoverPage(coverSections))

  // 2. LITURGY SECTION
  sections.push(buildLiturgySection(presentation))

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
