/**
 * Settings Tools
 *
 * Tools for reading parish settings and configuration.
 * Used by: Staff Chat, MCP Server
 */

import type { UnifiedToolDefinition } from '../types.js'
import { getSupabaseClient } from '../db.js'

// ============================================================================
// READ TOOLS
// ============================================================================

const getParishInfo: UnifiedToolDefinition = {
  name: 'get_parish_info',
  description: 'Get basic information about the parish.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  requiredScope: 'read',
  allowedConsumers: ['staff', 'parishioner', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('parishes')
      .select('id, name, slug, timezone, language, created_at')
      .eq('id', context.parishId)
      .single()

    if (error) {
      return { success: false, error: `Failed to fetch parish info: ${error.message}` }
    }

    return {
      success: true,
      data: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        timezone: data.timezone,
        language: data.language,
        created_at: data.created_at,
      },
    }
  },
}

const listEventTypes: UnifiedToolDefinition = {
  name: 'list_event_types',
  description: 'List all event types configured for the parish (weddings, funerals, baptisms, etc.).',
  inputSchema: {
    type: 'object',
    properties: {
      include_inactive: {
        type: 'boolean',
        description: 'Include inactive event types (default: false)',
      },
    },
  },
  requiredScope: 'read',
  allowedConsumers: ['staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    let query = supabase
      .from('event_types')
      .select('id, name, slug, system_type, icon, color, is_active, show_on_public_calendar')
      .eq('parish_id', context.parishId)
      .order('name')

    if (!args.include_inactive) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error: `Failed to fetch event types: ${error.message}` }
    }

    return {
      success: true,
      count: data?.length || 0,
      data: data || [],
    }
  },
}

const getEventType: UnifiedToolDefinition = {
  name: 'get_event_type',
  description: 'Get details for a specific event type including its form fields.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The UUID of the event type',
      },
    },
    required: ['id'],
  },
  requiredScope: 'read',
  allowedConsumers: ['staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('event_types')
      .select(
        `
        id,
        name,
        slug,
        system_type,
        icon,
        color,
        is_active,
        show_on_public_calendar,
        default_calendar_event_config,
        created_at
      `
      )
      .eq('id', args.id as string)
      .eq('parish_id', context.parishId)
      .single()

    if (error) {
      return { success: false, error: `Event type not found: ${error.message}` }
    }

    // Fetch field definitions for this event type
    const { data: fields } = await supabase
      .from('input_field_definitions')
      .select('id, name, field_type, description, is_required, display_order')
      .eq('event_type_id', data.id)
      .is('deleted_at', null)
      .order('display_order')

    return {
      success: true,
      data: {
        ...data,
        fields: fields || [],
      },
    }
  },
}

const listCustomLists: UnifiedToolDefinition = {
  name: 'list_custom_lists',
  description: 'List custom dropdown lists used in forms.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  requiredScope: 'read',
  allowedConsumers: ['staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('custom_lists')
      .select(
        `
        id,
        name,
        slug,
        description,
        items:custom_list_items(id, value, label, display_order)
      `
      )
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .order('name')

    if (error) {
      return { success: false, error: `Failed to fetch custom lists: ${error.message}` }
    }

    return {
      success: true,
      count: data?.length || 0,
      data: data || [],
    }
  },
}

const getMassSettings: UnifiedToolDefinition = {
  name: 'get_mass_settings',
  description: 'Get mass configuration settings including ministry roles.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  requiredScope: 'read',
  allowedConsumers: ['staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    // Get mass event type with ministry roles
    const { data: massType, error: massError } = await supabase
      .from('event_types')
      .select(
        `
        id,
        name,
        system_type,
        input_field_definitions(
          id,
          name,
          field_type,
          description,
          display_order,
          render_config
        )
      `
      )
      .eq('parish_id', context.parishId)
      .eq('system_type', 'mass')
      .single()

    if (massError) {
      return { success: false, error: `Failed to fetch mass settings: ${massError.message}` }
    }

    // Extract ministry roles (person-picker fields)
    const ministryRoles =
      (
        massType?.input_field_definitions as Array<{
          id: string
          name: string
          field_type: string
          description: string
          display_order: number
        }>
      )
        ?.filter((f) => f.field_type === 'person-picker')
        .map((f) => ({
          id: f.id,
          name: f.name,
          description: f.description,
          display_order: f.display_order,
        })) || []

    return {
      success: true,
      data: {
        event_type_id: massType?.id,
        ministry_roles: ministryRoles,
      },
    }
  },
}

const getParishSettings: UnifiedToolDefinition = {
  name: 'get_parish_settings',
  description: 'Get parish configuration settings.',
  inputSchema: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        description: 'Filter by settings category (e.g., "general", "email", "notifications")',
      },
    },
  },
  requiredScope: 'read',
  allowedConsumers: ['staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    let query = supabase
      .from('parish_settings')
      .select('id, key, value, category, description')
      .eq('parish_id', context.parishId)

    if (args.category) {
      query = query.eq('category', args.category as string)
    }

    const { data, error } = await query.order('category').order('key')

    if (error) {
      return { success: false, error: `Failed to fetch settings: ${error.message}` }
    }

    // Group by category
    const grouped = (data || []).reduce(
      (acc, setting) => {
        const cat = setting.category || 'general'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push({
          key: setting.key,
          value: setting.value,
          description: setting.description,
        })
        return acc
      },
      {} as Record<string, Array<{ key: string; value: unknown; description: string | null }>>
    )

    return {
      success: true,
      data: grouped,
    }
  },
}

// ============================================================================
// EXPORTS
// ============================================================================

export const settingsTools: UnifiedToolDefinition[] = [
  getParishInfo,
  listEventTypes,
  getEventType,
  listCustomLists,
  getMassSettings,
  getParishSettings,
]
