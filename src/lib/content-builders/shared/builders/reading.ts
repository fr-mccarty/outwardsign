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
 * Always has pageBreakAfter: true.
 *
 * Supports two calling styles:
 * 1. Simple: buildReadingSection(id, title, reading, reader)
 * 2. Config: buildReadingSection({ id, title, reading, reader, ... })
 *
 * @example
 * // Simple style
 * buildReadingSection('first-reading', 'FIRST READING', wedding.first_reading, wedding.first_reader)
 *
 * @example
 * // Config style (backward compatible)
 * buildReadingSection({ id: 'first-reading', title: 'FIRST READING', reading: wedding.first_reading, reader: wedding.first_reader })
 */
export function buildReadingSection(
  idOrConfig: string | { id: string; title: string; reading: any; reader?: any; [key: string]: any },
  title?: string,
  reading?: any,
  reader?: any
): ContentSection | null {
  // Handle both calling styles
  let id: string
  let actualReading: any
  let actualReader: any
  let actualTitle: string

  if (typeof idOrConfig === 'string') {
    // Simple style: buildReadingSection(id, title, reading, reader)
    id = idOrConfig
    actualTitle = title!
    actualReading = reading
    actualReader = reader
  } else {
    // Config style: buildReadingSection({ id, title, reading, reader })
    id = idOrConfig.id
    actualTitle = idOrConfig.title
    actualReading = idOrConfig.reading
    actualReader = idOrConfig.reader
  }

  // No reading - exclude section
  if (!actualReading) {
    return null
  }

  const elements: ContentElement[] = []

  // Reading title (e.g., "FIRST READING")
  elements.push({
    type: 'reading-title',
    text: actualTitle,
  })

  // Reading name / pericope (e.g., "Romans 12:1-2")
  if (actualReading.pericope) {
    elements.push({
      type: 'pericope',
      text: actualReading.pericope,
    })
  }

  // Name of reader
  if (actualReader) {
    elements.push({
      type: 'reader-name',
      text: actualReader.full_name,
    })
  }

  // Reading itself
  // Introduction (if present)
  if (actualReading.introduction) {
    elements.push({
      type: 'introduction',
      text: actualReading.introduction,
    })
  }

  // Body text
  if (actualReading.text) {
    elements.push({
      type: 'reading-text',
      text: actualReading.text,
    })
  }

  // Conclusion (if present)
  if (actualReading.conclusion) {
    elements.push({
      type: 'conclusion',
      text: actualReading.conclusion,
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
    pageBreakAfter: true,
    elements,
  }
}
