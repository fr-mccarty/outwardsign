'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'

// ========== GROUP ROLE DEFINITIONS ==========

export interface GroupRole {
  id: string
  parish_id: string
  name: string
  description?: string | null
  note?: string | null
  created_at: string
  updated_at: string
}

export interface CreateGroupRoleData {
  name: string
  description?: string
  note?: string
}

export interface UpdateGroupRoleData {
  name?: string
  description?: string | null
  note?: string | null
}

export async function getGroupRoles(): Promise<GroupRole[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('group_roles')
    .select('*')
    .eq('parish_id', selectedParishId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching group roles:', error)
    throw new Error('Failed to fetch group roles')
  }

  return data || []
}

export async function getGroupRole(id: string): Promise<GroupRole | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('group_roles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching group role:', error)
    throw new Error('Failed to fetch group role')
  }

  return data
}

export async function createGroupRole(data: CreateGroupRoleData): Promise<GroupRole> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: role, error } = await supabase
    .from('group_roles')
    .insert([
      {
        parish_id: selectedParishId,
        name: data.name,
        description: data.description || null,
        note: data.note || null,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating group role:', error)
    throw new Error('Failed to create group role')
  }

  revalidatePath('/groups')
  return role
}

export async function updateGroupRole(id: string, data: UpdateGroupRoleData): Promise<GroupRole> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )

  const { data: role, error } = await supabase
    .from('group_roles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating group role:', error)
    throw new Error('Failed to update group role')
  }

  revalidatePath('/groups')
  return role
}

export async function deleteGroupRole(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { error } = await supabase
    .from('group_roles')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting group role:', error)
    throw new Error('Failed to delete group role')
  }

  revalidatePath('/groups')
}
