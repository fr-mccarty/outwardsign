'use server'

import { createClient } from '@/lib/supabase/server'
import { CreateCalendarEntryData, LiturgicalCalendarEntry } from '@/lib/types'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'

export async function createCalendarEntry(data: CreateCalendarEntryData) {
  const supabase = await createClient()
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const { data: entry, error } = await supabase
    .from('liturgical_calendar')
    .insert([
      {
        parish_id: selectedParishId,
        title: data.title,
        date: data.date,
        liturgical_season: data.liturgical_season,
        liturgical_rank: data.liturgical_rank,
        color: data.color,
        readings: data.readings || [],
        special_prayers: data.special_prayers || [],
        notes: data.notes,
        is_custom: data.is_custom ?? true,
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error('Failed to create calendar entry')
  }

  return entry
}

export async function getCalendarEntries(): Promise<LiturgicalCalendarEntry[]> {
  const supabase = await createClient()
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const { data, error } = await supabase
    .from('liturgical_calendar')
    .select('*')
    .order('date', { ascending: true })

  if (error) {
    // If table doesn't exist yet, return empty array
    if (error.message?.includes('relation "public.liturgical_calendar" does not exist')) {
      console.warn('Calendar table not yet created. Please run database migrations.')
      return []
    }
    throw new Error('Failed to fetch calendar entries')
  }

  return data || []
}

export async function getCalendarEntry(id: string): Promise<LiturgicalCalendarEntry | null> {
  const supabase = await createClient()
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const { data, error } = await supabase
    .from('liturgical_calendar')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export async function updateCalendarEntry(id: string, data: CreateCalendarEntryData) {
  const supabase = await createClient()
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const { data: entry, error } = await supabase
    .from('liturgical_calendar')
    .update({
      title: data.title,
      date: data.date,
      liturgical_season: data.liturgical_season,
      liturgical_rank: data.liturgical_rank,
      color: data.color,
      readings: data.readings || [],
      special_prayers: data.special_prayers || [],
      notes: data.notes,
      is_custom: data.is_custom ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error('Failed to update calendar entry')
  }

  return entry
}

export async function deleteCalendarEntry(id: string) {
  const supabase = await createClient()
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const { error } = await supabase
    .from('liturgical_calendar')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error('Failed to delete calendar entry')
  }
}

export async function getUpcomingEvents(limit = 10): Promise<LiturgicalCalendarEntry[]> {
  const supabase = await createClient()
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('liturgical_calendar')
    .select('*')
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(limit)

  if (error) {
    // If table doesn't exist yet, return empty array
    if (error.message?.includes('relation "public.liturgical_calendar" does not exist')) {
      console.warn('Calendar table not yet created. Please run database migrations.')
      return []
    }
    throw new Error('Failed to fetch upcoming events')
  }

  return data || []
}