'use server'

import { createClient } from '@/lib/supabase/server'

export interface GlobalLiturgicalEvent {
  id: string
  event_key: string
  date: string
  year: number
  locale: string
  event_data: {
    event_key: string
    event_idx: number
    name: string
    color: string[]
    color_lcl: string[]
    grade: number
    grade_lcl: string
    grade_abbr: string
    grade_display: string | null
    common: string[]
    common_lcl: string
    type: string
    date: string
    year: number
    month: number
    month_short: string
    month_long: string
    day: number
    day_of_the_week_iso8601: number
    day_of_the_week_short: string
    day_of_the_week_long: string
    readings?: {
      first_reading?: string
      responsorial_psalm?: string
      second_reading?: string
      gospel_acclamation?: string
      gospel?: string
    }
    liturgical_year?: string
    is_vigil_mass?: boolean
    is_vigil_for?: string
    has_vigil_mass?: boolean
    has_vesper_i?: boolean
    has_vesper_ii?: boolean
    psalter_week?: number
    liturgical_season?: string
    liturgical_season_lcl?: string
  }
  created_at: string
  updated_at: string
}

/**
 * Get global liturgical events for a date range
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @param locale - Locale code (default: 'en')
 */
export async function getGlobalLiturgicalEvents(
  startDate: string,
  endDate: string,
  locale: string = 'en'
): Promise<GlobalLiturgicalEvent[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('global_liturgical_events')
    .select('*')
    .eq('locale', locale)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) {
    console.error('Error fetching global liturgical events:', error)
    throw new Error('Failed to fetch global liturgical events')
  }

  return data || []
}

/**
 * Get global liturgical events for a specific month
 * @param year - Year
 * @param month - Month (1-12)
 * @param locale - Locale code (default: 'en')
 */
export async function getGlobalLiturgicalEventsByMonth(
  year: number,
  month: number,
  locale: string = 'en'
): Promise<GlobalLiturgicalEvent[]> {
  // Calculate date range for the month
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0) // Last day of month

  const startDateStr = startDate.toISOString().split('T')[0]
  const endDateStr = endDate.toISOString().split('T')[0]

  return getGlobalLiturgicalEvents(startDateStr, endDateStr, locale)
}

/**
 * Get global liturgical event by ID
 * @param id - Event ID
 */
export async function getGlobalLiturgicalEvent(
  id: string
): Promise<GlobalLiturgicalEvent | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('global_liturgical_events')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching global liturgical event:', error)
    return null
  }

  return data
}
