/**
 * Wedding Templates
 *
 * Wedding-specific content builders that convert WeddingWithRelations data
 * into a structured LiturgyDocument that can be rendered to HTML, PDF, or Word.
 *
 * For other sacraments, create similar files:
 * - baptism-templates.ts
 * - funeral-templates.ts
 * - quinceanera-templates.ts
 *
 * Each should follow this same pattern:
 * 1. Import sacrament-specific data type (e.g., BaptismWithRelations)
 * 2. Create builder functions for each template
 * 3. Export template registry and main builder function
 */

import { WeddingWithRelations } from '@/lib/actions/weddings'
import {
  LiturgyDocument,
  ContentSection,
  ContentElement,
  LiturgyTemplate,
} from '@/lib/types/liturgy-content'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format person name
 */
function formatPersonName(person?: { first_name: string; last_name: string } | null): string {
  return person ? `${person.first_name} ${person.last_name}` : ''
}

/**
 * Format person with phone number
 */
function formatPersonWithPhone(
  person?: { first_name: string; last_name: string; phone_number?: string } | null
): string {
  if (!person) return ''
  const name = `${person.first_name} ${person.last_name}`
  return person.phone_number ? `${name} (${person.phone_number})` : name
}

/**
 * Format event date and time
 */
function formatEventDateTime(event?: { start_date?: string; start_time?: string } | null): string {
  if (!event?.start_date) return ''
  const date = new Date(event.start_date).toLocaleDateString()
  return event.start_time ? `${date} at ${event.start_time}` : date
}

// ============================================================================
// SECTION BUILDERS
// ============================================================================

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
 * Build first reading section
 */
function buildFirstReadingSection(wedding: WeddingWithRelations): ContentSection {
  const elements: ContentElement[] = []

  elements.push({
    type: 'reading-title',
    text: 'FIRST READING',
    alignment: 'right',
  })

  if (wedding.first_reading) {
    elements.push({
      type: 'pericope',
      text: wedding.first_reading.pericope || 'No pericope',
      alignment: 'right',
    })

    if (wedding.first_reader) {
      elements.push({
        type: 'reader-name',
        text: formatPersonName(wedding.first_reader),
        alignment: 'right',
      })
    }

    if (wedding.first_reading.introduction) {
      elements.push({
        type: 'introduction',
        text: wedding.first_reading.introduction,
      })
    }

    elements.push({
      type: 'reading-text',
      text: wedding.first_reading.text || 'No reading text',
      preserveLineBreaks: true,
    })

    if (wedding.first_reading.conclusion) {
      elements.push({
        type: 'conclusion',
        text: wedding.first_reading.conclusion,
      })
    }

    elements.push({
      type: 'response',
      parts: [
        { text: 'People:', formatting: ['bold'] },
        { text: ' Thanks be to God.', formatting: ['italic'] },
      ],
    })
  } else {
    elements.push({
      type: 'text',
      text: 'None Selected',
    })
  }

  return {
    id: 'first-reading',
    elements,
  }
}

/**
 * Build psalm section
 */
function buildPsalmSection(wedding: WeddingWithRelations): ContentSection {
  const elements: ContentElement[] = []

  elements.push({
    type: 'reading-title',
    text: 'Psalm',
    alignment: 'right',
  })

  if (wedding.psalm) {
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
  } else {
    elements.push({
      type: 'text',
      text: 'None Selected',
    })
  }

  return {
    id: 'psalm',
    pageBreakBefore: wedding.psalm ? true : false,
    elements,
  }
}

/**
 * Build second reading section
 */
function buildSecondReadingSection(wedding: WeddingWithRelations): ContentSection {
  const elements: ContentElement[] = []

  elements.push({
    type: 'reading-title',
    text: 'Second Reading',
    alignment: 'right',
  })

  if (wedding.second_reading) {
    elements.push({
      type: 'pericope',
      text: wedding.second_reading.pericope || 'No pericope',
      alignment: 'right',
    })

    if (wedding.second_reader) {
      elements.push({
        type: 'reader-name',
        text: formatPersonName(wedding.second_reader),
        alignment: 'right',
      })
    }

    if (wedding.second_reading.introduction) {
      elements.push({
        type: 'introduction',
        text: wedding.second_reading.introduction,
      })
    }

    elements.push({
      type: 'reading-text',
      text: wedding.second_reading.text || 'No reading text',
      preserveLineBreaks: true,
    })

    if (wedding.second_reading.conclusion) {
      elements.push({
        type: 'conclusion',
        text: wedding.second_reading.conclusion,
      })
    }

    elements.push({
      type: 'response',
      parts: [
        { text: 'People:', formatting: ['bold'] },
        { text: ' Thanks be to God.', formatting: ['italic'] },
      ],
    })
  } else {
    elements.push({
      type: 'text',
      text: 'None Selected',
    })
  }

  return {
    id: 'second-reading',
    pageBreakBefore: wedding.second_reading ? true : false,
    elements,
  }
}

/**
 * Build gospel section
 */
function buildGospelSection(wedding: WeddingWithRelations): ContentSection {
  const elements: ContentElement[] = []

  elements.push({
    type: 'reading-title',
    text: 'Gospel',
    alignment: 'right',
  })

  if (wedding.gospel_reading) {
    elements.push({
      type: 'pericope',
      text: wedding.gospel_reading.pericope || 'No pericope',
      alignment: 'right',
    })

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

    if (wedding.gospel_reading.introduction) {
      elements.push({
        type: 'introduction',
        text: wedding.gospel_reading.introduction,
      })
    }

    elements.push({
      type: 'reading-text',
      text: wedding.gospel_reading.text || 'No gospel text',
      preserveLineBreaks: true,
    })

    if (wedding.gospel_reading.conclusion) {
      elements.push({
        type: 'conclusion',
        text: wedding.gospel_reading.conclusion,
      })
    }

    elements.push({
      type: 'response',
      parts: [
        { text: 'People:', formatting: ['bold'] },
        { text: ' Praise to you, Lord Jesus Christ.', formatting: ['italic'] },
      ],
    })
  } else {
    elements.push({
      type: 'text',
      text: 'None Selected',
    })
  }

  return {
    id: 'gospel',
    pageBreakBefore: wedding.gospel_reading ? true : false,
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

// ============================================================================
// TEMPLATE BUILDERS
// ============================================================================

/**
 * Build full wedding script
 */
function buildFullScript(wedding: WeddingWithRelations): LiturgyDocument {
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
  sections.push({
    id: 'readings-header',
    elements: [
      {
        type: 'event-title',
        text: weddingTitle,
        alignment: 'center',
      },
      {
        type: 'event-datetime',
        text: eventDateTime,
        alignment: 'center',
      },
    ],
  })

  // Add all reading sections
  sections.push(buildFirstReadingSection(wedding))
  sections.push(buildPsalmSection(wedding))
  sections.push(buildSecondReadingSection(wedding))
  sections.push(buildGospelSection(wedding))

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

// ============================================================================
// TEMPLATE REGISTRY
// ============================================================================

export const WEDDING_TEMPLATES: Record<string, LiturgyTemplate<WeddingWithRelations>> = {
  'wedding-full-script-english': {
    id: 'wedding-full-script-english',
    name: 'Full Ceremony Script (English)',
    description: 'Complete wedding liturgy with all readings, responses, and directions',
    supportedLanguages: ['en'],
    builder: buildFullScript,
  },
  // Future templates can be added here:
  // 'wedding-readings-only-english': { ... },
  // 'wedding-summary-card-english': { ... },
  // 'wedding-full-script-spanish': { ... },
}

/**
 * Main export: Build wedding liturgy content
 */
export function buildWeddingLiturgy(
  wedding: WeddingWithRelations,
  templateId: string = 'wedding-full-script-english'
): LiturgyDocument {
  const template = WEDDING_TEMPLATES[templateId] || WEDDING_TEMPLATES['wedding-full-script-english']
  return template.builder(wedding)
}
