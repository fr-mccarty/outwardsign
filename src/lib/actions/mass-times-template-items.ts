'use server'

import { createClient } from '@/lib/supabase/server'
import { logError } from '@/lib/utils/console'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'

// Day type enum
export type DayType = 'IS_DAY' | 'DAY_BEFORE'

// Template item interface
export interface MassTimesTemplateItem {
  id: string
  mass_times_template_id: string
  time: string
  day_type: DayType
  presider_id?: string
  location_id?: string
  length_of_time?: number // Duration in minutes
  homilist_id?: string
  role_quantities: Record<string, number> // Maps role property_names to quantity needed
  created_at: string
  updated_at: string
}

// Create data interface
export interface CreateTemplateItemData {
  mass_times_template_id: string
  time: string
  day_type: DayType
  presider_id?: string
  location_id?: string
  length_of_time?: number
  homilist_id?: string
  role_quantities?: Record<string, number>
}

// Update data interface
export interface UpdateTemplateItemData {
  time?: string
  day_type?: DayType
  presider_id?: string
  location_id?: string
  length_of_time?: number
  homilist_id?: string
  role_quantities?: Record<string, number>
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
    logError('Error fetching template items: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch template items')
  }

  return data || []
}

/**
 * Create a new template item
 */
export async function createTemplateItem(data: CreateTemplateItemData): Promise<MassTimesTemplateItem> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: item, error } = await supabase
    .from('mass_times_template_items')
    .insert([{
      mass_times_template_id: data.mass_times_template_id,
      time: data.time,
      day_type: data.day_type,
      presider_id: data.presider_id,
      location_id: data.location_id,
      length_of_time: data.length_of_time,
      homilist_id: data.homilist_id,
      role_quantities: data.role_quantities || {}
    }])
    .select()
    .single()

  if (error) {
    logError('Error creating template item: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
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
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {}
  if (data.time !== undefined) updateData.time = data.time
  if (data.day_type !== undefined) updateData.day_type = data.day_type
  if (data.presider_id !== undefined) updateData.presider_id = data.presider_id
  if (data.location_id !== undefined) updateData.location_id = data.location_id
  if (data.length_of_time !== undefined) updateData.length_of_time = data.length_of_time
  if (data.homilist_id !== undefined) updateData.homilist_id = data.homilist_id
  if (data.role_quantities !== undefined) updateData.role_quantities = data.role_quantities

  const { data: item, error } = await supabase
    .from('mass_times_template_items')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    logError('Error updating template item: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to update template item')
  }

  revalidatePath(`/mass-times-templates/${templateId}`)
  return item
}

/**
 * Delete a template item
 */
export async function deleteTemplateItem(id: string, templateId: string): Promise<void> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { error } = await supabase
    .from('mass_times_template_items')
    .delete()
    .eq('id', id)

  if (error) {
    logError('Error deleting template item: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to delete template item')
  }

  revalidatePath(`/mass-times-templates/${templateId}`)
}
