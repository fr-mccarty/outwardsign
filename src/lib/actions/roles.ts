'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { Role, MassRole, Person } from '@/lib/types'
import type { PaginatedParams, PaginatedResult } from './people'

// ========== ROLES ==========

export interface CreateRoleData {
  name: string
  description?: string
  note?: string
}

export interface UpdateRoleData {
  name?: string
  description?: string | null
  note?: string | null
}

export async function getRoles(): Promise<Role[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('parish_id', selectedParishId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching roles:', error)
    throw new Error('Failed to fetch roles')
  }

  return data || []
}

export async function getRolesPaginated(params?: PaginatedParams): Promise<PaginatedResult<Role>> {
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
    .from('roles')
    .select('*', { count: 'exact' })
    .eq('parish_id', selectedParishId)

  // Apply search filter
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Apply ordering, pagination
  query = query
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching paginated roles:', error)
    throw new Error('Failed to fetch paginated roles')
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

export async function getRole(id: string): Promise<Role | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching role:', error)
    throw new Error('Failed to fetch role')
  }

  return data
}

export async function createRole(data: CreateRoleData): Promise<Role> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: role, error } = await supabase
    .from('roles')
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
    console.error('Error creating role:', error)
    throw new Error('Failed to create role')
  }

  revalidatePath('/roles')
  return role
}

export async function updateRole(id: string, data: UpdateRoleData): Promise<Role> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )

  const { data: role, error } = await supabase
    .from('roles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating role:', error)
    throw new Error('Failed to update role')
  }

  revalidatePath('/roles')
  revalidatePath(`/roles/${id}`)
  revalidatePath(`/roles/${id}/edit`)
  return role
}

export async function deleteRole(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting role:', error)
    throw new Error('Failed to delete role')
  }

  revalidatePath('/roles')
}

// ========== MASS ROLES ==========

export interface CreateMassRoleData {
  mass_id: string
  person_id: string
  role_id: string
  parameters?: Record<string, any>
}

export interface UpdateMassRoleData {
  person_id?: string
  role_id?: string
  parameters?: Record<string, any> | null
}

export interface MassRoleWithRelations extends MassRole {
  person?: Person | null
  role?: Role | null
}

export async function getMassRoles(massId: string): Promise<MassRoleWithRelations[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_roles')
    .select(`
      *,
      person:people(*),
      role:roles(*)
    `)
    .eq('mass_id', massId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching mass roles:', error)
    throw new Error('Failed to fetch mass roles')
  }

  return data || []
}

export async function getMassRole(id: string): Promise<MassRole | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_roles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching mass role:', error)
    throw new Error('Failed to fetch mass role')
  }

  return data
}

export async function createMassRole(data: CreateMassRoleData): Promise<MassRole> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: massRole, error } = await supabase
    .from('mass_roles')
    .insert([
      {
        mass_id: data.mass_id,
        person_id: data.person_id,
        role_id: data.role_id,
        parameters: data.parameters || null,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating mass role:', error)
    throw new Error('Failed to create mass role')
  }

  revalidatePath(`/masses/${data.mass_id}`)
  revalidatePath(`/masses/${data.mass_id}/edit`)
  return massRole
}

export async function updateMassRole(id: string, data: UpdateMassRoleData): Promise<MassRole> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )

  const { data: massRole, error } = await supabase
    .from('mass_roles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating mass role:', error)
    throw new Error('Failed to update mass role')
  }

  // Get mass_id to revalidate correct paths
  const { data: massRoleData } = await supabase
    .from('mass_roles')
    .select('mass_id')
    .eq('id', id)
    .single()

  if (massRoleData) {
    revalidatePath(`/masses/${massRoleData.mass_id}`)
    revalidatePath(`/masses/${massRoleData.mass_id}/edit`)
  }

  return massRole
}

export async function deleteMassRole(id: string): Promise<void> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get mass_id before deletion for revalidation
  const { data: massRoleData } = await supabase
    .from('mass_roles')
    .select('mass_id')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('mass_roles')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting mass role:', error)
    throw new Error('Failed to delete mass role')
  }

  if (massRoleData) {
    revalidatePath(`/masses/${massRoleData.mass_id}`)
    revalidatePath(`/masses/${massRoleData.mass_id}/edit`)
  }
}
