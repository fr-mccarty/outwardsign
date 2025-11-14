/**
 * Funeral Full Script (Spanish) Template
 *
 * Complete funeral liturgy with all readings, responses, and directions in Spanish
 */

import { FuneralWithRelations } from '@/lib/actions/funerals'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatPersonWithPhone, formatEventDateTime } from '@/lib/utils/formatters'
import {
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
  buildAnnouncementsSection,
} from '@/lib/content-builders/shared/script-sections'
import { formatLocationText } from '../helpers'

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
      value: formatLocationText(funeral.funeral_event.location),
    })
  }

  if (funeral.funeral_event?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Fecha y Hora del Servicio:',
      value: formatEventDateTime(funeral.funeral_event),
    })
  }

  // Liturgical Roles subsection
  elements.push({
    type: 'section-title',
    text: 'Roles Litúrgicos',
  })

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
  // Build funeral title
  const funeralTitle = funeral.deceased
    ? `Liturgia Fúnebre de ${formatPersonName(funeral.deceased)}`
    : 'Liturgia Fúnebre'

  const eventDateTime =
    funeral.funeral_event?.start_date && funeral.funeral_event?.start_time
      ? formatEventDateTime(funeral.funeral_event)
      : 'Falta Fecha y Hora'

  const sections: ContentSection[] = []

  // Add header to summary section
  const summarySection = buildSummarySection(funeral)
  summarySection.elements.unshift(
    {
      type: 'event-title',
      text: funeralTitle,
    },
    {
      type: 'event-datetime',
      text: eventDateTime,
    }
  )
  sections.push(summarySection)

  // Add all reading sections
  sections.push(
    buildReadingSection({
      id: 'first-reading',
      title: 'LITURGIA DE LA PALABRA',
      reading: funeral.first_reading,
      reader: funeral.first_reader,
      responseText: 'Te alabamos, Señor.',
      showNoneSelected: true,
    })
  )

  sections.push(
    buildPsalmSection({
      psalm: funeral.psalm,
      psalm_reader: funeral.psalm_reader,
      psalm_is_sung: funeral.psalm_is_sung,
    })
  )

  sections.push(
    buildReadingSection({
      id: 'second-reading',
      title: 'SEGUNDA LECTURA',
      reading: funeral.second_reading,
      reader: funeral.second_reader,
      responseText: 'Te alabamos, Señor.',
      pageBreakBefore: !!funeral.second_reading,
    })
  )

  sections.push(
    buildReadingSection({
      id: 'gospel',
      title: 'EVANGELIO',
      reading: funeral.gospel_reading,
      reader: funeral.presider,
      includeGospelAcclamations: true,
      pageBreakBefore: !!funeral.gospel_reading,
    })
  )

  // Add petitions if present
  const petitionsSection = buildPetitionsSection({
    petitions: funeral.petitions,
    petition_reader: funeral.petition_reader,
    second_reader: funeral.second_reader,
    petitions_read_by_second_reader: funeral.petitions_read_by_second_reader,
  })
  if (petitionsSection) {
    sections.push(petitionsSection)
  }

  // Add announcements if present
  const announcementsSection = buildAnnouncementsSection(funeral.announcements)
  if (announcementsSection) {
    sections.push(announcementsSection)
  }

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
