/**
 * Funeral Full Script (English) Template
 *
 * Complete funeral liturgy with all readings, responses, and directions
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
  buildTitleEnglish,
  getEventSubtitleEnglish,
} from '../helpers'

/**
 * Build summary section (funeral service info)
 */
function buildSummarySection(funeral: FuneralWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Funeral Service subsection
  elements.push({
    type: 'section-title',
    text: 'Funeral Service Information',
  })

  if (funeral.deceased) {
    elements.push({
      type: 'info-row',
      label: 'Deceased:',
      value: formatPersonName(funeral.deceased),
    })
  }

  if (funeral.family_contact) {
    elements.push({
      type: 'info-row',
      label: 'Family Contact:',
      value: formatPersonWithPhone(funeral.family_contact),
    })
  }

  if (funeral.coordinator) {
    elements.push({
      type: 'info-row',
      label: 'Coordinator:',
      value: formatPersonName(funeral.coordinator),
    })
  }

  if (funeral.presider) {
    elements.push({
      type: 'info-row',
      label: 'Presider:',
      value: formatPersonName(funeral.presider),
    })
  }

  if (funeral.homilist) {
    elements.push({
      type: 'info-row',
      label: 'Homilist:',
      value: formatPersonName(funeral.homilist),
    })
  }

  if (funeral.lead_musician) {
    elements.push({
      type: 'info-row',
      label: 'Lead Musician:',
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
      label: 'Service Location:',
      value: formatLocationWithAddress(funeral.funeral_event.location),
    })
  }

  if (funeral.funeral_event?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Service Date & Time:',
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
      text: 'Liturgical Roles',
    })
  }

  if (funeral.first_reader) {
    elements.push({
      type: 'info-row',
      label: 'First Reader:',
      value: formatPersonName(funeral.first_reader),
    })
  }

  if (funeral.psalm_reader) {
    elements.push({
      type: 'info-row',
      label: 'Psalm Reader:',
      value: formatPersonName(funeral.psalm_reader),
    })
  }

  if (funeral.second_reader) {
    elements.push({
      type: 'info-row',
      label: 'Second Reader:',
      value: formatPersonName(funeral.second_reader),
    })
  }

  if (funeral.gospel_reader) {
    elements.push({
      type: 'info-row',
      label: 'Gospel Reader:',
      value: formatPersonName(funeral.gospel_reader),
    })
  }

  if (funeral.petition_reader) {
    elements.push({
      type: 'info-row',
      label: 'Petition Reader:',
      value: formatPersonName(funeral.petition_reader),
    })
  } else if (funeral.petitions_read_by_second_reader) {
    elements.push({
      type: 'info-row',
      label: 'Petition Reader:',
      value: 'Second Reader',
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
export function buildFullScriptEnglish(funeral: FuneralWithRelations): LiturgyDocument {
  // Build funeral title and subtitle using helpers
  const funeralTitle = buildTitleEnglish(funeral)
  const eventDateTime = getEventSubtitleEnglish(funeral)

  const sections: ContentSection[] = []

  // Build summary section first
  const summarySection = buildSummarySection(funeral)

  // Build all other sections (each checks individually if it has content)
  const firstReadingSection = buildReadingSection({
    id: 'first-reading',
    title: 'LITURGY OF THE WORD',
    reading: funeral.first_reading,
    reader: funeral.first_reader,
    responseText: 'Thanks be to God.',
  })

  const psalmSection = buildPsalmSection({
    psalm: funeral.psalm,
    psalm_reader: funeral.psalm_reader,
    psalm_is_sung: funeral.psalm_is_sung,
  })

  const secondReadingSection = buildReadingSection({
    id: 'second-reading',
    title: 'SECOND READING',
    reading: funeral.second_reading,
    reader: funeral.second_reader,
    responseText: 'Thanks be to God.',
    pageBreakBefore: !!funeral.second_reading,
  })

  const gospelSection = buildReadingSection({
    id: 'gospel',
    title: 'GOSPEL',
    reading: funeral.gospel_reading,
    reader: funeral.presider,
    includeGospelAcclamations: true,
    pageBreakBefore: !!funeral.gospel_reading,
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
    id: funeral.id,
    type: 'funeral',
    language: 'en',
    template: 'funeral-full-script-english',
    title: funeralTitle,
    subtitle: eventDateTime,
    sections,
  }
}
