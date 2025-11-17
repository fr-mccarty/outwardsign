/**
 * Quinceañera Full Script (Spanish) Template
 *
 * Complete quinceañera liturgy with all readings, responses, and directions in Spanish
 */

import { QuinceaneraWithRelations } from '@/lib/actions/quinceaneras'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatPersonWithPhone, formatEventDateTime } from '@/lib/utils/formatters'
import {
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
  buildAnnouncementsSection,
} from '@/lib/content-builders/shared/script-sections'
import { formatLocationText, getReadingPericope } from '../helpers'

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
      value: formatLocationText(quinceanera.quinceanera_event.location),
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
      value: formatLocationText(quinceanera.quinceanera_reception.location),
    })
  }

  if (quinceanera.note) {
    elements.push({
      type: 'info-row',
      label: 'Nota:',
      value: quinceanera.note,
    })
  }

  // Sacred Liturgy subsection
  elements.push({
    type: 'section-title',
    text: 'Sagrada Liturgia',
  })

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

  // Determine petition reader
  const petitionsReader = quinceanera.petitions_read_by_second_reader && quinceanera.second_reader
    ? formatPersonName(quinceanera.second_reader)
    : quinceanera.petition_reader
    ? formatPersonName(quinceanera.petition_reader)
    : ''

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
  const quinceaneraTitle = quinceanera.quinceanera
    ? `Celebración de Quinceañera para ${formatPersonName(quinceanera.quinceanera)}`
    : 'Celebración de Quinceañera'

  const eventDateTime =
    quinceanera.quinceanera_event?.start_date && quinceanera.quinceanera_event?.start_time
      ? formatEventDateTime(quinceanera.quinceanera_event)
      : 'Falta Fecha y Hora'

  const sections: ContentSection[] = []

  // Add header to summary section
  const summarySection = buildSummarySection(quinceanera)
  summarySection.elements.unshift(
    {
      type: 'event-title',
      text: quinceaneraTitle,
    },
    {
      type: 'event-datetime',
      text: eventDateTime,
    }
  )
  sections.push(summarySection)

  // Add all reading sections (only if they exist)
  const firstReadingSection = buildReadingSection({
    id: 'first-reading',
    title: 'LITURGIA DE LA PALABRA',
    reading: quinceanera.first_reading,
    reader: quinceanera.first_reader,
    responseText: 'Te alabamos, Señor.',
    showNoneSelected: true,
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
    title: 'Acto de Acción de Gracias y Compromiso Personal',
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
