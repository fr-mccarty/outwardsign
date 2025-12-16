'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import type {
  CalendarEvent,
  CreateCalendarEventData,
  UpdateCalendarEventData
} from '@/lib/types'

/**
 * Get all calendar events for a master event
 */
export async function getCalendarEvents(masterEventId: string): Promise<CalendarEvent[]> {
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
    .from('calendar_events')
    .select('*, location:locations(*)')
    .eq('master_event_id', masterEventId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching calendar events:', error)
    throw new Error('Failed to fetch calendar events')
  }

  return data || []
}

/**
 * Get all standalone calendar events
 */
export async function getStandaloneCalendarEvents(): Promise<CalendarEvent[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('calendar_events')
    .select('*, location:locations(*)')
    .eq('parish_id', selectedParishId)
    .eq('is_standalone', true)
    .is('deleted_at', null)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching standalone calendar events:', error)
    throw new Error('Failed to fetch standalone calendar events')
  }

  return data || []
}

/**
 * Get a single calendar event by ID
 */
export async function getCalendarEventById(id: string): Promise<CalendarEvent | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('calendar_events')
    .select('*, location:locations(*)')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching calendar event:', error)
    throw new Error('Failed to fetch calendar event')
  }

  return data
}

/**
 * Create a new calendar event (linked to master event)
 */
export async function createCalendarEvent(
  masterEventId: string,
  data: CreateCalendarEventData
): Promise<CalendarEvent> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Verify master event belongs to user's parish and get event_type_id
  const { data: masterEvent } = await supabase
    .from('master_events')
    .select('parish_id, event_type_id')
    .eq('id', masterEventId)
    .is('deleted_at', null)
    .single()

  if (!masterEvent || masterEvent.parish_id !== selectedParishId) {
    throw new Error('Event not found or access denied')
  }

  // If marking as primary, unset other primary calendar events first
  if (data.is_primary) {
    await supabase
      .from('calendar_events')
      .update({ is_primary: false })
      .eq('master_event_id', masterEventId)
      .is('deleted_at', null)
  }

  // Insert calendar event
  const { data: newCalendarEvent, error } = await supabase
    .from('calendar_events')
    .insert([
      {
        master_event_id: masterEventId,
        parish_id: selectedParishId,
        label: data.label,
        date: data.date || null,
        time: data.time || null,
        location_id: data.location_id || null,
        is_primary: data.is_primary || false,
        is_standalone: false
      }
    ])
    .select('*, location:locations(*)')
    .single()

  if (error) {
    console.error('Error creating calendar event:', error)
    throw new Error('Failed to create calendar event')
  }

  revalidatePath(`/events/${masterEvent.event_type_id}/${masterEventId}`)
  return newCalendarEvent
}

/**
 * Create a new standalone calendar event (not linked to master event)
 */
export async function createStandaloneCalendarEvent(
  data: CreateCalendarEventData
): Promise<CalendarEvent> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Validate required fields for standalone events
  if (!data.label) {
    throw new Error('Event name is required')
  }

  // Insert standalone calendar event
  const { data: newCalendarEvent, error } = await supabase
    .from('calendar_events')
    .insert([
      {
        master_event_id: null,
        parish_id: selectedParishId,
        label: data.label,
        date: data.date || null,
        time: data.time || null,
        location_id: data.location_id || null,
        is_primary: false, // Standalone events don't have primary status
        is_standalone: true
      }
    ])
    .select('*, location:locations(*)')
    .single()

  if (error) {
    console.error('Error creating standalone calendar event:', error)
    throw new Error('Failed to create standalone calendar event')
  }

  revalidatePath('/calendar-events')
  return newCalendarEvent
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(
  id: string,
  data: UpdateCalendarEventData
): Promise<CalendarEvent> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get calendar event to verify access and get master_event_id
  const { data: calendarEvent } = await supabase
    .from('calendar_events')
    .select('master_event_id, is_standalone')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (!calendarEvent) {
    throw new Error('Calendar event not found')
  }

  // For linked events, verify master event belongs to user's parish
  let eventTypeId: string | undefined
  if (!calendarEvent.is_standalone && calendarEvent.master_event_id) {
    const { data: masterEvent } = await supabase
      .from('master_events')
      .select('parish_id, event_type_id')
      .eq('id', calendarEvent.master_event_id)
      .is('deleted_at', null)
      .single()

    if (!masterEvent || masterEvent.parish_id !== selectedParishId) {
      throw new Error('Event not found or access denied')
    }
    eventTypeId = masterEvent.event_type_id
  }

  // If marking as primary, unset other primary calendar events first (only for linked events)
  if (data.is_primary && !calendarEvent.is_standalone && calendarEvent.master_event_id) {
    await supabase
      .from('calendar_events')
      .update({ is_primary: false })
      .eq('master_event_id', calendarEvent.master_event_id)
      .neq('id', id)
      .is('deleted_at', null)
  }

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(data).filter(([_key, value]) => value !== undefined)
  )

  const { data: updatedCalendarEvent, error } = await supabase
    .from('calendar_events')
    .update(updateData)
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .select('*, location:locations(*)')
    .single()

  if (error) {
    console.error('Error updating calendar event:', error)
    throw new Error('Failed to update calendar event')
  }

  // Revalidate appropriate paths
  if (calendarEvent.is_standalone) {
    revalidatePath('/calendar-events')
    revalidatePath(`/calendar-events/${id}`)
  } else if (calendarEvent.master_event_id && eventTypeId) {
    revalidatePath(`/events/${eventTypeId}/${calendarEvent.master_event_id}`)
  }

  return updatedCalendarEvent
}

/**
 * Delete a calendar event
 * Prevents deleting the last or only primary calendar event for linked events
 */
export async function deleteCalendarEvent(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get calendar event to check if it's primary and get master_event_id
  const { data: calendarEvent } = await supabase
    .from('calendar_events')
    .select('master_event_id, is_primary, is_standalone')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (!calendarEvent) {
    throw new Error('Calendar event not found')
  }

  // For linked events, verify master event access and check for last calendar event
  let eventTypeId: string | undefined
  if (!calendarEvent.is_standalone && calendarEvent.master_event_id) {
    const { data: masterEvent } = await supabase
      .from('master_events')
      .select('parish_id, event_type_id')
      .eq('id', calendarEvent.master_event_id)
      .is('deleted_at', null)
      .single()

    if (!masterEvent || masterEvent.parish_id !== selectedParishId) {
      throw new Error('Event not found or access denied')
    }
    eventTypeId = masterEvent.event_type_id

    // Check if this is the last calendar event (prevent deleting the last one)
    const { data: remainingCalendarEvents, error: countError } = await supabase
      .from('calendar_events')
      .select('id')
      .eq('master_event_id', calendarEvent.master_event_id)
      .is('deleted_at', null)

    if (countError) {
      console.error('Error counting calendar events:', countError)
      throw new Error('Failed to check remaining calendar events')
    }

    if (remainingCalendarEvents && remainingCalendarEvents.length <= 1) {
      throw new Error('Cannot delete the last calendar event for an event')
    }
  }

  // Hard delete
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id)
    .eq('parish_id', selectedParishId)

  if (error) {
    console.error('Error deleting calendar event:', error)
    throw new Error('Failed to delete calendar event')
  }

  // Revalidate appropriate paths
  if (calendarEvent.is_standalone) {
    revalidatePath('/calendar-events')
  } else if (calendarEvent.master_event_id && eventTypeId) {
    revalidatePath(`/events/${eventTypeId}/${calendarEvent.master_event_id}`)
  }
}
