'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import type {
  CategoryTag,
  CategoryTagWithUsageCount,
  CreateCategoryTagData,
  UpdateCategoryTagData
} from '@/lib/types'

/**
 * Generate a URL-safe slug from a string
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces and hyphens
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-')       // Replace multiple hyphens with single hyphen
}

/**
 * Helper to check if user has admin role
 */
async function requireAdminRole(supabase: Awaited<ReturnType<typeof createClient>>, parishId: string): Promise<string> {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Authentication required')
  }

  const { data: userParish, error: userParishError } = await supabase
    .from('parish_users')
    .select('roles')
    .eq('user_id', user.id)
    .eq('parish_id', parishId)
    .single()

  if (userParishError || !userParish || !userParish.roles.includes('admin')) {
    throw new Error('Permission denied: Admin role required')
  }

  return user.id
}

/**
 * Get all category tags for the parish
 */
export async function getCategoryTags(
  sortBy: 'sort_order' | 'name' = 'sort_order'
): Promise<CategoryTag[]> {
  const parishId = await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  let query = supabase
    .from('category_tags')
    .select('*')
    .eq('parish_id', parishId)

  // Apply sorting
  if (sortBy === 'sort_order') {
    query = query.order('sort_order', { ascending: true })
  } else {
    query = query.order('name', { ascending: true })
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching category tags:', error)
    throw new Error('Failed to fetch category tags')
  }

  return data || []
}

/**
 * Get category tags with usage count
 */
export async function getCategoryTagsWithUsageCount(): Promise<CategoryTagWithUsageCount[]> {
  const parishId = await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Fetch tags with COUNT of assignments across all entity types
  const { data, error } = await supabase
    .from('category_tags')
    .select(`
      *,
      assignments:tag_assignments(count)
    `)
    .eq('parish_id', parishId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching category tags with usage count:', error)
    throw new Error('Failed to fetch category tags with usage count')
  }

  // Transform data to include usage_count
  return (data || []).map((tag: any) => ({
    ...tag,
    usage_count: tag.assignments?.[0]?.count || 0,
    assignments: undefined // Remove assignments property
  }))
}

/**
 * Get a single category tag by ID
 */
export async function getCategoryTagById(tagId: string): Promise<CategoryTag | null> {
  const parishId = await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('category_tags')
    .select('*')
    .eq('id', tagId)
    .eq('parish_id', parishId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching category tag:', error)
    throw new Error('Failed to fetch category tag')
  }

  return data
}

/**
 * Create a new category tag
 * Requires Admin role
 */
export async function createCategoryTag(input: CreateCategoryTagData): Promise<CategoryTag> {
  const parishId = await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Check user has admin role
  const userId = await requireAdminRole(supabase, parishId)

  // Validate required fields
  if (!input.name) {
    throw new Error('Missing required field: name')
  }

  // Generate slug if not provided
  const slug = input.slug || generateSlug(input.name)

  // Calculate sort_order if not provided (MAX + 1)
  let sortOrder = input.sort_order
  if (sortOrder === undefined) {
    const { data: maxTag } = await supabase
      .from('category_tags')
      .select('sort_order')
      .eq('parish_id', parishId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()

    sortOrder = (maxTag?.sort_order || 0) + 1
  }

  // Insert tag
  const { data, error } = await supabase
    .from('category_tags')
    .insert({
      parish_id: parishId,
      name: input.name,
      slug,
      sort_order: sortOrder,
      color: input.color || null,
      created_by: userId
    })
    .select()
    .single()

  if (error) {
    // Check for unique constraint violation
    if (error.code === '23505') {
      throw new Error('A tag with this slug already exists')
    }
    console.error('Error creating category tag:', error)
    throw new Error('Failed to create category tag')
  }

  revalidatePath('/settings/category-tags')

  return data
}

/**
 * Update an existing category tag
 * Requires Admin role
 */
export async function updateCategoryTag(
  tagId: string,
  input: UpdateCategoryTagData
): Promise<CategoryTag> {
  const parishId = await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Check user has admin role
  await requireAdminRole(supabase, parishId)

  // Verify tag exists and belongs to parish
  const existing = await getCategoryTagById(tagId)
  if (!existing) {
    throw new Error('Category tag not found')
  }

  // Update tag fields (only provided fields)
  const { data, error } = await supabase
    .from('category_tags')
    .update(input)
    .eq('id', tagId)
    .eq('parish_id', parishId)
    .select()
    .single()

  if (error) {
    // Check for unique constraint violation
    if (error.code === '23505') {
      throw new Error('A tag with this slug already exists')
    }
    console.error('Error updating category tag:', error)
    throw new Error('Failed to update category tag')
  }

  revalidatePath('/settings/category-tags')
  revalidatePath(`/settings/category-tags/${tagId}`)

  return data
}

/**
 * Delete a category tag
 * Requires Admin role
 * Cannot delete if tag is assigned to any entities
 */
export async function deleteCategoryTag(tagId: string): Promise<{ success: boolean }> {
  const parishId = await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Check user has admin role
  await requireAdminRole(supabase, parishId)

  // Verify tag exists and belongs to parish
  const existing = await getCategoryTagById(tagId)
  if (!existing) {
    throw new Error('Category tag not found')
  }

  // Check if tag is in use (across all entity types)
  const { count, error: countError } = await supabase
    .from('tag_assignments')
    .select('*', { count: 'exact', head: true })
    .eq('tag_id', tagId)

  if (countError) {
    console.error('Error checking tag usage:', countError)
    throw new Error('Failed to check tag usage')
  }

  if (count && count > 0) {
    throw new Error('Cannot delete tag that is assigned to entities')
  }

  // Delete tag
  const { error } = await supabase
    .from('category_tags')
    .delete()
    .eq('id', tagId)
    .eq('parish_id', parishId)

  if (error) {
    console.error('Error deleting category tag:', error)
    throw new Error('Failed to delete category tag')
  }

  revalidatePath('/settings/category-tags')

  return { success: true }
}

/**
 * Reorder category tags
 * Updates sort_order for all provided tag IDs
 * Requires Admin role
 */
export async function reorderCategoryTags(tagIdsInOrder: string[]): Promise<CategoryTag[]> {
  const parishId = await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Check user has admin role
  await requireAdminRole(supabase, parishId)

  // Verify all tags belong to parish
  const { data: tags, error: fetchError } = await supabase
    .from('category_tags')
    .select('id')
    .eq('parish_id', parishId)
    .in('id', tagIdsInOrder)

  if (fetchError) {
    console.error('Error fetching tags for reorder:', fetchError)
    throw new Error('Failed to verify tags')
  }

  if (!tags || tags.length !== tagIdsInOrder.length) {
    throw new Error('Some tags do not belong to this parish')
  }

  // Update sort_order for each tag
  const updates = tagIdsInOrder.map((tagId, index) =>
    supabase
      .from('category_tags')
      .update({ sort_order: index + 1 })
      .eq('id', tagId)
      .eq('parish_id', parishId)
  )

  const results = await Promise.all(updates)

  const errors = results.filter(r => r.error)
  if (errors.length > 0) {
    console.error('Error reordering category tags:', errors)
    throw new Error('Failed to reorder category tags')
  }

  // Fetch updated tags
  const updatedTags = await getCategoryTags('sort_order')

  revalidatePath('/settings/category-tags')

  return updatedTags
}
