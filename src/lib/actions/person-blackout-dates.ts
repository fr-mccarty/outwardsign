'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'

// Types
export interface PersonBlackoutDate {
  id: string
  person_id: string
  start_date: string
  end_date: string
  reason: string | null
  created_at: string
}

export interface PersonBlackoutDateWithPerson extends PersonBlackoutDate {
  person: {
    id: string
    first_name: string
    last_name: string
    email: string | null
  }
}

export interface CreatePersonBlackoutDateData {
  person_id: string
  start_date: string
  end_date: string
  reason?: string
}

export interface UpdatePersonBlackoutDateData {
  start_date?: string
  end_date?: string
  reason?: string
}

/**
 * Get all blackout dates for a specific person
 */
export async function getPersonBlackoutDates(personId: string): Promise<PersonBlackoutDate[]> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('person_blackout_dates')
    .select('*')
    .eq('person_id', personId)
    .order('start_date', { ascending: true })

  if (error) {
    console.error('Error fetching person blackout dates:', error)
    throw new Error('Failed to fetch person blackout dates')
  }

  return data || []
}

/**
 * Get all blackout dates with person details
 */
export async function getPersonBlackoutDatesWithPerson(
  personId: string
): Promise<PersonBlackoutDateWithPerson[]> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('person_blackout_dates')
    .select(`
      *,
      person:people(id, first_name, last_name, email)
    `)
    .eq('person_id', personId)
    .order('start_date', { ascending: true })

  if (error) {
    console.error('Error fetching person blackout dates with person:', error)
    throw new Error('Failed to fetch person blackout dates with person')
  }

  return data as PersonBlackoutDateWithPerson[] || []
}

/**
 * Get a single blackout date by ID
 */
export async function getPersonBlackoutDate(id: string): Promise<PersonBlackoutDate | null> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('person_blackout_dates')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching person blackout date:', error)
    throw new Error('Failed to fetch person blackout date')
  }

  return data
}

/**
 * Create a new blackout date for a person
 */
export async function createPersonBlackoutDate(
  data: CreatePersonBlackoutDateData
): Promise<PersonBlackoutDate> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Validate dates
  if (new Date(data.end_date) < new Date(data.start_date)) {
    throw new Error('End date must be on or after start date')
  }

  const { data: blackoutDate, error } = await supabase
    .from('person_blackout_dates')
    .insert({
      person_id: data.person_id,
      start_date: data.start_date,
      end_date: data.end_date,
      reason: data.reason || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating person blackout date:', error)
    throw new Error('Failed to create person blackout date')
  }

  revalidatePath('/masses')
  revalidatePath('/mass-role-members')
  revalidatePath(`/people/${data.person_id}`)

  return blackoutDate
}

/**
 * Update an existing blackout date
 */
export async function updatePersonBlackoutDate(
  id: string,
  data: UpdatePersonBlackoutDateData
): Promise<PersonBlackoutDate> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {}

  if (data.start_date !== undefined) updateData.start_date = data.start_date
  if (data.end_date !== undefined) updateData.end_date = data.end_date
  if (data.reason !== undefined) updateData.reason = data.reason

  const { data: blackoutDate, error } = await supabase
    .from('person_blackout_dates')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating person blackout date:', error)
    throw new Error('Failed to update person blackout date')
  }

  revalidatePath('/masses')
  revalidatePath('/mass-role-members')
  revalidatePath(`/people/${blackoutDate.person_id}`)

  return blackoutDate
}

/**
 * Delete a blackout date
 */
export async function deletePersonBlackoutDate(id: string): Promise<void> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the blackout date first to revalidate paths
  const { data: blackoutDate } = await supabase
    .from('person_blackout_dates')
    .select('person_id')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('person_blackout_dates')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting person blackout date:', error)
    throw new Error('Failed to delete person blackout date')
  }

  revalidatePath('/masses')
  revalidatePath('/mass-role-members')
  if (blackoutDate?.person_id) {
    revalidatePath(`/people/${blackoutDate.person_id}`)
  }
}

/**
 * Check if a person is available on a specific date (no blackout)
 */
export async function checkPersonAvailability(personId: string, date: string): Promise<boolean> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('person_blackout_dates')
    .select('id')
    .eq('person_id', personId)
    .lte('start_date', date)
    .gte('end_date', date)
    .limit(1)

  if (error) {
    console.error('Error checking person availability:', error)
    throw new Error('Failed to check person availability')
  }

  // If we found a blackout date, person is NOT available
  return !data || data.length === 0
}

/**
 * Get all blackout dates that overlap with a date range
 */
export async function getPersonBlackoutDatesInRange(
  personId: string,
  startDate: string,
  endDate: string
): Promise<PersonBlackoutDate[]> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('person_blackout_dates')
    .select('*')
    .eq('person_id', personId)
    .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
    .order('start_date', { ascending: true })

  if (error) {
    console.error('Error fetching person blackout dates in range:', error)
    throw new Error('Failed to fetch person blackout dates in range')
  }

  return data || []
}
