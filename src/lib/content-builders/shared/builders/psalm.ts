/**
 * Psalm Builder
 *
 * Builds psalm section (only if not sung)
 * Structure: Psalm Title > Psalm Name > Reader Name > Psalm (intro, response, verses)
 */

import { ContentSection, ContentElement } from '@/lib/types/liturgy-content'

/**
 * Build a psalm section
 *
 * Creates a responsorial psalm section.
 * Returns null if no psalm OR if psalm is sung.
 * Always has pageBreakAfter: true.
 *
 * Supports two calling styles:
 * 1. Simple: buildPsalmSection(psalm, reader, isSung)
 * 2. Config: buildPsalmSection({ psalm, psalm_reader, psalm_is_sung })
 *
 * @example
 * // Simple style
 * buildPsalmSection(wedding.psalm, wedding.psalm_reader, wedding.psalm_is_sung)
 *
 * @example
 * // Config style (backward compatible)
 * buildPsalmSection({ psalm: wedding.psalm, psalm_reader: wedding.psalm_reader, psalm_is_sung: wedding.psalm_is_sung })
 */
export function buildPsalmSection(
  psalmOrConfig: any | { psalm: any; psalm_reader?: any; psalm_is_sung?: boolean; [key: string]: any },
  reader?: any,
  isSung?: boolean
): ContentSection | null {
  // Handle both calling styles
  let psalm: any
  let actualReader: any
  let actualIsSung: boolean

  if (psalmOrConfig && typeof psalmOrConfig === 'object' && 'psalm' in psalmOrConfig) {
    // Config style: buildPsalmSection({ psalm, psalm_reader, psalm_is_sung })
    psalm = psalmOrConfig.psalm
    actualReader = psalmOrConfig.psalm_reader
    actualIsSung = psalmOrConfig.psalm_is_sung || false
  } else {
    // Simple style: buildPsalmSection(psalm, reader, isSung)
    psalm = psalmOrConfig
    actualReader = reader
    actualIsSung = isSung || false
  }

  // No psalm or psalm is sung - exclude section
  if (!psalm || actualIsSung) {
    return null
  }

  const elements: ContentElement[] = []

  // Psalm title
  elements.push({
    type: 'reading-title',
    text: 'Psalm',
  })

  // Psalm name / pericope (e.g., "Psalm 23")
  if (psalm.pericope) {
    elements.push({
      type: 'pericope',
      text: psalm.pericope,
    })
  }

  // Name of reader
  if (actualReader) {
    elements.push({
      type: 'reader-name',
      text: actualReader.full_name,
    })
  }

  // Psalm itself
  // Introduction (if present)
  if (psalm.introduction) {
    elements.push({
      type: 'introduction',
      text: psalm.introduction,
    })
  }

  // Psalm text (response and verses)
  if (psalm.text) {
    elements.push({
      type: 'reading-text',
      text: psalm.text,
    })
  }

  // Conclusion (if present)
  if (psalm.conclusion) {
    elements.push({
      type: 'conclusion',
      text: psalm.conclusion,
    })
  }

  return {
    id: 'psalm',
    pageBreakAfter: true,
    elements,
  }
}
