/**
 * Content Tools
 *
 * Tools for managing content library items (readings, prayers, blessings, etc.).
 * Used by: Admin, Staff Chat, Parishioner Chat, MCP Server
 */

import type { CategorizedTool } from '../types'
import { getSupabaseClient } from '../db'

// ============================================================================
// READ TOOLS
// ============================================================================

const listContents: CategorizedTool = {
  name: 'list_contents',
  description: 'List content items from the content library (readings, blessings, prayers, etc.).',
  category: 'content',
  inputSchema: {
    type: 'object',
    properties: {
      search: {
        type: 'string',
        description: 'Search term to filter by title or body',
      },
      language: {
        type: 'string',
        enum: ['en', 'es'],
        description: 'Filter by language (en or es)',
      },
      tag_slugs: {
        type: 'array',
        items: { type: 'string' },
        description: 'Filter by tag slugs (AND logic - must have all specified tags)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results (default: 20, max: 100)',
      },
      offset: {
        type: 'number',
        description: 'Number of results to skip for pagination',
      },
    },
  },
  requiredScope: 'read',
  allowedConsumers: ['admin', 'staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    const limit = Math.min((args.limit as number) || 20, 100)
    const offset = (args.offset as number) || 0

    let query = supabase
      .from('contents')
      .select('*', { count: 'exact' })
      .eq('parish_id', context.parishId)

    if (args.language) {
      query = query.eq('language', args.language as string)
    }

    if (args.search) {
      query = query.or(`title.ilike.%${args.search}%,body.ilike.%${args.search}%`)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return { success: false, error: `Failed to fetch contents: ${error.message}` }
    }

    const contentIds = (data || []).map((c) => c.id)
    const tagMap = new Map<string, Array<{ id: string; name: string; slug: string }>>()

    if (contentIds.length > 0) {
      const { data: tagData } = await supabase
        .from('tag_assignments')
        .select('entity_id, tag:category_tags(id, name, slug)')
        .eq('entity_type', 'content')
        .in('entity_id', contentIds)

      for (const item of (tagData || []) as unknown as Array<{
        entity_id: string
        tag: { id: string; name: string; slug: string } | null
      }>) {
        if (!item.tag) continue
        const existing = tagMap.get(item.entity_id) || []
        existing.push(item.tag)
        tagMap.set(item.entity_id, existing)
      }
    }

    let contents = (data || []).map((item) => ({
      id: item.id,
      title: item.title,
      language: item.language,
      body_preview: item.body?.substring(0, 200) + (item.body?.length > 200 ? '...' : ''),
      tags: tagMap.get(item.id) || [],
      created_at: item.created_at,
    }))

    if (args.tag_slugs && Array.isArray(args.tag_slugs) && args.tag_slugs.length > 0) {
      const requiredSlugs = args.tag_slugs as string[]
      contents = contents.filter((content) => {
        const contentSlugs = content.tags.map((t) => t.slug)
        return requiredSlugs.every((slug) => contentSlugs.includes(slug))
      })
    }

    return {
      success: true,
      total_count: count || 0,
      count: contents.length,
      offset,
      limit,
      data: contents,
    }
  },
}

const getContent: CategorizedTool = {
  name: 'get_content',
  description: 'Get a specific content item with full text.',
  category: 'content',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The UUID of the content item',
      },
    },
    required: ['id'],
  },
  requiredScope: 'read',
  allowedConsumers: ['admin', 'staff', 'parishioner', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .eq('id', args.id as string)
      .eq('parish_id', context.parishId)
      .single()

    if (error) {
      return { success: false, error: `Content not found: ${error.message}` }
    }

    const { data: tagData } = await supabase
      .from('tag_assignments')
      .select('tag:category_tags(id, name, slug)')
      .eq('entity_type', 'content')
      .eq('entity_id', data.id)

    const tags = ((tagData || []) as unknown as Array<{ tag: { id: string; name: string; slug: string } | null }>)
      .map((t) => t.tag)
      .filter(Boolean)

    return {
      success: true,
      data: {
        id: data.id,
        title: data.title,
        body: data.body,
        language: data.language,
        tags,
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
    }
  },
}

const searchContent: CategorizedTool = {
  name: 'search_content',
  description: 'Full-text search of content library.',
  category: 'content',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search term to find in content titles and bodies',
      },
      language: {
        type: 'string',
        enum: ['en', 'es'],
        description: 'Filter by language',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results (default: 20)',
      },
    },
    required: ['query'],
  },
  requiredScope: 'read',
  allowedConsumers: ['admin', 'staff', 'parishioner', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    const limit = Math.min((args.limit as number) || 20, 100)
    const searchTerm = args.query as string

    let query = supabase
      .from('contents')
      .select('*')
      .eq('parish_id', context.parishId)
      .or(`title.ilike.%${searchTerm}%,body.ilike.%${searchTerm}%`)

    if (args.language) {
      query = query.eq('language', args.language as string)
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(limit)

    if (error) {
      return { success: false, error: `Search failed: ${error.message}` }
    }

    const contentIds = (data || []).map((c) => c.id)
    const tagMap = new Map<string, Array<{ id: string; name: string; slug: string }>>()

    if (contentIds.length > 0) {
      const { data: tagData } = await supabase
        .from('tag_assignments')
        .select('entity_id, tag:category_tags(id, name, slug)')
        .eq('entity_type', 'content')
        .in('entity_id', contentIds)

      for (const item of (tagData || []) as unknown as Array<{
        entity_id: string
        tag: { id: string; name: string; slug: string } | null
      }>) {
        if (!item.tag) continue
        const existing = tagMap.get(item.entity_id) || []
        existing.push(item.tag)
        tagMap.set(item.entity_id, existing)
      }
    }

    return {
      success: true,
      count: data?.length || 0,
      data: (data || []).map((item) => ({
        id: item.id,
        title: item.title,
        language: item.language,
        body_preview: item.body?.substring(0, 200) + (item.body?.length > 200 ? '...' : ''),
        tags: tagMap.get(item.id) || [],
      })),
    }
  },
}

const listContentTags: CategorizedTool = {
  name: 'list_content_tags',
  description: 'List all category tags used to categorize content.',
  category: 'content',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  requiredScope: 'read',
  allowedConsumers: ['admin', 'staff', 'parishioner', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('category_tags')
      .select('id, name, slug, description, color')
      .eq('parish_id', context.parishId)
      .order('name')

    if (error) {
      return { success: false, error: `Failed to fetch tags: ${error.message}` }
    }

    return {
      success: true,
      count: data?.length || 0,
      data: data || [],
    }
  },
}

// ============================================================================
// EXPORTS
// ============================================================================

export const contentTools: CategorizedTool[] = [
  listContents,
  getContent,
  searchContent,
  listContentTags,
]
