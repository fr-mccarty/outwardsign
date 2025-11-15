/**
 * Presentation Bilingual Script - English & Spanish
 * A bilingual version of the Presentation in the Temple liturgy
 *
 * STRUCTURE:
 * 1. Cover Page - Summary (page break after)
 * 2. Liturgy Section - Complete bilingual ceremony script
 */

import { PresentationWithRelations } from '@/lib/actions/presentations'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatEventDateTime } from '@/lib/utils/formatters'
import {
  getChildNameBilingual,
  getMotherNameBilingual,
  getFatherNameBilingual,
  isBaptized,
  gendered,
  formatLocationText,
  getEventSubtitleBilingual,
} from '../helpers'

/**
 * Build cover page with presentation summary information
 */
function buildCoverPage(presentation: PresentationWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Title and subtitle header
  const childName = getChildNameBilingual(presentation)
  const title = `Presentation in the Temple / Presentación en el Templo - ${childName}`
  const subtitle = getEventSubtitleBilingual(presentation)

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
    text: 'Presentation Information / Información de la Presentación',
  })

  if (presentation.child) {
    elements.push({
      type: 'info-row',
      label: 'Child / Niño/a:',
      value: formatPersonName(presentation.child),
    })
  }

  if (presentation.mother) {
    elements.push({
      type: 'info-row',
      label: 'Mother / Madre:',
      value: formatPersonName(presentation.mother),
    })
  }

  if (presentation.father) {
    elements.push({
      type: 'info-row',
      label: 'Father / Padre:',
      value: formatPersonName(presentation.father),
    })
  }

  if (presentation.coordinator) {
    elements.push({
      type: 'info-row',
      label: 'Coordinator / Coordinador(a):',
      value: formatPersonName(presentation.coordinator),
    })
  }

  if (presentation.presentation_event?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Event Date & Time / Fecha y Hora del Evento:',
      value: formatEventDateTime(presentation.presentation_event),
    })
  }

  if (presentation.presentation_event?.location) {
    elements.push({
      type: 'info-row',
      label: 'Location / Lugar:',
      value: formatLocationText(presentation.presentation_event.location),
    })
  }

  elements.push({
    type: 'info-row',
    label: 'Baptism Status / Estado de Bautismo:',
    value: presentation.is_baptized ? 'Baptized / Bautizado/a' : 'Not yet baptized / Aún no bautizado/a',
  })

  if (presentation.note) {
    elements.push({
      type: 'info-row',
      label: 'Notes / Notas:',
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
 * Build liturgy section with complete bilingual ceremony script
 */
function buildLiturgySection(presentation: PresentationWithRelations): ContentSection {
  // Get names using helpers
  const childName = getChildNameBilingual(presentation)
  const motherName = getMotherNameBilingual(presentation)
  const fatherName = getFatherNameBilingual(presentation)
  const baptized = isBaptized(presentation)

  // Helper functions for gendered text
  const genderedEn = (maleText: string, femaleText: string) => {
    return gendered(presentation, maleText, femaleText)
  }

  const genderedEs = (maleText: string, femaleText: string) => {
    return gendered(presentation, maleText, femaleText)
  }

  // Build liturgy elements
  const liturgyElements: ContentElement[] = []

  // After the Homily
  liturgyElements.push({
    type: 'section-title',
    text: 'After the Homily / Después de la Homilía',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Celebrant invitation - English
  liturgyElements.push({
    type: 'priest-dialogue',
    text: `Life is God's greatest gift to us. Grateful for the life of their ${genderedEn('son', 'daughter')}, ${motherName} and ${fatherName} would like to present their ${genderedEn('son', 'daughter')} ${childName} to the Lord and to this community. We welcome you here to the front of the church.`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Celebrant invitation - Spanish
  liturgyElements.push({
    type: 'priest-dialogue',
    text: `La vida es el mayor regalo de Dios para nosotros. Agradecidos por la vida de su ${genderedEs('hijo', 'hija')}, ${motherName} y ${fatherName} quisieran presentar a su ${genderedEs('hijo', 'hija')} ${childName} al Señor y a esta comunidad. Les damos la bienvenida aquí al frente de la iglesia.`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  liturgyElements.push({
    type: 'rubric',
    text: 'Walk to the front of the altar / Caminar al frente del altar',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Commitment question - English
  liturgyElements.push({
    type: 'priest-dialogue',
    text: `(to the parents) By presenting this ${genderedEn('boy', 'girl')} to the Lord and to this community today, you ${baptized ? 'renew your commitment' : 'commit yourselves'} to raise ${genderedEn('him', 'her')} in the ways of faith. Do you understand and accept this responsibility?`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Commitment question - Spanish
  liturgyElements.push({
    type: 'priest-dialogue',
    text: `(a los padres) Al presentar a ${genderedEs('este niño', 'esta niña')} al Señor y a esta comunidad hoy, ${baptized ? 'renuevan su compromiso' : 'se comprometen'} a ${genderedEs('criarlo', 'criarla')} en los caminos de la fe. ¿Entienden y aceptan esta responsabilidad?`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Parents' response - Bilingual
  liturgyElements.push({
    type: 'response',
    label: 'PARENTS / PADRES:',
    text: 'Yes, we do. / Sí, aceptamos.',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Sign of the cross - English
  liturgyElements.push({
    type: 'priest-dialogue',
    text: `(to the ${genderedEn('boy', 'girl')}) ${baptized ? 'As on the day of your baptism, I' : 'I'} sign you with the sign of the cross, and I ask your parents to do the same.`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Sign of the cross - Spanish
  liturgyElements.push({
    type: 'priest-dialogue',
    text: `(${genderedEs('al niño', 'a la niña')}) ${baptized ? 'Como el día de tu bautismo, te' : 'Te'} signo con la señal de la cruz, y pido a tus padres que hagan lo mismo.`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  liturgyElements.push({
    type: 'rubric',
    text: 'Celebrant and parents sign the child with the cross / El celebrante y los padres hacen la señal de la cruz',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Prayer - English
  liturgyElements.push({
    type: 'priest-text',
    text: `Heavenly Father, you are the giver of all life. You gave us this ${genderedEn('son', 'daughter')} and we present ${genderedEn('him', 'her')} to you, as Mary presented Jesus in the temple. We pray for these parents. Bless them in their efforts to raise this ${genderedEn('boy', 'girl')} as a good Christian and as a good Catholic. Bless this child. Give ${genderedEn('him', 'her')} good health, protect ${genderedEn('him', 'her')} from any danger of body and spirit, and help ${genderedEn('him', 'her')} to grow in age and in wisdom, always in your presence.`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Prayer - Spanish
  liturgyElements.push({
    type: 'priest-text',
    text: `Padre celestial, tú eres el dador de toda vida. Nos diste ${genderedEs('este hijo', 'esta hija')} y ${genderedEs('lo', 'la')} presentamos a ti, como María presentó a Jesús en el templo. Oramos por estos padres. Bendícelos en sus esfuerzos por criar a ${genderedEs('este niño', 'esta niña')} como ${genderedEs('un buen cristiano y un buen católico', 'una buena cristiana y una buena católica')}. Bendice a ${genderedEs('este niño', 'esta niña')}. Dale buena salud, ${genderedEs('protégelo', 'protégela')} de todo peligro del cuerpo y del espíritu, y ayúda${genderedEs('lo', 'la')} a crecer en edad y en sabiduría, siempre en tu presencia.`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Prayer to Mary - English
  liturgyElements.push({
    type: 'text',
    text: `Holy Mary, Mother of God and our Mother, we ask your protection over this family and over this ${genderedEn('son', 'daughter')}. It is by following your example that this family brings this ${genderedEn('boy', 'girl')} to be presented to God, our creator, and to this community today. Help these parents to raise this child with word and example.`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Prayer to Mary - Spanish
  liturgyElements.push({
    type: 'text',
    text: `Santa María, Madre de Dios y Madre nuestra, pedimos tu protección sobre esta familia y sobre ${genderedEs('este hijo', 'esta hija')}. Es siguiendo tu ejemplo que esta familia trae a ${genderedEs('este niño', 'esta niña')} para ser ${genderedEs('presentado', 'presentada')} a Dios, nuestro creador, y a esta comunidad hoy. Ayuda a estos padres a criar a ${genderedEs('este niño', 'esta niña')} con palabra y ejemplo.`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  liturgyElements.push({
    type: 'text',
    text: 'We make our prayer in the name of Jesus Christ, who is Lord forever and ever. / Hacemos nuestra oración en el nombre de Jesucristo, que es Señor por los siglos de los siglos.',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Assembly response - Bilingual
  liturgyElements.push({
    type: 'response',
    label: 'ASSEMBLY / ASAMBLEA:',
    text: 'Amen. / Amén.',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Blessing of religious articles
  liturgyElements.push({
    type: 'rubric',
    text: 'Bless religious articles / Bendecir artículos religiosos',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Dismissal - Bilingual
  liturgyElements.push({
    type: 'priest-dialogue',
    text: 'Now we send you back to your places, as we show you our support with applause. / Ahora los enviamos de regreso a sus lugares, mientras les mostramos nuestro apoyo con un aplauso.',
  })

  return {
    id: 'liturgy',
    elements: liturgyElements,
  }
}

/**
 * Build complete presentation liturgy document (Bilingual)
 */
export function buildBilingual(presentation: PresentationWithRelations): LiturgyDocument {
  // Calculate title and subtitle
  const childName = getChildNameBilingual(presentation)
  const title = `Presentation in the Temple / Presentación en el Templo - ${childName}`
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
    language: 'both',
    template: 'presentation-bilingual',
    title,
    subtitle,
    sections,
  }
}
