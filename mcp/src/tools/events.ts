/**
 * Events Tools
 *
 * Tools for managing events and calendar.
 * Used by: Staff Chat, Parishioner Chat, MCP Server
 */

import type { UnifiedToolDefinition } from '../types.js'
import { getSupabaseClient } from '../db.js'

// ============================================================================
// READ TOOLS
// ============================================================================

const listEvents: UnifiedToolDefinition = {
  name: 'list_events',
  description: 'Search and list events. Can filter by event type, date range, and status.',
  inputSchema: {
    type: 'object',
    properties: {
      event_type_id: {
        type: 'string',
        description: 'Filter by event type UUID',
      },
      start_date: {
        type: 'string',
        description: 'Start date filter (YYYY-MM-DD)',
      },
      end_date: {
        type: 'string',
        description: 'End date filter (YYYY-MM-DD)',
      },
      status: {
        type: 'string',
        description: 'Filter by status (e.g., "draft", "confirmed", "completed")',
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
  allowedConsumers: ['staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    const limit = Math.min((args.limit as number) || 20, 100)
    const offset = (args.offset as number) || 0

    // Query master_events with their calendar_events
    let query = supabase
      .from('master_events')
      .select(
        `
        id,
        status,
        field_values,
        created_at,
        event_type:event_types(id, name, slug, system_type),
        calendar_events(id, start_datetime, end_datetime, location:locations(id, name))
      `,
        { count: 'exact' }
      )
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (args.event_type_id) {
      query = query.eq('event_type_id', args.event_type_id as string)
    }
    if (args.status) {
      query = query.eq('status', args.status as string)
    }

    const { data, error, count } = await query

    if (error) {
      return { success: false, error: `Failed to fetch events: ${error.message}` }
    }

    // Filter by date range if provided
    let filteredData = data || []
    if (args.start_date || args.end_date) {
      filteredData = filteredData.filter((event) => {
        const calendarEvents = event.calendar_events as Array<{ start_datetime: string }>
        if (!calendarEvents || calendarEvents.length === 0) return false

        return calendarEvents.some((ce) => {
          const eventDate = ce.start_datetime.split('T')[0]
          if (args.start_date && eventDate < (args.start_date as string)) return false
          if (args.end_date && eventDate > (args.end_date as string)) return false
          return true
        })
      })
    }

    return {
      success: true,
      total_count: count || 0,
      count: filteredData.length,
      offset,
      limit,
      data: filteredData,
    }
  },
}

const getCalendarEvents: UnifiedToolDefinition = {
  name: 'get_calendar_events',
  description: 'Get calendar events for a date range. Returns events with times and locations.',
  inputSchema: {
    type: 'object',
    properties: {
      start_date: {
        type: 'string',
        description: 'Start date (YYYY-MM-DD)',
      },
      end_date: {
        type: 'string',
        description: 'End date (YYYY-MM-DD)',
      },
      event_type_id: {
        type: 'string',
        description: 'Filter by event type UUID',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results (default: 50)',
      },
    },
    required: ['start_date', 'end_date'],
  },
  requiredScope: 'read',
  allowedConsumers: ['staff', 'parishioner', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    const limit = Math.min((args.limit as number) || 50, 200)

    let query = supabase
      .from('calendar_events')
      .select(
        `
        id,
        start_datetime,
        end_datetime,
        is_cancelled,
        is_all_day,
        location:locations(id, name, address),
        master_event:master_events(
          id,
          status,
          field_values,
          event_type:event_types(id, name, slug, system_type, icon)
        )
      `
      )
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .gte('start_datetime', `${args.start_date}T00:00:00`)
      .lte('start_datetime', `${args.end_date}T23:59:59`)
      .order('start_datetime')
      .limit(limit)

    if (args.event_type_id) {
      // Filter by event type through master_event
      query = query.eq('master_event.event_type_id', args.event_type_id as string)
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error: `Failed to fetch calendar events: ${error.message}` }
    }

    return {
      success: true,
      count: data?.length || 0,
      data: data || [],
    }
  },
}

// Parishioner: Get public calendar
const getPublicCalendar: UnifiedToolDefinition = {
  name: 'get_public_calendar',
  description: 'Get public calendar events (Mass times, parish events).',
  inputSchema: {
    type: 'object',
    properties: {
      start_date: {
        type: 'string',
        description: 'Start date (YYYY-MM-DD). Defaults to today.',
      },
      end_date: {
        type: 'string',
        description: 'End date (YYYY-MM-DD). Defaults to 30 days from start.',
      },
    },
  },
  requiredScope: 'read',
  allowedConsumers: ['parishioner'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    const today = new Date().toISOString().split('T')[0]
    const startDate = (args.start_date as string) || today
    const endDate =
      (args.end_date as string) ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('calendar_events')
      .select(
        `
        id,
        start_datetime,
        end_datetime,
        is_cancelled,
        is_all_day,
        show_on_calendar,
        location:locations(id, name),
        master_event:master_events(
          id,
          field_values,
          event_type:event_types(id, name, icon, show_on_public_calendar)
        )
      `
      )
      .eq('parish_id', context.parishId)
      .eq('show_on_calendar', true)
      .is('deleted_at', null)
      .gte('start_datetime', `${startDate}T00:00:00`)
      .lte('start_datetime', `${endDate}T23:59:59`)
      .order('start_datetime')
      .limit(100)

    if (error) {
      return { success: false, error: 'Could not retrieve calendar' }
    }

    // Filter to only public events
    const publicEvents = (data || []).filter((event) => {
      const masterEvent = event.master_event as {
        event_type: { show_on_public_calendar: boolean }
      }
      return masterEvent?.event_type?.show_on_public_calendar !== false
    })

    return {
      success: true,
      count: publicEvents.length,
      data: publicEvents,
    }
  },
}

// Parishioner: Get my schedule (assignments)
const getMySchedule: UnifiedToolDefinition = {
  name: 'get_my_schedule',
  description: 'Get your upcoming ministry assignments.',
  inputSchema: {
    type: 'object',
    properties: {
      start_date: {
        type: 'string',
        description: 'Start date (YYYY-MM-DD). Defaults to today.',
      },
      end_date: {
        type: 'string',
        description: 'End date (YYYY-MM-DD). Defaults to 30 days from start.',
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

    const today = new Date().toISOString().split('T')[0]
    const startDate = (args.start_date as string) || today
    const endDate =
      (args.end_date as string) ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Get assignments for this person
    const { data: assignments, error } = await supabase
      .from('people_event_assignments')
      .select(
        `
        id,
        notes,
        field_definition:input_field_definitions(id, name),
        calendar_event:calendar_events(
          id,
          start_datetime,
          end_datetime,
          location:locations(id, name)
        ),
        master_event:master_events(
          id,
          field_values,
          event_type:event_types(id, name, icon)
        )
      `
      )
      .eq('person_id', context.personId)
      .is('deleted_at', null)

    if (error) {
      return { success: false, error: 'Could not retrieve your schedule' }
    }

    // Filter to assignments within date range
    const upcomingAssignments = (assignments || []).filter((assignment) => {
      const calEvent = assignment.calendar_event as { start_datetime: string } | null
      if (!calEvent) return false
      const eventDate = calEvent.start_datetime.split('T')[0]
      return eventDate >= startDate && eventDate <= endDate
    })

    // Sort by date
    upcomingAssignments.sort((a, b) => {
      const dateA = (a.calendar_event as { start_datetime: string })?.start_datetime || ''
      const dateB = (b.calendar_event as { start_datetime: string })?.start_datetime || ''
      return dateA.localeCompare(dateB)
    })

    return {
      success: true,
      count: upcomingAssignments.length,
      data: upcomingAssignments,
    }
  },
}

// ============================================================================
// EXPORTS
// ============================================================================

export const eventsTools: UnifiedToolDefinition[] = [
  listEvents,
  getCalendarEvents,
  getPublicCalendar,
  getMySchedule,
]
