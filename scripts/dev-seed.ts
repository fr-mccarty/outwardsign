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
import * as fs from 'fs'
import * as path from 'path'

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

  // Create storage buckets (needed for person avatars, etc.)
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
        console.error(`   ❌ Error creating bucket "${bucket.id}":`, error)
      }
    } else {
      console.log(`   ✅ Created bucket: ${bucket.id}`)
    }
  }
  console.log('')

  // Check if dev user exists, create if not
  console.log('👤 Checking for dev user...')
  let userId: string
  let userEmail: string

  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()

  if (usersError) {
    console.error('❌ Error listing users:', usersError)
    process.exit(1)
  }

  // Look for existing user with dev email
  const existingUser = users?.find(u => u.email === devUserEmail)

  if (existingUser) {
    userId = existingUser.id
    userEmail = existingUser.email!
    console.log(`   ✅ Found existing user: ${userEmail}`)
  } else {
    // Create new dev user
    console.log(`   Creating new dev user: ${devUserEmail}`)
    const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
      email: devUserEmail,
      password: devUserPassword,
      email_confirm: true
    })

    if (createUserError || !newUser.user) {
      console.error('❌ Error creating dev user:', createUserError)
      process.exit(1)
    }

    userId = newUser.user.id
    userEmail = newUser.user.email!
    console.log(`   ✅ Created new user: ${userEmail}`)
  }

  // Check if a parish already exists (from seed files)
  console.log('🏛️  Checking for existing parish...')

  let parishId: string

  const { data: existingParishes } = await supabase
    .from('parishes')
    .select('*')
    .limit(1)

  if (existingParishes && existingParishes.length > 0) {
    // Use the existing parish
    parishId = existingParishes[0].id
    console.log(`   ✅ Using existing parish: ${existingParishes[0].name} (${parishId})`)

    // Check if user is already linked to this parish
    const { data: existingLink } = await supabase
      .from('parish_users')
      .select('*')
      .eq('user_id', userId)
      .eq('parish_id', parishId)
      .single()

    if (!existingLink) {
      // Link user to existing parish
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
      console.log(`   ✅ User added as admin to existing parish`)
    } else {
      console.log(`   ✅ User already linked to parish`)
    }
  } else {
    // Create new parish if none exists
    console.log('   No existing parish found, creating one...')

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

    parishId = parish.id

    // Add user as admin
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
  }
  console.log('')

  // Seed standard onboarding data using shared function
  console.log('📖 Seeding standard parish data (readings, roles, templates)...')

  const { data: existingReadings } = await supabase
    .from('readings')
    .select('id')
    .eq('parish_id', parishId)
    .limit(1)

  if (!existingReadings || existingReadings.length === 0) {
    const { seedParishData } = await import('../src/lib/seeding/parish-seed-data')

    try {
      const result = await seedParishData(supabase, parishId)
      console.log(`   ✅ Readings: ${result.readings.length}`)
      console.log(`   ✅ Petition templates: ${result.petitionTemplates.length}`)
      console.log(`   ✅ Group roles: ${result.groupRoles.length}`)
      console.log(`   ✅ Mass roles: ${result.massRoles.length}`)
      console.log(`   ✅ Mass types, role templates, and time templates created`)
    } catch (error) {
      console.error('❌ Error seeding parish data:', error)
      process.exit(1)
    }
  } else {
    console.log(`   ✅ Parish data already exists, skipping`)
  }
  console.log('')

  // Fetch existing group roles for dev data below
  const { data: groupRoles } = await supabase
    .from('group_roles')
    .select('*')
    .eq('parish_id', parishId)

  console.log('')

  // Fetch weekend mass time template items (Sunday masses) for assigning to people
  console.log('📅 Fetching weekend mass times for people assignment...')
  const { data: sundayTemplate } = await supabase
    .from('mass_times_templates')
    .select('id')
    .eq('parish_id', parishId)
    .eq('day_of_week', 'SUNDAY')
    .single()

  let weekendMassTimeItems: Array<{ id: string }> = []

  if (sundayTemplate) {
    const { data: massTimeItems } = await supabase
      .from('mass_times_template_items')
      .select('id')
      .eq('mass_times_template_id', sundayTemplate.id)

    if (massTimeItems && massTimeItems.length > 0) {
      weekendMassTimeItems = massTimeItems
      console.log(`   ✅ Found ${weekendMassTimeItems.length} weekend mass times`)
    } else {
      console.log('   ⚠️  No weekend mass times found')
    }
  } else {
    console.log('   ⚠️  Sunday template not found')
  }

  console.log('')

  // Seed sample groups (DEVELOPMENT ONLY - not in onboarding)
  console.log('👥 Creating sample groups...')
  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .insert([
      {
        parish_id: parishId,
        name: 'Parish Council',
        description: 'Advisory body for parish leadership and planning',
        is_active: true
      },
      {
        parish_id: parishId,
        name: 'Finance Council',
        description: 'Oversight of parish finances and budgeting',
        is_active: true
      },
      {
        parish_id: parishId,
        name: 'Zumba',
        description: 'Exercise and community group',
        is_active: true
      },
      {
        parish_id: parishId,
        name: 'Maintenance Committee',
        description: 'Care and upkeep of parish facilities',
        is_active: true
      },
      {
        parish_id: parishId,
        name: 'PLT',
        description: 'Parish Leadership Team',
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
        sex: 'MALE',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[0 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        phone_number: '(555) 987-6543',
        sex: 'FEMALE',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[1 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Bob',
        last_name: 'Johnson',
        email: 'bob.johnson@example.com',
        phone_number: '(555) 246-8101',
        sex: 'MALE',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[2 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Maria',
        last_name: 'Garcia',
        email: 'maria.garcia@example.com',
        phone_number: '(555) 369-1214',
        sex: 'FEMALE',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[3 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Michael',
        last_name: 'Chen',
        email: 'michael.chen@example.com',
        phone_number: '(555) 482-1357',
        sex: 'MALE',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[4 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Sarah',
        last_name: 'Williams',
        email: 'sarah.williams@example.com',
        phone_number: '(555) 159-2634',
        sex: 'FEMALE',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[5 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'David',
        last_name: 'Martinez',
        email: 'david.martinez@example.com',
        phone_number: '(555) 753-9514',
        sex: 'MALE',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[6 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Emily',
        last_name: 'Taylor',
        email: 'emily.taylor@example.com',
        phone_number: '(555) 951-7532',
        sex: 'FEMALE',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[7 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'James',
        last_name: 'Anderson',
        email: 'james.anderson@example.com',
        phone_number: '(555) 357-1593',
        sex: 'MALE',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[8 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Lisa',
        last_name: 'Brown',
        email: 'lisa.brown@example.com',
        phone_number: '(555) 753-8642',
        sex: 'FEMALE',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[9 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Robert',
        last_name: 'Wilson',
        email: 'robert.wilson@example.com',
        phone_number: '(555) 951-3578',
        sex: 'MALE',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[10 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Patricia',
        last_name: 'Moore',
        email: 'patricia.moore@example.com',
        phone_number: '(555) 159-7534',
        sex: 'FEMALE',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[11 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Thomas',
        last_name: 'Lee',
        email: 'thomas.lee@example.com',
        phone_number: '(555) 357-9512',
        sex: 'MALE',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[12 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Jennifer',
        last_name: 'White',
        email: 'jennifer.white@example.com',
        phone_number: '(555) 753-1596',
        sex: 'FEMALE',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[13 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Christopher',
        last_name: 'Harris',
        email: 'christopher.harris@example.com',
        phone_number: '(555) 951-7538',
        sex: 'MALE',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[14 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Linda',
        last_name: 'Clark',
        email: 'linda.clark@example.com',
        phone_number: '(555) 159-3574',
        sex: 'FEMALE',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[15 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Daniel',
        last_name: 'Rodriguez',
        email: 'daniel.rodriguez@example.com',
        phone_number: '(555) 357-7539',
        sex: 'MALE',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[16 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Barbara',
        last_name: 'Lewis',
        email: 'barbara.lewis@example.com',
        phone_number: '(555) 753-9516',
        sex: 'FEMALE',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[17 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Matthew',
        last_name: 'Walker',
        email: 'matthew.walker@example.com',
        phone_number: '(555) 951-1597',
        sex: 'MALE',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[18 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Nancy',
        last_name: 'Hall',
        email: 'nancy.hall@example.com',
        phone_number: '(555) 159-7535',
        sex: 'FEMALE',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[19 % weekendMassTimeItems.length].id] : []
      },
    ])
    .select()

  if (peopleError) {
    console.error('⚠️  Warning: Error creating people:', peopleError.message)
  } else {
    console.log(`   ✅ ${people?.length || 0} people created`)
  }

  // Create dev user person record with portal access enabled
  console.log('')
  console.log('👤 Creating dev user person record for parishioner portal...')
  console.log(`   Email: ${devUserEmail}`)
  console.log(`   Parish ID: ${parishId}`)

  // Check if dev person already exists
  const { data: existingDevPerson, error: lookupError } = await supabase
    .from('people')
    .select('id, full_name, email, parishioner_portal_enabled')
    .eq('email', devUserEmail)
    .eq('parish_id', parishId)
    .maybeSingle()

  if (lookupError) {
    console.error('   ❌ Error looking up existing dev person:', lookupError)
  }

  if (existingDevPerson) {
    console.log(`   ✅ Dev person already exists: ${existingDevPerson.full_name} (${existingDevPerson.email})`)

    // Ensure portal access is enabled
    if (!existingDevPerson.parishioner_portal_enabled) {
      const { error: updateError } = await supabase
        .from('people')
        .update({ parishioner_portal_enabled: true })
        .eq('id', existingDevPerson.id)

      if (updateError) {
        console.error('   ❌ Error enabling portal access:', updateError)
      } else {
        console.log(`   ✅ Parishioner portal access enabled`)
      }
    } else {
      console.log(`   ✅ Parishioner portal access already enabled`)
    }
  } else {
    // Create new dev person
    console.log('   Creating new dev person...')
    const { data: devPerson, error: devPersonError } = await supabase
      .from('people')
      .insert({
        parish_id: parishId,
        first_name: 'Outward Sign',
        last_name: 'Developer',
        email: devUserEmail,
        phone_number: '(555) 555-5555',
        sex: 'MALE',
        parishioner_portal_enabled: true,
        preferred_communication_channel: 'email',
        preferred_language: 'en',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[0 % weekendMassTimeItems.length].id] : []
      })
      .select()
      .single()

    if (devPersonError) {
      console.error('   ❌ Error creating dev person:', devPersonError)
      console.error('   Full error:', JSON.stringify(devPersonError, null, 2))
    } else {
      console.log(`   ✅ Dev person created: ${devPerson.full_name} (${devPerson.email})`)
      console.log(`   ✅ Parishioner portal access enabled`)
    }
  }

  // Continue with existing code...
  if (people && people.length > 0) {

    // Add some people to groups with group roles
    if (groups && groups.length > 0 && people && people.length > 0 && groupRoles && groupRoles.length > 0) {
      console.log('')
      console.log('🔗 Adding members to groups with group roles...')

      // Group roles: Leader, Member, Secretary, Treasurer, Coordinator
      const leaderRole = groupRoles.find(r => r.name === 'Leader')
      const coordinatorRole = groupRoles.find(r => r.name === 'Coordinator')
      const secretaryRole = groupRoles.find(r => r.name === 'Secretary')
      const memberRole = groupRoles.find(r => r.name === 'Member')

      const memberships = [
        // Parish Council
        {
          group_id: groups[0].id, // Parish Council
          person_id: people[0].id, // John Doe - Leader
          group_role_id: leaderRole?.id
        },
        {
          group_id: groups[0].id, // Parish Council
          person_id: people[1].id, // Jane Smith - Member
          group_role_id: memberRole?.id
        },
        // Finance Council
        {
          group_id: groups[1].id, // Finance Council
          person_id: people[2].id, // Bob Johnson - Coordinator
          group_role_id: coordinatorRole?.id
        },
        {
          group_id: groups[1].id, // Finance Council
          person_id: people[3].id, // Maria Garcia - Secretary
          group_role_id: secretaryRole?.id
        },
        // Zumba
        {
          group_id: groups[2].id, // Zumba
          person_id: people[4].id, // Michael Chen - Member
          group_role_id: memberRole?.id
        },
        // Maintenance Committee
        {
          group_id: groups[3].id, // Maintenance Committee
          person_id: people[0].id, // John Doe (also in Maintenance) - Member
          group_role_id: memberRole?.id
        },
        {
          group_id: groups[3].id, // Maintenance Committee
          person_id: people[3].id, // Maria Garcia (also in Maintenance) - Member
          group_role_id: memberRole?.id
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

    // Add mass role memberships for all 20 people (DEVELOPMENT ONLY)
    if (people && people.length > 0) {
      console.log('')
      console.log('🎭 Adding mass role memberships...')

      // Fetch mass roles
      const { data: massRoles } = await supabase
        .from('mass_roles')
        .select('id, name')
        .eq('parish_id', parishId)
        .order('display_order')

      if (massRoles && massRoles.length > 0) {
        // Randomly distribute roles to people
        // Some people will have multiple roles, some may have none
        const massRoleMemberships: Array<{
          person_id: string
          parish_id: string
          mass_role_id: string
          membership_type: string
          active: boolean
        }> = []

        // Create a random distribution where each person has 0-3 roles
        for (const person of people) {
          const numRoles = Math.floor(Math.random() * 4) // 0-3 roles per person

          if (numRoles > 0) {
            // Shuffle roles and pick the first numRoles
            const shuffledRoles = [...massRoles].sort(() => Math.random() - 0.5)
            const selectedRoles = shuffledRoles.slice(0, numRoles)

            for (const role of selectedRoles) {
              massRoleMemberships.push({
                person_id: person.id,
                parish_id: parishId,
                mass_role_id: role.id,
                membership_type: 'MEMBER',
                active: true
              })
            }
          }
        }

        if (massRoleMemberships.length > 0) {
          const { error: massRoleMembershipsError } = await supabase
            .from('mass_role_members')
            .insert(massRoleMemberships)

          if (massRoleMembershipsError) {
            console.error('⚠️  Warning: Error creating mass role memberships:', massRoleMembershipsError.message)
          } else {
            console.log(`   ✅ ${massRoleMemberships.length} mass role memberships created`)

            // Show distribution summary
            const roleCounts = massRoles.map(role => {
              const count = massRoleMemberships.filter(m => m.mass_role_id === role.id).length
              return `${role.name}: ${count}`
            })
            console.log(`   📊 Distribution: ${roleCounts.join(', ')}`)
          }
        } else {
          console.log('   ⚠️  No mass role memberships to create (random distribution resulted in 0)')
        }
      }
    }
  }

  // Create sample group baptisms with individual baptisms
  console.log('')
  console.log('👶 Creating sample group baptisms...')

  // Fetch some people to use as children, parents, godparents, and presider
  const { data: samplePeople } = await supabase
    .from('people')
    .select('id, first_name, last_name')
    .eq('parish_id', parishId)
    .limit(15)

  if (samplePeople && samplePeople.length >= 10) {
    // Create a presider (use first person or create if needed)
    const presider = samplePeople[0]

    // Fetch or create a location
    let locationId: string | null = null
    const { data: existingLocation } = await supabase
      .from('locations')
      .select('id')
      .eq('parish_id', parishId)
      .limit(1)
      .single()

    if (existingLocation) {
      locationId = existingLocation.id
    }

    // Create 2 group baptism events
    const { data: groupBaptismEvents } = await supabase
      .from('events')
      .insert([
        {
          parish_id: parishId,
          name: 'December Group Baptism',
          start_date: '2025-12-15',
          start_time: '14:00',
          location_id: locationId,
          related_event_type: 'BAPTISM'
        },
        {
          parish_id: parishId,
          name: 'Easter Vigil Baptisms',
          start_date: '2025-04-20',
          start_time: '20:00',
          location_id: locationId,
          related_event_type: 'BAPTISM'
        }
      ])
      .select()

    if (groupBaptismEvents && groupBaptismEvents.length === 2) {
      // Create 2 group baptisms
      const { data: groupBaptisms } = await supabase
        .from('group_baptisms')
        .insert([
          {
            parish_id: parishId,
            name: 'December 2025 Group Baptism',
            group_baptism_event_id: groupBaptismEvents[0].id,
            presider_id: presider.id,
            status: 'ACTIVE',
            note: 'Monthly group baptism ceremony',
            group_baptism_template_id: 'group-baptism-summary-english'
          },
          {
            parish_id: parishId,
            name: 'Easter Vigil 2025 Baptisms',
            group_baptism_event_id: groupBaptismEvents[1].id,
            presider_id: presider.id,
            status: 'PLANNING',
            note: 'Special Easter Vigil celebration',
            group_baptism_template_id: 'group-baptism-summary-spanish'
          }
        ])
        .select()

      if (groupBaptisms && groupBaptisms.length === 2) {
        console.log(`   ✅ ${groupBaptisms.length} group baptisms created`)

        // Create individual baptisms for each group
        // Group 1: December group - 3 baptisms
        // Group 2: Easter Vigil - 5 baptisms

        const baptismsToCreate = [
          // December Group Baptism (3 children)
          {
            parish_id: parishId,
            group_baptism_id: groupBaptisms[0].id,
            child_id: samplePeople[1]?.id,
            mother_id: samplePeople[2]?.id,
            father_id: samplePeople[3]?.id,
            sponsor_1_id: samplePeople[4]?.id,
            sponsor_2_id: samplePeople[5]?.id,
            baptism_event_id: groupBaptismEvents[0].id,
            presider_id: presider.id,
            status: 'ACTIVE'
          },
          {
            parish_id: parishId,
            group_baptism_id: groupBaptisms[0].id,
            child_id: samplePeople[6]?.id,
            mother_id: samplePeople[7]?.id,
            father_id: samplePeople[8]?.id,
            sponsor_1_id: samplePeople[9]?.id,
            baptism_event_id: groupBaptismEvents[0].id,
            presider_id: presider.id,
            status: 'ACTIVE'
          },
          {
            parish_id: parishId,
            group_baptism_id: groupBaptisms[0].id,
            child_id: samplePeople[10]?.id,
            mother_id: samplePeople[11]?.id,
            sponsor_1_id: samplePeople[12]?.id,
            baptism_event_id: groupBaptismEvents[0].id,
            presider_id: presider.id,
            status: 'ACTIVE'
          },
          // Easter Vigil Baptisms (5 children)
          {
            parish_id: parishId,
            group_baptism_id: groupBaptisms[1].id,
            child_id: samplePeople[13]?.id,
            mother_id: samplePeople[14]?.id,
            baptism_event_id: groupBaptismEvents[1].id,
            presider_id: presider.id,
            status: 'PLANNING'
          },
          {
            parish_id: parishId,
            group_baptism_id: groupBaptisms[1].id,
            child_id: samplePeople[1]?.id, // Reuse (different scenario)
            father_id: samplePeople[3]?.id,
            sponsor_1_id: samplePeople[5]?.id,
            sponsor_2_id: samplePeople[7]?.id,
            baptism_event_id: groupBaptismEvents[1].id,
            presider_id: presider.id,
            status: 'PLANNING'
          },
          {
            parish_id: parishId,
            group_baptism_id: groupBaptisms[1].id,
            child_id: samplePeople[2]?.id,
            mother_id: samplePeople[4]?.id,
            baptism_event_id: groupBaptismEvents[1].id,
            presider_id: presider.id,
            status: 'PLANNING'
          },
          {
            parish_id: parishId,
            group_baptism_id: groupBaptisms[1].id,
            child_id: samplePeople[6]?.id,
            mother_id: samplePeople[8]?.id,
            father_id: samplePeople[10]?.id,
            baptism_event_id: groupBaptismEvents[1].id,
            presider_id: presider.id,
            status: 'PLANNING'
          },
          {
            parish_id: parishId,
            group_baptism_id: groupBaptisms[1].id,
            child_id: samplePeople[12]?.id,
            sponsor_1_id: samplePeople[14]?.id,
            baptism_event_id: groupBaptismEvents[1].id,
            presider_id: presider.id,
            status: 'PLANNING'
          }
        ]

        const { data: baptisms, error: baptismsError } = await supabase
          .from('baptisms')
          .insert(baptismsToCreate)
          .select()

        if (baptismsError) {
          console.error('⚠️  Warning: Error creating baptisms:', baptismsError.message)
        } else {
          console.log(`   ✅ ${baptisms?.length || 0} individual baptisms created (3 in December group, 5 in Easter Vigil group)`)
        }
      }
    }
  } else {
    console.log('   ⚠️  Not enough sample people to create group baptisms (need at least 10)')
  }

  // Upload sample avatar images for people created by seed_modules.sql
  console.log('')
  console.log('🖼️  Uploading sample avatar images...')

  // Define which people should get avatars (from seed_modules.sql)
  const avatarAssignments = [
    { firstName: 'Father John', lastName: "O'Brien", imageFile: 'fr-josh.webp' },
    { firstName: 'James', lastName: 'Smith', imageFile: 'joe.webp' }
  ]

  for (const assignment of avatarAssignments) {
    // Find the person
    const { data: person, error: personError } = await supabase
      .from('people')
      .select('id')
      .eq('parish_id', parishId)
      .eq('first_name', assignment.firstName)
      .eq('last_name', assignment.lastName)
      .single()

    if (personError || !person) {
      console.log(`   ⚠️  Could not find ${assignment.firstName} ${assignment.lastName}`)
      continue
    }

    // Read the image file from public/team/
    const imagePath = path.join(process.cwd(), 'public', 'team', assignment.imageFile)

    if (!fs.existsSync(imagePath)) {
      console.log(`   ⚠️  Image file not found: ${imagePath}`)
      continue
    }

    const imageBuffer = fs.readFileSync(imagePath)
    const fileExtension = path.extname(assignment.imageFile)
    const storagePath = `${parishId}/${person.id}${fileExtension}`

    // Upload to storage bucket
    const { error: uploadError } = await supabase.storage
      .from('person-avatars')
      .upload(storagePath, imageBuffer, {
        contentType: fileExtension === '.webp' ? 'image/webp' : 'image/jpeg',
        upsert: true
      })

    if (uploadError) {
      console.error(`   ❌ Error uploading avatar for ${assignment.firstName} ${assignment.lastName}:`, uploadError)
      continue
    }

    // Update the person's avatar_url
    const { error: updateError } = await supabase
      .from('people')
      .update({ avatar_url: storagePath })
      .eq('id', person.id)

    if (updateError) {
      console.error(`   ❌ Error updating avatar_url for ${assignment.firstName} ${assignment.lastName}:`, updateError)
      continue
    }

    console.log(`   ✅ Uploaded avatar for ${assignment.firstName} ${assignment.lastName}`)
  }

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
