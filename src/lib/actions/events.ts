'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { Event } from '@/lib/types'

export interface CreateEventData {
  name: string
  description?: string
  responsible_party_id: string
  event_type: string
  start_date?: string
  start_time?: string
  end_date?: string
  end_time?: string
  location?: string
  language?: string
  notes?: string
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
  location?: string
  language?: string
  notes?: string
}

export interface EventFilterParams {
  search?: string
  event_type?: string
  language?: string
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
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`)
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
        responsible_party_id: data.responsible_party_id,
        event_type: data.event_type,
        start_date: data.start_date || null,
        start_time: data.start_time || null,
        end_date: data.end_date || null,
        end_time: data.end_time || null,
        location: data.location || null,
        language: data.language || null,
        notes: data.notes || null,
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
  if (data.location !== undefined) updateData.location = data.location || null
  if (data.language !== undefined) updateData.language = data.language || null
  if (data.notes !== undefined) updateData.notes = data.notes || null

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
