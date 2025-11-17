/**
 * Reading Builder
 *
 * Abstracted builder for creating reading sections (First Reading, Second Reading, Gospel)
 * Handles pericope, reader name, introduction, text, conclusion, and responses
 */

import { ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName } from '@/lib/utils/formatters'

/**
 * Configuration for building a reading section
 */
export interface ReadingSectionConfig {
  id: string // Section ID (e.g., 'first-reading', 'second-reading', 'gospel')
  title: string // Reading title (e.g., 'FIRST READING', 'GOSPEL')
  reading: any // The reading object with pericope, text, introduction, conclusion
  reader?: any // The reader person object (optional, e.g., first_reader, second_reader)
  responseText?: string // Response after reading (e.g., 'Thanks be to God.')
  includeGospelDialogue?: boolean // Include "Lord be with you" dialogue before gospel
  includeGospelAcclamations?: boolean // Include "Glory/Praise to you" acclamations
  pageBreakBefore?: boolean // Add page break before this reading
  showNoneSelected?: boolean // Show "None Selected" if no reading (instead of null)
}

/**
 * Build a reading section
 *
 * Creates a complete reading section with all standard elements:
 * - Reading title (FIRST READING, SECOND READING, GOSPEL)
 * - Pericope (e.g., "Romans 12:1-2")
 * - Reader name (formatted)
 * - Gospel dialogue (optional, for Gospel only)
 * - Gospel acclamations (optional, before and after Gospel)
 * - Introduction (if present in reading object)
 * - Reading text
 * - Conclusion (if present in reading object)
 * - Response (e.g., "Thanks be to God")
 *
 * Returns null if no reading is provided and showNoneSelected is false.
 *
 * @example
 * // First Reading
 * const firstReading = buildReadingSection({
 *   id: 'first-reading',
 *   title: 'FIRST READING',
 *   reading: wedding.first_reading,
 *   reader: wedding.first_reader,
 *   responseText: 'Thanks be to God.',
 * })
 *
 * @example
 * // Gospel with acclamations
 * const gospel = buildReadingSection({
 *   id: 'gospel',
 *   title: 'GOSPEL',
 *   reading: wedding.gospel_reading,
 *   reader: wedding.presider,
 *   includeGospelAcclamations: true,
 *   pageBreakBefore: true,
 * })
 */
export function buildReadingSection(config: ReadingSectionConfig): ContentSection | null {
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
    // Reading title
    elements.push({
      type: 'reading-title',
      text: title,
    })

    // Pericope (e.g., "Romans 12:1-2")
    elements.push({
      type: 'pericope',
      text: reading.pericope || 'No pericope',
    })

    // Reader name (formatted)
    if (reader) {
      elements.push({
        type: 'reader-name',
        text: formatPersonName(reader),
      })
    }

    // Gospel-specific dialogue (before acclamation)
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

    // Introduction (if present)
    if (reading.introduction) {
      elements.push({
        type: 'introduction',
        text: reading.introduction,
      })
    }

    // Reading text (main content)
    elements.push({
      type: 'reading-text',
      text: reading.text || 'No reading text',
    })

    // Conclusion (if present)
    if (reading.conclusion) {
      elements.push({
        type: 'conclusion',
        text: reading.conclusion,
      })
    }

    // Response after reading (e.g., "Thanks be to God")
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
    // No reading selected - show placeholder
    elements.push({
      type: 'text',
      text: 'None Selected',
    })
  } else {
    // No reading and not showing placeholder - exclude section entirely
    return null
  }

  return {
    id,
    pageBreakBefore,
    elements,
  }
}
