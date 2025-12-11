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

// =====================================================
// Sample People Data - used for both insert and avatar assignment
// =====================================================
interface SamplePerson {
  firstName: string
  lastName: string
  email: string
  phone: string
  sex: 'MALE' | 'FEMALE'
  avatarFile?: string
}

const SAMPLE_PEOPLE: SamplePerson[] = [
  { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', phone: '(555) 123-4567', sex: 'MALE', avatarFile: 'fr-josh.webp' },
  { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', phone: '(555) 987-6543', sex: 'FEMALE' },
  { firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@example.com', phone: '(555) 246-8101', sex: 'MALE' },
  { firstName: 'Maria', lastName: 'Garcia', email: 'maria.garcia@example.com', phone: '(555) 369-1214', sex: 'FEMALE' },
  { firstName: 'Michael', lastName: 'Chen', email: 'michael.chen@example.com', phone: '(555) 482-1357', sex: 'MALE' },
  { firstName: 'Sarah', lastName: 'Williams', email: 'sarah.williams@example.com', phone: '(555) 159-2634', sex: 'FEMALE' },
  { firstName: 'David', lastName: 'Martinez', email: 'david.martinez@example.com', phone: '(555) 753-9514', sex: 'MALE' },
  { firstName: 'Emily', lastName: 'Taylor', email: 'emily.taylor@example.com', phone: '(555) 951-7532', sex: 'FEMALE' },
  { firstName: 'James', lastName: 'Anderson', email: 'james.anderson@example.com', phone: '(555) 357-1593', sex: 'MALE', avatarFile: 'joe.webp' },
  { firstName: 'Lisa', lastName: 'Brown', email: 'lisa.brown@example.com', phone: '(555) 753-8642', sex: 'FEMALE' },
  { firstName: 'Robert', lastName: 'Wilson', email: 'robert.wilson@example.com', phone: '(555) 951-3578', sex: 'MALE' },
  { firstName: 'Patricia', lastName: 'Moore', email: 'patricia.moore@example.com', phone: '(555) 159-7534', sex: 'FEMALE' },
  { firstName: 'Thomas', lastName: 'Lee', email: 'thomas.lee@example.com', phone: '(555) 357-9512', sex: 'MALE' },
  { firstName: 'Jennifer', lastName: 'White', email: 'jennifer.white@example.com', phone: '(555) 753-1596', sex: 'FEMALE' },
  { firstName: 'Christopher', lastName: 'Harris', email: 'christopher.harris@example.com', phone: '(555) 951-7538', sex: 'MALE' },
  { firstName: 'Linda', lastName: 'Clark', email: 'linda.clark@example.com', phone: '(555) 159-3574', sex: 'FEMALE' },
  { firstName: 'Daniel', lastName: 'Rodriguez', email: 'daniel.rodriguez@example.com', phone: '(555) 357-7539', sex: 'MALE' },
  { firstName: 'Barbara', lastName: 'Lewis', email: 'barbara.lewis@example.com', phone: '(555) 753-9516', sex: 'FEMALE' },
  { firstName: 'Matthew', lastName: 'Walker', email: 'matthew.walker@example.com', phone: '(555) 951-1597', sex: 'MALE' },
  { firstName: 'Nancy', lastName: 'Hall', email: 'nancy.hall@example.com', phone: '(555) 159-7535', sex: 'FEMALE' },
]

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
        state: 'California',
        country: 'United States'
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
  console.log('📖 Seeding standard parish data (roles, templates, event types)...')

  const { data: existingPetitionTemplates } = await supabase
    .from('petition_templates')
    .select('id')
    .eq('parish_id', parishId)
    .limit(1)

  if (!existingPetitionTemplates || existingPetitionTemplates.length === 0) {
    const { seedParishData } = await import('../src/lib/seeding/parish-seed-data')

    try {
      const result = await seedParishData(supabase, parishId)
      console.log(`   ✅ Petition templates: ${result.petitionTemplates.length}`)
      console.log(`   ✅ Group roles: ${result.groupRoles.length}`)
      console.log(`   ✅ Mass roles: ${result.massRoles.length}`)
      console.log(`   ✅ Event types: ${result.eventTypes.length}`)
      console.log(`   ✅ Mass types, role templates, and time templates created`)
    } catch (error) {
      console.error('❌ Error seeding parish data:', error)
      process.exit(1)
    }
  } else {
    console.log(`   ✅ Parish data already exists, skipping`)
  }
  console.log('')

  // Seed content library (prayers, ceremony instructions, announcements)
  console.log('📝 Seeding content library...')

  const { data: existingContent } = await supabase
    .from('contents')
    .select('id')
    .eq('parish_id', parishId)
    .limit(1)

  if (!existingContent || existingContent.length === 0) {
    const { seedContentForParish } = await import('../src/lib/seeding/content-seed')

    try {
      await seedContentForParish(supabase, parishId)
    } catch (error) {
      console.error('❌ Error seeding content library:', error)
      // Non-fatal - continue with rest of seeding
    }
  } else {
    console.log(`   ✅ Content library already exists, skipping`)
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
    .insert(
      SAMPLE_PEOPLE.map((person, index) => ({
        parish_id: parishId,
        first_name: person.firstName,
        last_name: person.lastName,
        email: person.email,
        phone_number: person.phone,
        sex: person.sex,
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[index % weekendMassTimeItems.length].id] : []
      }))
    )
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

  // Upload sample avatar images for people with avatarFile defined in SAMPLE_PEOPLE
  console.log('')
  console.log('🖼️  Uploading sample avatar images...')

  // Filter to people who have an avatar file defined
  const peopleWithAvatars = SAMPLE_PEOPLE.filter(p => p.avatarFile)

  for (const samplePerson of peopleWithAvatars) {
    // Find the person
    const { data: person, error: personError } = await supabase
      .from('people')
      .select('id')
      .eq('parish_id', parishId)
      .eq('first_name', samplePerson.firstName)
      .eq('last_name', samplePerson.lastName)
      .single()

    if (personError || !person) {
      console.log(`   ⚠️  Could not find ${samplePerson.firstName} ${samplePerson.lastName}`)
      continue
    }

    // Read the image file from public/team/
    const imagePath = path.join(process.cwd(), 'public', 'team', samplePerson.avatarFile!)

    if (!fs.existsSync(imagePath)) {
      console.log(`   ⚠️  Image file not found: ${imagePath}`)
      continue
    }

    const imageBuffer = fs.readFileSync(imagePath)
    const fileExtension = path.extname(samplePerson.avatarFile!)
    const storagePath = `${parishId}/${person.id}${fileExtension}`

    // Upload to storage bucket
    const { error: uploadError } = await supabase.storage
      .from('person-avatars')
      .upload(storagePath, imageBuffer, {
        contentType: fileExtension === '.webp' ? 'image/webp' : 'image/jpeg',
        upsert: true
      })

    if (uploadError) {
      console.error(`   ❌ Error uploading avatar for ${samplePerson.firstName} ${samplePerson.lastName}:`, uploadError)
      continue
    }

    // Update the person's avatar_url
    const { error: updateError } = await supabase
      .from('people')
      .update({ avatar_url: storagePath })
      .eq('id', person.id)

    if (updateError) {
      console.error(`   ❌ Error updating avatar_url for ${samplePerson.firstName} ${samplePerson.lastName}:`, updateError)
      continue
    }

    console.log(`   ✅ Uploaded avatar for ${samplePerson.firstName} ${samplePerson.lastName}`)
  }

  // =====================================================
  // Create Sample Dynamic Events (2 per event type)
  // =====================================================
  console.log('')
  console.log('📅 Creating sample events for each event type...')

  // First, create or fetch locations for events
  let churchLocation: { id: string } | null = null
  let hallLocation: { id: string } | null = null
  let funeralHomeLocation: { id: string } | null = null

  // Check for existing locations
  const { data: existingLocations } = await supabase
    .from('locations')
    .select('id, name')
    .eq('parish_id', parishId)

  if (existingLocations && existingLocations.length >= 3) {
    churchLocation = existingLocations.find(l => l.name.includes('Church')) || existingLocations[0]
    hallLocation = existingLocations.find(l => l.name.includes('Hall')) || existingLocations[1]
    funeralHomeLocation = existingLocations.find(l => l.name.includes('Funeral')) || existingLocations[2]
    console.log(`   ✅ Using ${existingLocations.length} existing locations`)
  } else {
    // Create locations if they don't exist
    const locationsToCreate = [
      {
        parish_id: parishId,
        name: "St. Mary's Catholic Church",
        description: 'Main parish church and worship space',
        street: '100 Church Street',
        city: 'Springfield',
        state: 'IL',
        country: 'USA'
      },
      {
        parish_id: parishId,
        name: 'Parish Hall',
        description: 'Parish event center and reception hall',
        street: '102 Church Street',
        city: 'Springfield',
        state: 'IL',
        country: 'USA'
      },
      {
        parish_id: parishId,
        name: 'Springfield Funeral Home',
        description: 'Local funeral home for vigil services',
        street: '500 Memorial Drive',
        city: 'Springfield',
        state: 'IL',
        country: 'USA'
      }
    ]

    const { data: newLocations, error: locationsError } = await supabase
      .from('locations')
      .insert(locationsToCreate)
      .select()

    if (locationsError) {
      console.error('⚠️  Warning: Error creating locations:', locationsError.message)
    } else if (newLocations && newLocations.length === 3) {
      churchLocation = newLocations[0]
      hallLocation = newLocations[1]
      funeralHomeLocation = newLocations[2]
      console.log(`   ✅ Created 3 sample locations`)
    }
  }

  // Fetch all event types with their input field definitions
  const { data: eventTypes } = await supabase
    .from('event_types')
    .select('*, input_field_definitions!input_field_definitions_event_type_id_fkey(*)')
    .eq('parish_id', parishId)
    .is('deleted_at', null)
    .order('order')

  if (!eventTypes || eventTypes.length === 0) {
    console.log('   ⚠️  No event types found, skipping event creation')
  } else if (!people || people.length < 10) {
    console.log('   ⚠️  Not enough people to create events, skipping event creation')
  } else {
    // Helper to get future date
    const getFutureDate = (daysFromNow: number) => {
      const date = new Date()
      date.setDate(date.getDate() + daysFromNow)
      return date.toISOString().split('T')[0]
    }

    // Helper to get past date
    const getPastDate = (daysAgo: number) => {
      const date = new Date()
      date.setDate(date.getDate() - daysAgo)
      return date.toISOString().split('T')[0]
    }

    let totalEventsCreated = 0

    for (const eventType of eventTypes) {
      // Skip "Other" event type - it has no specific fields
      if (eventType.slug === 'other') {
        console.log(`   ⏭️  Skipping "${eventType.name}" (generic type)`)
        continue
      }

      // Create 2 sample events based on event type
      const eventsData: Array<{
        field_values: Record<string, string | boolean>
        occasion: { label: string; date: string; time: string; location_id: string | null }
      }> = []

      switch (eventType.slug) {
        case 'weddings':
          // Wedding 1: John Doe & Jane Smith
          eventsData.push({
            field_values: {
              'Bride': people[1].id, // Jane Smith
              'Groom': people[0].id, // John Doe
              'Wedding Date': getFutureDate(45),
              'Ceremony Location': churchLocation?.id || '',
              'Presider': people[8].id, // James Anderson
              'Reception Location': hallLocation?.id || '',
              'First Reading': 'Genesis 2:18-24',
              'Gospel Reading': 'John 2:1-11',
              'Unity Candle': true,
              'Special Instructions': 'Traditional ceremony with bilingual readings'
            },
            occasion: {
              label: 'Wedding Ceremony',
              date: getFutureDate(45),
              time: '14:00:00',
              location_id: churchLocation?.id || null
            }
          })
          // Wedding 2: Maria Garcia & Bob Johnson
          eventsData.push({
            field_values: {
              'Bride': people[3].id, // Maria Garcia
              'Groom': people[2].id, // Bob Johnson
              'Wedding Date': getFutureDate(90),
              'Ceremony Location': churchLocation?.id || '',
              'Presider': people[8].id,
              'Reception Location': hallLocation?.id || '',
              'First Reading': '1 Corinthians 13:1-13',
              'Gospel Reading': 'Matthew 19:3-6',
              'Unity Candle': false
            },
            occasion: {
              label: 'Wedding Ceremony',
              date: getFutureDate(90),
              time: '11:00:00',
              location_id: churchLocation?.id || null
            }
          })
          break

        case 'funerals':
          // Funeral 1
          eventsData.push({
            field_values: {
              'Deceased': people[10].id, // Robert Wilson
              'Date of Death': getPastDate(3),
              'Funeral Date': getFutureDate(2),
              'Funeral Location': churchLocation?.id || '',
              'Presider': people[8].id,
              'Burial Location': funeralHomeLocation?.id || '',
              'First Reading': 'Wisdom 3:1-9',
              'Psalm': 'Psalm 23',
              'Gospel Reading': 'John 14:1-6',
              'Eulogy Speaker': people[11].id // Patricia Moore
            },
            occasion: {
              label: 'Funeral Mass',
              date: getFutureDate(2),
              time: '10:00:00',
              location_id: churchLocation?.id || null
            }
          })
          // Funeral 2
          eventsData.push({
            field_values: {
              'Deceased': people[12].id, // Thomas Lee
              'Date of Death': getPastDate(1),
              'Funeral Date': getFutureDate(5),
              'Funeral Location': churchLocation?.id || '',
              'Presider': people[8].id,
              'First Reading': 'Romans 8:31-39',
              'Psalm': 'Psalm 116',
              'Gospel Reading': 'John 11:17-27'
            },
            occasion: {
              label: 'Funeral Mass',
              date: getFutureDate(5),
              time: '11:00:00',
              location_id: churchLocation?.id || null
            }
          })
          break

        case 'baptisms':
          // Baptism 1
          eventsData.push({
            field_values: {
              'Child': people[4].id, // Michael Chen (used as placeholder)
              'Mother': people[5].id, // Sarah Williams
              'Father': people[6].id, // David Martinez
              'Godmother': people[7].id, // Emily Taylor
              'Godfather': people[8].id, // James Anderson
              'Baptism Date': getFutureDate(14),
              'Baptism Location': churchLocation?.id || '',
              'Presider': people[0].id
            },
            occasion: {
              label: 'Baptism',
              date: getFutureDate(14),
              time: '13:00:00',
              location_id: churchLocation?.id || null
            }
          })
          // Baptism 2
          eventsData.push({
            field_values: {
              'Child': people[9].id, // Lisa Brown (placeholder)
              'Mother': people[13].id, // Jennifer White
              'Father': people[14].id, // Christopher Harris
              'Godmother': people[15].id, // Linda Clark
              'Godfather': people[16].id, // Daniel Rodriguez
              'Baptism Date': getFutureDate(21),
              'Baptism Location': churchLocation?.id || '',
              'Presider': people[0].id
            },
            occasion: {
              label: 'Baptism',
              date: getFutureDate(21),
              time: '14:00:00',
              location_id: churchLocation?.id || null
            }
          })
          break

        case 'quinceaneras':
          // Quinceañera 1
          eventsData.push({
            field_values: {
              'Quinceañera': people[5].id, // Sarah Williams
              'Mother': people[3].id, // Maria Garcia
              'Father': people[6].id, // David Martinez
              'Ceremony Date': getFutureDate(60),
              'Ceremony Location': churchLocation?.id || '',
              'Presider': people[0].id,
              'Reception Location': hallLocation?.id || ''
            },
            occasion: {
              label: 'Quinceañera Mass',
              date: getFutureDate(60),
              time: '15:00:00',
              location_id: churchLocation?.id || null
            }
          })
          // Quinceañera 2
          eventsData.push({
            field_values: {
              'Quinceañera': people[7].id, // Emily Taylor
              'Mother': people[11].id, // Patricia Moore
              'Father': people[10].id, // Robert Wilson
              'Ceremony Date': getFutureDate(75),
              'Ceremony Location': churchLocation?.id || '',
              'Presider': people[8].id,
              'Reception Location': hallLocation?.id || ''
            },
            occasion: {
              label: 'Quinceañera Mass',
              date: getFutureDate(75),
              time: '16:00:00',
              location_id: churchLocation?.id || null
            }
          })
          break

        case 'presentations':
          // Presentation 1
          eventsData.push({
            field_values: {
              'Child': people[4].id, // Michael Chen (placeholder)
              'Mother': people[1].id, // Jane Smith
              'Father': people[0].id, // John Doe
              'Godmother': people[3].id, // Maria Garcia
              'Godfather': people[2].id, // Bob Johnson
              'Presentation Date': getFutureDate(30),
              'Presentation Location': churchLocation?.id || '',
              'Presider': people[8].id
            },
            occasion: {
              label: 'Presentation',
              date: getFutureDate(30),
              time: '12:00:00',
              location_id: churchLocation?.id || null
            }
          })
          // Presentation 2
          eventsData.push({
            field_values: {
              'Child': people[9].id, // Lisa Brown (placeholder)
              'Mother': people[15].id, // Linda Clark
              'Father': people[16].id, // Daniel Rodriguez
              'Godmother': people[17].id, // Barbara Lewis
              'Godfather': people[18].id, // Matthew Walker
              'Presentation Date': getFutureDate(35),
              'Presentation Location': churchLocation?.id || '',
              'Presider': people[0].id
            },
            occasion: {
              label: 'Presentation',
              date: getFutureDate(35),
              time: '11:30:00',
              location_id: churchLocation?.id || null
            }
          })
          break

        default:
          console.log(`   ⏭️  Unknown event type slug: ${eventType.slug}`)
          continue
      }

      // Insert events and occasions
      for (const eventData of eventsData) {
        // Create the event
        const { data: newEvent, error: eventError } = await supabase
          .from('dynamic_events')
          .insert({
            parish_id: parishId,
            event_type_id: eventType.id,
            field_values: eventData.field_values
          })
          .select()
          .single()

        if (eventError) {
          console.error(`   ❌ Error creating ${eventType.name} event:`, eventError.message)
          continue
        }

        // Create the primary occasion
        const { error: occasionError } = await supabase
          .from('occasions')
          .insert({
            event_id: newEvent.id,
            label: eventData.occasion.label,
            date: eventData.occasion.date,
            time: eventData.occasion.time,
            location_id: eventData.occasion.location_id,
            is_primary: true
          })

        if (occasionError) {
          console.error(`   ❌ Error creating occasion for ${eventType.name}:`, occasionError.message)
          // Clean up the event
          await supabase.from('dynamic_events').delete().eq('id', newEvent.id)
          continue
        }

        totalEventsCreated++
      }

      console.log(`   ✅ Created 2 ${eventType.name} events`)
    }

    console.log(`   📊 Total events created: ${totalEventsCreated}`)
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
