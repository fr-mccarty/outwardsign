'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { getUserParishRole, requireModuleAccess } from '@/lib/auth/permissions'

// MassType interface
export interface MassType {
  id: string
  parish_id: string
  key: string
  label_en: string
  label_es: string
  description: string | null
  color: string | null
  display_order: number
  active: boolean
  is_system: boolean
  created_at: string
  updated_at: string
}

// Create data interface
export interface CreateMassTypeData {
  key: string
  label_en: string
  label_es: string
  description?: string
  color?: string
  display_order?: number
  active?: boolean
}

// Update data interface
export interface UpdateMassTypeData {
  key?: string
  label_en?: string
  label_es?: string
  description?: string | null
  color?: string | null
  display_order?: number
  active?: boolean
}

/**
 * Get all mass types for the selected parish
 */
export async function getMassTypes(): Promise<MassType[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_types')
    .select('*')
    .eq('parish_id', selectedParishId)
    .eq('active', true)
    .order('display_order', { ascending: true })
    .order('label_en', { ascending: true })

  if (error) {
    console.error('Error fetching mass types:', error)
    throw new Error('Failed to fetch mass types')
  }

  return data || []
}

/**
 * Get all mass types including inactive ones (for admin)
 */
export async function getAllMassTypes(): Promise<MassType[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_types')
    .select('*')
    .eq('parish_id', selectedParishId)
    .order('display_order', { ascending: true })
    .order('label_en', { ascending: true })

  if (error) {
    console.error('Error fetching all mass types:', error)
    throw new Error('Failed to fetch mass types')
  }

  return data || []
}

/**
 * Get a single mass type by ID
 */
export async function getMassType(id: string): Promise<MassType | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_types')
    .select('*')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .single()

  if (error) {
    console.error('Error fetching mass type:', error)
    return null
  }

  return data
}

/**
 * Create a new mass type
 */
export async function createMassType(data: CreateMassTypeData): Promise<MassType> {
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

  const { data: massType, error } = await supabase
    .from('mass_types')
    .insert([
      {
        parish_id: selectedParishId,
        key: data.key.toUpperCase().replace(/\s+/g, '_'),
        label_en: data.label_en,
        label_es: data.label_es,
        description: data.description || null,
        color: data.color || null,
        display_order: data.display_order ?? 0,
        active: data.active !== undefined ? data.active : true,
        is_system: false,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating mass type:', error)
    throw new Error(`Failed to create mass type: ${error.message}`)
  }

  revalidatePath('/mass-types')
  revalidatePath('/mass-times')
  return massType
}

/**
 * Update a mass type
 */
export async function updateMassType(id: string, data: UpdateMassTypeData): Promise<MassType> {
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
  if (data.key !== undefined) updateData.key = data.key.toUpperCase().replace(/\s+/g, '_')
  if (data.label_en !== undefined) updateData.label_en = data.label_en
  if (data.label_es !== undefined) updateData.label_es = data.label_es
  if (data.description !== undefined) updateData.description = data.description
  if (data.color !== undefined) updateData.color = data.color
  if (data.display_order !== undefined) updateData.display_order = data.display_order
  if (data.active !== undefined) updateData.active = data.active

  const { data: massType, error } = await supabase
    .from('mass_types')
    .update(updateData)
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .select()
    .single()

  if (error) {
    console.error('Error updating mass type:', error)
    throw new Error('Failed to update mass type')
  }

  revalidatePath('/mass-types')
  revalidatePath('/mass-times')
  return massType
}

/**
 * Delete a mass type (only if not system and not in use)
 */
export async function deleteMassType(id: string): Promise<void> {
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

  // Check if mass type is system type
  const { data: massType } = await supabase
    .from('mass_types')
    .select('is_system')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .single()

  if (massType?.is_system) {
    throw new Error('Cannot delete system mass types')
  }

  // Check if mass type is in use
  const { count } = await supabase
    .from('mass_times')
    .select('id', { count: 'exact', head: true })
    .eq('mass_type_id', id)

  if (count && count > 0) {
    throw new Error(
      `Cannot delete mass type. It is currently used by ${count} mass time${count === 1 ? '' : 's'}.`
    )
  }

  const { error } = await supabase
    .from('mass_types')
    .delete()
    .eq('id', id)
    .eq('parish_id', selectedParishId)

  if (error) {
    console.error('Error deleting mass type:', error)
    throw new Error('Failed to delete mass type')
  }

  revalidatePath('/mass-types')
  revalidatePath('/mass-times')
}
