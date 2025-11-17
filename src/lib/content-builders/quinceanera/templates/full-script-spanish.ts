/**
 * Quinceañera Full Script (Spanish) Template
 *
 * Complete quinceañera liturgy with all readings, responses, and directions in Spanish
 */

import { QuinceaneraWithRelations } from '@/lib/actions/quinceaneras'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatPersonWithPhone, formatEventDateTime, formatLocationWithAddress } from '@/lib/utils/formatters'
import {
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
  buildAnnouncementsSection,
} from '@/lib/content-builders/shared/script-sections'
import {
  getReadingPericope,
  buildTitleSpanish,
  getEventSubtitleSpanish,
} from '../helpers'

/**
 * Build summary section (quinceañera celebration info) in Spanish
 */
function buildSummarySection(quinceanera: QuinceaneraWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Quinceañera Celebration subsection
  elements.push({
    type: 'section-title',
    text: 'Celebración de Quinceañera',
  })

  if (quinceanera.quinceanera) {
    elements.push({
      type: 'info-row',
      label: 'Quinceañera:',
      value: formatPersonName(quinceanera.quinceanera),
    })
  }

  if (quinceanera.family_contact) {
    elements.push({
      type: 'info-row',
      label: 'Contacto Familiar:',
      value: formatPersonWithPhone(quinceanera.family_contact),
    })
  }

  if (quinceanera.coordinator) {
    elements.push({
      type: 'info-row',
      label: 'Coordinador(a):',
      value: formatPersonName(quinceanera.coordinator),
    })
  }

  if (quinceanera.presider) {
    elements.push({
      type: 'info-row',
      label: 'Celebrante:',
      value: formatPersonName(quinceanera.presider),
    })
  }

  if (quinceanera.homilist) {
    elements.push({
      type: 'info-row',
      label: 'Homilista:',
      value: formatPersonName(quinceanera.homilist),
    })
  }

  if (quinceanera.lead_musician) {
    elements.push({
      type: 'info-row',
      label: 'Músico Principal:',
      value: formatPersonName(quinceanera.lead_musician),
    })
  }

  if (quinceanera.cantor) {
    elements.push({
      type: 'info-row',
      label: 'Cantor(a):',
      value: formatPersonName(quinceanera.cantor),
    })
  }

  if (quinceanera.quinceanera_event?.location) {
    elements.push({
      type: 'info-row',
      label: 'Lugar de la Celebración:',
      value: formatLocationWithAddress(quinceanera.quinceanera_event.location),
    })
  }

  if (quinceanera.quinceanera_event?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Fecha y Hora de la Celebración:',
      value: formatEventDateTime(quinceanera.quinceanera_event),
    })
  }

  if (quinceanera.quinceanera_reception?.location) {
    elements.push({
      type: 'info-row',
      label: 'Lugar de la Recepción:',
      value: formatLocationWithAddress(quinceanera.quinceanera_reception.location),
    })
  }

  if (quinceanera.note) {
    elements.push({
      type: 'info-row',
      label: 'Nota:',
      value: quinceanera.note,
    })
  }

  // Sacred Liturgy subsection - only show if there are readings/petitions
  const petitionsReader = quinceanera.petitions_read_by_second_reader && quinceanera.second_reader
    ? formatPersonName(quinceanera.second_reader)
    : quinceanera.petition_reader
    ? formatPersonName(quinceanera.petition_reader)
    : ''
  const hasLiturgyContent = quinceanera.first_reading || quinceanera.first_reader ||
    quinceanera.psalm || quinceanera.psalm_reader || quinceanera.psalm_is_sung ||
    quinceanera.second_reading || quinceanera.second_reader ||
    quinceanera.gospel_reading || petitionsReader

  if (hasLiturgyContent) {
    elements.push({
      type: 'section-title',
      text: 'Sagrada Liturgia',
    })
  }

  if (quinceanera.first_reading) {
    elements.push({
      type: 'info-row',
      label: 'Primera Lectura:',
      value: getReadingPericope(quinceanera.first_reading),
    })
  }

  if (quinceanera.first_reader) {
    elements.push({
      type: 'info-row',
      label: 'Lector de la Primera Lectura:',
      value: formatPersonName(quinceanera.first_reader),
    })
  }

  if (quinceanera.psalm) {
    elements.push({
      type: 'info-row',
      label: 'Salmo:',
      value: getReadingPericope(quinceanera.psalm),
    })
  }

  if (quinceanera.psalm_is_sung) {
    elements.push({
      type: 'info-row',
      label: 'Elección del Salmo:',
      value: 'Cantado',
    })
  } else if (quinceanera.psalm_reader) {
    elements.push({
      type: 'info-row',
      label: 'Lector del Salmo:',
      value: formatPersonName(quinceanera.psalm_reader),
    })
  }

  if (quinceanera.second_reading) {
    elements.push({
      type: 'info-row',
      label: 'Segunda Lectura:',
      value: getReadingPericope(quinceanera.second_reading),
    })
  }

  if (quinceanera.second_reader) {
    elements.push({
      type: 'info-row',
      label: 'Lector de la Segunda Lectura:',
      value: formatPersonName(quinceanera.second_reader),
    })
  }

  if (quinceanera.gospel_reading) {
    elements.push({
      type: 'info-row',
      label: 'Lectura del Evangelio:',
      value: getReadingPericope(quinceanera.gospel_reading),
    })
  }

  if (petitionsReader) {
    elements.push({
      type: 'info-row',
      label: 'Peticiones Leídas Por:',
      value: petitionsReader,
    })
  }

  return {
    id: 'summary',
    pageBreakAfter: true,
    elements,
  }
}

/**
 * Build full quinceañera script (Spanish)
 */
export function buildFullScriptSpanish(quinceanera: QuinceaneraWithRelations): LiturgyDocument {
  const quinceaneraTitle = buildTitleSpanish(quinceanera)
  const eventDateTime = getEventSubtitleSpanish(quinceanera)

  const sections: ContentSection[] = []

  // Add summary section (title/subtitle handled at document level)
  sections.push(buildSummarySection(quinceanera))

  // Add all reading sections (only if they exist)
  const firstReadingSection = buildReadingSection({
    id: 'first-reading',
    title: 'LITURGIA DE LA PALABRA',
    reading: quinceanera.first_reading,
    reader: quinceanera.first_reader,
    responseText: 'Te alabamos, Señor.',
  })
  if (firstReadingSection) {
    sections.push(firstReadingSection)
  }

  const psalmSection = buildPsalmSection({
    psalm: quinceanera.psalm,
    psalm_reader: quinceanera.psalm_reader,
    psalm_is_sung: quinceanera.psalm_is_sung,
  })
  if (psalmSection) {
    sections.push(psalmSection)
  }

  const secondReadingSection = buildReadingSection({
    id: 'second-reading',
    title: 'SEGUNDA LECTURA',
    reading: quinceanera.second_reading,
    reader: quinceanera.second_reader,
    responseText: 'Te alabamos, Señor.',
    pageBreakBefore: !!quinceanera.second_reading,
  })
  if (secondReadingSection) {
    sections.push(secondReadingSection)
  }

  const gospelSection = buildReadingSection({
    id: 'gospel',
    title: 'EVANGELIO',
    reading: quinceanera.gospel_reading,
    reader: quinceanera.presider,
    includeGospelAcclamations: true,
    pageBreakBefore: !!quinceanera.gospel_reading,
  })
  if (gospelSection) {
    sections.push(gospelSection)
  }

  // Add ceremony sections (between Gospel and Petitions)
  const quinceaneraName = quinceanera.quinceanera ? formatPersonName(quinceanera.quinceanera) : 'N.'

  // Renewal of Baptismal Promises
  sections.push({
    id: 'renewal-of-promises',
    pageBreakBefore: true,
    elements: [
      {
        type: 'section-title',
        text: 'RENOVACIÓN DE LAS PROMESAS BAUTISMALES',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'El sacerdote se dirige a la quinceañera:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'presider-dialogue',
        label: 'CELEBRANTE:',
        text: `${quinceaneraName}, ¿renuncias a Satanás, a todas sus obras y a todas sus seducciones?`,
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response-dialogue',
        label: 'QUINCEAÑERA:',
        text: 'Sí, renuncio.',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'presider-dialogue',
        label: 'CELEBRANTE:',
        text: '¿Crees en Dios, Padre todopoderoso, Creador del cielo y de la tierra?',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response-dialogue',
        label: 'QUINCEAÑERA:',
        text: 'Sí, creo.',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'presider-dialogue',
        label: 'CELEBRANTE:',
        text: '¿Crees en Jesucristo, su único Hijo, nuestro Señor, que nació de la Virgen María, padeció y fue sepultado, resucitó de entre los muertos y está sentado a la derecha del Padre?',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response-dialogue',
        label: 'QUINCEAÑERA:',
        text: 'Sí, creo.',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'presider-dialogue',
        label: 'CELEBRANTE:',
        text: '¿Crees en el Espíritu Santo, en la santa Iglesia católica, en la comunión de los santos, en el perdón de los pecados, en la resurrección de los muertos y en la vida eterna?',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response-dialogue',
        label: 'QUINCEAÑERA:',
        text: 'Sí, creo.',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-text',
        text: 'Esta es nuestra fe. Esta es la fe de la Iglesia que nos gloriamos de profesar en Cristo Jesús, Señor nuestro.',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response-dialogue',
        label: 'TODOS:',
        text: 'Amén.',
      },
    ],
  })

  // Blessing of the Quinceañera
  sections.push({
    id: 'blessing',
    elements: [
      {
        type: 'section-title',
        text: 'BENDICIÓN DE LA QUINCEAÑERA',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'priest-text',
        text: `Señor Jesucristo, tú eres el camino, la verdad y la vida. Te pedimos que bendigas a ${quinceaneraName} al comenzar esta nueva etapa de su vida. Que siempre camine en tu camino, viva en tu verdad y comparta tu vida con quienes la rodean.

Concédele sabiduría para discernir tu voluntad, valor para seguir donde tú guíes, y amor para reflejar tu presencia a todos los que encuentre.

Protégela del mal, fortalécela en tiempos de prueba y llena su corazón de alegría mientras crece en la fe.

Te lo pedimos por Cristo nuestro Señor.`,
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response-dialogue',
        label: 'TODOS:',
        text: 'Amén.',
      },
    ],
  })

  // Presentation of Symbols
  sections.push({
    id: 'presentation-of-symbols',
    elements: [
      {
        type: 'section-title',
        text: 'PRESENTACIÓN DE SÍMBOLOS',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'El sacerdote puede bendecir y presentar regalos simbólicos como una Biblia, rosario, cruz u otros artículos religiosos. Si se presenta una tiara o corona:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-text',
        text: `Esta corona es un símbolo de la dignidad que tienes como hija de Dios. Que siempre recuerdes que eres una hija del Rey del Cielo, llamada a vivir con gracia y virtud.`,
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'Si se presenta un anillo:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-text',
        text: `Este anillo es un símbolo del amor eterno de Dios por ti. Así como este círculo no tiene fin, el amor de Dios por ti no tiene límites. Úsalo como un recordatorio de tu compromiso de vivir como la amada hija de Dios.`,
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'Si se presenta una Biblia:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-text',
        text: `Esta Biblia es la Palabra de Dios. Que la leas a menudo, atesores sus enseñanzas en tu corazón y dejes que guíe tu vida. A través de las Escrituras, que llegues a conocer el amor de Dios más profundamente cada día.`,
      },
    ],
  })

  // Add petitions if present
  const petitionsSection = buildPetitionsSection({
    petitions: quinceanera.petitions,
    petition_reader: quinceanera.petition_reader,
    second_reader: quinceanera.second_reader,
    petitions_read_by_second_reader: quinceanera.petitions_read_by_second_reader,
  })
  if (petitionsSection) {
    sections.push(petitionsSection)
  }

  // Add Act of Thanksgiving and Personal Commitment
  // Note: No pageBreakBefore needed - petitions section already has pageBreakAfter
  sections.push({
    id: 'act-of-thanksgiving',
    elements: [
      {
        type: 'section-title',
        text: 'Acto de Acción de Gracias y Compromiso Personal',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'Antes de la bendición final, el sacerdote invita a la quinceañera a hacer un acto de acción de gracias y de compromiso personal para llevar una vida cristiana. La quinceañera puede hacerlo con estas o similares palabras:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'prayer-text',
        text: `Padre celestial,
te doy gracias por el don de la vida,
por crearme a tu imagen y semejanza
y por llamarme a ser tu hija por medio del bautismo.

Gracias por enviar a tu Hijo Jesús para salvarme
y a tu Espíritu Santo para santificarme.

A lo que en tu bondad y amor
quieras para mí, digo "sí".
Con tu gracia me comprometo
a servir a mis hermanos y hermanas toda mi vida.

María, Madre de Jesús y Madre nuestra,
me dedico a ti.
Ya que tú eres mi modelo de fe,
ayúdame a seguir aprendiendo de ti lo que necesito
para ser una mujer cristiana.

Ayúdame a escuchar la Palabra de Dios como tú lo hiciste,
guardándola en mi corazón y amando a los demás,
para que, mientras camino con Jesús en esta vida,
pueda adorarlo contigo en la eternidad.

Amén.`,
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'El sacerdote responde:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-text',
        text: `${quinceanera.quinceanera ? formatPersonName(quinceanera.quinceanera) : 'N.'}, que Dios, que ha comenzado esta buena obra en ti, la lleve a su cumplimiento.`,
      },
    ],
  })

  // Add announcements if present
  const announcementsSection = buildAnnouncementsSection(quinceanera.announcements)
  if (announcementsSection) {
    sections.push(announcementsSection)
  }

  return {
    id: quinceanera.id,
    type: 'quinceanera',
    language: 'es',
    template: 'quinceanera-full-script-spanish',
    title: quinceaneraTitle,
    subtitle: eventDateTime,
    sections,
  }
}
