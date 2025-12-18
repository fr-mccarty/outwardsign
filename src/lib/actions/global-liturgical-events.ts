'use server'

import { createClient } from '@/lib/supabase/server'
import { logError } from '@/lib/utils/console'
import { toLocalDateString } from '@/lib/utils/formatters'
import { logError } from '@/lib/utils/console'
import type { PaginatedParams, PaginatedResult } from './people'
import { logError } from '@/lib/utils/console'

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
 * @param locale - Locale code (default: 'en_US')
 */
export async function getGlobalLiturgicalEvents(
  startDate: string,
  endDate: string,
  locale: string = 'en_US'
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
    logError('Error fetching global liturgical events:', error)
    throw new Error('Failed to fetch global liturgical events')
  }

  return data || []
}

/**
 * Get paginated global liturgical events for a date range
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @param locale - Locale code (default: 'en_US')
 * @param params - Pagination parameters
 */
export async function getGlobalLiturgicalEventsPaginated(
  startDate: string,
  endDate: string,
  locale: string = 'en_US',
  params?: PaginatedParams
): Promise<PaginatedResult<GlobalLiturgicalEvent>> {
  const supabase = await createClient()

  const offset = params?.offset || 0
  const limit = params?.limit || 10
  const search = params?.search || ''

  // Build base query
  let query = supabase
    .from('global_liturgical_events')
    .select('*', { count: 'exact' })
    .eq('locale', locale)
    .gte('date', startDate)
    .lte('date', endDate)

  // Apply search filter (search in event_data->name)
  if (search) {
    // Note: This is a simplified search. For better search across JSONB fields,
    // you might need to create a generated column or use full-text search
    query = query.ilike('event_key', `%${search}%`)
  }

  // Apply ordering, pagination
  query = query
    .order('date', { ascending: true })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    logError('Error fetching paginated global liturgical events:', error)
    throw new Error('Failed to fetch paginated global liturgical events')
  }

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / limit)
  const page = Math.floor(offset / limit) + 1

  return {
    items: data || [],
    totalCount,
    page,
    limit,
    totalPages,
  }
}

/**
 * Get global liturgical events for a specific month
 * @param year - Year
 * @param month - Month (1-12)
 * @param locale - Locale code (default: 'en_US')
 */
export async function getGlobalLiturgicalEventsByMonth(
  year: number,
  month: number,
  locale: string = 'en_US'
): Promise<GlobalLiturgicalEvent[]> {
  // Calculate date range for the month
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0) // Last day of month

  const startDateStr = toLocalDateString(startDate)
  const endDateStr = toLocalDateString(endDate)

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
    logError('Error fetching global liturgical event:', error)
    return null
  }

  return data
}
