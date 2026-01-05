/**
 * Availability Tools
 *
 * Tools for managing person availability and blackout dates.
 * Used by: Admin, Staff Chat, Parishioner Chat, MCP Server
 */

import type { CategorizedTool } from '../types'
import { getSupabaseClient, setAuditContext } from '../db'

// ============================================================================
// READ TOOLS
// ============================================================================

const getPersonAvailability: CategorizedTool = {
  name: 'get_person_availability',
  description: "Get a person's blackout dates (dates they are unavailable).",
  category: 'availability',
  inputSchema: {
    type: 'object',
    properties: {
      person_id: {
        type: 'string',
        description: 'The UUID of the person',
      },
      start_date: {
        type: 'string',
        description: 'Start date to filter (YYYY-MM-DD)',
      },
      end_date: {
        type: 'string',
        description: 'End date to filter (YYYY-MM-DD)',
      },
    },
    required: ['person_id'],
  },
  requiredScope: 'read',
  allowedConsumers: ['admin', 'staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    let query = supabase
      .from('person_blackout_dates')
      .select('id, start_date, end_date, reason, created_at')
      .eq('person_id', args.person_id as string)
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .order('start_date')

    if (args.start_date) {
      query = query.gte('end_date', args.start_date as string)
    }
    if (args.end_date) {
      query = query.lte('start_date', args.end_date as string)
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error: `Failed to fetch availability: ${error.message}` }
    }

    return {
      success: true,
      count: data?.length || 0,
      data: data || [],
    }
  },
}

const checkAvailability: CategorizedTool = {
  name: 'check_availability',
  description: 'Check if a person is available on a specific date.',
  category: 'availability',
  inputSchema: {
    type: 'object',
    properties: {
      person_id: {
        type: 'string',
        description: 'The UUID of the person',
      },
      date: {
        type: 'string',
        description: 'The date to check (YYYY-MM-DD)',
      },
    },
    required: ['person_id', 'date'],
  },
  requiredScope: 'read',
  allowedConsumers: ['admin', 'staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    const checkDate = args.date as string

    const { data: blackouts, error } = await supabase
      .from('person_blackout_dates')
      .select('id, start_date, end_date, reason')
      .eq('person_id', args.person_id as string)
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .lte('start_date', checkDate)
      .gte('end_date', checkDate)

    if (error) {
      return { success: false, error: `Failed to check availability: ${error.message}` }
    }

    const isAvailable = !blackouts || blackouts.length === 0

    return {
      success: true,
      data: {
        person_id: args.person_id,
        date: checkDate,
        is_available: isAvailable,
        conflicts: blackouts || [],
      },
    }
  },
}

const getMyBlackouts: CategorizedTool = {
  name: 'get_my_blackouts',
  description: 'Get your blackout dates (dates you marked as unavailable).',
  category: 'availability',
  inputSchema: {
    type: 'object',
    properties: {
      upcoming_only: {
        type: 'boolean',
        description: 'If true, only return future blackout dates',
      },
    },
  },
  requiredScope: 'read',
  allowedConsumers: ['parishioner'],
  async execute(args, context) {
    if (!context.personId) {
      return { success: false, error: 'Person context required' }
    }

    const supabase = getSupabaseClient()

    let query = supabase
      .from('person_blackout_dates')
      .select('id, start_date, end_date, reason, created_at')
      .eq('person_id', context.personId)
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .order('start_date')

    if (args.upcoming_only) {
      const today = new Date().toISOString().split('T')[0]
      query = query.gte('end_date', today)
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error: 'Could not retrieve your blackout dates' }
    }

    return {
      success: true,
      count: data?.length || 0,
      data: data || [],
    }
  },
}

// ============================================================================
// WRITE TOOLS
// ============================================================================

const addBlackoutDate: CategorizedTool = {
  name: 'add_blackout_date',
  description: 'Add a blackout date range for a person (mark them as unavailable).',
  category: 'availability',
  inputSchema: {
    type: 'object',
    properties: {
      person_id: {
        type: 'string',
        description: 'The UUID of the person',
      },
      start_date: {
        type: 'string',
        description: 'Start date (YYYY-MM-DD)',
      },
      end_date: {
        type: 'string',
        description: 'End date (YYYY-MM-DD). If not provided, uses start_date (single day).',
      },
      reason: {
        type: 'string',
        description: 'Optional reason for the blackout',
      },
    },
    required: ['person_id', 'start_date'],
  },
  requiredScope: 'write',
  allowedConsumers: ['admin', 'staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    await setAuditContext(context)

    const startDate = args.start_date as string
    const endDate = (args.end_date as string) || startDate

    const { data: person, error: personError } = await supabase
      .from('people')
      .select('id, full_name')
      .eq('id', args.person_id as string)
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .single()

    if (personError || !person) {
      return { success: false, error: 'Person not found' }
    }

    const { data, error } = await supabase
      .from('person_blackout_dates')
      .insert({
        person_id: args.person_id as string,
        parish_id: context.parishId,
        start_date: startDate,
        end_date: endDate,
        reason: (args.reason as string) || null,
      })
      .select('id, start_date, end_date, reason')
      .single()

    if (error) {
      return { success: false, error: `Failed to add blackout date: ${error.message}` }
    }

    return {
      success: true,
      message: `Added blackout for ${person.full_name}: ${startDate}${endDate !== startDate ? ` to ${endDate}` : ''}`,
      data,
    }
  },
}

const removeBlackoutDate: CategorizedTool = {
  name: 'remove_blackout_date',
  description: 'Remove a blackout date for a person.',
  category: 'availability',
  inputSchema: {
    type: 'object',
    properties: {
      blackout_id: {
        type: 'string',
        description: 'The UUID of the blackout date to remove',
      },
    },
    required: ['blackout_id'],
  },
  requiredScope: 'write',
  allowedConsumers: ['admin', 'staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    await setAuditContext(context)

    const { data: blackout, error: fetchError } = await supabase
      .from('person_blackout_dates')
      .select('id, start_date, end_date, person:people(full_name)')
      .eq('id', args.blackout_id as string)
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !blackout) {
      return { success: false, error: 'Blackout date not found' }
    }

    const { error: deleteError } = await supabase
      .from('person_blackout_dates')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', args.blackout_id as string)

    if (deleteError) {
      return { success: false, error: `Failed to remove blackout: ${deleteError.message}` }
    }

    const personName = (blackout.person as unknown as { full_name: string } | null)?.full_name || 'Person'

    return {
      success: true,
      message: `Removed blackout for ${personName}: ${blackout.start_date}${blackout.end_date !== blackout.start_date ? ` to ${blackout.end_date}` : ''}`,
      data: { id: blackout.id },
    }
  },
}

const addMyBlackout: CategorizedTool = {
  name: 'add_my_blackout',
  description: 'Mark yourself as unavailable for a date range.',
  category: 'availability',
  inputSchema: {
    type: 'object',
    properties: {
      start_date: {
        type: 'string',
        description: 'Start date (YYYY-MM-DD)',
      },
      end_date: {
        type: 'string',
        description: 'End date (YYYY-MM-DD). If not provided, uses start_date.',
      },
      reason: {
        type: 'string',
        description: 'Optional reason (e.g., "vacation", "out of town")',
      },
    },
    required: ['start_date'],
  },
  requiredScope: 'write_self',
  allowedConsumers: ['parishioner'],
  async execute(args, context) {
    if (!context.personId) {
      return { success: false, error: 'Person context required' }
    }

    const supabase = getSupabaseClient()
    await setAuditContext(context)

    const startDate = args.start_date as string
    const endDate = (args.end_date as string) || startDate

    const { data, error } = await supabase
      .from('person_blackout_dates')
      .insert({
        person_id: context.personId,
        parish_id: context.parishId,
        start_date: startDate,
        end_date: endDate,
        reason: (args.reason as string) || null,
      })
      .select('id, start_date, end_date, reason')
      .single()

    if (error) {
      return { success: false, error: `Failed to add blackout: ${error.message}` }
    }

    return {
      success: true,
      message: `You are now marked unavailable from ${startDate}${endDate !== startDate ? ` to ${endDate}` : ''}`,
      data,
    }
  },
}

const removeMyBlackout: CategorizedTool = {
  name: 'remove_my_blackout',
  description: 'Remove one of your blackout dates.',
  category: 'availability',
  inputSchema: {
    type: 'object',
    properties: {
      blackout_id: {
        type: 'string',
        description: 'The UUID of the blackout to remove',
      },
    },
    required: ['blackout_id'],
  },
  requiredScope: 'write_self',
  allowedConsumers: ['parishioner'],
  async execute(args, context) {
    if (!context.personId) {
      return { success: false, error: 'Person context required' }
    }

    const supabase = getSupabaseClient()
    await setAuditContext(context)

    const { data: blackout, error: fetchError } = await supabase
      .from('person_blackout_dates')
      .select('id, start_date, end_date')
      .eq('id', args.blackout_id as string)
      .eq('person_id', context.personId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !blackout) {
      return { success: false, error: 'Blackout not found or you do not have permission to remove it' }
    }

    const { error: deleteError } = await supabase
      .from('person_blackout_dates')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', args.blackout_id as string)

    if (deleteError) {
      return { success: false, error: `Failed to remove blackout: ${deleteError.message}` }
    }

    return {
      success: true,
      message: `Removed your blackout for ${blackout.start_date}${blackout.end_date !== blackout.start_date ? ` to ${blackout.end_date}` : ''}`,
      data: { id: blackout.id },
    }
  },
}

// ============================================================================
// EXPORTS
// ============================================================================

export const availabilityTools: CategorizedTool[] = [
  getPersonAvailability,
  checkAvailability,
  getMyBlackouts,
  addBlackoutDate,
  removeBlackoutDate,
  addMyBlackout,
  removeMyBlackout,
]
