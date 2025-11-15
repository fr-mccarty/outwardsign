'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'

// Types
export interface MassRoleTemplateItem {
  id: string
  template_id: string
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
  template_id: string
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
    .eq('template_id', templateId)
    .order('position', { ascending: true })

  if (error) {
    console.error('Error fetching template items:', error)
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
    .eq('template_id', data.template_id)
    .order('position', { ascending: false })
    .limit(1)

  const nextPosition = existingItems && existingItems.length > 0
    ? existingItems[0].position + 1
    : 0

  const { data: item, error } = await supabase
    .from('mass_roles_template_items')
    .insert({
      template_id: data.template_id,
      mass_role_id: data.mass_role_id,
      count: data.count || 1,
      position: nextPosition
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating template item:', error)
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('This role is already in the template')
    }
    throw new Error('Failed to add role to template')
  }

  revalidatePath(`/mass-role-templates/${data.template_id}`)
  revalidatePath(`/mass-role-templates/${data.template_id}/edit`)
  return item
}

// Update a template item (change count)
export async function updateTemplateItem(id: string, data: UpdateTemplateItemData): Promise<MassRoleTemplateItem> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )

  const { data: item, error } = await supabase
    .from('mass_roles_template_items')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating template item:', error)
    throw new Error('Failed to update template item')
  }

  // Get template_id for revalidation
  const { data: templateItem } = await supabase
    .from('mass_roles_template_items')
    .select('template_id')
    .eq('id', id)
    .single()

  if (templateItem) {
    revalidatePath(`/mass-role-templates/${templateItem.template_id}`)
    revalidatePath(`/mass-role-templates/${templateItem.template_id}/edit`)
  }

  return item
}

// Delete a template item and reorder remaining items
export async function deleteTemplateItem(id: string): Promise<void> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the item to find template_id and position
  const { data: itemToDelete } = await supabase
    .from('mass_roles_template_items')
    .select('template_id, position')
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
    console.error('Error deleting template item:', deleteError)
    throw new Error('Failed to delete template item')
  }

  // Reorder remaining items (close gaps in positions)
  const { data: remainingItems } = await supabase
    .from('mass_roles_template_items')
    .select('id, position')
    .eq('template_id', itemToDelete.template_id)
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

  revalidatePath(`/mass-role-templates/${itemToDelete.template_id}`)
  revalidatePath(`/mass-role-templates/${itemToDelete.template_id}/edit`)
}

// Reorder template items based on drag-and-drop
export async function reorderTemplateItems(templateId: string, itemIds: string[]): Promise<void> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Update position for each item based on its index in the array
  for (let i = 0; i < itemIds.length; i++) {
    const { error } = await supabase
      .from('mass_roles_template_items')
      .update({ position: i })
      .eq('id', itemIds[i])
      .eq('template_id', templateId) // Extra safety check

    if (error) {
      console.error('Error reordering template items:', error)
      throw new Error('Failed to reorder template items')
    }
  }

  revalidatePath(`/mass-role-templates/${templateId}`)
  revalidatePath(`/mass-role-templates/${templateId}/edit`)
}
