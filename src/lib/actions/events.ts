'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { requireEditSharedResources } from '@/lib/auth/permissions'
import { Event, Location, Person, EventType } from '@/lib/types'
import type { PaginatedParams, PaginatedResult } from './people'
import { createEventSchema, updateEventSchema, type CreateEventData, type UpdateEventData } from '@/lib/schemas/events'
import { RelatedEventType, LiturgicalLanguage } from '@/lib/constants'

export interface EventWithRelations extends Event {
  location?: Location | null
  responsible_party?: Person | null
  event_type?: EventType | null
}

// Note: Import CreateEventData and UpdateEventData from '@/lib/schemas/events' instead

export interface EventFilterParams {
  search?: string
  event_type_id?: string | 'all'
  related_event_type?: RelatedEventType | 'all'
  language?: LiturgicalLanguage | 'all'
  start_date?: string
  end_date?: string
  sort?: 'date_asc' | 'date_desc' | 'name_asc' | 'name_desc' | 'created_asc' | 'created_desc'
  offset?: number
  limit?: number
}

export interface EventStats {
  total: number
  upcoming: number
  past: number
  filtered: number
}

export async function getEventStats(events: EventWithRelations[]): Promise<EventStats> {
  const now = new Date()
  const todayString = now.toISOString().split('T')[0]

  return {
    total: events.length,
    upcoming: events.filter(e => e.start_date && e.start_date >= todayString).length,
    past: events.filter(e => e.start_date && e.start_date < todayString).length,
    filtered: events.length
  }
}

export async function getEvents(filters?: EventFilterParams): Promise<Event[]> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  let query = supabase
    .from('events')
    .select('*')

  // Apply filters
  if (filters?.event_type_id && filters.event_type_id !== 'all') {
    query = query.eq('event_type_id', filters.event_type_id)
  }

  if (filters?.related_event_type && filters.related_event_type !== 'all') {
    query = query.eq('related_event_type', filters.related_event_type)
  }

  if (filters?.language && filters.language !== 'all') {
    query = query.eq('language', filters.language)
  }

  if (filters?.search) {
    // Use OR condition for search across multiple fields
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  // Date range filters
  if (filters?.start_date) {
    query = query.gte('start_date', filters.start_date)
  }

  if (filters?.end_date) {
    query = query.lte('start_date', filters.end_date)
  }

  // Handle sorting
  if (filters?.sort) {
    const sortParts = filters.sort.split('_')
    const direction = sortParts[sortParts.length - 1]
    const ascending = direction === 'asc'

    if (filters.sort.startsWith('date_')) {
      // Database-level sorting by start_date
      query = query.order('start_date', { ascending, nullsFirst: false })
        .order('created_at', { ascending: false })
    } else if (filters.sort.startsWith('created_')) {
      // Database-level sorting by created_at
      query = query.order('created_at', { ascending })
    } else if (filters.sort.startsWith('name_')) {
      // Database-level sorting by name
      query = query.order('name', { ascending })
    }
  } else {
    // Default sort: upcoming events first (date ascending)
    query = query.order('start_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching events:', error)
    throw new Error('Failed to fetch events')
  }

  return data || []
}

export async function getEventsPaginated(params?: PaginatedParams): Promise<PaginatedResult<Event>> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const offset = params?.offset || 0
  const limit = params?.limit || 10
  const search = params?.search || ''

  // Build base query
  let query = supabase
    .from('events')
    .select('*', { count: 'exact' })

  // Apply search filter
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Apply ordering, pagination
  query = query
    .order('start_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching paginated events:', error)
    throw new Error('Failed to fetch paginated events')
  }

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / limit)
  const page = Math.floor(offset / limit) + 1

  return {
    items: data || [],
    totalCount,
    page,
    limit,
    totalPages,
  }
}

export async function getEvent(id: string): Promise<Event | null> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
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

export async function getEventWithRelations(id: string): Promise<EventWithRelations | null> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Fetch base event
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching event:', error)
    throw new Error('Failed to fetch event')
  }

  // Fetch location if location_id exists
  let location = null
  if (event.location_id) {
    const { data: locationData } = await supabase
      .from('locations')
      .select('*')
      .eq('id', event.location_id)
      .single()

    location = locationData
  }

  return {
    ...event,
    location,
  }
}

export async function createEvent(data: CreateEventData): Promise<Event> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  // Validate data
  const validatedData = createEventSchema.parse(data)

  const { data: event, error } = await supabase
    .from('events')
    .insert([
      {
        parish_id: selectedParishId,
        name: validatedData.name,
        description: validatedData.description || null,
        responsible_party_id: validatedData.responsible_party_id || null,
        event_type_id: validatedData.event_type_id || null,
        related_event_type: validatedData.related_event_type || null,
        start_date: validatedData.start_date || null,
        start_time: validatedData.start_time || null,
        end_date: validatedData.end_date || null,
        end_time: validatedData.end_time || null,
        timezone: validatedData.timezone || 'UTC',
        location_id: validatedData.location_id || null,
        language: validatedData.language || 'en',
        event_template_id: validatedData.event_template_id || null,
        note: validatedData.note || null,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating event:', error.message, error.details, error.code)
    throw new Error(`Failed to create event: ${error.message}`)
  }

  revalidatePath('/events')
  return event
}

export async function updateEvent(id: string, data: UpdateEventData): Promise<Event> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  // Validate data
  const validatedData = updateEventSchema.parse(data)

  const updateData: Record<string, unknown> = {}
  if (validatedData.name !== undefined) updateData.name = validatedData.name
  if (validatedData.description !== undefined) updateData.description = validatedData.description || null
  if (validatedData.responsible_party_id !== undefined) updateData.responsible_party_id = validatedData.responsible_party_id
  if (validatedData.event_type_id !== undefined) updateData.event_type_id = validatedData.event_type_id || null
  if (validatedData.related_event_type !== undefined) updateData.related_event_type = validatedData.related_event_type || null
  if (validatedData.start_date !== undefined) updateData.start_date = validatedData.start_date || null
  if (validatedData.start_time !== undefined) updateData.start_time = validatedData.start_time || null
  if (validatedData.end_date !== undefined) updateData.end_date = validatedData.end_date || null
  if (validatedData.end_time !== undefined) updateData.end_time = validatedData.end_time || null
  if (validatedData.timezone !== undefined) updateData.timezone = validatedData.timezone || null
  if (validatedData.location_id !== undefined) updateData.location_id = validatedData.location_id || null
  if (validatedData.language !== undefined) updateData.language = validatedData.language || null
  if (validatedData.event_template_id !== undefined) updateData.event_template_id = validatedData.event_template_id || null
  if (validatedData.note !== undefined) updateData.note = validatedData.note || null

  const { data: event, error } = await supabase
    .from('events')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating event:', error)
    throw new Error('Failed to update event')
  }

  revalidatePath('/events')
  revalidatePath(`/events/${id}`)
  return event
}

export async function deleteEvent(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting event:', error)
    throw new Error('Failed to delete event')
  }

  revalidatePath('/events')
}

export interface EventModuleLink {
  moduleType: 'wedding' | 'funeral' | 'baptism' | 'presentation' | 'quinceanera' | 'mass' | null
  moduleId: string | null
}

export async function getEventModuleLink(eventId: string): Promise<EventModuleLink> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check weddings
  const { data: wedding } = await supabase
    .from('weddings')
    .select('id')
    .eq('wedding_event_id', eventId)
    .maybeSingle()

  if (wedding) {
    return { moduleType: 'wedding', moduleId: wedding.id }
  }

  // Check funerals
  const { data: funeral } = await supabase
    .from('funerals')
    .select('id')
    .eq('funeral_event_id', eventId)
    .maybeSingle()

  if (funeral) {
    return { moduleType: 'funeral', moduleId: funeral.id }
  }

  // Check baptisms
  const { data: baptism } = await supabase
    .from('baptisms')
    .select('id')
    .eq('baptism_event_id', eventId)
    .maybeSingle()

  if (baptism) {
    return { moduleType: 'baptism', moduleId: baptism.id }
  }

  // Check presentations
  const { data: presentation } = await supabase
    .from('presentations')
    .select('id')
    .eq('presentation_event_id', eventId)
    .maybeSingle()

  if (presentation) {
    return { moduleType: 'presentation', moduleId: presentation.id }
  }

  // Check quinceaneras
  const { data: quinceanera } = await supabase
    .from('quinceaneras')
    .select('id')
    .eq('quinceanera_event_id', eventId)
    .maybeSingle()

  if (quinceanera) {
    return { moduleType: 'quinceanera', moduleId: quinceanera.id }
  }

  // Check masses
  const { data: mass } = await supabase
    .from('masses')
    .select('id')
    .eq('event_id', eventId)
    .maybeSingle()

  if (mass) {
    return { moduleType: 'mass', moduleId: mass.id }
  }

  return { moduleType: null, moduleId: null }
}

export interface EventWithModuleLink extends EventWithRelations {
  moduleLink?: EventModuleLink
}

export async function getEventsWithModuleLinks(filters?: EventFilterParams): Promise<EventWithModuleLink[]> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  let query = supabase
    .from('events')
    .select(`
      *,
      location:locations(*),
      responsible_party:people!events_responsible_party_id_fkey(*),
      event_type:event_types(*)
    `)

  // Apply filters
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location_name.ilike.%${filters.search}%`)
  }

  if (filters?.event_type_id && filters.event_type_id !== 'all') {
    query = query.eq('event_type_id', filters.event_type_id)
  }

  if (filters?.related_event_type && filters.related_event_type !== 'all') {
    query = query.eq('related_event_type', filters.related_event_type)
  }

  if (filters?.language && filters.language !== 'all') {
    query = query.eq('language', filters.language)
  }

  if (filters?.start_date) {
    query = query.gte('start_date', filters.start_date)
  }

  if (filters?.end_date) {
    query = query.lte('start_date', filters.end_date)
  }

  // Apply sorting at database level for created_at
  if (filters?.sort === 'created_asc') {
    query = query.order('created_at', { ascending: true })
  } else if (filters?.sort === 'created_desc') {
    query = query.order('created_at', { ascending: false })
  } else {
    // Default: sort by date ascending
    query = query.order('start_date', { ascending: true, nullsFirst: false })
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching events with relations:', error)
    throw new Error('Failed to fetch events')
  }

  const events = data || []

  // Apply sorting at application level for related fields and date sorting
  if (filters?.sort === 'date_asc') {
    events.sort((a, b) => {
      const dateA = a.start_date || ''
      const dateB = b.start_date || ''
      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1
      return dateA.localeCompare(dateB)
    })
  } else if (filters?.sort === 'date_desc') {
    events.sort((a, b) => {
      const dateA = a.start_date || ''
      const dateB = b.start_date || ''
      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1
      return dateB.localeCompare(dateA)
    })
  } else if (filters?.sort === 'name_asc') {
    events.sort((a, b) => {
      const nameA = a.name || ''
      const nameB = b.name || ''
      return nameA.localeCompare(nameB)
    })
  } else if (filters?.sort === 'name_desc') {
    events.sort((a, b) => {
      const nameA = a.name || ''
      const nameB = b.name || ''
      return nameB.localeCompare(nameA)
    })
  }

  // Fetch module links for all events in parallel
  const eventsWithLinks = await Promise.all(
    events.map(async (event) => {
      const moduleLink = await getEventModuleLink(event.id)
      return {
        ...event,
        moduleLink
      }
    })
  )

  return eventsWithLinks
}
