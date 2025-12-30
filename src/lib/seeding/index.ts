/**
 * Shared Seeding Module
 *
 * Single source of truth for all seeding functionality.
 * Used by both dev seeder (scripts/) and production seeder (server action).
 *
 * ADDING NEW SEEDERS:
 * 1. Add your seed function to seed-functions.ts
 * 2. Export it from this file (optional, for direct access)
 * 3. Import and call it in run-seeders.ts (required)
 */

// Types
export * from './types'

// Sample Data
export * from './sample-data'

// Individual Seeding Functions (for direct access if needed)
export {
  // Core seeders
  seedPeople,
  seedFamilies,
  seedGroupMemberships,
  seedMasses,
  seedMassIntentions,
  seedWeddingsAndFunerals,
  // Comprehensive seeders (JSONB and additional tables)
  seedParishSettings,
  seedMassTimesRoleQuantities,
  seedCustomLists,
  seedPersonBlackoutDates,
  seedParishionerNotifications,
  seedEnhancedEventPresets,
  seedCalendarEventVisibility,
} from './seed-functions'

// Main Orchestrator (this is what both dev and UI seeders call)
export {
  runAllSeeders,
  type SeederCounts,
  type SeederResult,
} from './run-seeders'
