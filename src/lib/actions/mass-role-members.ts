'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { getUserParishRole, requireModuleAccess } from '@/lib/auth/permissions'

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
    preferred_name: string | null
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
    console.error('Error fetching mass role members:', error)
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

  const { data, error } = await supabase
    .from('mass_role_members')
    .select(`
      *,
      person:people(id, first_name, last_name, preferred_name, email),
      mass_role:mass_roles(id, name, description)
    `)
    .eq('parish_id', selectedParishId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching mass role members with details:', error)
    throw new Error('Failed to fetch mass role members with details')
  }

  return data as MassRoleMemberWithDetails[] || []
}

/**
 * Get all members for a specific role
 */
export async function getMassRoleMembersByRole(roleId: string): Promise<MassRoleMemberWithDetails[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_role_members')
    .select(`
      *,
      person:people(id, first_name, last_name, preferred_name, email),
      mass_role:mass_roles(id, name, description)
    `)
    .eq('parish_id', selectedParishId)
    .eq('mass_role_id', roleId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching mass role members by role:', error)
    throw new Error('Failed to fetch mass role members by role')
  }

  return data as MassRoleMemberWithDetails[] || []
}

/**
 * Get all role memberships for a specific person
 */
export async function getMassRoleMembersByPerson(personId: string): Promise<MassRoleMemberWithDetails[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_role_members')
    .select(`
      *,
      person:people(id, first_name, last_name, preferred_name, email),
      mass_role:mass_roles(id, name, description)
    `)
    .eq('parish_id', selectedParishId)
    .eq('person_id', personId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching mass role members by person:', error)
    throw new Error('Failed to fetch mass role members by person')
  }

  return data as MassRoleMemberWithDetails[] || []
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
    console.error('Error fetching mass role member:', error)
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

  // Check permissions - only Admin and Staff can manage role members
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'masses')

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
    console.error('Error creating mass role member:', error)
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

  // Check permissions - only Admin and Staff can manage role members
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'masses')

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
    console.error('Error updating mass role member:', error)
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

  // Check permissions - only Admin and Staff can manage role members
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'masses')

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
    console.error('Error deleting mass role member:', error)
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
    console.error('Error checking active membership:', error)
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
      person:people(id, first_name, last_name, preferred_name, email)
    `)
    .eq('parish_id', selectedParishId)
    .eq('mass_role_id', roleId)
    .eq('active', true)

  if (error) {
    console.error('Error fetching active members for role:', error)
    throw new Error('Failed to fetch active members for role')
  }

  return data?.map((item: any) => {
    const person = Array.isArray(item.person) ? item.person[0] : item.person
    return {
      id: person.id,
      name: person.preferred_name || `${person.first_name} ${person.last_name}`,
      email: person.email,
      membership_type: item.membership_type,
      notes: item.notes,
    }
  }) || []
}
