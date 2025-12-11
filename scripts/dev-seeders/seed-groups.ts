/**
 * Dev Seeder: Sample Groups
 *
 * Creates sample groups and group memberships for development/testing.
 */

import type { DevSeederContext } from './types'

export async function seedGroups(ctx: DevSeederContext) {
  const { supabase, parishId } = ctx

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
    return { success: false, groups: null }
  }

  console.log(`   ✅ ${groups?.length || 0} groups created`)
  return { success: true, groups }
}

export async function seedGroupMemberships(
  ctx: DevSeederContext,
  groups: Array<{ id: string }> | null,
  people: Array<{ id: string }> | null
) {
  const { supabase, parishId } = ctx

  if (!groups || groups.length === 0 || !people || people.length === 0) {
    console.log('   ⚠️  Skipping group memberships - missing groups or people')
    return { success: false }
  }

  // Fetch group roles
  const { data: groupRoles } = await supabase
    .from('group_roles')
    .select('*')
    .eq('parish_id', parishId)

  if (!groupRoles || groupRoles.length === 0) {
    console.log('   ⚠️  Skipping group memberships - no group roles found')
    return { success: false }
  }

  console.log('')
  console.log('🔗 Adding members to groups with group roles...')

  const leaderRole = groupRoles.find(r => r.name === 'Leader')
  const coordinatorRole = groupRoles.find(r => r.name === 'Coordinator')
  const secretaryRole = groupRoles.find(r => r.name === 'Secretary')
  const memberRole = groupRoles.find(r => r.name === 'Member')

  const memberships = [
    // Parish Council
    { group_id: groups[0].id, person_id: people[0].id, group_role_id: leaderRole?.id },
    { group_id: groups[0].id, person_id: people[1].id, group_role_id: memberRole?.id },
    // Finance Council
    { group_id: groups[1].id, person_id: people[2].id, group_role_id: coordinatorRole?.id },
    { group_id: groups[1].id, person_id: people[3].id, group_role_id: secretaryRole?.id },
    // Zumba
    { group_id: groups[2].id, person_id: people[4].id, group_role_id: memberRole?.id },
    // Maintenance Committee
    { group_id: groups[3].id, person_id: people[0].id, group_role_id: memberRole?.id },
    { group_id: groups[3].id, person_id: people[3].id, group_role_id: memberRole?.id },
  ]

  const { error: membershipsError } = await supabase
    .from('group_members')
    .insert(memberships)

  if (membershipsError) {
    console.error('⚠️  Warning: Error creating group memberships:', membershipsError.message)
    return { success: false }
  }

  console.log(`   ✅ ${memberships.length} group memberships created`)
  return { success: true }
}

export async function seedMassRoleMemberships(
  ctx: DevSeederContext,
  people: Array<{ id: string }> | null
) {
  const { supabase, parishId } = ctx

  if (!people || people.length === 0) {
    console.log('   ⚠️  Skipping mass role memberships - no people')
    return { success: false }
  }

  console.log('')
  console.log('🎭 Adding mass role memberships...')

  const { data: massRoles } = await supabase
    .from('mass_roles')
    .select('id, name')
    .eq('parish_id', parishId)
    .order('display_order')

  if (!massRoles || massRoles.length === 0) {
    console.log('   ⚠️  No mass roles found')
    return { success: false }
  }

  const massRoleMemberships: Array<{
    person_id: string
    parish_id: string
    mass_role_id: string
    membership_type: string
    active: boolean
  }> = []

  // Create a random distribution where each person has 0-3 roles
  for (const person of people) {
    const numRoles = Math.floor(Math.random() * 4)

    if (numRoles > 0) {
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
      return { success: false }
    }

    console.log(`   ✅ ${massRoleMemberships.length} mass role memberships created`)

    // Show distribution summary
    const roleCounts = massRoles.map(role => {
      const count = massRoleMemberships.filter(m => m.mass_role_id === role.id).length
      return `${role.name}: ${count}`
    })
    console.log(`   📊 Distribution: ${roleCounts.join(', ')}`)
  }

  return { success: true }
}
