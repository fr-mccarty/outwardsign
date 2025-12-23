'use server'

import { revalidatePath } from 'next/cache'
import { logError } from '@/lib/utils/console'
import { sanitizeContentBody } from '@/lib/utils/sanitize'
import { createClient } from '@/lib/supabase/server'
import {
  createAuthenticatedClient,
  isNotFoundError,
} from './server-action-utils'
import {
  ContentWithTags,
  CreateContentData,
  UpdateContentData,
  ContentTag
} from '@/lib/types'

export interface GetContentsFilters {
  search?: string
  tag_slugs?: string[]
  language?: 'en' | 'es'
  limit?: number
  offset?: number
}

export interface GetContentsResult {
  items: ContentWithTags[]
  totalCount: number
}

/**
 * Helper to check if user has admin or staff role
 */
async function requireAdminOrStaffRole(supabase: Awaited<ReturnType<typeof createClient>>, parishId: string): Promise<string> {
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

  if (userParishError || !userParish) {
    throw new Error('Permission denied: Not a member of this parish')
  }

  const roles = userParish.roles || []
  if (!roles.includes('admin') && !roles.includes('staff')) {
    throw new Error('Permission denied: Admin or Staff role required')
  }

  return user.id
}

/**
 * Fetch tags for a content item using polymorphic tag_assignments
 */
async function fetchTagsForContent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  contentId: string
): Promise<ContentTag[]> {
  const { data, error } = await supabase
    .from('tag_assignments')
    .select(`
      tag:category_tags(*)
    `)
    .eq('entity_type', 'content')
    .eq('entity_id', contentId)

  if (error) {
    logError('Error fetching tags for content: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    return []
  }

  return (data || []).map((d: any) => d.tag).filter(Boolean)
}

/**
 * Fetch tags for multiple content items using polymorphic tag_assignments
 */
async function fetchTagsForContents(
  supabase: Awaited<ReturnType<typeof createClient>>,
  contentIds: string[]
): Promise<Map<string, ContentTag[]>> {
  if (contentIds.length === 0) {
    return new Map()
  }

  const { data, error } = await supabase
    .from('tag_assignments')
    .select(`
      entity_id,
      tag:category_tags(*)
    `)
    .eq('entity_type', 'content')
    .in('entity_id', contentIds)

  if (error) {
    logError('Error fetching tags for contents: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    return new Map()
  }

  // Group tags by content ID
  const tagMap = new Map<string, ContentTag[]>()
  for (const item of (data || []) as any[]) {
    if (!item.tag) continue
    const existing = tagMap.get(item.entity_id) || []
    existing.push(item.tag as ContentTag)
    tagMap.set(item.entity_id, existing)
  }

  return tagMap
}

/**
 * Get contents with optional filtering
 * Supports search, tag filtering (AND logic), language filtering, and pagination
 */
export async function getContents(filters: GetContentsFilters = {}): Promise<GetContentsResult> {
  const { supabase, parishId } = await createAuthenticatedClient()

  const {
    search,
    tag_slugs,
    language,
    limit = 20,
    offset = 0
  } = filters

  // Validate limit (max 100)
  const safeLimit = Math.min(limit, 100)

  // Build query for contents
  let query = supabase
    .from('contents')
    .select('*', { count: 'exact' })
    .eq('parish_id', parishId)

  // Apply language filter
  if (language) {
    query = query.eq('language', language)
  }

  // Apply search filter (full-text search on title and body)
  if (search) {
    query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`)
  }

  // Execute query
  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + safeLimit - 1)

  if (error) {
    logError('Error fetching contents: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch contents')
  }

  // Fetch tags for all contents
  const contentIds = (data || []).map(c => c.id)
  const tagMap = await fetchTagsForContents(supabase, contentIds)

  // Transform data to ContentWithTags format
  let contents: ContentWithTags[] = (data || []).map((item: any) => ({
    ...item,
    tags: tagMap.get(item.id) || []
  }))

  // Apply tag filtering (AND logic) - must match all tag_slugs
  if (tag_slugs && tag_slugs.length > 0) {
    contents = contents.filter(content => {
      if (!content.tags || content.tags.length === 0) return false
      const contentTagSlugs = content.tags.map(tag => tag.slug)
      return tag_slugs.every(slug => contentTagSlugs.includes(slug))
    })
  }

  // Get filtered count
  const totalCount = tag_slugs && tag_slugs.length > 0 ? contents.length : (count || 0)

  return {
    items: contents,
    totalCount
  }
}

/**
 * Get a single content item by ID with tags
 */
export async function getContentById(contentId: string): Promise<ContentWithTags | null> {
  const { supabase, parishId } = await createAuthenticatedClient()

  const { data, error } = await supabase
    .from('contents')
    .select('*')
    .eq('id', contentId)
    .eq('parish_id', parishId)
    .single()

  if (error) {
    if (isNotFoundError(error)) {
      return null // Not found
    }
    logError('Error fetching content: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch content')
  }

  // Fetch tags separately using polymorphic tag_assignments
  const tags = await fetchTagsForContent(supabase, contentId)

  // Transform to ContentWithTags format
  return {
    ...data,
    tags
  }
}

/**
 * Create a new content item
 * Requires Admin or Staff role
 */
export async function createContent(input: CreateContentData): Promise<ContentWithTags> {
  const { supabase, parishId } = await createAuthenticatedClient()

  // Check user has admin or staff role
  const userId = await requireAdminOrStaffRole(supabase, parishId)

  // Validate required fields
  if (!input.title || !input.body || !input.language) {
    throw new Error('Missing required fields: title, body, and language are required')
  }

  const { tag_ids, ...contentData } = input

  // Sanitize body content (strip HTML tags, preserve markdown and custom syntax)
  const sanitizedBody = sanitizeContentBody(contentData.body)

  // Insert content
  const { data: content, error: contentError } = await supabase
    .from('contents')
    .insert({
      ...contentData,
      body: sanitizedBody,
      parish_id: parishId,
      created_by: userId
    })
    .select()
    .single()

  if (contentError) {
    logError('Error creating content: ' + (contentError instanceof Error ? contentError.message : JSON.stringify(contentError)))
    throw new Error('Failed to create content')
  }

  // Insert tag assignments if provided using polymorphic tag_assignments
  if (tag_ids && tag_ids.length > 0) {
    const assignments = tag_ids.map(tagId => ({
      tag_id: tagId,
      entity_type: 'content',
      entity_id: content.id
    }))

    const { error: assignmentError } = await supabase
      .from('tag_assignments')
      .insert(assignments)

    if (assignmentError) {
      logError('Error creating tag assignments: ' + (assignmentError instanceof Error ? assignmentError.message : JSON.stringify(assignmentError)))
      // Don't throw - content is created, just log the error
    }
  }

  // Fetch created content with tags
  const createdContent = await getContentById(content.id)

  if (!createdContent) {
    throw new Error('Failed to fetch created content')
  }

  revalidatePath('/settings/content-library')

  return createdContent
}

/**
 * Update an existing content item
 * Requires Admin or Staff role
 */
export async function updateContent(
  contentId: string,
  input: UpdateContentData
): Promise<ContentWithTags> {
  const { supabase, parishId } = await createAuthenticatedClient()

  // Check user has admin or staff role
  await requireAdminOrStaffRole(supabase, parishId)

  // Verify content exists and belongs to parish
  const existing = await getContentById(contentId)
  if (!existing) {
    throw new Error('Content not found')
  }

  const { tag_ids, ...contentData } = input

  // Sanitize body if provided (strip HTML tags, preserve markdown and custom syntax)
  const sanitizedContentData = contentData.body
    ? { ...contentData, body: sanitizeContentBody(contentData.body) }
    : contentData

  // Update content fields (only provided fields)
  if (Object.keys(sanitizedContentData).length > 0) {
    const { error: updateError } = await supabase
      .from('contents')
      .update(sanitizedContentData)
      .eq('id', contentId)
      .eq('parish_id', parishId)

    if (updateError) {
      logError('Error updating content: ' + (updateError instanceof Error ? updateError.message : JSON.stringify(updateError)))
      throw new Error('Failed to update content')
    }
  }

  // Update tag assignments if provided using polymorphic tag_assignments
  if (tag_ids !== undefined) {
    // Delete existing assignments for this content
    const { error: deleteError } = await supabase
      .from('tag_assignments')
      .delete()
      .eq('entity_type', 'content')
      .eq('entity_id', contentId)

    if (deleteError) {
      logError('Error deleting tag assignments: ' + (deleteError instanceof Error ? deleteError.message : JSON.stringify(deleteError)))
      throw new Error('Failed to update tag assignments')
    }

    // Insert new assignments
    if (tag_ids.length > 0) {
      const assignments = tag_ids.map(tagId => ({
        tag_id: tagId,
        entity_type: 'content',
        entity_id: contentId
      }))

      const { error: insertError } = await supabase
        .from('tag_assignments')
        .insert(assignments)

      if (insertError) {
        logError('Error inserting tag assignments: ' + (insertError instanceof Error ? insertError.message : JSON.stringify(insertError)))
        throw new Error('Failed to update tag assignments')
      }
    }
  }

  // Fetch updated content with tags
  const updatedContent = await getContentById(contentId)

  if (!updatedContent) {
    throw new Error('Failed to fetch updated content')
  }

  revalidatePath('/settings/content-library')
  revalidatePath(`/settings/content-library/${contentId}`)

  return updatedContent
}

/**
 * Delete a content item
 * Requires Admin or Staff role
 */
export async function deleteContent(contentId: string): Promise<{ success: boolean }> {
  const { supabase, parishId } = await createAuthenticatedClient()

  // Check user has admin or staff role
  await requireAdminOrStaffRole(supabase, parishId)

  // Verify content exists and belongs to parish
  const existing = await getContentById(contentId)
  if (!existing) {
    throw new Error('Content not found')
  }

  // Delete tag assignments first (polymorphic table doesn't cascade)
  await supabase
    .from('tag_assignments')
    .delete()
    .eq('entity_type', 'content')
    .eq('entity_id', contentId)

  // Delete content
  const { error } = await supabase
    .from('contents')
    .delete()
    .eq('id', contentId)
    .eq('parish_id', parishId)

  if (error) {
    logError('Error deleting content: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to delete content')
  }

  revalidatePath('/settings/content-library')

  return { success: true }
}

/**
 * Search content by text with full-text search
 */
export async function searchContentByText(
  searchTerm: string,
  language?: 'en' | 'es',
  limit: number = 20
): Promise<ContentWithTags[]> {
  const { supabase, parishId } = await createAuthenticatedClient()

  // Validate limit (max 100)
  const safeLimit = Math.min(limit, 100)

  let query = supabase
    .from('contents')
    .select('*')
    .eq('parish_id', parishId)
    .or(`title.ilike.%${searchTerm}%,body.ilike.%${searchTerm}%`)

  // Apply language filter if provided
  if (language) {
    query = query.eq('language', language)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(safeLimit)

  if (error) {
    logError('Error searching content: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to search content')
  }

  // Fetch tags for all contents
  const contentIds = (data || []).map(c => c.id)
  const tagMap = await fetchTagsForContents(supabase, contentIds)

  // Transform to ContentWithTags format
  return (data || []).map((item: any) => ({
    ...item,
    tags: tagMap.get(item.id) || []
  }))
}
