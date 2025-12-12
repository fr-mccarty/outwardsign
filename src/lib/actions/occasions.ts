'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import type {
  Occasion,
  CreateOccasionData,
  UpdateOccasionData
} from '@/lib/types'

/**
 * Get all occasions for an event
 */
export async function getOccasions(eventId: string): Promise<Occasion[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Verify event belongs to user's parish
  const { data: event } = await supabase
    .from('dynamic_events')
    .select('parish_id')
    .eq('id', eventId)
    .is('deleted_at', null)
    .single()

  if (!event || event.parish_id !== selectedParishId) {
    throw new Error('Event not found or access denied')
  }

  const { data, error } = await supabase
    .from('occasions')
    .select('*, location:locations(*)')
    .eq('event_id', eventId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching occasions:', error)
    throw new Error('Failed to fetch occasions')
  }

  return data || []
}

/**
 * Create a new occasion
 */
export async function createOccasion(
  eventId: string,
  data: CreateOccasionData
): Promise<Occasion> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Verify event belongs to user's parish and get event_type_id
  const { data: event } = await supabase
    .from('dynamic_events')
    .select('parish_id, event_type_id')
    .eq('id', eventId)
    .is('deleted_at', null)
    .single()

  if (!event || event.parish_id !== selectedParishId) {
    throw new Error('Event not found or access denied')
  }

  // If marking as primary, unset other primary occasions first
  if (data.is_primary) {
    await supabase
      .from('occasions')
      .update({ is_primary: false })
      .eq('event_id', eventId)
      .is('deleted_at', null)
  }

  // Insert occasion
  const { data: newOccasion, error } = await supabase
    .from('occasions')
    .insert([
      {
        event_id: eventId,
        label: data.label,
        date: data.date || null,
        time: data.time || null,
        location_id: data.location_id || null,
        is_primary: data.is_primary || false
      }
    ])
    .select('*, location:locations(*)')
    .single()

  if (error) {
    console.error('Error creating occasion:', error)
    throw new Error('Failed to create occasion')
  }

  revalidatePath(`/events/${event.event_type_id}/${eventId}`)
  return newOccasion
}

/**
 * Update an existing occasion
 */
export async function updateOccasion(
  id: string,
  data: UpdateOccasionData
): Promise<Occasion> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get occasion to verify access and get event_id
  const { data: occasion } = await supabase
    .from('occasions')
    .select('event_id')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!occasion) {
    throw new Error('Occasion not found')
  }

  // Verify event belongs to user's parish
  const { data: event } = await supabase
    .from('dynamic_events')
    .select('parish_id, event_type_id')
    .eq('id', occasion.event_id)
    .is('deleted_at', null)
    .single()

  if (!event || event.parish_id !== selectedParishId) {
    throw new Error('Event not found or access denied')
  }

  // If marking as primary, unset other primary occasions first
  if (data.is_primary) {
    await supabase
      .from('occasions')
      .update({ is_primary: false })
      .eq('event_id', occasion.event_id)
      .neq('id', id)
      .is('deleted_at', null)
  }

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(data).filter(([_key, value]) => value !== undefined)
  )

  const { data: updatedOccasion, error } = await supabase
    .from('occasions')
    .update(updateData)
    .eq('id', id)
    .is('deleted_at', null)
    .select('*, location:locations(*)')
    .single()

  if (error) {
    console.error('Error updating occasion:', error)
    throw new Error('Failed to update occasion')
  }

  revalidatePath(`/events/${event.event_type_id}/${occasion.event_id}`)
  return updatedOccasion
}

/**
 * Delete an occasion
 * Prevents deleting the last or only primary occasion
 */
export async function deleteOccasion(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get occasion to check if it's primary and get event_id
  const { data: occasion } = await supabase
    .from('occasions')
    .select('event_id, is_primary')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!occasion) {
    throw new Error('Occasion not found')
  }

  // Verify event belongs to user's parish
  const { data: event } = await supabase
    .from('dynamic_events')
    .select('parish_id, event_type_id')
    .eq('id', occasion.event_id)
    .is('deleted_at', null)
    .single()

  if (!event || event.parish_id !== selectedParishId) {
    throw new Error('Event not found or access denied')
  }

  // Check if this is the last occasion (prevent deleting the last one)
  const { data: remainingOccasions, error: countError } = await supabase
    .from('occasions')
    .select('id')
    .eq('event_id', occasion.event_id)
    .is('deleted_at', null)

  if (countError) {
    console.error('Error counting occasions:', countError)
    throw new Error('Failed to check remaining occasions')
  }

  if (remainingOccasions && remainingOccasions.length <= 1) {
    throw new Error('Cannot delete the last occasion for an event')
  }

  // Hard delete
  const { error } = await supabase
    .from('occasions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting occasion:', error)
    throw new Error('Failed to delete occasion')
  }

  revalidatePath(`/events/${event.event_type_id}/${occasion.event_id}`)
}

