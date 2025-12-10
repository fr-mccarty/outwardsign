/**
 * Content Builder Components Index
 *
 * Exports all builder functions for creating liturgy documents
 * Each builder follows a specific structure and returns ContentSection
 */

// Shared Helpers
export { gendered, getStatusLabel } from '../helpers'

// Cover Page Builder
export { buildCoverPage, type CoverPageSection, type CoverPageRow } from './cover-page'

// Psalm Builder
export { buildPsalmSection } from './psalm'

// Petitions Builder
export { buildPetitionsSection } from './petitions'

// Announcements Builder
export { buildAnnouncementsSection } from './announcements'

// Ceremony Builder
export { buildCeremonySection } from './ceremony'
