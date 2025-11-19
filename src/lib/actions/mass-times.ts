'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { getUserParishRole, requireModuleAccess } from '@/lib/auth/permissions'
import type { Location } from '@/lib/types'
import type { DayOfWeek, LiturgicalLanguage } from '@/lib/constants'
import type { PaginatedParams, PaginatedResult } from './people'
import type { MassType } from './mass-types'

// Schedule item interface
export interface ScheduleItem {
  day: DayOfWeek
  time: string // HH:MM format
}

// MassTime interface
export interface MassTime {
  id: string
  parish_id: string
  mass_type_id: string
  schedule_items: ScheduleItem[]
  location_id: string | null
  language: LiturgicalLanguage
  special_designation: string | null
  effective_start_date: string | null
  effective_end_date: string | null
  active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

// MassTime with relations
export interface MassTimeWithRelations extends MassTime {
  mass_type?: MassType | null
  location?: Location | null
}

// Create data interface
export interface CreateMassTimeData {
  mass_type_id: string
  schedule_items: ScheduleItem[]
  location_id?: string
  language: LiturgicalLanguage
  special_designation?: string
  effective_start_date?: string
  effective_end_date?: string
  active?: boolean
  notes?: string
}

// Update data interface
export interface UpdateMassTimeData {
  mass_type_id?: string
  schedule_items?: ScheduleItem[]
  location_id?: string | null
  language?: LiturgicalLanguage
  special_designation?: string | null
  effective_start_date?: string | null
  effective_end_date?: string | null
  active?: boolean
  notes?: string | null
}

// Filter params interface
export interface MassTimeFilterParams {
  search?: string
  mass_type_id?: string | 'all'
  language?: LiturgicalLanguage | 'all'
  active?: boolean
}

/**
 * Get all mass times with optional filters
 */
export async function getMassTimes(filters?: MassTimeFilterParams): Promise<MassTime[]> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  let query = supabase
    .from('mass_times')
    .select('*')
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters?.mass_type_id && filters.mass_type_id !== 'all') {
    query = query.eq('mass_type_id', filters.mass_type_id)
  }

  if (filters?.language && filters.language !== 'all') {
    query = query.eq('language', filters.language)
  }

  if (filters?.active !== undefined) {
    query = query.eq('active', filters.active)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching mass times:', error)
    throw new Error('Failed to fetch mass times')
  }

  return data || []
}

/**
 * Get paginated mass times with relations
 */
export async function getMassTimesPaginated(
  params?: PaginatedParams
): Promise<PaginatedResult<MassTimeWithRelations>> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const page = params?.page || 1
  const limit = params?.limit || 50
  const offset = (page - 1) * limit

  // Build query with relations
  let query = supabase
    .from('mass_times')
    .select('*, mass_type:mass_types(*), location:locations(*)', { count: 'exact' })
    .eq('parish_id', selectedParishId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Apply search filter if provided
  if (params?.search) {
    query = query.or(`special_designation.ilike.%${params.search}%,notes.ilike.%${params.search}%`)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching paginated mass times:', error)
    throw new Error('Failed to fetch mass times')
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
 * Get a single mass time by ID with relations
 */
export async function getMassTimeWithRelations(id: string): Promise<MassTimeWithRelations | null> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_times')
    .select('*, mass_type:mass_types(*), location:locations(*)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching mass time:', error)
    return null
  }

  return data
}

/**
 * Get a single mass time by ID
 */
export async function getMassTime(id: string): Promise<MassTime | null> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_times')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching mass time:', error)
    return null
  }

  return data
}

/**
 * Create a new mass time
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

  const { data: massTime, error } = await supabase
    .from('mass_times')
    .insert([
      {
        parish_id: selectedParishId,
        mass_type_id: data.mass_type_id,
        schedule_items: data.schedule_items,
        location_id: data.location_id || null,
        language: data.language,
        special_designation: data.special_designation || null,
        effective_start_date: data.effective_start_date || null,
        effective_end_date: data.effective_end_date || null,
        active: data.active !== undefined ? data.active : true,
        notes: data.notes || null,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating mass time:', error)
    throw new Error(`Failed to create mass time: ${error.message}`)
  }

  revalidatePath('/mass-times')
  return massTime
}

/**
 * Update a mass time
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
  if (data.mass_type_id !== undefined) updateData.mass_type_id = data.mass_type_id
  if (data.schedule_items !== undefined) updateData.schedule_items = data.schedule_items
  if (data.location_id !== undefined) updateData.location_id = data.location_id
  if (data.language !== undefined) updateData.language = data.language
  if (data.special_designation !== undefined) updateData.special_designation = data.special_designation
  if (data.effective_start_date !== undefined) updateData.effective_start_date = data.effective_start_date
  if (data.effective_end_date !== undefined) updateData.effective_end_date = data.effective_end_date
  if (data.active !== undefined) updateData.active = data.active
  if (data.notes !== undefined) updateData.notes = data.notes

  const { data: massTime, error } = await supabase
    .from('mass_times')
    .update(updateData)
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .select()
    .single()

  if (error) {
    console.error('Error updating mass time:', error)
    throw new Error('Failed to update mass time')
  }

  revalidatePath('/mass-times')
  revalidatePath(`/mass-times/${id}`)
  revalidatePath(`/mass-times/${id}/edit`)
  return massTime
}

/**
 * Delete a mass time
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
    .from('mass_times')
    .delete()
    .eq('id', id)
    .eq('parish_id', selectedParishId)

  if (error) {
    console.error('Error deleting mass time:', error)
    throw new Error('Failed to delete mass time')
  }

  revalidatePath('/mass-times')
}
