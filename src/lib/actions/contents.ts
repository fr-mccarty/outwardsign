'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import type {
  ContentWithTags,
  CreateContentData,
  UpdateContentData
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
 * Get contents with optional filtering
 * Supports search, tag filtering (AND logic), language filtering, and pagination
 */
export async function getContents(filters: GetContentsFilters = {}): Promise<GetContentsResult> {
  const parishId = await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  const {
    search,
    tag_slugs,
    language,
    limit = 20,
    offset = 0
  } = filters

  // Validate limit (max 100)
  const safeLimit = Math.min(limit, 100)

  // Build query for contents with tags
  let query = supabase
    .from('contents')
    .select(`
      *,
      tags:content_tag_assignments(
        tag:content_tags(*)
      )
    `, { count: 'exact' })
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
    console.error('Error fetching contents:', error)
    throw new Error('Failed to fetch contents')
  }

  // Transform data to ContentWithTags format
  let contents: ContentWithTags[] = (data || []).map((item: any) => ({
    ...item,
    tags: item.tags?.map((t: any) => t.tag).filter(Boolean) || []
  }))

  // Apply tag filtering (AND logic) - must match all tag_slugs
  if (tag_slugs && tag_slugs.length > 0) {
    contents = contents.filter(content => {
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
  const parishId = await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('contents')
    .select(`
      *,
      tags:content_tag_assignments(
        tag:content_tags(*)
      )
    `)
    .eq('id', contentId)
    .eq('parish_id', parishId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching content:', error)
    throw new Error('Failed to fetch content')
  }

  // Transform to ContentWithTags format
  return {
    ...data,
    tags: data.tags?.map((t: any) => t.tag).filter(Boolean) || []
  }
}

/**
 * Create a new content item
 * Requires Admin or Staff role
 */
export async function createContent(input: CreateContentData): Promise<ContentWithTags> {
  const parishId = await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Check user has admin or staff role
  const userId = await requireAdminOrStaffRole(supabase, parishId)

  // Validate required fields
  if (!input.title || !input.body || !input.language) {
    throw new Error('Missing required fields: title, body, and language are required')
  }

  const { tag_ids, ...contentData } = input

  // Insert content
  const { data: content, error: contentError } = await supabase
    .from('contents')
    .insert({
      ...contentData,
      parish_id: parishId,
      created_by: userId
    })
    .select()
    .single()

  if (contentError) {
    console.error('Error creating content:', contentError)
    throw new Error('Failed to create content')
  }

  // Insert tag assignments if provided
  if (tag_ids && tag_ids.length > 0) {
    const assignments = tag_ids.map(tagId => ({
      content_id: content.id,
      tag_id: tagId
    }))

    const { error: assignmentError } = await supabase
      .from('content_tag_assignments')
      .insert(assignments)

    if (assignmentError) {
      console.error('Error creating tag assignments:', assignmentError)
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
  const parishId = await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Check user has admin or staff role
  await requireAdminOrStaffRole(supabase, parishId)

  // Verify content exists and belongs to parish
  const existing = await getContentById(contentId)
  if (!existing) {
    throw new Error('Content not found')
  }

  const { tag_ids, ...contentData } = input

  // Update content fields (only provided fields)
  if (Object.keys(contentData).length > 0) {
    const { error: updateError } = await supabase
      .from('contents')
      .update(contentData)
      .eq('id', contentId)
      .eq('parish_id', parishId)

    if (updateError) {
      console.error('Error updating content:', updateError)
      throw new Error('Failed to update content')
    }
  }

  // Update tag assignments if provided
  if (tag_ids !== undefined) {
    // Delete existing assignments
    const { error: deleteError } = await supabase
      .from('content_tag_assignments')
      .delete()
      .eq('content_id', contentId)

    if (deleteError) {
      console.error('Error deleting tag assignments:', deleteError)
      throw new Error('Failed to update tag assignments')
    }

    // Insert new assignments
    if (tag_ids.length > 0) {
      const assignments = tag_ids.map(tagId => ({
        content_id: contentId,
        tag_id: tagId
      }))

      const { error: insertError } = await supabase
        .from('content_tag_assignments')
        .insert(assignments)

      if (insertError) {
        console.error('Error inserting tag assignments:', insertError)
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
  const parishId = await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Check user has admin or staff role
  await requireAdminOrStaffRole(supabase, parishId)

  // Verify content exists and belongs to parish
  const existing = await getContentById(contentId)
  if (!existing) {
    throw new Error('Content not found')
  }

  // Delete content (CASCADE will delete tag assignments)
  const { error } = await supabase
    .from('contents')
    .delete()
    .eq('id', contentId)
    .eq('parish_id', parishId)

  if (error) {
    console.error('Error deleting content:', error)
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
  const parishId = await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Validate limit (max 100)
  const safeLimit = Math.min(limit, 100)

  let query = supabase
    .from('contents')
    .select(`
      *,
      tags:content_tag_assignments(
        tag:content_tags(*)
      )
    `)
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
    console.error('Error searching content:', error)
    throw new Error('Failed to search content')
  }

  // Transform to ContentWithTags format
  return (data || []).map((item: any) => ({
    ...item,
    tags: item.tags?.map((t: any) => t.tag).filter(Boolean) || []
  }))
}
