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

  // Sacred Liturgy subsection - only show if there are readings/petitions
  const petitionsReader = getPetitionsReaderName(wedding)
  const hasLiturgyContent = wedding.first_reading || wedding.first_reader ||
    wedding.psalm || wedding.psalm_reader || wedding.psalm_is_sung ||
    wedding.second_reading || wedding.second_reader ||
    wedding.gospel_reading || petitionsReader

  if (hasLiturgyContent) {
    elements.push({
      type: 'section-title',
      text: 'Sagrada Liturgia',
    })
  }

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

  // First Reading (only if present)
  // Note: No pageBreakBefore needed - cover page already has pageBreakAfter
  const firstReadingSection = buildReadingSection({
    id: 'first-reading',
    title: CONTENT.firstReading,
    reading: wedding.first_reading,
    reader: wedding.first_reader,
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

  // 1. Build cover page
  const coverPage = buildCoverPage(wedding)

  // 2. Build readings (each checks individually if it has content)
  const readingSections = buildReadings(wedding)

  // 3. Build ceremony sections (Marriage Rite)
  const ceremonySections: ContentSection[] = []

  // Marriage Consent
  const brideName = wedding.bride ? formatPersonName(wedding.bride) : 'N.'
  const groomName = wedding.groom ? formatPersonName(wedding.groom) : 'N.'

  ceremonySections.push({
    id: 'marriage-consent',
    pageBreakBefore: true,
    elements: [
      {
        type: 'section-title',
        text: 'CONSENTIMIENTO MATRIMONIAL',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'El sacerdote se dirige a los novios:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-dialogue',
        text: `${brideName} y ${groomName}, ¿han venido a contraer Matrimonio sin ser coaccionados, libre y voluntariamente?`,
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'NOVIOS:',
        text: 'Sí, hemos venido libremente.',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-dialogue',
        text: '¿Están decididos a amarse y respetarse mutuamente, siguiendo el modo de vida propio del Matrimonio, durante toda la vida?',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'NOVIOS:',
        text: 'Sí, estamos decididos.',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-dialogue',
        text: '¿Están dispuestos a recibir de Dios responsable y amorosamente los hijos, y a educarlos según la ley de Cristo y de su Iglesia?',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'NOVIOS:',
        text: 'Sí, estamos dispuestos.',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'El sacerdote invita a la pareja a declarar su consentimiento:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-dialogue',
        text: `Así, pues, ya que quieren establecer entre ustedes la Alianza santa del Matrimonio, unan sus manos derechas y manifiesten su consentimiento ante Dios y su Iglesia.`,
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'rubric',
        text: 'Los novios unen las manos. El novio dice:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'NOVIO:',
        text: `Yo, ${groomName}, te recibo a ti, ${brideName}, como esposa y me entrego a ti, y prometo serte fiel en la prosperidad y en la adversidad, en la salud y en la enfermedad, y así amarte y respetarte todos los días de mi vida.`,
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'rubric',
        text: 'La novia dice:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'NOVIA:',
        text: `Yo, ${brideName}, te recibo a ti, ${groomName}, como esposo y me entrego a ti, y prometo serte fiel en la prosperidad y en la adversidad, en la salud y en la enfermedad, y así amarte y respetarte todos los días de mi vida.`,
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-text',
        text: 'El Señor confirme benignamente este consentimiento que han manifestado ante la Iglesia, y les otorgue su copiosa bendición. Lo que Dios ha unido, que no lo separe el hombre.',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'TODOS:',
        text: 'Amén.',
      },
    ],
  })

  // Exchange of Rings
  ceremonySections.push({
    id: 'exchange-of-rings',
    elements: [
      {
        type: 'section-title',
        text: 'BENDICIÓN Y ENTREGA DE LOS ANILLOS',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'El sacerdote bendice los anillos:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-text',
        text: 'El Señor bendiga ✠ estos anillos que van a entregarse uno al otro en señal de amor y de fidelidad.',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'TODOS:',
        text: 'Amén.',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'El novio coloca el anillo en el dedo de la novia y dice:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'NOVIO:',
        text: `${brideName}, recibe esta alianza, en señal de mi amor y fidelidad a ti. En el nombre del Padre, y del Hijo, y del Espíritu Santo.`,
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'rubric',
        text: 'La novia coloca el anillo en el dedo del novio y dice:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'NOVIA:',
        text: `${groomName}, recibe esta alianza, en señal de mi amor y fidelidad a ti. En el nombre del Padre, y del Hijo, y del Espíritu Santo.`,
      },
    ],
  })

  // Nuptial Blessing
  ceremonySections.push({
    id: 'nuptial-blessing',
    pageBreakBefore: true,
    elements: [
      {
        type: 'section-title',
        text: 'BENDICIÓN NUPCIAL',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'rubric',
        text: 'El sacerdote invita a todos a orar:',
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'priest-dialogue',
        text: 'Oremos, hermanos, a Dios Padre todopoderoso, para que derrame la abundancia de su bendición sobre estos esposos que se han unido en el Sacramento del Matrimonio.',
      },
      {
        type: 'spacer',
        size: 'medium',
      },
      {
        type: 'priest-text',
        text: `Oh Dios, que con tu poder creaste de la nada todas las cosas y ordenaste el comienzo del universo formando al hombre a tu imagen, y dándole como ayuda inseparable a la mujer, de tal modo que ya no fueran dos, sino una sola carne, enseñándonos así que nunca es lícito separar lo que tú quisiste que fuera una sola cosa.

Oh Dios, que consagraste la unión conyugal con misterio tan sublime, que en el pacto nupcial preludiaste el Sacramento de la unión de Cristo con su Iglesia.

Oh Dios, por quien se une la mujer al marido, y se otorga a la sociedad conyugal, desde su principio, la única bendición que no fue abolida ni por la pena del pecado original ni por la sentencia del diluvio.

Mira con bondad a estos hijos tuyos, que, uniéndose en Matrimonio, piden ser fortalecidos con tu bendición. Te pedimos que descienda sobre ellos la gracia del Espíritu Santo y que tu amor penetre sus corazones, para que permanezcan fieles en la alianza conyugal.

Concede a tu hija ${brideName} que, por la gracia del amor y de la paz, sea siempre como aquellas santas mujeres de quienes la Escritura hace elogio.

Concede a su esposo que deposite en ella su confianza, y, reconociéndola como su igual y coheredera de la vida divina, la respete y ame siempre, como Cristo ama a su Iglesia.

Y ahora, Señor, te pedimos que estos hijos tuyos permanezcan en la fe y amen tus mandamientos; que, unidos en Matrimonio, sean ejemplares por la pureza de sus costumbres, y, fortalecidos con el poder del Evangelio, den a todos testimonio de Cristo; (que sean fecundos en hijos, padres de reconocida virtud, y lleguen ambos a la deseada ancianidad).

Y te pedimos también, Señor, que, llegando con sus hijos a la morada celestial, consigan los gozos eternos. Por Jesucristo, nuestro Señor.`,
      },
      {
        type: 'spacer',
        size: 'small',
      },
      {
        type: 'response',
        label: 'TODOS:',
        text: 'Amén.',
      },
    ],
  })

  // 4. Build petitions (returns null if no content)
  const petitions = buildPetitions(wedding)

  // 5. Build announcements (returns null if no content)
  const announcements = buildAnnouncements(wedding)

  // Check if there are any sections after cover page
  const hasFollowingSections = readingSections.length > 0 || ceremonySections.length > 0 || petitions !== null || announcements !== null

  // Only add page break after cover page if there are following sections
  coverPage.pageBreakAfter = hasFollowingSections

  // Add cover page
  sections.push(coverPage)

  // Add other sections (only non-null/non-empty ones)
  sections.push(...readingSections)

  // Add ceremony sections (between Gospel and Petitions)
  sections.push(...ceremonySections)

  if (petitions) sections.push(petitions)
  if (announcements) sections.push(announcements)

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
