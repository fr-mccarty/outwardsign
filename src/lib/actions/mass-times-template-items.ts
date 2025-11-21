'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { getUserParishRole, requireModuleAccess } from '@/lib/auth/permissions'

// Day type enum
export type DayType = 'IS_DAY' | 'DAY_BEFORE'

// Template item interface
export interface MassTimesTemplateItem {
  id: string
  mass_times_template_id: string
  time: string
  day_type: DayType
  created_at: string
  updated_at: string
}

// Create data interface
export interface CreateTemplateItemData {
  mass_times_template_id: string
  time: string
  day_type: DayType
}

// Update data interface
export interface UpdateTemplateItemData {
  time?: string
  day_type?: DayType
}

/**
 * Get all template items for a template
 */
export async function getTemplateItems(templateId: string): Promise<MassTimesTemplateItem[]> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_times_template_items')
    .select('*')
    .eq('mass_times_template_id', templateId)
    .order('day_type', { ascending: true }) // DAY_BEFORE first, then IS_DAY
    .order('time', { ascending: true }) // Earliest times first within each group

  if (error) {
    console.error('Error fetching template items:', error)
    throw new Error('Failed to fetch template items')
  }

  return data || []
}

/**
 * Create a new template item
 */
export async function createTemplateItem(data: CreateTemplateItemData): Promise<MassTimesTemplateItem> {
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

  const { data: item, error } = await supabase
    .from('mass_times_template_items')
    .insert([{
      mass_times_template_id: data.mass_times_template_id,
      time: data.time,
      day_type: data.day_type,
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating template item:', error)
    throw new Error(`Failed to create template item: ${error.message}`)
  }

  revalidatePath(`/mass-times-templates/${data.mass_times_template_id}`)
  return item
}

/**
 * Update a template item
 */
export async function updateTemplateItem(
  id: string,
  templateId: string,
  data: UpdateTemplateItemData
): Promise<MassTimesTemplateItem> {
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
  if (data.time !== undefined) updateData.time = data.time
  if (data.day_type !== undefined) updateData.day_type = data.day_type

  const { data: item, error } = await supabase
    .from('mass_times_template_items')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating template item:', error)
    throw new Error('Failed to update template item')
  }

  revalidatePath(`/mass-times-templates/${templateId}`)
  return item
}

/**
 * Delete a template item
 */
export async function deleteTemplateItem(id: string, templateId: string): Promise<void> {
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
    .from('mass_times_template_items')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting template item:', error)
    throw new Error('Failed to delete template item')
  }

  revalidatePath(`/mass-times-templates/${templateId}`)
}
