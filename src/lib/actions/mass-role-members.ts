'use server'

import { createClient } from '@/lib/supabase/server'
import { logError } from '@/lib/utils/console'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'

// Types
export interface MassRoleMember {
  id: string
  person_id: string
  parish_id: string
  mass_role_id: string
  membership_type: 'MEMBER' | 'LEADER'
  notes: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface MassRoleMemberWithDetails extends MassRoleMember {
  person: {
    id: string
    first_name: string
    last_name: string
    email: string | null
  }
  mass_role: {
    id: string
    name: string
    description: string | null
  }
}

export interface CreateMassRoleMemberData {
  person_id: string
  mass_role_id: string
  membership_type?: 'MEMBER' | 'LEADER'
  notes?: string
  active?: boolean
}

export interface UpdateMassRoleMemberData {
  membership_type?: 'MEMBER' | 'LEADER'
  notes?: string
  active?: boolean
}

/**
 * Get all mass role members for the current parish
 */
export async function getMassRoleMembers(): Promise<MassRoleMember[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_role_members')
    .select('*')
    .eq('parish_id', selectedParishId)
    .order('created_at', { ascending: false })

  if (error) {
    logError('Error fetching mass role members: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch mass role members')
  }

  return data || []
}

/**
 * Get all mass role members with person and role details
 */
export async function getMassRoleMembersWithDetails(): Promise<MassRoleMemberWithDetails[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get all mass_role_members
  const { data: members, error: membersError } = await supabase
    .from('mass_role_members')
    .select('*')
    .eq('parish_id', selectedParishId)
    .order('created_at', { ascending: false })

  if (membersError) {
    logError('Error fetching mass role members: ' + (membersError instanceof Error ? membersError.message : JSON.stringify(membersError)))
    throw new Error('Failed to fetch mass role members with details')
  }

  if (!members || members.length === 0) {
    return []
  }

  // Get all people
  const personIds = [...new Set(members.map(m => m.person_id))]
  const { data: people, error: peopleError } = await supabase
    .from('people')
    .select('id, first_name, last_name, email')
    .in('id', personIds)
    .eq('parish_id', selectedParishId)

  if (peopleError) {
    logError('Error fetching people: ' + (peopleError instanceof Error ? peopleError.message : JSON.stringify(peopleError)))
  }

  // Get all roles
  const roleIds = [...new Set(members.map(m => m.mass_role_id))]
  const { data: roles, error: rolesError } = await supabase
    .from('mass_roles')
    .select('id, name, description')
    .in('id', roleIds)
    .eq('parish_id', selectedParishId)

  if (rolesError) {
    logError('Error fetching mass roles: ' + (rolesError instanceof Error ? rolesError.message : JSON.stringify(rolesError)))
  }

  // Create lookup maps
  const peopleMap = new Map((people || []).map(p => [p.id, p]))
  const rolesMap = new Map((roles || []).map(r => [r.id, r]))

  return members.map(member => ({
    ...member,
    person: peopleMap.get(member.person_id) || {
      id: member.person_id,
      first_name: '',
      last_name: '',
      email: null
    },
    mass_role: rolesMap.get(member.mass_role_id) || {
      id: member.mass_role_id,
      name: 'Unknown Role',
      description: null
    }
  })) as MassRoleMemberWithDetails[]
}

/**
 * Get all members for a specific role
 */
export async function getMassRoleMembersByRole(roleId: string): Promise<MassRoleMemberWithDetails[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get all mass_role_members for this role
  const { data: members, error: membersError } = await supabase
    .from('mass_role_members')
    .select('*')
    .eq('parish_id', selectedParishId)
    .eq('mass_role_id', roleId)
    .order('created_at', { ascending: false })

  if (membersError) {
    logError('Error fetching mass role members by role: ' + (membersError instanceof Error ? membersError.message : JSON.stringify(membersError)))
    throw new Error('Failed to fetch mass role members by role')
  }

  if (!members || members.length === 0) {
    return []
  }

  // Get all people
  const personIds = [...new Set(members.map(m => m.person_id))]
  const { data: people, error: peopleError } = await supabase
    .from('people')
    .select('id, first_name, last_name, email')
    .in('id', personIds)
    .eq('parish_id', selectedParishId)

  if (peopleError) {
    logError('Error fetching people: ' + (peopleError instanceof Error ? peopleError.message : JSON.stringify(peopleError)))
  }

  // Get the role details
  const { data: role, error: roleError } = await supabase
    .from('mass_roles')
    .select('id, name, description')
    .eq('id', roleId)
    .eq('parish_id', selectedParishId)
    .single()

  if (roleError) {
    logError('Error fetching mass role: ' + (roleError instanceof Error ? roleError.message : JSON.stringify(roleError)))
  }

  // Create lookup map for people
  const peopleMap = new Map((people || []).map(p => [p.id, p]))

  return members.map(member => ({
    ...member,
    person: peopleMap.get(member.person_id) || {
      id: member.person_id,
      first_name: '',
      last_name: '',
      email: null
    },
    mass_role: role || {
      id: roleId,
      name: 'Unknown Role',
      description: null
    }
  })) as MassRoleMemberWithDetails[]
}

/**
 * Get all role memberships for a specific person
 */
export async function getMassRoleMembersByPerson(personId: string): Promise<MassRoleMemberWithDetails[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // First, get the mass_role_members records
  const { data: members, error: membersError } = await supabase
    .from('mass_role_members')
    .select('*')
    .eq('parish_id', selectedParishId)
    .eq('person_id', personId)
    .order('created_at', { ascending: false })

  if (membersError) {
    logError('Error fetching mass role members: ' + (membersError instanceof Error ? membersError.message : JSON.stringify(membersError)))
    logError('Error details: ' + JSON.stringify(membersError, null, 2))
    logError('Person ID: ' + personId)
    logError('Parish ID: ' + selectedParishId)
    throw new Error('Failed to fetch mass role members by person')
  }

  if (!members || members.length === 0) {
    return []
  }

  // Get mass role details for all member records
  const roleIds = members.map(m => m.mass_role_id)

  let roles: { id: string; name: string; description: string | null }[] = []
  if (roleIds.length > 0) {
    const { data: rolesData, error: rolesError } = await supabase
      .from('mass_roles')
      .select('id, name, description')
      .in('id', roleIds)
      .eq('parish_id', selectedParishId)

    if (rolesError) {
      logError('Error fetching mass roles: ' + (rolesError instanceof Error ? rolesError.message : JSON.stringify(rolesError)))
    } else {
      roles = rolesData || []
    }
  }

  // Combine the data
  const rolesMap = new Map(roles.map(r => [r.id, r]))

  // Note: We don't fetch person details here since they're typically fetched separately by the caller
  // This avoids potential RLS issues and redundant queries
  return members.map(member => ({
    ...member,
    person: {
      id: personId,
      first_name: '',
      last_name: '',
      email: null
    },
    mass_role: rolesMap.get(member.mass_role_id) || {
      id: member.mass_role_id,
      name: 'Unknown Role',
      description: null
    }
  })) as MassRoleMemberWithDetails[]
}

/**
 * Get a single mass role member by ID
 */
export async function getMassRoleMember(id: string): Promise<MassRoleMember | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_role_members')
    .select('*')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    logError('Error fetching mass role member: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch mass role member')
  }

  return data
}

/**
 * Create a new mass role member
 */
export async function createMassRoleMember(
  data: CreateMassRoleMemberData
): Promise<MassRoleMember> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()


  const { data: member, error } = await supabase
    .from('mass_role_members')
    .insert({
      parish_id: selectedParishId,
      person_id: data.person_id,
      mass_role_id: data.mass_role_id,
      membership_type: data.membership_type || 'MEMBER',
      notes: data.notes || null,
      active: data.active ?? true,
    })
    .select()
    .single()

  if (error) {
    logError('Error creating mass role member: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to create mass role member')
  }

  revalidatePath('/masses')
  revalidatePath('/mass-role-members')
  revalidatePath(`/people/${data.person_id}`)

  return member
}

/**
 * Update an existing mass role member
 */
export async function updateMassRoleMember(
  id: string,
  data: UpdateMassRoleMemberData
): Promise<MassRoleMember> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()


  const updateData: Record<string, unknown> = {}

  if (data.membership_type !== undefined) updateData.membership_type = data.membership_type
  if (data.notes !== undefined) updateData.notes = data.notes
  if (data.active !== undefined) updateData.active = data.active

  const { data: member, error } = await supabase
    .from('mass_role_members')
    .update(updateData)
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .select()
    .single()

  if (error) {
    logError('Error updating mass role member: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to update mass role member')
  }

  revalidatePath('/masses')
  revalidatePath('/mass-role-members')
  revalidatePath(`/people/${member.person_id}`)

  return member
}

/**
 * Delete a mass role member
 */
export async function deleteMassRoleMember(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()


  // Get the member first to revalidate paths
  const { data: member } = await supabase
    .from('mass_role_members')
    .select('person_id')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .single()

  const { error } = await supabase
    .from('mass_role_members')
    .delete()
    .eq('id', id)
    .eq('parish_id', selectedParishId)

  if (error) {
    logError('Error deleting mass role member: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to delete mass role member')
  }

  revalidatePath('/masses')
  revalidatePath('/mass-role-members')
  if (member?.person_id) {
    revalidatePath(`/people/${member.person_id}`)
  }
}

/**
 * Check if a person is an active member of a specific role
 */
export async function isActiveMember(personId: string, roleId: string): Promise<boolean> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_role_members')
    .select('id')
    .eq('parish_id', selectedParishId)
    .eq('person_id', personId)
    .eq('mass_role_id', roleId)
    .eq('active', true)
    .limit(1)

  if (error) {
    logError('Error checking active membership: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to check active membership')
  }

  return data && data.length > 0
}

/**
 * Get all people who are active members of a specific role
 */
export async function getActiveMembersForRole(roleId: string): Promise<Array<{
  id: string
  name: string
  email: string | null
  membership_type: 'MEMBER' | 'LEADER'
  notes: string | null
}>> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_role_members')
    .select(`
      id,
      membership_type,
      notes,
      person:people(id, first_name, last_name, email)
    `)
    .eq('parish_id', selectedParishId)
    .eq('mass_role_id', roleId)
    .eq('active', true)

  if (error) {
    logError('Error fetching active members for role: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch active members for role')
  }

  return data?.map((item: any) => {
    const person = Array.isArray(item.person) ? item.person[0] : item.person
    return {
      id: person.id,
      name: `${person.first_name} ${person.last_name}`,
      email: person.email,
      membership_type: item.membership_type,
      notes: item.notes,
    }
  }) || []
}

/**
 * Interface for mass time availability
 */
export interface MassTimeAvailability {
  mass_time_template_item_id: string
  mass_time_name: string
  mass_time: string
  day_of_week: string
  available_count: number
}

/**
 * Interface for person available for a mass time
 */
export interface PersonAvailableForMassTime {
  id: string
  person_id: string
  person_name: string
  membership_type: 'MEMBER' | 'LEADER'
}

/**
 * Get list of people available for a specific mass time and role
 */
export async function getPeopleAvailableForMassTime(
  roleId: string,
  massTimeTemplateItemId: string
): Promise<PersonAvailableForMassTime[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get all active members for this role who have this mass time in their availability
  const { data: members, error: membersError } = await supabase
    .from('mass_role_members')
    .select(`
      id,
      person_id,
      membership_type,
      person:people(id, first_name, last_name, mass_times_template_item_ids)
    `)
    .eq('parish_id', selectedParishId)
    .eq('mass_role_id', roleId)
    .eq('active', true)

  if (membersError) {
    logError('Error fetching mass role members: ' + (membersError instanceof Error ? membersError.message : JSON.stringify(membersError)))
    throw new Error('Failed to fetch mass role members')
  }

  if (!members || members.length === 0) {
    return []
  }

  // Filter to only members who have this mass time in their availability
  const availableMembers = members
    .filter((member: any) => {
      const person = Array.isArray(member.person) ? member.person[0] : member.person
      const massTimeIds = person?.mass_times_template_item_ids || []
      return massTimeIds.includes(massTimeTemplateItemId)
    })
    .map((member: any) => {
      const person = Array.isArray(member.person) ? member.person[0] : member.person
      return {
        id: member.id,
        person_id: member.person_id,
        person_name: `${person.first_name} ${person.last_name}`,
        membership_type: member.membership_type
      }
    })

  // Sort by membership type (leaders first), then by name
  return availableMembers.sort((a, b) => {
    if (a.membership_type !== b.membership_type) {
      return a.membership_type === 'LEADER' ? -1 : 1
    }
    return a.person_name.localeCompare(b.person_name)
  })
}

/**
 * Get availability by mass time for a specific role
 * Returns how many active members are available for each mass time
 */
export async function getMassRoleAvailabilityByMassTime(
  roleId: string
): Promise<MassTimeAvailability[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get all active members for this role with their available mass times
  const { data: members, error: membersError } = await supabase
    .from('mass_role_members')
    .select(`
      id,
      person_id,
      active,
      person:people(id, mass_times_template_item_ids)
    `)
    .eq('parish_id', selectedParishId)
    .eq('mass_role_id', roleId)
    .eq('active', true)

  if (membersError) {
    logError('Error fetching mass role members: ' + (membersError instanceof Error ? membersError.message : JSON.stringify(membersError)))
    throw new Error('Failed to fetch mass role members')
  }

  if (!members || members.length === 0) {
    return []
  }

  // Get all mass times template items for this parish
  const { data: massTimesTemplates, error: templatesError } = await supabase
    .from('mass_times_templates')
    .select(`
      id,
      name,
      day_of_week,
      items:mass_times_template_items(id, time, day_type)
    `)
    .eq('parish_id', selectedParishId)
    .eq('is_active', true)

  if (templatesError) {
    logError('Error fetching mass times templates: ' + (templatesError instanceof Error ? templatesError.message : JSON.stringify(templatesError)))
    throw new Error('Failed to fetch mass times templates')
  }

  // Build a map of mass time item ID to mass time details
  const massTimeItemMap = new Map<string, { name: string; time: string; day_of_week: string }>()
  massTimesTemplates?.forEach((template: any) => {
    template.items?.forEach((item: any) => {
      massTimeItemMap.set(item.id, {
        name: template.name,
        time: item.time,
        day_of_week: template.day_of_week
      })
    })
  })

  // Count how many members are available for each mass time
  const availabilityMap = new Map<string, number>()

  members.forEach((member: any) => {
    const person = Array.isArray(member.person) ? member.person[0] : member.person
    const massTimeIds = person?.mass_times_template_item_ids || []

    massTimeIds.forEach((massTimeId: string) => {
      availabilityMap.set(massTimeId, (availabilityMap.get(massTimeId) || 0) + 1)
    })
  })

  // Convert to array and include mass time details
  const result: MassTimeAvailability[] = []
  availabilityMap.forEach((count, massTimeId) => {
    const massTimeDetails = massTimeItemMap.get(massTimeId)
    if (massTimeDetails) {
      result.push({
        mass_time_template_item_id: massTimeId,
        mass_time_name: massTimeDetails.name,
        mass_time: massTimeDetails.time,
        day_of_week: massTimeDetails.day_of_week,
        available_count: count
      })
    }
  })

  // Sort by day of week and time
  const dayOrder: { [key: string]: number } = {
    'SUNDAY': 0,
    'MONDAY': 1,
    'TUESDAY': 2,
    'WEDNESDAY': 3,
    'THURSDAY': 4,
    'FRIDAY': 5,
    'SATURDAY': 6,
    'MOVABLE': 7
  }

  return result.sort((a, b) => {
    const dayDiff = dayOrder[a.day_of_week] - dayOrder[b.day_of_week]
    if (dayDiff !== 0) return dayDiff
    return a.mass_time.localeCompare(b.mass_time)
  })
}
