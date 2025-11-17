/**
 * Shared Script Sections
 *
 * Common content builder functions used across multiple liturgy modules
 * (weddings, funerals, baptisms, presentations, etc.)
 *
 * NOTE: This file now re-exports from the modular builders in ./builders/
 * for backward compatibility. New code should import directly from ./builders/
 */

import { ContentSection } from '@/lib/types/liturgy-content'

// Re-export all builders for backward compatibility
export {
  buildReadingSection,
  type ReadingSectionConfig,
} from './builders/reading'

export {
  buildPsalmSection,
  type PsalmSectionConfig,
} from './builders/psalm'

export {
  buildPetitionsSection,
  buildPetitionsFromArray,
  type PetitionsSectionConfig,
} from './builders/petitions'

export {
  buildCoverPage,
  buildSimpleCoverPage,
  type CoverPageConfig,
  type CoverPageSection,
  type CoverPageInfoRow,
} from './builders/cover-page'

export {
  buildCeremonySection,
  buildDialogueExchange,
  buildPrayerWithAmen,
  buildQuestionSeries,
  buildRubricAction,
  type CeremonySectionConfig,
  type CeremonyElement,
} from './builders/ceremony'

/**
 * Build announcements section
 *
 * Simple builder for announcements (not moved to separate file as it's very simple)
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
