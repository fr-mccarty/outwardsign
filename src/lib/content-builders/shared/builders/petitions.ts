/**
 * Petitions Builder
 *
 * Builds petitions (Prayer of the Faithful) section
 * Structure: Petition Title > Reader Name > Introduction > Individual Petitions
 */

import { ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName } from '@/lib/utils/formatters'

/**
 * Build a petitions section
 *
 * Creates petitions section with standard liturgical format.
 * Each petition line gets "let us pray to the Lord" appended.
 * Returns null if no petitions provided.
 * Always has pageBreakAfter: true.
 *
 * Supports two calling styles:
 * 1. Simple: buildPetitionsSection(petitions, reader)
 * 2. Config: buildPetitionsSection({ petitions, petition_reader, second_reader, petitions_read_by_second_reader })
 *
 * @example
 * // Simple style
 * buildPetitionsSection(wedding.petitions, wedding.petition_reader)
 *
 * @example
 * // Config style (backward compatible, supports fallback reader logic)
 * buildPetitionsSection({
 *   petitions: wedding.petitions,
 *   petition_reader: wedding.petition_reader,
 *   second_reader: wedding.second_reader,
 *   petitions_read_by_second_reader: true
 * })
 */
export function buildPetitionsSection(
  petitionsOrConfig?: string | null | { petitions?: string | null; petition_reader?: any; second_reader?: any; petitions_read_by_second_reader?: boolean; [key: string]: any },
  reader?: any
): ContentSection | null {
  // Handle both calling styles
  let petitions: string | null | undefined
  let actualReader: any

  if (typeof petitionsOrConfig === 'string' || petitionsOrConfig === null || petitionsOrConfig === undefined) {
    // Simple style: buildPetitionsSection(petitions, reader)
    petitions = petitionsOrConfig
    actualReader = reader
  } else {
    // Config style: buildPetitionsSection({ petitions, petition_reader, second_reader, petitions_read_by_second_reader })
    petitions = petitionsOrConfig.petitions

    // Determine reader (with fallback logic)
    if (petitionsOrConfig.petitions_read_by_second_reader && petitionsOrConfig.second_reader) {
      actualReader = petitionsOrConfig.second_reader
    } else {
      actualReader = petitionsOrConfig.petition_reader
    }
  }

  // No petitions - exclude section
  if (!petitions) {
    return null
  }

  const elements: ContentElement[] = []

  // Petition title
  elements.push({
    type: 'reading-title',
    text: 'Petitions',
  })

  // Name of reader
  if (actualReader) {
    elements.push({
      type: 'reader-name',
      text: formatPersonName(actualReader),
    })
  }

  // Spacing
  elements.push({
    type: 'spacer',
    size: 'medium',
  })

  // Petition introduction (instruction for response)
  elements.push({
    type: 'petition',
    label: 'Reader:',
    text: 'The response is "Lord, hear our prayer." [Pause]',
  })

  // Individual petitions
  const petitionLines = petitions.split('\n').filter((p) => p.trim())

  petitionLines.forEach((petition) => {
    // Remove trailing period if present
    const petitionText = petition.trim().replace(/\.$/, '')

    // Petition with "let us pray to the Lord"
    elements.push({
      type: 'petition',
      label: 'Reader:',
      text: `${petitionText}, let us pray to the Lord.`,
    })

    // Response after each petition
    elements.push({
      type: 'response',
      label: 'People:',
      text: 'Lord, hear our prayer.',
    })
  })

  return {
    id: 'petitions',
    pageBreakAfter: true,
    elements,
  }
}
