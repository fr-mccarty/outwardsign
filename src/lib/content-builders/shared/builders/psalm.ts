/**
 * Psalm Builder
 *
 * Abstracted builder for creating psalm sections with customizable content
 * Handles responsorial psalms that can be sung or read
 */

import { ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName } from '@/lib/utils/formatters'

/**
 * Configuration for building a psalm section
 */
export interface PsalmSectionConfig {
  id?: string // Section ID (default: 'psalm')
  title?: string // Section title (default: 'Psalm')
  psalm: any // The psalm reading object with pericope, text, introduction, conclusion
  psalm_reader?: any // The psalm reader person (or null if sung)
  psalm_is_sung?: boolean // Whether the psalm is sung (overrides reader)
  pageBreakBefore?: boolean // Add page break before psalm (default: true)
  responseRefrain?: string // Optional response refrain to display
  includeInstruction?: boolean // Include instruction for cantor/reader (default: false)
}

/**
 * Build a psalm section
 *
 * Creates a responsorial psalm section with:
 * - Psalm title
 * - Pericope (e.g., "Psalm 23")
 * - Reader or "Sung" indicator
 * - Optional response refrain
 * - Optional instruction for cantor/reader
 * - Introduction (if present)
 * - Psalm text
 * - Conclusion (if present)
 *
 * Returns null if no psalm is provided.
 *
 * @example
 * // Basic psalm
 * const psalm = buildPsalmSection({
 *   psalm: wedding.psalm,
 *   psalm_reader: wedding.psalm_reader,
 *   psalm_is_sung: wedding.psalm_is_sung,
 * })
 *
 * @example
 * // Psalm with refrain and instruction
 * const psalmWithRefrain = buildPsalmSection({
 *   psalm: mass.psalm,
 *   psalm_is_sung: true,
 *   responseRefrain: 'R. The Lord is my shepherd; there is nothing I shall want.',
 *   includeInstruction: true,
 * })
 */
export function buildPsalmSection(config: PsalmSectionConfig): ContentSection | null {
  const {
    id = 'psalm',
    title = 'Psalm',
    psalm,
    psalm_reader,
    psalm_is_sung = false,
    pageBreakBefore = true,
    responseRefrain,
    includeInstruction = false,
  } = config

  // No psalm selected - exclude section
  if (!psalm) {
    return null
  }

  const elements: ContentElement[] = []

  // Psalm title
  elements.push({
    type: 'reading-title',
    text: title,
  })

  // Pericope (e.g., "Psalm 23")
  elements.push({
    type: 'pericope',
    text: psalm.pericope || 'No pericope',
  })

  // Reader name or "Sung" indicator
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

  // Optional response refrain
  if (responseRefrain) {
    elements.push({
      type: 'spacer',
      size: 'small',
    })
    elements.push({
      type: 'response',
      label: 'Response:',
      text: responseRefrain,
    })
    elements.push({
      type: 'spacer',
      size: 'small',
    })
  }

  // Optional instruction for cantor/reader
  if (includeInstruction) {
    elements.push({
      type: 'rubric',
      text: psalm_is_sung
        ? 'The cantor sings the verses, and the assembly sings the response.'
        : 'The reader proclaims the verses, and the assembly responds.',
    })
    elements.push({
      type: 'spacer',
      size: 'small',
    })
  }

  // Introduction (if present)
  if (psalm.introduction) {
    elements.push({
      type: 'introduction',
      text: psalm.introduction,
    })
  }

  // Psalm text (main content)
  elements.push({
    type: 'reading-text',
    text: psalm.text || 'No psalm text',
  })

  // Conclusion (if present)
  if (psalm.conclusion) {
    elements.push({
      type: 'conclusion',
      text: psalm.conclusion,
    })
  }

  return {
    id,
    pageBreakBefore,
    elements,
  }
}
