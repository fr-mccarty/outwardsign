'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { MassRole, MassRoleInstance, Person } from '@/lib/types'
import type { PaginatedParams, PaginatedResult } from './people'

// ========== MASS ROLE DEFINITIONS ==========

export interface CreateMassRoleData {
  name: string
  description?: string
  note?: string
}

export interface UpdateMassRoleData {
  name?: string
  description?: string | null
  note?: string | null
}

export async function getMassRoles(): Promise<MassRole[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_roles')
    .select('*')
    .eq('parish_id', selectedParishId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching mass roles:', error)
    throw new Error('Failed to fetch mass roles')
  }

  return data || []
}

export async function getMassRolesPaginated(params?: PaginatedParams): Promise<PaginatedResult<MassRole>> {
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
    .from('mass_roles')
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
    console.error('Error fetching paginated mass roles:', error)
    throw new Error('Failed to fetch paginated mass roles')
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
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: role, error } = await supabase
    .from('mass_roles')
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
    console.error('Error creating mass role:', error)
    throw new Error('Failed to create mass role')
  }

  revalidatePath('/roles')
  return role
}

export async function updateMassRole(id: string, data: UpdateMassRoleData): Promise<MassRole> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )

  const { data: role, error } = await supabase
    .from('mass_roles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating mass role:', error)
    throw new Error('Failed to update mass role')
  }

  revalidatePath('/roles')
  revalidatePath(`/roles/${id}`)
  revalidatePath(`/roles/${id}/edit`)
  return role
}

export async function deleteMassRole(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { error } = await supabase
    .from('mass_roles')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting mass role:', error)
    throw new Error('Failed to delete mass role')
  }

  revalidatePath('/roles')
}

// ========== MASS ROLE INSTANCES ==========

export interface CreateMassRoleInstanceData {
  mass_id: string
  person_id: string
  mass_roles_template_item_id: string
}

export interface UpdateMassRoleInstanceData {
  person_id?: string
  mass_roles_template_item_id?: string
}

export interface MassRoleInstanceWithRelations extends MassRoleInstance {
  person?: Person | null
  mass_roles_template_item?: {
    id: string
    mass_role: MassRole
  } | null
}

export async function getMassRoleInstances(massId: string): Promise<MassRoleInstanceWithRelations[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error} = await supabase
    .from('mass_role_instances')
    .select(`
      *,
      person:people(*),
      mass_roles_template_item:mass_roles_template_items(
        *,
        mass_role:mass_roles(*)
      )
    `)
    .eq('mass_id', massId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching mass roles:', error)
    throw new Error('Failed to fetch mass roles')
  }

  return data || []
}

export async function getMassRoleInstance(id: string): Promise<MassRoleInstance | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_role_instances')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching mass role instance:', error)
    throw new Error('Failed to fetch mass role instance')
  }

  return data
}

export async function createMassRoleInstance(data: CreateMassRoleInstanceData): Promise<MassRoleInstance> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: massRoleInstance, error } = await supabase
    .from('mass_role_instances')
    .insert([
      {
        mass_id: data.mass_id,
        person_id: data.person_id,
        mass_roles_template_item_id: data.mass_roles_template_item_id,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating mass role instance:', error)
    throw new Error('Failed to create mass role instance')
  }

  revalidatePath(`/masses/${data.mass_id}`)
  revalidatePath(`/masses/${data.mass_id}/edit`)
  return massRoleInstance
}

export async function updateMassRoleInstance(id: string, data: UpdateMassRoleInstanceData): Promise<MassRoleInstance> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )

  const { data: massRoleInstance, error } = await supabase
    .from('mass_role_instances')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating mass role instance:', error)
    throw new Error('Failed to update mass role instance')
  }

  // Get mass_id to revalidate correct paths
  const { data: massRoleInstanceData } = await supabase
    .from('mass_role_instances')
    .select('mass_id')
    .eq('id', id)
    .single()

  if (massRoleInstanceData) {
    revalidatePath(`/masses/${massRoleInstanceData.mass_id}`)
    revalidatePath(`/masses/${massRoleInstanceData.mass_id}/edit`)
  }

  return massRoleInstance
}

export async function deleteMassRoleInstance(id: string): Promise<void> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get mass_id before deletion for revalidation
  const { data: massRoleInstanceData } = await supabase
    .from('mass_role_instances')
    .select('mass_id')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('mass_role_instances')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting mass role instance:', error)
    throw new Error('Failed to delete mass role instance')
  }

  if (massRoleInstanceData) {
    revalidatePath(`/masses/${massRoleInstanceData.mass_id}`)
    revalidatePath(`/masses/${massRoleInstanceData.mass_id}/edit`)
  }
}
