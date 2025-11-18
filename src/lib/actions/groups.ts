'use server'

import { createClient } from '@/lib/supabase/server'
// redirect import removed - not used
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { getUserParishRole, requireModuleAccess } from '@/lib/auth/permissions'

export interface Group {
  id: string
  parish_id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  person_id: string
  group_role_id?: string | null
  joined_at: string
  person?: {
    id: string
    first_name: string
    last_name: string
    email?: string
  }
  group_role?: {
    id: string
    name: string
    description?: string
  } | null
}

export interface GroupWithMembers extends Group {
  members: GroupMember[]
}

export interface CreateGroupData {
  name: string
  description?: string
  is_active?: boolean
}

export interface UpdateGroupData {
  name?: string
  description?: string
  is_active?: boolean
}

export async function getGroups(): Promise<Group[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching groups:', error)
    throw new Error('Failed to fetch groups')
  }

  return data || []
}

export async function getGroup(id: string): Promise<GroupWithMembers | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  
  const supabase = await createClient()

  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .eq('id', id)
    .single()

  if (groupError) {
    if (groupError.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching group:', groupError)
    throw new Error('Failed to fetch group')
  }

  // Get group members with person details and group role
  const { data: members, error: membersError } = await supabase
    .from('group_members')
    .select(`
      id,
      group_id,
      person_id,
      group_role_id,
      joined_at,
      person:person_id (
        id,
        first_name,
        last_name,
        email
      ),
      group_role:group_role_id (
        id,
        name,
        description
      )
    `)
    .eq('group_id', id)
    .order('joined_at', { ascending: true })

  if (membersError) {
    console.error('Error fetching group members:', membersError)
    throw new Error('Failed to fetch group members')
  }

  return {
    ...group,
    members: members || []
  }
}

export async function createGroup(data: CreateGroupData): Promise<Group> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'groups')

  const { data: group, error } = await supabase
    .from('groups')
    .insert([
      {
        parish_id: selectedParishId,
        name: data.name,
        description: data.description || null,
        is_active: data.is_active ?? true,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating group:', error)
    throw new Error('Failed to create group')
  }

  revalidatePath('/groups')
  return group
}

export async function updateGroup(id: string, data: UpdateGroupData): Promise<Group> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'groups')

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description || null
  if (data.is_active !== undefined) updateData.is_active = data.is_active

  const { data: group, error } = await supabase
    .from('groups')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating group:', error)
    throw new Error('Failed to update group')
  }

  revalidatePath('/groups')
  revalidatePath(`/groups/${id}`)
  return group
}

export async function deleteGroup(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'groups')

  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting group:', error)
    throw new Error('Failed to delete group')
  }

  revalidatePath('/groups')
}

export async function addGroupMember(groupId: string, personId: string, groupRoleId?: string): Promise<GroupMember> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'groups')

  // Verify group exists (RLS will handle access control)
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('id')
    .eq('id', groupId)
    .single()

  if (groupError || !group) {
    throw new Error('Group not found or access denied')
  }

  const { data: member, error } = await supabase
    .from('group_members')
    .insert([
      {
        group_id: groupId,
        person_id: personId,
        group_role_id: groupRoleId || null,
      }
    ])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('Person is already a member of this group')
    }
    console.error('Error adding group member:', error)
    throw new Error('Failed to add group member')
  }

  revalidatePath('/groups')
  revalidatePath(`/groups/${groupId}`)
  return member
}

export async function removeGroupMember(groupId: string, personId: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'groups')

  // Verify group exists (RLS will handle access control)
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('id')
    .eq('id', groupId)
    .single()

  if (groupError || !group) {
    throw new Error('Group not found or access denied')
  }

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('person_id', personId)

  if (error) {
    console.error('Error removing group member:', error)
    throw new Error('Failed to remove group member')
  }

  revalidatePath('/groups')
  revalidatePath(`/groups/${groupId}`)
}

export async function updateGroupMemberRole(groupId: string, personId: string, groupRoleId?: string | null): Promise<GroupMember> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'groups')

  // Verify group exists (RLS will handle access control)
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('id')
    .eq('id', groupId)
    .single()

  if (groupError || !group) {
    throw new Error('Group not found or access denied')
  }

  const { data: member, error } = await supabase
    .from('group_members')
    .update({ group_role_id: groupRoleId })
    .eq('group_id', groupId)
    .eq('person_id', personId)
    .select()
    .single()

  if (error) {
    console.error('Error updating group member role:', error)
    throw new Error('Failed to update group member role')
  }

  revalidatePath('/groups')
  revalidatePath(`/groups/${groupId}`)
  return member
}

export async function getActiveGroups(): Promise<Group[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching active groups:', error)
    throw new Error('Failed to fetch active groups')
  }

  return data || []
}