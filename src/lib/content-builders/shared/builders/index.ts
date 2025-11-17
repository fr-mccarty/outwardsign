/**
 * Content Builder Components Index
 *
 * Exports all abstracted builder components for creating liturgy documents
 */

// Cover Page Builder
export {
  buildCoverPage,
  buildSimpleCoverPage,
  type CoverPageConfig,
  type CoverPageSection,
  type CoverPageInfoRow,
} from './cover-page'

// Reading Builder
export {
  buildReadingSection,
  type ReadingSectionConfig,
} from './reading'

// Psalm Builder
export {
  buildPsalmSection,
  type PsalmSectionConfig,
} from './psalm'

// Petitions Builder
export {
  buildPetitionsSection,
  buildPetitionsFromArray,
  type PetitionsSectionConfig,
} from './petitions'

// Ceremony Builder
export {
  buildCeremonySection,
  buildDialogueExchange,
  buildPrayerWithAmen,
  buildQuestionSeries,
  buildRubricAction,
  type CeremonySectionConfig,
  type CeremonyElement,
} from './ceremony'
