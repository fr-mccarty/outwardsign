/**
 * API Route: Manual Demo Parish Seeding
 *
 * GET /api/seed-demo - Manually trigger demo parish seeding
 *
 * This is a developer-only endpoint for debugging seeding issues.
 * Requires the developer to be logged in.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isDeveloperEmail, DEMO_PARISH_ID } from '@/lib/auth/developer'
import { seedParishData } from '@/lib/onboarding-seeding/parish-seed-data'
import { runAllSeeders } from '@/lib/seeding'
import { seedReadingsForParish } from '@/lib/onboarding-seeding/content-seed'

export async function GET() {
  const logs: string[] = []
  const log = (msg: string) => {
    console.log(msg)
    logs.push(msg)
  }

  try {
    // Check if user is developer
    log('Checking developer access...')
    const userClient = await createClient()
    const { data: { user } } = await userClient.auth.getUser()

    if (!user?.email || !isDeveloperEmail(user.email)) {
      return NextResponse.json({ error: 'Developer access required', logs }, { status: 403 })
    }
    log(`Developer verified: ${user.email}`)

    // Create admin client
    log('Creating admin client...')
    let supabase
    try {
      supabase = createAdminClient()
      log('Admin client created successfully')
    } catch (e) {
      log(`Failed to create admin client: ${e}`)
      return NextResponse.json({ error: 'Failed to create admin client', details: String(e), logs }, { status: 500 })
    }

    // Check demo parish exists
    log('Checking demo parish...')
    const { data: parish, error: parishError } = await supabase
      .from('parishes')
      .select('id, name')
      .eq('id', DEMO_PARISH_ID)
      .single()

    if (parishError || !parish) {
      log(`Demo parish not found: ${parishError?.message}`)
      return NextResponse.json({ error: 'Demo parish not found', details: parishError?.message, logs }, { status: 404 })
    }
    log(`Demo parish found: ${parish.name}`)

    // Check seed status
    log('Checking seed status...')
    const { data: status, error: statusError } = await supabase
      .from('demo_parish_seed_status')
      .select('*')
      .eq('parish_id', DEMO_PARISH_ID)
      .single()

    if (statusError) {
      log(`Seed status error: ${statusError.message}`)
      return NextResponse.json({ error: 'Seed status table error', details: statusError.message, logs }, { status: 500 })
    }
    log(`Current status: onboarding=${status.onboarding_seeded}, sample_data=${status.sample_data_seeded}`)

    // Run onboarding seeder if needed
    if (!status.onboarding_seeded) {
      log('Running onboarding seeder...')
      try {
        const result = await seedParishData(supabase, DEMO_PARISH_ID)
        log(`Onboarding complete: ${result.petitionTemplates.length} petition templates, ${result.groupRoles.length} group roles`)

        await supabase
          .from('demo_parish_seed_status')
          .update({ onboarding_seeded: true })
          .eq('parish_id', DEMO_PARISH_ID)
        log('Onboarding status updated')
      } catch (e) {
        log(`Onboarding seeding failed: ${e}`)
      }
    } else {
      log('Onboarding already seeded, skipping')
    }

    // Run sample data seeder if needed
    if (!status.sample_data_seeded) {
      log('Running sample data seeder...')
      try {
        log('Seeding scripture readings...')
        await seedReadingsForParish(supabase, DEMO_PARISH_ID)
        log('Scripture readings seeded')

        log('Running all seeders...')
        const result = await runAllSeeders(supabase, DEMO_PARISH_ID)
        log(`Sample data complete: ${result.counts.people} people, ${result.counts.masses} masses, ${result.counts.families} families`)

        await supabase
          .from('demo_parish_seed_status')
          .update({
            sample_data_seeded: true,
            seeded_at: new Date().toISOString()
          })
          .eq('parish_id', DEMO_PARISH_ID)
        log('Sample data status updated')
      } catch (e) {
        log(`Sample data seeding failed: ${e}`)
        return NextResponse.json({ error: 'Sample data seeding failed', details: String(e), logs }, { status: 500 })
      }
    } else {
      log('Sample data already seeded, skipping')
    }

    log('Seeding complete!')
    return NextResponse.json({ success: true, logs })

  } catch (e) {
    log(`Unexpected error: ${e}`)
    return NextResponse.json({ error: 'Unexpected error', details: String(e), logs }, { status: 500 })
  }
}
