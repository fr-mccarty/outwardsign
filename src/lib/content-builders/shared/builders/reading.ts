/**
 * Reading Builder
 *
 * Builds reading sections for First Reading, Second Reading, and Gospel
 * Structure: Reading Title > Reading Name > Reader Name > Reading (intro, body, conclusion)
 */

import { ContentSection, ContentElement } from '@/lib/types/liturgy-content'

/**
 * Build a reading section
 *
 * Creates a reading section with standard liturgical structure.
 * Returns null if no reading is provided.
 * Note: Does NOT include pageBreakAfter - the parent template builder is responsible
 * for adding page breaks BETWEEN sections (not after the last section).
 *
 * @param config - Configuration object with id, title, reading, and optional reader
 * @returns ContentSection or null if no reading provided
 *
 * @example
 * buildReadingSection({
 *   id: 'first-reading',
 *   title: 'FIRST READING',
 *   reading: wedding.first_reading,
 *   reader: wedding.first_reader
 * })
 */
export function buildReadingSection(config: {
  id: string
  title: string
  reading: any
  reader?: any
}): ContentSection | null {
  const { id, title, reading, reader } = config

  // No reading - exclude section
  if (!reading) {
    return null
  }

  const elements: ContentElement[] = []

  // Reading title (e.g., "FIRST READING")
  elements.push({
    type: 'reading-title',
    text: title,
  })

  // Reading name / pericope (e.g., "Romans 12:1-2")
  if (reading.pericope) {
    elements.push({
      type: 'pericope',
      text: reading.pericope,
    })
  }

  // Name of reader
  if (reader) {
    elements.push({
      type: 'reader-name',
      text: reader.full_name,
    })
  }

  // Reading itself
  // Introduction (if present)
  if (reading.introduction) {
    elements.push({
      type: 'introduction',
      text: reading.introduction,
    })
  }

  // Body text
  if (reading.text) {
    elements.push({
      type: 'reading-text',
      text: reading.text,
    })
  }

  // Conclusion (if present)
  if (reading.conclusion) {
    elements.push({
      type: 'conclusion',
      text: reading.conclusion,
    })
  }

  // Response after reading
  elements.push({
    type: 'response-dialogue',
    label: 'People:',
    text: 'Thanks be to God.',
  })

  return {
    id,
    elements,
  }
}
