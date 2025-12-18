'use server'

import { createClient } from '@/lib/supabase/server'
import { logError } from '@/lib/utils/console'
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
    logError('Error fetching group roles: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch group roles')
  }

  return data || []
}

export async function getGroupRolesPaginated(params?: PaginatedParams): Promise<PaginatedResult<GroupRole>> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const offset = params?.offset || 0
  const limit = params?.limit || 10
  const search = params?.search || ''

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
    logError('Error fetching paginated group roles: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch paginated group roles')
  }

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / limit)
  const page = Math.floor(offset / limit) + 1

  return {
    items: data || [],
    totalCount,
    page,
    limit,
    totalPages,
  }
}

export async function getGroupRole(id: string): Promise<GroupRole | null> {
  await requireSelectedParish()
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
    logError('Error fetching group role: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
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
    logError('Error creating group role: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to create group role')
  }

  revalidatePath('/groups')
  return role
}

export async function updateGroupRole(id: string, data: UpdateGroupRoleData): Promise<GroupRole> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(data).filter(([_key, value]) => value !== undefined)
  )

  const { data: role, error } = await supabase
    .from('group_roles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    logError('Error updating group role: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to update group role')
  }

  revalidatePath('/groups')
  return role
}

export async function deleteGroupRole(id: string): Promise<void> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { error } = await supabase
    .from('group_roles')
    .delete()
    .eq('id', id)

  if (error) {
    logError('Error deleting group role: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to delete group role')
  }

  revalidatePath('/groups')
}
