/**
 * Wedding Full Script (English) Template
 *
 * Complete wedding liturgy with all readings, responses, and directions
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
import {
  hasRehearsalEvents,
  formatLocationText,
  getReadingPericope,
  getPetitionsReaderName,
} from '../helpers'

/**
 * Build summary section (rehearsal, wedding info, sacred liturgy info)
 */
function buildSummarySection(wedding: WeddingWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Rehearsal subsection
  if (hasRehearsalEvents(wedding)) {
    elements.push({
      type: 'section-title',
      text: 'Rehearsal',
    })

    if (wedding.rehearsal_event?.start_date) {
      elements.push({
        type: 'info-row',
        label: 'Rehearsal Date & Time:',
        value: formatEventDateTime(wedding.rehearsal_event),
      })
    }

    if (wedding.rehearsal_event?.location) {
      elements.push({
        type: 'info-row',
        label: 'Rehearsal Location:',
        value: formatLocationText(wedding.rehearsal_event.location),
      })
    }

    if (wedding.rehearsal_dinner_event?.location) {
      elements.push({
        type: 'info-row',
        label: 'Rehearsal Dinner Location:',
        value: formatLocationText(wedding.rehearsal_dinner_event.location),
      })
    }
  }

  // Wedding subsection
  elements.push({
    type: 'section-title',
    text: 'Wedding',
  })

  if (wedding.bride) {
    elements.push({
      type: 'info-row',
      label: 'Bride:',
      value: formatPersonWithPhone(wedding.bride),
    })
  }

  if (wedding.groom) {
    elements.push({
      type: 'info-row',
      label: 'Groom:',
      value: formatPersonWithPhone(wedding.groom),
    })
  }

  if (wedding.coordinator) {
    elements.push({
      type: 'info-row',
      label: 'Coordinator:',
      value: formatPersonName(wedding.coordinator),
    })
  }

  if (wedding.presider) {
    elements.push({
      type: 'info-row',
      label: 'Presider:',
      value: formatPersonName(wedding.presider),
    })
  }

  if (wedding.lead_musician) {
    elements.push({
      type: 'info-row',
      label: 'Lead Musician:',
      value: formatPersonName(wedding.lead_musician),
    })
  }

  if (wedding.wedding_event?.location) {
    elements.push({
      type: 'info-row',
      label: 'Wedding Location:',
      value: formatLocationText(wedding.wedding_event.location),
    })
  }

  if (wedding.reception_event?.location) {
    elements.push({
      type: 'info-row',
      label: 'Reception Location:',
      value: formatLocationText(wedding.reception_event.location),
    })
  }

  if (wedding.witness_1) {
    elements.push({
      type: 'info-row',
      label: 'Best Man:',
      value: formatPersonName(wedding.witness_1),
    })
  }

  if (wedding.witness_2) {
    elements.push({
      type: 'info-row',
      label: 'Maid/Matron of Honor:',
      value: formatPersonName(wedding.witness_2),
    })
  }

  if (wedding.notes) {
    elements.push({
      type: 'info-row',
      label: 'Wedding Note:',
      value: wedding.notes,
    })
  }

  // Sacred Liturgy subsection
  elements.push({
    type: 'section-title',
    text: 'Sacred Liturgy',
  })

  if (wedding.first_reading) {
    elements.push({
      type: 'info-row',
      label: 'First Reading:',
      value: getReadingPericope(wedding.first_reading),
    })
  }

  if (wedding.first_reader) {
    elements.push({
      type: 'info-row',
      label: 'First Reading Lector:',
      value: formatPersonName(wedding.first_reader),
    })
  }

  if (wedding.psalm) {
    elements.push({
      type: 'info-row',
      label: 'Psalm:',
      value: getReadingPericope(wedding.psalm),
    })
  }

  if (wedding.psalm_is_sung) {
    elements.push({
      type: 'info-row',
      label: 'Psalm Choice:',
      value: 'Sung',
    })
  } else if (wedding.psalm_reader) {
    elements.push({
      type: 'info-row',
      label: 'Psalm Lector:',
      value: formatPersonName(wedding.psalm_reader),
    })
  }

  if (wedding.second_reading) {
    elements.push({
      type: 'info-row',
      label: 'Second Reading:',
      value: getReadingPericope(wedding.second_reading),
    })
  }

  if (wedding.second_reader) {
    elements.push({
      type: 'info-row',
      label: 'Second Reading Lector:',
      value: formatPersonName(wedding.second_reader),
    })
  }

  if (wedding.gospel_reading) {
    elements.push({
      type: 'info-row',
      label: 'Gospel Reading:',
      value: getReadingPericope(wedding.gospel_reading),
    })
  }

  // Determine petition reader
  const petitionsReader = getPetitionsReaderName(wedding)

  if (petitionsReader) {
    elements.push({
      type: 'info-row',
      label: 'Petitions Read By:',
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
 * Build full wedding script (English)
 */
export function buildFullScriptEnglish(wedding: WeddingWithRelations): LiturgyDocument {
  const weddingTitle =
    wedding.bride && wedding.groom
      ? `${wedding.bride.first_name} ${wedding.bride.last_name} & ${wedding.groom.first_name} ${wedding.groom.last_name}`
      : 'Wedding'

  const eventDateTime =
    wedding.wedding_event?.start_date && wedding.wedding_event?.start_time
      ? formatEventDateTime(wedding.wedding_event)
      : 'Missing Date and Time'

  const sections: ContentSection[] = []

  // Add header to summary section
  const summarySection = buildSummarySection(wedding)
  summarySection.elements.unshift(
    {
      type: 'event-title',
      text: weddingTitle,
    },
    {
      type: 'event-datetime',
      text: eventDateTime,
    }
  )
  sections.push(summarySection)

  // Add header before readings
  // sections.push({
  //   id: 'readings-header',
  //   elements: [
  //     {
  //       type: 'event-title',
  //       text: weddingTitle,
  //       alignment: 'center',
  //     },
  //     {
  //       type: 'event-datetime',
  //       text: eventDateTime,
  //       alignment: 'center',
  //     },
  //   ],
  // })

  // Add all reading sections
  sections.push(
    buildReadingSection({
      id: 'first-reading',
      title: 'FIRST READING',
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
      title: 'SECOND READING',
      reading: wedding.second_reading,
      reader: wedding.second_reader,
      pageBreakBefore: !!wedding.second_reading,
    })
  )

  sections.push(
    buildReadingSection({
      id: 'gospel',
      title: 'GOSPEL',
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
    language: 'en',
    template: 'wedding-full-script-english',
    title: weddingTitle,
    subtitle: eventDateTime,
    sections,
  }
}
