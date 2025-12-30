'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireSelectedParish } from '@/lib/auth/parish'
import Anthropic from '@anthropic-ai/sdk'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { CLAUDE_MODEL } from '@/lib/constants/ai'

// Import server actions to wrap as tools
import { getPeople, getPerson, createPerson, updatePerson } from '@/lib/actions/people'
import { getEvents } from '@/lib/actions/events'
import { getLocations } from '@/lib/actions/locations'
import { getCalendarEventsForCalendar } from '@/lib/actions/parish-events'
import { getMasses, getMassWithRelations, getMassRoles, createMassRole, deleteMassRole } from '@/lib/actions/mass-liturgies'
import { getMassIntentions, getMassIntention } from '@/lib/actions/mass-intentions'
import { getFamilies, getFamily, createFamily, addFamilyMember, removeFamilyMember, setPrimaryContact } from '@/lib/actions/families'
import { getGroups, getGroup, addGroupMember, removeGroupMember, updateGroupMemberRole, getPersonGroupMemberships } from '@/lib/actions/groups'
import { getPersonBlackoutDates, createPersonBlackoutDate, deletePersonBlackoutDate, checkPersonAvailability } from '@/lib/actions/person-blackout-dates'
import { getContents, getContentById, searchContentByText } from '@/lib/actions/contents'
import { getEventTypes, getEventTypeWithRelations } from '@/lib/actions/event-types'
import { getCustomLists, getCustomListWithItems } from '@/lib/actions/custom-lists'
import { getCategoryTags } from '@/lib/actions/category-tags'
import { getAllPresets, getPresetsByEventType } from '@/lib/actions/event-presets'
import { getMassTimesWithItems } from '@/lib/actions/mass-times-templates'
import { deletePerson } from '@/lib/actions/people'
import { deleteFamily } from '@/lib/actions/families'
import { deleteEvent, getEvent } from '@/lib/actions/events'
import { successResponse, errorResponse, confirmationRequired, logAIActivity } from '@/lib/ai-tools/shared'

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
// TOOL DEFINITIONS - All tools from ai-conversation-staff.md
// ============================================================================

const tools: Anthropic.Tool[] = [
  // ============================================================================
  // PEOPLE & DIRECTORY
  // ============================================================================
  {
    name: 'list_people',
    description: 'Search and list people in the parish directory. Use for questions about people, contacts, members, ministers, or finding someone by name/email/phone.',
    input_schema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search term to filter by name, email, or phone number. Optional.' },
        limit: { type: 'number', description: 'Maximum number of results to return (default: 20)' },
      },
    },
  },
  {
    name: 'get_person',
    description: 'Get detailed information about a specific person by their ID. Use when user wants full details about a particular person.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the person to retrieve' },
      },
      required: ['id'],
    },
  },
  {
    name: 'create_person',
    description: 'Create a new person in the parish directory. Use when user wants to add a new person, member, or contact. Requires at least first_name and last_name.',
    input_schema: {
      type: 'object',
      properties: {
        first_name: { type: 'string', description: 'The first name of the person' },
        last_name: { type: 'string', description: 'The last name of the person' },
        email: { type: 'string', description: 'Email address (optional)' },
        phone_number: { type: 'string', description: 'Phone number (optional)' },
        note: { type: 'string', description: 'Additional notes about the person (optional)' },
      },
      required: ['first_name', 'last_name'],
    },
  },
  {
    name: 'update_person',
    description: 'Update information about an existing person. Use for changing contact info, address, pronunciation notes, etc. Confirm with user before updating.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the person to update' },
        first_name: { type: 'string', description: 'Updated first name (optional)' },
        last_name: { type: 'string', description: 'Updated last name (optional)' },
        email: { type: 'string', description: 'Updated email address (optional)' },
        phone_number: { type: 'string', description: 'Updated phone number (optional)' },
        first_name_pronunciation: { type: 'string', description: 'Pronunciation guide for first name (optional)' },
        last_name_pronunciation: { type: 'string', description: 'Pronunciation guide for last name (optional)' },
        note: { type: 'string', description: 'Updated notes (optional)' },
        street: { type: 'string', description: 'Street address (optional)' },
        city: { type: 'string', description: 'City (optional)' },
        state: { type: 'string', description: 'State (optional)' },
        zipcode: { type: 'string', description: 'Zip code (optional)' },
      },
      required: ['id'],
    },
  },

  // ============================================================================
  // FAMILIES
  // ============================================================================
  {
    name: 'list_families',
    description: 'List families in the parish. Use for questions about families or looking up family information.',
    input_schema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search term to filter families by name (optional)' },
        limit: { type: 'number', description: 'Maximum number of results (default: 20)' },
      },
    },
  },
  {
    name: 'get_family',
    description: 'Get detailed information about a specific family including all members.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the family to retrieve' },
      },
      required: ['id'],
    },
  },
  {
    name: 'create_family',
    description: 'Create a new family in the parish directory.',
    input_schema: {
      type: 'object',
      properties: {
        family_name: { type: 'string', description: 'The family name (e.g., "The Johnson Family" or just "Johnson")' },
      },
      required: ['family_name'],
    },
  },
  {
    name: 'add_family_member',
    description: 'Add an existing person to a family.',
    input_schema: {
      type: 'object',
      properties: {
        family_id: { type: 'string', description: 'The UUID of the family' },
        person_id: { type: 'string', description: 'The UUID of the person to add' },
        relationship: { type: 'string', description: 'Relationship type (e.g., "Head", "Spouse", "Child", "Parent")' },
        is_primary_contact: { type: 'boolean', description: 'Whether this person is the primary contact for the family' },
      },
      required: ['family_id', 'person_id'],
    },
  },
  {
    name: 'remove_family_member',
    description: 'Remove a person from a family.',
    input_schema: {
      type: 'object',
      properties: {
        family_id: { type: 'string', description: 'The UUID of the family' },
        person_id: { type: 'string', description: 'The UUID of the person to remove' },
      },
      required: ['family_id', 'person_id'],
    },
  },
  {
    name: 'set_family_primary_contact',
    description: 'Set a family member as the primary contact for the family.',
    input_schema: {
      type: 'object',
      properties: {
        family_id: { type: 'string', description: 'The UUID of the family' },
        person_id: { type: 'string', description: 'The UUID of the person to make primary contact' },
      },
      required: ['family_id', 'person_id'],
    },
  },

  // ============================================================================
  // GROUPS & MINISTRIES
  // ============================================================================
  {
    name: 'list_groups',
    description: 'List groups and ministries in the parish (e.g., choir, lectors, ushers). Use for questions about ministries, groups, or who belongs to them.',
    input_schema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search term to filter groups by name (optional)' },
        status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'all'], description: 'Filter by active status' },
      },
    },
  },
  {
    name: 'get_group',
    description: 'Get detailed information about a specific group including all members.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the group to retrieve' },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_person_groups',
    description: 'Get all groups/ministries a person belongs to.',
    input_schema: {
      type: 'object',
      properties: {
        person_id: { type: 'string', description: 'The UUID of the person' },
      },
      required: ['person_id'],
    },
  },
  {
    name: 'add_to_group',
    description: 'Add a person to a group or ministry.',
    input_schema: {
      type: 'object',
      properties: {
        group_id: { type: 'string', description: 'The UUID of the group' },
        person_id: { type: 'string', description: 'The UUID of the person to add' },
        role_id: { type: 'string', description: 'Optional group role ID (e.g., leader, member)' },
      },
      required: ['group_id', 'person_id'],
    },
  },
  {
    name: 'remove_from_group',
    description: 'Remove a person from a group or ministry.',
    input_schema: {
      type: 'object',
      properties: {
        group_id: { type: 'string', description: 'The UUID of the group' },
        person_id: { type: 'string', description: 'The UUID of the person to remove' },
      },
      required: ['group_id', 'person_id'],
    },
  },
  {
    name: 'update_group_member_role',
    description: 'Update the role of a group member (e.g., make someone a leader).',
    input_schema: {
      type: 'object',
      properties: {
        group_id: { type: 'string', description: 'The UUID of the group' },
        person_id: { type: 'string', description: 'The UUID of the person' },
        role_id: { type: 'string', description: 'The new role ID (or null to remove role)' },
      },
      required: ['group_id', 'person_id'],
    },
  },

  // ============================================================================
  // EVENTS & CALENDAR
  // ============================================================================
  {
    name: 'list_events',
    description: 'Search and list parish events by name or date range. Use for questions about events, ceremonies, or finding specific events.',
    input_schema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search term to filter events by name' },
        start_date: { type: 'string', description: 'Start date filter in YYYY-MM-DD format' },
        end_date: { type: 'string', description: 'End date filter in YYYY-MM-DD format' },
        limit: { type: 'number', description: 'Maximum number of results (default: 20)' },
      },
    },
  },
  {
    name: 'get_calendar_events',
    description: 'Get all calendar events with full details including location and event type. Use for "what\'s on the calendar", "what\'s happening today/this week", or seeing scheduled activities.',
    input_schema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Specific date to filter for in YYYY-MM-DD format. If not provided, returns upcoming events.' },
      },
    },
  },

  // ============================================================================
  // MASSES
  // ============================================================================
  {
    name: 'list_masses',
    description: 'List Masses for the parish. Use for questions about Mass schedules, who is presiding, assignments, etc.',
    input_schema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search term to filter by presider, homilist, or type' },
        start_date: { type: 'string', description: 'Start date filter in ISO format' },
        end_date: { type: 'string', description: 'End date filter in ISO format' },
        status: { type: 'string', enum: ['PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'all'], description: 'Filter by status' },
        limit: { type: 'number', description: 'Maximum number of results (default: 20)' },
      },
    },
  },
  {
    name: 'get_mass',
    description: 'Get detailed information about a specific Mass including all assignments, readings, music, and intentions.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the Mass to retrieve' },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_mass_assignments',
    description: 'Get role assignments for a Mass (lectors, ushers, altar servers, etc.).',
    input_schema: {
      type: 'object',
      properties: {
        mass_id: { type: 'string', description: 'The UUID of the Mass' },
      },
      required: ['mass_id'],
    },
  },
  {
    name: 'assign_to_mass',
    description: 'Assign a person to a role for a Mass. Confirm with user before making assignment.',
    input_schema: {
      type: 'object',
      properties: {
        mass_id: { type: 'string', description: 'The UUID of the Mass' },
        role_id: { type: 'string', description: 'The UUID of the role (e.g., lector, usher)' },
        person_id: { type: 'string', description: 'The UUID of the person to assign' },
        notes: { type: 'string', description: 'Optional notes for the assignment' },
      },
      required: ['mass_id', 'role_id', 'person_id'],
    },
  },
  {
    name: 'remove_mass_assignment',
    description: 'Remove a person from a Mass role assignment.',
    input_schema: {
      type: 'object',
      properties: {
        assignment_id: { type: 'string', description: 'The UUID of the assignment to remove' },
      },
      required: ['assignment_id'],
    },
  },

  // ============================================================================
  // MASS INTENTIONS
  // ============================================================================
  {
    name: 'list_mass_intentions',
    description: 'List Mass intentions. Use for questions about Mass intentions, who requested them, or finding unfulfilled intentions.',
    input_schema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search by offered for name or requester' },
        status: { type: 'string', enum: ['REQUESTED', 'CONFIRMED', 'FULFILLED', 'CANCELLED', 'all'], description: 'Filter by status' },
        start_date: { type: 'string', description: 'Filter intentions requested on or after this date' },
        end_date: { type: 'string', description: 'Filter intentions requested on or before this date' },
        limit: { type: 'number', description: 'Maximum number of results (default: 20)' },
      },
    },
  },
  {
    name: 'get_mass_intention',
    description: 'Get detailed information about a specific Mass intention.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the Mass intention' },
      },
      required: ['id'],
    },
  },

  // ============================================================================
  // AVAILABILITY & BLACKOUT DATES
  // ============================================================================
  {
    name: 'get_person_availability',
    description: 'Get blackout dates for a person. Use to check if someone is available on a specific date.',
    input_schema: {
      type: 'object',
      properties: {
        person_id: { type: 'string', description: 'The UUID of the person' },
      },
      required: ['person_id'],
    },
  },
  {
    name: 'check_availability',
    description: 'Check if a person is available on a specific date (no blackout dates).',
    input_schema: {
      type: 'object',
      properties: {
        person_id: { type: 'string', description: 'The UUID of the person' },
        date: { type: 'string', description: 'The date to check in YYYY-MM-DD format' },
      },
      required: ['person_id', 'date'],
    },
  },
  {
    name: 'add_blackout_date',
    description: 'Add a blackout date for a person (mark them as unavailable).',
    input_schema: {
      type: 'object',
      properties: {
        person_id: { type: 'string', description: 'The UUID of the person' },
        start_date: { type: 'string', description: 'Start date of unavailability (YYYY-MM-DD)' },
        end_date: { type: 'string', description: 'End date of unavailability (YYYY-MM-DD)' },
        reason: { type: 'string', description: 'Optional reason for the blackout' },
      },
      required: ['person_id', 'start_date', 'end_date'],
    },
  },
  {
    name: 'remove_blackout_date',
    description: 'Remove a blackout date for a person.',
    input_schema: {
      type: 'object',
      properties: {
        blackout_id: { type: 'string', description: 'The UUID of the blackout date to remove' },
      },
      required: ['blackout_id'],
    },
  },

  // ============================================================================
  // LOCATIONS
  // ============================================================================
  {
    name: 'list_locations',
    description: 'List parish locations and venues. Use for questions about where things happen, rooms, or addresses.',
    input_schema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search term to filter locations by name' },
      },
    },
  },

  // ============================================================================
  // CONTENT LIBRARY
  // ============================================================================
  {
    name: 'list_contents',
    description: 'List content items from the content library (readings, blessings, prayers, etc.).',
    input_schema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search term to filter by title or body' },
        language: { type: 'string', enum: ['en', 'es'], description: 'Filter by language' },
        tag_slugs: { type: 'array', items: { type: 'string' }, description: 'Filter by tag slugs' },
        limit: { type: 'number', description: 'Maximum number of results (default: 20)' },
      },
    },
  },
  {
    name: 'get_content',
    description: 'Get a specific content item with full text.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the content to retrieve' },
      },
      required: ['id'],
    },
  },
  {
    name: 'search_content',
    description: 'Full-text search of content library.',
    input_schema: {
      type: 'object',
      properties: {
        search_term: { type: 'string', description: 'Text to search for in title and body' },
        language: { type: 'string', enum: ['en', 'es'], description: 'Filter by language (optional)' },
        limit: { type: 'number', description: 'Maximum number of results (default: 20)' },
      },
      required: ['search_term'],
    },
  },

  // ============================================================================
  // SETTINGS & CONFIGURATION (READ ONLY FOR AI)
  // ============================================================================
  {
    name: 'list_event_types',
    description: 'List configured event types (Wedding, Funeral, Baptism, etc.).',
    input_schema: {
      type: 'object',
      properties: {
        system_type: { type: 'string', enum: ['mass-liturgy', 'special-liturgy', 'parish-event'], description: 'Filter by system type' },
      },
    },
  },
  {
    name: 'get_event_type',
    description: 'Get details of an event type including its fields and scripts.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the event type' },
      },
      required: ['id'],
    },
  },
  {
    name: 'list_custom_lists',
    description: 'List custom lists (Music Selections, Readings, etc.).',
    input_schema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search term to filter by name' },
      },
    },
  },
  {
    name: 'get_custom_list',
    description: 'Get a custom list with all its items.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the custom list' },
      },
      required: ['id'],
    },
  },
  {
    name: 'list_category_tags',
    description: 'List all category tags used to categorize content.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_event_presets',
    description: 'List event presets (pre-configured event templates).',
    input_schema: {
      type: 'object',
      properties: {
        event_type_id: { type: 'string', description: 'Filter by event type (optional)' },
      },
    },
  },

  // ============================================================================
  // MASS TEMPLATES
  // ============================================================================
  {
    name: 'get_mass_templates',
    description: 'Get Mass schedule templates showing recurring Mass times by day of week. Use for questions about the regular Mass schedule, "when are Masses", or recurring Mass times.',
    input_schema: {
      type: 'object',
      properties: {
        day_of_week: {
          type: 'string',
          enum: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
          description: 'Filter by specific day of week (optional)',
        },
      },
    },
  },

  // ============================================================================
  // MASS ASSIGNMENT COVERAGE
  // ============================================================================
  {
    name: 'find_mass_assignment_gaps',
    description: 'Find upcoming Masses and show their ministry assignment status. Use for "what Masses need coverage", "which Masses are missing assignments", "show Mass assignments for this weekend", or checking ministry coverage. Returns Masses with assignment counts by ministry.',
    input_schema: {
      type: 'object',
      properties: {
        days_ahead: { type: 'number', description: 'Number of days to look ahead from today (default: 7)' },
        start_date: { type: 'string', description: 'Start date filter in YYYY-MM-DD format (alternative to days_ahead)' },
        end_date: { type: 'string', description: 'End date filter in YYYY-MM-DD format' },
        group_id: { type: 'string', description: 'Optional: Filter to only show assignments for a specific ministry/group (by group ID)' },
        group_name: { type: 'string', description: 'Optional: Filter to only show assignments for a ministry by name (e.g., "Lectors", "Ushers")' },
      },
    },
  },

  // ============================================================================
  // DELETE OPERATIONS (Require Confirmation)
  // ============================================================================
  {
    name: 'delete_person',
    description: 'Delete a person from the directory. REQUIRES CONFIRMATION. Use only after user explicitly confirms the deletion. Set confirmed=true after user confirms.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the person to delete' },
        confirmed: { type: 'boolean', description: 'Set to true after user explicitly confirms the deletion' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_family',
    description: 'Delete a family from the directory. REQUIRES CONFIRMATION. Use only after user explicitly confirms the deletion. Set confirmed=true after user confirms.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the family to delete' },
        confirmed: { type: 'boolean', description: 'Set to true after user explicitly confirms the deletion' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_event',
    description: 'Delete an event from the parish calendar. REQUIRES CONFIRMATION. Use only after user explicitly confirms the deletion. Set confirmed=true after user confirms.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the event to delete' },
        confirmed: { type: 'boolean', description: 'Set to true after user explicitly confirms the deletion' },
      },
      required: ['id'],
    },
  },
]

// ============================================================================
// TOOL EXECUTOR
// ============================================================================

async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  context: { userId: string; parishId: string }
): Promise<string> {
  try {
    switch (toolName) {
      // ============================================================================
      // PEOPLE & DIRECTORY
      // ============================================================================
      case 'list_people': {
        const results = await getPeople({
          search: toolInput.search as string | undefined,
          limit: (toolInput.limit as number) || 20,
        })
        return JSON.stringify({
          success: true,
          count: results.length,
          people: results.map((p) => ({
            id: p.id,
            full_name: p.full_name,
            first_name: p.first_name,
            last_name: p.last_name,
            email: p.email,
            phone_number: p.phone_number,
          })),
        })
      }

      case 'get_person': {
        const person = await getPerson(toolInput.id as string)
        if (!person) {
          return JSON.stringify({ success: false, error: 'Person not found' })
        }
        return JSON.stringify({
          success: true,
          person: {
            id: person.id,
            full_name: person.full_name,
            first_name: person.first_name,
            last_name: person.last_name,
            first_name_pronunciation: person.first_name_pronunciation,
            last_name_pronunciation: person.last_name_pronunciation,
            email: person.email,
            phone_number: person.phone_number,
            street: person.street,
            city: person.city,
            state: person.state,
            zipcode: person.zipcode,
            note: person.note,
          },
        })
      }

      case 'create_person': {
        const person = await createPerson({
          first_name: toolInput.first_name as string,
          last_name: toolInput.last_name as string,
          email: toolInput.email as string | undefined,
          phone_number: toolInput.phone_number as string | undefined,
          note: toolInput.note as string | undefined,
        })
        return JSON.stringify({
          success: true,
          message: `Successfully created person: ${person.full_name}`,
          person: { id: person.id, full_name: person.full_name },
        })
      }

      case 'update_person': {
        const updateData: Record<string, unknown> = {}
        const fields = ['first_name', 'last_name', 'email', 'phone_number', 'first_name_pronunciation', 'last_name_pronunciation', 'note', 'street', 'city', 'state', 'zipcode']
        for (const field of fields) {
          if (toolInput[field] !== undefined) {
            updateData[field] = toolInput[field]
          }
        }
        const person = await updatePerson(toolInput.id as string, updateData)
        return JSON.stringify({
          success: true,
          message: `Successfully updated person: ${person.full_name}`,
          person: { id: person.id, full_name: person.full_name },
        })
      }

      // ============================================================================
      // FAMILIES
      // ============================================================================
      case 'list_families': {
        const results = await getFamilies({
          search: toolInput.search as string | undefined,
          limit: (toolInput.limit as number) || 20,
        })
        return JSON.stringify({
          success: true,
          count: results.length,
          families: results.map((f) => ({
            id: f.id,
            family_name: f.family_name,
            active: f.active,
          })),
        })
      }

      case 'get_family': {
        const family = await getFamily(toolInput.id as string)
        if (!family) {
          return JSON.stringify({ success: false, error: 'Family not found' })
        }
        return JSON.stringify({
          success: true,
          family: {
            id: family.id,
            family_name: family.family_name,
            active: family.active,
            members: family.members.map((m) => ({
              person_id: m.person_id,
              person_name: m.person?.full_name,
              relationship: m.relationship,
              is_primary_contact: m.is_primary_contact,
            })),
          },
        })
      }

      case 'create_family': {
        const family = await createFamily({
          family_name: toolInput.family_name as string,
          active: true,
        })
        return JSON.stringify({
          success: true,
          message: `Successfully created family: ${family.family_name}`,
          family: { id: family.id, family_name: family.family_name },
        })
      }

      case 'add_family_member': {
        const member = await addFamilyMember(toolInput.family_id as string, {
          person_id: toolInput.person_id as string,
          relationship: toolInput.relationship as string | undefined,
          is_primary_contact: toolInput.is_primary_contact as boolean | undefined,
        })
        return JSON.stringify({
          success: true,
          message: 'Successfully added person to family',
          member: { id: member.id, person_id: member.person_id },
        })
      }

      case 'remove_family_member': {
        await removeFamilyMember(toolInput.family_id as string, toolInput.person_id as string)
        return JSON.stringify({
          success: true,
          message: 'Successfully removed person from family',
        })
      }

      case 'set_family_primary_contact': {
        await setPrimaryContact(toolInput.family_id as string, toolInput.person_id as string)
        return JSON.stringify({
          success: true,
          message: 'Successfully set primary contact for family',
        })
      }

      // ============================================================================
      // GROUPS & MINISTRIES
      // ============================================================================
      case 'list_groups': {
        const results = await getGroups({
          search: toolInput.search as string | undefined,
          status: toolInput.status as string | undefined,
        })
        return JSON.stringify({
          success: true,
          count: results.length,
          groups: results.map((g) => ({
            id: g.id,
            name: g.name,
            description: g.description,
            is_active: g.is_active,
          })),
        })
      }

      case 'get_group': {
        const group = await getGroup(toolInput.id as string)
        if (!group) {
          return JSON.stringify({ success: false, error: 'Group not found' })
        }
        return JSON.stringify({
          success: true,
          group: {
            id: group.id,
            name: group.name,
            description: group.description,
            is_active: group.is_active,
            members: group.members.map((m) => ({
              person_id: m.person_id,
              person_name: m.person?.full_name,
              role: m.group_role?.name,
              joined_at: m.joined_at,
            })),
          },
        })
      }

      case 'get_person_groups': {
        const memberships = await getPersonGroupMemberships(toolInput.person_id as string)
        return JSON.stringify({
          success: true,
          count: memberships.length,
          groups: memberships.map((m) => ({
            group_id: m.group_id,
            group_name: m.group.name,
            role: m.group_role?.name,
            joined_at: m.joined_at,
          })),
        })
      }

      case 'add_to_group': {
        const member = await addGroupMember(
          toolInput.group_id as string,
          toolInput.person_id as string,
          toolInput.role_id as string | undefined
        )
        return JSON.stringify({
          success: true,
          message: 'Successfully added person to group',
          member: { id: member.id, person_id: member.person_id },
        })
      }

      case 'remove_from_group': {
        await removeGroupMember(toolInput.group_id as string, toolInput.person_id as string)
        return JSON.stringify({
          success: true,
          message: 'Successfully removed person from group',
        })
      }

      case 'update_group_member_role': {
        const member = await updateGroupMemberRole(
          toolInput.group_id as string,
          toolInput.person_id as string,
          toolInput.role_id as string | null
        )
        return JSON.stringify({
          success: true,
          message: 'Successfully updated group member role',
          member: { id: member.id, person_id: member.person_id },
        })
      }

      // ============================================================================
      // EVENTS & CALENDAR
      // ============================================================================
      case 'list_events': {
        const results = await getEvents({
          search: toolInput.search as string | undefined,
          start_date: toolInput.start_date as string | undefined,
          end_date: toolInput.end_date as string | undefined,
          limit: (toolInput.limit as number) || 20,
        })
        return JSON.stringify({
          success: true,
          count: results.length,
          events: results.map((e) => ({
            id: e.id,
            name: e.name,
            start_date: e.start_date,
            start_time: e.start_time,
            end_date: e.end_date,
            end_time: e.end_time,
          })),
        })
      }

      case 'get_calendar_events': {
        const allEvents = await getCalendarEventsForCalendar()
        const filterDate = toolInput.date as string | undefined

        let filteredEvents = allEvents
        if (filterDate) {
          filteredEvents = allEvents.filter((e) => {
            if (!e.start_datetime) return false
            const eventDate = e.start_datetime.split('T')[0]
            return eventDate === filterDate
          })
        } else {
          const today = new Date().toISOString().split('T')[0]
          filteredEvents = allEvents.filter((e) => {
            if (!e.start_datetime) return false
            const eventDate = e.start_datetime.split('T')[0]
            return eventDate >= today
          }).slice(0, 20)
        }

        return JSON.stringify({
          success: true,
          count: filteredEvents.length,
          date_filter: filterDate || 'upcoming',
          events: filteredEvents.map((e) => ({
            id: e.id,
            title: e.event_title,
            start_datetime: e.start_datetime,
            end_datetime: e.end_datetime,
            location: e.location_name,
            event_type: e.event_type_name,
            is_cancelled: e.is_cancelled,
          })),
        })
      }

      // ============================================================================
      // MASSES
      // ============================================================================
      case 'list_masses': {
        const results = await getMasses({
          search: toolInput.search as string | undefined,
          start_date: toolInput.start_date as string | undefined,
          end_date: toolInput.end_date as string | undefined,
          status: toolInput.status as 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'all' | undefined,
          limit: (toolInput.limit as number) || 20,
        })
        return JSON.stringify({
          success: true,
          count: results.length,
          masses: results.map((m) => ({
            id: m.id,
            presider: m.presider?.full_name,
            homilist: m.homilist?.full_name,
            status: m.status,
            datetime: m.primary_calendar_event?.start_datetime,
            location: m.primary_calendar_event?.location?.name,
          })),
        })
      }

      case 'get_mass': {
        const mass = await getMassWithRelations(toolInput.id as string)
        if (!mass) {
          return JSON.stringify({ success: false, error: 'Mass not found' })
        }
        // Get mass role assignments separately
        const massRoles = await getMassRoles(toolInput.id as string)
        return JSON.stringify({
          success: true,
          mass: {
            id: mass.id,
            status: mass.status,
            presider: mass.resolved_fields?.presider?.resolved_value,
            datetime: mass.calendar_events?.[0]?.start_datetime,
            location: mass.calendar_events?.[0]?.location?.name,
            mass_intention: mass.mass_intention ? {
              id: mass.mass_intention.id,
              offered_for: mass.mass_intention.mass_offered_for,
              requested_by: mass.mass_intention.requested_by?.full_name,
            } : null,
            field_values: mass.field_values,
            assignments: massRoles.map((r) => ({
              id: r.id,
              role_id: r.role_id,
              person_id: r.person_id,
              person_name: r.person?.full_name,
            })),
          },
        })
      }

      case 'get_mass_assignments': {
        const roles = await getMassRoles(toolInput.mass_id as string)
        return JSON.stringify({
          success: true,
          count: roles.length,
          assignments: roles.map((r) => ({
            id: r.id,
            role_id: r.role_id,
            person_id: r.person_id,
            person_name: r.person?.full_name,
            notes: r.notes,
          })),
        })
      }

      case 'assign_to_mass': {
        const role = await createMassRole({
          master_event_id: toolInput.mass_id as string,
          role_id: toolInput.role_id as string,
          person_id: toolInput.person_id as string,
          notes: toolInput.notes as string | undefined,
        })
        return JSON.stringify({
          success: true,
          message: 'Successfully assigned person to Mass',
          assignment: { id: role.id, person_id: role.person_id },
        })
      }

      case 'remove_mass_assignment': {
        await deleteMassRole(toolInput.assignment_id as string)
        return JSON.stringify({
          success: true,
          message: 'Successfully removed Mass assignment',
        })
      }

      // ============================================================================
      // MASS INTENTIONS
      // ============================================================================
      case 'list_mass_intentions': {
        const results = await getMassIntentions({
          search: toolInput.search as string | undefined,
          status: toolInput.status as 'REQUESTED' | 'CONFIRMED' | 'FULFILLED' | 'CANCELLED' | 'all' | undefined,
          start_date: toolInput.start_date as string | undefined,
          end_date: toolInput.end_date as string | undefined,
          limit: (toolInput.limit as number) || 20,
        })
        return JSON.stringify({
          success: true,
          count: results.length,
          intentions: results.map((i) => ({
            id: i.id,
            mass_offered_for: i.mass_offered_for,
            requested_by: i.requested_by?.full_name,
            date_requested: i.date_requested,
            status: i.status,
          })),
        })
      }

      case 'get_mass_intention': {
        const intention = await getMassIntention(toolInput.id as string)
        if (!intention) {
          return JSON.stringify({ success: false, error: 'Mass intention not found' })
        }
        return JSON.stringify({
          success: true,
          intention: {
            id: intention.id,
            mass_offered_for: intention.mass_offered_for,
            requested_by_id: intention.requested_by_id,
            date_requested: intention.date_requested,
            date_received: intention.date_received,
            status: intention.status,
            stipend_in_cents: intention.stipend_in_cents,
            note: intention.note,
          },
        })
      }

      // ============================================================================
      // AVAILABILITY & BLACKOUT DATES
      // ============================================================================
      case 'get_person_availability': {
        const blackouts = await getPersonBlackoutDates(toolInput.person_id as string)
        return JSON.stringify({
          success: true,
          count: blackouts.length,
          blackout_dates: blackouts.map((b) => ({
            id: b.id,
            start_date: b.start_date,
            end_date: b.end_date,
            reason: b.reason,
          })),
        })
      }

      case 'check_availability': {
        const isAvailable = await checkPersonAvailability(
          toolInput.person_id as string,
          toolInput.date as string
        )
        return JSON.stringify({
          success: true,
          is_available: isAvailable,
          date: toolInput.date,
        })
      }

      case 'add_blackout_date': {
        const blackout = await createPersonBlackoutDate({
          person_id: toolInput.person_id as string,
          start_date: toolInput.start_date as string,
          end_date: toolInput.end_date as string,
          reason: toolInput.reason as string | undefined,
        })
        return JSON.stringify({
          success: true,
          message: 'Successfully added blackout date',
          blackout: { id: blackout.id, start_date: blackout.start_date, end_date: blackout.end_date },
        })
      }

      case 'remove_blackout_date': {
        await deletePersonBlackoutDate(toolInput.blackout_id as string)
        return JSON.stringify({
          success: true,
          message: 'Successfully removed blackout date',
        })
      }

      // ============================================================================
      // LOCATIONS
      // ============================================================================
      case 'list_locations': {
        const results = await getLocations({
          search: toolInput.search as string | undefined,
        })
        return JSON.stringify({
          success: true,
          count: results.length,
          locations: results.map((l) => ({
            id: l.id,
            name: l.name,
            description: l.description,
            street: l.street,
            city: l.city,
            state: l.state,
          })),
        })
      }

      // ============================================================================
      // CONTENT LIBRARY
      // ============================================================================
      case 'list_contents': {
        const results = await getContents({
          search: toolInput.search as string | undefined,
          language: toolInput.language as 'en' | 'es' | undefined,
          tag_slugs: toolInput.tag_slugs as string[] | undefined,
          limit: (toolInput.limit as number) || 20,
        })
        return JSON.stringify({
          success: true,
          count: results.totalCount,
          contents: results.items.map((c) => ({
            id: c.id,
            title: c.title,
            language: c.language,
            tags: c.tags?.map((t) => t.name),
          })),
        })
      }

      case 'get_content': {
        const content = await getContentById(toolInput.id as string)
        if (!content) {
          return JSON.stringify({ success: false, error: 'Content not found' })
        }
        return JSON.stringify({
          success: true,
          content: {
            id: content.id,
            title: content.title,
            body: content.body,
            language: content.language,
            tags: content.tags?.map((t) => t.name),
          },
        })
      }

      case 'search_content': {
        const results = await searchContentByText(
          toolInput.search_term as string,
          toolInput.language as 'en' | 'es' | undefined,
          (toolInput.limit as number) || 20
        )
        return JSON.stringify({
          success: true,
          count: results.length,
          contents: results.map((c) => ({
            id: c.id,
            title: c.title,
            language: c.language,
            tags: c.tags?.map((t) => t.name),
          })),
        })
      }

      // ============================================================================
      // SETTINGS & CONFIGURATION
      // ============================================================================
      case 'list_event_types': {
        const results = await getEventTypes({
          system_type: toolInput.system_type as 'mass-liturgy' | 'special-liturgy' | 'parish-event' | undefined,
        })
        return JSON.stringify({
          success: true,
          count: results.length,
          event_types: results.map((et) => ({
            id: et.id,
            name: et.name,
            description: et.description,
            system_type: et.system_type,
            icon: et.icon,
          })),
        })
      }

      case 'get_event_type': {
        const eventType = await getEventTypeWithRelations(toolInput.id as string)
        if (!eventType) {
          return JSON.stringify({ success: false, error: 'Event type not found' })
        }
        return JSON.stringify({
          success: true,
          event_type: {
            id: eventType.id,
            name: eventType.name,
            description: eventType.description,
            system_type: eventType.system_type,
            fields: eventType.input_field_definitions?.map((f) => ({
              name: f.name,
              type: f.type,
              required: f.required,
              is_key_person: f.is_key_person,
            })),
          },
        })
      }

      case 'list_custom_lists': {
        const results = await getCustomLists({
          search: toolInput.search as string | undefined,
        })
        return JSON.stringify({
          success: true,
          count: results.length,
          lists: results.map((l) => ({
            id: l.id,
            name: l.name,
            slug: l.slug,
          })),
        })
      }

      case 'get_custom_list': {
        const list = await getCustomListWithItems(toolInput.id as string)
        if (!list) {
          return JSON.stringify({ success: false, error: 'Custom list not found' })
        }
        return JSON.stringify({
          success: true,
          list: {
            id: list.id,
            name: list.name,
            slug: list.slug,
            items: list.items.map((i) => ({
              id: i.id,
              value: i.value,
              order: i.order,
            })),
          },
        })
      }

      case 'list_category_tags': {
        const results = await getCategoryTags()
        return JSON.stringify({
          success: true,
          count: results.length,
          tags: results.map((t) => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            color: t.color,
          })),
        })
      }

      case 'list_event_presets': {
        const eventTypeId = toolInput.event_type_id as string | undefined
        const results = eventTypeId
          ? await getPresetsByEventType(eventTypeId)
          : await getAllPresets()
        return JSON.stringify({
          success: true,
          count: results.length,
          presets: results.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            event_type_id: p.event_type_id,
            event_type_name: 'event_type' in p ? (p as any).event_type?.name : undefined,
          })),
        })
      }

      // ============================================================================
      // MASS TEMPLATES
      // ============================================================================
      case 'get_mass_templates': {
        const dayOfWeek = toolInput.day_of_week as string | undefined
        let templates = await getMassTimesWithItems({ is_active: true })

        // Filter by day of week if specified
        if (dayOfWeek) {
          templates = templates.filter(t => t.day_of_week === dayOfWeek)
        }

        return successResponse(
          templates.map((t) => ({
            id: t.id,
            name: t.name,
            day_of_week: t.day_of_week,
            is_active: t.is_active,
            mass_times: t.items?.map((item) => ({
              id: item.id,
              time: item.time,
              day_type: item.day_type,
            })) || [],
          })),
          templates.length
        )
      }

      // ============================================================================
      // MASS ASSIGNMENT COVERAGE
      // ============================================================================
      case 'find_mass_assignment_gaps': {
        const daysAhead = (toolInput.days_ahead as number) || 7
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Calculate date range
        let startDate = toolInput.start_date as string | undefined
        let endDate = toolInput.end_date as string | undefined

        if (!startDate) {
          startDate = today.toISOString().split('T')[0]
        }
        if (!endDate) {
          const futureDate = new Date(today)
          futureDate.setDate(futureDate.getDate() + daysAhead)
          endDate = futureDate.toISOString().split('T')[0]
        }

        // Get optional group filter
        const filterGroupId = toolInput.group_id as string | undefined
        const filterGroupName = toolInput.group_name as string | undefined

        // Get groups for the parish to resolve role_id to names
        const allGroups = await getGroups({})
        const groupMap = new Map(allGroups.map(g => [g.id, g.name]))

        // If filtering by group name, find the group ID
        let targetGroupId: string | undefined = filterGroupId
        if (filterGroupName && !targetGroupId) {
          const matchingGroup = allGroups.find(g =>
            g.name.toLowerCase().includes(filterGroupName.toLowerCase())
          )
          if (matchingGroup) {
            targetGroupId = matchingGroup.id
          }
        }

        // Get Masses in the date range
        const masses = await getMasses({
          start_date: startDate,
          end_date: endDate + 'T23:59:59', // Include full end day
          status: 'ACTIVE',
          limit: 100,
        })

        // Filter to Masses actually in the date range
        const filteredMasses = masses.filter(m => {
          const datetime = m.primary_calendar_event?.start_datetime
          if (!datetime) return false
          const eventDate = datetime.split('T')[0]
          return eventDate >= startDate! && eventDate <= endDate!
        })

        // Sort by datetime
        filteredMasses.sort((a, b) => {
          const dateA = a.primary_calendar_event?.start_datetime || ''
          const dateB = b.primary_calendar_event?.start_datetime || ''
          return dateA.localeCompare(dateB)
        })

        // For each Mass, get role assignments
        const massesWithCoverage = await Promise.all(
          filteredMasses.map(async (mass) => {
            let roles = await getMassRoles(mass.id)

            // Filter by group if specified
            if (targetGroupId) {
              roles = roles.filter(r => r.role_id === targetGroupId)
            }

            // Group assignments by role_id
            const assignmentsByRole: Record<string, { roleName: string; count: number; people: string[] }> = {}
            for (const role of roles) {
              const roleName = groupMap.get(role.role_id) || 'Unknown Role'
              if (!assignmentsByRole[role.role_id]) {
                assignmentsByRole[role.role_id] = { roleName, count: 0, people: [] }
              }
              assignmentsByRole[role.role_id].count++
              if (role.person?.full_name) {
                assignmentsByRole[role.role_id].people.push(role.person.full_name)
              }
            }

            const datetime = mass.primary_calendar_event?.start_datetime
            const formattedDate = datetime
              ? new Date(datetime).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })
              : 'Unknown'

            return {
              mass_id: mass.id,
              datetime: datetime,
              formatted_datetime: formattedDate,
              presider: mass.presider?.full_name || 'Unassigned',
              location: mass.primary_calendar_event?.location?.name || 'Unknown',
              total_assignments: roles.length,
              assignments_by_role: Object.values(assignmentsByRole),
              has_no_assignments: roles.length === 0,
            }
          })
        )

        // Identify Masses with potential gaps (no assignments)
        const massesNeedingCoverage = massesWithCoverage.filter(m => m.has_no_assignments)

        return successResponse(
          {
            date_range: { start: startDate, end: endDate },
            filter_applied: targetGroupId ? (filterGroupName || 'By group ID') : null,
            total_masses: massesWithCoverage.length,
            masses_needing_coverage: massesNeedingCoverage.length,
            masses: massesWithCoverage,
          },
          massesWithCoverage.length,
          massesNeedingCoverage.length > 0
            ? `Found ${massesNeedingCoverage.length} Masses that may need ministry assignments`
            : `All ${massesWithCoverage.length} Masses have at least some assignments`
        )
      }

      // ============================================================================
      // DELETE OPERATIONS (with confirmation pattern)
      // ============================================================================
      case 'delete_person': {
        const personId = toolInput.id as string
        const confirmed = toolInput.confirmed as boolean

        // First, get the person to confirm what we're deleting
        const person = await getPerson(personId)
        if (!person) {
          return errorResponse('Person not found')
        }

        if (!confirmed) {
          return confirmationRequired(
            'delete_person',
            { id: personId, name: person.full_name, type: 'person' },
            `Are you sure you want to delete ${person.full_name}? This action cannot be undone.`
          )
        }

        await deletePerson(personId)

        // Log AI activity
        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'delete_person',
          entityType: 'person',
          entityId: personId,
          entityName: person.full_name,
        })

        return successResponse(
          { id: personId, name: person.full_name },
          undefined,
          `Successfully deleted ${person.full_name}`
        )
      }

      case 'delete_family': {
        const familyId = toolInput.id as string
        const confirmed = toolInput.confirmed as boolean

        // First, get the family to confirm what we're deleting
        const family = await getFamily(familyId)
        if (!family) {
          return errorResponse('Family not found')
        }

        if (!confirmed) {
          return confirmationRequired(
            'delete_family',
            { id: familyId, name: family.family_name, type: 'family' },
            `Are you sure you want to delete the ${family.family_name} family? This will remove all family member relationships. This action cannot be undone.`
          )
        }

        await deleteFamily(familyId)

        // Log AI activity
        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'delete_family',
          entityType: 'family',
          entityId: familyId,
          entityName: family.family_name,
        })

        return successResponse(
          { id: familyId, name: family.family_name },
          undefined,
          `Successfully deleted the ${family.family_name} family`
        )
      }

      case 'delete_event': {
        const eventId = toolInput.id as string
        const confirmed = toolInput.confirmed as boolean

        // First, get the event to confirm what we're deleting
        const targetEvent = await getEvent(eventId)
        if (!targetEvent) {
          return errorResponse('Event not found')
        }

        if (!confirmed) {
          return confirmationRequired(
            'delete_event',
            { id: eventId, name: targetEvent.name || 'Unnamed event', type: 'event' },
            `Are you sure you want to delete the event "${targetEvent.name || 'Unnamed event'}"? This action cannot be undone.`
          )
        }

        await deleteEvent(eventId)

        // Log AI activity
        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'delete_event',
          entityType: 'event',
          entityId: eventId,
          entityName: targetEvent.name || 'Unnamed event',
        })

        return successResponse(
          { id: eventId, name: targetEvent.name },
          undefined,
          `Successfully deleted the event`
        )
      }

      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` })
    }
  } catch (error) {
    console.error(`Error executing tool ${toolName}:`, error)
    return JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    })
  }
}

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

function getSystemPrompt(): string {
  const today = new Date().toISOString().split('T')[0]
  return `You are a helpful parish management assistant for Catholic parishes. You help staff search for and manage parish data including people, events, calendar, Masses, families, groups, and more.

Today's date is ${today}.

## Catholic Perspective
Responses should align with Catholic teaching and parish values. Be respectful of the sacraments and liturgical traditions.

## Core Guidelines
- Be professional, helpful, and concise
- When listing results, format them clearly and readably
- If a search returns no results, suggest the user try different search terms
- For create/update operations, confirm what was done
- Always use the available tools to fulfill data requests - don't make up information
- For calendar queries like "what's on today" or "what's happening this week", use the get_calendar_events tool

## One at a Time Rule
All modifications and deletions must happen to single records only. Never batch updates.

## Delete Confirmation Pattern
When a user asks to delete a record (person, family, event), you MUST:
1. First call the delete tool WITHOUT the confirmed=true flag
2. The tool will return a confirmation request - present this to the user
3. ONLY after the user explicitly confirms (says "yes", "confirm", etc.), call the tool AGAIN with confirmed=true
4. Never delete without explicit user confirmation

Example flow:
User: "Delete John Smith from the directory"
You: [Call delete_person with id only]
Tool: Returns confirmation request
You: "Are you sure you want to delete John Smith? This action cannot be undone."
User: "Yes, delete him"
You: [Call delete_person with confirmed=true]
Tool: Returns success
You: "Done! John Smith has been removed from the directory."

## Available Operations

### People & Directory
- Search and list people in the directory
- Get detailed information about a specific person
- Create new people in the directory
- Update person information (name, contact, pronunciation, etc.)
- Delete people (with confirmation)

### Families
- List families
- Get family details with members
- Create new families
- Add/remove family members
- Set primary contact
- Delete families (with confirmation)

### Groups & Ministries
- List groups/ministries (choir, lectors, ushers, etc.)
- Get group details with members
- See what groups a person belongs to
- Add/remove people from groups
- Update member roles

### Events & Calendar
- List and search events
- Get calendar events for specific dates
- View upcoming events
- Delete events (with confirmation)

### Masses
- List Masses with presider/homilist info
- Get detailed Mass information
- View/manage Mass role assignments (lectors, ushers, servers)
- Assign people to Mass roles
- Get recurring Mass schedule templates
- **Find Mass assignment gaps** - Check upcoming Masses for ministry coverage, see which Masses need assignments, filter by specific ministry

### Mass Intentions
- List Mass intentions
- Get intention details

### Availability
- Check person's blackout dates
- Check if someone is available on a specific date
- Add/remove blackout dates

### Locations
- List parish locations and venues

### Content Library
- Search readings, prayers, and blessings
- Get full content text
- Filter by language or tags

### Configuration (Read-Only)
- List event types (Wedding, Funeral, Baptism, etc.)
- Get special liturgies (event types with system_type='special-liturgy')
- View event type fields
- List custom lists and their items
- List category tags
- List event presets
- Get Mass schedule templates

## Navigation Hints - When Something Isn't Possible

When the user requests something you cannot do, direct them to the appropriate place in the UI:

### Creating Sacramental Events
"Sacramental events like weddings, funerals, and baptisms have many required fields. To create one:
- Go to **Weddings** / **Funerals** / **Baptisms** in the sidebar
- Click the **+ New** button
- Fill out the form with all required details"

### Financial Operations (Stipends, Payments)
"Financial operations need to go through the main interface for proper record-keeping:
- Go to **Masses** in the sidebar
- Open the specific Mass
- Click on the **Mass Intentions** section
- Update the stipend information there"

### User Management
"User management requires admin access:
- Go to **Settings** in the sidebar
- Click **Parish Settings**
- Select the **Users** tab
- From there you can invite, edit roles, or remove access"

### Mass Schedule Templates
"Mass schedule templates affect the recurring schedule:
- Go to **Settings** in the sidebar
- Click **Mass Configuration**
- Select the template to edit
- Add, edit, or remove Mass times"

### Event Type Configuration
"To modify event types, fields, or scripts:
- Go to **Settings** in the sidebar
- Click **Event Types**
- Select the event type to configure"

## Things You Should NOT Do

### No Bulk Operations
"I can only make changes one at a time. I'd be happy to help you update them individually, or you can use the main interface for bulk operations."

### No Cross-Parish Access
You can only access data for the current parish.

### No Sensitive Data Modification
Do not modify user passwords, auth settings, or sensitive configuration without explicit direction.

## Response Format
- Keep responses concise but informative
- Use bullet points for lists
- Include relevant IDs when discussing specific records (helpful for follow-up actions)
- When showing people, include their full name and any relevant contact info
- Use markdown formatting for navigation hints (bold for sidebar items)`
}

// ============================================================================
// MAIN CHAT FUNCTION
// ============================================================================

export async function staffChatWithAI(
  userId: string,
  message: string,
  conversationId: string | null
): Promise<{ response: string; conversationId: string }> {
  try {
    // 1. Verify authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      return {
        response: 'Unauthorized. Please log in again.',
        conversationId: conversationId || '',
      }
    }

    // 2. Get parish context
    const parishId = await requireSelectedParish()

    // 3. Rate limiting
    const rateLimitResult = rateLimit(`staff-chat:${userId}`, RATE_LIMITS.chat)
    if (!rateLimitResult.success) {
      return {
        response: 'Too many messages. Please wait a moment before sending another.',
        conversationId: conversationId || '',
      }
    }

    // 4. Get conversation history if exists
    const adminClient = createAdminClient()
    let conversationHistory: ChatMessage[] = []

    if (conversationId) {
      const { data } = await adminClient
        .from('staff_chat_conversations')
        .select('conversation_history')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single()

      if (data?.conversation_history) {
        conversationHistory = data.conversation_history as ChatMessage[]
      }
    }

    // 5. Build messages for Claude API
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

    // 6. Call Claude API with tools
    let response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: getSystemPrompt(),
      messages,
      tools,
    })

    // 7. Agentic tool loop - keep going while Claude wants to use tools
    while (response.stop_reason === 'tool_use') {
      // Extract tool use blocks
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      )

      // Execute each tool and collect results
      const toolResults: Anthropic.ToolResultBlockParam[] = []
      for (const toolUse of toolUseBlocks) {
        const result = await executeTool(toolUse.name, toolUse.input as Record<string, unknown>, { userId, parishId })
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: result,
        })
      }

      // Continue conversation with tool results
      response = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        system: getSystemPrompt(),
        messages: [
          ...messages,
          {
            role: 'assistant',
            content: response.content,
          },
          {
            role: 'user',
            content: toolResults,
          },
        ],
        tools,
      })
    }

    // 8. Extract final text response
    const textBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    )
    const finalResponse = textBlocks.map((block) => block.text).join('\n')

    // 9. Save conversation to database
    const newHistory: ChatMessage[] = [
      ...conversationHistory,
      { role: 'user', content: message, timestamp: new Date().toISOString() },
      { role: 'assistant', content: finalResponse, timestamp: new Date().toISOString() },
    ]

    let convId = conversationId

    if (!convId) {
      // Create new conversation
      const { data: newConv } = await adminClient
        .from('staff_chat_conversations')
        .insert({
          parish_id: parishId,
          user_id: userId,
          conversation_history: newHistory,
        })
        .select('id')
        .single()

      convId = newConv?.id || ''
    } else {
      // Update existing conversation
      await adminClient
        .from('staff_chat_conversations')
        .update({
          conversation_history: newHistory,
          updated_at: new Date().toISOString(),
        })
        .eq('id', convId)
    }

    return {
      response: finalResponse,
      conversationId: convId || '',
    }
  } catch (error) {
    console.error('Error in staff chat:', error)
    return {
      response: "I'm having trouble connecting. Please try again.",
      conversationId: conversationId || '',
    }
  }
}
