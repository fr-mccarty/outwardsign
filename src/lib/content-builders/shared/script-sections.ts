/**
 * Shared Reading Sections
 *
 * Common content builder functions used across multiple liturgy modules
 * (weddings, funerals, baptisms, presentations, etc.)
 */

import { ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName } from '@/lib/utils/formatters'

/**
 * Configuration for building a reading section
 */
export interface ReadingSectionConfig {
  id: string
  title: string
  reading: any // The reading object (first_reading, second_reading, or gospel_reading)
  reader?: any // The reader object (first_reader, second_reader, or null for gospel)
  responseText?: string
  includeGospelDialogue?: boolean
  includeGospelAcclamations?: boolean // Add gospel acclamations (Glory/Praise)
  pageBreakBefore?: boolean
  showNoneSelected?: boolean
}

/**
 * Build reading section (first, second, or gospel)
 */
export function buildReadingSection(config: ReadingSectionConfig): ContentSection {
  const {
    id,
    title,
    reading,
    reader,
    responseText,
    includeGospelDialogue = false,
    includeGospelAcclamations = false,
    pageBreakBefore = false,
    showNoneSelected = false,
  } = config

  const elements: ContentElement[] = []

  if (reading) {
    elements.push({
      type: 'reading-title',
      text: title,
    })

    elements.push({
      type: 'pericope',
      text: reading.pericope || 'No pericope',
    })

    if (reader) {
      elements.push({
        type: 'reader-name',
        text: formatPersonName(reader),
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
        label: 'People:',
        text: 'And with your spirit.',
      })
    }

    // Gospel acclamation before reading
    if (includeGospelAcclamations) {
      elements.push({
        type: 'response',
        label: 'People:',
        text: 'Glory to you, O Lord.',
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
        label: 'People:',
        text: responseText,
      })
    }

    // Gospel acclamation after reading
    if (includeGospelAcclamations) {
      elements.push({
        type: 'response',
        label: 'People:',
        text: 'Praise to you, Lord Jesus Christ.',
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
 * Configuration for building a psalm section
 */
export interface PsalmSectionConfig {
  psalm: any // The psalm reading object
  psalm_reader?: any // The psalm reader person
  psalm_is_sung?: boolean // Whether the psalm is sung
}

/**
 * Build psalm section
 */
export function buildPsalmSection(config: PsalmSectionConfig): ContentSection {
  const { psalm, psalm_reader, psalm_is_sung } = config
  const elements: ContentElement[] = []

  if (psalm) {
    elements.push({
      type: 'reading-title',
      text: 'Psalm',
    })

    elements.push({
      type: 'pericope',
      text: psalm.pericope || 'No pericope',
    })

    if (psalm_is_sung) {
      elements.push({
        type: 'reader-name',
        text: 'Sung',
      })
    } else if (psalm_reader) {
      elements.push({
        type: 'reader-name',
        text: formatPersonName(psalm_reader),
      })
    }

    if (psalm.introduction) {
      elements.push({
        type: 'introduction',
        text: psalm.introduction,
      })
    }

    elements.push({
      type: 'reading-text',
      text: psalm.text || 'No psalm text',
    })

    if (psalm.conclusion) {
      elements.push({
        type: 'conclusion',
        text: psalm.conclusion,
      })
    }
  }

  return {
    id: 'psalm',
    pageBreakBefore: psalm ? true : false,
    elements,
  }
}

/**
 * Configuration for building a petitions section
 */
export interface PetitionsSectionConfig {
  petitions?: string | null // The petitions text (newline-separated)
  petition_reader?: any // The designated petition reader
  second_reader?: any // The second reader (fallback if petitions_read_by_second_reader is true)
  petitions_read_by_second_reader?: boolean // Whether second reader reads petitions
}

/**
 * Build petitions section
 */
export function buildPetitionsSection(config: PetitionsSectionConfig): ContentSection | null {
  const { petitions, petition_reader, second_reader, petitions_read_by_second_reader } = config

  if (!petitions) return null

  const elements: ContentElement[] = []

  // Determine petition reader
  const petitionsReader = petitions_read_by_second_reader && second_reader
    ? formatPersonName(second_reader)
    : petition_reader
    ? formatPersonName(petition_reader)
    : ''

  elements.push({
    type: 'reading-title',
    text: 'Petitions',
  })

  if (petitionsReader) {
    elements.push({
      type: 'reader-name',
      text: petitionsReader,
    })
  }

  elements.push({ type: 'spacer', size: 'medium' })

  // Introductory petition instruction
  elements.push({
    type: 'petition',
    label: 'Reader:',
    text: 'The response is "Lord, hear our prayer." [Pause]',
  })

  // Petitions from database - just format what's saved
  const petitionLines = petitions.split('\n').filter((p) => p.trim())

  petitionLines.forEach((petition) => {
    // Strip trailing period if present, then add ", let us pray to the Lord."
    const petitionText = petition.trim().replace(/\.$/, '')

    elements.push({
      type: 'petition',
      label: 'Reader:',
      text: `${petitionText}, let us pray to the Lord.`,
    })

    elements.push({
      type: 'response',
      label: 'People:',
      text: 'Lord, hear our prayer.',
    })
  })

  return {
    id: 'petitions',
    pageBreakBefore: true,
    pageBreakAfter: true,
    elements,
  }
}

/**
 * Build announcements section
 */
export function buildAnnouncementsSection(announcements?: string | null): ContentSection | null {
  if (!announcements) return null

  return {
    id: 'announcements',
    elements: [
      {
        type: 'section-title',
        text: 'Announcements',
      },
      {
        type: 'reading-text',
        text: announcements,
      },
    ],
  }
}
