'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { getUserParishRole, requireModuleAccess } from '@/lib/auth/permissions'
import { MassIntention, Person, Mass } from '@/lib/types'
import type { MassIntentionStatus } from '@/lib/constants'
import { createMassIntentionSchema, updateMassIntentionSchema, type CreateMassIntentionData, type UpdateMassIntentionData } from '@/lib/schemas/mass-intentions'

export interface MassIntentionFilterParams {
  search?: string
  status?: MassIntentionStatus | 'all'
}

export interface MassIntentionWithNames extends MassIntention {
  mass?: Mass | null
  requested_by?: Person | null
}

export interface PaginatedParams {
  page?: number
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
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  let query = supabase
    .from('mass_intentions')
    .select(`
      *,
      mass:masses(*),
      requested_by:people!requested_by_id(*)
    `)

  // Apply status filter at database level
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching mass intentions:', error)
    throw new Error('Failed to fetch mass intentions')
  }

  let intentions = data || []

  // Apply search filter in application layer
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
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

  return intentions
}

export async function getMassIntentionsPaginated(params?: PaginatedParams): Promise<PaginatedResult<MassIntentionWithNames>> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const page = params?.page || 1
  const limit = params?.limit || 10
  const search = params?.search || ''
  const status = params?.status

  // Calculate offset
  const offset = (page - 1) * limit

  // Build base query with relations
  let query = supabase
    .from('mass_intentions')
    .select(`
      *,
      mass:masses(*),
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
    console.error('Error fetching paginated mass intentions:', error)
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

  return {
    items: intentions,
    totalCount,
    page,
    limit,
    totalPages,
  }
}

export async function getMassIntention(id: string): Promise<MassIntention | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_intentions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching mass intention:', error)
    throw new Error('Failed to fetch mass intention')
  }

  return data
}

// Enhanced mass intention interface with all related data
export interface MassIntentionWithRelations extends MassIntention {
  mass?: Mass | null
  requested_by?: Person | null
}

export async function getMassIntentionWithRelations(id: string): Promise<MassIntentionWithRelations | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the mass intention
  const { data: intention, error } = await supabase
    .from('mass_intentions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching mass intention:', error)
    throw new Error('Failed to fetch mass intention')
  }

  // Fetch all related data in parallel
  const [
    massData,
    requestedByData
  ] = await Promise.all([
    intention.mass_id ? supabase.from('masses').select('*').eq('id', intention.mass_id).single() : Promise.resolve({ data: null }),
    intention.requested_by_id ? supabase.from('people').select('*').eq('id', intention.requested_by_id).single() : Promise.resolve({ data: null })
  ])

  return {
    ...intention,
    mass: massData.data,
    requested_by: requestedByData.data
  }
}

export async function createMassIntention(data: CreateMassIntentionData): Promise<MassIntention> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'mass-intentions')

  // Validate data with schema
  createMassIntentionSchema.parse(data)

  const { data: intention, error } = await supabase
    .from('mass_intentions')
    .insert([
      {
        parish_id: selectedParishId,
        mass_id: data.mass_id || null,
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
    console.error('Error creating mass intention:', error)
    throw new Error('Failed to create mass intention')
  }

  revalidatePath('/mass-intentions')
  return intention
}

export async function updateMassIntention(id: string, data: UpdateMassIntentionData): Promise<MassIntention> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'mass-intentions')

  // Validate data with schema
  updateMassIntentionSchema.parse(data)

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )

  const { data: intention, error } = await supabase
    .from('mass_intentions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating mass intention:', error)
    throw new Error('Failed to update mass intention')
  }

  revalidatePath('/mass-intentions')
  revalidatePath(`/mass-intentions/${id}`)
  revalidatePath(`/mass-intentions/${id}/edit`)
  return intention
}

export async function deleteMassIntention(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'mass-intentions')

  const { error } = await supabase
    .from('mass_intentions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting mass intention:', error)
    throw new Error('Failed to delete mass intention')
  }

  revalidatePath('/mass-intentions')
}

export interface MassIntentionReportData extends MassIntention {
  mass?: Mass & { event?: { start_date: string } | null } | null
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
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const startDate = params?.startDate
  const endDate = params?.endDate

  // First, get all mass intentions with their related masses and events
  const { data: intentions, error } = await supabase
    .from('mass_intentions')
    .select(`
      *,
      mass:masses(
        *,
        event:events(start_date)
      ),
      requested_by:people!requested_by_id(*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching mass intentions for report:', error)
    throw new Error('Failed to fetch mass intentions for report')
  }

  if (!intentions) {
    return {
      intentions: [],
      totalCount: 0,
      totalStipends: 0
    }
  }

  // Filter by date range on the mass event start_date
  const filteredIntentions = intentions.filter(intention => {
    // If no mass event date, exclude from report
    if (!intention.mass?.event?.start_date) {
      return false
    }

    const massDate = intention.mass.event.start_date

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
