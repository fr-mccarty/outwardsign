'use server'

/**
 * Production Data Seeder
 *
 * Server action to seed sample data for the current user's parish.
 * Uses the shared seeding module for consistency with dev seeder.
 *
 * NOTE: Avatar uploads are not supported in server actions (requires fs).
 * Dev seeder handles avatar uploads separately.
 */

import { createAuthenticatedClientWithPermissions } from '@/lib/actions/server-action-utils'
import { seedReadingsForParish } from '@/lib/onboarding-seeding/content-seed'
import { runAllSeeders, cleanupDemoData, type SeederCounts } from '@/lib/seeding'

// =====================================================
// Seeding Result Type
// =====================================================

export interface SeedDataResult {
  success: boolean
  message: string
  details: SeederCounts & {
    readings: number
  }
}

// =====================================================
// Main Seeding Function
// =====================================================

export async function seedSampleData(): Promise<SeedDataResult> {
  const { supabase, parishId } = await createAuthenticatedClientWithPermissions()

  try {
    // 1. Clean up existing demo data (allows button to be pressed multiple times)
    await cleanupDemoData(supabase, parishId)

    // 2. Seed Scripture Readings (from onboarding seeder)
    await seedReadingsForParish(supabase, parishId)

    // 3. Run all shared seeders
    const result = await runAllSeeders(supabase, parishId)

    return {
      success: result.success,
      message: 'Sample data seeded successfully',
      details: {
        ...result.counts,
        readings: 20, // Approximate count from content-seed.ts
      },
    }

  } catch (error) {
    console.error('Error seeding data:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      details: {
        people: 0,
        families: 0,
        groupMemberships: 0,
        masses: 0,
        massRoleAssignments: 0,
        massIntentions: 0,
        weddings: 0,
        funerals: 0,
        specialLiturgies: 0,
        readings: 0,
        // Comprehensive seeding counts
        parishSettingsUpdated: false,
        massTimesItemsUpdated: 0,
        customLists: 0,
        customListItems: 0,
        blackoutDates: 0,
        notifications: 0,
        eventPresets: 0,
        calendarVisibility: 0,
      },
    }
  }
}
