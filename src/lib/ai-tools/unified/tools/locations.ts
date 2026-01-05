/**
 * Locations Tools
 *
 * Tools for managing parish locations and venues.
 * Used by: Admin, Staff Chat, Parishioner Chat, MCP Server
 */

import type { CategorizedTool } from '../types'
import { getSupabaseClient, setAuditContext } from '../db'

// ============================================================================
// READ TOOLS
// ============================================================================

const listLocations: CategorizedTool = {
  name: 'list_locations',
  description:
    'List parish locations and venues. Use for questions about where things happen, rooms, or addresses.',
  category: 'locations',
  inputSchema: {
    type: 'object',
    properties: {
      search: {
        type: 'string',
        description: 'Search term to filter locations by name, description, or city',
      },
    },
  },
  requiredScope: 'read',
  allowedConsumers: ['admin', 'staff', 'parishioner', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    let query = supabase
      .from('locations')
      .select('id, name, description, street, city, state, country, phone_number')
      .eq('parish_id', context.parishId)
      .order('name')

    if (args.search) {
      const search = args.search as string
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%,city.ilike.%${search}%`
      )
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error: `Failed to fetch locations: ${error.message}` }
    }

    return {
      success: true,
      count: data?.length || 0,
      data: (data || []).map((loc) => ({
        id: loc.id,
        name: loc.name,
        description: loc.description,
        address: [loc.street, loc.city, loc.state, loc.country].filter(Boolean).join(', '),
        phone_number: loc.phone_number,
      })),
    }
  },
}

const getLocation: CategorizedTool = {
  name: 'get_location',
  description: 'Get details for a specific location.',
  category: 'locations',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The UUID of the location',
      },
    },
    required: ['id'],
  },
  requiredScope: 'read',
  allowedConsumers: ['admin', 'staff', 'parishioner', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', args.id as string)
      .eq('parish_id', context.parishId)
      .single()

    if (error) {
      return { success: false, error: `Location not found: ${error.message}` }
    }

    return {
      success: true,
      data: {
        id: data.id,
        name: data.name,
        description: data.description,
        street: data.street,
        city: data.city,
        state: data.state,
        country: data.country,
        phone_number: data.phone_number,
        created_at: data.created_at,
      },
    }
  },
}

// ============================================================================
// WRITE TOOLS
// ============================================================================

const createLocation: CategorizedTool = {
  name: 'create_location',
  description: 'Create a new parish location or venue.',
  category: 'locations',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name of the location (e.g., "Main Church", "Parish Hall")',
      },
      description: {
        type: 'string',
        description: 'Description of the location',
      },
      street: {
        type: 'string',
        description: 'Street address',
      },
      city: {
        type: 'string',
        description: 'City',
      },
      state: {
        type: 'string',
        description: 'State or province',
      },
      country: {
        type: 'string',
        description: 'Country',
      },
      phone_number: {
        type: 'string',
        description: 'Contact phone number',
      },
    },
    required: ['name'],
  },
  requiredScope: 'write',
  allowedConsumers: ['admin', 'staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    await setAuditContext(context)

    const { data, error } = await supabase
      .from('locations')
      .insert({
        parish_id: context.parishId,
        name: args.name as string,
        description: (args.description as string) || null,
        street: (args.street as string) || null,
        city: (args.city as string) || null,
        state: (args.state as string) || null,
        country: (args.country as string) || null,
        phone_number: (args.phone_number as string) || null,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: `Failed to create location: ${error.message}` }
    }

    return {
      success: true,
      message: `Created location: ${data.name}`,
      data: {
        id: data.id,
        name: data.name,
      },
    }
  },
}

const updateLocation: CategorizedTool = {
  name: 'update_location',
  description: 'Update an existing location.',
  category: 'locations',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The UUID of the location to update',
      },
      name: {
        type: 'string',
        description: 'Updated name',
      },
      description: {
        type: 'string',
        description: 'Updated description',
      },
      street: {
        type: 'string',
        description: 'Updated street address',
      },
      city: {
        type: 'string',
        description: 'Updated city',
      },
      state: {
        type: 'string',
        description: 'Updated state',
      },
      country: {
        type: 'string',
        description: 'Updated country',
      },
      phone_number: {
        type: 'string',
        description: 'Updated phone number',
      },
    },
    required: ['id'],
  },
  requiredScope: 'write',
  allowedConsumers: ['admin', 'staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    await setAuditContext(context)

    const updates: Record<string, unknown> = {}
    if (args.name !== undefined) updates.name = args.name
    if (args.description !== undefined) updates.description = args.description
    if (args.street !== undefined) updates.street = args.street
    if (args.city !== undefined) updates.city = args.city
    if (args.state !== undefined) updates.state = args.state
    if (args.country !== undefined) updates.country = args.country
    if (args.phone_number !== undefined) updates.phone_number = args.phone_number

    if (Object.keys(updates).length === 0) {
      return { success: false, error: 'No fields provided to update' }
    }

    const { data, error } = await supabase
      .from('locations')
      .update(updates)
      .eq('id', args.id as string)
      .eq('parish_id', context.parishId)
      .select()
      .single()

    if (error) {
      return { success: false, error: `Failed to update location: ${error.message}` }
    }

    return {
      success: true,
      message: `Updated location: ${data.name}`,
      data: {
        id: data.id,
        name: data.name,
      },
    }
  },
}

const deleteLocation: CategorizedTool = {
  name: 'delete_location',
  description: 'Delete a location. Will fail if the location is in use by events.',
  category: 'locations',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The UUID of the location to delete',
      },
    },
    required: ['id'],
  },
  requiredScope: 'delete',
  allowedConsumers: ['admin', 'staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    await setAuditContext(context)

    const { data: location, error: fetchError } = await supabase
      .from('locations')
      .select('id, name')
      .eq('id', args.id as string)
      .eq('parish_id', context.parishId)
      .single()

    if (fetchError || !location) {
      return { success: false, error: 'Location not found' }
    }

    const { count: eventCount } = await supabase
      .from('calendar_events')
      .select('*', { count: 'exact', head: true })
      .eq('location_id', args.id as string)
      .eq('parish_id', context.parishId)

    if (eventCount && eventCount > 0) {
      return {
        success: false,
        error: `Cannot delete location "${location.name}" - it is used by ${eventCount} calendar event(s)`,
      }
    }

    const { error } = await supabase
      .from('locations')
      .delete()
      .eq('id', args.id as string)
      .eq('parish_id', context.parishId)

    if (error) {
      return { success: false, error: `Failed to delete location: ${error.message}` }
    }

    return {
      success: true,
      message: `Deleted location: ${location.name}`,
      data: { id: location.id },
    }
  },
}

// ============================================================================
// EXPORTS
// ============================================================================

export const locationsTools: CategorizedTool[] = [
  listLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
]
