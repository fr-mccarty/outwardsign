'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// Validation schemas
const massIntentionSchema = z.object({
  mass_offered_for: z.string().min(1, 'Intention is required'),
  donor_id: z.string().uuid().nullable().optional(),
  offered_by_id: z.string().uuid().nullable().optional(),
  date_requested: z.string().nullable().optional(),
  scheduled_at: z.string().nullable().optional(),
  liturgical_event_id: z.string().uuid().nullable().optional(),
  amount_donated: z.number().nullable().optional(),
  note: z.string().nullable().optional(),
  status: z.enum(['scheduled', 'unscheduled', 'conflicted']).default('unscheduled'),
})

const createMassIntentionSchema = massIntentionSchema

const updateMassIntentionSchema = massIntentionSchema.extend({
  id: z.string().uuid(),
})

// Type definitions
export interface MassIntention {
  id: string
  created_at: string
  parish_id: string
  mass_offered_for: string
  donor_id: string | null
  offered_by_id: string | null
  date_requested: string | null
  scheduled_at: string | null
  liturgical_event_id: string | null
  amount_donated: number | null
  note: string | null
  received_at: string | null
  status: 'scheduled' | 'unscheduled' | 'conflicted'
}

export interface MassIntentionWithDetails extends MassIntention {
  event_name: string | null
  event_date: string | null
  start_time: string | null
  end_time: string | null
  location: string | null
  event_description: string | null
  donor_name: string | null
  celebrant_name: string | null
}

// Get all mass intentions
export async function getMassIntentions(): Promise<MassIntentionWithDetails[]> {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  
  if (!user.user) {
    throw new Error('Unauthorized')
  }

  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('selected_parish_id')
    .eq('user_id', user.user.id)
    .single()

  if (!userSettings?.selected_parish_id) {
    throw new Error('No parish selected')
  }

  const { data, error } = await supabase
    .from('mass_intentions_with_events')
    .select('*')
    .eq('parish_id', userSettings.selected_parish_id)
    .order('scheduled_at', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('Error fetching mass intentions:', error)
    throw new Error('Failed to fetch mass intentions')
  }

  return data || []
}

// Get mass intention by ID
export async function getMassIntentionById(id: string): Promise<MassIntentionWithDetails | null> {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  
  if (!user.user) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('mass_intentions_with_events')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching mass intention:', error)
    return null
  }

  return data
}

// Get mass intentions by status
export async function getMassIntentionsByStatus(status: 'scheduled' | 'unscheduled' | 'conflicted'): Promise<MassIntentionWithDetails[]> {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  
  if (!user.user) {
    throw new Error('Unauthorized')
  }

  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('selected_parish_id')
    .eq('user_id', user.user.id)
    .single()

  if (!userSettings?.selected_parish_id) {
    throw new Error('No parish selected')
  }

  const { data, error } = await supabase
    .from('mass_intentions_with_events')
    .select('*')
    .eq('parish_id', userSettings.selected_parish_id)
    .eq('status', status)
    .order('scheduled_at', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('Error fetching mass intentions by status:', error)
    throw new Error('Failed to fetch mass intentions')
  }

  return data || []
}

// Get mass intentions for date range
export async function getMassIntentionsByDateRange(startDate: string, endDate: string): Promise<MassIntentionWithDetails[]> {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  
  if (!user.user) {
    throw new Error('Unauthorized')
  }

  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('selected_parish_id')
    .eq('user_id', user.user.id)
    .single()

  if (!userSettings?.selected_parish_id) {
    throw new Error('No parish selected')
  }

  const { data, error } = await supabase
    .from('mass_intentions_with_events')
    .select('*')
    .eq('parish_id', userSettings.selected_parish_id)
    .gte('scheduled_at', startDate)
    .lte('scheduled_at', endDate)
    .order('scheduled_at', { ascending: true })

  if (error) {
    console.error('Error fetching mass intentions by date range:', error)
    throw new Error('Failed to fetch mass intentions')
  }

  return data || []
}

// Create mass intention
export async function createMassIntention(formData: FormData) {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  
  if (!user.user) {
    throw new Error('Unauthorized')
  }

  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('selected_parish_id')
    .eq('user_id', user.user.id)
    .single()

  if (!userSettings?.selected_parish_id) {
    throw new Error('No parish selected')
  }

  // Parse and validate form data
  const rawData = {
    mass_offered_for: formData.get('mass_offered_for'),
    donor_id: formData.get('donor_id') || null,
    offered_by_id: formData.get('offered_by_id') || null,
    date_requested: formData.get('date_requested') || null,
    scheduled_at: formData.get('scheduled_at') || null,
    liturgical_event_id: formData.get('liturgical_event_id') || null,
    amount_donated: formData.get('amount_donated') ? Number(formData.get('amount_donated')) : null,
    note: formData.get('note') || null,
    status: formData.get('status') || 'unscheduled',
  }

  const validatedData = createMassIntentionSchema.parse(rawData)

  // If liturgical_event_id is provided, check if it's already taken
  if (validatedData.liturgical_event_id) {
    const { data: existing } = await supabase
      .from('mass_intentions')
      .select('id')
      .eq('liturgical_event_id', validatedData.liturgical_event_id)
      .single()

    if (existing) {
      throw new Error('This liturgical event already has a mass intention assigned')
    }
  }

  // Create the mass intention
  const { data, error } = await supabase
    .from('mass_intentions')
    .insert({
      ...validatedData,
      parish_id: userSettings.selected_parish_id,
      received_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating mass intention:', error)
    throw new Error('Failed to create mass intention')
  }

  revalidatePath('/mass-intentions')
  redirect(`/mass-intentions/${data.id}`)
}

// Update mass intention
export async function updateMassIntention(formData: FormData) {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  
  if (!user.user) {
    throw new Error('Unauthorized')
  }

  // Parse and validate form data
  const rawData = {
    id: formData.get('id'),
    mass_offered_for: formData.get('mass_offered_for'),
    donor_id: formData.get('donor_id') || null,
    offered_by_id: formData.get('offered_by_id') || null,
    date_requested: formData.get('date_requested') || null,
    scheduled_at: formData.get('scheduled_at') || null,
    liturgical_event_id: formData.get('liturgical_event_id') || null,
    amount_donated: formData.get('amount_donated') ? Number(formData.get('amount_donated')) : null,
    note: formData.get('note') || null,
    status: formData.get('status') || 'unscheduled',
  }

  const validatedData = updateMassIntentionSchema.parse(rawData)
  const { id, ...updateFields } = validatedData

  // If liturgical_event_id is provided, check if it's already taken by another intention
  if (updateFields.liturgical_event_id) {
    const { data: existing } = await supabase
      .from('mass_intentions')
      .select('id')
      .eq('liturgical_event_id', updateFields.liturgical_event_id)
      .neq('id', id)
      .single()

    if (existing) {
      throw new Error('This liturgical event already has a mass intention assigned')
    }
  }

  // Update the mass intention
  const { data, error } = await supabase
    .from('mass_intentions')
    .update(updateFields)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating mass intention:', error)
    throw new Error('Failed to update mass intention')
  }

  revalidatePath('/mass-intentions')
  revalidatePath(`/mass-intentions/${id}`)
  
  return data
}

// Delete mass intention
export async function deleteMassIntention(id: string) {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  
  if (!user.user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('mass_intentions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting mass intention:', error)
    throw new Error('Failed to delete mass intention')
  }

  revalidatePath('/mass-intentions')
  redirect('/mass-intentions')
}

// Check availability for a liturgical event
export async function checkLiturgicalEventAvailability(liturgicalEventId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('mass_intentions')
    .select('id')
    .eq('liturgical_event_id', liturgicalEventId)
    .single()

  return !data // Available if no mass intention exists for this event
}

// Reschedule mass intention (move down strategy)
export async function rescheduleMassIntentionMoveDown(id: string, newDate: string) {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  
  if (!user.user) {
    throw new Error('Unauthorized')
  }

  // Get the current mass intention
  const { data: current } = await supabase
    .from('mass_intentions')
    .select('*')
    .eq('id', id)
    .single()

  if (!current) {
    throw new Error('Mass intention not found')
  }

  // Get all mass intentions scheduled after the new date
  const { data: following } = await supabase
    .from('mass_intentions')
    .select('*')
    .eq('parish_id', current.parish_id)
    .gte('scheduled_at', newDate)
    .order('scheduled_at', { ascending: true })

  if (!following || following.length === 0) {
    // No conflicts, just update the date
    const formData = new FormData()
    formData.append('id', id)
    formData.append('scheduled_at', newDate)
    formData.append('status', 'scheduled')
    await updateMassIntention(formData)
    return
  }

  // TODO: Implement the logic to move all following intentions down
  // This would require updating each intention's scheduled_at to the next available slot
  // For now, we'll throw an error
  throw new Error('Move down rescheduling not yet implemented')
}

// Reschedule mass intention (find next slot strategy)  
export async function rescheduleMassIntentionNextSlot(id: string, startSearchDate: string) {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  
  if (!user.user) {
    throw new Error('Unauthorized')
  }

  // Get the current mass intention
  const { data: current } = await supabase
    .from('mass_intentions')
    .select('*')
    .eq('id', id)
    .single()

  if (!current) {
    throw new Error('Mass intention not found')
  }

  // Get all available liturgical events after the search date
  const { data: availableEvents } = await supabase
    .from('liturgical_events')
    .select('id, event_date, start_time')
    .eq('parish_id', current.parish_id)
    .gte('event_date', startSearchDate)
    .order('event_date', { ascending: true })
    .order('start_time', { ascending: true })

  if (!availableEvents || availableEvents.length === 0) {
    throw new Error('No liturgical events available after the specified date')
  }

  // Check each event for availability
  for (const event of availableEvents) {
    const isAvailable = await checkLiturgicalEventAvailability(event.id)
    if (isAvailable) {
      // Found an available slot, update the mass intention
      const formData = new FormData()
      formData.append('id', id)
      formData.append('liturgical_event_id', event.id)
      formData.append('scheduled_at', `${event.event_date}T${event.start_time}`)
      formData.append('status', 'scheduled')
      await updateMassIntention(formData)
      return event
    }
  }

  throw new Error('No available slots found')
}

// Get available liturgical events for a date range
export async function getAvailableLiturgicalEvents(startDate: string, endDate: string) {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  
  if (!user.user) {
    throw new Error('Unauthorized')
  }

  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('selected_parish_id')
    .eq('user_id', user.user.id)
    .single()

  if (!userSettings?.selected_parish_id) {
    throw new Error('No parish selected')
  }

  // Get all liturgical events in the date range
  const { data: events, error } = await supabase
    .from('liturgical_events')
    .select('*')
    .eq('parish_id', userSettings.selected_parish_id)
    .gte('event_date', startDate)
    .lte('event_date', endDate)
    .order('event_date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Error fetching liturgical events:', error)
    throw new Error('Failed to fetch liturgical events')
  }

  // Get all mass intentions for these events to check availability
  const eventIds = events?.map(e => e.id) || []
  const { data: takenEvents } = await supabase
    .from('mass_intentions')
    .select('liturgical_event_id')
    .in('liturgical_event_id', eventIds)

  const takenEventIds = new Set(takenEvents?.map(e => e.liturgical_event_id) || [])
  
  // Mark events as available or not
  const eventsWithAvailability = events?.map(event => ({
    ...event,
    available: !takenEventIds.has(event.id),
  })) || []

  return eventsWithAvailability
}

// Helper functions for form data (these would normally be in their respective action files)
export async function getPeople() {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  
  if (!user.user) {
    throw new Error('Unauthorized')
  }

  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('selected_parish_id')
    .eq('user_id', user.user.id)
    .single()

  if (!userSettings?.selected_parish_id) {
    throw new Error('No parish selected')
  }

  const { data, error } = await supabase
    .from('people')
    .select('id, first_name, last_name, email')
    .eq('parish_id', userSettings.selected_parish_id)
    .order('last_name', { ascending: true })

  if (error) {
    console.error('Error fetching people:', error)
    throw new Error('Failed to fetch people')
  }

  return data || []
}

export async function getMinistersByRole(role: string) {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()
  
  if (!user.user) {
    throw new Error('Unauthorized')
  }

  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('selected_parish_id')
    .eq('user_id', user.user.id)
    .single()

  if (!userSettings?.selected_parish_id) {
    throw new Error('No parish selected')
  }

  const { data, error } = await supabase
    .from('ministers')
    .select('id, name, role')
    .eq('parish_id', userSettings.selected_parish_id)
    .ilike('role', `%${role}%`)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching ministers:', error)
    throw new Error('Failed to fetch ministers')
  }

  return data || []
}