/**
 * Funeral Full Script (Spanish) Template
 *
 * Complete funeral liturgy with all readings, responses, and directions in Spanish
 */

import { FuneralWithRelations } from '@/lib/actions/funerals'
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
  buildTitleSpanish,
  getEventSubtitleSpanish,
} from '../helpers'

/**
 * Build full funeral script (Spanish)
 */
export function buildFullScriptSpanish(funeral: FuneralWithRelations): LiturgyDocument {
  const funeralTitle = buildTitleSpanish(funeral)
  const eventDateTime = getEventSubtitleSpanish(funeral)

  const sections: ContentSection[] = []

  // 1. COVER PAGE - Build sections array conditionally
  const coverSections: CoverPageSection[] = []

  // Funeral Service subsection
  const funeralRows = []
  if (funeral.deceased) {
    funeralRows.push({ label: 'Difunto(a):', value: formatPersonWithPronunciationWithPhone(funeral.deceased) })
  }
  if (funeral.family_contact) {
    funeralRows.push({ label: 'Contacto Familiar:', value: formatPersonWithPhone(funeral.family_contact) })
  }
  if (funeral.coordinator) {
    funeralRows.push({ label: 'Coordinador(a):', value: formatPersonWithPhone(funeral.coordinator) })
  }
  if (funeral.presider) {
    funeralRows.push({ label: 'Celebrante:', value: formatPersonWithPhone(funeral.presider) })
  }
  if (funeral.homilist) {
    funeralRows.push({ label: 'Homilista:', value: formatPersonWithPhone(funeral.homilist) })
  }
  if (funeral.lead_musician) {
    funeralRows.push({ label: 'Músico Principal:', value: formatPersonWithPhone(funeral.lead_musician) })
  }
  if (funeral.cantor) {
    funeralRows.push({ label: 'Cantor:', value: formatPersonWithPhone(funeral.cantor) })
  }
  if (funeral.funeral_event?.location) {
    funeralRows.push({ label: 'Lugar del Servicio:', value: formatLocationWithAddress(funeral.funeral_event.location) })
  }
  if (funeral.funeral_event?.start_date) {
    funeralRows.push({ label: 'Fecha y Hora del Servicio:', value: formatEventDateTime(funeral.funeral_event) })
  }
  if (funeral.funeral_meal_event?.location) {
    funeralRows.push({ label: 'Lugar de la Comida Fúnebre:', value: formatLocationWithAddress(funeral.funeral_meal_event.location) })
  }
  if (funeral.funeral_meal_event?.start_date) {
    funeralRows.push({ label: 'Fecha y Hora de la Comida Fúnebre:', value: formatEventDateTime(funeral.funeral_meal_event) })
  }
  if (funeral.note) {
    funeralRows.push({ label: 'Nota:', value: funeral.note })
  }
  coverSections.push({ title: 'Información del Servicio Fúnebre', rows: funeralRows })

  // Liturgical Roles subsection (if applicable)
  const hasLiturgicalRoles = funeral.first_reader || funeral.psalm_reader ||
    funeral.second_reader || funeral.gospel_reader ||
    funeral.petition_reader || funeral.petitions_read_by_second_reader

  if (hasLiturgicalRoles) {
    const rolesRows = []
    if (funeral.first_reader) {
      rolesRows.push({ label: 'Primer Lector:', value: formatPersonWithPhone(funeral.first_reader) })
    }
    if (funeral.psalm_reader) {
      rolesRows.push({ label: 'Lector del Salmo:', value: formatPersonWithPhone(funeral.psalm_reader) })
    }
    if (funeral.second_reader) {
      rolesRows.push({ label: 'Segundo Lector:', value: formatPersonWithPhone(funeral.second_reader) })
    }
    if (funeral.gospel_reader) {
      rolesRows.push({ label: 'Lector del Evangelio:', value: formatPersonWithPhone(funeral.gospel_reader) })
    }
    if (funeral.petition_reader) {
      rolesRows.push({ label: 'Lector de Peticiones:', value: formatPersonWithPhone(funeral.petition_reader) })
    } else if (funeral.petitions_read_by_second_reader) {
      rolesRows.push({ label: 'Lector de Peticiones:', value: 'Segundo Lector' })
    }
    coverSections.push({ title: 'Funciones Litúrgicas', rows: rolesRows })
  }

  sections.push(buildCoverPage(coverSections))

  // 2. READINGS
  const firstReading = buildReadingSection({
    id: 'first-reading',
    title: 'PRIMERA LECTURA',
    reading: funeral.first_reading,
    reader: funeral.first_reader,
  })
  if (firstReading) sections.push(firstReading)

  const psalm = buildPsalmSection({
    psalm: funeral.psalm,
    psalm_reader: funeral.psalm_reader,
    psalm_is_sung: funeral.psalm_is_sung,
  })
  if (psalm) sections.push(psalm)

  const secondReading = buildReadingSection({
    id: 'second-reading',
    title: 'SEGUNDA LECTURA',
    reading: funeral.second_reading,
    reader: funeral.second_reader,
  })
  if (secondReading) sections.push(secondReading)

  const gospel = buildReadingSection({
    id: 'gospel',
    title: 'EVANGELIO',
    reading: funeral.gospel_reading,
    reader: funeral.presider,
  })
  if (gospel) sections.push(gospel)

  // 3. PETITIONS
  const petitions = buildPetitionsSection({
    petitions: funeral.petitions,
    petition_reader: funeral.petition_reader,
  })
  if (petitions) sections.push(petitions)

  // 4. ANNOUNCEMENTS
  const announcements = buildAnnouncementsSection(funeral.announcements)
  if (announcements) sections.push(announcements)

  // Add page breaks between sections (not after the last section)
  addPageBreaksBetweenSections(sections)

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
