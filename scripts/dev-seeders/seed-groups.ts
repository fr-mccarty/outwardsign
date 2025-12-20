/**
 * Dev Seeder: Sample Groups
 *
 * Creates sample groups and group memberships for development/testing.
 */

import type { DevSeederContext } from './types'
import { logSuccess, logWarning, logInfo } from '../../src/lib/utils/console'

export async function seedGroups(ctx: DevSeederContext) {
  const { supabase, parishId } = ctx

  logInfo('Creating sample groups...')

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
    logWarning(`Error creating groups: ${groupsError.message}`)
    return { success: false, groups: null }
  }

  logSuccess(`${groups?.length || 0} groups created`)
  return { success: true, groups }
}

export async function seedGroupMemberships(
  ctx: DevSeederContext,
  groups: Array<{ id: string }> | null,
  people: Array<{ id: string }> | null
) {
  const { supabase, parishId } = ctx

  if (!groups || groups.length === 0 || !people || people.length === 0) {
    logWarning('Skipping group memberships - missing groups or people')
    return { success: false }
  }

  // Fetch group roles
  const { data: groupRoles } = await supabase
    .from('group_roles')
    .select('*')
    .eq('parish_id', parishId)

  if (!groupRoles || groupRoles.length === 0) {
    logWarning('Skipping group memberships - no group roles found')
    return { success: false }
  }

  logInfo('')
  logInfo('Adding members to groups with group roles...')

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
    logWarning(`Error creating group memberships: ${membershipsError.message}`)
    return { success: false }
  }

  logSuccess(`${memberships.length} group memberships created`)
  return { success: true }
}
