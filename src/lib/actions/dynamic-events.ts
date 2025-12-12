'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import type {
  DynamicEvent,
  DynamicEventWithRelations,
  CreateDynamicEventData,
  UpdateDynamicEventData,
  DynamicEventType,
  InputFieldDefinition,
  Occasion,
  Person,
  Group,
  Location,
  CustomListItem,
  Document,
  Content,
  Petition,
  ResolvedFieldValue
} from '@/lib/types'
import { LIST_VIEW_PAGE_SIZE } from '@/lib/constants'

export interface DynamicEventFilterParams {
  search?: string
  eventTypeId?: string
  startDate?: string
  endDate?: string
  sort?: 'date_asc' | 'date_desc' | 'created_asc' | 'created_desc'
  offset?: number
  limit?: number
}

export interface DynamicEventWithTypeAndOccasion extends DynamicEvent {
  event_type?: DynamicEventType
  primary_occasion?: Occasion
}

/**
 * Get all dynamic events for the parish (used by dashboard)
 */
export async function getDynamicEvents(): Promise<(DynamicEvent & { event_type?: DynamicEventType })[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('dynamic_events')
    .select('*, event_type:event_types(*)')
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(50) // Limit for dashboard performance

  if (error) {
    console.error('Error fetching dynamic events:', error)
    return []
  }

  return data || []
}

/**
 * Get all dynamic events across all event types for the main events list
 */
export async function getAllDynamicEvents(
  filters?: DynamicEventFilterParams
): Promise<DynamicEventWithTypeAndOccasion[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const offset = filters?.offset || 0
  const limit = filters?.limit || LIST_VIEW_PAGE_SIZE

  // Build query
  let query = supabase
    .from('dynamic_events')
    .select('*, event_type:event_types(*)')
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)

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
    console.error('Error fetching all dynamic events:', error)
    throw new Error('Failed to fetch events')
  }

  if (!events || events.length === 0) {
    return []
  }

  // Fetch primary occasions for all events
  const eventIds = events.map(e => e.id)
  const { data: occasions } = await supabase
    .from('occasions')
    .select('*, location:locations(*)')
    .in('event_id', eventIds)
    .eq('is_primary', true)
    .is('deleted_at', null)

  // Create a map of event_id to primary occasion
  const occasionMap = new Map(occasions?.map(o => [o.event_id, o]) || [])

  // Combine events with their primary occasions
  const eventsWithOccasions: DynamicEventWithTypeAndOccasion[] = events.map(event => ({
    ...event,
    primary_occasion: occasionMap.get(event.id) || undefined
  }))

  // Apply date filters if provided (post-fetch since occasions are separate)
  let filteredEvents = eventsWithOccasions
  if (filters?.startDate) {
    filteredEvents = filteredEvents.filter(e =>
      e.primary_occasion?.date && e.primary_occasion.date >= filters.startDate!
    )
  }
  if (filters?.endDate) {
    filteredEvents = filteredEvents.filter(e =>
      e.primary_occasion?.date && e.primary_occasion.date <= filters.endDate!
    )
  }

  // Apply date sorting if requested
  if (filters?.sort === 'date_asc') {
    filteredEvents.sort((a, b) => {
      const dateA = a.primary_occasion?.date || ''
      const dateB = b.primary_occasion?.date || ''
      return dateA.localeCompare(dateB)
    })
  } else if (filters?.sort === 'date_desc') {
    filteredEvents.sort((a, b) => {
      const dateA = a.primary_occasion?.date || ''
      const dateB = b.primary_occasion?.date || ''
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
  filters?: DynamicEventFilterParams
): Promise<DynamicEvent[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Calculate pagination
  const offset = filters?.offset || 0
  const limit = filters?.limit || LIST_VIEW_PAGE_SIZE

  let query = supabase
    .from('dynamic_events')
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

      // For date range filter - filter on primary occasion date
      if (filters?.startDate || filters?.endDate) {
        const eventIds = events.map(e => e.id)
        if (eventIds.length > 0) {
          let occasionsQuery = supabase
            .from('occasions')
            .select('event_id')
            .in('event_id', eventIds)
            .eq('is_primary', true)
            .is('deleted_at', null)

          if (filters?.startDate) {
            occasionsQuery = occasionsQuery.gte('date', filters.startDate)
          }
          if (filters?.endDate) {
            occasionsQuery = occasionsQuery.lte('date', filters.endDate)
          }

          const { data: matchingOccasions } = await occasionsQuery

          const matchingEventIds = new Set(matchingOccasions?.map(o => o.event_id) || [])
          events = events.filter(e => matchingEventIds.has(e.id))
        } else {
          events = []
        }
      }
    }
  }

  // Apply date sorting if requested (requires fetching occasions)
  if (filters?.sort === 'date_asc' || filters?.sort === 'date_desc') {
    const eventIds = events.map(e => e.id)
    if (eventIds.length > 0) {
      const { data: occasions } = await supabase
        .from('occasions')
        .select('event_id, date')
        .in('event_id', eventIds)
        .eq('is_primary', true)
        .is('deleted_at', null)

      // Create map of event_id to primary occasion date
      const dateMap = new Map(occasions?.map(o => [o.event_id, o.date]) || [])

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
export async function getEvent(id: string): Promise<DynamicEvent | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('dynamic_events')
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
 * Get event with all related data (event type, occasions, resolved field values, parish)
 */
export async function getEventWithRelations(id: string): Promise<DynamicEventWithRelations | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the event
  const { data: event, error } = await supabase
    .from('dynamic_events')
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

  // Fetch event type, occasions, and parish in parallel
  const [eventTypeData, occasionsData, parishData] = await Promise.all([
    supabase
      .from('event_types')
      .select('*, input_field_definitions!input_field_definitions_event_type_id_fkey(*)')
      .eq('id', event.event_type_id)
      .eq('parish_id', selectedParishId)
      .is('deleted_at', null)
      .single(),
    supabase
      .from('occasions')
      .select('*, location:locations(*)')
      .eq('event_id', id)
      .is('deleted_at', null)
      .order('date', { ascending: true })
      .order('created_at', { ascending: true }),
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

  if (occasionsData.error) {
    console.error('Error fetching occasions:', occasionsData.error)
    throw new Error('Failed to fetch occasions')
  }

  const eventType = eventTypeData.data as DynamicEventType
  const occasions = occasionsData.data as Occasion[]
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
              .from('dynamic_events')
              .select('*')
              .eq('id', rawValue)
              .is('deleted_at', null)
              .single()
            resolvedField.resolved_value = linkedEvent as DynamicEvent | null
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
    occasions,
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
  data: CreateDynamicEventData
): Promise<DynamicEvent> {
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

  // Validate occasions (at least one, exactly one primary)
  if (!data.occasions || data.occasions.length === 0) {
    throw new Error('At least one occasion is required')
  }

  const primaryOccasions = data.occasions.filter(o => o.is_primary)
  if (primaryOccasions.length !== 1) {
    throw new Error('Exactly one occasion must be marked as primary')
  }

  // Insert event
  const { data: newEvent, error: eventError } = await supabase
    .from('dynamic_events')
    .insert([
      {
        parish_id: selectedParishId,
        event_type_id: eventTypeId,
        field_values: data.field_values
      }
    ])
    .select()
    .single()

  if (eventError) {
    console.error('Error creating event:', eventError)
    throw new Error('Failed to create event')
  }

  // Insert occasions
  const occasionsToInsert = data.occasions.map(occasion => ({
    event_id: newEvent.id,
    label: occasion.label,
    date: occasion.date || null,
    time: occasion.time || null,
    location_id: occasion.location_id || null,
    is_primary: occasion.is_primary || false
  }))

  const { error: occasionsError } = await supabase
    .from('occasions')
    .insert(occasionsToInsert)

  if (occasionsError) {
    console.error('Error creating occasions:', occasionsError)
    // Rollback event creation
    await supabase.from('dynamic_events').delete().eq('id', newEvent.id)
    throw new Error('Failed to create occasions')
  }

  revalidatePath(`/events/${eventTypeId}`)
  return newEvent
}

/**
 * Update an existing event
 */
export async function updateEvent(
  id: string,
  data: UpdateDynamicEventData
): Promise<DynamicEvent> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get existing event
  const { data: existingEvent } = await supabase
    .from('dynamic_events')
    .select('*')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (!existingEvent) {
    throw new Error('Event not found')
  }

  // Update field_values if provided
  if (data.field_values) {
    const { data: updatedEvent, error } = await supabase
      .from('dynamic_events')
      .update({ field_values: data.field_values })
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
    .from('dynamic_events')
    .select('event_type_id')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (!event) {
    throw new Error('Event not found')
  }

  // Hard delete (will cascade to occasions)
  const { error } = await supabase
    .from('dynamic_events')
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
 * Calendar occasion item - flattened data for calendar display
 */
export interface CalendarOccasionItem {
  id: string  // occasion.id
  event_id: string
  date: string
  time: string | null
  label: string
  location_id: string | null
  location_name: string | null
  is_primary: boolean
  // From dynamic_event
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
 * Get all occasions for calendar display
 * Fetches occasions with their parent events and event types
 * for rendering on the parish calendar
 */
export async function getOccasionsForCalendar(): Promise<CalendarOccasionItem[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Fetch all occasions with their parent events and event types
  const { data: occasions, error } = await supabase
    .from('occasions')
    .select(`
      id,
      event_id,
      label,
      date,
      time,
      location_id,
      is_primary,
      location:locations(name),
      event:dynamic_events!inner(
        id,
        field_values,
        parish_id,
        event_type:event_types(id, slug, name, icon)
      )
    `)
    .eq('event.parish_id', selectedParishId)
    .is('deleted_at', null)
    .is('event.deleted_at', null)
    .not('date', 'is', null)
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching occasions for calendar:', error)
    return []
  }

  if (!occasions || occasions.length === 0) {
    return []
  }

  // Collect event_ids to check for module links
  const eventIds = [...new Set(occasions.map(o => o.event_id))]

  // Check for module links (weddings, funerals, baptisms, etc.)
  const moduleLinks = new Map<string, { moduleType: string; moduleId: string }>()

  // Check each module table for linked events
  const [weddings, funerals, baptisms, presentations, quinceaneras, masses] = await Promise.all([
    supabase.from('weddings').select('id, wedding_event_id').in('wedding_event_id', eventIds),
    supabase.from('funerals').select('id, funeral_event_id').in('funeral_event_id', eventIds),
    supabase.from('baptisms').select('id, baptism_event_id').in('baptism_event_id', eventIds),
    supabase.from('presentations').select('id, presentation_event_id').in('presentation_event_id', eventIds),
    supabase.from('quinceaneras').select('id, quinceanera_event_id').in('quinceanera_event_id', eventIds),
    supabase.from('masses').select('id, event_id').in('event_id', eventIds),
  ])

  // Build module link map
  weddings.data?.forEach(w => moduleLinks.set(w.wedding_event_id, { moduleType: 'wedding', moduleId: w.id }))
  funerals.data?.forEach(f => moduleLinks.set(f.funeral_event_id, { moduleType: 'funeral', moduleId: f.id }))
  baptisms.data?.forEach(b => moduleLinks.set(b.baptism_event_id, { moduleType: 'baptism', moduleId: b.id }))
  presentations.data?.forEach(p => moduleLinks.set(p.presentation_event_id, { moduleType: 'presentation', moduleId: p.id }))
  quinceaneras.data?.forEach(q => moduleLinks.set(q.quinceanera_event_id, { moduleType: 'quinceanera', moduleId: q.id }))
  masses.data?.forEach(m => moduleLinks.set(m.event_id, { moduleType: 'mass', moduleId: m.id }))

  // Transform to calendar items
  const calendarItems: CalendarOccasionItem[] = occasions.map(occasion => {
    // Supabase returns nested relations - handle the structure properly
    const eventData = occasion.event as unknown as {
      id: string
      field_values: Record<string, unknown>
      event_type: { id: string; slug: string; name: string; icon: string | null } | null
    }
    // Location is a single object from the foreign key relation
    const locationData = occasion.location as unknown as { name: string } | null
    const moduleLink = moduleLinks.get(occasion.event_id)

    // Generate event title from event type name or use label
    const eventTypeName = eventData.event_type?.name || 'Event'

    return {
      id: occasion.id,
      event_id: occasion.event_id,
      date: occasion.date!,
      time: occasion.time,
      label: occasion.label,
      location_id: occasion.location_id,
      location_name: locationData?.name || null,
      is_primary: occasion.is_primary,
      event_title: eventTypeName,
      event_field_values: eventData.field_values || {},
      event_type_id: eventData.event_type?.id || '',
      event_type_slug: eventData.event_type?.slug || '',
      event_type_name: eventTypeName,
      event_type_icon: eventData.event_type?.icon || null,
      module_type: moduleLink?.moduleType || null,
      module_id: moduleLink?.moduleId || null,
    }
  })

  return calendarItems
}
