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
  seedMassRoleMemberships,
  seedLocations,
  seedMasses,
  seedEvents,
  seedFamilies
} from './dev-seeders'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const devUserEmail = process.env.DEV_USER_EMAIL
const devUserPassword = process.env.DEV_USER_PASSWORD

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

if (!devUserEmail || !devUserPassword) {
  console.error('❌ Missing dev user credentials in environment:')
  console.error('   - DEV_USER_EMAIL')
  console.error('   - DEV_USER_PASSWORD')
  console.error('')
  console.error('Please add these to your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function seedDevData() {
  console.log('')
  console.log('=' .repeat(60))
  console.log('🌱 Development Database Seeding')
  console.log('=' .repeat(60))
  console.log('')

  // =====================================================
  // Create Storage Buckets
  // =====================================================
  console.log('🪣 Creating storage buckets...')

  const bucketsToCreate = [
    { id: 'person-avatars', name: 'person-avatars', public: false }
  ]

  for (const bucket of bucketsToCreate) {
    const { error } = await supabase.storage.createBucket(bucket.id, {
      public: bucket.public
    })

    if (error) {
      if (error.message.includes('already exists')) {
        console.log(`   ✅ Bucket "${bucket.id}" already exists`)
      } else {
        console.error(`   ⚠️  Warning: Could not create bucket "${bucket.id}":`, error.message)
      }
    } else {
      console.log(`   ✅ Created bucket "${bucket.id}"`)
    }
  }

  // =====================================================
  // Get or Create Dev User
  // =====================================================
  console.log('')
  console.log('🔐 Setting up development user...')

  let userId: string
  let userEmail: string = devUserEmail!

  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existingUser = existingUsers?.users.find(u => u.email === devUserEmail)

  if (existingUser) {
    console.log(`   ✅ Using existing user: ${devUserEmail}`)
    userId = existingUser.id
  } else {
    console.log(`   Creating new user: ${devUserEmail}`)
    const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
      email: devUserEmail!,
      password: devUserPassword!,
      email_confirm: true
    })

    if (createUserError) {
      console.error('❌ Error creating dev user:', createUserError)
      process.exit(1)
    }

    userId = newUser.user.id
    console.log(`   ✅ Created new user: ${devUserEmail}`)
  }

  // =====================================================
  // Get or Create Parish
  // =====================================================
  console.log('')
  console.log('⛪ Setting up development parish...')

  const { data: existingParishes, error: parishLookupError } = await supabase
    .from('parishes')
    .select('*')
    .limit(1)
    .single()

  let parishId: string

  if (existingParishes && !parishLookupError) {
    parishId = existingParishes.id
    console.log(`   ✅ Using existing parish: ${existingParishes.name}`)
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
      console.error('❌ Error creating parish:', createParishError)
      process.exit(1)
    }

    parishId = newParish.id
    console.log(`   ✅ Created new parish: ${newParish.name}`)
  }

  // =====================================================
  // Ensure User is Admin of Parish
  // =====================================================
  console.log('')
  console.log('👑 Ensuring user is admin of parish...')

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
    console.log(`   ✅ User is admin of parish`)
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
      console.error('❌ Error creating parish membership:', membershipError)
      process.exit(1)
    }
    console.log(`   ✅ Added user as admin of parish`)
  }

  // =====================================================
  // Seed Onboarding Data (if not already present)
  // =====================================================
  console.log('')
  console.log('📦 Seeding onboarding data...')

  const { data: existingPetitionTemplates } = await supabase
    .from('petition_templates')
    .select('id')
    .eq('parish_id', parishId)
    .limit(1)

  if (!existingPetitionTemplates || existingPetitionTemplates.length === 0) {
    const { seedParishData } = await import('../src/lib/onboarding-seeding/parish-seed-data')

    try {
      const result = await seedParishData(supabase, parishId)
      console.log(`   ✅ Petition templates: ${result.petitionTemplates.length}`)
      console.log(`   ✅ Group roles: ${result.groupRoles.length}`)
      console.log(`   ✅ Mass roles: ${result.massRoles.length}`)
      console.log(`   ✅ Event types: ${result.eventTypes.length}`)
      console.log(`   ✅ Mass event types, role templates, and time templates created`)
    } catch (error) {
      console.error('❌ Error seeding parish data:', error)
      process.exit(1)
    }
  } else {
    console.log(`   ✅ Parish data already exists, skipping`)
  }

  // =====================================================
  // Seed Content Library
  // =====================================================
  console.log('')
  console.log('📝 Seeding content library...')

  const { data: existingContent } = await supabase
    .from('contents')
    .select('id')
    .eq('parish_id', parishId)
    .limit(1)

  if (!existingContent || existingContent.length === 0) {
    const { seedContentForParish } = await import('../src/lib/onboarding-seeding/content-seed')

    try {
      await seedContentForParish(supabase, parishId)
    } catch (error) {
      console.error('❌ Error seeding content library:', error)
      // Non-fatal - continue
    }
  } else {
    console.log(`   ✅ Content library already exists, skipping`)
  }

  // =====================================================
  // Dev Seeder Context
  // =====================================================
  const ctx = { supabase, parishId, devUserEmail: devUserEmail! }

  // =====================================================
  // Seed Sample Groups
  // =====================================================
  console.log('')
  const { groups } = await seedGroups(ctx)

  // =====================================================
  // Seed Sample People
  // =====================================================
  console.log('')
  const { people } = await seedPeople(ctx)

  // =====================================================
  // Seed Group Memberships
  // =====================================================
  if (groups && people) {
    await seedGroupMemberships(ctx, groups, people)
  }

  // =====================================================
  // Seed Mass Role Memberships
  // =====================================================
  if (people) {
    await seedMassRoleMemberships(ctx, people)
  }

  // =====================================================
  // Seed Families and Family Members
  // =====================================================
  console.log('')
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
  // Seed Sample Events (Weddings, Funerals, etc.)
  // =====================================================
  if (people) {
    await seedEvents(ctx, people, { churchLocation, hallLocation, funeralHomeLocation })
  }

  // =====================================================
  // Done!
  // =====================================================
  console.log('')
  console.log('=' .repeat(60))
  console.log('🎉 Development seeding complete!')
  console.log('=' .repeat(60))
  console.log('')
  console.log(`Parish ID:   ${parishId}`)
  console.log(`Parish Name: Development Parish`)
  console.log(`User Email:  ${userEmail}`)
  console.log(`Role:        admin`)
  console.log('')
  console.log('You can now:')
  console.log('  - Start the dev server: npm run dev')
  console.log('  - Navigate to: http://localhost:3000/dashboard')
  console.log(`  - Login with: ${devUserEmail}`)
  console.log('  - Password: (see DEV_USER_PASSWORD in .env.local)')
  console.log('')
  console.log('=' .repeat(60))
  console.log('')
}

seedDevData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('')
    console.error('❌ Seeding failed:', error)
    console.error('')
    process.exit(1)
  })
