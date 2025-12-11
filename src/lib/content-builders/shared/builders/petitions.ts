/**
 * Petitions Builder
 *
 * Builds petitions (Prayer of the Faithful) section
 * Structure: Petition Title > Reader Name > Individual Petitions
 *
 * Petitions are displayed exactly as entered - no automatic formatting or appending.
 */

import { ContentSection, ContentElement } from '@/lib/types/liturgy-content'

/**
 * Build a petitions section
 *
 * Creates petitions section displaying petition text exactly as entered.
 * Returns null if no petitions provided.
 * Note: Does NOT include pageBreakAfter - the parent template builder is responsible
 * for adding page breaks BETWEEN sections (not after the last section).
 *
 * @param config - Configuration object with petitions and reader information
 * @returns ContentSection or null if no petitions provided
 *
 * @example
 * buildPetitionsSection({
 *   petitions: wedding.petitions,
 *   petition_reader: wedding.petition_reader,
 *   second_reader: wedding.second_reader,
 *   petitions_read_by_second_reader: true
 * })
 */
export function buildPetitionsSection(config?: {
  petitions?: string | null
  petition_reader?: any
  second_reader?: any
  petitions_read_by_second_reader?: boolean
}): ContentSection | null {
  if (!config) return null

  const { petitions, petition_reader, second_reader, petitions_read_by_second_reader } = config

  // No petitions - exclude section
  if (!petitions) {
    return null
  }

  // Determine reader (with fallback logic)
  const reader = (petitions_read_by_second_reader && second_reader) ? second_reader : petition_reader

  const elements: ContentElement[] = []

  // Petition title
  elements.push({
    type: 'reading-title',
    text: 'Petitions',
  })

  // Name of reader
  if (reader) {
    elements.push({
      type: 'reader-name',
      text: reader.full_name,
    })
  }

  // Spacing
  elements.push({
    type: 'spacer',
    size: 'medium',
  })

  // Individual petitions - displayed exactly as entered
  const petitionLines = petitions.split('\n').filter((p) => p.trim())

  petitionLines.forEach((petition) => {
    elements.push({
      type: 'petition',
      label: 'Reader:',
      text: petition.trim(),
    })
  })

  return {
    id: 'petitions',
    elements,
  }
}
