/**
 * Wedding Full Script (Spanish) Template
 *
 * Complete wedding liturgy with all readings, responses, and directions in Spanish
 */

import { WeddingWithRelations } from '@/lib/actions/weddings'
import { LiturgyDocument, ContentSection } from '@/lib/types/liturgy-content'
import { formatPersonWithPhone, formatPersonWithPronunciationWithPhone, formatEventDateTime, formatLocationWithAddress } from '@/lib/utils/formatters'
import {
  buildCoverPage,
  buildReadingSection,
  buildPsalmSection,
  buildPetitionsSection,
  buildAnnouncementsSection,
  type CoverPageSection,
} from '@/lib/content-builders/shared/builders'
import { addPageBreaksBetweenSections } from '@/lib/content-builders/shared/helpers'
import {
  hasRehearsalEvents,
  getReadingPericope,
  getPetitionsReaderName,
  buildTitleSpanish,
  getEventSubtitleSpanish,
} from '../helpers'

/**
 * Build full wedding script (Spanish)
 */
export function buildFullScriptSpanish(wedding: WeddingWithRelations): LiturgyDocument {
  const weddingTitle = buildTitleSpanish(wedding)
  const eventDateTime = getEventSubtitleSpanish(wedding)

  const sections: ContentSection[] = []

  // 1. COVER PAGE - Build sections array conditionally
  const coverSections: CoverPageSection[] = []

  // Rehearsal subsection (if applicable)
  if (hasRehearsalEvents(wedding)) {
    const rehearsalRows = []
    if (wedding.rehearsal_event?.start_date) {
      rehearsalRows.push({
        label: 'Fecha y Hora del Ensayo:',
        value: formatEventDateTime(wedding.rehearsal_event),
      })
    }
    if (wedding.rehearsal_event?.location) {
      rehearsalRows.push({
        label: 'Lugar del Ensayo:',
        value: formatLocationWithAddress(wedding.rehearsal_event.location),
      })
    }
    if (wedding.rehearsal_dinner_event?.location) {
      rehearsalRows.push({
        label: 'Lugar de la Cena del Ensayo:',
        value: formatLocationWithAddress(wedding.rehearsal_dinner_event.location),
      })
    }
    coverSections.push({ title: 'Ensayo', rows: rehearsalRows })
  }

  // Wedding subsection
  const weddingRows = []
  if (wedding.bride) {
    weddingRows.push({ label: 'Novia:', value: formatPersonWithPronunciationWithPhone(wedding.bride) })
  }
  if (wedding.groom) {
    weddingRows.push({ label: 'Novio:', value: formatPersonWithPronunciationWithPhone(wedding.groom) })
  }
  if (wedding.coordinator) {
    weddingRows.push({ label: 'Coordinador(a):', value: formatPersonWithPhone(wedding.coordinator) })
  }
  if (wedding.presider) {
    weddingRows.push({ label: 'Celebrante:', value: formatPersonWithPhone(wedding.presider) })
  }
  if (wedding.homilist) {
    weddingRows.push({ label: 'Homilista:', value: formatPersonWithPhone(wedding.homilist) })
  }
  if (wedding.lead_musician) {
    weddingRows.push({ label: 'Músico Principal:', value: formatPersonWithPhone(wedding.lead_musician) })
  }
  if (wedding.cantor) {
    weddingRows.push({ label: 'Cantor:', value: formatPersonWithPhone(wedding.cantor) })
  }
  if (wedding.wedding_event?.location) {
    weddingRows.push({ label: 'Lugar de la Boda:', value: formatLocationWithAddress(wedding.wedding_event.location) })
  }
  if (wedding.reception_event?.location) {
    weddingRows.push({ label: 'Lugar de la Recepción:', value: formatLocationWithAddress(wedding.reception_event.location) })
  }
  if (wedding.witness_1) {
    weddingRows.push({ label: 'Testigo Principal:', value: formatPersonWithPhone(wedding.witness_1) })
  }
  if (wedding.witness_2) {
    weddingRows.push({ label: 'Dama de Honor:', value: formatPersonWithPhone(wedding.witness_2) })
  }
  if (wedding.notes) {
    weddingRows.push({ label: 'Nota de la Boda:', value: wedding.notes })
  }
  coverSections.push({ title: 'Boda', rows: weddingRows })

  // Sacred Liturgy subsection (if applicable)
  const petitionsReader = getPetitionsReaderName(wedding)
  const hasLiturgyContent = wedding.first_reading || wedding.first_reader ||
    wedding.psalm || wedding.psalm_reader || wedding.psalm_is_sung ||
    wedding.second_reading || wedding.second_reader ||
    wedding.gospel_reading || petitionsReader

  if (hasLiturgyContent) {
    const liturgyRows = []
    if (wedding.first_reading) {
      liturgyRows.push({ label: 'Primera Lectura:', value: getReadingPericope(wedding.first_reading) })
    }
    if (wedding.first_reader) {
      liturgyRows.push({ label: 'Lector de la Primera Lectura:', value: formatPersonWithPhone(wedding.first_reader) })
    }
    if (wedding.psalm) {
      liturgyRows.push({ label: 'Salmo:', value: getReadingPericope(wedding.psalm) })
    }
    if (wedding.psalm_is_sung) {
      liturgyRows.push({ label: 'Opción del Salmo:', value: 'Cantado' })
    } else if (wedding.psalm_reader) {
      liturgyRows.push({ label: 'Lector del Salmo:', value: formatPersonWithPhone(wedding.psalm_reader) })
    }
    if (wedding.second_reading) {
      liturgyRows.push({ label: 'Segunda Lectura:', value: getReadingPericope(wedding.second_reading) })
    }
    if (wedding.second_reader) {
      liturgyRows.push({ label: 'Lector de la Segunda Lectura:', value: formatPersonWithPhone(wedding.second_reader) })
    }
    if (wedding.gospel_reading) {
      liturgyRows.push({ label: 'Lectura del Evangelio:', value: getReadingPericope(wedding.gospel_reading) })
    }
    if (petitionsReader) {
      liturgyRows.push({ label: 'Peticiones Leídas Por:', value: petitionsReader })
    }
    coverSections.push({ title: 'Sagrada Liturgia', rows: liturgyRows })
  }

  sections.push(buildCoverPage(coverSections))

  // 2. READINGS
  const firstReading = buildReadingSection({
    id: 'first-reading',
    title: 'PRIMERA LECTURA',
    reading: wedding.first_reading,
    reader: wedding.first_reader,
  })
  if (firstReading) sections.push(firstReading)

  const psalm = buildPsalmSection({
    psalm: wedding.psalm,
    psalm_reader: wedding.psalm_reader,
    psalm_is_sung: wedding.psalm_is_sung,
  })
  if (psalm) sections.push(psalm)

  const secondReading = buildReadingSection({
    id: 'second-reading',
    title: 'SEGUNDA LECTURA',
    reading: wedding.second_reading,
    reader: wedding.second_reader,
  })
  if (secondReading) sections.push(secondReading)

  const gospel = buildReadingSection({
    id: 'gospel',
    title: 'EVANGELIO',
    reading: wedding.gospel_reading,
  })
  if (gospel) sections.push(gospel)

  // 3. PETITIONS
  const petitions = buildPetitionsSection({
    petitions: wedding.petitions,
    petition_reader: wedding.petition_reader,
  })
  if (petitions) sections.push(petitions)

  // 4. ANNOUNCEMENTS
  const announcements = buildAnnouncementsSection(wedding.announcements)
  if (announcements) sections.push(announcements)

  // Add page breaks between sections (not after the last section)
  addPageBreaksBetweenSections(sections)

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
