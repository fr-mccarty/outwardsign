'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { Event, Location } from '@/lib/types'
import type { PaginatedParams, PaginatedResult } from './people'

export interface EventWithRelations extends Event {
  location?: Location | null
}

export interface CreateEventData {
  name: string
  description?: string
  responsible_party_id?: string
  event_type: string
  start_date?: string
  start_time?: string
  end_date?: string
  end_time?: string
  timezone?: string
  location_id?: string
  language?: string
  event_template_id?: string
  note?: string
}

export interface UpdateEventData {
  name?: string
  description?: string
  responsible_party_id?: string
  event_type?: string
  start_date?: string
  start_time?: string
  end_date?: string
  end_time?: string
  timezone?: string
  location_id?: string
  language?: string
  event_template_id?: string
  note?: string
}

export interface EventFilterParams {
  search?: string
  event_type?: string
  language?: string
  start_date?: string
  end_date?: string
}

export async function getEvents(filters?: EventFilterParams): Promise<Event[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  let query = supabase
    .from('events')
    .select('*')

  // Apply filters
  if (filters?.event_type && filters.event_type !== 'all') {
    query = query.eq('event_type', filters.event_type)
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

  query = query.order('start_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching events:', error)
    throw new Error('Failed to fetch events')
  }

  return data || []
}

export async function getEventsPaginated(params?: PaginatedParams): Promise<PaginatedResult<Event>> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const page = params?.page || 1
  const limit = params?.limit || 10
  const search = params?.search || ''

  // Calculate offset
  const offset = (page - 1) * limit

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

  return {
    items: data || [],
    totalCount,
    page,
    limit,
    totalPages,
  }
}

export async function getEvent(id: string): Promise<Event | null> {
  const selectedParishId = await requireSelectedParish()
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
  const selectedParishId = await requireSelectedParish()
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

  const { data: event, error } = await supabase
    .from('events')
    .insert([
      {
        parish_id: selectedParishId,
        name: data.name,
        description: data.description || null,
        responsible_party_id: data.responsible_party_id || null,
        event_type: data.event_type,
        start_date: data.start_date || null,
        start_time: data.start_time || null,
        end_date: data.end_date || null,
        end_time: data.end_time || null,
        timezone: data.timezone || 'UTC',
        location_id: data.location_id || null,
        language: data.language || null,
        event_template_id: data.event_template_id || null,
        note: data.note || null,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating event:', error)
    throw new Error('Failed to create event')
  }

  revalidatePath('/events')
  return event
}

export async function updateEvent(id: string, data: UpdateEventData): Promise<Event> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description || null
  if (data.responsible_party_id !== undefined) updateData.responsible_party_id = data.responsible_party_id
  if (data.event_type !== undefined) updateData.event_type = data.event_type
  if (data.start_date !== undefined) updateData.start_date = data.start_date || null
  if (data.start_time !== undefined) updateData.start_time = data.start_time || null
  if (data.end_date !== undefined) updateData.end_date = data.end_date || null
  if (data.end_time !== undefined) updateData.end_time = data.end_time || null
  if (data.timezone !== undefined) updateData.timezone = data.timezone || null
  if (data.location_id !== undefined) updateData.location_id = data.location_id || null
  if (data.language !== undefined) updateData.language = data.language || null
  if (data.event_template_id !== undefined) updateData.event_template_id = data.event_template_id || null
  if (data.note !== undefined) updateData.note = data.note || null

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
  moduleType: 'wedding' | 'funeral' | 'baptism' | 'presentation' | 'quinceanera' | null
  moduleId: string | null
}

export async function getEventModuleLink(eventId: string): Promise<EventModuleLink> {
  const selectedParishId = await requireSelectedParish()
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

  // Check baptisms (if exists)
  const { data: baptism } = await supabase
    .from('baptisms')
    .select('id')
    .eq('baptism_event_id', eventId)
    .maybeSingle()

  if (baptism) {
    return { moduleType: 'baptism', moduleId: baptism.id }
  }

  // Add more module checks as needed

  return { moduleType: null, moduleId: null }
}
