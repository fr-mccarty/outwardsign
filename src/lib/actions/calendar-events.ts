'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { logError } from '@/lib/utils/console'
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
    logError('Error fetching calendar events:', error)
    throw new Error('Failed to fetch calendar events')
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
    logError('Error fetching calendar event:', error)
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
        start_datetime: data.start_datetime,
        end_datetime: data.end_datetime || null,
        input_field_definition_id: data.input_field_definition_id,
        location_id: data.location_id || null,
        is_primary: data.is_primary || false,
        is_cancelled: data.is_cancelled || false
      }
    ])
    .select('*, location:locations(*)')
    .single()

  if (error) {
    logError('Error creating calendar event:', error)
    throw new Error('Failed to create calendar event')
  }

  revalidatePath(`/events/${masterEvent.event_type_id}/${masterEventId}`)
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
    .select('master_event_id')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (!calendarEvent) {
    throw new Error('Calendar event not found')
  }

  // Verify master event belongs to user's parish
  const { data: masterEvent } = await supabase
    .from('master_events')
    .select('parish_id, event_type_id')
    .eq('id', calendarEvent.master_event_id)
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
    logError('Error updating calendar event:', error)
    throw new Error('Failed to update calendar event')
  }

  // Revalidate appropriate path
  revalidatePath(`/events/${masterEvent.event_type_id}/${calendarEvent.master_event_id}`)

  return updatedCalendarEvent
}

/**
 * Delete a calendar event
 * Prevents deleting the last calendar event for an event
 */
export async function deleteCalendarEvent(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get calendar event to verify access and get master_event_id
  const { data: calendarEvent } = await supabase
    .from('calendar_events')
    .select('master_event_id')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (!calendarEvent) {
    throw new Error('Calendar event not found')
  }

  // Verify master event access
  const { data: masterEvent } = await supabase
    .from('master_events')
    .select('parish_id, event_type_id')
    .eq('id', calendarEvent.master_event_id)
    .is('deleted_at', null)
    .single()

  if (!masterEvent || masterEvent.parish_id !== selectedParishId) {
    throw new Error('Event not found or access denied')
  }

  // Check if this is the last calendar event (prevent deleting the last one)
  const { data: remainingCalendarEvents, error: countError } = await supabase
    .from('calendar_events')
    .select('id')
    .eq('master_event_id', calendarEvent.master_event_id)
    .is('deleted_at', null)

  if (countError) {
    logError('Error counting calendar events:', countError)
    throw new Error('Failed to check remaining calendar events')
  }

  if (remainingCalendarEvents && remainingCalendarEvents.length <= 1) {
    throw new Error('Cannot delete the last calendar event for an event')
  }

  // Hard delete
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id)
    .eq('parish_id', selectedParishId)

  if (error) {
    logError('Error deleting calendar event:', error)
    throw new Error('Failed to delete calendar event')
  }

  // Revalidate appropriate path
  revalidatePath(`/events/${masterEvent.event_type_id}/${calendarEvent.master_event_id}`)
}
