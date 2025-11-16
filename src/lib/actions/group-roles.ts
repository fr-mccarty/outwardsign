'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import type { PaginatedParams, PaginatedResult } from './people'

// ========== GROUP ROLE DEFINITIONS ==========

export interface GroupRole {
  id: string
  parish_id: string
  name: string
  description?: string | null
  note?: string | null
  is_active: boolean
  display_order?: number | null
  created_at: string
  updated_at: string
}

export interface CreateGroupRoleData {
  name: string
  description?: string
  note?: string
  is_active?: boolean
  display_order?: number
}

export interface UpdateGroupRoleData {
  name?: string
  description?: string | null
  note?: string | null
  is_active?: boolean
  display_order?: number | null
}

export async function getGroupRoles(): Promise<GroupRole[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('group_roles')
    .select('*')
    .eq('parish_id', selectedParishId)
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching group roles:', error)
    throw new Error('Failed to fetch group roles')
  }

  return data || []
}

export async function getGroupRolesPaginated(params?: PaginatedParams): Promise<PaginatedResult<GroupRole>> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const page = params?.page || 1
  const limit = params?.limit || 10
  const search = params?.search || ''

  // Calculate offset
  const offset = (page - 1) * limit

  // Build base query
  let query = supabase
    .from('group_roles')
    .select('*', { count: 'exact' })
    .eq('parish_id', selectedParishId)

  // Apply search filter
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Apply ordering, pagination
  query = query
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching paginated group roles:', error)
    throw new Error('Failed to fetch paginated group roles')
  }

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / limit)

  return {
    items: data || [],
    totalCount,
    page,
    limit,
    totalPages,
  }
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
        is_active: data.is_active !== undefined ? data.is_active : true,
        display_order: data.display_order || null,
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
