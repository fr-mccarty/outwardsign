/**
 * People Tools
 *
 * Tools for managing people in the parish directory.
 * Used by: Admin, Staff Chat, Parishioner Chat (limited), MCP Server
 */

import type { CategorizedTool } from '../types'
import { getSupabaseClient, setAuditContext } from '../db'

// ============================================================================
// READ TOOLS
// ============================================================================

const listPeople: CategorizedTool = {
  name: 'list_people',
  description:
    'Search and list people in the parish directory. Returns name, email, and phone. Supports pagination.',
  category: 'people',
  inputSchema: {
    type: 'object',
    properties: {
      search: {
        type: 'string',
        description: 'Search term to filter by name, email, or phone',
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
      .from('people')
      .select('id, first_name, last_name, full_name, email, phone_number', {
        count: 'exact',
      })
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .order('last_name')
      .order('first_name')
      .range(offset, offset + limit - 1)

    if (args.search) {
      const search = args.search as string
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone_number.ilike.%${search}%`
      )
    }

    const { data, error, count } = await query

    if (error) {
      return { success: false, error: `Failed to fetch people: ${error.message}` }
    }

    return {
      success: true,
      total_count: count || 0,
      count: data?.length || 0,
      offset,
      limit,
      data: data || [],
    }
  },
}

const getPerson: CategorizedTool = {
  name: 'get_person',
  description: 'Get detailed information about a specific person by their ID.',
  category: 'people',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The UUID of the person to retrieve',
      },
    },
    required: ['id'],
  },
  requiredScope: 'read',
  allowedConsumers: ['admin', 'staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('people')
      .select(
        'id, first_name, last_name, full_name, email, phone_number, sex, preferred_language, preferred_communication_channel, created_at, updated_at'
      )
      .eq('id', args.id as string)
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Person not found' }
      }
      return { success: false, error: `Failed to fetch person: ${error.message}` }
    }

    return { success: true, data }
  },
}

const searchPeopleByName: CategorizedTool = {
  name: 'search_people_by_name',
  description:
    'Search for people by first and/or last name. Returns matching people with their IDs.',
  category: 'people',
  inputSchema: {
    type: 'object',
    properties: {
      first_name: {
        type: 'string',
        description: 'First name to search for (partial match)',
      },
      last_name: {
        type: 'string',
        description: 'Last name to search for (partial match)',
      },
    },
  },
  requiredScope: 'read',
  allowedConsumers: ['admin', 'staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    let query = supabase
      .from('people')
      .select('id, first_name, last_name, full_name, email')
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .order('last_name')
      .limit(20)

    if (args.first_name) {
      query = query.ilike('first_name', `%${args.first_name}%`)
    }
    if (args.last_name) {
      query = query.ilike('last_name', `%${args.last_name}%`)
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error: `Failed to search people: ${error.message}` }
    }

    return {
      success: true,
      count: data?.length || 0,
      data: data || [],
    }
  },
}

// ============================================================================
// PARISHIONER SELF-SERVICE TOOLS
// ============================================================================

const getMyInfo: CategorizedTool = {
  name: 'get_my_info',
  description: 'Get your own profile information.',
  category: 'people',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  requiredScope: 'read',
  allowedConsumers: ['parishioner'],
  async execute(args, context) {
    if (!context.personId) {
      return { success: false, error: 'Person context required' }
    }

    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('people')
      .select(
        'id, first_name, last_name, full_name, email, phone_number, preferred_language, preferred_communication_channel'
      )
      .eq('id', context.personId)
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .single()

    if (error) {
      return { success: false, error: 'Could not retrieve your information' }
    }

    return { success: true, data }
  },
}

const updateMyInfo: CategorizedTool = {
  name: 'update_my_info',
  description: 'Update your own contact information (email, phone, language preference).',
  category: 'people',
  inputSchema: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        description: 'New email address',
      },
      phone_number: {
        type: 'string',
        description: 'New phone number',
      },
      preferred_language: {
        type: 'string',
        enum: ['en', 'es'],
        description: 'Preferred language (en or es)',
      },
      preferred_communication_channel: {
        type: 'string',
        enum: ['email', 'sms'],
        description: 'Preferred way to be contacted',
      },
    },
  },
  requiredScope: 'write_self',
  allowedConsumers: ['parishioner'],
  async execute(args, context) {
    if (!context.personId) {
      return { success: false, error: 'Person context required' }
    }

    const supabase = getSupabaseClient()

    // Set audit context
    await setAuditContext(context)

    const updateData: Record<string, unknown> = {}
    if (args.email !== undefined) updateData.email = args.email || null
    if (args.phone_number !== undefined) updateData.phone_number = args.phone_number || null
    if (args.preferred_language !== undefined) updateData.preferred_language = args.preferred_language
    if (args.preferred_communication_channel !== undefined) {
      updateData.preferred_communication_channel = args.preferred_communication_channel
    }

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: 'No fields provided to update' }
    }

    const { data, error } = await supabase
      .from('people')
      .update(updateData)
      .eq('id', context.personId)
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .select('id, first_name, last_name, full_name, email, phone_number')
      .single()

    if (error) {
      return { success: false, error: `Failed to update your information: ${error.message}` }
    }

    return {
      success: true,
      message: 'Your information has been updated',
      data,
    }
  },
}

// ============================================================================
// WRITE TOOLS (Admin/Staff/MCP)
// ============================================================================

const createPerson: CategorizedTool = {
  name: 'create_person',
  description: 'Create a new person in the parish directory. Requires first and last name.',
  category: 'people',
  inputSchema: {
    type: 'object',
    properties: {
      first_name: {
        type: 'string',
        description: 'First name (required)',
      },
      last_name: {
        type: 'string',
        description: 'Last name (required)',
      },
      email: {
        type: 'string',
        description: 'Email address',
      },
      phone_number: {
        type: 'string',
        description: 'Phone number',
      },
      sex: {
        type: 'string',
        enum: ['male', 'female'],
        description: 'Sex (male or female)',
      },
      preferred_language: {
        type: 'string',
        enum: ['en', 'es'],
        description: 'Preferred language (en or es)',
      },
    },
    required: ['first_name', 'last_name'],
  },
  requiredScope: 'write',
  allowedConsumers: ['admin', 'staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    // Set audit context
    await setAuditContext(context)

    const insertData: Record<string, unknown> = {
      parish_id: context.parishId,
      first_name: args.first_name,
      last_name: args.last_name,
    }

    if (args.email) insertData.email = args.email
    if (args.phone_number) insertData.phone_number = args.phone_number
    if (args.sex) insertData.sex = args.sex
    if (args.preferred_language) insertData.preferred_language = args.preferred_language

    const { data, error } = await supabase
      .from('people')
      .insert(insertData)
      .select('id, first_name, last_name, full_name, email, phone_number')
      .single()

    if (error) {
      return { success: false, error: `Failed to create person: ${error.message}` }
    }

    return {
      success: true,
      message: `Created person: ${data.full_name}`,
      data,
    }
  },
}

const updatePerson: CategorizedTool = {
  name: 'update_person',
  description:
    'Update an existing person in the parish directory. Only provided fields will be updated.',
  category: 'people',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The UUID of the person to update (required)',
      },
      first_name: {
        type: 'string',
        description: 'New first name',
      },
      last_name: {
        type: 'string',
        description: 'New last name',
      },
      email: {
        type: 'string',
        description: 'New email address (use empty string to clear)',
      },
      phone_number: {
        type: 'string',
        description: 'New phone number (use empty string to clear)',
      },
      sex: {
        type: 'string',
        enum: ['male', 'female'],
        description: 'Sex (male or female)',
      },
      preferred_language: {
        type: 'string',
        enum: ['en', 'es'],
        description: 'Preferred language (en or es)',
      },
    },
    required: ['id'],
  },
  requiredScope: 'write',
  allowedConsumers: ['admin', 'staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    // Set audit context
    await setAuditContext(context)

    const updateData: Record<string, unknown> = {}

    if (args.first_name !== undefined) updateData.first_name = args.first_name
    if (args.last_name !== undefined) updateData.last_name = args.last_name
    if (args.email !== undefined) updateData.email = args.email || null
    if (args.phone_number !== undefined) updateData.phone_number = args.phone_number || null
    if (args.sex !== undefined) updateData.sex = args.sex
    if (args.preferred_language !== undefined) {
      updateData.preferred_language = args.preferred_language
    }

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: 'No fields provided to update' }
    }

    const { data, error } = await supabase
      .from('people')
      .update(updateData)
      .eq('id', args.id as string)
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .select('id, first_name, last_name, full_name, email, phone_number')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Person not found' }
      }
      return { success: false, error: `Failed to update person: ${error.message}` }
    }

    return {
      success: true,
      message: `Updated person: ${data.full_name}`,
      data,
    }
  },
}

// ============================================================================
// DELETE TOOLS
// ============================================================================

const deletePerson: CategorizedTool = {
  name: 'delete_person',
  description:
    'Soft-delete a person from the parish directory. This action requires confirmation.',
  category: 'people',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The UUID of the person to delete (required)',
      },
      confirmed: {
        type: 'boolean',
        description: 'Set to true to confirm deletion',
      },
    },
    required: ['id'],
  },
  requiredScope: 'delete',
  allowedConsumers: ['admin', 'staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    // First get the person to confirm they exist
    const { data: existing, error: fetchError } = await supabase
      .from('people')
      .select('id, full_name')
      .eq('id', args.id as string)
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !existing) {
      return { success: false, error: 'Person not found' }
    }

    // Require confirmation
    if (!args.confirmed) {
      return {
        success: true,
        requires_confirmation: true,
        action: 'delete_person',
        target: {
          type: 'person',
          id: existing.id,
          name: existing.full_name,
        },
        message: `Are you sure you want to delete ${existing.full_name}? This action cannot be easily undone.`,
      }
    }

    // Set audit context
    await setAuditContext(context)

    // Soft delete
    const { error } = await supabase
      .from('people')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', args.id as string)
      .eq('parish_id', context.parishId)

    if (error) {
      return { success: false, error: `Failed to delete person: ${error.message}` }
    }

    return {
      success: true,
      message: `Deleted person: ${existing.full_name}`,
      data: { id: existing.id, name: existing.full_name },
    }
  },
}

// ============================================================================
// EXPORTS
// ============================================================================

export const peopleTools: CategorizedTool[] = [
  // Read tools (admin/staff/mcp)
  listPeople,
  getPerson,
  searchPeopleByName,
  // Parishioner self-service
  getMyInfo,
  updateMyInfo,
  // Write tools (admin/staff/mcp)
  createPerson,
  updatePerson,
  // Delete tools (admin/staff/mcp)
  deletePerson,
]
