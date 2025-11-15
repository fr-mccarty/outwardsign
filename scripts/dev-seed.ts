#!/usr/bin/env tsx
/**
 * Development Seed Script
 *
 * Seeds the database with development data after a reset.
 * Uses the SAME onboarding setup function, then adds extra dev data.
 *
 * Usage:
 *   npm run seed:dev
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
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

  // Get the first user (you) from auth
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

  if (usersError || !users || users.length === 0) {
    console.error('❌ No users found in auth.users')
    console.error('   Please sign up first at /login')
    process.exit(1)
  }

  const userId = users[0].id
  console.log(`👤 Found user: ${users[0].email}`)

  // Create development parish directly (service role bypasses RLS)
  console.log('🏛️  Creating development parish...')

  // Step 1: Create the parish
  const { data: parish, error: parishError } = await supabase
    .from('parishes')
    .insert({
      name: 'Development Parish',
      city: 'Dev City',
      state: 'CA'
    })
    .select()
    .single()

  if (parishError || !parish) {
    console.error('❌ Error creating parish:', parishError)
    process.exit(1)
  }

  const parishId = parish.id

  // Step 2: Add user as admin
  const { error: parishUserError } = await supabase
    .from('parish_users')
    .insert({
      parish_id: parishId,
      user_id: userId,
      roles: ['admin']
    })

  if (parishUserError) {
    console.error('❌ Error adding user to parish:', parishUserError)
    process.exit(1)
  }

  console.log(`   ✅ Parish created: ${parishId}`)
  console.log(`   ✅ User added as admin`)
  console.log('')

  // Use the SAME onboarding setup function to seed initial data
  console.log('📖 Running onboarding setup (seeding readings)...')

  // Import readingsData and seed manually (can't use server action from script)
  const { readingsData } = await import('../src/lib/data/readings')

  const readingsToInsert = readingsData.map((reading) => ({
    parish_id: parishId,
    pericope: reading.pericope,
    text: reading.text,
    categories: reading.categories,
    language: reading.language,
    introduction: reading.introduction ?? null,
    conclusion: reading.conclusion ?? null
  }))

  const { data: readings, error: readingsError } = await supabase
    .from('readings')
    .insert(readingsToInsert)
    .select()

  if (readingsError) {
    console.error('❌ Error seeding readings:', readingsError)
    process.exit(1)
  }

  console.log(`   ✅ ${readings?.length || 0} readings created (same as onboarding)`)
  console.log('')

  // Everything below is EXTRA development data (not part of onboarding)
  console.log('🔧 Adding extra development data...')
  console.log('')

  // Seed sample groups (DEVELOPMENT ONLY - not in onboarding)
  console.log('👥 Creating sample groups...')
  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .insert([
      {
        parish_id: parishId,
        name: 'Lectors',
        description: 'Readers for Sunday Mass and special liturgies',
        is_active: true
      },
      {
        parish_id: parishId,
        name: 'Extraordinary Ministers of Holy Communion',
        description: 'Ministers who distribute communion at Mass',
        is_active: true
      },
      {
        parish_id: parishId,
        name: 'Altar Servers',
        description: 'Youth and adults who assist the priest at Mass',
        is_active: true
      },
      {
        parish_id: parishId,
        name: 'Choir',
        description: 'Music ministry for Sunday 10am Mass',
        is_active: true
      },
      {
        parish_id: parishId,
        name: 'Ushers',
        description: 'Welcome ministry and collection assistants',
        is_active: true
      },
    ])
    .select()

  if (groupsError) {
    console.error('⚠️  Warning: Error creating groups:', groupsError.message)
  } else {
    console.log(`   ✅ ${groups?.length || 0} groups created`)
  }
  console.log('')

  // Seed sample people (DEVELOPMENT ONLY - not in onboarding)
  console.log('👤 Creating sample people...')
  const { data: people, error: peopleError } = await supabase
    .from('people')
    .insert([
      {
        parish_id: parishId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone_number: '(555) 123-4567',
        sex: 'Male'
      },
      {
        parish_id: parishId,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        phone_number: '(555) 987-6543',
        sex: 'Female'
      },
      {
        parish_id: parishId,
        first_name: 'Bob',
        last_name: 'Johnson',
        email: 'bob.johnson@example.com',
        phone_number: '(555) 246-8101',
        sex: 'Male'
      },
      {
        parish_id: parishId,
        first_name: 'Maria',
        last_name: 'Garcia',
        email: 'maria.garcia@example.com',
        phone_number: '(555) 369-1214',
        sex: 'Female'
      },
      {
        parish_id: parishId,
        first_name: 'Michael',
        last_name: 'Chen',
        email: 'michael.chen@example.com',
        phone_number: '(555) 482-1357',
        sex: 'Male'
      },
    ])
    .select()

  if (peopleError) {
    console.error('⚠️  Warning: Error creating people:', peopleError.message)
  } else {
    console.log(`   ✅ ${people?.length || 0} people created`)

    // Add some people to groups with roles
    if (groups && groups.length > 0 && people && people.length > 0) {
      console.log('')
      console.log('🔗 Adding members to groups with roles...')

      const memberships = [
        // Lectors group
        {
          group_id: groups[0].id, // Lectors
          person_id: people[0].id, // John Doe
          roles: ['LECTOR', 'CANTOR']
        },
        {
          group_id: groups[0].id, // Lectors
          person_id: people[1].id, // Jane Smith
          roles: ['LECTOR']
        },
        // EMHC group
        {
          group_id: groups[1].id, // EMHC
          person_id: people[2].id, // Bob Johnson
          roles: ['EMHC']
        },
        {
          group_id: groups[1].id, // EMHC
          person_id: people[3].id, // Maria Garcia
          roles: ['EMHC', 'SACRISTAN']
        },
        // Altar Servers
        {
          group_id: groups[2].id, // Altar Servers
          person_id: people[4].id, // Michael Chen
          roles: ['ALTAR_SERVER']
        },
        // Choir
        {
          group_id: groups[3].id, // Choir
          person_id: people[0].id, // John Doe (also in choir)
          roles: ['CANTOR', 'MUSIC_MINISTER']
        },
        {
          group_id: groups[3].id, // Choir
          person_id: people[3].id, // Maria Garcia (also in choir)
          roles: ['CANTOR']
        },
      ]

      const { data: createdMemberships, error: membershipsError } = await supabase
        .from('group_members')
        .insert(memberships)

      if (membershipsError) {
        console.error('⚠️  Warning: Error creating group memberships:', membershipsError.message)
      } else {
        console.log(`   ✅ ${memberships.length} group memberships created`)
      }
    }
  }

  console.log('')
  console.log('=' .repeat(60))
  console.log('🎉 Development seeding complete!')
  console.log('=' .repeat(60))
  console.log('')
  console.log(`Parish ID:   ${parishId}`)
  console.log(`Parish Name: Development Parish`)
  console.log(`User Email:  ${users[0].email}`)
  console.log(`Role:        admin`)
  console.log('')
  console.log('You can now:')
  console.log('  - Start the dev server: npm run dev')
  console.log('  - Navigate to: http://localhost:3000/dashboard')
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
