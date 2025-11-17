/**
 * Shared Script Sections
 *
 * Re-exports builder functions for backward compatibility
 * All builders now live in ./builders/ directory
 */

// Re-export all builders
export { buildCoverPage, type CoverPageSection, type CoverPageRow } from './builders/cover-page'

export { buildReadingSection } from './builders/reading'

export { buildPsalmSection } from './builders/psalm'

export { buildPetitionsSection } from './builders/petitions'

export { buildAnnouncementsSection } from './builders/announcements'

export { buildCeremonySection } from './builders/ceremony'
