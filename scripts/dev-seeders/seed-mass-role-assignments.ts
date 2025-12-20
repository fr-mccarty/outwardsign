/**
 * Dev Seeder: Mass Role Assignments
 *
 * Assigns people to liturgical mass roles (Lector, Server, Usher, etc.)
 * Creates predictable, explicit assignments for development/testing.
 *
 * Mass roles are defined in the mass_roles table (seeded during onboarding).
 * This seeder creates mass_role_members entries linking people to those roles.
 */

import type { DevSeederContext } from './types'
import { logSuccess, logWarning, logInfo } from '../../src/lib/utils/console'

export interface MassRoleAssignmentsResult {
  success: boolean
  assignmentsCreated: number
}

export async function seedMassRoleAssignments(
  ctx: DevSeederContext,
  people: Array<{ id: string }> | null
): Promise<MassRoleAssignmentsResult> {
  const { supabase, parishId } = ctx

  if (!people || people.length < 15) {
    logWarning('Skipping mass role assignments - need at least 15 people')
    return { success: false, assignmentsCreated: 0 }
  }

  logInfo('')
  logInfo('Assigning people to mass roles...')

  // Fetch existing mass roles
  const { data: massRoles } = await supabase
    .from('mass_roles')
    .select('id, name')
    .eq('parish_id', parishId)
    .eq('is_active', true)
    .order('display_order')

  if (!massRoles || massRoles.length === 0) {
    logWarning('No mass roles found - run onboarding seeder first')
    return { success: false, assignmentsCreated: 0 }
  }

  // Create a map of role names to IDs
  const roleMap = new Map(massRoles.map(r => [r.name, r.id]))

  // Explicit role assignments
  // Each entry: person index -> array of roles with membership type
  const roleAssignments: Array<{
    personIndex: number
    roles: Array<{ name: string; type: 'MEMBER' | 'LEADER' }>
  }> = [
    // Person 0: Coordinator (Leader)
    { personIndex: 0, roles: [
      { name: 'Coordinator', type: 'LEADER' }
    ]},
    // Person 1: Lector, Eucharistic Minister
    { personIndex: 1, roles: [
      { name: 'Lector', type: 'MEMBER' },
      { name: 'Eucharistic Minister', type: 'MEMBER' }
    ]},
    // Person 2: Lector (Leader), Usher
    { personIndex: 2, roles: [
      { name: 'Lector', type: 'LEADER' },
      { name: 'Usher', type: 'MEMBER' }
    ]},
    // Person 3: Cantor (Leader), Music Minister
    { personIndex: 3, roles: [
      { name: 'Cantor', type: 'LEADER' },
      { name: 'Music Minister', type: 'MEMBER' }
    ]},
    // Person 4: Server, Sacristan
    { personIndex: 4, roles: [
      { name: 'Server', type: 'MEMBER' },
      { name: 'Sacristan', type: 'MEMBER' }
    ]},
    // Person 5: Eucharistic Minister (Leader), Greeter
    { personIndex: 5, roles: [
      { name: 'Eucharistic Minister', type: 'LEADER' },
      { name: 'Greeter', type: 'MEMBER' }
    ]},
    // Person 6: Usher (Leader), Security Team
    { personIndex: 6, roles: [
      { name: 'Usher', type: 'LEADER' },
      { name: 'Security Team', type: 'MEMBER' }
    ]},
    // Person 7: Server (Leader), Gift Bearer
    { personIndex: 7, roles: [
      { name: 'Server', type: 'LEADER' },
      { name: 'Gift Bearer', type: 'MEMBER' }
    ]},
    // Person 8: Lector, Pre-Mass Speaker
    { personIndex: 8, roles: [
      { name: 'Lector', type: 'MEMBER' },
      { name: 'Pre-Mass Speaker', type: 'MEMBER' }
    ]},
    // Person 9: Greeter (Leader), Usher
    { personIndex: 9, roles: [
      { name: 'Greeter', type: 'LEADER' },
      { name: 'Usher', type: 'MEMBER' }
    ]},
    // Person 10: Server
    { personIndex: 10, roles: [
      { name: 'Server', type: 'MEMBER' }
    ]},
    // Person 11: Eucharistic Minister, Lector
    { personIndex: 11, roles: [
      { name: 'Eucharistic Minister', type: 'MEMBER' },
      { name: 'Lector', type: 'MEMBER' }
    ]},
    // Person 12: Usher, Security Team (Leader)
    { personIndex: 12, roles: [
      { name: 'Usher', type: 'MEMBER' },
      { name: 'Security Team', type: 'LEADER' }
    ]},
    // Person 13: Music Minister (Leader), Cantor
    { personIndex: 13, roles: [
      { name: 'Music Minister', type: 'LEADER' },
      { name: 'Cantor', type: 'MEMBER' }
    ]},
    // Person 14: Sacristan (Leader)
    { personIndex: 14, roles: [
      { name: 'Sacristan', type: 'LEADER' }
    ]},
  ]

  const memberships: Array<{
    person_id: string
    parish_id: string
    mass_role_id: string
    membership_type: string
    active: boolean
  }> = []

  for (const assignment of roleAssignments) {
    if (assignment.personIndex >= people.length) continue

    for (const role of assignment.roles) {
      const roleId = roleMap.get(role.name)
      if (!roleId) {
        logWarning(`Role "${role.name}" not found`)
        continue
      }

      memberships.push({
        person_id: people[assignment.personIndex].id,
        parish_id: parishId,
        mass_role_id: roleId,
        membership_type: role.type,
        active: true
      })
    }
  }

  if (memberships.length === 0) {
    logWarning('No mass role assignments to create')
    return { success: false, assignmentsCreated: 0 }
  }

  const { error } = await supabase
    .from('mass_role_members')
    .insert(memberships)

  if (error) {
    logWarning(`Error creating mass role assignments: ${error.message}`)
    return { success: false, assignmentsCreated: 0 }
  }

  logSuccess(`Created ${memberships.length} mass role assignments`)

  // Show summary by role
  const summary = massRoles
    .map(role => {
      const total = memberships.filter(m => m.mass_role_id === role.id).length
      const leaders = memberships.filter(m => m.mass_role_id === role.id && m.membership_type === 'LEADER').length
      if (total === 0) return null
      return `${role.name}: ${total}${leaders > 0 ? ` (${leaders} leader)` : ''}`
    })
    .filter(Boolean)
    .join(', ')

  logInfo(`  ${summary}`)

  return { success: true, assignmentsCreated: memberships.length }
}
