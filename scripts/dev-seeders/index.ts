/**
 * Dev Seeders Index
 *
 * Dev seeding now uses the shared seeding module (src/lib/seeding/)
 * for core functionality. This file exports:
 *
 * 1. Dev-specific functions (avatars, dev user person)
 * 2. Re-exports from shared module for backwards compatibility
 *
 * SHARED MODULE: src/lib/seeding/
 * - Core seeding functions (seedPeople, seedFamilies, seedMasses, etc.)
 * - Sample data (SAMPLE_PEOPLE, SAMPLE_FAMILIES, etc.)
 * - runAllSeeders() orchestrator
 */

// Dev-specific functions (NOT in shared module)
export { uploadAvatars, createDevUserPerson } from './seed-people'

// Re-export shared module for backwards compatibility
export {
  // Sample data
  SAMPLE_PEOPLE,
  SAMPLE_FAMILIES,
  INTENTION_TEXTS,
  ENTRANCE_HYMNS,
  OFFERTORY_HYMNS,
  COMMUNION_HYMNS,
  RECESSIONAL_HYMNS,
  // Types
  type SamplePerson,
  type FamilyDefinition,
  type SeederContext,
  type SeederResult,
  type CreatedPerson,
  type CreatedFamily,
  // Seeding functions
  seedPeople,
  seedFamilies,
  seedGroupMemberships,
  seedMasses,
  seedMassIntentions,
  seedWeddingsAndFunerals,
  runAllSeeders,
} from '../../src/lib/seeding'

// Legacy type export for backwards compatibility
export type { DevSeederContext, DevSeederResult } from './types'
