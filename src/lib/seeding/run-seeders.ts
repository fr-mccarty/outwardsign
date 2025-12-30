/**
 * Seeder Orchestrator
 *
 * SINGLE SOURCE OF TRUTH for running all seeders.
 * Both dev seeder (scripts/dev-seed.ts) and production seeder (server action)
 * call this file. When adding new seeders, add them here.
 *
 * Usage:
 *   import { runAllSeeders } from '@/lib/seeding'
 *   const result = await runAllSeeders(supabase, parishId)
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { SeederContext } from './types'
import {
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
import { seedSpecialLiturgiesForParish } from '../onboarding-seeding/special-liturgies-seed'

// =====================================================
// Seeder Result Types
// =====================================================

export interface SeederCounts {
  // Core counts
  people: number
  families: number
  groupMemberships: number
  masses: number
  massRoleAssignments: number
  massIntentions: number
  weddings: number
  funerals: number
  specialLiturgies: number
  // Comprehensive counts
  parishSettingsUpdated: boolean
  massTimesItemsUpdated: number
  customLists: number
  customListItems: number
  blackoutDates: number
  notifications: number
  eventPresets: number
  calendarVisibility: number
}

export interface SeederResult {
  success: boolean
  counts: SeederCounts
}

// =====================================================
// Main Orchestrator
// =====================================================

export async function runAllSeeders(
  supabase: SupabaseClient,
  parishId: string
): Promise<SeederResult> {
  const ctx: SeederContext = { supabase, parishId }

  // Get locations for events
  const { data: locations } = await supabase
    .from('locations')
    .select('id, name')
    .eq('parish_id', parishId)

  const churchLocation = locations?.find(l => l.name.includes('Church')) || null
  const hallLocation = locations?.find(l => l.name.includes('Hall')) || null

  // =====================================================
  // CORE SEEDERS
  // These create the foundational data (people, families, events)
  // =====================================================
  const { people } = await seedPeople(ctx)
  const { families } = await seedFamilies(ctx, people)
  const { membershipsCreated: groupMemberships } = await seedGroupMemberships(ctx, people)
  const { massesCreated, assignmentsCreated: massRoleAssignments } = await seedMasses(ctx, people, churchLocation)
  const { intentionsCreated } = await seedMassIntentions(ctx, people)
  const { weddingsCreated, funeralsCreated } = await seedWeddingsAndFunerals(ctx, people, churchLocation)

  // Seed special liturgies (baptisms, quinceaneras, presentations)
  // This runs AFTER people are created so it can assign participants
  const specialLiturgiesResult = await seedSpecialLiturgiesForParish(supabase, parishId, {
    churchLocationId: churchLocation?.id || null,
    hallLocationId: hallLocation?.id || null,
    funeralHomeLocationId: null
  })

  // =====================================================
  // COMPREHENSIVE SEEDERS
  // These populate JSONB columns and additional tables
  // ADD NEW SEEDERS HERE
  // =====================================================
  const { updated: parishSettingsUpdated } = await seedParishSettings(ctx)
  const { itemsUpdated: massTimesItemsUpdated } = await seedMassTimesRoleQuantities(ctx, people)
  const { listsCreated: customLists, itemsCreated: customListItems } = await seedCustomLists(ctx)
  const { blackoutDatesCreated: blackoutDates } = await seedPersonBlackoutDates(ctx, people)
  const { notificationsCreated: notifications } = await seedParishionerNotifications(ctx, people)
  const { presetsCreated: eventPresets } = await seedEnhancedEventPresets(ctx, people)
  const { visibilityRecordsCreated: calendarVisibility } = await seedCalendarEventVisibility(ctx, people)

  // =====================================================
  // RETURN RESULTS
  // =====================================================
  return {
    success: true,
    counts: {
      // Core counts
      people: people.length,
      families: families.length,
      groupMemberships,
      masses: massesCreated,
      massRoleAssignments,
      massIntentions: intentionsCreated,
      weddings: weddingsCreated,
      funerals: funeralsCreated,
      specialLiturgies: specialLiturgiesResult.liturgiesCreated,
      // Comprehensive counts
      parishSettingsUpdated,
      massTimesItemsUpdated,
      customLists,
      customListItems,
      blackoutDates,
      notifications,
      eventPresets,
      calendarVisibility,
    }
  }
}
