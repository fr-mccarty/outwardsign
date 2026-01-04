#!/usr/bin/env tsx
/**
 * Development Seed Script
 *
 * Seeds the database with development data after a reset.
 * Uses the SAME onboarding setup function, then adds extra dev data.
 *
 * SHARED MODULE: Core seeding logic is in src/lib/seeding/
 * This script adds dev-specific functionality on top:
 * - Storage bucket creation
 * - Dev user creation and parish setup
 * - Avatar uploads (requires Node.js fs)
 * - Dev user person record with portal access
 *
 * NOTE: The demo parish infrastructure (parish, user, API key) is created
 * by the SQL migration. This script detects if the demo parish exists
 * and uses it, otherwise falls back to creating a new dev parish.
 *
 * Usage:
 *   npm run seed:dev
 *
 * Note: Environment variables are loaded by dotenv-cli in package.json
 */

import { createClient } from '@supabase/supabase-js'
import {
  uploadAvatars,
  createDevUserPerson,
  runAllSeeders,
} from './dev-seeders'
import { logSuccess, logError, logInfo, logWarning } from '../src/lib/utils/console'

// Demo parish ID (same as in SQL migration)
const DEMO_PARISH_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000002'

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
  // Check for Demo Parish (created by SQL migration)
  // =====================================================
  logInfo('')
  logInfo('Checking for demo parish...')

  const { data: demoParish } = await supabase
    .from('parishes')
    .select('id, name')
    .eq('id', DEMO_PARISH_ID)
    .single()

  let userId: string
  let parishId: string
  let parishName: string
  const userEmail: string = devUserEmail!

  if (demoParish) {
    // Demo parish exists (from SQL migration)
    logSuccess(`Using demo parish: ${demoParish.name}`)
    parishId = demoParish.id
    parishName = demoParish.name

    // Use the demo user ID from migration
    userId = DEMO_USER_ID
    logSuccess(`Using demo user: ${devUserEmail}`)
  } else {
    // Fallback: create dev parish and user manually
    logWarning('Demo parish not found - creating dev environment manually')

    // Get or Create Dev User
    logInfo('')
    logInfo('Setting up development user...')

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

    // Get or Create Parish
    logInfo('')
    logInfo('Setting up development parish...')

    const { data: existingParishes, error: parishLookupError } = await supabase
      .from('parishes')
      .select('*')
      .limit(1)
      .single()

    if (existingParishes && !parishLookupError) {
      parishId = existingParishes.id
      parishName = existingParishes.name
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
      parishName = newParish.name
      logSuccess(`Created new parish: ${newParish.name}`)
    }

    // Ensure User is Admin of Parish
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
  }

  // =====================================================
  // ONBOARDING SEEDING
  // (This is what production parishes get during onboarding)
  // Note: No cleanup needed - db:fresh resets all tables
  // =====================================================
  logInfo('')
  logInfo('=' .repeat(60))
  logInfo('ONBOARDING SEEDING (production parish data)')
  logInfo('=' .repeat(60))
  logInfo('')

  const { seedParishData } = await import('../src/lib/onboarding-seeding/parish-seed-data')

  try {
    const result = await seedParishData(supabase, parishId)
    logSuccess(`Petition templates: ${result.petitionTemplates.length}`)
    logSuccess(`Group roles: ${result.groupRoles.length}`)
    logSuccess(`Special liturgy event types: ${result.specialLiturgyEventTypesCount}`)
    logSuccess(`General event types: ${result.generalEventTypesCount}`)
    logSuccess(`Mass event types: ${result.massEventTypesCount}`)
    logInfo('')
    logInfo('Onboarding seeding includes:')
    logInfo('  - Event types, locations, groups, category tags')
    logInfo('  - Non-reading content (prayers, instructions, announcements)')
    logInfo('  - Sample parish events and special liturgies (Baptisms, Quinceañeras, Presentations)')
  } catch (error) {
    logError(`Error seeding parish data: ${error}`)
    process.exit(1)
  }

  // =====================================================
  // DEV SEEDING
  // (Additional data for development only - NOT in production)
  // Uses shared seeding module (src/lib/seeding/)
  // =====================================================
  logInfo('')
  logInfo('=' .repeat(60))
  logInfo('DEV SEEDING (development-only data)')
  logInfo('=' .repeat(60))

  const ctx = { supabase, parishId, devUserEmail: devUserEmail! }

  // =====================================================
  // Seed Scripture Readings (dev-only content)
  // =====================================================
  logInfo('')
  logInfo('Seeding scripture readings...')

  const { seedReadingsForParish } = await import('../src/lib/onboarding-seeding/content-seed')

  try {
    await seedReadingsForParish(supabase, parishId)
    logSuccess('Scripture readings seeded')
  } catch (error) {
    logError(`Error seeding scripture readings: ${error}`)
    // Non-fatal - continue
  }

  // =====================================================
  // Run Shared Seeders (from src/lib/seeding/)
  // This is the SAME code used by the production UI seeder
  // =====================================================
  logInfo('')
  logInfo('Running shared seeders (same as production UI)...')

  try {
    const result = await runAllSeeders(supabase, parishId)
    logSuccess(`People created: ${result.counts.people}`)
    logSuccess(`Families created: ${result.counts.families}`)
    logSuccess(`Group memberships: ${result.counts.groupMemberships}`)
    logSuccess(`Masses created: ${result.counts.masses}`)
    logSuccess(`Mass role assignments: ${result.counts.massRoleAssignments}`)
    logSuccess(`Mass intentions: ${result.counts.massIntentions}`)
    logSuccess(`Weddings created: ${result.counts.weddings}`)
    logSuccess(`Funerals created: ${result.counts.funerals}`)
    logSuccess(`Special liturgies (baptisms, quinceañeras, presentations): ${result.counts.specialLiturgies}`)
  } catch (error) {
    logError(`Error running shared seeders: ${error}`)
    process.exit(1)
  }

  // =====================================================
  // Dev-Specific: Create MCP API Key
  // (NOT in shared module - dev-only)
  // =====================================================
  logInfo('')
  logInfo('Creating dev MCP API key...')

  // Pre-computed bcrypt hash for: os_dev_DEVELOPMENT_KEY_12345678
  const devApiKeyHash = '$2b$12$R/ABBkLNFMIQcf7uwUeQM.ZsBxR54TicSvQUKVAZ8HIsDuSGwWhDG'

  const { error: apiKeyError } = await supabase
    .from('mcp_api_keys')
    .upsert({
      id: '00000000-0000-0000-0000-000000000003',
      parish_id: parishId,
      user_id: userId,
      name: 'Dev API Key (Claude Desktop)',
      key_prefix: 'os_dev_DEVEL',
      key_hash: devApiKeyHash,
      scopes: ['read', 'write', 'delete'],
      is_active: true,
    }, { onConflict: 'id' })

  if (apiKeyError) {
    logWarning(`Could not create MCP API key: ${apiKeyError.message}`)
  } else {
    logSuccess('MCP API key created: os_dev_DEVELOPMENT_KEY_12345678')
  }

  // =====================================================
  // Dev-Specific: Create Dev User Person Record
  // (NOT in shared module - dev-only)
  // =====================================================
  await createDevUserPerson(ctx)

  // =====================================================
  // Dev-Specific: Upload Avatars
  // (NOT in shared module - requires Node.js fs)
  // =====================================================
  await uploadAvatars(ctx)

  // =====================================================
  // Summary
  // =====================================================
  logInfo('')
  logInfo('Dev seeding includes:')
  logInfo('  - Scripture readings (First Reading, Second Reading, Gospel, Psalm)')
  logInfo('  - Sample people, families, group memberships')
  logInfo('  - Masses with minister assignments')
  logInfo('  - Mass intentions')
  logInfo('  - Weddings and Funerals (with readings)')
  logInfo('  - Dev user person record with portal access')
  logInfo('  - Avatar images for sample people')
  logInfo('  - MCP API key for Claude Desktop')

  // =====================================================
  // Done!
  // =====================================================
  logInfo('')
  logInfo('=' .repeat(60))
  logInfo('SEEDING COMPLETE')
  logInfo('=' .repeat(60))
  logInfo('')
  logInfo(`Parish ID:   ${parishId}`)
  logInfo(`Parish Name: ${parishName}`)
  logInfo(`User Email:  ${userEmail}`)
  logInfo(`Role:        admin`)
  logInfo('')
  logInfo('MCP API Key: os_dev_DEVELOPMENT_KEY_12345678')
  logInfo('  (Use in Claude Desktop config)')
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
