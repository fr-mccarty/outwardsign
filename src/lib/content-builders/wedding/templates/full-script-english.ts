/**
 * Wedding Full Script (English) Template
 *
 * Complete wedding liturgy with all readings, responses, and directions
 */

import { WeddingWithRelations } from '@/lib/actions/weddings'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatPersonWithPhone, formatEventDateTime, formatLocationWithAddress } from '@/lib/utils/formatters'
import {
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
  buildAnnouncementsSection,
} from '@/lib/content-builders/shared/script-sections'
import {
  hasRehearsalEvents,
  getReadingPericope,
  getPetitionsReaderName,
  buildTitleEnglish,
  getEventSubtitleEnglish,
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
        value: formatLocationWithAddress(wedding.rehearsal_event.location),
      })
    }

    if (wedding.rehearsal_dinner_event?.location) {
      elements.push({
        type: 'info-row',
        label: 'Rehearsal Dinner Location:',
        value: formatLocationWithAddress(wedding.rehearsal_dinner_event.location),
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
      value: formatLocationWithAddress(wedding.wedding_event.location),
    })
  }

  if (wedding.reception_event?.location) {
    elements.push({
      type: 'info-row',
      label: 'Reception Location:',
      value: formatLocationWithAddress(wedding.reception_event.location),
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

  // Sacred Liturgy subsection - only show if there are readings/petitions
  const petitionsReader = getPetitionsReaderName(wedding)
  const hasLiturgyContent = wedding.first_reading || wedding.first_reader ||
    wedding.psalm || wedding.psalm_reader || wedding.psalm_is_sung ||
    wedding.second_reading || wedding.second_reader ||
    wedding.gospel_reading || petitionsReader

  if (hasLiturgyContent) {
    elements.push({
      type: 'section-title',
      text: 'Sacred Liturgy',
    })
  }

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
  const weddingTitle = buildTitleEnglish(wedding)
  const eventDateTime = getEventSubtitleEnglish(wedding)

  const sections: ContentSection[] = []

  // Build summary section first
  const summarySection = buildSummarySection(wedding)

  // Build all other sections (each checks individually if it has content)
  const firstReadingSection = buildReadingSection({
    id: 'first-reading',
    title: 'FIRST READING',
    reading: wedding.first_reading,
    reader: wedding.first_reader,
  })

  const psalmSection = buildPsalmSection({
    psalm: wedding.psalm,
    psalm_reader: wedding.psalm_reader,
    psalm_is_sung: wedding.psalm_is_sung,
  })

  const secondReadingSection = buildReadingSection({
    id: 'second-reading',
    title: 'SECOND READING',
    reading: wedding.second_reading,
    reader: wedding.second_reader,
    pageBreakBefore: !!wedding.second_reading,
  })

  const gospelSection = buildReadingSection({
    id: 'gospel',
    title: 'GOSPEL',
    reading: wedding.gospel_reading,
    includeGospelDialogue: false,
    pageBreakBefore: !!wedding.gospel_reading,
  })

  const petitionsSection = buildPetitionsSection({
    petitions: wedding.petitions,
    petition_reader: wedding.petition_reader,
    second_reader: wedding.second_reader,
    petitions_read_by_second_reader: wedding.petitions_read_by_second_reader,
  })

  const announcementsSection = buildAnnouncementsSection(wedding.announcements)

  // Check if there are any sections after summary
  const hasFollowingSections = !!(
    firstReadingSection ||
    psalmSection ||
    secondReadingSection ||
    gospelSection ||
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
  if (petitionsSection) sections.push(petitionsSection)
  if (announcementsSection) sections.push(announcementsSection)

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
