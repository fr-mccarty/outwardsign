/**
 * Wedding Full Script (English) Template
 *
 * Complete wedding liturgy with all readings, responses, and directions
 */

import { WeddingWithRelations } from '@/lib/actions/weddings'
import { LiturgyDocument, ContentSection } from '@/lib/types/liturgy-content'
import { formatPersonWithPhone, formatEventDateTime, formatLocationWithAddress } from '@/lib/utils/formatters'
import {
  buildCoverPage,
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
  buildAnnouncementsSection,
  type CoverPageSection,
} from '@/lib/content-builders/shared/builders'
import {
  hasRehearsalEvents,
  getReadingPericope,
  getPetitionsReaderName,
  buildTitleEnglish,
  getEventSubtitleEnglish,
} from '../helpers'

/**
 * Build full wedding script (English)
 */
export function buildFullScriptEnglish(wedding: WeddingWithRelations): LiturgyDocument {
  const weddingTitle = buildTitleEnglish(wedding)
  const eventDateTime = getEventSubtitleEnglish(wedding)

  const sections: ContentSection[] = []

  // 1. COVER PAGE - Build sections array conditionally
  const coverSections: CoverPageSection[] = []

  // Rehearsal subsection (if applicable)
  if (hasRehearsalEvents(wedding)) {
    const rehearsalRows = []
    if (wedding.rehearsal_event?.start_date) {
      rehearsalRows.push({
        label: 'Rehearsal Date & Time:',
        value: formatEventDateTime(wedding.rehearsal_event),
      })
    }
    if (wedding.rehearsal_event?.location) {
      rehearsalRows.push({
        label: 'Rehearsal Location:',
        value: formatLocationWithAddress(wedding.rehearsal_event.location),
      })
    }
    if (wedding.rehearsal_dinner_event?.location) {
      rehearsalRows.push({
        label: 'Rehearsal Dinner Location:',
        value: formatLocationWithAddress(wedding.rehearsal_dinner_event.location),
      })
    }
    coverSections.push({ title: 'Rehearsal', rows: rehearsalRows })
  }

  // Wedding subsection
  const weddingRows = []
  if (wedding.bride) {
    weddingRows.push({ label: 'Bride:', value: formatPersonWithPhone(wedding.bride) })
  }
  if (wedding.groom) {
    weddingRows.push({ label: 'Groom:', value: formatPersonWithPhone(wedding.groom) })
  }
  if (wedding.coordinator) {
    weddingRows.push({ label: 'Coordinator:', value: formatPersonWithPhone(wedding.coordinator) })
  }
  if (wedding.presider) {
    weddingRows.push({ label: 'Presider:', value: formatPersonWithPhone(wedding.presider) })
  }
  if (wedding.homilist) {
    weddingRows.push({ label: 'Homilist:', value: formatPersonWithPhone(wedding.homilist) })
  }
  if (wedding.lead_musician) {
    weddingRows.push({ label: 'Lead Musician:', value: formatPersonWithPhone(wedding.lead_musician) })
  }
  if (wedding.cantor) {
    weddingRows.push({ label: 'Cantor:', value: formatPersonWithPhone(wedding.cantor) })
  }
  if (wedding.wedding_event?.location) {
    weddingRows.push({ label: 'Wedding Location:', value: formatLocationWithAddress(wedding.wedding_event.location) })
  }
  if (wedding.reception_event?.location) {
    weddingRows.push({ label: 'Reception Location:', value: formatLocationWithAddress(wedding.reception_event.location) })
  }
  if (wedding.witness_1) {
    weddingRows.push({ label: 'Best Man:', value: formatPersonWithPhone(wedding.witness_1) })
  }
  if (wedding.witness_2) {
    weddingRows.push({ label: 'Maid/Matron of Honor:', value: formatPersonWithPhone(wedding.witness_2) })
  }
  if (wedding.notes) {
    weddingRows.push({ label: 'Wedding Note:', value: wedding.notes })
  }
  coverSections.push({ title: 'Wedding', rows: weddingRows })

  // Sacred Liturgy subsection (if applicable)
  const petitionsReader = getPetitionsReaderName(wedding)
  const hasLiturgyContent = wedding.first_reading || wedding.first_reader ||
    wedding.psalm || wedding.psalm_reader || wedding.psalm_is_sung ||
    wedding.second_reading || wedding.second_reader ||
    wedding.gospel_reading || petitionsReader

  if (hasLiturgyContent) {
    const liturgyRows = []
    if (wedding.first_reading) {
      liturgyRows.push({ label: 'First Reading:', value: getReadingPericope(wedding.first_reading) })
    }
    if (wedding.first_reader) {
      liturgyRows.push({ label: 'First Reading Lector:', value: formatPersonWithPhone(wedding.first_reader) })
    }
    if (wedding.psalm) {
      liturgyRows.push({ label: 'Psalm:', value: getReadingPericope(wedding.psalm) })
    }
    if (wedding.psalm_is_sung) {
      liturgyRows.push({ label: 'Psalm Choice:', value: 'Sung' })
    } else if (wedding.psalm_reader) {
      liturgyRows.push({ label: 'Psalm Lector:', value: formatPersonWithPhone(wedding.psalm_reader) })
    }
    if (wedding.second_reading) {
      liturgyRows.push({ label: 'Second Reading:', value: getReadingPericope(wedding.second_reading) })
    }
    if (wedding.second_reader) {
      liturgyRows.push({ label: 'Second Reading Lector:', value: formatPersonWithPhone(wedding.second_reader) })
    }
    if (wedding.gospel_reading) {
      liturgyRows.push({ label: 'Gospel Reading:', value: getReadingPericope(wedding.gospel_reading) })
    }
    if (petitionsReader) {
      liturgyRows.push({ label: 'Petitions Read By:', value: petitionsReader })
    }
    coverSections.push({ title: 'Sacred Liturgy', rows: liturgyRows })
  }

  sections.push(buildCoverPage(coverSections))

  // 2. READINGS
  const firstReading = buildReadingSection('first-reading', 'FIRST READING', wedding.first_reading, wedding.first_reader)
  if (firstReading) sections.push(firstReading)

  const psalm = buildPsalmSection(wedding.psalm, wedding.psalm_reader, wedding.psalm_is_sung)
  if (psalm) sections.push(psalm)

  const secondReading = buildReadingSection('second-reading', 'SECOND READING', wedding.second_reading, wedding.second_reader)
  if (secondReading) sections.push(secondReading)

  const gospel = buildReadingSection('gospel', 'GOSPEL', wedding.gospel_reading)
  if (gospel) sections.push(gospel)

  // 3. PETITIONS
  const petitions = buildPetitionsSection(wedding.petitions, wedding.petition_reader)
  if (petitions) sections.push(petitions)

  // 4. ANNOUNCEMENTS
  const announcements = buildAnnouncementsSection(wedding.announcements)
  if (announcements) sections.push(announcements)

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
