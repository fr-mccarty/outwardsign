'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { logError } from '@/lib/utils/console'
import type {
  CustomList,
  CustomListWithItems,
  CreateCustomListData,
  UpdateCustomListData,
  CustomListItem
} from '@/lib/types'
import { generateSlug } from '@/lib/utils/formatters'

export interface CustomListFilterParams {
  search?: string
  sort?: 'name_asc' | 'name_desc' | 'created_asc' | 'created_desc'
}

/**
 * Check if user can edit shared resources (admin, staff, ministry-leader)
 * For custom lists, these roles need access for inline creation during field definition
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
 * Get all custom lists for the selected parish
 */
export async function getCustomLists(filters?: CustomListFilterParams): Promise<CustomList[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  let query = supabase
    .from('custom_lists')
    .select('*')
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)

  // Apply sorting
  if (filters?.sort === 'name_asc' || !filters?.sort) {
    // Default to name ascending
    query = query.order('name', { ascending: true })
  } else if (filters?.sort === 'name_desc') {
    query = query.order('name', { ascending: false })
  } else if (filters?.sort === 'created_asc') {
    query = query.order('created_at', { ascending: true })
  } else if (filters?.sort === 'created_desc') {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    logError('Error fetching custom lists: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch custom lists')
  }

  let customLists = data || []

  // Apply search filter (if provided)
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
    customLists = customLists.filter(list =>
      list.name.toLowerCase().includes(searchTerm)
    )
  }

  return customLists
}

/**
 * Get a single custom list by ID
 */
export async function getCustomList(id: string): Promise<CustomList | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('custom_lists')
    .select('*')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    logError('Error fetching custom list: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch custom list')
  }

  return data
}

/**
 * Get a single custom list by slug
 */
export async function getCustomListBySlug(slug: string): Promise<CustomList | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('custom_lists')
    .select('*')
    .eq('slug', slug)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    logError('Error fetching custom list by slug: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch custom list')
  }

  return data
}

/**
 * Get custom list with all items by slug
 */
export async function getCustomListWithItemsBySlug(slug: string): Promise<CustomListWithItems | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the custom list by slug
  const { data: customList, error } = await supabase
    .from('custom_lists')
    .select('*')
    .eq('slug', slug)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    logError('Error fetching custom list by slug: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch custom list')
  }

  // Fetch items for this list
  const { data: items, error: itemsError } = await supabase
    .from('custom_list_items')
    .select('*')
    .eq('list_id', customList.id)
    .is('deleted_at', null)
    .order('order', { ascending: true })

  if (itemsError) {
    logError('Error fetching custom list items: ' + (itemsError instanceof Error ? itemsError.message : JSON.stringify(itemsError)))
    throw new Error('Failed to fetch custom list items')
  }

  return {
    ...customList,
    items: items as CustomListItem[] || []
  }
}

/**
 * Get custom list with all items
 */
export async function getCustomListWithItems(id: string): Promise<CustomListWithItems | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the custom list
  const { data: customList, error } = await supabase
    .from('custom_lists')
    .select('*')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    logError('Error fetching custom list: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch custom list')
  }

  // Fetch items for this list
  const { data: items, error: itemsError } = await supabase
    .from('custom_list_items')
    .select('*')
    .eq('list_id', id)
    .is('deleted_at', null)
    .order('order', { ascending: true })

  if (itemsError) {
    logError('Error fetching custom list items: ' + (itemsError instanceof Error ? itemsError.message : JSON.stringify(itemsError)))
    throw new Error('Failed to fetch custom list items')
  }

  return {
    ...customList,
    items: items as CustomListItem[] || []
  }
}

/**
 * Create a new custom list
 */
export async function createCustomList(data: CreateCustomListData): Promise<CustomList> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions (admin, staff, ministry-leader)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  // Generate slug from name
  const baseSlug = generateSlug(data.name)

  // Check slug uniqueness and append number if needed
  let slugCounter = 1
  let isUnique = false
  let finalSlug = baseSlug

  while (!isUnique) {
    const { data: existingWithSlug } = await supabase
      .from('custom_lists')
      .select('id')
      .eq('parish_id', selectedParishId)
      .eq('slug', finalSlug)
      .is('deleted_at', null)
      .limit(1)

    if (!existingWithSlug || existingWithSlug.length === 0) {
      isUnique = true
    } else {
      finalSlug = `${baseSlug}-${slugCounter}`
      slugCounter++
    }
  }

  // Insert custom list
  const { data: customList, error } = await supabase
    .from('custom_lists')
    .insert([
      {
        parish_id: selectedParishId,
        name: data.name,
        slug: finalSlug
      }
    ])
    .select()
    .single()

  if (error) {
    logError('Error creating custom list: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to create custom list')
  }

  revalidatePath('/settings/custom-lists')
  return customList
}

/**
 * Update an existing custom list
 */
export async function updateCustomList(id: string, data: UpdateCustomListData): Promise<CustomList> {
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
  const updateData: Record<string, unknown> = {}

  if (data.name !== undefined) {
    updateData.name = data.name

    // Regenerate slug when name changes
    const baseSlug = generateSlug(data.name)
    let slugCounter = 1
    let isUnique = false
    let finalSlug = baseSlug

    while (!isUnique) {
      const { data: existingWithSlug } = await supabase
        .from('custom_lists')
        .select('id')
        .eq('parish_id', selectedParishId)
        .eq('slug', finalSlug)
        .neq('id', id) // Exclude current record
        .is('deleted_at', null)
        .limit(1)

      if (!existingWithSlug || existingWithSlug.length === 0) {
        isUnique = true
      } else {
        finalSlug = `${baseSlug}-${slugCounter}`
        slugCounter++
      }
    }

    updateData.slug = finalSlug
  }

  const { data: customList, error } = await supabase
    .from('custom_lists')
    .update(updateData)
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .select()
    .single()

  if (error) {
    logError('Error updating custom list: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to update custom list')
  }

  revalidatePath('/settings/custom-lists')
  revalidatePath(`/settings/custom-lists/${customList.slug}`)
  return customList
}

/**
 * Delete a custom list
 * Checks if there are input field definitions using this list first
 */
export async function deleteCustomList(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions (admin, staff, ministry-leader)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  // Check for input field definitions using this list
  const { data: fieldDefs } = await supabase
    .from('input_field_definitions')
    .select('id')
    .eq('list_id', id)
    .is('deleted_at', null)
    .limit(1)

  if (fieldDefs && fieldDefs.length > 0) {
    throw new Error('Cannot delete custom list in use by field definitions. Remove the field definitions first.')
  }

  // Hard delete (will cascade to custom_list_items)
  const { error } = await supabase
    .from('custom_lists')
    .delete()
    .eq('id', id)
    .eq('parish_id', selectedParishId)

  if (error) {
    logError('Error deleting custom list: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to delete custom list')
  }

  revalidatePath('/settings/custom-lists')
}
