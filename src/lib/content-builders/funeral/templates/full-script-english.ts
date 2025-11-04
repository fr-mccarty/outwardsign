/**
 * Funeral Full Script (English) Template
 *
 * Complete funeral liturgy with all readings, responses, and directions
 */

import { FuneralWithRelations } from '@/lib/actions/funerals'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatPersonWithPhone, formatEventDateTime } from '@/lib/utils/formatters'

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
      value: funeral.funeral_event.location,
    })
  }

  if (funeral.funeral_event?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Service Date & Time:',
      value: formatEventDateTime(funeral.funeral_event),
    })
  }

  // Liturgical Roles subsection
  elements.push({
    type: 'section-title',
    text: 'Liturgical Roles',
  })

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
    title: 'Summary',
    elements,
  }
}

/**
 * Build liturgy of the word section
 */
function buildLiturgyOfTheWordSection(funeral: FuneralWithRelations): ContentSection {
  const elements: ContentElement[] = []

  elements.push({
    type: 'section-title',
    text: 'Liturgy of the Word',
  })

  // First Reading
  if (funeral.first_reading) {
    elements.push({
      type: 'reading-title',
      text: 'First Reading',
    })

    elements.push({
      type: 'pericope',
      text: funeral.first_reading.pericope || '',
    })

    if (funeral.first_reader) {
      elements.push({
        type: 'reader-name',
        text: formatPersonName(funeral.first_reader),
      })
    }

    if (funeral.first_reading.introduction) {
      elements.push({
        type: 'introduction',
        text: funeral.first_reading.introduction,
      })
    }

    if (funeral.first_reading.text) {
      elements.push({
        type: 'reading-text',
        text: funeral.first_reading.text,
        preserveLineBreaks: true,
      })
    }

    if (funeral.first_reading.conclusion) {
      elements.push({
        type: 'conclusion',
        text: funeral.first_reading.conclusion,
      })
    }

    elements.push({
      type: 'response',
      parts: [
        { text: 'All:', formatting: ['bold'] },
        { text: ' Thanks be to God.', formatting: ['italic'] },
      ],
    })
  }

  // Responsorial Psalm
  if (funeral.psalm) {
    elements.push({
      type: 'reading-title',
      text: 'Responsorial Psalm',
    })

    elements.push({
      type: 'pericope',
      text: funeral.psalm.pericope || '',
    })

    if (funeral.psalm_is_sung) {
      elements.push({
        type: 'text',
        text: 'Psalm is sung',
      })
    } else if (funeral.psalm_reader) {
      elements.push({
        type: 'reader-name',
        text: formatPersonName(funeral.psalm_reader),
      })
    }

    if (funeral.psalm.text) {
      elements.push({
        type: 'reading-text',
        text: funeral.psalm.text,
        preserveLineBreaks: true,
      })
    }
  }

  // Second Reading
  if (funeral.second_reading) {
    elements.push({
      type: 'reading-title',
      text: 'Second Reading',
    })

    elements.push({
      type: 'pericope',
      text: funeral.second_reading.pericope || '',
    })

    if (funeral.second_reader) {
      elements.push({
        type: 'reader-name',
        text: formatPersonName(funeral.second_reader),
      })
    }

    if (funeral.second_reading.introduction) {
      elements.push({
        type: 'introduction',
        text: funeral.second_reading.introduction,
      })
    }

    if (funeral.second_reading.text) {
      elements.push({
        type: 'reading-text',
        text: funeral.second_reading.text,
        preserveLineBreaks: true,
      })
    }

    if (funeral.second_reading.conclusion) {
      elements.push({
        type: 'conclusion',
        text: funeral.second_reading.conclusion,
      })
    }

    elements.push({
      type: 'response',
      parts: [
        { text: 'All:', formatting: ['bold'] },
        { text: ' Thanks be to God.', formatting: ['italic'] },
      ],
    })
  }

  // Gospel Reading
  if (funeral.gospel_reading) {
    elements.push({
      type: 'reading-title',
      text: 'Gospel',
    })

    elements.push({
      type: 'pericope',
      text: funeral.gospel_reading.pericope || '',
    })

    if (funeral.presider) {
      elements.push({
        type: 'reader-name',
        text: formatPersonName(funeral.presider),
      })
    }

    elements.push({
      type: 'response',
      parts: [
        { text: 'All:', formatting: ['bold'] },
        { text: ' Glory to you, O Lord.', formatting: ['italic'] },
      ],
    })

    if (funeral.gospel_reading.introduction) {
      elements.push({
        type: 'introduction',
        text: funeral.gospel_reading.introduction,
      })
    }

    if (funeral.gospel_reading.text) {
      elements.push({
        type: 'reading-text',
        text: funeral.gospel_reading.text,
        preserveLineBreaks: true,
      })
    }

    if (funeral.gospel_reading.conclusion) {
      elements.push({
        type: 'conclusion',
        text: funeral.gospel_reading.conclusion,
      })
    }

    elements.push({
      type: 'response',
      parts: [
        { text: 'All:', formatting: ['bold'] },
        { text: ' Praise to you, Lord Jesus Christ.', formatting: ['italic'] },
      ],
    })
  }

  return {
    id: 'liturgy-of-the-word',
    title: 'Liturgy of the Word',
    elements,
  }
}

/**
 * Build petitions section
 */
function buildPetitionsSection(funeral: FuneralWithRelations): ContentSection | null {
  if (!funeral.petitions) return null

  const elements: ContentElement[] = []

  elements.push({
    type: 'section-title',
    text: 'Universal Prayer (Petitions)',
  })

  const petitionReader = funeral.petitions_read_by_second_reader
    ? funeral.second_reader
    : funeral.petition_reader

  if (petitionReader) {
    elements.push({
      type: 'reader-name',
      text: formatPersonName(petitionReader),
    })
  }

  // Add introductory instruction
  elements.push({
    type: 'petition',
    parts: [
      { text: 'Reader:', formatting: ['bold'] },
      { text: ' The response is "Lord, hear our prayer." ', formatting: ['bold'] },
    ],
  })

  // Split petitions by line breaks and create elements
  const petitionLines = funeral.petitions.split('\n').filter(line => line.trim())
  for (const petition of petitionLines) {
    const petitionText = petition.trim().replace(/\.$/, '')

    elements.push({
      type: 'petition',
      parts: [
        { text: 'Reader:', formatting: ['bold'] },
        { text: ` ${petitionText}, let us pray to the Lord.`, formatting: ['bold'] },
      ],
    })

    elements.push({
      type: 'response',
      parts: [
        { text: 'All:', formatting: ['bold'] },
        { text: ' Lord, hear our prayer.', formatting: ['italic'] },
      ],
    })
  }

  return {
    id: 'petitions',
    title: 'Petitions',
    elements,
  }
}

/**
 * Build announcements section
 */
function buildAnnouncementsSection(funeral: FuneralWithRelations): ContentSection | null {
  if (!funeral.announcements) return null

  const elements: ContentElement[] = []

  elements.push({
    type: 'section-title',
    text: 'Announcements',
  })

  const announcementLines = funeral.announcements.split('\n').filter(line => line.trim())
  for (const line of announcementLines) {
    elements.push({
      type: 'text',
      text: line.trim(),
    })
  }

  return {
    id: 'announcements',
    title: 'Announcements',
    elements,
  }
}

/**
 * Main builder function
 */
export function buildFullScriptEnglish(funeral: FuneralWithRelations): LiturgyDocument {
  // Build funeral title
  const funeralTitle = funeral.deceased
    ? `Funeral Liturgy for ${formatPersonName(funeral.deceased)}`
    : 'Funeral Liturgy'

  const eventDateTime =
    funeral.funeral_event?.start_date && funeral.funeral_event?.start_time
      ? formatEventDateTime(funeral.funeral_event)
      : 'Missing Date and Time'

  const sections: ContentSection[] = []

  // Add summary section
  sections.push(buildSummarySection(funeral))

  // Add liturgy of the word
  sections.push(buildLiturgyOfTheWordSection(funeral))

  // Add petitions if present
  const petitionsSection = buildPetitionsSection(funeral)
  if (petitionsSection) {
    sections.push(petitionsSection)
  }

  // Add announcements if present
  const announcementsSection = buildAnnouncementsSection(funeral)
  if (announcementsSection) {
    sections.push(announcementsSection)
  }

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
