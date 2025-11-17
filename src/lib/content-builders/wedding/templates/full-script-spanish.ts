/**
 * Wedding Full Script (Spanish) Template
 *
 * Complete wedding liturgy with all readings, responses, and directions in Spanish
 *
 * STRUCTURE:
 * 1. Cover Page - Title + Date + Summary (page break after)
 * 2. Readings - First, Psalm, Second, Gospel (each on new page)
 * 3. Petitions (new page if present)
 * 4. Announcements (continues after petitions)
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
  buildTitleSpanish,
  getEventSubtitleSpanish,
} from '../helpers'

// ============================================================================
// LANGUAGE STRINGS
// ============================================================================

const CONTENT = {
  // Reading titles
  firstReading: 'PRIMERA LECTURA',
  psalm: 'SALMO',
  secondReading: 'SEGUNDA LECTURA',
  gospel: 'EVANGELIO',

  // Summary section labels
  labels: {
    rehearsal: 'Ensayo',
    rehearsalDateTime: 'Fecha y Hora del Ensayo:',
    rehearsalLocation: 'Lugar del Ensayo:',
    rehearsalDinnerLocation: 'Lugar de la Cena del Ensayo:',
    wedding: 'Boda',
    bride: 'Novia:',
    groom: 'Novio:',
    coordinator: 'Coordinador(a):',
    presider: 'Celebrante:',
    leadMusician: 'Músico Principal:',
    weddingLocation: 'Lugar de la Boda:',
    receptionLocation: 'Lugar de la Recepción:',
    witness1: 'Testigo Principal:',
    witness2: 'Dama de Honor:',
    sacredLiturgy: 'Liturgia Sagrada',
    firstReadingLabel: 'Primera Lectura:',
    firstReader: 'Lector de la Primera Lectura:',
    psalmLabel: 'Salmo Responsorial:',
    psalmReader: 'Lector del Salmo:',
    secondReadingLabel: 'Segunda Lectura:',
    secondReader: 'Lector de la Segunda Lectura:',
    gospelLabel: 'Lectura del Evangelio:',
    petitionsReader: 'Peticiones Leídas Por:',
  },

  // Defaults
  defaultTitle: 'Boda',
  defaultDateTime: 'Falta Fecha y Hora',
}

// ============================================================================
// SECTION 1: COVER PAGE
// ============================================================================

/**
 * Build cover page with title, date, and complete summary
 * (Rehearsal + Wedding + Sacred Liturgy sections)
 */
function buildCoverPage(wedding: WeddingWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // REHEARSAL SUBSECTION
  if (hasRehearsalEvents(wedding)) {
    elements.push({
      type: 'section-title',
      text: CONTENT.labels.rehearsal,
    })

    if (wedding.rehearsal_event?.start_date) {
      elements.push({
        type: 'info-row',
        label: CONTENT.labels.rehearsalDateTime,
        value: formatEventDateTime(wedding.rehearsal_event),
      })
    }

    if (wedding.rehearsal_event?.location) {
      elements.push({
        type: 'info-row',
        label: CONTENT.labels.rehearsalLocation,
        value: formatLocationWithAddress(wedding.rehearsal_event.location),
      })
    }

    if (wedding.rehearsal_dinner_event?.location) {
      elements.push({
        type: 'info-row',
        label: CONTENT.labels.rehearsalDinnerLocation,
        value: formatLocationWithAddress(wedding.rehearsal_dinner_event.location),
      })
    }
  }

  // WEDDING SUBSECTION
  elements.push({
    type: 'section-title',
    text: CONTENT.labels.wedding,
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
      value: formatLocationWithAddress(wedding.wedding_event.location),
    })
  }

  if (wedding.reception_event?.location) {
    elements.push({
      type: 'info-row',
      label: 'Lugar de la Recepción:',
      value: formatLocationWithAddress(wedding.reception_event.location),
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
      value: getReadingPericope(wedding.first_reading),
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
      value: getReadingPericope(wedding.psalm),
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
      value: getReadingPericope(wedding.second_reading),
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
      value: getReadingPericope(wedding.gospel_reading),
    })
  }

  // Determine petition reader
  const petitionsReader = getPetitionsReaderName(wedding)

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

// ============================================================================
// SECTION 2: READINGS
// ============================================================================

/**
 * Build all reading sections (First, Psalm, Second, Gospel)
 * Each reading starts on a new page
 */
function buildReadings(wedding: WeddingWithRelations): ContentSection[] {
  const sections: ContentSection[] = []

  // First Reading (always include, show "None Selected" if missing)
  // Note: No pageBreakBefore needed - cover page already has pageBreakAfter
  const firstReadingSection = buildReadingSection({
    id: 'first-reading',
    title: CONTENT.firstReading,
    reading: wedding.first_reading,
    reader: wedding.first_reader,
    showNoneSelected: true,
  })
  if (firstReadingSection) {
    sections.push(firstReadingSection)
  }

  // Psalm (only if present)
  const psalmSection = buildPsalmSection({
    psalm: wedding.psalm,
    psalm_reader: wedding.psalm_reader,
    psalm_is_sung: wedding.psalm_is_sung,
  })
  if (psalmSection) {
    sections.push(psalmSection)
  }

  // Second Reading (only if present)
  const secondReadingSection = buildReadingSection({
    id: 'second-reading',
    title: CONTENT.secondReading,
    reading: wedding.second_reading,
    reader: wedding.second_reader,
    pageBreakBefore: true, // Start on new page
  })
  if (secondReadingSection) {
    sections.push(secondReadingSection)
  }

  // Gospel (only if present)
  const gospelSection = buildReadingSection({
    id: 'gospel',
    title: CONTENT.gospel,
    reading: wedding.gospel_reading,
    includeGospelDialogue: false,
    pageBreakBefore: true, // Start on new page
  })
  if (gospelSection) {
    sections.push(gospelSection)
  }

  return sections
}

// ============================================================================
// SECTION 3: PETITIONS
// ============================================================================

/**
 * Build petitions section (starts on new page if present)
 */
function buildPetitions(wedding: WeddingWithRelations): ContentSection | null {
  return buildPetitionsSection({
    petitions: wedding.petitions,
    petition_reader: wedding.petition_reader,
    second_reader: wedding.second_reader,
    petitions_read_by_second_reader: wedding.petitions_read_by_second_reader,
  })
}

// ============================================================================
// SECTION 4: ANNOUNCEMENTS
// ============================================================================

/**
 * Build announcements section (no page break, continues after petitions)
 */
function buildAnnouncements(wedding: WeddingWithRelations): ContentSection | null {
  return buildAnnouncementsSection(wedding.announcements)
}

// ============================================================================
// MAIN TEMPLATE BUILDER
// ============================================================================

/**
 * Build complete wedding liturgy document (Spanish)
 *
 * DOCUMENT STRUCTURE:
 * 1. Cover Page (title + date + summary) [PAGE BREAK]
 * 2. First Reading [PAGE BREAK]
 * 3. Psalm [PAGE BREAK]
 * 4. Second Reading (if present) [PAGE BREAK]
 * 5. Gospel (if present) [PAGE BREAK]
 * 6. Petitions (if present) [PAGE BREAK]
 * 7. Announcements (if present)
 */
export function buildFullScriptSpanish(wedding: WeddingWithRelations): LiturgyDocument {
  // Calculate title and datetime using helpers
  const title = buildTitleSpanish(wedding)
  const subtitle = getEventSubtitleSpanish(wedding)

  // Build all sections in order
  const sections: ContentSection[] = []

  // 1. Cover page
  sections.push(buildCoverPage(wedding))

  // 2. Readings (first, psalm, second, gospel)
  sections.push(...buildReadings(wedding))

  // 3. Petitions (if present)
  const petitions = buildPetitions(wedding)
  if (petitions) {
    sections.push(petitions)
  }

  // 4. Announcements (if present)
  const announcements = buildAnnouncements(wedding)
  if (announcements) {
    sections.push(announcements)
  }

  // Return complete document
  return {
    id: wedding.id,
    type: 'wedding',
    language: 'es',
    template: 'wedding-full-script-spanish',
    title,
    subtitle,
    sections,
  }
}
