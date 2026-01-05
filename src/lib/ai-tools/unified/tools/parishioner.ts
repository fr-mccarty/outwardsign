/**
 * Parishioner Tools
 *
 * Self-service tools for parishioners to manage their own information.
 * Used by: Parishioner Chat
 */

import type { CategorizedTool } from '../types'
import { getSupabaseClient, setAuditContext } from '../db'

// ============================================================================
// SCHEDULE & ASSIGNMENTS
// ============================================================================

const getMySchedule: CategorizedTool = {
  name: 'get_my_schedule',
  description:
    'Get your upcoming ministry assignments and commitments. Use when asking about "my schedule", "when am I scheduled", or what you have coming up.',
  category: 'parishioner',
  inputSchema: {
    type: 'object',
    properties: {
      days_ahead: {
        type: 'number',
        description: 'Number of days ahead to look (default: 30)',
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
    const daysAhead = (args.days_ahead as number) || 30
    const startDate = new Date().toISOString().split('T')[0]
    const endDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    const { data: assignments, error } = await supabase
      .from('people_event_assignments')
      .select(`
        id,
        notes,
        field_definition:input_field_definitions(name),
        calendar_event:calendar_events(
          id,
          start_datetime,
          end_datetime,
          location:locations(name)
        ),
        master_event:master_events(
          id,
          event_type:event_types(name)
        )
      `)
      .eq('person_id', context.personId)
      .is('deleted_at', null)

    if (error) {
      return { success: false, error: 'Could not retrieve your schedule' }
    }

    // Filter to upcoming events
    const upcomingAssignments = assignments
      ?.filter((a: any) => {
        const calEvent = a.calendar_event
        if (!calEvent?.start_datetime) return false
        const eventDate = calEvent.start_datetime.split('T')[0]
        return eventDate >= startDate && eventDate <= endDate
      })
      .map((a: any) => ({
        id: a.id,
        role: a.field_definition?.name || 'Unknown Role',
        event_type: a.master_event?.event_type?.name || 'Event',
        datetime: a.calendar_event?.start_datetime,
        location: a.calendar_event?.location?.name,
        notes: a.notes,
      }))
      .sort((a: any, b: any) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())

    if (!upcomingAssignments || upcomingAssignments.length === 0) {
      return {
        success: true,
        message: 'No upcoming assignments found',
        count: 0,
        data: [],
      }
    }

    return {
      success: true,
      count: upcomingAssignments.length,
      data: upcomingAssignments,
    }
  },
}

// ============================================================================
// CALENDAR & EVENTS (PUBLIC)
// ============================================================================

const getPublicCalendar: CategorizedTool = {
  name: 'get_public_calendar',
  description:
    'Get public parish events and Mass times. Use when asking "what\'s on the calendar", "what\'s happening this weekend", or about parish events.',
  category: 'parishioner',
  inputSchema: {
    type: 'object',
    properties: {
      date: {
        type: 'string',
        description: 'Specific date in YYYY-MM-DD format (optional, defaults to upcoming events)',
      },
      days_ahead: {
        type: 'number',
        description: 'Number of days ahead to show (default: 7)',
      },
    },
  },
  requiredScope: 'read',
  allowedConsumers: ['parishioner'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    const filterDate = args.date as string | undefined
    const daysAhead = (args.days_ahead as number) || 7
    const today = new Date().toISOString().split('T')[0]
    const endDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    let query = supabase
      .from('calendar_events')
      .select(`
        id,
        start_datetime,
        end_datetime,
        is_cancelled,
        show_on_calendar,
        location:locations(name, street, city),
        master_event:master_events(
          id,
          event_type:event_types(name, icon)
        )
      `)
      .eq('parish_id', context.parishId)
      .eq('show_on_calendar', true)
      .is('deleted_at', null)
      .order('start_datetime', { ascending: true })

    if (filterDate) {
      query = query
        .gte('start_datetime', `${filterDate}T00:00:00`)
        .lt('start_datetime', `${filterDate}T23:59:59`)
    } else {
      query = query
        .gte('start_datetime', `${today}T00:00:00`)
        .lte('start_datetime', `${endDate}T23:59:59`)
    }

    const { data: events, error } = await query.limit(20)

    if (error) {
      return { success: false, error: 'Could not retrieve calendar events' }
    }

    const formattedEvents =
      events?.map((e: any) => ({
        id: e.id,
        title: e.master_event?.event_type?.name || 'Event',
        start_datetime: e.start_datetime,
        end_datetime: e.end_datetime,
        location: e.location?.name,
        address: e.location ? `${e.location.street}, ${e.location.city}` : undefined,
        is_cancelled: e.is_cancelled,
      })) || []

    return {
      success: true,
      count: formattedEvents.length,
      data: formattedEvents,
    }
  },
}

const getMassTimes: CategorizedTool = {
  name: 'get_mass_times',
  description:
    'Get the parish Mass schedule. Use when asking about Mass times, "when is Mass", or weekend schedule.',
  category: 'parishioner',
  inputSchema: {
    type: 'object',
    properties: {
      day_of_week: {
        type: 'string',
        enum: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
        description: 'Filter by day of week (optional)',
      },
    },
  },
  requiredScope: 'read',
  allowedConsumers: ['parishioner'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    const dayFilter = args.day_of_week as string | undefined

    let query = supabase
      .from('mass_times_templates')
      .select(`
        id,
        name,
        day_of_week,
        is_active,
        items:mass_times_template_items(
          id,
          time,
          day_type,
          location:locations(name)
        )
      `)
      .eq('parish_id', context.parishId)
      .eq('is_active', true)

    if (dayFilter) {
      query = query.eq('day_of_week', dayFilter)
    }

    const { data: templates, error } = await query

    if (error) {
      return { success: false, error: 'Could not retrieve Mass times' }
    }

    const massSchedule =
      templates
        ?.flatMap((t: any) =>
          t.items?.map((item: any) => ({
            day: t.day_of_week,
            time: item.time,
            location: item.location?.name,
            day_type: item.day_type,
          })) || []
        )
        .sort((a: any, b: any) => {
          const dayOrder = [
            'SUNDAY',
            'MONDAY',
            'TUESDAY',
            'WEDNESDAY',
            'THURSDAY',
            'FRIDAY',
            'SATURDAY',
          ]
          return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
        }) || []

    return {
      success: true,
      count: massSchedule.length,
      data: massSchedule,
    }
  },
}

const getLiturgicalInfo: CategorizedTool = {
  name: 'get_liturgical_info',
  description:
    'Get liturgical calendar information for a date (feast day, liturgical color, readings). Use when asking about a specific feast, "what feast is today", or liturgical information.',
  category: 'parishioner',
  inputSchema: {
    type: 'object',
    properties: {
      date: {
        type: 'string',
        description: 'Date in YYYY-MM-DD format (defaults to today)',
      },
    },
  },
  requiredScope: 'read',
  allowedConsumers: ['parishioner'],
  async execute(args) {
    const supabase = getSupabaseClient()
    const date = (args.date as string) || new Date().toISOString().split('T')[0]

    const { data: liturgicalData, error } = await supabase
      .from('liturgical_calendar')
      .select('*')
      .eq('date', date)
      .eq('locale', 'en_US')
      .limit(1)
      .single()

    if (error || !liturgicalData) {
      return {
        success: true,
        message: `No liturgical information found for ${date}`,
        data: { date, info: null },
      }
    }

    const eventData = liturgicalData.event_data as any
    return {
      success: true,
      data: {
        date,
        name: eventData?.name,
        color: eventData?.color?.[0],
        grade: eventData?.grade_lcl,
        season: eventData?.liturgical_season_lcl,
        readings: eventData?.readings,
      },
    }
  },
}

// ============================================================================
// MY INFORMATION
// ============================================================================

const getMyInfo: CategorizedTool = {
  name: 'get_my_info',
  description:
    'Get your profile information (name, email, phone, address). Use when asking about "my info on file", "what\'s my email", or your profile.',
  category: 'parishioner',
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

    const { data: person, error } = await supabase
      .from('people')
      .select(
        'id, first_name, last_name, full_name, email, phone_number, street, city, state, zipcode, preferred_language'
      )
      .eq('id', context.personId)
      .single()

    if (error || !person) {
      return { success: false, error: 'Profile not found' }
    }

    return {
      success: true,
      data: {
        name: person.full_name,
        email: person.email,
        phone: person.phone_number,
        address: person.street
          ? `${person.street}, ${person.city}, ${person.state} ${person.zipcode}`
          : null,
        language: person.preferred_language,
      },
    }
  },
}

const updateMyInfo: CategorizedTool = {
  name: 'update_my_info',
  description:
    'Update your personal information (phone, email, address, language). Only updates the fields you provide.',
  category: 'parishioner',
  inputSchema: {
    type: 'object',
    properties: {
      phone_number: {
        type: 'string',
        description: 'New phone number',
      },
      email: {
        type: 'string',
        description: 'New email address',
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
        description: 'State',
      },
      zipcode: {
        type: 'string',
        description: 'Zip code',
      },
      preferred_language: {
        type: 'string',
        enum: ['en', 'es'],
        description: 'Preferred language (English or Spanish)',
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
    await setAuditContext(context)

    const updateData: Record<string, unknown> = {}
    const fields = [
      'phone_number',
      'email',
      'street',
      'city',
      'state',
      'zipcode',
      'preferred_language',
    ]

    for (const field of fields) {
      if (args[field] !== undefined) {
        updateData[field] = args[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return { success: false, error: 'No fields provided to update' }
    }

    const { error } = await supabase
      .from('people')
      .update(updateData)
      .eq('id', context.personId)
      .select()
      .single()

    if (error) {
      return { success: false, error: `Failed to update info: ${error.message}` }
    }

    const updatedFields = Object.keys(updateData).join(', ')
    return {
      success: true,
      message: `Successfully updated: ${updatedFields}`,
      data: { updated_fields: Object.keys(updateData) },
    }
  },
}

// ============================================================================
// MY FAMILY
// ============================================================================

const getMyFamily: CategorizedTool = {
  name: 'get_my_family',
  description:
    'Get your family members. Use when asking "who is in my family", about family members, or "who is the primary contact".',
  category: 'parishioner',
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

    const { data: memberships, error } = await supabase
      .from('family_members')
      .select(`
        id,
        relationship,
        is_primary_contact,
        family:families(
          id,
          family_name,
          members:family_members(
            id,
            relationship,
            is_primary_contact,
            person:people(id, full_name, phone_number, email)
          )
        )
      `)
      .eq('person_id', context.personId)

    if (error) {
      return { success: false, error: 'Could not retrieve family information' }
    }

    if (!memberships || memberships.length === 0) {
      return {
        success: true,
        message: 'You are not currently associated with any family in our records.',
        data: [],
      }
    }

    const families = memberships.map((m: any) => ({
      family_name: m.family?.family_name,
      my_relationship: m.relationship,
      am_primary_contact: m.is_primary_contact,
      members:
        m.family?.members?.map((member: any) => ({
          name: member.person?.full_name,
          relationship: member.relationship,
          is_primary_contact: member.is_primary_contact,
        })) || [],
    }))

    return {
      success: true,
      count: families.length,
      data: families,
    }
  },
}

// ============================================================================
// MY GROUPS & MINISTRIES
// ============================================================================

const getMyGroups: CategorizedTool = {
  name: 'get_my_groups',
  description:
    'Get groups and ministries you belong to. Use when asking "what groups am I in", about your ministries, or ministry involvement.',
  category: 'parishioner',
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

    const { data: memberships, error } = await supabase
      .from('group_members')
      .select(`
        id,
        joined_at,
        group:groups(id, name, description, is_active),
        group_role:group_roles(name)
      `)
      .eq('person_id', context.personId)

    if (error) {
      return { success: false, error: 'Could not retrieve group memberships' }
    }

    if (!memberships || memberships.length === 0) {
      return {
        success: true,
        message: 'You are not currently a member of any groups or ministries.',
        data: [],
      }
    }

    const groups = memberships.map((m: any) => ({
      id: m.group?.id,
      name: m.group?.name,
      description: m.group?.description,
      role: m.group_role?.name,
      joined_at: m.joined_at,
      is_active: m.group?.is_active,
    }))

    return {
      success: true,
      count: groups.length,
      data: groups,
    }
  },
}

const listAvailableGroups: CategorizedTool = {
  name: 'list_available_groups',
  description:
    'List all available groups you can join. Use when asking what groups are available or ministry options.',
  category: 'parishioner',
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

    // Get all active groups
    const { data: allGroups, error: groupsError } = await supabase
      .from('groups')
      .select('id, name, description')
      .eq('parish_id', context.parishId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('name')

    if (groupsError) {
      return { success: false, error: 'Could not retrieve available groups' }
    }

    // Get groups the user is already in
    const { data: myMemberships } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('person_id', context.personId)

    const myGroupIds = new Set(myMemberships?.map((m: any) => m.group_id) || [])

    const availableGroups =
      allGroups?.map((g: any) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        already_member: myGroupIds.has(g.id),
      })) || []

    return {
      success: true,
      count: availableGroups.length,
      data: availableGroups,
    }
  },
}

const joinGroup: CategorizedTool = {
  name: 'join_group',
  description:
    'Join a group or ministry. Use when wanting to "add me to the choir", "join the lector ministry", or sign up for a group.',
  category: 'parishioner',
  inputSchema: {
    type: 'object',
    properties: {
      group_id: {
        type: 'string',
        description: 'The ID of the group to join',
      },
    },
    required: ['group_id'],
  },
  requiredScope: 'write_self',
  allowedConsumers: ['parishioner'],
  async execute(args, context) {
    if (!context.personId) {
      return { success: false, error: 'Person context required' }
    }

    const supabase = getSupabaseClient()
    await setAuditContext(context)

    const groupId = args.group_id as string

    // Check if group exists and is active
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, name, is_active')
      .eq('id', groupId)
      .eq('parish_id', context.parishId)
      .single()

    if (groupError || !group) {
      return { success: false, error: 'Group not found' }
    }

    if (!group.is_active) {
      return { success: false, error: 'This group is not currently active' }
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('person_id', context.personId)
      .single()

    if (existing) {
      return { success: false, error: `You are already a member of ${group.name}` }
    }

    const { error: insertError } = await supabase.from('group_members').insert({
      group_id: groupId,
      person_id: context.personId,
    })

    if (insertError) {
      return { success: false, error: `Failed to join group: ${insertError.message}` }
    }

    return {
      success: true,
      message: `Successfully joined ${group.name}`,
      data: { group_id: groupId, group_name: group.name },
    }
  },
}

const leaveGroup: CategorizedTool = {
  name: 'leave_group',
  description:
    'Leave a group or ministry. Use when wanting to "leave the usher group", "remove me from the choir", or unsubscribe from a ministry.',
  category: 'parishioner',
  inputSchema: {
    type: 'object',
    properties: {
      group_id: {
        type: 'string',
        description: 'The ID of the group to leave',
      },
    },
    required: ['group_id'],
  },
  requiredScope: 'write_self',
  allowedConsumers: ['parishioner'],
  async execute(args, context) {
    if (!context.personId) {
      return { success: false, error: 'Person context required' }
    }

    const supabase = getSupabaseClient()
    await setAuditContext(context)

    const groupId = args.group_id as string

    // Get group name
    const { data: group } = await supabase
      .from('groups')
      .select('name')
      .eq('id', groupId)
      .single()

    // Check if member
    const { data: membership } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('person_id', context.personId)
      .single()

    if (!membership) {
      return { success: false, error: 'You are not a member of this group' }
    }

    const { error: deleteError } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('person_id', context.personId)

    if (deleteError) {
      return { success: false, error: `Failed to leave group: ${deleteError.message}` }
    }

    return {
      success: true,
      message: `Successfully left ${group?.name || 'the group'}`,
      data: { group_id: groupId },
    }
  },
}

// ============================================================================
// CONTENT & RESOURCES
// ============================================================================

const searchReadings: CategorizedTool = {
  name: 'search_readings',
  description:
    'Search the content library for readings, prayers, or blessings. Use when asking for readings, prayers, or content for events.',
  category: 'parishioner',
  inputSchema: {
    type: 'object',
    properties: {
      search: {
        type: 'string',
        description: 'Search term to find content by title or text',
      },
      language: {
        type: 'string',
        enum: ['en', 'es'],
        description: 'Filter by language (optional)',
      },
      limit: {
        type: 'number',
        description: 'Maximum results to return (default: 10)',
      },
    },
  },
  requiredScope: 'read',
  allowedConsumers: ['parishioner'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    const search = args.search as string | undefined
    const language = args.language as 'en' | 'es' | undefined
    const limit = (args.limit as number) || 10

    let query = supabase
      .from('contents')
      .select('id, title, description, language')
      .eq('parish_id', context.parishId)
      .order('title')
      .limit(limit)

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (language) {
      query = query.eq('language', language)
    }

    const { data: contents, error } = await query

    if (error) {
      return { success: false, error: 'Could not search content' }
    }

    return {
      success: true,
      count: contents?.length || 0,
      data:
        contents?.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          language: c.language,
        })) || [],
    }
  },
}

// ============================================================================
// LOCATIONS
// ============================================================================

const getParishLocations: CategorizedTool = {
  name: 'get_parish_locations',
  description:
    'Get parish locations and addresses. Use when asking about church address, where things are, or location information.',
  category: 'parishioner',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  requiredScope: 'read',
  allowedConsumers: ['parishioner'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    const { data: locations, error } = await supabase
      .from('locations')
      .select('id, name, description, street, city, state, phone_number')
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .order('name')

    if (error) {
      return { success: false, error: 'Could not retrieve locations' }
    }

    return {
      success: true,
      count: locations?.length || 0,
      data:
        locations?.map((l: any) => ({
          name: l.name,
          description: l.description,
          address: `${l.street}, ${l.city}, ${l.state}`,
          phone: l.phone_number,
        })) || [],
    }
  },
}

// ============================================================================
// EXPORTS
// ============================================================================

export const parishionerTools: CategorizedTool[] = [
  // Schedule & Assignments
  getMySchedule,
  // Calendar & Events
  getPublicCalendar,
  getMassTimes,
  getLiturgicalInfo,
  // My Information
  getMyInfo,
  updateMyInfo,
  // My Family
  getMyFamily,
  // My Groups
  getMyGroups,
  listAvailableGroups,
  joinGroup,
  leaveGroup,
  // Content
  searchReadings,
  // Locations
  getParishLocations,
]
