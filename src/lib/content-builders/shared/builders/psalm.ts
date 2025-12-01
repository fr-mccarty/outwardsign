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
 * Note: Does NOT include pageBreakAfter - the parent template builder is responsible
 * for adding page breaks BETWEEN sections (not after the last section).
 *
 * @param config - Configuration object with psalm, psalm_reader, and psalm_is_sung
 * @returns ContentSection or null if no psalm or if psalm is sung
 *
 * @example
 * buildPsalmSection({
 *   psalm: wedding.psalm,
 *   psalm_reader: wedding.psalm_reader,
 *   psalm_is_sung: wedding.psalm_is_sung
 * })
 */
export function buildPsalmSection(config: {
  psalm: any
  psalm_reader?: any
  psalm_is_sung?: boolean
}): ContentSection | null {
  const { psalm, psalm_reader: reader, psalm_is_sung: isSung } = config

  // No psalm or psalm is sung - exclude section
  if (!psalm || (isSung ?? false)) {
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
  if (reader) {
    elements.push({
      type: 'reader-name',
      text: reader.full_name,
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
    // Parse psalm text to extract response and verses
    // Format: "Reader: verse People: response Reader: verse People: response..."
    // Split by "Reader:" and "People:" markers
    const text = psalm.text.trim()

    // Find all "Reader:" and "People:" occurrences
    const readerMatches = [...text.matchAll(/Reader:\s*([^]*?)(?=\s*People:|$)/g)]
    const peopleMatches = [...text.matchAll(/People:\s*([^]*?)(?=\s*Reader:|$)/g)]

    if (readerMatches.length > 0 && peopleMatches.length > 0) {
      // Extract response (should be the same each time)
      const response = peopleMatches[0][1].trim()

      // Extract all verses
      const verses = readerMatches.map(match => match[1].trim()).filter(v => v)

      // Create psalm element if we have both response and verses
      if (response && verses.length > 0) {
        elements.push({
          type: 'psalm',
          response,
          verses,
        })
      } else {
        // Fallback to plain text
        elements.push({
          type: 'reading-text',
          text: psalm.text,
        })
      }
    } else {
      // Fallback: If psalm doesn't have the expected "Reader:/People:" format,
      // render it as plain reading text
      elements.push({
        type: 'reading-text',
        text: psalm.text,
      })
    }
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
    elements,
  }
}
