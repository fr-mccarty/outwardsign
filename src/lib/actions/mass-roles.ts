'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { MassRole, MassRoleInstance, Person } from '@/lib/types'
import type { PaginatedParams, PaginatedResult } from './people'
import { createMassRoleSchema, updateMassRoleSchema } from '@/lib/schemas/mass-roles'
import type { CreateMassRoleData, UpdateMassRoleData } from '@/lib/schemas/mass-roles'

// ========== MASS ROLE DEFINITIONS ==========

export async function getMassRoles(): Promise<MassRole[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_roles')
    .select('*')
    .eq('parish_id', selectedParishId)
    .order('display_order', { ascending: true, nullsFirst: false })
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

  const offset = params?.offset || 0
  const limit = params?.limit || 10
  const search = params?.search || ''

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
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching paginated mass roles:', error)
    throw new Error('Failed to fetch paginated mass roles')
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

export async function getMassRole(id: string): Promise<MassRole | null> {
  await requireSelectedParish()
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

// MassRole with relations interface
export interface MassRoleWithRelations extends MassRole {
  mass_role_members: Array<{
    id: string
    person_id: string
    membership_type: 'MEMBER' | 'LEADER'
    active: boolean
    notes: string | null
    person: {
      id: string
      first_name: string
      last_name: string
      full_name: string  // Database-generated field
      preferred_name: null  // People table doesn't have preferred_name yet
      email: string | null
      phone_number: string | null
    }
  }>
}

/**
 * Get mass role with members for view/edit pages
 */
export async function getMassRoleWithRelations(id: string): Promise<MassRoleWithRelations | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // First, get the mass role
  const { data: massRoleData, error: massRoleError } = await supabase
    .from('mass_roles')
    .select('*')
    .eq('id', id)
    .single()

  if (massRoleError) {
    if (massRoleError.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching mass role:', {
      error: massRoleError,
      code: massRoleError.code,
      message: massRoleError.message
    })
    throw new Error(`Failed to fetch mass role: ${massRoleError.message}`)
  }

  // Verify this is the correct parish
  if (massRoleData.parish_id !== selectedParishId) {
    return null // Not found in this parish
  }

  // Then get the members
  const { data: membersData, error: membersError } = await supabase
    .from('mass_role_members')
    .select('id, person_id, membership_type, active, notes')
    .eq('mass_role_id', id)

  if (membersError) {
    console.error('Error fetching mass role members:', membersError)
    // Don't throw, just return with empty members
    return {
      ...massRoleData,
      mass_role_members: []
    } as MassRoleWithRelations
  }

  // Get all person IDs
  const personIds = (membersData || []).map(m => m.person_id)

  // Fetch person details if there are any members
  let peopleMap: Record<string, any> = {}
  if (personIds.length > 0) {
    const { data: peopleData, error: peopleError } = await supabase
      .from('people')
      .select('id, first_name, last_name, email, phone_number')
      .eq('parish_id', selectedParishId)
      .in('id', personIds)

    if (peopleError) {
      console.error('Error fetching people for mass role members:', peopleError)
    } else if (peopleData) {
      // Add preferred_name: null to match the expected interface
      peopleMap = Object.fromEntries(peopleData.map(p => [p.id, { ...p, preferred_name: null }]))
    }
  }

  // Combine members with their person details
  const membersWithPeople = (membersData || []).map(member => ({
    ...member,
    person: peopleMap[member.person_id] || {
      id: member.person_id,
      first_name: '',
      last_name: '',
      preferred_name: null,
      email: null,
      phone_number: null
    }
  }))

  const data = {
    ...massRoleData,
    mass_role_members: membersWithPeople
  } as MassRoleWithRelations

  return data
}

export async function createMassRole(data: CreateMassRoleData): Promise<MassRole> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Validate data with Zod schema
  const validatedData = createMassRoleSchema.parse(data)

  const { data: role, error } = await supabase
    .from('mass_roles')
    .insert([
      {
        parish_id: selectedParishId,
        name: validatedData.name,
        description: validatedData.description || null,
        note: validatedData.note || null,
        is_active: validatedData.is_active ?? true,
        display_order: validatedData.display_order || null,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating mass role:', error)
    throw new Error('Failed to create mass role')
  }

  revalidatePath('/settings/mass-roles')
  return role
}

export async function updateMassRole(id: string, data: UpdateMassRoleData): Promise<MassRole> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Validate data with Zod schema
  const validatedData = updateMassRoleSchema.parse(data)

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(validatedData).filter(([_key, value]) => value !== undefined)
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

  revalidatePath('/settings/mass-roles')
  return role
}

export async function deleteMassRole(id: string): Promise<void> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check if role is in use in templates
  const { data: templateItems, error: checkError } = await supabase
    .from('mass_roles_template_items')
    .select('id')
    .eq('mass_role_id', id)
    .limit(1)

  if (checkError) {
    console.error('Error checking mass role usage:', checkError)
    throw new Error('Failed to check if mass role is in use')
  }

  if (templateItems && templateItems.length > 0) {
    throw new Error('Cannot delete mass role that is being used in templates')
  }

  // Check if role is in use in mass role instances (through template items)
  const { data: roleInstances, error: instanceCheckError } = await supabase
    .from('mass_assignment')
    .select('id, mass_roles_template_item:mass_roles_template_items!inner(mass_role_id)')
    .eq('mass_roles_template_item.mass_role_id', id)
    .limit(1)

  if (instanceCheckError) {
    console.error('Error checking mass role instance usage:', instanceCheckError)
    throw new Error('Failed to check if mass role is in use')
  }

  if (roleInstances && roleInstances.length > 0) {
    throw new Error('Cannot delete mass role that is assigned to people')
  }

  const { error } = await supabase
    .from('mass_roles')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting mass role:', error)
    throw new Error('Failed to delete mass role')
  }

  revalidatePath('/settings/mass-roles')
  revalidatePath('/mass-roles')
}

export async function reorderMassRoles(orderedIds: string[]): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Update each mass role's display_order
  const updates = orderedIds.map((id, index) =>
    supabase
      .from('mass_roles')
      .update({ display_order: index })
      .eq('id', id)
      .eq('parish_id', selectedParishId)
  )

  const results = await Promise.all(updates)

  // Check for errors
  const errors = results.filter((r) => r.error)
  if (errors.length > 0) {
    console.error('Error reordering mass roles:', errors)
    throw new Error('Failed to reorder mass roles')
  }

  revalidatePath('/mass-roles')
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
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error} = await supabase
    .from('mass_assignment')
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
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_assignment')
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
    .from('mass_assignment')
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(data).filter(([_key, value]) => value !== undefined)
  )

  const { data: massRoleInstance, error } = await supabase
    .from('mass_assignment')
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
    .from('mass_assignment')
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
    .from('mass_assignment')
    .select('mass_id')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('mass_assignment')
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

// ========== MASS ROLE WITH MEMBER COUNTS ==========

export interface MassRoleWithCount extends MassRole {
  member_count: number
}

/**
 * Get all active mass roles for the selected parish with member counts
 */
export async function getMassRolesWithCounts(): Promise<MassRoleWithCount[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get mass roles with member counts
  const { data, error } = await supabase
    .from('mass_roles')
    .select(`
      *,
      mass_role_members(count)
    `)
    .eq('parish_id', selectedParishId)
    .eq('is_active', true)
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching mass roles with counts:', error)
    throw new Error('Failed to fetch mass roles')
  }

  // Transform the data to include member_count
  return (data || []).map(role => ({
    ...role,
    member_count: role.mass_role_members?.[0]?.count || 0
  }))
}
