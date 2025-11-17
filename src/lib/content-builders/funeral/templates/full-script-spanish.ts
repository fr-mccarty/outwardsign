/**
 * Funeral Full Script (Spanish) Template
 *
 * Complete funeral liturgy with all readings, responses, and directions in Spanish
 */

import { FuneralWithRelations } from '@/lib/actions/funerals'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatPersonWithPhone, formatEventDateTime, formatLocationWithAddress } from '@/lib/utils/formatters'
import {
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
  buildAnnouncementsSection,
} from '@/lib/content-builders/shared/script-sections'
import {
  buildTitleSpanish,
  getEventSubtitleSpanish,
} from '../helpers'

/**
 * Build summary section (funeral service info) in Spanish
 */
function buildSummarySection(funeral: FuneralWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Funeral Service subsection
  elements.push({
    type: 'section-title',
    text: 'Información del Servicio Fúnebre',
  })

  if (funeral.deceased) {
    elements.push({
      type: 'info-row',
      label: 'Difunto(a):',
      value: formatPersonName(funeral.deceased),
    })
  }

  if (funeral.family_contact) {
    elements.push({
      type: 'info-row',
      label: 'Contacto Familiar:',
      value: formatPersonWithPhone(funeral.family_contact),
    })
  }

  if (funeral.coordinator) {
    elements.push({
      type: 'info-row',
      label: 'Coordinador(a):',
      value: formatPersonName(funeral.coordinator),
    })
  }

  if (funeral.presider) {
    elements.push({
      type: 'info-row',
      label: 'Celebrante:',
      value: formatPersonName(funeral.presider),
    })
  }

  if (funeral.homilist) {
    elements.push({
      type: 'info-row',
      label: 'Homilista:',
      value: formatPersonName(funeral.homilist),
    })
  }

  if (funeral.lead_musician) {
    elements.push({
      type: 'info-row',
      label: 'Músico Principal:',
      value: formatPersonName(funeral.lead_musician),
    })
  }

  if (funeral.cantor) {
    elements.push({
      type: 'info-row',
      label: 'Cantor:',
      value: formatPersonName(funeral.cantor),
    })
  }

  if (funeral.funeral_event?.location) {
    elements.push({
      type: 'info-row',
      label: 'Lugar del Servicio:',
      value: formatLocationWithAddress(funeral.funeral_event.location),
    })
  }

  if (funeral.funeral_event?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Fecha y Hora del Servicio:',
      value: formatEventDateTime(funeral.funeral_event),
    })
  }

  // Liturgical Roles subsection - only show if there are roles assigned
  const hasLiturgicalRoles = funeral.first_reader || funeral.psalm_reader ||
    funeral.second_reader || funeral.gospel_reader ||
    funeral.petition_reader || funeral.petitions_read_by_second_reader

  if (hasLiturgicalRoles) {
    elements.push({
      type: 'section-title',
      text: 'Roles Litúrgicos',
    })
  }

  if (funeral.first_reader) {
    elements.push({
      type: 'info-row',
      label: 'Primer Lector:',
      value: formatPersonName(funeral.first_reader),
    })
  }

  if (funeral.psalm_reader) {
    elements.push({
      type: 'info-row',
      label: 'Lector del Salmo:',
      value: formatPersonName(funeral.psalm_reader),
    })
  }

  if (funeral.second_reader) {
    elements.push({
      type: 'info-row',
      label: 'Segundo Lector:',
      value: formatPersonName(funeral.second_reader),
    })
  }

  if (funeral.gospel_reader) {
    elements.push({
      type: 'info-row',
      label: 'Lector del Evangelio:',
      value: formatPersonName(funeral.gospel_reader),
    })
  }

  if (funeral.petition_reader) {
    elements.push({
      type: 'info-row',
      label: 'Lector de Peticiones:',
      value: formatPersonName(funeral.petition_reader),
    })
  } else if (funeral.petitions_read_by_second_reader) {
    elements.push({
      type: 'info-row',
      label: 'Lector de Peticiones:',
      value: 'Segundo Lector',
    })
  }

  return {
    id: 'summary',
    pageBreakAfter: true,
    elements,
  }
}

/**
 * Main builder function
 */
export function buildFullScriptSpanish(funeral: FuneralWithRelations): LiturgyDocument {
  // Build funeral title and subtitle using helpers
  const funeralTitle = buildTitleSpanish(funeral)
  const eventDateTime = getEventSubtitleSpanish(funeral)

  const sections: ContentSection[] = []

  // Build summary section first
  const summarySection = buildSummarySection(funeral)

  // Build all other sections (each checks individually if it has content)
  const firstReadingSection = buildReadingSection({
    id: 'first-reading',
    title: 'LITURGIA DE LA PALABRA',
    reading: funeral.first_reading,
    reader: funeral.first_reader,
    responseText: 'Te alabamos, Señor.',
  })

  const psalmSection = buildPsalmSection({
    psalm: funeral.psalm,
    psalm_reader: funeral.psalm_reader,
    psalm_is_sung: funeral.psalm_is_sung,
  })

  const secondReadingSection = buildReadingSection({
    id: 'second-reading',
    title: 'SEGUNDA LECTURA',
    reading: funeral.second_reading,
    reader: funeral.second_reader,
    responseText: 'Te alabamos, Señor.',
    pageBreakBefore: !!funeral.second_reading,
  })

  const gospelSection = buildReadingSection({
    id: 'gospel',
    title: 'EVANGELIO',
    reading: funeral.gospel_reading,
    reader: funeral.presider,
    includeGospelAcclamations: true,
    pageBreakBefore: !!funeral.gospel_reading,
  })

  // Build ceremony sections (Final Commendation)
  const ceremonySections: ContentSection[] = []

  const deceasedName = funeral.deceased ? formatPersonName(funeral.deceased) : 'N.'

  // Final Commendation
  ceremonySections.push({
    id: 'final-commendation',
    pageBreakBefore: true,
    elements: [
      {
        type: 'section-title',
        text: 'ÚLTIMA RECOMENDACIÓN',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'El sacerdote invita a los presentes a orar:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-dialogue',
        text: 'Antes de separarnos, despidámonos de nuestro hermano/hermana. Que nuestra despedida exprese nuestro afecto por él/ella; que alivie nuestra tristeza y fortalezca nuestra esperanza. Un día lo/la saludaremos con alegría cuando el amor de Cristo, que todo lo conquista, destruya incluso la muerte misma.',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'El sacerdote puede rociar el ataúd con agua bendita e incensarlo. Luego dice la oración de recomendación:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-text',
        text: `En tus manos, Padre de misericordia, encomendamos a nuestro hermano/hermana ${deceasedName}, con la firme esperanza de que, junto con todos los que han muerto en Cristo, resucitará con él en el último día.

Te damos gracias por las bendiciones que concediste a ${deceasedName} en esta vida: son para nosotros signos de tu bondad y de nuestra comunión con los santos en Cristo.

Señor misericordioso, vuélvete hacia nosotros y escucha nuestras oraciones: abre las puertas del paraíso a tu siervo/sierva y ayúdanos a los que permanecemos a consolarnos unos a otros con la seguridad de la fe, hasta que todos nos reunamos en Cristo y estemos contigo y con nuestro hermano/hermana para siempre.

Te lo pedimos por Cristo nuestro Señor.`,
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'TODOS:',
        text: 'Amén.',
      },
    ],
  })

  // Song of Farewell
  ceremonySections.push({
    id: 'song-of-farewell',
    elements: [
      {
        type: 'section-title',
        text: 'CANTO DE DESPEDIDA',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'Se puede cantar lo siguiente u otro canto apropiado:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'TODOS:',
        text: `Santos de Dios, venid en su ayuda,
¡Apresuraos a encontrarlo/encontrarla, ángeles del Señor!

Recibid su alma y presentadla a Dios Altísimo.

Que Cristo, que te llamó, te lleve consigo;
que los ángeles te conduzcan al seno de Abraham.

Recibid su alma y presentadla a Dios Altísimo.

Concédele, Señor, el descanso eterno,
y brille para él/ella la luz perpetua.

Recibid su alma y presentadla a Dios Altísimo.`,
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'priest-dialogue',
        text: 'En paz llevemos a nuestro hermano/hermana a su lugar de descanso.',
      },
    ],
  })

  // Procession to Place of Committal
  ceremonySections.push({
    id: 'procession',
    elements: [
      {
        type: 'section-title',
        text: 'PROCESIÓN AL LUGAR DE SEPULTURA',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'Se puede cantar lo siguiente u otro canto apropiado durante la procesión:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'prayer-text',
        text: `Que los ángeles te conduzcan al paraíso;
que los mártires vengan a recibirte
y te lleven a la ciudad santa,
la nueva y eterna Jerusalén.

Que coros de ángeles te den la bienvenida
y te conduzcan al seno de Abraham;
y donde Lázaro ya no es pobre
que encuentres el descanso eterno.`,
      },
    ],
  })

  const petitionsSection = buildPetitionsSection({
    petitions: funeral.petitions,
    petition_reader: funeral.petition_reader,
    second_reader: funeral.second_reader,
    petitions_read_by_second_reader: funeral.petitions_read_by_second_reader,
  })

  const announcementsSection = buildAnnouncementsSection(funeral.announcements)

  // Check if there are any sections after summary
  const hasFollowingSections = !!(
    firstReadingSection ||
    psalmSection ||
    secondReadingSection ||
    gospelSection ||
    ceremonySections.length > 0 ||
    petitionsSection ||
    announcementsSection
  )

  // Only add page break after summary if there are following sections
  summarySection.pageBreakAfter = hasFollowingSections

  // Add summary section
  sections.push(summarySection)

  // Add other sections (only non-null ones)
  if (firstReadingSection) sections.push(firstReadingSection)
  if (psalmSection) sections.push(psalmSection)
  if (secondReadingSection) sections.push(secondReadingSection)
  if (gospelSection) sections.push(gospelSection)

  // Add ceremony sections (between Gospel and Petitions)
  sections.push(...ceremonySections)

  if (petitionsSection) sections.push(petitionsSection)
  if (announcementsSection) sections.push(announcementsSection)

  return {
    id: funeral.id,
    type: 'funeral',
    language: 'es',
    template: 'funeral-full-script-spanish',
    title: funeralTitle,
    subtitle: eventDateTime,
    sections,
  }
}
