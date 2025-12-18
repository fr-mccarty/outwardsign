'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { logError } from '@/lib/utils/console'
import type {
  CustomListItem,
  CreateCustomListItemData,
  UpdateCustomListItemData
} from '@/lib/types'

/**
 * Check if user can edit shared resources (admin, staff, ministry-leader)
 */
async function requireEditSharedResources(userId: string, parishId: string): Promise<void> {
  const supabase = await createClient()

  const { data: parishUser } = await supabase
    .from('parish_users')
    .select('roles')
    .eq('user_id', userId)
    .eq('parish_id', parishId)
    .single()

  if (!parishUser) {
    throw new Error('User not found in parish')
  }

  const roles = parishUser.roles || []
  const canEdit = roles.includes('admin') || roles.includes('staff') || roles.includes('ministry-leader')

  if (!canEdit) {
    throw new Error('Insufficient permissions to edit shared resources')
  }
}

/**
 * Get all items for a custom list
 */
export async function getCustomListItems(listId: string): Promise<CustomListItem[]> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('custom_list_items')
    .select('*')
    .eq('list_id', listId)
    .is('deleted_at', null)
    .order('order', { ascending: true })

  if (error) {
    logError('Error fetching custom list items: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch custom list items')
  }

  return data || []
}

/**
 * Create a new custom list item
 */
export async function createCustomListItem(listId: string, data: CreateCustomListItemData): Promise<CustomListItem> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions (admin, staff, ministry-leader)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  // Get max order for this list
  const { data: existingItems } = await supabase
    .from('custom_list_items')
    .select('order')
    .eq('list_id', listId)
    .is('deleted_at', null)
    .order('order', { ascending: false })
    .limit(1)

  const maxOrder = existingItems?.[0]?.order ?? -1
  const newOrder = maxOrder + 1

  // Insert custom list item
  const { data: listItem, error } = await supabase
    .from('custom_list_items')
    .insert([
      {
        list_id: listId,
        value: data.value,
        order: newOrder
      }
    ])
    .select()
    .single()

  if (error) {
    logError('Error creating custom list item: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to create custom list item')
  }

  revalidatePath('/settings/custom-lists')
  revalidatePath(`/settings/custom-lists/${listId}`)
  return listItem
}

/**
 * Update an existing custom list item
 */
export async function updateCustomListItem(id: string, data: UpdateCustomListItemData): Promise<CustomListItem> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions (admin, staff, ministry-leader)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  )

  const { data: listItem, error } = await supabase
    .from('custom_list_items')
    .update(updateData)
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single()

  if (error) {
    logError('Error updating custom list item: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to update custom list item')
  }

  revalidatePath('/settings/custom-lists')
  revalidatePath(`/settings/custom-lists/${listItem.list_id}`)
  return listItem
}

/**
 * Delete a custom list item
 * Note: Data in events' field_values JSON will be affected
 */
export async function deleteCustomListItem(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions (admin, staff, ministry-leader)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  // Get list_id for revalidation
  const { data: listItem } = await supabase
    .from('custom_list_items')
    .select('list_id')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!listItem) {
    throw new Error('Custom list item not found')
  }

  // Hard delete (events will show NULL or empty for this value)
  const { error } = await supabase
    .from('custom_list_items')
    .delete()
    .eq('id', id)

  if (error) {
    logError('Error deleting custom list item: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to delete custom list item')
  }

  revalidatePath('/settings/custom-lists')
  revalidatePath(`/settings/custom-lists/${listItem.list_id}`)
}

/**
 * Reorder custom list items
 * Updates the order field for all provided items
 */
export async function reorderCustomListItems(listId: string, orderedIds: string[]): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions (admin, staff, ministry-leader)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  // Update each item's order
  const updates = orderedIds.map((id, index) =>
    supabase
      .from('custom_list_items')
      .update({ order: index })
      .eq('id', id)
      .eq('list_id', listId)
  )

  await Promise.all(updates)

  revalidatePath('/settings/custom-lists')
  revalidatePath(`/settings/custom-lists/${listId}`)
}
