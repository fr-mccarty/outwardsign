/**
 * Demo Parish Seeding Check
 *
 * This module checks if the demo parish needs seeding and runs
 * the seeders if needed. It's called on application startup to
 * ensure the demo parish has sample data.
 *
 * The seeding only runs once per deployment - the status is
 * tracked in the demo_parish_seed_status table.
 *
 * IMPORTANT: Uses admin client (service role) to bypass RLS
 * since seeding needs to insert data regardless of user auth state.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { seedParishData } from '@/lib/onboarding-seeding/parish-seed-data'
import { runAllSeeders } from '@/lib/seeding'
import { seedReadingsForParish } from '@/lib/onboarding-seeding/content-seed'
import { logInfo, logSuccess, logError, logWarning } from '@/lib/utils/console'
import { DEMO_PARISH_ID } from '@/lib/auth/developer'

// In-memory flag to prevent multiple concurrent seeding attempts
let seedingInProgress = false
let seedingCompleted = false

/**
 * Check if the demo parish needs seeding and run seeders if needed.
 * This is safe to call multiple times - it will only seed once.
 */
export async function checkAndSeedDemoParish(): Promise<void> {
  // Skip if already completed or in progress
  if (seedingCompleted || seedingInProgress) {
    return
  }

  try {
    seedingInProgress = true

    const supabase = createAdminClient()

    // Check if demo parish exists
    const { data: parish, error: parishError } = await supabase
      .from('parishes')
      .select('id, name')
      .eq('id', DEMO_PARISH_ID)
      .single()

    if (parishError || !parish) {
      // Demo parish doesn't exist - nothing to seed
      seedingCompleted = true
      return
    }

    // Check seeding status
    const { data: status, error: statusError } = await supabase
      .from('demo_parish_seed_status')
      .select('*')
      .eq('parish_id', DEMO_PARISH_ID)
      .single()

    if (statusError) {
      // Table might not exist yet (migration not run)
      logWarning('[Demo Seeding] Status table not found - skipping')
      seedingCompleted = true
      return
    }

    // Check if already fully seeded
    if (status.onboarding_seeded && status.sample_data_seeded) {
      seedingCompleted = true
      return
    }

    logInfo('')
    logInfo('=' .repeat(60))
    logInfo('DEMO PARISH AUTO-SEEDING')
    logInfo('=' .repeat(60))
    logInfo('')

    // Run onboarding seeder if needed
    if (!status.onboarding_seeded) {
      logInfo('Running onboarding seeder...')
      try {
        const result = await seedParishData(supabase, DEMO_PARISH_ID)
        logSuccess(`Onboarding complete: ${result.petitionTemplates.length} petition templates, ${result.groupRoles.length} group roles`)

        // Mark onboarding as seeded
        await supabase
          .from('demo_parish_seed_status')
          .update({ onboarding_seeded: true })
          .eq('parish_id', DEMO_PARISH_ID)
      } catch (error) {
        logError(`Onboarding seeding failed: ${error}`)
        // Don't throw - try to continue with sample data
      }
    }

    // Run sample data seeder if needed
    if (!status.sample_data_seeded) {
      logInfo('Running sample data seeder...')
      try {
        // Seed scripture readings first
        logInfo('Seeding scripture readings...')
        await seedReadingsForParish(supabase, DEMO_PARISH_ID)
        logSuccess('Scripture readings seeded')

        // Then run all other seeders
        const result = await runAllSeeders(supabase, DEMO_PARISH_ID)
        logSuccess(`Sample data complete: ${result.counts.people} people, ${result.counts.masses} masses, ${result.counts.families} families`)

        // Create dev user person record
        await createDevUserPerson(supabase, DEMO_PARISH_ID)

        // Mark sample data as seeded
        await supabase
          .from('demo_parish_seed_status')
          .update({
            sample_data_seeded: true,
            seeded_at: new Date().toISOString()
          })
          .eq('parish_id', DEMO_PARISH_ID)
      } catch (error) {
        logError(`Sample data seeding failed: ${error}`)
      }
    }

    logInfo('')
    logInfo('Demo parish seeding complete!')
    logInfo('=' .repeat(60))
    logInfo('')

    seedingCompleted = true
  } catch (error) {
    logError(`Demo seeding check failed: ${error}`)
    seedingCompleted = true // Don't retry on error
  } finally {
    seedingInProgress = false
  }
}

/**
 * Create a person record for the dev user.
 */
async function createDevUserPerson(
  supabase: ReturnType<typeof createAdminClient>,
  parishId: string
): Promise<void> {
  const devUserEmail = 'fr.mccarty@gmail.com'

  // Check if person already exists
  const { data: existingPerson } = await supabase
    .from('people')
    .select('id')
    .eq('parish_id', parishId)
    .eq('email', devUserEmail)
    .single()

  if (existingPerson) {
    logInfo('Dev user person record already exists')
    return
  }

  // Get the dev user ID
  const { data: authUser } = await supabase.auth.admin.getUserById(
    '00000000-0000-0000-0000-000000000002'
  )

  if (!authUser?.user) {
    logWarning('Dev user not found in auth - skipping person record')
    return
  }

  // Create person record
  const { error } = await supabase
    .from('people')
    .insert({
      parish_id: parishId,
      first_name: 'Fr. Josh',
      last_name: 'McCarty',
      email: devUserEmail,
      sex: 'male',
      linked_user_id: authUser.user.id,
      portal_access_enabled: true,
    })

  if (error) {
    logWarning(`Could not create dev user person: ${error.message}`)
  } else {
    logSuccess('Dev user person record created')
  }
}

/**
 * Force a re-seed of the demo parish (for development).
 */
export async function forceSeedDemoParish(): Promise<void> {
  seedingCompleted = false
  seedingInProgress = false

  const supabase = createAdminClient()

  // Reset the seed status
  await supabase
    .from('demo_parish_seed_status')
    .update({
      onboarding_seeded: false,
      sample_data_seeded: false,
      seeded_at: null
    })
    .eq('parish_id', DEMO_PARISH_ID)

  // Run the seeding
  await checkAndSeedDemoParish()
}
