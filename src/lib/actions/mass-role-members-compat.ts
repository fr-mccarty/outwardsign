'use server'

/**
 * Mass Role Directory - uses the simplified mass_role_members system
 */

import { createClient } from '@/lib/supabase/server'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import type { Person, PersonRoleStats } from '@/lib/types'

// Import functions from new modules
import {
  getPersonBlackoutDates,
  getPersonBlackoutDatesWithPerson,
  getPersonBlackoutDate,
  createPersonBlackoutDate,
  updatePersonBlackoutDate,
  deletePersonBlackoutDate,
  checkPersonAvailability,
  type PersonBlackoutDate,
  type PersonBlackoutDateWithPerson,
  type CreatePersonBlackoutDateData,
  type UpdatePersonBlackoutDateData,
} from './person-blackout-dates'

import {
  getMassRoleMembersByPerson,
  getMassRoleMember,
  createMassRoleMember,
  updateMassRoleMember,
  deleteMassRoleMember,
  type MassRoleMember,
  type MassRoleMemberWithDetails,
  type CreateMassRoleMemberData,
  type UpdateMassRoleMemberData,
} from './mass-role-members'

// Re-export for backward compatibility
export { getPersonBlackoutDates as getBlackoutDates }
export { getPersonBlackoutDatesWithPerson as getBlackoutDatesWithPerson }
export { getPersonBlackoutDate as getBlackoutDate }
export { createPersonBlackoutDate as createBlackoutDate }
export { updatePersonBlackoutDate as updateBlackoutDate }
export { deletePersonBlackoutDate as deleteBlackoutDate }
export { checkPersonAvailability as checkAvailability }

export { getMassRoleMembersByPerson as getMassRolePreferences }
export { getMassRoleMembersByPerson as getMassRolePreferencesWithDetails }
export { getMassRoleMember as getMassRolePreference }
export { createMassRoleMember as createMassRolePreference }
export { updateMassRoleMember as updateMassRolePreference }
export { deleteMassRoleMember as deleteMassRolePreference }

// Re-export types
export type MassRoleBlackoutDate = PersonBlackoutDate
export type MassRoleBlackoutDateWithPerson = PersonBlackoutDateWithPerson
export type CreateMassRoleBlackoutDateData = CreatePersonBlackoutDateData
export type UpdateMassRoleBlackoutDateData = UpdatePersonBlackoutDateData

export type MassRolePreference = MassRoleMember
export type MassRolePreferenceWithDetails = MassRoleMemberWithDetails
export type CreateMassRolePreferenceData = CreateMassRoleMemberData
export type UpdateMassRolePreferenceData = UpdateMassRoleMemberData

// ========== PEOPLE WITH MASS ROLES (uses mass_role_members) ==========

export interface PersonWithMassRoles extends Person {
  role_names: string[]
  preference_count: number
}

/**
 * Get all people who have mass role memberships (serve in mass roles)
 * Returns people with their role names for display in the directory
 */
export async function getPeopleWithMassRolePreferences(): Promise<PersonWithMassRoles[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get all active role members with role details
  const { data: memberData, error: memberError } = await supabase
    .from('mass_role_members')
    .select(`
      person_id,
      mass_role:mass_roles(name)
    `)
    .eq('parish_id', selectedParishId)
    .eq('active', true)

  if (memberError) {
    console.error('Error fetching people with role memberships:', memberError)
    throw new Error('Failed to fetch people with mass role memberships')
  }

  // Group by person and collect role names
  const personRoles = new Map<string, string[]>()

  memberData?.forEach((member) => {
    if (!personRoles.has(member.person_id)) {
      personRoles.set(member.person_id, [])
    }
    // mass_role is returned as a single object (not array) due to foreign key
    const role = member.mass_role as unknown as { name: string } | null
    if (role?.name) {
      personRoles.get(member.person_id)!.push(role.name)
    }
  })

  const personIds = Array.from(personRoles.keys())

  if (personIds.length === 0) {
    return []
  }

  // Fetch the actual people records
  const { data: people, error: peopleError } = await supabase
    .from('people')
    .select('*')
    .eq('parish_id', selectedParishId)
    .in('id', personIds)
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })

  if (peopleError) {
    console.error('Error fetching people:', peopleError)
    throw new Error('Failed to fetch people')
  }

  // Combine people with their roles
  return people.map((person: Person) => ({
    ...person,
    role_names: personRoles.get(person.id) || [],
    preference_count: personRoles.get(person.id)?.length || 0
  }))
}

// ========== HELPER FUNCTIONS ==========

/**
 * Get all people who are members of a specific mass role
 */
export async function getPeopleWithRole(roleId: string): Promise<Person[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_role_members')
    .select('person:people(*)')
    .eq('parish_id', selectedParishId)
    .eq('mass_role_id', roleId)
    .eq('active', true)

  if (error) {
    console.error('Error fetching people with role:', error)
    throw new Error('Failed to fetch people with role')
  }

  // Extract person objects from the nested structure
  // Supabase returns person as an array when using select with join
  const people = data?.map((item: { person: Person | Person[] }) => {
    return Array.isArray(item.person) ? item.person[0] : item.person
  }).filter(Boolean) || []
  return people as Person[]
}

/**
 * Get assignment statistics for a person
 */
export async function getPersonRoleStats(personId: string): Promise<PersonRoleStats> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  try {
    // Query mass_assignment table (renamed from mass_role_instances)
    // This tracks actual assignments of people to specific masses

    // For now, return empty stats as placeholder
    // TODO: Implement full stats once mass scheduling is active
    return {
      total_assignments: 0,
      assignments_this_month: 0,
      assignments_this_year: 0,
      last_assignment_date: null,
      roles: [],
    }
  } catch (error) {
    console.error('Unexpected error in getPersonRoleStats:', error)
    // Return empty stats on any error
    return {
      total_assignments: 0,
      assignments_this_month: 0,
      assignments_this_year: 0,
      last_assignment_date: null,
      roles: [],
    }
  }
}
