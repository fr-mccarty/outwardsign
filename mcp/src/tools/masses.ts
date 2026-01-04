/**
 * Masses Tools
 *
 * Tools for managing Mass liturgies and assignments.
 * Used by: Staff Chat, MCP Server
 */

import type { UnifiedToolDefinition } from '../types.js'
import { getSupabaseClient, setMCPAuditContext } from '../db.js'

// ============================================================================
// READ TOOLS
// ============================================================================

const listMasses: UnifiedToolDefinition = {
  name: 'list_masses',
  description: 'List upcoming Masses with their assignments.',
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
  allowedConsumers: ['staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    const today = new Date().toISOString().split('T')[0]
    const startDate = (args.start_date as string) || today
    const endDate =
      (args.end_date as string) ||
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const limit = Math.min((args.limit as number) || 20, 100)

    // Get mass-liturgy event type
    const { data: massEventType } = await supabase
      .from('event_types')
      .select('id')
      .eq('parish_id', context.parishId)
      .eq('system_type', 'mass-liturgy')
      .is('deleted_at', null)
      .single()

    if (!massEventType) {
      return { success: true, count: 0, data: [], message: 'No mass event type configured' }
    }

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
          event_type_id
        )
      `
      )
      .eq('parish_id', context.parishId)
      .eq('master_event.event_type_id', massEventType.id)
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

const getMass: UnifiedToolDefinition = {
  name: 'get_mass',
  description: 'Get detailed information about a specific Mass including all assignments.',
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
  allowedConsumers: ['staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    // Get the calendar event with master event details
    const { data: calendarEvent, error: eventError } = await supabase
      .from('calendar_events')
      .select(
        `
        id,
        start_datetime,
        end_datetime,
        is_cancelled,
        location:locations(id, name, address),
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

    // Get assignments for this calendar event
    const masterEventId = (calendarEvent.master_event as { id: string })?.id
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

const getMassAssignments: UnifiedToolDefinition = {
  name: 'get_mass_assignments',
  description: 'Get all role assignments for a specific Mass.',
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
  allowedConsumers: ['staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    // First get the master_event_id
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

const findMassAssignmentGaps: UnifiedToolDefinition = {
  name: 'find_mass_assignment_gaps',
  description: 'Find upcoming Masses that are missing required role assignments.',
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
  allowedConsumers: ['staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    const today = new Date().toISOString().split('T')[0]
    const startDate = (args.start_date as string) || today
    const endDate =
      (args.end_date as string) ||
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Get mass event type
    const { data: massEventType } = await supabase
      .from('event_types')
      .select('id')
      .eq('parish_id', context.parishId)
      .eq('system_type', 'mass-liturgy')
      .is('deleted_at', null)
      .single()

    if (!massEventType) {
      return { success: true, count: 0, data: [], message: 'No mass event type configured' }
    }

    // Get required person fields for mass
    let fieldQuery = supabase
      .from('input_field_definitions')
      .select('id, name, property_name')
      .eq('event_type_id', massEventType.id)
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

    // Get upcoming masses
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
      .eq('master_event.event_type_id', massEventType.id)
      .is('deleted_at', null)
      .gte('start_datetime', `${startDate}T00:00:00`)
      .lte('start_datetime', `${endDate}T23:59:59`)
      .order('start_datetime')

    if (massError) {
      return { success: false, error: `Failed to fetch masses: ${massError.message}` }
    }

    // For each mass, check which required fields are missing assignments
    const gaps: Array<{
      calendar_event_id: string
      start_datetime: string
      location: string
      missing_roles: string[]
    }> = []

    for (const mass of masses || []) {
      const masterEventId = (mass.master_event as { id: string })?.id

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
          location: (mass.location as { name: string })?.name || 'Unknown',
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

const assignToMass: UnifiedToolDefinition = {
  name: 'assign_to_mass',
  description: 'Assign a person to a role for a specific Mass.',
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
  allowedConsumers: ['staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    await setMCPAuditContext(context.userId!, context.userEmail || undefined)

    // Get calendar event and master event
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

    // Verify person exists
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

    // Verify field definition exists
    const { data: fieldDef, error: fieldError } = await supabase
      .from('input_field_definitions')
      .select('id, name')
      .eq('id', args.field_definition_id as string)
      .is('deleted_at', null)
      .single()

    if (fieldError || !fieldDef) {
      return { success: false, error: 'Role/field definition not found' }
    }

    // Check for existing assignment
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

    // Create assignment
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

const removeMassAssignment: UnifiedToolDefinition = {
  name: 'remove_mass_assignment',
  description: 'Remove a person from a Mass assignment.',
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
  allowedConsumers: ['staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    await setMCPAuditContext(context.userId!, context.userEmail || undefined)

    // Get assignment details
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

    const personName = (assignment.person as { full_name: string })?.full_name || 'Person'
    const roleName = (assignment.field_definition as { name: string })?.name || 'role'

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

export const massesTools: UnifiedToolDefinition[] = [
  // Read tools
  listMasses,
  getMass,
  getMassAssignments,
  findMassAssignmentGaps,
  // Write tools
  assignToMass,
  removeMassAssignment,
]
