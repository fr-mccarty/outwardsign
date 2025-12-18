'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import type {
  MasterEvent,
  MasterEventWithRelations,
  CreateMasterEventData,
  UpdateMasterEventData,
  EventType,
  InputFieldDefinition,
  CalendarEvent,
  Person,
  Group,
  Location,
  CustomListItem,
  Document,
  Content,
  Petition,
  ResolvedFieldValue,
  MasterEventRole,
  MasterEventRoleWithPerson
} from '@/lib/types'
import { LIST_VIEW_PAGE_SIZE } from '@/lib/constants'
import type { SystemType } from '@/lib/constants/system-types'

export interface MasterEventFilterParams {
  search?: string
  systemType?: SystemType | 'all'
  status?: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'all'
  eventTypeId?: string
  startDate?: string
  endDate?: string
  sort?: 'date_asc' | 'date_desc' | 'created_asc' | 'created_desc'
  offset?: number
  limit?: number
}

export interface MasterEventWithTypeAndCalendarEvent extends MasterEvent {
  event_type?: EventType
  primary_calendar_event?: CalendarEvent
}

/**
 * Get all master events for the parish (used by dashboard)
 */
export async function getMasterEvents(): Promise<(MasterEvent & { event_type?: EventType })[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('master_events')
    .select('*, event_type:event_types(*)')
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50) // Limit for dashboard performance

  if (error) {
    console.error('Error fetching master events:', error)
    return []
  }

  return data || []
}

/**
 * Get all master events across all event types for the main events list
 */
export async function getAllMasterEvents(
  filters?: MasterEventFilterParams
): Promise<MasterEventWithTypeAndCalendarEvent[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const offset = filters?.offset || 0
  const limit = filters?.limit || LIST_VIEW_PAGE_SIZE

  // Build query
  let query = supabase
    .from('master_events')
    .select('*, event_type:event_types!inner(*)')
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)

  // Filter by system type if provided (filter on joined event_types table)
  if (filters?.systemType && filters.systemType !== 'all') {
    query = query.eq('event_type.system_type', filters.systemType)
  }

  // Filter by status if provided
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  // Filter by event type if provided
  if (filters?.eventTypeId) {
    query = query.eq('event_type_id', filters.eventTypeId)
  }

  // Apply sorting (default to created_at for now, date sorting requires join)
  if (filters?.sort === 'created_asc') {
    query = query.order('created_at', { ascending: true })
  } else if (filters?.sort === 'created_desc') {
    query = query.order('created_at', { ascending: false })
  } else {
    // Default to most recent first
    query = query.order('created_at', { ascending: false })
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1)

  const { data: events, error } = await query

  if (error) {
    console.error('Error fetching all master events:', error)
    throw new Error('Failed to fetch events')
  }

  if (!events || events.length === 0) {
    return []
  }

  // Fetch primary calendar events for all events
  const eventIds = events.map(e => e.id)
  const { data: calendarEvents } = await supabase
    .from('calendar_events')
    .select('*, location:locations(*)')
    .in('master_event_id', eventIds)
    .eq('is_primary', true)
    .is('deleted_at', null)

  // Create a map of master_event_id to primary calendar event
  const calendarEventMap = new Map(calendarEvents?.map(ce => [ce.master_event_id, ce]) || [])

  // Combine events with their primary calendar events
  const eventsWithCalendarEvents: MasterEventWithTypeAndCalendarEvent[] = events.map(event => ({
    ...event,
    primary_calendar_event: calendarEventMap.get(event.id) || undefined
  }))

  // Apply date filters if provided (post-fetch since calendar events are separate)
  let filteredEvents = eventsWithCalendarEvents
  if (filters?.startDate) {
    filteredEvents = filteredEvents.filter(e =>
      e.primary_calendar_event?.start_datetime && e.primary_calendar_event.start_datetime >= filters.startDate!
    )
  }
  if (filters?.endDate) {
    filteredEvents = filteredEvents.filter(e =>
      e.primary_calendar_event?.start_datetime && e.primary_calendar_event.start_datetime <= filters.endDate!
    )
  }

  // Apply date sorting if requested
  if (filters?.sort === 'date_asc') {
    filteredEvents.sort((a, b) => {
      const dateA = a.primary_calendar_event?.start_datetime || ''
      const dateB = b.primary_calendar_event?.start_datetime || ''
      return dateA.localeCompare(dateB)
    })
  } else if (filters?.sort === 'date_desc') {
    filteredEvents.sort((a, b) => {
      const dateA = a.primary_calendar_event?.start_datetime || ''
      const dateB = b.primary_calendar_event?.start_datetime || ''
      return dateB.localeCompare(dateA)
    })
  }

  return filteredEvents
}

/**
 * Get all events for a specific event type
 */
export async function getEvents(
  eventTypeId: string,
  filters?: MasterEventFilterParams
): Promise<MasterEvent[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Calculate pagination
  const offset = filters?.offset || 0
  const limit = filters?.limit || LIST_VIEW_PAGE_SIZE

  let query = supabase
    .from('master_events')
    .select('*')
    .eq('parish_id', selectedParishId)
    .eq('event_type_id', eventTypeId)
    .is('deleted_at', null)

  // Apply sorting
  if (filters?.sort === 'created_asc') {
    query = query.order('created_at', { ascending: true })
  } else if (filters?.sort === 'created_desc') {
    query = query.order('created_at', { ascending: false })
  } else {
    // Default to most recent first
    query = query.order('created_at', { ascending: false })
  }

  // Apply pagination at database level
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching events:', error)
    throw new Error('Failed to fetch events')
  }

  let events = data || []

  // Apply search and date filters in application layer if needed
  if (filters?.search || filters?.startDate || filters?.endDate) {
    // Get event type to find key person fields
    const { data: eventType } = await supabase
      .from('event_types')
      .select('*, input_field_definitions!input_field_definitions_event_type_id_fkey(*)')
      .eq('id', eventTypeId)
      .is('deleted_at', null)
      .single()

    if (eventType) {
      const keyPersonFields = eventType.input_field_definitions?.filter(
        (field: InputFieldDefinition) => field.is_key_person && field.type === 'person'
      ) || []

      // For search filter - search key person names
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase()

        // Collect all person IDs from key person fields
        const personIds = new Set<string>()
        for (const event of events) {
          for (const field of keyPersonFields) {
            const personId = event.field_values?.[field.name]
            if (personId && typeof personId === 'string') {
              personIds.add(personId)
            }
          }
        }

        // Fetch all people at once
        if (personIds.size > 0) {
          const { data: people } = await supabase
            .from('people')
            .select('id, full_name')
            .in('id', Array.from(personIds))

          // Create lookup map
          const peopleMap = new Map(people?.map(p => [p.id, p]) || [])

          // Filter events
          events = events.filter(event => {
            for (const field of keyPersonFields) {
              const personId = event.field_values?.[field.name]
              if (personId) {
                const person = peopleMap.get(personId)
                if (person && person.full_name.toLowerCase().includes(searchTerm)) {
                  return true
                }
              }
            }
            return false
          })
        } else {
          events = []
        }
      }

      // For date range filter - filter on primary calendar event date
      if (filters?.startDate || filters?.endDate) {
        const eventIds = events.map(e => e.id)
        if (eventIds.length > 0) {
          let calendarEventsQuery = supabase
            .from('calendar_events')
            .select('master_event_id')
            .in('master_event_id', eventIds)
            .eq('is_primary', true)
            .is('deleted_at', null)

          if (filters?.startDate) {
            calendarEventsQuery = calendarEventsQuery.gte('start_datetime', filters.startDate)
          }
          if (filters?.endDate) {
            calendarEventsQuery = calendarEventsQuery.lte('start_datetime', filters.endDate)
          }

          const { data: matchingCalendarEvents } = await calendarEventsQuery

          const matchingEventIds = new Set(matchingCalendarEvents?.map(ce => ce.master_event_id) || [])
          events = events.filter(e => matchingEventIds.has(e.id))
        } else {
          events = []
        }
      }
    }
  }

  // Apply date sorting if requested (requires fetching calendar events)
  if (filters?.sort === 'date_asc' || filters?.sort === 'date_desc') {
    const eventIds = events.map(e => e.id)
    if (eventIds.length > 0) {
      const { data: calendarEvents } = await supabase
        .from('calendar_events')
        .select('master_event_id, start_datetime')
        .in('master_event_id', eventIds)
        .eq('is_primary', true)
        .is('deleted_at', null)

      // Create map of master_event_id to primary calendar event start_datetime
      const dateMap = new Map(calendarEvents?.map(ce => [ce.master_event_id, ce.start_datetime]) || [])

      events.sort((a, b) => {
        const dateA = dateMap.get(a.id) || ''
        const dateB = dateMap.get(b.id) || ''
        if (filters?.sort === 'date_asc') {
          return dateA.localeCompare(dateB)
        } else {
          return dateB.localeCompare(dateA)
        }
      })
    }
  }

  return events
}

/**
 * Get a single event by ID
 */
export async function getEvent(id: string): Promise<MasterEvent | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('master_events')
    .select('*')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching event:', error)
    throw new Error('Failed to fetch event')
  }

  return data
}

/**
 * Get event with all related data (event type, calendar events, presider, homilist, resolved field values, parish)
 */
export async function getEventWithRelations(id: string): Promise<MasterEventWithRelations | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the event
  const { data: event, error } = await supabase
    .from('master_events')
    .select('*')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching event:', error)
    throw new Error('Failed to fetch event')
  }

  // Fetch event type, calendar events, presider, homilist, roles, and parish in parallel
  const [eventTypeData, calendarEventsData, presiderData, homilistData, rolesData, parishData] = await Promise.all([
    supabase
      .from('event_types')
      .select('*, input_field_definitions!input_field_definitions_event_type_id_fkey(*)')
      .eq('id', event.event_type_id)
      .eq('parish_id', selectedParishId)
      .is('deleted_at', null)
      .single(),
    supabase
      .from('calendar_events')
      .select('*, location:locations(*)')
      .eq('master_event_id', id)
      .is('deleted_at', null)
      .order('start_datetime', { ascending: true })
      .order('created_at', { ascending: true }),
    event.presider_id
      ? supabase.from('people').select('*').eq('id', event.presider_id).single()
      : Promise.resolve({ data: null, error: null }),
    event.homilist_id
      ? supabase.from('people').select('*').eq('id', event.homilist_id).single()
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from('master_event_roles')
      .select('*')
      .eq('master_event_id', id)
      .is('deleted_at', null),
    supabase
      .from('parishes')
      .select('name, city, state')
      .eq('id', selectedParishId)
      .single()
  ])

  if (eventTypeData.error) {
    console.error('Error fetching event type:', eventTypeData.error, { eventTypeId: event.event_type_id, selectedParishId })
    throw new Error('Failed to fetch event type')
  }

  if (calendarEventsData.error) {
    console.error('Error fetching calendar events:', calendarEventsData.error)
    throw new Error('Failed to fetch calendar events')
  }

  const eventType = eventTypeData.data as EventType
  const calendarEvents = calendarEventsData.data as CalendarEvent[]
  const presider = presiderData.data as Person | null
  const homilist = homilistData.data as Person | null
  const inputFieldDefinitions = eventTypeData.data.input_field_definitions as InputFieldDefinition[]

  // Resolve field values
  const resolvedFields: Record<string, ResolvedFieldValue> = {}

  for (const fieldDef of inputFieldDefinitions) {
    const rawValue = event.field_values?.[fieldDef.name]

    const resolvedField: ResolvedFieldValue = {
      field_name: fieldDef.name,
      field_type: fieldDef.type,
      raw_value: rawValue
    }

    // Resolve references based on field type
    if (rawValue) {
      try {
        switch (fieldDef.type) {
          case 'person': {
            const { data: person } = await supabase
              .from('people')
              .select('*')
              .eq('id', rawValue)
              .single()
            resolvedField.resolved_value = person as Person | null
            break
          }
          case 'group': {
            const { data: group } = await supabase
              .from('groups')
              .select('*')
              .eq('id', rawValue)
              .single()
            resolvedField.resolved_value = group as Group | null
            break
          }
          case 'location': {
            const { data: location } = await supabase
              .from('locations')
              .select('*')
              .eq('id', rawValue)
              .single()
            resolvedField.resolved_value = location as Location | null
            break
          }
          case 'event_link': {
            const { data: linkedEvent } = await supabase
              .from('master_events')
              .select('*')
              .eq('id', rawValue)
              .is('deleted_at', null)
              .single()
            resolvedField.resolved_value = linkedEvent as MasterEvent | null
            break
          }
          case 'list_item': {
            const { data: listItem } = await supabase
              .from('custom_list_items')
              .select('*')
              .eq('id', rawValue)
              .is('deleted_at', null)
              .single()
            resolvedField.resolved_value = listItem as CustomListItem | null
            break
          }
          case 'document': {
            const { data: document } = await supabase
              .from('documents')
              .select('*')
              .eq('id', rawValue)
              .is('deleted_at', null)
              .single()
            resolvedField.resolved_value = document as Document | null
            break
          }
          case 'content': {
            // Hybrid support: Check if rawValue is a UUID (new content reference) or text (legacy)
            const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            const isUUID = typeof rawValue === 'string' && UUID_REGEX.test(rawValue)

            if (isUUID) {
              // New content reference - fetch from database
              const { data: content } = await supabase
                .from('contents')
                .select('*')
                .eq('id', rawValue)
                .single()
              resolvedField.resolved_value = content as Content | null
            } else {
              // Legacy text value - raw_value is the content itself
              // No need to set resolved_value, raw_value is sufficient
            }
            break
          }
          case 'petition': {
            // Petition reference - fetch from database
            const { data: petition } = await supabase
              .from('petitions')
              .select('*')
              .eq('id', rawValue)
              .single()
            resolvedField.resolved_value = petition as Petition | null
            break
          }
          // For non-reference types, raw_value is sufficient
          default:
            break
        }
      } catch (err) {
        console.error(`Error resolving field ${fieldDef.name}:`, err)
        // Keep resolved_value as undefined
      }
    }

    resolvedFields[fieldDef.name] = resolvedField
  }

  return {
    ...event,
    event_type: eventType,
    calendar_events: calendarEvents,
    presider: presider || undefined,
    homilist: homilist || undefined,
    roles: rolesData.data || [],
    resolved_fields: resolvedFields,
    parish: parishData.data ? {
      name: parishData.data.name,
      city: parishData.data.city,
      state: parishData.data.state
    } : undefined
  }
}

/**
 * Create a new event
 */
export async function createEvent(
  eventTypeId: string,
  data: CreateMasterEventData
): Promise<MasterEvent> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Validate required fields against input field definitions
  const { data: eventType, error: eventTypeError } = await supabase
    .from('event_types')
    .select('*, input_field_definitions!input_field_definitions_event_type_id_fkey(*)')
    .eq('id', eventTypeId)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (eventTypeError || !eventType) {
    console.error('Error fetching event type:', eventTypeError, { eventTypeId, selectedParishId })
    throw new Error('Event type not found')
  }

  const inputFieldDefinitions = eventType.input_field_definitions as InputFieldDefinition[]
  for (const fieldDef of inputFieldDefinitions) {
    if (fieldDef.required && !data.field_values[fieldDef.name]) {
      throw new Error(`Required field "${fieldDef.name}" is missing`)
    }
  }

  // Validate calendar events (at least one, exactly one primary)
  if (!data.calendar_events || data.calendar_events.length === 0) {
    throw new Error('At least one calendar event is required')
  }

  const primaryCalendarEvents = data.calendar_events.filter(ce => ce.is_primary)
  if (primaryCalendarEvents.length !== 1) {
    throw new Error('Exactly one calendar event must be marked as primary')
  }

  // Insert event
  const { data: newEvent, error: eventError } = await supabase
    .from('master_events')
    .insert([
      {
        parish_id: selectedParishId,
        event_type_id: eventTypeId,
        field_values: data.field_values,
        presider_id: data.presider_id || null,
        homilist_id: data.homilist_id || null
      }
    ])
    .select()
    .single()

  if (eventError) {
    console.error('Error creating event:', eventError)
    throw new Error('Failed to create event')
  }

  // Insert calendar events
  const calendarEventsToInsert = data.calendar_events.map(calendarEvent => ({
    master_event_id: newEvent.id,
    parish_id: selectedParishId, // Required for RLS
    input_field_definition_id: calendarEvent.input_field_definition_id,
    start_datetime: calendarEvent.start_datetime || null,
    end_datetime: calendarEvent.end_datetime || null,
    location_id: calendarEvent.location_id || null,
    is_primary: calendarEvent.is_primary || false,
    is_cancelled: false
  }))

  const { error: calendarEventsError } = await supabase
    .from('calendar_events')
    .insert(calendarEventsToInsert)

  if (calendarEventsError) {
    console.error('Error creating calendar events:', calendarEventsError)
    // Rollback event creation
    await supabase.from('master_events').delete().eq('id', newEvent.id)
    throw new Error('Failed to create calendar events')
  }

  revalidatePath(`/events/${eventTypeId}`)
  return newEvent
}

/**
 * Update an existing event
 */
export async function updateEvent(
  id: string,
  data: UpdateMasterEventData
): Promise<MasterEvent> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get existing event
  const { data: existingEvent } = await supabase
    .from('master_events')
    .select('*')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (!existingEvent) {
    throw new Error('Event not found')
  }

  // Build update object
  const updateData: Partial<MasterEvent> = {}

  if (data.field_values !== undefined) {
    updateData.field_values = data.field_values
  }
  if (data.presider_id !== undefined) {
    updateData.presider_id = data.presider_id
  }
  if (data.homilist_id !== undefined) {
    updateData.homilist_id = data.homilist_id
  }

  // Update event if there are changes
  if (Object.keys(updateData).length > 0) {
    const { data: updatedEvent, error } = await supabase
      .from('master_events')
      .update(updateData)
      .eq('id', id)
      .eq('parish_id', selectedParishId)
      .select()
      .single()

    if (error) {
      console.error('Error updating event:', error)
      throw new Error('Failed to update event')
    }

    revalidatePath(`/events/${existingEvent.event_type_id}`)
    revalidatePath(`/events/${existingEvent.event_type_id}/${id}`)

    return updatedEvent
  }

  revalidatePath(`/events/${existingEvent.event_type_id}`)
  revalidatePath(`/events/${existingEvent.event_type_id}/${id}`)

  return existingEvent
}

/**
 * Delete an event
 */
export async function deleteEvent(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get event to find event_type_id for revalidation
  const { data: event } = await supabase
    .from('master_events')
    .select('event_type_id')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (!event) {
    throw new Error('Event not found')
  }

  // Hard delete (will cascade to calendar events)
  const { error } = await supabase
    .from('master_events')
    .delete()
    .eq('id', id)
    .eq('parish_id', selectedParishId)

  if (error) {
    console.error('Error deleting event:', error)
    throw new Error('Failed to delete event')
  }

  revalidatePath(`/events/${event.event_type_id}`)
}

/**
 * Assign presider to master event
 */
export async function assignPresiderToMasterEvent(eventId: string, personId: string | null): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Validate person exists in same parish if provided
  if (personId) {
    const { data: person } = await supabase
      .from('people')
      .select('id')
      .eq('id', personId)
      .eq('parish_id', selectedParishId)
      .single()

    if (!person) {
      throw new Error('Person not found in parish')
    }
  }

  // Get event to find event_type_id for revalidation
  const { data: event } = await supabase
    .from('master_events')
    .select('event_type_id')
    .eq('id', eventId)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (!event) {
    throw new Error('Event not found')
  }

  // Update presider_id
  const { error } = await supabase
    .from('master_events')
    .update({ presider_id: personId })
    .eq('id', eventId)
    .eq('parish_id', selectedParishId)

  if (error) {
    console.error('Error assigning presider:', error)
    throw new Error('Failed to assign presider')
  }

  revalidatePath(`/events/${event.event_type_id}/${eventId}`)
}

/**
 * Assign homilist to master event
 */
export async function assignHomilisToMasterEvent(eventId: string, personId: string | null): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Validate person exists in same parish if provided
  if (personId) {
    const { data: person } = await supabase
      .from('people')
      .select('id')
      .eq('id', personId)
      .eq('parish_id', selectedParishId)
      .single()

    if (!person) {
      throw new Error('Person not found in parish')
    }
  }

  // Get event to find event_type_id for revalidation
  const { data: event } = await supabase
    .from('master_events')
    .select('event_type_id')
    .eq('id', eventId)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (!event) {
    throw new Error('Event not found')
  }

  // Update homilist_id
  const { error } = await supabase
    .from('master_events')
    .update({ homilist_id: personId })
    .eq('id', eventId)
    .eq('parish_id', selectedParishId)

  if (error) {
    console.error('Error assigning homilist:', error)
    throw new Error('Failed to assign homilist')
  }

  revalidatePath(`/events/${event.event_type_id}/${eventId}`)
}

/**
 * Calendar calendar event item - flattened data for calendar display
 */
export interface CalendarCalendarEventItem {
  id: string  // calendar_event.id
  master_event_id: string
  start_datetime: string
  end_datetime: string | null
  input_field_definition_id: string
  location_id: string | null
  location_name: string | null
  is_primary: boolean
  is_cancelled: boolean
  // From master_event
  event_title: string
  event_field_values: Record<string, unknown>
  // From event_type
  event_type_id: string
  event_type_slug: string
  event_type_name: string
  event_type_icon: string | null
  // Module link (computed)
  module_type: string | null
  module_id: string | null
}

/**
 * Get all calendar events for calendar display
 * Fetches calendar events with their parent master events and event types
 * for rendering on the parish calendar
 */
export async function getCalendarEventsForCalendar(): Promise<CalendarCalendarEventItem[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Fetch all calendar events with their parent master events and event types
  const { data: calendarEvents, error } = await supabase
    .from('calendar_events')
    .select(`
      id,
      master_event_id,
      input_field_definition_id,
      start_datetime,
      end_datetime,
      location_id,
      is_primary,
      is_cancelled,
      location:locations(name),
      master_event:master_events!inner(
        id,
        field_values,
        parish_id,
        event_type:event_types(id, slug, name, icon)
      )
    `)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .not('start_datetime', 'is', null)
    .order('start_datetime', { ascending: true })

  if (error) {
    console.error('Error fetching calendar events for calendar:', error)
    return []
  }

  if (!calendarEvents || calendarEvents.length === 0) {
    return []
  }

  // Collect master_event_ids to check for module links
  const masterEventIds = [...new Set(calendarEvents.map(ce => ce.master_event_id).filter(Boolean))] as string[]

  // Check for module links (weddings, funerals, baptisms, etc.)
  const moduleLinks = new Map<string, { moduleType: string; moduleId: string }>()

  if (masterEventIds.length > 0) {
    // Check each module table for linked events
    const [weddings, funerals, baptisms, presentations, quinceaneras, masses] = await Promise.all([
      supabase.from('weddings').select('id, wedding_event_id').in('wedding_event_id', masterEventIds),
      supabase.from('funerals').select('id, funeral_event_id').in('funeral_event_id', masterEventIds),
      supabase.from('baptisms').select('id, baptism_event_id').in('baptism_event_id', masterEventIds),
      supabase.from('presentations').select('id, presentation_event_id').in('presentation_event_id', masterEventIds),
      supabase.from('quinceaneras').select('id, quinceanera_event_id').in('quinceanera_event_id', masterEventIds),
      supabase.from('masses').select('id, event_id').in('event_id', masterEventIds),
    ])

    // Build module link map
    weddings.data?.forEach(w => moduleLinks.set(w.wedding_event_id, { moduleType: 'wedding', moduleId: w.id }))
    funerals.data?.forEach(f => moduleLinks.set(f.funeral_event_id, { moduleType: 'funeral', moduleId: f.id }))
    baptisms.data?.forEach(b => moduleLinks.set(b.baptism_event_id, { moduleType: 'baptism', moduleId: b.id }))
    presentations.data?.forEach(p => moduleLinks.set(p.presentation_event_id, { moduleType: 'presentation', moduleId: p.id }))
    quinceaneras.data?.forEach(q => moduleLinks.set(q.quinceanera_event_id, { moduleType: 'quinceanera', moduleId: q.id }))
    masses.data?.forEach(m => moduleLinks.set(m.event_id, { moduleType: 'mass', moduleId: m.id }))
  }

  // Transform to calendar items
  const calendarItems: CalendarCalendarEventItem[] = calendarEvents.map(calendarEvent => {
    const masterEventData = calendarEvent.master_event as unknown as {
      id: string
      field_values: Record<string, unknown>
      event_type: { id: string; slug: string; name: string; icon: string | null }
    }

    const locationData = calendarEvent.location as unknown as { name: string } | null
    const moduleLink = moduleLinks.get(calendarEvent.master_event_id)

    // Generate event title from event type name
    const eventTypeName = masterEventData.event_type.name

    return {
      id: calendarEvent.id,
      master_event_id: calendarEvent.master_event_id,
      start_datetime: calendarEvent.start_datetime!,
      end_datetime: calendarEvent.end_datetime,
      input_field_definition_id: calendarEvent.input_field_definition_id,
      location_id: calendarEvent.location_id,
      location_name: locationData?.name || null,
      is_primary: calendarEvent.is_primary,
      is_cancelled: calendarEvent.is_cancelled,
      event_title: eventTypeName,
      event_field_values: masterEventData.field_values,
      event_type_id: masterEventData.event_type.id,
      event_type_slug: masterEventData.event_type.slug,
      event_type_name: eventTypeName,
      event_type_icon: masterEventData.event_type.icon,
      module_type: moduleLink?.moduleType || null,
      module_id: moduleLink?.moduleId || null,
    }
  })

  return calendarItems
}

/**
 * Get role assignments for a master event with person data
 */
export async function getMasterEventRoles(masterEventId: string): Promise<MasterEventRoleWithPerson[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Verify master event belongs to user's parish
  const { data: masterEvent } = await supabase
    .from('master_events')
    .select('parish_id')
    .eq('id', masterEventId)
    .is('deleted_at', null)
    .single()

  if (!masterEvent || masterEvent.parish_id !== selectedParishId) {
    throw new Error('Event not found or access denied')
  }

  const { data, error } = await supabase
    .from('master_event_roles')
    .select('*, person:people(*)')
    .eq('master_event_id', masterEventId)
    .is('deleted_at', null)

  if (error) {
    console.error('Error fetching master event roles:', error)
    throw new Error('Failed to fetch master event roles')
  }

  return data || []
}

/**
 * Assign a person to a role for a master event
 */
export async function assignRole(
  masterEventId: string,
  roleId: string,
  personId: string,
  notes?: string
): Promise<MasterEventRole> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Verify master event belongs to user's parish
  const { data: masterEvent } = await supabase
    .from('master_events')
    .select('parish_id, event_type_id')
    .eq('id', masterEventId)
    .is('deleted_at', null)
    .single()

  if (!masterEvent || masterEvent.parish_id !== selectedParishId) {
    throw new Error('Event not found or access denied')
  }

  // Verify person exists in same parish
  const { data: person } = await supabase
    .from('people')
    .select('id')
    .eq('id', personId)
    .eq('parish_id', selectedParishId)
    .single()

  if (!person) {
    throw new Error('Person not found in parish')
  }

  // Insert role assignment
  const { data: roleAssignment, error } = await supabase
    .from('master_event_roles')
    .insert([
      {
        master_event_id: masterEventId,
        role_id: roleId,
        person_id: personId,
        notes: notes || null
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error assigning role:', error)
    throw new Error('Failed to assign role')
  }

  revalidatePath(`/events/${masterEvent.event_type_id}/${masterEventId}`)
  return roleAssignment
}

/**
 * Remove a role assignment (soft delete)
 */
export async function removeRoleAssignment(roleAssignmentId: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get role assignment to verify access and get master event details
  const { data: roleAssignment } = await supabase
    .from('master_event_roles')
    .select('master_event_id, master_event:master_events(parish_id, event_type_id)')
    .eq('id', roleAssignmentId)
    .is('deleted_at', null)
    .single()

  if (!roleAssignment) {
    throw new Error('Role assignment not found')
  }

  const masterEventData = roleAssignment.master_event as unknown as { parish_id: string; event_type_id: string }
  
  if (masterEventData.parish_id !== selectedParishId) {
    throw new Error('Access denied')
  }

  // Soft delete
  const { error } = await supabase
    .from('master_event_roles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', roleAssignmentId)

  if (error) {
    console.error('Error removing role assignment:', error)
    throw new Error('Failed to remove role assignment')
  }

  revalidatePath(`/events/${masterEventData.event_type_id}/${roleAssignment.master_event_id}`)
}

/**
 * Compute master event title from key persons and event type name
 * Example: "John Doe and Jane Smith-Wedding" or "Robert Johnson-Funeral"
 */
export async function computeMasterEventTitle(masterEvent: MasterEventWithRelations): Promise<string> {
  const keyPersonFields = masterEvent.event_type.input_field_definitions
    ?.filter(field => field.is_key_person && field.type === 'person') || []

  const keyPersonNames: string[] = []

  for (const field of keyPersonFields) {
    const personValue = masterEvent.resolved_fields[field.name]
    if (personValue?.resolved_value && 'full_name' in personValue.resolved_value) {
      const person = personValue.resolved_value as Person
      keyPersonNames.push(person.full_name)
    }
  }

  if (keyPersonNames.length === 0) {
    return masterEvent.event_type.name
  }

  const namesString = keyPersonNames.join(' and ')
  return `${namesString}-${masterEvent.event_type.name}`
}

/**
 * Compute calendar event title with optional suffix from field definition
 * Example: "John Doe and Jane Smith-Wedding Ceremony" or "John Doe and Jane Smith-Wedding Rehearsal"
 */
export async function computeCalendarEventTitle(
  masterEvent: MasterEventWithRelations,
  fieldDefinition: InputFieldDefinition
): Promise<string> {
  const baseTitle = await computeMasterEventTitle(masterEvent)

  // If field definition has a suffix (e.g., "Ceremony", "Rehearsal"), append it
  // This would be stored in the field definition name
  if (fieldDefinition.name && fieldDefinition.name.trim().length > 0) {
    return `${baseTitle} ${fieldDefinition.name}`
  }

  return baseTitle
}

/**
 * Stats interface for master events
 */
export interface MasterEventStats {
  total: number
  upcoming: number
  past: number
  filtered: number
}

/**
 * Get stats for master events with optional filtering by system type
 */
export async function getMasterEventStats(filters?: MasterEventFilterParams): Promise<MasterEventStats> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Build query for all events (for total, upcoming, past counts)
  let allEventsQuery = supabase
    .from('master_events')
    .select('*, event_type:event_types!inner(*)')
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)

  // Apply system type filter if provided
  if (filters?.systemType && filters.systemType !== 'all') {
    allEventsQuery = allEventsQuery.eq('event_type.system_type', filters.systemType)
  }

  const { data: allEvents, error: allEventsError } = await allEventsQuery

  if (allEventsError) {
    console.error('Error fetching master events for stats:', allEventsError)
    throw new Error('Failed to fetch master events for stats')
  }

  const allMasterEvents = allEvents || []
  const total = allMasterEvents.length

  // Fetch primary calendar events for all events to calculate upcoming/past
  const eventIds = allMasterEvents.map(e => e.id)
  let upcoming = 0
  let past = 0

  if (eventIds.length > 0) {
    const { data: calendarEvents } = await supabase
      .from('calendar_events')
      .select('master_event_id, start_datetime')
      .in('master_event_id', eventIds)
      .eq('is_primary', true)
      .is('deleted_at', null)

    const now = new Date()
    upcoming = calendarEvents?.filter(ce => new Date(ce.start_datetime) >= now).length || 0
    past = calendarEvents?.filter(ce => new Date(ce.start_datetime) < now).length || 0
  }

  // Get filtered count using getAllMasterEvents with all filters applied
  const filteredEvents = await getAllMasterEvents(filters)
  const filtered = filteredEvents.length

  return {
    total,
    upcoming,
    past,
    filtered
  }
}
