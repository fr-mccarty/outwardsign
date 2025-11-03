/**
 * Wedding Full Script (English) Template
 *
 * Complete wedding liturgy with all readings, responses, and directions
 */

import { WeddingWithRelations } from '@/lib/actions/weddings'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatPersonWithPhone, formatEventDateTime } from '@/lib/utils/formatters'

/**
 * Build summary section (rehearsal, wedding info, sacred liturgy info)
 */
function buildSummarySection(wedding: WeddingWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Rehearsal subsection
  if (wedding.rehearsal_event || wedding.rehearsal_dinner_event) {
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
        value: wedding.rehearsal_event.location,
      })
    }

    if (wedding.rehearsal_dinner_event?.location) {
      elements.push({
        type: 'info-row',
        label: 'Rehearsal Dinner Location:',
        value: wedding.rehearsal_dinner_event.location,
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
      value: wedding.wedding_event.location,
    })
  }

  if (wedding.reception_event?.location) {
    elements.push({
      type: 'info-row',
      label: 'Reception Location:',
      value: wedding.reception_event.location,
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
      value: wedding.first_reading.pericope || '',
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
      value: wedding.psalm.pericope || '',
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
      value: wedding.second_reading.pericope || '',
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
      label: 'Petitions Read By:',
      value: petitionsReader,
    })
  }

  if (wedding.petitions) {
    elements.push({
      type: 'info-row',
      label: 'Additional Petitions:',
      value: wedding.petitions,
    })
  }

  return {
    id: 'summary',
    pageBreakAfter: true,
    elements,
  }
}

/**
 * Configuration for building a reading section
 */
interface ReadingSectionConfig {
  id: string
  title: string
  reading: any // The reading object (first_reading, second_reading, or gospel_reading)
  reader?: any // The reader object (first_reader, second_reader, or null for gospel)
  responseText?: string
  includeGospelDialogue?: boolean
  pageBreakBefore?: boolean
  showNoneSelected?: boolean
}

/**
 * Build reading section (first, second, or gospel)
 */
function buildReadingSection(config: ReadingSectionConfig): ContentSection {
  const {
    id,
    title,
    reading,
    reader,
    responseText,
    includeGospelDialogue = false,
    pageBreakBefore = false,
    showNoneSelected = false,
  } = config

  const elements: ContentElement[] = []

  if (reading) {
    elements.push({
      type: 'reading-title',
      text: title,
      alignment: 'right',
    })

    elements.push({
      type: 'pericope',
      text: reading.pericope || 'No pericope',
      alignment: 'right',
    })

    if (reader) {
      elements.push({
        type: 'reader-name',
        text: formatPersonName(reader),
        alignment: 'right',
      })
    }

    // Gospel-specific dialogue
    if (includeGospelDialogue) {
      elements.push({
        type: 'priest-dialogue',
        text: 'Priest: The Lord be with you.',
      })

      elements.push({
        type: 'response',
        parts: [
          { text: 'People:', formatting: ['bold'] },
          { text: ' And with your spirit.', formatting: ['italic'] },
        ],
      })
    }

    if (reading.introduction) {
      elements.push({
        type: 'introduction',
        text: reading.introduction,
      })
    }

    elements.push({
      type: 'reading-text',
      text: reading.text || 'No reading text',
      preserveLineBreaks: true,
    })

    if (reading.conclusion) {
      elements.push({
        type: 'conclusion',
        text: reading.conclusion,
      })
    }

    if (responseText) {
      elements.push({
        type: 'response',
        parts: [
          { text: 'People:', formatting: ['bold'] },
          { text: ` ${responseText}`, formatting: ['italic'] },
        ],
      })
    }
  } else if (showNoneSelected) {
    elements.push({
      type: 'text',
      text: 'None Selected',
    })
  }

  return {
    id,
    pageBreakBefore,
    elements,
  }
}

/**
 * Build psalm section
 */
function buildPsalmSection(wedding: WeddingWithRelations): ContentSection {
  const elements: ContentElement[] = []

  if (wedding.psalm) {
    elements.push({
      type: 'reading-title',
      text: 'Psalm',
      alignment: 'right',
    })

    elements.push({
      type: 'pericope',
      text: wedding.psalm.pericope || 'No pericope',
      alignment: 'right',
    })

    if (wedding.psalm_is_sung) {
      elements.push({
        type: 'reader-name',
        text: 'Sung',
        alignment: 'right',
      })
    } else if (wedding.psalm_reader) {
      elements.push({
        type: 'reader-name',
        text: formatPersonName(wedding.psalm_reader),
        alignment: 'right',
      })
    }

    if (wedding.psalm.introduction) {
      elements.push({
        type: 'introduction',
        text: wedding.psalm.introduction,
      })
    }

    elements.push({
      type: 'reading-text',
      text: wedding.psalm.text || 'No psalm text',
      preserveLineBreaks: true,
    })

    if (wedding.psalm.conclusion) {
      elements.push({
        type: 'conclusion',
        text: wedding.psalm.conclusion,
      })
    }
  }

  return {
    id: 'psalm',
    pageBreakBefore: wedding.psalm ? true : false,
    elements,
  }
}
/**
 * Build petitions section
 */
function buildPetitionsSection(wedding: WeddingWithRelations): ContentSection {
  const elements: ContentElement[] = []

  const brideName = wedding.bride?.first_name || ''
  const groomName = wedding.groom?.first_name || ''

  // Determine petition reader
  const petitionsReader = wedding.petitions_read_by_second_reader && wedding.second_reader
    ? formatPersonName(wedding.second_reader)
    : wedding.petition_reader
    ? formatPersonName(wedding.petition_reader)
    : ''

  elements.push({
    type: 'reading-title',
    text: 'Petitions',
    alignment: 'right',
  })

  if (petitionsReader) {
    elements.push({
      type: 'reader-name',
      text: petitionsReader,
      alignment: 'right',
    })
  }

  elements.push({ type: 'spacer', size: 'medium' })

  // Introductory petition
  elements.push({
    type: 'petition',
    parts: [
      { text: 'Reader:', formatting: ['bold'] },
      { text: ' The response is "Lord, hear our prayer." ', formatting: ['bold'] },
      { text: '[Pause]', formatting: ['bold'], color: 'liturgy-red' },
    ],
  })

  // Standard petitions
  elements.push({
    type: 'petition',
    parts: [
      { text: 'Reader:', formatting: ['bold'] },
      {
        text: ` For ${brideName} and ${groomName}, joined now in marriage, that their love will grow and their commitment will deepen every day, let us pray to the Lord.`,
        formatting: ['bold'],
      },
    ],
  })

  elements.push({
    type: 'response',
    parts: [
      { text: 'People:', formatting: ['bold'] },
      { text: ' Lord, hear our prayer.', formatting: ['italic'] },
    ],
  })

  elements.push({
    type: 'petition',
    parts: [
      { text: 'Reader:', formatting: ['bold'] },
      {
        text: ` For the parents and grandparents of ${brideName} and ${groomName}, without whose dedication to God and family we would not be gathered here today, that they will be blessed as they gain a son or daughter, let us pray to the Lord.`,
        formatting: ['bold'],
      },
    ],
  })

  elements.push({
    type: 'response',
    parts: [
      { text: 'People:', formatting: ['bold'] },
      { text: ' Lord, hear our prayer.', formatting: ['italic'] },
    ],
  })

  elements.push({
    type: 'petition',
    parts: [
      { text: 'Reader:', formatting: ['bold'] },
      {
        text: ` For the families and friends of ${brideName} and ${groomName}, gathered here today, that they continue to enrich each other with love and support through the years, let us pray to the Lord.`,
        formatting: ['bold'],
      },
    ],
  })

  elements.push({
    type: 'response',
    parts: [
      { text: 'People:', formatting: ['bold'] },
      { text: ' Lord, hear our prayer.', formatting: ['italic'] },
    ],
  })

  // Custom petitions
  const customPetitions = wedding.petitions ? wedding.petitions.split('\n').filter((p) => p.trim()) : []

  customPetitions.forEach((petition) => {
    elements.push({
      type: 'petition',
      parts: [
        { text: 'Reader:', formatting: ['bold'] },
        { text: ` ${petition}, let us pray to the Lord.`, formatting: ['bold'] },
      ],
    })

    elements.push({
      type: 'response',
      parts: [
        { text: 'People:', formatting: ['bold'] },
        { text: ' Lord, hear our prayer.', formatting: ['italic'] },
      ],
    })
  })

  return {
    id: 'petitions',
    pageBreakBefore: true,
    elements,
  }
}

/**
 * Build announcements section
 */
function buildAnnouncementsSection(wedding: WeddingWithRelations): ContentSection | null {
  if (!wedding.announcements) return null

  return {
    id: 'announcements',
    elements: [
      {
        type: 'section-title',
        text: 'Announcements',
      },
      {
        type: 'reading-text',
        text: wedding.announcements,
        preserveLineBreaks: true,
      },
    ],
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
      alignment: 'center',
    },
    {
      type: 'event-datetime',
      text: eventDateTime,
      alignment: 'center',
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

  sections.push(buildPsalmSection(wedding))

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
  sections.push(buildPetitionsSection(wedding))

  // Add announcements if present
  const announcementsSection = buildAnnouncementsSection(wedding)
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
