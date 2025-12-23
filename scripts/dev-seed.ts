#!/usr/bin/env tsx
/**
 * Development Seed Script
 *
 * Seeds the database with development data after a reset.
 * Uses the SAME onboarding setup function, then adds extra dev data.
 *
 * Usage:
 *   npm run seed:dev
 *
 * Note: Environment variables are loaded by dotenv-cli in package.json
 */

import { createClient } from '@supabase/supabase-js'
import {
  seedPeople,
  uploadAvatars,
  seedGroups,
  seedGroupMemberships,
  seedLocations,
  seedMasses,
  seedMassIntentions,
  seedEvents,
  seedFamilies,
  seedReadings,
  seedWeddingsAndFunerals
} from './dev-seeders'
import { logSuccess, logError, logInfo, logWarning } from '../src/lib/utils/console'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const devUserEmail = process.env.DEV_USER_EMAIL
const devUserPassword = process.env.DEV_USER_PASSWORD

if (!supabaseUrl || !supabaseServiceKey) {
  logError('Missing required environment variables:')
  logError('   - NEXT_PUBLIC_SUPABASE_URL')
  logError('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

if (!devUserEmail || !devUserPassword) {
  logError('Missing dev user credentials in environment:')
  logError('   - DEV_USER_EMAIL')
  logError('   - DEV_USER_PASSWORD')
  logInfo('')
  logError('Please add these to your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function seedDevData() {
  logInfo('')
  logInfo('=' .repeat(60))
  logInfo('Development Database Seeding')
  logInfo('=' .repeat(60))
  logInfo('')

  // =====================================================
  // Create Storage Buckets
  // =====================================================
  logInfo('Creating storage buckets...')

  const bucketsToCreate = [
    { id: 'person-avatars', name: 'person-avatars', public: false }
  ]

  for (const bucket of bucketsToCreate) {
    const { error } = await supabase.storage.createBucket(bucket.id, {
      public: bucket.public
    })

    if (error) {
      if (error.message.includes('already exists')) {
        logSuccess(`Bucket ${bucket.id} already exists`)
      } else {
        logWarning(`Could not create bucket ${bucket.id}: ${error.message}`)
      }
    } else {
      logSuccess(`Created bucket ${bucket.id}`)
    }
  }

  // =====================================================
  // Get or Create Dev User
  // =====================================================
  logInfo('')
  logInfo('Setting up development user...')

  let userId: string
  let userEmail: string = devUserEmail!

  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existingUser = existingUsers?.users.find(u => u.email === devUserEmail)

  if (existingUser) {
    logSuccess(`Using existing user: ${devUserEmail}`)
    userId = existingUser.id
  } else {
    logInfo(`Creating new user: ${devUserEmail}`)
    const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
      email: devUserEmail!,
      password: devUserPassword!,
      email_confirm: true
    })

    if (createUserError) {
      logError(`Error creating dev user: ${createUserError.message}`)
      process.exit(1)
    }

    userId = newUser.user.id
    logSuccess(`Created new user: ${devUserEmail}`)
  }

  // =====================================================
  // Get or Create Parish
  // =====================================================
  logInfo('')
  logInfo('Setting up development parish...')

  const { data: existingParishes, error: parishLookupError } = await supabase
    .from('parishes')
    .select('*')
    .limit(1)
    .single()

  let parishId: string

  if (existingParishes && !parishLookupError) {
    parishId = existingParishes.id
    logSuccess(`Using existing parish: ${existingParishes.name}`)
  } else {
    const { data: newParish, error: createParishError } = await supabase
      .from('parishes')
      .insert({
        name: 'Development Parish',
        settings: {}
      })
      .select()
      .single()

    if (createParishError) {
      logError(`Error creating parish: ${createParishError.message}`)
      process.exit(1)
    }

    parishId = newParish.id
    logSuccess(`Created new parish: ${newParish.name}`)
  }

  // =====================================================
  // Ensure User is Admin of Parish
  // =====================================================
  logInfo('')
  logInfo('Ensuring user is admin of parish...')

  const { data: existingMembership } = await supabase
    .from('parish_users')
    .select('*')
    .eq('user_id', userId)
    .eq('parish_id', parishId)
    .single()

  if (existingMembership) {
    if (existingMembership.role !== 'admin') {
      await supabase
        .from('parish_users')
        .update({ role: 'admin', selected: true })
        .eq('user_id', userId)
        .eq('parish_id', parishId)
    }
    logSuccess('User is admin of parish')
  } else {
    const { error: membershipError } = await supabase
      .from('parish_users')
      .insert({
        user_id: userId,
        parish_id: parishId,
        role: 'admin',
        selected: true
      })

    if (membershipError) {
      logError(`Error creating parish membership: ${membershipError.message}`)
      process.exit(1)
    }
    logSuccess('Added user as admin of parish')
  }

  // =====================================================
  // Seed Onboarding Data (always reseed for dev)
  // =====================================================
  logInfo('')
  logInfo('Cleaning up existing onboarding data...')

  // Delete in correct order due to FK constraints
  // 1. Delete script_sections (FK to scripts)
  await supabase.from('script_sections').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  // 2. Delete scripts (FK to event_types)
  await supabase.from('scripts').delete().eq('parish_id', parishId)
  // 3. Delete input_field_definitions (FK to event_types)
  await supabase.from('input_field_definitions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  // 4. Delete event_types
  await supabase.from('event_types').delete().eq('parish_id', parishId)
  // 5. Delete other parish data
  await supabase.from('petition_templates').delete().eq('parish_id', parishId)
  await supabase.from('group_roles').delete().eq('parish_id', parishId)
  // 6. Delete tag_assignments before category_tags
  await supabase.from('tag_assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('category_tags').delete().eq('parish_id', parishId)

  logSuccess('Cleaned up existing onboarding data')

  logInfo('')
  logInfo('Seeding onboarding data...')

  const { seedParishData } = await import('../src/lib/onboarding-seeding/parish-seed-data')

  try {
    const result = await seedParishData(supabase, parishId)
    logSuccess(`Petition templates: ${result.petitionTemplates.length}`)
    logSuccess(`Group roles: ${result.groupRoles.length}`)
    logSuccess(`Special liturgy event types: ${result.specialLiturgyEventTypesCount}`)
    logSuccess(`General event types: ${result.generalEventTypesCount}`)
    logSuccess(`Mass event types: ${result.massEventTypesCount}`)
  } catch (error) {
    logError(`Error seeding parish data: ${error}`)
    process.exit(1)
  }

  // =====================================================
  // Seed Content Library (always reseed for dev)
  // =====================================================
  logInfo('')
  logInfo('Cleaning up existing content library...')

  // Delete contents (tag_assignments already deleted above)
  await supabase.from('contents').delete().eq('parish_id', parishId)

  logSuccess('Cleaned up existing content library')

  logInfo('')
  logInfo('Seeding content library...')

  const { seedContentForParish } = await import('../src/lib/onboarding-seeding/content-seed')

  try {
    await seedContentForParish(supabase, parishId)
  } catch (error) {
    logError(`Error seeding content library: ${error}`)
    // Non-fatal - continue
  }

  // =====================================================
  // Dev Seeder Context
  // =====================================================
  const ctx = { supabase, parishId, devUserEmail: devUserEmail! }

  // =====================================================
  // Seed Readings (Liturgical Readings for Weddings/Funerals)
  // =====================================================
  logInfo('')
  await seedReadings(ctx)

  // =====================================================
  // Seed Sample Groups
  // =====================================================
  logInfo('')
  const { groups } = await seedGroups(ctx)

  // =====================================================
  // Seed Sample People
  // =====================================================
  logInfo('')
  const { people } = await seedPeople(ctx)

  // =====================================================
  // Seed Group Memberships
  // =====================================================
  if (groups && people) {
    await seedGroupMemberships(ctx, groups, people)
  }

  // =====================================================
  // Seed Families and Family Members
  // =====================================================
  logInfo('')
  if (people) {
    await seedFamilies(ctx, people as Array<{ id: string; first_name: string; last_name: string }>)
  }

  // =====================================================
  // Upload Avatars
  // =====================================================
  await uploadAvatars(ctx)

  // =====================================================
  // Seed Sample Locations
  // =====================================================
  const { churchLocation, hallLocation, funeralHomeLocation } = await seedLocations(ctx)

  // =====================================================
  // Seed Sample Masses
  // =====================================================
  if (people && churchLocation) {
    await seedMasses(ctx, people as Array<{ id: string; first_name: string; last_name: string }>, churchLocation)
  }

  // =====================================================
  // Seed Sample Mass Intentions
  // =====================================================
  if (people) {
    await seedMassIntentions(ctx, people as Array<{ id: string; first_name: string; last_name: string }>)
  }

  // =====================================================
  // Seed Sample Events (Baptisms, Quinceaneras, Parish Events, etc.)
  // Note: Weddings/Funerals are handled by seedWeddingsAndFunerals with readings
  // =====================================================
  if (people) {
    await seedEvents(ctx, people, { churchLocation, hallLocation, funeralHomeLocation })
  }

  // =====================================================
  // Seed Weddings and Funerals with Readings
  // =====================================================
  if (people) {
    await seedWeddingsAndFunerals(ctx, people, { churchLocation, hallLocation, funeralHomeLocation })
  }

  // =====================================================
  // Done!
  // =====================================================
  logInfo('')
  logInfo('=' .repeat(60))
  logInfo('Development seeding complete!')
  logInfo('=' .repeat(60))
  logInfo('')
  logInfo(`Parish ID:   ${parishId}`)
  logInfo(`Parish Name: Development Parish`)
  logInfo(`User Email:  ${userEmail}`)
  logInfo(`Role:        admin`)
  logInfo('')
  logInfo('You can now:')
  logInfo('  - Start the dev server: npm run dev')
  logInfo('  - Navigate to: http://localhost:3000/dashboard')
  logInfo(`  - Login with: ${devUserEmail}`)
  logInfo('  - Password: (see DEV_USER_PASSWORD in .env.local)')
  logInfo('')
  logInfo('=' .repeat(60))
  logInfo('')
}

seedDevData()
  .then(() => process.exit(0))
  .catch((error) => {
    logError('')
    logError(`Seeding failed: ${error}`)
    logError('')
    process.exit(1)
  })
