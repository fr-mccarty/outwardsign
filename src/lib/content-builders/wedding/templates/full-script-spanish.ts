/**
 * Wedding Full Script (Spanish) Template
 *
 * Complete wedding liturgy with all readings, responses, and directions in Spanish
 */

import { WeddingWithRelations } from '@/lib/actions/weddings'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatPersonWithPhone, formatEventDateTime } from '@/lib/utils/formatters'
import {
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
  buildAnnouncementsSection,
} from '@/lib/content-builders/shared/script-sections'

/**
 * Build summary section (rehearsal, wedding info, sacred liturgy info) in Spanish
 */
function buildSummarySection(wedding: WeddingWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Rehearsal subsection
  if (wedding.rehearsal_event || wedding.rehearsal_dinner_event) {
    elements.push({
      type: 'section-title',
      text: 'Ensayo',
    })

    if (wedding.rehearsal_event?.start_date) {
      elements.push({
        type: 'info-row',
        label: 'Fecha y Hora del Ensayo:',
        value: formatEventDateTime(wedding.rehearsal_event),
      })
    }

    if (wedding.rehearsal_event?.location) {
      elements.push({
        type: 'info-row',
        label: 'Lugar del Ensayo:',
        value: wedding.rehearsal_event.location,
      })
    }

    if (wedding.rehearsal_dinner_event?.location) {
      elements.push({
        type: 'info-row',
        label: 'Lugar de la Cena del Ensayo:',
        value: wedding.rehearsal_dinner_event.location,
      })
    }
  }

  // Wedding subsection
  elements.push({
    type: 'section-title',
    text: 'Boda',
  })

  if (wedding.bride) {
    elements.push({
      type: 'info-row',
      label: 'Novia:',
      value: formatPersonWithPhone(wedding.bride),
    })
  }

  if (wedding.groom) {
    elements.push({
      type: 'info-row',
      label: 'Novio:',
      value: formatPersonWithPhone(wedding.groom),
    })
  }

  if (wedding.coordinator) {
    elements.push({
      type: 'info-row',
      label: 'Coordinador(a):',
      value: formatPersonName(wedding.coordinator),
    })
  }

  if (wedding.presider) {
    elements.push({
      type: 'info-row',
      label: 'Celebrante:',
      value: formatPersonName(wedding.presider),
    })
  }

  if (wedding.lead_musician) {
    elements.push({
      type: 'info-row',
      label: 'Músico Principal:',
      value: formatPersonName(wedding.lead_musician),
    })
  }

  if (wedding.wedding_event?.location) {
    elements.push({
      type: 'info-row',
      label: 'Lugar de la Boda:',
      value: wedding.wedding_event.location,
    })
  }

  if (wedding.reception_event?.location) {
    elements.push({
      type: 'info-row',
      label: 'Lugar de la Recepción:',
      value: wedding.reception_event.location,
    })
  }

  if (wedding.witness_1) {
    elements.push({
      type: 'info-row',
      label: 'Testigo Principal:',
      value: formatPersonName(wedding.witness_1),
    })
  }

  if (wedding.witness_2) {
    elements.push({
      type: 'info-row',
      label: 'Dama de Honor:',
      value: formatPersonName(wedding.witness_2),
    })
  }

  if (wedding.notes) {
    elements.push({
      type: 'info-row',
      label: 'Nota de la Boda:',
      value: wedding.notes,
    })
  }

  // Sacred Liturgy subsection
  elements.push({
    type: 'section-title',
    text: 'Sagrada Liturgia',
  })

  if (wedding.first_reading) {
    elements.push({
      type: 'info-row',
      label: 'Primera Lectura:',
      value: wedding.first_reading.pericope || '',
    })
  }

  if (wedding.first_reader) {
    elements.push({
      type: 'info-row',
      label: 'Lector de la Primera Lectura:',
      value: formatPersonName(wedding.first_reader),
    })
  }

  if (wedding.psalm) {
    elements.push({
      type: 'info-row',
      label: 'Salmo:',
      value: wedding.psalm.pericope || '',
    })
  }

  if (wedding.psalm_is_sung) {
    elements.push({
      type: 'info-row',
      label: 'Opción del Salmo:',
      value: 'Cantado',
    })
  } else if (wedding.psalm_reader) {
    elements.push({
      type: 'info-row',
      label: 'Lector del Salmo:',
      value: formatPersonName(wedding.psalm_reader),
    })
  }

  if (wedding.second_reading) {
    elements.push({
      type: 'info-row',
      label: 'Segunda Lectura:',
      value: wedding.second_reading.pericope || '',
    })
  }

  if (wedding.second_reader) {
    elements.push({
      type: 'info-row',
      label: 'Lector de la Segunda Lectura:',
      value: formatPersonName(wedding.second_reader),
    })
  }

  if (wedding.gospel_reading) {
    elements.push({
      type: 'info-row',
      label: 'Lectura del Evangelio:',
      value: wedding.gospel_reading.pericope || '',
    })
  }

  // Determine petition reader
  const petitionsReader = wedding.petitions_read_by_second_reader && wedding.second_reader
    ? formatPersonName(wedding.second_reader)
    : wedding.petition_reader
    ? formatPersonName(wedding.petition_reader)
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
 * Build full wedding script (Spanish)
 */
export function buildFullScriptSpanish(wedding: WeddingWithRelations): LiturgyDocument {
  const weddingTitle =
    wedding.bride && wedding.groom
      ? `${wedding.bride.first_name} ${wedding.bride.last_name} & ${wedding.groom.first_name} ${wedding.groom.last_name}`
      : 'Boda'

  const eventDateTime =
    wedding.wedding_event?.start_date && wedding.wedding_event?.start_time
      ? formatEventDateTime(wedding.wedding_event)
      : 'Falta Fecha y Hora'

  const sections: ContentSection[] = []

  // Add header to summary section
  const summarySection = buildSummarySection(wedding)
  summarySection.elements.unshift(
    {
      type: 'event-title',
      text: weddingTitle,
      alignment: 'center',
    },
    {
      type: 'event-datetime',
      text: eventDateTime,
      alignment: 'center',
    }
  )
  sections.push(summarySection)

  // Add all reading sections
  sections.push(
    buildReadingSection({
      id: 'first-reading',
      title: 'PRIMERA LECTURA',
      reading: wedding.first_reading,
      reader: wedding.first_reader,
      showNoneSelected: true,
    })
  )

  sections.push(
    buildPsalmSection({
      psalm: wedding.psalm,
      psalm_reader: wedding.psalm_reader,
      psalm_is_sung: wedding.psalm_is_sung,
    })
  )

  sections.push(
    buildReadingSection({
      id: 'second-reading',
      title: 'SEGUNDA LECTURA',
      reading: wedding.second_reading,
      reader: wedding.second_reader,
      pageBreakBefore: !!wedding.second_reading,
    })
  )

  sections.push(
    buildReadingSection({
      id: 'gospel',
      title: 'EVANGELIO',
      reading: wedding.gospel_reading,
      includeGospelDialogue: false,
      pageBreakBefore: !!wedding.gospel_reading,
    })
  )

  // Add petitions
  const petitionsSection = buildPetitionsSection({
    petitions: wedding.petitions,
    petition_reader: wedding.petition_reader,
    second_reader: wedding.second_reader,
    petitions_read_by_second_reader: wedding.petitions_read_by_second_reader,
  })
  if (petitionsSection) {
    sections.push(petitionsSection)
  }

  // Add announcements if present
  const announcementsSection = buildAnnouncementsSection(wedding.announcements)
  if (announcementsSection) {
    sections.push(announcementsSection)
  }

  return {
    id: wedding.id,
    type: 'wedding',
    language: 'es',
    template: 'wedding-full-script-spanish',
    title: weddingTitle,
    subtitle: eventDateTime,
    sections,
  }
}
