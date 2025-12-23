'use server'

import { createClient } from '@/lib/supabase/server'
import { logError } from '@/lib/utils/console'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { MassIntention, Person, CalendarEvent } from '@/lib/types'
import type { MassIntentionStatus } from '@/lib/constants'
import { createMassIntentionSchema, updateMassIntentionSchema, type CreateMassIntentionData, type UpdateMassIntentionData } from '@/lib/schemas/mass-intentions'
import {
  createAuthenticatedClient,
  isNotFoundError,
} from './server-action-utils'

export interface MassIntentionFilterParams {
  search?: string
  status?: MassIntentionStatus | 'all'
  sort?: 'date_asc' | 'date_desc' | 'name_asc' | 'name_desc' | 'created_asc' | 'created_desc'
  offset?: number
  limit?: number
  start_date?: string
  end_date?: string
}

export interface MassIntentionWithNames extends MassIntention {
  calendar_event?: CalendarEvent | null
  requested_by?: Person | null
}

export interface MassIntentionStats {
  total: number
  requested: number
  scheduled: number
  filtered: number
}

export async function getMassIntentionStats(intentions: MassIntentionWithNames[]): Promise<MassIntentionStats> {
  return {
    total: intentions.length,
    requested: intentions.filter(i => i.status === 'REQUESTED').length,
    scheduled: intentions.filter(i => i.status === 'CONFIRMED').length,
    filtered: intentions.length
  }
}

export interface PaginatedParams {
  offset?: number
  limit?: number
  search?: string
  status?: MassIntentionStatus | 'all'
}

export interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  page: number
  limit: number
  totalPages: number
}

export async function getMassIntentions(filters?: MassIntentionFilterParams): Promise<MassIntentionWithNames[]> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  let query = supabase
    .from('mass_intentions')
    .select(`
      *,
      calendar_event:calendar_events(*),
      requested_by:people!requested_by_id(*)
    `)

  // Apply status filter at database level
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  // Apply sorting at database level for created_at
  if (filters?.sort === 'created_asc') {
    query = query.order('created_at', { ascending: true })
  } else if (filters?.sort === 'created_desc') {
    query = query.order('created_at', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    logError('Error fetching mass intentions: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch mass intentions')
  }

  let intentions = data || []

  // Apply search filter in application layer
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
    intentions = intentions.filter(intention => {
      const requestedByFirstName = intention.requested_by?.first_name?.toLowerCase() || ''
      const requestedByLastName = intention.requested_by?.last_name?.toLowerCase() || ''
      const requestedByFullName = intention.requested_by?.full_name?.toLowerCase() || ''
      const massOfferedFor = intention.mass_offered_for?.toLowerCase() || ''
      const note = intention.note?.toLowerCase() || ''

      return (
        requestedByFirstName.includes(searchTerm) ||
        requestedByLastName.includes(searchTerm) ||
        requestedByFullName.includes(searchTerm) ||
        massOfferedFor.includes(searchTerm) ||
        note.includes(searchTerm)
      )
    })
  }

  // Apply date range filters (using date_requested field)
  if (filters?.start_date) {
    intentions = intentions.filter(intention =>
      intention.date_requested && intention.date_requested >= filters.start_date!
    )
  }
  if (filters?.end_date) {
    intentions = intentions.filter(intention =>
      intention.date_requested && intention.date_requested <= filters.end_date!
    )
  }

  // Apply sorting at application level for related fields
  if (filters?.sort === 'date_asc') {
    intentions.sort((a, b) => {
      const dateA = a.date_requested || ''
      const dateB = b.date_requested || ''
      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1
      return dateA.localeCompare(dateB)
    })
  } else if (filters?.sort === 'date_desc') {
    intentions.sort((a, b) => {
      const dateA = a.date_requested || ''
      const dateB = b.date_requested || ''
      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1
      return dateB.localeCompare(dateA)
    })
  } else if (filters?.sort === 'name_asc') {
    intentions.sort((a, b) => {
      const nameA = a.mass_offered_for || ''
      const nameB = b.mass_offered_for || ''
      return nameA.localeCompare(nameB)
    })
  } else if (filters?.sort === 'name_desc') {
    intentions.sort((a, b) => {
      const nameA = a.mass_offered_for || ''
      const nameB = b.mass_offered_for || ''
      return nameB.localeCompare(nameA)
    })
  }

  return intentions
}

export async function getMassIntentionsPaginated(params?: PaginatedParams): Promise<PaginatedResult<MassIntentionWithNames>> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const offset = params?.offset || 0
  const limit = params?.limit || 10
  const search = params?.search || ''
  const status = params?.status

  // Build base query with relations
  let query = supabase
    .from('mass_intentions')
    .select(`
      *,
      calendar_event:calendar_events(*),
      requested_by:people!requested_by_id(*)
    `, { count: 'exact' })

  // Apply status filter at database level
  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  // Apply ordering, pagination
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    logError('Error fetching paginated mass intentions: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch paginated mass intentions')
  }

  let intentions = data || []

  // Apply search filter in application layer (searching related table fields)
  if (search) {
    const searchTerm = search.toLowerCase()
    intentions = intentions.filter(intention => {
      const requestedByFirstName = intention.requested_by?.first_name?.toLowerCase() || ''
      const requestedByLastName = intention.requested_by?.last_name?.toLowerCase() || ''
      const massOfferedFor = intention.mass_offered_for?.toLowerCase() || ''
      const note = intention.note?.toLowerCase() || ''

      return (
        requestedByFirstName.includes(searchTerm) ||
        requestedByLastName.includes(searchTerm) ||
        massOfferedFor.includes(searchTerm) ||
        note.includes(searchTerm)
      )
    })
  }

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / limit)
  const page = Math.floor(offset / limit) + 1

  return {
    items: intentions,
    totalCount,
    page,
    limit,
    totalPages,
  }
}

export async function getMassIntention(id: string): Promise<MassIntention | null> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_intentions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (isNotFoundError(error)) {
      return null // Not found
    }
    logError('Error fetching mass intention: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch mass intention')
  }

  return data
}

// Enhanced mass intention interface with all related data
export interface MassIntentionWithRelations extends MassIntention {
  calendar_event?: CalendarEvent | null
  requested_by?: Person | null
}

export async function getMassIntentionWithRelations(id: string): Promise<MassIntentionWithRelations | null> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the mass intention
  const { data: intention, error } = await supabase
    .from('mass_intentions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (isNotFoundError(error)) {
      return null // Not found
    }
    logError('Error fetching mass intention: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch mass intention')
  }

  // Fetch all related data in parallel
  const [
    calendarEventData,
    requestedByData
  ] = await Promise.all([
    intention.calendar_event_id ? supabase.from('calendar_events').select('*').eq('id', intention.calendar_event_id).single() : Promise.resolve({ data: null }),
    intention.requested_by_id ? supabase.from('people').select('*').eq('id', intention.requested_by_id).single() : Promise.resolve({ data: null })
  ])

  return {
    ...intention,
    calendar_event: calendarEventData.data,
    requested_by: requestedByData.data
  }
}

/**
 * Get all mass intentions for a specific calendar event
 */
export async function getMassIntentionsByCalendarEvent(calendarEventId: string): Promise<MassIntentionWithNames[]> {
  const { supabase } = await createAuthenticatedClient()

  const { data, error } = await supabase
    .from('mass_intentions')
    .select(`
      *,
      requested_by:people!requested_by_id(*)
    `)
    .eq('calendar_event_id', calendarEventId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (error) {
    logError('Error fetching mass intentions for calendar event: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch mass intentions')
  }

  return data || []
}

/**
 * Get all mass intentions for multiple calendar events (batch fetch)
 * Returns a map of calendar_event_id -> intentions
 */
export async function getMassIntentionsByCalendarEvents(calendarEventIds: string[]): Promise<Map<string, MassIntentionWithNames[]>> {
  if (calendarEventIds.length === 0) {
    return new Map()
  }

  const { supabase } = await createAuthenticatedClient()

  const { data, error } = await supabase
    .from('mass_intentions')
    .select(`
      *,
      requested_by:people!requested_by_id(*)
    `)
    .in('calendar_event_id', calendarEventIds)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (error) {
    logError('Error fetching mass intentions for calendar events: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch mass intentions')
  }

  // Group by calendar_event_id
  const intentionsMap = new Map<string, MassIntentionWithNames[]>()
  for (const intention of data || []) {
    if (intention.calendar_event_id) {
      const existing = intentionsMap.get(intention.calendar_event_id) || []
      existing.push(intention)
      intentionsMap.set(intention.calendar_event_id, existing)
    }
  }

  return intentionsMap
}

export async function createMassIntention(data: CreateMassIntentionData): Promise<MassIntention> {
  const { supabase, parishId } = await createAuthenticatedClient()


  // Validate data with schema
  createMassIntentionSchema.parse(data)

  const { data: intention, error } = await supabase
    .from('mass_intentions')
    .insert([
      {
        parish_id: parishId,
        calendar_event_id: data.calendar_event_id || null,
        mass_offered_for: data.mass_offered_for || null,
        requested_by_id: data.requested_by_id || null,
        date_received: data.date_received || null,
        date_requested: data.date_requested || null,
        stipend_in_cents: data.stipend_in_cents || 0,
        status: data.status || 'REQUESTED',
        mass_intention_template_id: data.mass_intention_template_id || null,
        note: data.note || null,
      }
    ])
    .select()
    .single()

  if (error) {
    logError('Error creating mass intention: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to create mass intention')
  }

  revalidatePath('/mass-intentions')
  return intention
}

export async function updateMassIntention(id: string, data: UpdateMassIntentionData): Promise<MassIntention> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()


  // Validate data with schema
  updateMassIntentionSchema.parse(data)

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(data).filter(([_key, value]) => value !== undefined)
  )

  const { data: intention, error } = await supabase
    .from('mass_intentions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    logError('Error updating mass intention: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to update mass intention')
  }

  revalidatePath('/mass-intentions')
  revalidatePath(`/mass-intentions/${id}`)
  revalidatePath(`/mass-intentions/${id}/edit`)
  return intention
}

export async function deleteMassIntention(id: string): Promise<void> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()


  const { error } = await supabase
    .from('mass_intentions')
    .delete()
    .eq('id', id)

  if (error) {
    logError('Error deleting mass intention: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to delete mass intention')
  }

  revalidatePath('/mass-intentions')
}

export interface MassIntentionReportData extends MassIntention {
  calendar_event?: CalendarEvent | null
  requested_by?: Person | null
}

export interface MassIntentionReportParams {
  startDate?: string
  endDate?: string
}

export interface MassIntentionReportResult {
  intentions: MassIntentionReportData[]
  totalCount: number
  totalStipends: number
}

export async function getMassIntentionsReport(
  params?: MassIntentionReportParams
): Promise<MassIntentionReportResult> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const startDate = params?.startDate
  const endDate = params?.endDate

  // First, get all mass intentions with their related calendar events
  const { data: intentions, error } = await supabase
    .from('mass_intentions')
    .select(`
      *,
      calendar_event:calendar_events(*),
      requested_by:people!requested_by_id(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    logError('Error fetching mass intentions for report: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch mass intentions for report')
  }

  if (!intentions) {
    return {
      intentions: [],
      totalCount: 0,
      totalStipends: 0
    }
  }

  // Filter by date range on the calendar event's start_datetime
  const filteredIntentions = intentions.filter(intention => {
    // If no calendar event, exclude from report
    if (!intention.calendar_event?.start_datetime) {
      return false
    }

    // Extract just the date part from the datetime
    const massDate = intention.calendar_event.start_datetime.split('T')[0]

    // If both dates provided, check range
    if (startDate && endDate) {
      return massDate >= startDate && massDate <= endDate
    }

    // If only start date, show everything from that date onwards
    if (startDate && !endDate) {
      return massDate >= startDate
    }

    // If only end date, show everything up to that date
    if (!startDate && endDate) {
      return massDate <= endDate
    }

    // If no dates, show everything
    return true
  })

  // Calculate totals
  const totalCount = filteredIntentions.length
  const totalStipends = filteredIntentions.reduce((sum, intention) => sum + (intention.stipend_in_cents || 0), 0)

  return {
    intentions: filteredIntentions,
    totalCount,
    totalStipends
  }
}

// Keep the old function for backward compatibility
export async function getMassIntentionsByDateRange(
  startDate: string,
  endDate: string
): Promise<MassIntentionReportData[]> {
  const result = await getMassIntentionsReport({ startDate, endDate })
  return result.intentions
}
