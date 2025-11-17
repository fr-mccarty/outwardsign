/**
 * Petitions Builder
 *
 * Abstracted builder for creating petitions sections with customizable content
 * Less structured than psalm - allows for free-form petitions text
 */

import { ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName } from '@/lib/utils/formatters'

/**
 * Configuration for building a petitions section
 */
export interface PetitionsSectionConfig {
  id?: string // Section ID (default: 'petitions')
  title?: string // Section title (default: 'Petitions')
  petitions?: string | null // The petitions text (newline-separated or custom format)
  petition_reader?: any // The designated petition reader
  second_reader?: any // The second reader (fallback if petitions_read_by_second_reader is true)
  petitions_read_by_second_reader?: boolean // Whether second reader reads petitions
  responseText?: string // Custom response text (default: 'Lord, hear our prayer.')
  includeInstruction?: boolean // Include instruction for response (default: true)
  pageBreakBefore?: boolean // Add page break before petitions (default: true)
  pageBreakAfter?: boolean // Add page break after petitions (default: true)
  format?: 'standard' | 'custom' // Format type (default: 'standard')
}

/**
 * Build a petitions section
 *
 * Creates a petitions section with:
 * - Petitions title
 * - Reader name (formatted)
 * - Optional instruction for response
 * - Individual petition lines (formatted)
 * - Responses after each petition
 *
 * Standard format: Adds "let us pray to the Lord" to each petition
 * Custom format: Uses petitions text as-is
 *
 * Returns null if no petitions are provided.
 *
 * @example
 * // Standard petitions (auto-formatted)
 * const petitions = buildPetitionsSection({
 *   petitions: wedding.petitions, // Multi-line string
 *   petition_reader: wedding.petition_reader,
 * })
 *
 * @example
 * // Custom petitions with different response
 * const customPetitions = buildPetitionsSection({
 *   petitions: mass.petitions,
 *   responseText: 'Hear us, O Lord.',
 *   format: 'custom',
 * })
 */
export function buildPetitionsSection(config: PetitionsSectionConfig): ContentSection | null {
  const {
    id = 'petitions',
    title = 'Petitions',
    petitions,
    petition_reader,
    second_reader,
    petitions_read_by_second_reader = false,
    responseText = 'Lord, hear our prayer.',
    includeInstruction = true,
    pageBreakBefore = true,
    pageBreakAfter = true,
    format = 'standard',
  } = config

  // No petitions - exclude section
  if (!petitions) {
    return null
  }

  const elements: ContentElement[] = []

  // Determine petition reader
  const petitionsReader = petitions_read_by_second_reader && second_reader
    ? formatPersonName(second_reader)
    : petition_reader
    ? formatPersonName(petition_reader)
    : ''

  // Petitions title
  elements.push({
    type: 'reading-title',
    text: title,
  })

  // Reader name (if available)
  if (petitionsReader) {
    elements.push({
      type: 'reader-name',
      text: petitionsReader,
    })
  }

  // Spacing before petitions
  elements.push({
    type: 'spacer',
    size: 'medium',
  })

  // Instruction for response (if enabled)
  if (includeInstruction) {
    elements.push({
      type: 'petition',
      label: 'Reader:',
      text: `The response is "${responseText}" [Pause]`,
    })
  }

  // Process petition lines
  const petitionLines = petitions.split('\n').filter((p) => p.trim())

  petitionLines.forEach((petition) => {
    if (format === 'standard') {
      // Standard format: Add "let us pray to the Lord" to each petition
      // Strip trailing period if present
      const petitionText = petition.trim().replace(/\.$/, '')

      elements.push({
        type: 'petition',
        label: 'Reader:',
        text: `${petitionText}, let us pray to the Lord.`,
      })
    } else {
      // Custom format: Use petition text as-is
      elements.push({
        type: 'petition',
        label: 'Reader:',
        text: petition.trim(),
      })
    }

    // Response after each petition
    elements.push({
      type: 'response',
      label: 'People:',
      text: responseText,
    })
  })

  return {
    id,
    pageBreakBefore,
    pageBreakAfter,
    elements,
  }
}

/**
 * Build a simple petitions section from an array of petition strings
 *
 * Convenience wrapper for when you have an array instead of a multi-line string
 *
 * @example
 * buildPetitionsFromArray({
 *   petitions: [
 *     'For the Church throughout the world',
 *     'For our Holy Father, Pope Francis',
 *     'For peace in our world',
 *   ],
 *   petition_reader: mass.petition_reader,
 * })
 */
export function buildPetitionsFromArray(
  config: Omit<PetitionsSectionConfig, 'petitions'> & { petitions: string[] }
): ContentSection | null {
  const { petitions, ...rest } = config
  return buildPetitionsSection({
    ...rest,
    petitions: petitions.join('\n'),
  })
}
