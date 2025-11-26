'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { EventType } from '@/lib/types'
import {
  createEventTypeSchema,
  updateEventTypeSchema,
  type CreateEventTypeData,
  type UpdateEventTypeData,
} from '@/lib/schemas/event-types'

/**
 * Get all event types for the current parish
 */
export async function getEventTypes(): Promise<EventType[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: parishUser } = await supabase
    .from('parish_users')
    .select('parish_id')
    .eq('user_id', user.id)
    .single()

  if (!parishUser) {
    throw new Error('No parish found for user')
  }

  const { data, error } = await supabase
    .from('event_types')
    .select('*')
    .eq('parish_id', parishUser.parish_id)
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching event types:', error)
    throw new Error('Failed to fetch event types')
  }

  return data || []
}

/**
 * Get active event types for the current parish (for dropdowns)
 */
export async function getActiveEventTypes(): Promise<EventType[]> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: parishUser } = await supabase
    .from('parish_users')
    .select('parish_id')
    .eq('user_id', user.id)
    .single()

  if (!parishUser) {
    throw new Error('No parish found for user')
  }

  const { data, error } = await supabase
    .from('event_types')
    .select('*')
    .eq('parish_id', parishUser.parish_id)
    .eq('is_active', true)
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching active event types:', error)
    throw new Error('Failed to fetch active event types')
  }

  return data || []
}

/**
 * Get a single event type by ID
 */
export async function getEventType(id: string): Promise<EventType | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('event_types')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching event type:', error)
    return null
  }

  return data
}

/**
 * Create a new event type
 */
export async function createEventType(eventTypeData: CreateEventTypeData): Promise<EventType> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: parishUser } = await supabase
    .from('parish_users')
    .select('parish_id')
    .eq('user_id', user.id)
    .single()

  if (!parishUser) {
    throw new Error('No parish found for user')
  }

  // Validate input data
  createEventTypeSchema.parse(eventTypeData)

  const { data, error } = await supabase
    .from('event_types')
    .insert({
      parish_id: parishUser.parish_id,
      name: eventTypeData.name,
      description: eventTypeData.description,
      is_active: eventTypeData.is_active ?? true,
      display_order: eventTypeData.display_order
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating event type:', error)
    throw new Error('Failed to create event type')
  }

  revalidatePath('/events')
  revalidatePath('/settings')

  return data
}

/**
 * Update an existing event type
 */
export async function updateEventType(id: string, eventTypeData: UpdateEventTypeData): Promise<EventType> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Validate input data
  updateEventTypeSchema.parse(eventTypeData)

  const { data, error } = await supabase
    .from('event_types')
    .update({
      name: eventTypeData.name,
      description: eventTypeData.description,
      is_active: eventTypeData.is_active,
      display_order: eventTypeData.display_order,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating event type:', error)
    throw new Error('Failed to update event type')
  }

  revalidatePath('/events')
  revalidatePath('/settings')

  return data
}

/**
 * Delete an event type
 * Note: This will fail if there are events referencing this event type (due to FK constraint)
 */
export async function deleteEventType(id: string): Promise<void> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('event_types')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting event type:', error)
    throw new Error('Failed to delete event type. It may be in use by existing events.')
  }

  revalidatePath('/events')
  revalidatePath('/settings')
}

/**
 * Reorder event types
 */
export async function reorderEventTypes(eventTypeIds: string[]): Promise<void> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Update display_order for each event type
  const updates = eventTypeIds.map((id, index) =>
    supabase
      .from('event_types')
      .update({ display_order: index + 1 })
      .eq('id', id)
  )

  const results = await Promise.all(updates)

  const errors = results.filter(result => result.error)
  if (errors.length > 0) {
    console.error('Error reordering event types:', errors)
    throw new Error('Failed to reorder event types')
  }

  revalidatePath('/events')
  revalidatePath('/settings')
}
