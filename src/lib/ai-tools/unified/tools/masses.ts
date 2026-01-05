/**
 * Masses Tools
 *
 * Tools for managing Mass liturgies and assignments.
 * Used by: Admin, Staff Chat, MCP Server
 */

import type { CategorizedTool } from '../types'
import { getSupabaseClient, setAuditContext } from '../db'

// ============================================================================
// READ TOOLS
// ============================================================================

const listMasses: CategorizedTool = {
  name: 'list_masses',
  description: 'List upcoming Masses with their assignments.',
  category: 'masses',
  inputSchema: {
    type: 'object',
    properties: {
      start_date: {
        type: 'string',
        description: 'Start date (YYYY-MM-DD). Defaults to today.',
      },
      end_date: {
        type: 'string',
        description: 'End date (YYYY-MM-DD). Defaults to 7 days from start.',
      },
      location_id: {
        type: 'string',
        description: 'Filter by location UUID',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results (default: 20)',
      },
    },
  },
  requiredScope: 'read',
  allowedConsumers: ['admin', 'staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    const today = new Date().toISOString().split('T')[0]
    const startDate = (args.start_date as string) || today
    const endDate =
      (args.end_date as string) ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const limit = Math.min((args.limit as number) || 20, 100)

    const { data: massEventTypes } = await supabase
      .from('event_types')
      .select('id')
      .eq('parish_id', context.parishId)
      .eq('system_type', 'mass-liturgy')
      .is('deleted_at', null)

    if (!massEventTypes || massEventTypes.length === 0) {
      return { success: true, count: 0, data: [], message: 'No mass event type configured' }
    }

    const massEventTypeIds = massEventTypes.map((et) => et.id)

    let query = supabase
      .from('calendar_events')
      .select(
        `
        id,
        start_datetime,
        end_datetime,
        is_cancelled,
        location:locations(id, name),
        master_event:master_events!inner(
          id,
          status,
          field_values,
          event_type_id,
          event_type:event_types(id, name, slug)
        )
      `
      )
      .eq('parish_id', context.parishId)
      .in('master_event.event_type_id', massEventTypeIds)
      .is('deleted_at', null)
      .gte('start_datetime', `${startDate}T00:00:00`)
      .lte('start_datetime', `${endDate}T23:59:59`)
      .order('start_datetime')
      .limit(limit)

    if (args.location_id) {
      query = query.eq('location_id', args.location_id as string)
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error: `Failed to fetch masses: ${error.message}` }
    }

    return {
      success: true,
      count: data?.length || 0,
      data: data || [],
    }
  },
}

const getMass: CategorizedTool = {
  name: 'get_mass',
  description: 'Get detailed information about a specific Mass including all assignments.',
  category: 'masses',
  inputSchema: {
    type: 'object',
    properties: {
      calendar_event_id: {
        type: 'string',
        description: 'The UUID of the calendar event (Mass occurrence)',
      },
    },
    required: ['calendar_event_id'],
  },
  requiredScope: 'read',
  allowedConsumers: ['admin', 'staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    const { data: calendarEvent, error: eventError } = await supabase
      .from('calendar_events')
      .select(
        `
        id,
        start_datetime,
        end_datetime,
        is_cancelled,
        location:locations(id, name, street, city, state),
        master_event:master_events(
          id,
          status,
          field_values,
          liturgical_color,
          event_type:event_types(id, name)
        )
      `
      )
      .eq('id', args.calendar_event_id as string)
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .single()

    if (eventError) {
      if (eventError.code === 'PGRST116') {
        return { success: false, error: 'Mass not found' }
      }
      return { success: false, error: `Failed to fetch mass: ${eventError.message}` }
    }

    const masterEventId = (calendarEvent.master_event as unknown as { id: string } | null)?.id
    const { data: assignments, error: assignmentsError } = await supabase
      .from('people_event_assignments')
      .select(
        `
        id,
        notes,
        field_definition:input_field_definitions(id, name, property_name),
        person:people(id, first_name, last_name, full_name, email, phone_number)
      `
      )
      .eq('master_event_id', masterEventId)
      .or(`calendar_event_id.eq.${args.calendar_event_id},calendar_event_id.is.null`)
      .is('deleted_at', null)

    if (assignmentsError) {
      return { success: false, error: `Failed to fetch assignments: ${assignmentsError.message}` }
    }

    return {
      success: true,
      data: {
        ...calendarEvent,
        assignments: assignments || [],
      },
    }
  },
}

const getMassAssignments: CategorizedTool = {
  name: 'get_mass_assignments',
  description: 'Get all role assignments for a specific Mass.',
  category: 'masses',
  inputSchema: {
    type: 'object',
    properties: {
      calendar_event_id: {
        type: 'string',
        description: 'The UUID of the calendar event (Mass occurrence)',
      },
    },
    required: ['calendar_event_id'],
  },
  requiredScope: 'read',
  allowedConsumers: ['admin', 'staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    const { data: calendarEvent, error: eventError } = await supabase
      .from('calendar_events')
      .select('id, master_event_id')
      .eq('id', args.calendar_event_id as string)
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .single()

    if (eventError || !calendarEvent) {
      return { success: false, error: 'Mass not found' }
    }

    const { data: assignments, error } = await supabase
      .from('people_event_assignments')
      .select(
        `
        id,
        notes,
        field_definition:input_field_definitions(id, name, property_name),
        person:people(id, first_name, last_name, full_name)
      `
      )
      .eq('master_event_id', calendarEvent.master_event_id)
      .or(`calendar_event_id.eq.${args.calendar_event_id},calendar_event_id.is.null`)
      .is('deleted_at', null)

    if (error) {
      return { success: false, error: `Failed to fetch assignments: ${error.message}` }
    }

    return {
      success: true,
      count: assignments?.length || 0,
      data: assignments || [],
    }
  },
}

const findMassAssignmentGaps: CategorizedTool = {
  name: 'find_mass_assignment_gaps',
  description: 'Find upcoming Masses that are missing required role assignments.',
  category: 'masses',
  inputSchema: {
    type: 'object',
    properties: {
      start_date: {
        type: 'string',
        description: 'Start date (YYYY-MM-DD). Defaults to today.',
      },
      end_date: {
        type: 'string',
        description: 'End date (YYYY-MM-DD). Defaults to 14 days from start.',
      },
      role_name: {
        type: 'string',
        description: 'Filter to a specific role name (e.g., "Lector", "Eucharistic Minister")',
      },
    },
  },
  requiredScope: 'read',
  allowedConsumers: ['admin', 'staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    const today = new Date().toISOString().split('T')[0]
    const startDate = (args.start_date as string) || today
    const endDate =
      (args.end_date as string) ||
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const { data: massEventTypes } = await supabase
      .from('event_types')
      .select('id')
      .eq('parish_id', context.parishId)
      .eq('system_type', 'mass-liturgy')
      .is('deleted_at', null)

    if (!massEventTypes || massEventTypes.length === 0) {
      return { success: true, count: 0, data: [], message: 'No mass event type configured' }
    }

    const massEventTypeIds = massEventTypes.map((et) => et.id)

    let fieldQuery = supabase
      .from('input_field_definitions')
      .select('id, name, property_name')
      .in('event_type_id', massEventTypeIds)
      .eq('type', 'person')
      .eq('required', true)
      .is('deleted_at', null)

    if (args.role_name) {
      fieldQuery = fieldQuery.ilike('name', `%${args.role_name}%`)
    }

    const { data: requiredFields } = await fieldQuery

    if (!requiredFields || requiredFields.length === 0) {
      return { success: true, count: 0, data: [], message: 'No required person fields defined' }
    }

    const { data: masses, error: massError } = await supabase
      .from('calendar_events')
      .select(
        `
        id,
        start_datetime,
        location:locations(name),
        master_event:master_events!inner(id, event_type_id)
      `
      )
      .eq('parish_id', context.parishId)
      .in('master_event.event_type_id', massEventTypeIds)
      .is('deleted_at', null)
      .gte('start_datetime', `${startDate}T00:00:00`)
      .lte('start_datetime', `${endDate}T23:59:59`)
      .order('start_datetime')

    if (massError) {
      return { success: false, error: `Failed to fetch masses: ${massError.message}` }
    }

    const gaps: Array<{
      calendar_event_id: string
      start_datetime: string
      location: string
      missing_roles: string[]
    }> = []

    for (const mass of masses || []) {
      const masterEventId = (mass.master_event as unknown as { id: string } | null)?.id

      const { data: assignments } = await supabase
        .from('people_event_assignments')
        .select('field_definition_id')
        .eq('master_event_id', masterEventId)
        .or(`calendar_event_id.eq.${mass.id},calendar_event_id.is.null`)
        .is('deleted_at', null)

      const assignedFieldIds = new Set((assignments || []).map((a) => a.field_definition_id))
      const missingRoles = requiredFields
        .filter((f) => !assignedFieldIds.has(f.id))
        .map((f) => f.name)

      if (missingRoles.length > 0) {
        gaps.push({
          calendar_event_id: mass.id,
          start_datetime: mass.start_datetime,
          location: (mass.location as unknown as { name: string } | null)?.name || 'Unknown',
          missing_roles: missingRoles,
        })
      }
    }

    return {
      success: true,
      count: gaps.length,
      data: gaps,
    }
  },
}

// ============================================================================
// WRITE TOOLS
// ============================================================================

const assignToMass: CategorizedTool = {
  name: 'assign_to_mass',
  description: 'Assign a person to a role for a specific Mass.',
  category: 'masses',
  inputSchema: {
    type: 'object',
    properties: {
      calendar_event_id: {
        type: 'string',
        description: 'The UUID of the calendar event (Mass occurrence)',
      },
      person_id: {
        type: 'string',
        description: 'The UUID of the person to assign',
      },
      field_definition_id: {
        type: 'string',
        description: 'The UUID of the role/field definition',
      },
      notes: {
        type: 'string',
        description: 'Optional notes for the assignment',
      },
    },
    required: ['calendar_event_id', 'person_id', 'field_definition_id'],
  },
  requiredScope: 'write',
  allowedConsumers: ['admin', 'staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    await setAuditContext(context)

    const { data: calendarEvent, error: eventError } = await supabase
      .from('calendar_events')
      .select('id, master_event_id, start_datetime')
      .eq('id', args.calendar_event_id as string)
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .single()

    if (eventError || !calendarEvent) {
      return { success: false, error: 'Mass not found' }
    }

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

    const { data: fieldDef, error: fieldError } = await supabase
      .from('input_field_definitions')
      .select('id, name')
      .eq('id', args.field_definition_id as string)
      .is('deleted_at', null)
      .single()

    if (fieldError || !fieldDef) {
      return { success: false, error: 'Role/field definition not found' }
    }

    const { data: existing } = await supabase
      .from('people_event_assignments')
      .select('id')
      .eq('master_event_id', calendarEvent.master_event_id)
      .eq('calendar_event_id', args.calendar_event_id as string)
      .eq('person_id', args.person_id as string)
      .eq('field_definition_id', args.field_definition_id as string)
      .is('deleted_at', null)
      .single()

    if (existing) {
      return {
        success: false,
        error: `${person.full_name} is already assigned to ${fieldDef.name} for this Mass`,
      }
    }

    const { error: insertError } = await supabase.from('people_event_assignments').insert({
      master_event_id: calendarEvent.master_event_id,
      calendar_event_id: args.calendar_event_id as string,
      person_id: args.person_id as string,
      field_definition_id: args.field_definition_id as string,
      notes: (args.notes as string) || null,
    })

    if (insertError) {
      return { success: false, error: `Failed to create assignment: ${insertError.message}` }
    }

    return {
      success: true,
      message: `Assigned ${person.full_name} as ${fieldDef.name}`,
      data: {
        calendar_event_id: args.calendar_event_id,
        person_id: person.id,
        person_name: person.full_name,
        role: fieldDef.name,
      },
    }
  },
}

const updateMassTime: CategorizedTool = {
  name: 'update_mass_time',
  description:
    'Update the date/time of a specific Mass. Can change when the Mass occurs.',
  category: 'masses',
  inputSchema: {
    type: 'object',
    properties: {
      calendar_event_id: {
        type: 'string',
        description: 'The UUID of the calendar event (Mass occurrence) to update',
      },
      start_datetime: {
        type: 'string',
        description:
          'New start date/time in ISO format (e.g., "2024-01-15T10:00:00")',
      },
      end_datetime: {
        type: 'string',
        description:
          'Optional new end date/time in ISO format. If not provided, duration is preserved.',
      },
      location_id: {
        type: 'string',
        description: 'Optional new location UUID for the Mass',
      },
    },
    required: ['calendar_event_id', 'start_datetime'],
  },
  requiredScope: 'write',
  allowedConsumers: ['admin', 'staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    await setAuditContext(context)

    const { data: calendarEvent, error: fetchError } = await supabase
      .from('calendar_events')
      .select(
        `
        id,
        start_datetime,
        end_datetime,
        location_id,
        master_event:master_events(
          id,
          event_type:event_types(name)
        )
      `
      )
      .eq('id', args.calendar_event_id as string)
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !calendarEvent) {
      return { success: false, error: 'Mass not found' }
    }

    const oldStart = new Date(calendarEvent.start_datetime)
    const newStart = new Date(args.start_datetime as string)

    // Calculate new end time - preserve duration if not explicitly set
    let newEnd: Date
    if (args.end_datetime) {
      newEnd = new Date(args.end_datetime as string)
    } else if (calendarEvent.end_datetime) {
      const oldEnd = new Date(calendarEvent.end_datetime)
      const durationMs = oldEnd.getTime() - oldStart.getTime()
      newEnd = new Date(newStart.getTime() + durationMs)
    } else {
      // Default to 1 hour if no end time exists
      newEnd = new Date(newStart.getTime() + 60 * 60 * 1000)
    }

    const updateData: Record<string, unknown> = {
      start_datetime: newStart.toISOString(),
      end_datetime: newEnd.toISOString(),
    }

    if (args.location_id) {
      updateData.location_id = args.location_id
    }

    const { error: updateError } = await supabase
      .from('calendar_events')
      .update(updateData)
      .eq('id', args.calendar_event_id as string)

    if (updateError) {
      return { success: false, error: `Failed to update mass time: ${updateError.message}` }
    }

    const eventTypeName =
      (calendarEvent.master_event as unknown as { event_type: { name: string } } | null)?.event_type
        ?.name || 'Mass'

    const formatDate = (date: Date) =>
      date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    const formatTime = (date: Date) =>
      date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

    return {
      success: true,
      message: `Updated ${eventTypeName} from ${formatDate(oldStart)} at ${formatTime(oldStart)} to ${formatDate(newStart)} at ${formatTime(newStart)}`,
      data: {
        calendar_event_id: args.calendar_event_id,
        old_datetime: calendarEvent.start_datetime,
        new_datetime: newStart.toISOString(),
        new_end_datetime: newEnd.toISOString(),
      },
    }
  },
}

const cancelMass: CategorizedTool = {
  name: 'cancel_mass',
  description: 'Cancel a specific Mass occurrence. Can optionally be uncancelled.',
  category: 'masses',
  inputSchema: {
    type: 'object',
    properties: {
      calendar_event_id: {
        type: 'string',
        description: 'The UUID of the calendar event (Mass occurrence) to cancel',
      },
      cancel: {
        type: 'boolean',
        description: 'True to cancel, false to uncancel. Defaults to true.',
      },
      reason: {
        type: 'string',
        description: 'Optional reason for cancellation',
      },
    },
    required: ['calendar_event_id'],
  },
  requiredScope: 'write',
  allowedConsumers: ['admin', 'staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    await setAuditContext(context)

    const shouldCancel = args.cancel !== false

    const { data: calendarEvent, error: fetchError } = await supabase
      .from('calendar_events')
      .select(
        `
        id,
        start_datetime,
        is_cancelled,
        master_event:master_events(
          id,
          event_type:event_types(name)
        )
      `
      )
      .eq('id', args.calendar_event_id as string)
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !calendarEvent) {
      return { success: false, error: 'Mass not found' }
    }

    if (calendarEvent.is_cancelled === shouldCancel) {
      const status = shouldCancel ? 'already cancelled' : 'not cancelled'
      return { success: false, error: `This Mass is ${status}` }
    }

    const { error: updateError } = await supabase
      .from('calendar_events')
      .update({ is_cancelled: shouldCancel })
      .eq('id', args.calendar_event_id as string)

    if (updateError) {
      return { success: false, error: `Failed to update mass: ${updateError.message}` }
    }

    const eventTypeName =
      (calendarEvent.master_event as unknown as { event_type: { name: string } } | null)?.event_type
        ?.name || 'Mass'
    const massDate = new Date(calendarEvent.start_datetime).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
    const massTime = new Date(calendarEvent.start_datetime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })

    const action = shouldCancel ? 'Cancelled' : 'Restored'
    let message = `${action} ${eventTypeName} on ${massDate} at ${massTime}`
    if (shouldCancel && args.reason) {
      message += `. Reason: ${args.reason}`
    }

    return {
      success: true,
      message,
      data: {
        calendar_event_id: args.calendar_event_id,
        is_cancelled: shouldCancel,
      },
    }
  },
}

const removeMassAssignment: CategorizedTool = {
  name: 'remove_mass_assignment',
  description: 'Remove a person from a Mass assignment.',
  category: 'masses',
  inputSchema: {
    type: 'object',
    properties: {
      assignment_id: {
        type: 'string',
        description: 'The UUID of the assignment to remove',
      },
    },
    required: ['assignment_id'],
  },
  requiredScope: 'write',
  allowedConsumers: ['admin', 'staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    await setAuditContext(context)

    const { data: assignment, error: fetchError } = await supabase
      .from('people_event_assignments')
      .select(
        `
        id,
        person:people(full_name),
        field_definition:input_field_definitions(name)
      `
      )
      .eq('id', args.assignment_id as string)
      .is('deleted_at', null)
      .single()

    if (fetchError || !assignment) {
      return { success: false, error: 'Assignment not found' }
    }

    const { error: deleteError } = await supabase
      .from('people_event_assignments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', args.assignment_id as string)

    if (deleteError) {
      return { success: false, error: `Failed to remove assignment: ${deleteError.message}` }
    }

    const personName = (assignment.person as unknown as { full_name: string } | null)?.full_name || 'Person'
    const roleName = (assignment.field_definition as unknown as { name: string } | null)?.name || 'role'

    return {
      success: true,
      message: `Removed ${personName} from ${roleName}`,
      data: { id: args.assignment_id },
    }
  },
}

// ============================================================================
// EXPORTS
// ============================================================================

export const massesTools: CategorizedTool[] = [
  listMasses,
  getMass,
  getMassAssignments,
  findMassAssignmentGaps,
  assignToMass,
  updateMassTime,
  cancelMass,
  removeMassAssignment,
]
