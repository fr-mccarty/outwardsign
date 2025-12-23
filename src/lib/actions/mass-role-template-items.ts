'use server'

import { createClient } from '@/lib/supabase/server'
import { logError } from '@/lib/utils/console'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import {
  isUniqueConstraintError,
} from './server-action-utils'


// Types
export interface MassRoleTemplateItem {
  id: string
  mass_roles_template_id: string
  mass_role_id: string
  count: number
  position: number
  created_at: string
  updated_at: string
}

export interface MassRoleTemplateItemWithRole extends MassRoleTemplateItem {
  mass_role: {
    id: string
    name: string
    description: string | null
  }
}

export interface CreateTemplateItemData {
  mass_roles_template_id: string
  mass_role_id: string
  count?: number
}

export interface UpdateTemplateItemData {
  count?: number
}

// Get all items for a template, ordered by position, with role details
export async function getTemplateItems(templateId: string): Promise<MassRoleTemplateItemWithRole[]> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_roles_template_items')
    .select(`
      *,
      mass_role:mass_roles(id, name, description)
    `)
    .eq('mass_roles_template_id', templateId)
    .order('position', { ascending: true })

  if (error) {
    logError('Error fetching template items: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch template items')
  }

  return data || []
}

// Create a new template item (add role to template)
export async function createTemplateItem(data: CreateTemplateItemData): Promise<MassRoleTemplateItem> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the current max position for this template
  const { data: existingItems } = await supabase
    .from('mass_roles_template_items')
    .select('position')
    .eq('mass_roles_template_id', data.mass_roles_template_id)
    .order('position', { ascending: false })
    .limit(1)

  const nextPosition = existingItems && existingItems.length > 0
    ? existingItems[0].position + 1
    : 0

  const { data: item, error } = await supabase
    .from('mass_roles_template_items')
    .insert({
      mass_roles_template_id: data.mass_roles_template_id,
      mass_role_id: data.mass_role_id,
      count: data.count || 1,
      position: nextPosition
    })
    .select()
    .single()

  if (error) {
    logError('Error creating template item: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    if (isUniqueConstraintError(error)) { // Unique constraint violation
      throw new Error('This mass role is already in the template')
    }
    throw new Error('Failed to add mass role to template')
  }

  revalidatePath(`/mass-role-templates/${data.mass_roles_template_id}`)
  revalidatePath(`/mass-role-templates/${data.mass_roles_template_id}/edit`)
  return item
}

// Update a template item (change count)
export async function updateTemplateItem(id: string, data: UpdateTemplateItemData): Promise<MassRoleTemplateItem> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const updateData = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(data).filter(([_key, value]) => value !== undefined)
  )

  const { data: item, error } = await supabase
    .from('mass_roles_template_items')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    logError('Error updating template item: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to update template item')
  }

  // Get mass_roles_template_id for revalidation
  const { data: templateItem } = await supabase
    .from('mass_roles_template_items')
    .select('mass_roles_template_id')
    .eq('id', id)
    .single()

  if (templateItem) {
    revalidatePath(`/mass-role-templates/${templateItem.mass_roles_template_id}`)
    revalidatePath(`/mass-role-templates/${templateItem.mass_roles_template_id}/edit`)
  }

  return item
}

// Delete a template item and reorder remaining items
export async function deleteTemplateItem(id: string): Promise<void> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the item to find mass_roles_template_id and position
  const { data: itemToDelete } = await supabase
    .from('mass_roles_template_items')
    .select('mass_roles_template_id, position')
    .eq('id', id)
    .single()

  if (!itemToDelete) {
    throw new Error('Template item not found')
  }

  // Delete the item
  const { error: deleteError } = await supabase
    .from('mass_roles_template_items')
    .delete()
    .eq('id', id)

  if (deleteError) {
    logError('Error deleting template item: ' + (deleteError instanceof Error ? deleteError.message : JSON.stringify(deleteError)))
    throw new Error('Failed to delete template item')
  }

  // Reorder remaining items (close gaps in positions)
  const { data: remainingItems } = await supabase
    .from('mass_roles_template_items')
    .select('id, position')
    .eq('mass_roles_template_id', itemToDelete.mass_roles_template_id)
    .gt('position', itemToDelete.position)
    .order('position', { ascending: true })

  if (remainingItems && remainingItems.length > 0) {
    // Update positions for items that came after the deleted item
    for (const item of remainingItems) {
      await supabase
        .from('mass_roles_template_items')
        .update({ position: item.position - 1 })
        .eq('id', item.id)
    }
  }

  revalidatePath(`/mass-role-templates/${itemToDelete.mass_roles_template_id}`)
  revalidatePath(`/mass-role-templates/${itemToDelete.mass_roles_template_id}/edit`)
}

// Reorder template items based on drag-and-drop
export async function reorderTemplateItems(templateId: string, itemIds: string[]): Promise<void> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // First, set all positions to high values to avoid unique constraint conflicts
  for (let i = 0; i < itemIds.length; i++) {
    const { error } = await supabase
      .from('mass_roles_template_items')
      .update({ position: 10000 + i }) // Use high values to avoid conflicts
      .eq('id', itemIds[i])
      .eq('mass_roles_template_id', templateId)

    if (error) {
      logError('Error setting temp positions: ' + error.message)
      throw new Error(`Failed to reorder template items: ${error.message}`)
    }
  }

  // Now set final positions
  for (let i = 0; i < itemIds.length; i++) {
    const { error } = await supabase
      .from('mass_roles_template_items')
      .update({ position: i })
      .eq('id', itemIds[i])
      .eq('mass_roles_template_id', templateId)

    if (error) {
      logError('Error reordering template items: ' + error.message + ' Details: ' + JSON.stringify({ code: error.code, details: error.details }))
      throw new Error(`Failed to reorder template items: ${error.message}`)
    }
  }

  revalidatePath(`/mass-role-templates/${templateId}`)
  revalidatePath(`/mass-role-templates/${templateId}/edit`)
}
