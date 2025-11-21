'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { getUserParishRole, requireModuleAccess } from '@/lib/auth/permissions'
import type { PaginatedResult } from './people'

// MassTimesTemplate interface (matches mass_times_templates table)
export interface MassTimesTemplate {
  id: string
  parish_id: string
  name: string
  description: string | null
  day_of_week: string // SUNDAY, MONDAY, etc., or MOVABLE
  is_active: boolean
  created_at: string
  updated_at: string
}

// MassTimesTemplate with items
export interface MassTimesTemplateWithItems extends MassTimesTemplate {
  items?: Array<{
    id: string
    time: string
    day_type: string
  }>
}

// For backward compatibility
export type MassTime = MassTimesTemplate
export type MassTimeWithRelations = MassTimesTemplate

// Create data interface
export interface CreateMassTimeData {
  name: string
  description?: string
  day_of_week?: string
  is_active?: boolean
}

// Update data interface
export interface UpdateMassTimeData {
  name?: string
  description?: string | null
  day_of_week?: string
  is_active?: boolean
}

// Filter params interface
export interface MassTimeFilterParams {
  search?: string
  is_active?: boolean
}

// Paginated params interface
export interface MassTimePaginatedParams {
  page?: number
  limit?: number
  search?: string
  is_active?: boolean
}

/**
 * Get all mass times templates with optional filters
 */
export async function getMassTimes(filters?: MassTimeFilterParams): Promise<MassTime[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  let query = supabase
    .from('mass_times_templates')
    .select('*')
    .eq('parish_id', selectedParishId)
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters?.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active)
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching mass times templates:', error)
    throw new Error('Failed to fetch mass times templates')
  }

  return data || []
}

/**
 * Get all mass times templates with their items
 */
export async function getMassTimesWithItems(filters?: MassTimeFilterParams): Promise<MassTimesTemplateWithItems[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  let query = supabase
    .from('mass_times_templates')
    .select(`
      *,
      items:mass_times_template_items(id, time, day_type)
    `)
    .eq('parish_id', selectedParishId)
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters?.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active)
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching mass times templates with items:', error)
    throw new Error('Failed to fetch mass times templates with items')
  }

  return data || []
}

/**
 * Get paginated mass times templates
 */
export async function getMassTimesPaginated(
  params?: MassTimePaginatedParams
): Promise<PaginatedResult<MassTimeWithRelations>> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const page = params?.page || 1
  const limit = params?.limit || 50
  const offset = (page - 1) * limit

  // Build query
  let query = supabase
    .from('mass_times_templates')
    .select('*', { count: 'exact' })
    .eq('parish_id', selectedParishId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Apply search filter if provided
  if (params?.search) {
    query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }

  // Apply is_active filter
  if (params?.is_active !== undefined) {
    query = query.eq('is_active', params.is_active)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching paginated mass times templates:', error)
    throw new Error('Failed to fetch mass times templates')
  }

  return {
    items: data || [],
    totalCount: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  }
}

/**
 * Get a single mass times template by ID with relations
 */
export async function getMassTimeWithRelations(id: string): Promise<MassTimeWithRelations | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_times_templates')
    .select('*')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .single()

  if (error) {
    console.error('Error fetching mass times template:', error)
    return null
  }

  return data
}

/**
 * Get a single mass times template by ID
 */
export async function getMassTime(id: string): Promise<MassTime | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_times_templates')
    .select('*')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .single()

  if (error) {
    console.error('Error fetching mass times template:', error)
    return null
  }

  return data
}

/**
 * Create a new mass times template
 */
export async function createMassTime(data: CreateMassTimeData): Promise<MassTime> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'masses')

  const { data: massTimesTemplate, error } = await supabase
    .from('mass_times_templates')
    .insert([
      {
        parish_id: selectedParishId,
        name: data.name,
        description: data.description || null,
        day_of_week: data.day_of_week || 'SUNDAY',
        is_active: data.is_active !== undefined ? data.is_active : false,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating mass times template:', error)
    throw new Error(`Failed to create mass times template: ${error.message}`)
  }

  revalidatePath('/mass-times-templates')
  return massTimesTemplate
}

/**
 * Update a mass times template
 */
export async function updateMassTime(id: string, data: UpdateMassTimeData): Promise<MassTime> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'masses')

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.day_of_week !== undefined) updateData.day_of_week = data.day_of_week
  if (data.is_active !== undefined) updateData.is_active = data.is_active

  const { data: massTimesTemplate, error } = await supabase
    .from('mass_times_templates')
    .update(updateData)
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .select()
    .single()

  if (error) {
    console.error('Error updating mass times template:', error)
    throw new Error('Failed to update mass times template')
  }

  revalidatePath('/mass-times-templates')
  revalidatePath(`/mass-times-templates/${id}`)
  revalidatePath(`/mass-times-templates/${id}/edit`)
  return massTimesTemplate
}

/**
 * Delete a mass times template
 */
export async function deleteMassTime(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'masses')

  const { error } = await supabase
    .from('mass_times_templates')
    .delete()
    .eq('id', id)
    .eq('parish_id', selectedParishId)

  if (error) {
    console.error('Error deleting mass times template:', error)
    throw new Error('Failed to delete mass times template')
  }

  revalidatePath('/mass-times-templates')
}
