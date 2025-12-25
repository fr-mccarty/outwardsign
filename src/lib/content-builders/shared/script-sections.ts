/**
 * Shared Script Sections
 *
 * Re-exports builder functions for backward compatibility
 * All builders now live in ./builders/ directory
 */

// Re-export all builders
export { buildCoverPage, type CoverPageSection, type CoverPageRow } from './builders/cover-page'

export { buildPetitionsSection } from './builders/petitions'

export { buildCeremonySection } from './builders/ceremony'
