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
        sex: 'Male',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[0 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        phone_number: '(555) 987-6543',
        sex: 'Female',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[1 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Bob',
        last_name: 'Johnson',
        email: 'bob.johnson@example.com',
        phone_number: '(555) 246-8101',
        sex: 'Male',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[2 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Maria',
        last_name: 'Garcia',
        email: 'maria.garcia@example.com',
        phone_number: '(555) 369-1214',
        sex: 'Female',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[3 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Michael',
        last_name: 'Chen',
        email: 'michael.chen@example.com',
        phone_number: '(555) 482-1357',
        sex: 'Male',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[4 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Sarah',
        last_name: 'Williams',
        email: 'sarah.williams@example.com',
        phone_number: '(555) 159-2634',
        sex: 'Female',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[5 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'David',
        last_name: 'Martinez',
        email: 'david.martinez@example.com',
        phone_number: '(555) 753-9514',
        sex: 'Male',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[6 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Emily',
        last_name: 'Taylor',
        email: 'emily.taylor@example.com',
        phone_number: '(555) 951-7532',
        sex: 'Female',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[7 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'James',
        last_name: 'Anderson',
        email: 'james.anderson@example.com',
        phone_number: '(555) 357-1593',
        sex: 'Male',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[8 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Lisa',
        last_name: 'Brown',
        email: 'lisa.brown@example.com',
        phone_number: '(555) 753-8642',
        sex: 'Female',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[9 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Robert',
        last_name: 'Wilson',
        email: 'robert.wilson@example.com',
        phone_number: '(555) 951-3578',
        sex: 'Male',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[10 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Patricia',
        last_name: 'Moore',
        email: 'patricia.moore@example.com',
        phone_number: '(555) 159-7534',
        sex: 'Female',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[11 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Thomas',
        last_name: 'Lee',
        email: 'thomas.lee@example.com',
        phone_number: '(555) 357-9512',
        sex: 'Male',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[12 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Jennifer',
        last_name: 'White',
        email: 'jennifer.white@example.com',
        phone_number: '(555) 753-1596',
        sex: 'Female',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[13 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Christopher',
        last_name: 'Harris',
        email: 'christopher.harris@example.com',
        phone_number: '(555) 951-7538',
        sex: 'Male',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[14 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Linda',
        last_name: 'Clark',
        email: 'linda.clark@example.com',
        phone_number: '(555) 159-3574',
        sex: 'Female',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[15 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Daniel',
        last_name: 'Rodriguez',
        email: 'daniel.rodriguez@example.com',
        phone_number: '(555) 357-7539',
        sex: 'Male',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[16 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Barbara',
        last_name: 'Lewis',
        email: 'barbara.lewis@example.com',
        phone_number: '(555) 753-9516',
        sex: 'Female',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[17 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Matthew',
        last_name: 'Walker',
        email: 'matthew.walker@example.com',
        phone_number: '(555) 951-1597',
        sex: 'Male',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[18 % weekendMassTimeItems.length].id] : []
      },
      {
        parish_id: parishId,
        first_name: 'Nancy',
        last_name: 'Hall',
        email: 'nancy.hall@example.com',
        phone_number: '(555) 159-7535',
        sex: 'Female',
        mass_times_template_item_ids: weekendMassTimeItems.length > 0 ? [weekendMassTimeItems[19 % weekendMassTimeItems.length].id] : []
      },
    ])
    .select()

  if (peopleError) {
    console.error('⚠️  Warning: Error creating people:', peopleError.message)
  } else {
    console.log(`   ✅ ${people?.length || 0} people created`)

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
        // Lectors group
        {
          group_id: groups[0].id, // Lectors
          person_id: people[0].id, // John Doe - Leader
          group_role_id: leaderRole?.id
        },
        {
          group_id: groups[0].id, // Lectors
          person_id: people[1].id, // Jane Smith - Member
          group_role_id: memberRole?.id
        },
        // EMHC group
        {
          group_id: groups[1].id, // EMHC
          person_id: people[2].id, // Bob Johnson - Coordinator
          group_role_id: coordinatorRole?.id
        },
        {
          group_id: groups[1].id, // EMHC
          person_id: people[3].id, // Maria Garcia - Secretary
          group_role_id: secretaryRole?.id
        },
        // Altar Servers
        {
          group_id: groups[2].id, // Altar Servers
          person_id: people[4].id, // Michael Chen - Member
          group_role_id: memberRole?.id
        },
        // Choir
        {
          group_id: groups[3].id, // Choir
          person_id: people[0].id, // John Doe (also in choir) - Member
          group_role_id: memberRole?.id
        },
        {
          group_id: groups[3].id, // Choir
          person_id: people[3].id, // Maria Garcia (also in choir) - Member
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
