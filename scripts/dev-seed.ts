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

  // Check if readings already exist for this parish
  console.log('📖 Checking for existing readings...')

  const { data: existingReadings } = await supabase
    .from('readings')
    .select('id')
    .eq('parish_id', parishId)
    .limit(1)

  if (!existingReadings || existingReadings.length === 0) {
    console.log('   No readings found, seeding...')

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

    console.log(`   ✅ ${readings?.length || 0} readings created`)
  } else {
    console.log(`   ✅ Readings already exist, skipping`)
  }
  console.log('')

  // Everything below is EXTRA development data (not part of onboarding)
  console.log('🔧 Adding extra development data...')
  console.log('')

  // Seed group roles (SAME AS ONBOARDING - keeping consistent)
  console.log('🎭 Creating group roles...')
  const { data: groupRoles, error: groupRolesError } = await supabase
    .from('group_roles')
    .insert([
      {
        parish_id: parishId,
        name: 'Leader',
        description: 'Leads and coordinates the group',
        is_active: true,
        display_order: 1
      },
      {
        parish_id: parishId,
        name: 'Member',
        description: 'Active participant in the group',
        is_active: true,
        display_order: 2
      },
      {
        parish_id: parishId,
        name: 'Secretary',
        description: 'Maintains records and communications',
        is_active: true,
        display_order: 3
      },
      {
        parish_id: parishId,
        name: 'Treasurer',
        description: 'Manages group finances',
        is_active: true,
        display_order: 4
      },
      {
        parish_id: parishId,
        name: 'Coordinator',
        description: 'Coordinates group activities and events',
        is_active: true,
        display_order: 5
      }
    ])
    .select()

  if (groupRolesError) {
    console.error('⚠️  Warning: Error creating group roles:', groupRolesError.message)
  } else {
    console.log(`   ✅ ${groupRoles?.length || 0} group roles created`)
  }
  console.log('')

  // Seed mass roles (liturgical roles for Mass)
  console.log('✝️  Creating mass roles...')
  const { data: massRoles, error: massRolesError } = await supabase
    .from('mass_roles')
    .insert([
      {
        parish_id: parishId,
        name: 'Lector',
        description: 'Proclaims the Word of God during the Liturgy of the Word',
        is_active: true,
        display_order: 1
      },
      {
        parish_id: parishId,
        name: 'Extraordinary Minister of Holy Communion',
        description: 'Assists in distributing Holy Communion to the faithful',
        is_active: true,
        display_order: 2
      },
      {
        parish_id: parishId,
        name: 'Altar Server',
        description: 'Assists the priest during Mass',
        is_active: true,
        display_order: 3
      },
      {
        parish_id: parishId,
        name: 'Cantor',
        description: 'Leads the congregation in singing the responsorial psalm and other sung parts',
        is_active: true,
        display_order: 4
      },
      {
        parish_id: parishId,
        name: 'Usher',
        description: 'Welcomes parishioners, assists with seating, and takes up collection',
        is_active: true,
        display_order: 5
      },
      {
        parish_id: parishId,
        name: 'Sacristan',
        description: 'Prepares the sacred vessels, vestments, and altar for Mass',
        is_active: true,
        display_order: 6
      },
      {
        parish_id: parishId,
        name: 'Greeter',
        description: 'Welcomes people at the entrance and hands out worship aids',
        is_active: true,
        display_order: 7
      },
      {
        parish_id: parishId,
        name: 'Gift Bearer',
        description: 'Brings forward the gifts of bread and wine during the Offertory',
        is_active: true,
        display_order: 8
      }
    ])
    .select()

  if (massRolesError) {
    console.error('⚠️  Warning: Error creating mass roles:', massRolesError.message)
  } else {
    console.log(`   ✅ ${massRoles?.length || 0} mass roles created`)

    // Create a sample mass role template
    if (massRoles && massRoles.length > 0) {
      console.log('')
      console.log('📋 Creating mass role templates...')

      const { data: massTemplate, error: templateError } = await supabase
        .from('mass_roles_templates')
        .insert({
          parish_id: parishId,
          name: 'Sunday Mass',
          description: 'Standard Sunday Mass role assignments',
          note: 'Typical roles needed for a Sunday morning Mass with full participation'
        })
        .select()
        .single()

      if (templateError) {
        console.error('⚠️  Warning: Error creating mass role template:', templateError.message)
      } else {
        console.log(`   ✅ Mass role template created: ${massTemplate.name}`)

        // Add template items (specific roles with counts)
        const lectorRole = massRoles.find(r => r.name === 'Lector')
        const emhcRole = massRoles.find(r => r.name === 'Extraordinary Minister of Holy Communion')
        const serverRole = massRoles.find(r => r.name === 'Altar Server')
        const cantorRole = massRoles.find(r => r.name === 'Cantor')
        const usherRole = massRoles.find(r => r.name === 'Usher')
        const sacristanRole = massRoles.find(r => r.name === 'Sacristan')
        const greeterRole = massRoles.find(r => r.name === 'Greeter')
        const giftBearerRole = massRoles.find(r => r.name === 'Gift Bearer')

        const templateItems = [
          { template_id: massTemplate.id, mass_role_id: lectorRole?.id, count: 2, position: 0 },
          { template_id: massTemplate.id, mass_role_id: cantorRole?.id, count: 1, position: 1 },
          { template_id: massTemplate.id, mass_role_id: serverRole?.id, count: 2, position: 2 },
          { template_id: massTemplate.id, mass_role_id: emhcRole?.id, count: 4, position: 3 },
          { template_id: massTemplate.id, mass_role_id: usherRole?.id, count: 4, position: 4 },
          { template_id: massTemplate.id, mass_role_id: greeterRole?.id, count: 2, position: 5 },
          { template_id: massTemplate.id, mass_role_id: sacristanRole?.id, count: 1, position: 6 },
          { template_id: massTemplate.id, mass_role_id: giftBearerRole?.id, count: 2, position: 7 }
        ].filter(item => item.mass_role_id) // Only include if role exists

        const { data: createdItems, error: itemsError } = await supabase
          .from('mass_roles_template_items')
          .insert(templateItems)

        if (itemsError) {
          console.error('⚠️  Warning: Error creating template items:', itemsError.message)
        } else {
          console.log(`   ✅ ${templateItems.length} template items created`)
        }
      }
    }
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
