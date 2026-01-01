'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import Anthropic from '@anthropic-ai/sdk'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { validateCsrfToken } from '@/lib/csrf'
import { CLAUDE_MODEL } from '@/lib/constants/ai'
import { logAIActivity } from '@/lib/ai-tools/shared'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// ============================================================================
// TOOL DEFINITIONS - Based on ai-conversation-parishioner.md guidelines
// ============================================================================

const tools: Anthropic.Tool[] = [
  // ============================================================================
  // SCHEDULE & ASSIGNMENTS
  // ============================================================================
  {
    name: 'get_my_schedule',
    description:
      'Get upcoming ministry assignments and commitments. Use when user asks about their schedule, assignments, "when am I scheduled", or what they have coming up.',
    input_schema: {
      type: 'object',
      properties: {
        days_ahead: {
          type: 'number',
          description: 'Number of days ahead to look (default: 30)',
        },
      },
    },
  },

  // ============================================================================
  // CALENDAR & EVENTS (PUBLIC)
  // ============================================================================
  {
    name: 'get_public_calendar',
    description:
      'Get public parish events and Mass times. Use when user asks "what\'s on the calendar", "what\'s happening this weekend", or about parish events.',
    input_schema: {
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
  },
  {
    name: 'get_mass_times',
    description:
      'Get the parish Mass schedule. Use when user asks about Mass times, "when is Mass", or weekend schedule.',
    input_schema: {
      type: 'object',
      properties: {
        day_of_week: {
          type: 'string',
          enum: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
          description: 'Filter by day of week (optional)',
        },
      },
    },
  },
  {
    name: 'get_liturgical_info',
    description:
      'Get liturgical calendar information for a date (feast day, liturgical color, readings). Use when user asks about a specific feast, "what feast is today", or liturgical information.',
    input_schema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format (defaults to today)',
        },
      },
    },
  },

  // ============================================================================
  // MY INFORMATION
  // ============================================================================
  {
    name: 'get_my_info',
    description:
      'Get the user\'s own profile information (name, email, phone, address). Use when user asks about their info on file, "what\'s my email", or their profile.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },

  // ============================================================================
  // MY FAMILY
  // ============================================================================
  {
    name: 'get_my_family',
    description:
      'Get the user\'s family members. Use when user asks "who is in my family", about family members, or "who is the primary contact".',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },

  // ============================================================================
  // MY GROUPS & MINISTRIES
  // ============================================================================
  {
    name: 'get_my_groups',
    description:
      'Get groups and ministries the user belongs to. Use when user asks "what groups am I in", about their ministries, or ministry involvement.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },

  // ============================================================================
  // CONTENT & RESOURCES
  // ============================================================================
  {
    name: 'search_readings',
    description:
      'Search the content library for readings, prayers, or blessings. Use when user asks for readings, prayers, or content for events.',
    input_schema: {
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
  },

  // ============================================================================
  // LOCATIONS
  // ============================================================================
  {
    name: 'get_parish_locations',
    description:
      'Get parish locations and addresses. Use when user asks about church address, where things are, or location information.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },

  // ============================================================================
  // MY AVAILABILITY (Mutations)
  // ============================================================================
  {
    name: 'add_my_blackout',
    description:
      'Mark dates when the user is unavailable. Use when user wants to block out dates, "mark me as unavailable", or indicate they cannot serve on certain dates.',
    input_schema: {
      type: 'object',
      properties: {
        start_date: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format',
        },
        end_date: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format',
        },
        reason: {
          type: 'string',
          description: 'Optional reason for unavailability (e.g., "vacation", "out of town")',
        },
      },
      required: ['start_date', 'end_date'],
    },
  },
  {
    name: 'remove_my_blackout',
    description:
      'Remove one of the user\'s blackout dates. Use when user wants to remove unavailability, "cancel my blackout", or indicate they are now available.',
    input_schema: {
      type: 'object',
      properties: {
        blackout_id: {
          type: 'string',
          description: 'The ID of the blackout date to remove',
        },
      },
      required: ['blackout_id'],
    },
  },
  {
    name: 'get_my_blackouts',
    description:
      'Get the user\'s current blackout dates. Use when user asks about their unavailable dates or wants to see when they\'re blocked out.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },

  // ============================================================================
  // MY PERSONAL INFO (Mutations)
  // ============================================================================
  {
    name: 'update_my_info',
    description:
      'Update the user\'s personal information (phone, email, address, language). Use when user wants to change their contact info. Only updates provided fields.',
    input_schema: {
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
  },

  // ============================================================================
  // MY GROUP MEMBERSHIP (Mutations)
  // ============================================================================
  {
    name: 'join_group',
    description:
      'Join a group or ministry. Use when user wants to "add me to the choir", "join the lector ministry", or sign up for a group.',
    input_schema: {
      type: 'object',
      properties: {
        group_id: {
          type: 'string',
          description: 'The ID of the group to join',
        },
      },
      required: ['group_id'],
    },
  },
  {
    name: 'leave_group',
    description:
      'Leave a group or ministry. Use when user wants to "leave the usher group", "remove me from the choir", or unsubscribe from a ministry.',
    input_schema: {
      type: 'object',
      properties: {
        group_id: {
          type: 'string',
          description: 'The ID of the group to leave',
        },
      },
      required: ['group_id'],
    },
  },
  {
    name: 'list_available_groups',
    description:
      'List all available groups the user can join. Use when user asks what groups are available or wants to see ministry options.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
]

// ============================================================================
// TOOL EXECUTOR
// ============================================================================

async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  personId: string,
  parishId: string
): Promise<string> {
  const supabase = createAdminClient()

  try {
    switch (toolName) {
      // ========================================================================
      // SCHEDULE & ASSIGNMENTS
      // ========================================================================
      case 'get_my_schedule': {
        const daysAhead = (toolInput.days_ahead as number) || 30
        const startDate = new Date().toISOString().split('T')[0]
        const endDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]

        // Get people_event_assignments for this person
        const { data: assignments } = await supabase
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
          .eq('person_id', personId)
          .is('deleted_at', null)

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
          return JSON.stringify({
            success: true,
            message: 'No upcoming assignments found',
            count: 0,
            assignments: [],
          })
        }

        return JSON.stringify({
          success: true,
          message: `Found ${upcomingAssignments.length} upcoming assignment(s)`,
          count: upcomingAssignments.length,
          assignments: upcomingAssignments,
        })
      }

      // ========================================================================
      // CALENDAR & EVENTS (PUBLIC)
      // ========================================================================
      case 'get_public_calendar': {
        const filterDate = toolInput.date as string | undefined
        const daysAhead = (toolInput.days_ahead as number) || 7
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
          .eq('parish_id', parishId)
          .eq('show_on_calendar', true)
          .is('deleted_at', null)
          .order('start_datetime', { ascending: true })

        if (filterDate) {
          query = query.gte('start_datetime', `${filterDate}T00:00:00`)
            .lt('start_datetime', `${filterDate}T23:59:59`)
        } else {
          query = query.gte('start_datetime', `${today}T00:00:00`)
            .lte('start_datetime', `${endDate}T23:59:59`)
        }

        const { data: events } = await query.limit(20)

        const formattedEvents = events?.map((e: any) => ({
          id: e.id,
          title: e.master_event?.event_type?.name || 'Event',
          start_datetime: e.start_datetime,
          end_datetime: e.end_datetime,
          location: e.location?.name,
          address: e.location ? `${e.location.street}, ${e.location.city}` : undefined,
          is_cancelled: e.is_cancelled,
        })) || []

        return JSON.stringify({
          success: true,
          count: formattedEvents.length,
          events: formattedEvents,
        })
      }

      case 'get_mass_times': {
        const dayFilter = toolInput.day_of_week as string | undefined

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
          .eq('parish_id', parishId)
          .eq('is_active', true)

        if (dayFilter) {
          query = query.eq('day_of_week', dayFilter)
        }

        const { data: templates } = await query

        const massSchedule = templates?.flatMap((t: any) =>
          t.items?.map((item: any) => ({
            day: t.day_of_week,
            time: item.time,
            location: item.location?.name,
            day_type: item.day_type,
          })) || []
        ).sort((a: any, b: any) => {
          const dayOrder = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
          return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
        }) || []

        return JSON.stringify({
          success: true,
          count: massSchedule.length,
          mass_times: massSchedule,
        })
      }

      case 'get_liturgical_info': {
        const date = (toolInput.date as string) || new Date().toISOString().split('T')[0]

        const { data: liturgicalData } = await supabase
          .from('liturgical_calendar')
          .select('*')
          .eq('date', date)
          .eq('locale', 'en_US')
          .limit(1)
          .single()

        if (!liturgicalData) {
          return JSON.stringify({
            success: true,
            message: `No liturgical information found for ${date}`,
            date,
            info: null,
          })
        }

        const eventData = liturgicalData.event_data as any
        return JSON.stringify({
          success: true,
          date,
          info: {
            name: eventData?.name,
            color: eventData?.color?.[0],
            grade: eventData?.grade_lcl,
            season: eventData?.liturgical_season_lcl,
            readings: eventData?.readings,
          },
        })
      }

      // ========================================================================
      // MY INFORMATION
      // ========================================================================
      case 'get_my_info': {
        const { data: person } = await supabase
          .from('people')
          .select('id, first_name, last_name, full_name, email, phone_number, street, city, state, zipcode, preferred_language')
          .eq('id', personId)
          .single()

        if (!person) {
          return JSON.stringify({ success: false, error: 'Profile not found' })
        }

        return JSON.stringify({
          success: true,
          profile: {
            name: person.full_name,
            email: person.email,
            phone: person.phone_number,
            address: person.street ? `${person.street}, ${person.city}, ${person.state} ${person.zipcode}` : null,
            language: person.preferred_language,
          },
        })
      }

      // ========================================================================
      // MY FAMILY
      // ========================================================================
      case 'get_my_family': {
        // Find families this person belongs to
        const { data: memberships } = await supabase
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
          .eq('person_id', personId)

        if (!memberships || memberships.length === 0) {
          return JSON.stringify({
            success: true,
            message: 'You are not currently associated with any family in our records.',
            families: [],
          })
        }

        const families = memberships.map((m: any) => ({
          family_name: m.family?.family_name,
          my_relationship: m.relationship,
          am_primary_contact: m.is_primary_contact,
          members: m.family?.members?.map((member: any) => ({
            name: member.person?.full_name,
            relationship: member.relationship,
            is_primary_contact: member.is_primary_contact,
          })) || [],
        }))

        return JSON.stringify({
          success: true,
          count: families.length,
          families,
        })
      }

      // ========================================================================
      // MY GROUPS & MINISTRIES
      // ========================================================================
      case 'get_my_groups': {
        const { data: memberships } = await supabase
          .from('group_members')
          .select(`
            id,
            joined_at,
            group:groups(id, name, description, is_active),
            group_role:group_roles(name)
          `)
          .eq('person_id', personId)

        if (!memberships || memberships.length === 0) {
          return JSON.stringify({
            success: true,
            message: 'You are not currently a member of any groups or ministries.',
            groups: [],
          })
        }

        const groups = memberships.map((m: any) => ({
          id: m.group?.id,
          name: m.group?.name,
          description: m.group?.description,
          role: m.group_role?.name,
          joined_at: m.joined_at,
          is_active: m.group?.is_active,
        }))

        return JSON.stringify({
          success: true,
          count: groups.length,
          groups,
        })
      }

      case 'list_available_groups': {
        // Get all active groups
        const { data: allGroups } = await supabase
          .from('groups')
          .select('id, name, description')
          .eq('parish_id', parishId)
          .eq('is_active', true)
          .is('deleted_at', null)
          .order('name')

        // Get groups the user is already in
        const { data: myMemberships } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('person_id', personId)

        const myGroupIds = new Set(myMemberships?.map((m: any) => m.group_id) || [])

        const availableGroups = allGroups?.map((g: any) => ({
          id: g.id,
          name: g.name,
          description: g.description,
          already_member: myGroupIds.has(g.id),
        })) || []

        return JSON.stringify({
          success: true,
          count: availableGroups.length,
          groups: availableGroups,
        })
      }

      // ========================================================================
      // CONTENT & RESOURCES
      // ========================================================================
      case 'search_readings': {
        const search = toolInput.search as string | undefined
        const language = toolInput.language as 'en' | 'es' | undefined
        const limit = (toolInput.limit as number) || 10

        let query = supabase
          .from('contents')
          .select('id, title, description, language')
          .eq('parish_id', parishId)
          .order('title')
          .limit(limit)

        if (search) {
          query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
        }

        if (language) {
          query = query.eq('language', language)
        }

        const { data: contents } = await query

        return JSON.stringify({
          success: true,
          count: contents?.length || 0,
          contents: contents?.map((c: any) => ({
            id: c.id,
            title: c.title,
            description: c.description,
            language: c.language,
          })) || [],
        })
      }

      // ========================================================================
      // LOCATIONS
      // ========================================================================
      case 'get_parish_locations': {
        const { data: locations } = await supabase
          .from('locations')
          .select('id, name, description, street, city, state, phone_number')
          .eq('parish_id', parishId)
          .is('deleted_at', null)
          .order('name')

        return JSON.stringify({
          success: true,
          count: locations?.length || 0,
          locations: locations?.map((l: any) => ({
            name: l.name,
            description: l.description,
            address: `${l.street}, ${l.city}, ${l.state}`,
            phone: l.phone_number,
          })) || [],
        })
      }

      // ========================================================================
      // MY AVAILABILITY (Mutations)
      // ========================================================================
      case 'add_my_blackout': {
        const startDate = toolInput.start_date as string
        const endDate = toolInput.end_date as string
        const reason = (toolInput.reason as string) || null

        const { data: blackout, error } = await supabase
          .from('person_blackout_dates')
          .insert({
            person_id: personId,
            start_date: startDate,
            end_date: endDate,
            reason,
          })
          .select()
          .single()

        if (error) {
          return JSON.stringify({
            success: false,
            error: `Failed to add blackout date: ${error.message}`,
          })
        }

        // Log AI activity
        await logAIActivity({
          parishId,
          source: 'parishioner_chat',
          initiatedByPersonId: personId,
          action: 'add_blackout',
          entityType: 'blackout_date',
          entityId: blackout.id,
          details: { start_date: startDate, end_date: endDate, reason },
        })

        return JSON.stringify({
          success: true,
          message: `Successfully marked unavailable from ${startDate} to ${endDate}`,
          blackout: {
            id: blackout.id,
            start_date: startDate,
            end_date: endDate,
            reason,
          },
        })
      }

      case 'remove_my_blackout': {
        const blackoutId = toolInput.blackout_id as string

        // Verify this blackout belongs to the user
        const { data: existing } = await supabase
          .from('person_blackout_dates')
          .select('id, person_id, start_date, end_date')
          .eq('id', blackoutId)
          .single()

        if (!existing || existing.person_id !== personId) {
          return JSON.stringify({
            success: false,
            error: 'Blackout date not found or does not belong to you',
          })
        }

        const { error } = await supabase
          .from('person_blackout_dates')
          .delete()
          .eq('id', blackoutId)
          .eq('person_id', personId)

        if (error) {
          return JSON.stringify({
            success: false,
            error: `Failed to remove blackout date: ${error.message}`,
          })
        }

        // Log AI activity
        await logAIActivity({
          parishId,
          source: 'parishioner_chat',
          initiatedByPersonId: personId,
          action: 'remove_blackout',
          entityType: 'blackout_date',
          entityId: blackoutId,
          details: { start_date: existing.start_date, end_date: existing.end_date },
        })

        return JSON.stringify({
          success: true,
          message: 'Successfully removed the blackout date',
        })
      }

      case 'get_my_blackouts': {
        const { data: blackouts } = await supabase
          .from('person_blackout_dates')
          .select('id, start_date, end_date, reason')
          .eq('person_id', personId)
          .is('deleted_at', null)
          .order('start_date', { ascending: true })

        return JSON.stringify({
          success: true,
          count: blackouts?.length || 0,
          blackouts: blackouts || [],
        })
      }

      // ========================================================================
      // MY PERSONAL INFO (Mutations)
      // ========================================================================
      case 'update_my_info': {
        const updateData: Record<string, unknown> = {}
        const fields = ['phone_number', 'email', 'street', 'city', 'state', 'zipcode', 'preferred_language']

        for (const field of fields) {
          if (toolInput[field] !== undefined) {
            updateData[field] = toolInput[field]
          }
        }

        if (Object.keys(updateData).length === 0) {
          return JSON.stringify({
            success: false,
            error: 'No fields provided to update',
          })
        }

        const { error } = await supabase
          .from('people')
          .update(updateData)
          .eq('id', personId)
          .select()
          .single()

        if (error) {
          return JSON.stringify({
            success: false,
            error: `Failed to update info: ${error.message}`,
          })
        }

        const updatedFields = Object.keys(updateData).join(', ')
        return JSON.stringify({
          success: true,
          message: `Successfully updated: ${updatedFields}`,
          updated_fields: Object.keys(updateData),
        })
      }

      // ========================================================================
      // MY GROUP MEMBERSHIP (Mutations)
      // ========================================================================
      case 'join_group': {
        const groupId = toolInput.group_id as string

        // Check if group exists and is active
        const { data: group } = await supabase
          .from('groups')
          .select('id, name, is_active')
          .eq('id', groupId)
          .eq('parish_id', parishId)
          .single()

        if (!group) {
          return JSON.stringify({
            success: false,
            error: 'Group not found',
          })
        }

        if (!group.is_active) {
          return JSON.stringify({
            success: false,
            error: 'This group is not currently active',
          })
        }

        // Check if already a member
        const { data: existing } = await supabase
          .from('group_members')
          .select('id')
          .eq('group_id', groupId)
          .eq('person_id', personId)
          .single()

        if (existing) {
          return JSON.stringify({
            success: false,
            error: `You are already a member of ${group.name}`,
          })
        }

        const { error } = await supabase
          .from('group_members')
          .insert({
            group_id: groupId,
            person_id: personId,
          })

        if (error) {
          return JSON.stringify({
            success: false,
            error: `Failed to join group: ${error.message}`,
          })
        }

        return JSON.stringify({
          success: true,
          message: `Successfully joined ${group.name}`,
          group_name: group.name,
        })
      }

      case 'leave_group': {
        const groupId = toolInput.group_id as string

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
          .eq('person_id', personId)
          .single()

        if (!membership) {
          return JSON.stringify({
            success: false,
            error: 'You are not a member of this group',
          })
        }

        const { error } = await supabase
          .from('group_members')
          .delete()
          .eq('group_id', groupId)
          .eq('person_id', personId)

        if (error) {
          return JSON.stringify({
            success: false,
            error: `Failed to leave group: ${error.message}`,
          })
        }

        return JSON.stringify({
          success: true,
          message: `Successfully left ${group?.name || 'the group'}`,
        })
      }

      default:
        return JSON.stringify({ success: false, error: `Unknown tool: ${toolName}` })
    }
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error)
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    })
  }
}

// ============================================================================
// SYSTEM PROMPT - Based on ai-conversation-parishioner.md guidelines
// ============================================================================

function getSystemPrompt(language: 'en' | 'es'): string {
  const today = new Date().toISOString().split('T')[0]

  if (language === 'es') {
    return `Eres un asistente ministerial amigable para una parroquia católica. Ayudas a los feligreses a gestionar su información personal, ver su horario, unirse a ministerios y marcar fechas de no disponibilidad.

Fecha de hoy: ${today}

## Perspectiva Católica
Las respuestas deben alinearse con la enseñanza católica y los valores parroquiales.

## Lo que PUEDES hacer:
- Mostrar el horario y asignaciones del usuario
- Mostrar eventos del calendario parroquial y horarios de Misas
- Mostrar la información personal del usuario (nombre, teléfono, email, dirección)
- Mostrar la familia del usuario y los grupos/ministerios a los que pertenece
- Buscar lecturas y contenido en la biblioteca
- Mostrar ubicaciones de la parroquia
- Actualizar la información de contacto del usuario (teléfono, email, dirección, idioma)
- Agregar/quitar fechas de no disponibilidad del usuario
- Unirse o dejar grupos/ministerios

## Lo que NO PUEDES hacer:
- Eliminar registros (redirige al usuario a contactar la oficina parroquial)
- Operaciones masivas (solo un cambio a la vez)
- Acceder a información privada de otros feligreses
- Crear eventos (requiere acceso de personal)
- Operaciones financieras

## Cuando algo no es posible:
"No puedo hacer eso. Por favor contacta la oficina parroquial para ayuda con esta solicitud."

## Directrices:
- Sé amable, servicial y respetuoso
- Usa un tono conversacional y cálido
- Proporciona información clara y concisa
- Confirma antes de hacer cambios
- Solo cambia un registro a la vez`
  }

  return `You are a friendly ministry assistant for a Catholic parish. You help parishioners manage their personal information, view their schedule, join ministries, and mark unavailable dates.

Today's date is ${today}.

## Catholic Perspective
Responses should align with Catholic teaching and parish values.

## What you CAN do:
- Show the user's schedule and assignments
- Show parish calendar events and Mass times
- Show the user's personal information (name, phone, email, address)
- Show the user's family and groups/ministries they belong to
- Search readings and content in the library
- Show parish locations
- Update the user's contact information (phone, email, address, language preference)
- Add/remove the user's blackout dates (unavailability)
- Join or leave groups/ministries

## What you CANNOT do:
- Delete records (direct user to contact parish office)
- Bulk operations (only one change at a time)
- Access other parishioners' private information
- Create events (requires staff access)
- Financial operations

## When something is not possible:
Explain clearly and direct the user to the appropriate resource:
- For deletions: "I'm not able to delete records. Please contact the parish office for help with this request."
- For accessing others' info: "I can only show you your own information. Please contact the parish office to get in touch with other parishioners."
- For creating events: "Event creation requires staff access. Please contact the parish office or your ministry leader."
- For financial matters: "I don't have access to financial information. Please contact the parish office."

## Guidelines:
- Be friendly, helpful, and respectful
- Use a conversational, warm tone
- Provide clear and concise information
- Confirm before making changes
- Only change one record at a time
- Always use the available tools - don't make up information`
}

/**
 * Chat with AI assistant using Claude API
 */
export async function chatWithAI(
  personId: string,
  message: string,
  conversationId: string | null,
  language: 'en' | 'es' = 'en',
  csrfToken?: string
): Promise<{
  response: string
  conversationId: string
}> {
  try {
    // Validate CSRF token
    if (!csrfToken || !(await validateCsrfToken(csrfToken))) {
      return {
        response: language === 'es'
          ? 'Sesión inválida. Recarga la página.'
          : 'Invalid session. Please reload the page.',
        conversationId: conversationId || ''
      }
    }

    // Verify session
    const { getParishionerSession } = await import('@/lib/parishioner-auth/actions')
    const session = await getParishionerSession()
    if (!session || session.personId !== personId) {
      console.error('Unauthorized access attempt to chat')
      return {
        response: language === 'es'
          ? 'No autorizado. Por favor, inicia sesión de nuevo.'
          : 'Unauthorized. Please log in again.',
        conversationId: conversationId || '',
      }
    }

    // Rate limiting check
    const rateLimitResult = rateLimit(`chat:${personId}`, RATE_LIMITS.chat)
    if (!rateLimitResult.success) {
      return {
        response: language === 'es'
          ? 'Has enviado demasiados mensajes. Por favor espera un momento.'
          : 'You have sent too many messages. Please wait a moment.',
        conversationId: conversationId || ''
      }
    }

    const supabase = createAdminClient()

    // Get the person's parish_id for tool execution
    const { data: personData } = await supabase
      .from('people')
      .select('parish_id')
      .eq('id', personId)
      .single()

    if (!personData?.parish_id) {
      return {
        response: language === 'es'
          ? 'No se pudo encontrar tu información de parroquia.'
          : 'Could not find your parish information.',
        conversationId: conversationId || '',
      }
    }

    const parishId = personData.parish_id

    // Get conversation history if exists
    let conversationHistory: ChatMessage[] = []
    if (conversationId) {
      const { data } = await supabase
        .from('ai_chat_conversations')
        .select('conversation_history')
        .eq('id', conversationId)
        .single()

      if (data && data.conversation_history) {
        conversationHistory = JSON.parse(data.conversation_history as string)
      }
    }

    // Build messages for Claude API
    const messages: Anthropic.MessageParam[] = conversationHistory
      .filter((msg) => msg.role !== 'system')
      .map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }))

    // Add current user message
    messages.push({
      role: 'user',
      content: message,
    })

    // Call Claude API
    let response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: getSystemPrompt(language),
      messages,
      tools,
    })

    // Handle tool use
    let finalResponse = ''
    const toolResults: Anthropic.MessageParam[] = []

    while (response.stop_reason === 'tool_use') {
      // Extract tool use blocks
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      )

      // Execute each tool
      for (const toolUse of toolUseBlocks) {
        const toolResult = await executeTool(toolUse.name, toolUse.input as Record<string, unknown>, personId, parishId)

        toolResults.push({
          role: 'user',
          content: [
            {
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: toolResult,
            },
          ],
        })
      }

      // Continue conversation with tool results
      response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        system: getSystemPrompt(language),
        messages: [
          ...messages,
          {
            role: 'assistant',
            content: response.content,
          },
          ...toolResults,
        ],
        tools,
      })
    }

    // Extract final text response
    const textBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    )
    finalResponse = textBlocks.map((block) => block.text).join('\n')

    // Save conversation to database
    const newMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }

    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: finalResponse,
      timestamp: new Date().toISOString(),
    }

    const updatedHistory = [...conversationHistory, newMessage, assistantMessage]

    let convId = conversationId

    if (!convId) {
      // Create new conversation
      const { data: session } = await supabase
        .from('parishioner_auth_sessions')
        .select('id')
        .eq('person_id', personId)
        .eq('is_revoked', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (session) {
        const { data: newConv } = await supabase
          .from('ai_chat_conversations')
          .insert({
            parish_id: parishId,
            person_id: personId,
            session_id: session.id,
            conversation_history: JSON.stringify(updatedHistory),
          })
          .select('id')
          .single()

        convId = newConv?.id || ''
      }
    } else {
      // Update existing conversation
      await supabase
        .from('ai_chat_conversations')
        .update({
          conversation_history: JSON.stringify(updatedHistory),
          updated_at: new Date().toISOString(),
        })
        .eq('id', convId)
    }

    return {
      response: finalResponse,
      conversationId: convId || '',
    }
  } catch (error) {
    console.error('Error in chat:', error)
    return {
      response:
        language === 'es'
          ? 'Lo siento, tengo problemas para conectarme. Por favor, inténtalo de nuevo.'
          : "I'm having trouble connecting. Please try again.",
      conversationId: conversationId || '',
    }
  }
}

/**
 * Get conversation history
 */
export async function getConversationHistory(conversationId: string): Promise<ChatMessage[]> {
  // Note: Session verification done at page level for getConversationHistory
  // since conversationId is already scoped to the person's session
  const supabase = createAdminClient()

  try {
    const { data } = await supabase
      .from('ai_chat_conversations')
      .select('conversation_history')
      .eq('id', conversationId)
      .single()

    if (data && data.conversation_history) {
      return JSON.parse(data.conversation_history as string)
    }

    return []
  } catch (error) {
    console.error('Error fetching conversation history:', error)
    return []
  }
}
