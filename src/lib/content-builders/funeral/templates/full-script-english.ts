/**
 * Funeral Full Script (English) Template
 *
 * Complete funeral liturgy with all readings, responses, and directions
 */

import { FuneralWithRelations } from '@/lib/actions/funerals'
import { LiturgyDocument, ContentSection } from '@/lib/types/liturgy-content'
import { formatPersonName, formatPersonWithPhone, formatEventDateTime, formatLocationWithAddress } from '@/lib/utils/formatters'
import {
  buildCoverPage,
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
  buildAnnouncementsSection,
  type CoverPageSection,
} from '@/lib/content-builders/shared/builders'
import {
  buildTitleEnglish,
  getEventSubtitleEnglish,
} from '../helpers'

/**
 * Build full funeral script (English)
 */
export function buildFullScriptEnglish(funeral: FuneralWithRelations): LiturgyDocument {
  const funeralTitle = buildTitleEnglish(funeral)
  const eventDateTime = getEventSubtitleEnglish(funeral)

  const sections: ContentSection[] = []

  // 1. COVER PAGE - Build sections array conditionally
  const coverSections: CoverPageSection[] = []

  // Funeral Service subsection
  const funeralRows = []
  if (funeral.deceased) {
    funeralRows.push({ label: 'Deceased:', value: formatPersonName(funeral.deceased) })
  }
  if (funeral.family_contact) {
    funeralRows.push({ label: 'Family Contact:', value: formatPersonWithPhone(funeral.family_contact) })
  }
  if (funeral.coordinator) {
    funeralRows.push({ label: 'Coordinator:', value: formatPersonName(funeral.coordinator) })
  }
  if (funeral.presider) {
    funeralRows.push({ label: 'Presider:', value: formatPersonName(funeral.presider) })
  }
  if (funeral.homilist) {
    funeralRows.push({ label: 'Homilist:', value: formatPersonName(funeral.homilist) })
  }
  if (funeral.lead_musician) {
    funeralRows.push({ label: 'Lead Musician:', value: formatPersonName(funeral.lead_musician) })
  }
  if (funeral.cantor) {
    funeralRows.push({ label: 'Cantor:', value: formatPersonName(funeral.cantor) })
  }
  if (funeral.funeral_event?.location) {
    funeralRows.push({ label: 'Service Location:', value: formatLocationWithAddress(funeral.funeral_event.location) })
  }
  if (funeral.funeral_event?.start_date) {
    funeralRows.push({ label: 'Service Date & Time:', value: formatEventDateTime(funeral.funeral_event) })
  }
  coverSections.push({ title: 'Funeral Service Information', rows: funeralRows })

  // Liturgical Roles subsection (if applicable)
  const hasLiturgicalRoles = funeral.first_reader || funeral.psalm_reader ||
    funeral.second_reader || funeral.gospel_reader ||
    funeral.petition_reader || funeral.petitions_read_by_second_reader

  if (hasLiturgicalRoles) {
    const rolesRows = []
    if (funeral.first_reader) {
      rolesRows.push({ label: 'First Reader:', value: formatPersonName(funeral.first_reader) })
    }
    if (funeral.psalm_reader) {
      rolesRows.push({ label: 'Psalm Reader:', value: formatPersonName(funeral.psalm_reader) })
    }
    if (funeral.second_reader) {
      rolesRows.push({ label: 'Second Reader:', value: formatPersonName(funeral.second_reader) })
    }
    if (funeral.gospel_reader) {
      rolesRows.push({ label: 'Gospel Reader:', value: formatPersonName(funeral.gospel_reader) })
    }
    if (funeral.petition_reader) {
      rolesRows.push({ label: 'Petition Reader:', value: formatPersonName(funeral.petition_reader) })
    } else if (funeral.petitions_read_by_second_reader) {
      rolesRows.push({ label: 'Petition Reader:', value: 'Second Reader' })
    }
    coverSections.push({ title: 'Liturgical Roles', rows: rolesRows })
  }

  sections.push(buildCoverPage(coverSections))

  // 2. READINGS
  const firstReading = buildReadingSection('first-reading', 'FIRST READING', funeral.first_reading, funeral.first_reader)
  if (firstReading) sections.push(firstReading)

  const psalm = buildPsalmSection(funeral.psalm, funeral.psalm_reader, funeral.psalm_is_sung)
  if (psalm) sections.push(psalm)

  const secondReading = buildReadingSection('second-reading', 'SECOND READING', funeral.second_reading, funeral.second_reader)
  if (secondReading) sections.push(secondReading)

  const gospel = buildReadingSection('gospel', 'GOSPEL', funeral.gospel_reading, funeral.presider)
  if (gospel) sections.push(gospel)

  // 3. PETITIONS
  const petitions = buildPetitionsSection(funeral.petitions, funeral.petition_reader)
  if (petitions) sections.push(petitions)

  // 4. ANNOUNCEMENTS
  const announcements = buildAnnouncementsSection(funeral.announcements)
  if (announcements) sections.push(announcements)

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
