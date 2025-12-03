'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { getUserParishRole, requireModuleAccess } from '@/lib/auth/permissions'
import { OciaSession, Person, Event } from '@/lib/types'
import { EventWithRelations } from '@/lib/actions/events'
import type { ModuleStatus } from '@/lib/constants'
import { LIST_VIEW_PAGE_SIZE } from '@/lib/constants'
import {
  createOciaSessionSchema,
  updateOciaSessionSchema,
  type CreateOciaSessionData,
  type UpdateOciaSessionData
} from '@/lib/schemas/ocia-sessions'

export interface OciaSessionFilterParams {
  search?: string
  status?: ModuleStatus | 'all'
  sort?: 'date_asc' | 'date_desc' | 'name_asc' | 'name_desc' | 'created_asc' | 'created_desc'
  offset?: number
  limit?: number
  start_date?: string
  end_date?: string
}

export interface OciaSessionWithNames extends OciaSession {
  coordinator?: Person | null
  ocia_event?: EventWithRelations | null
  candidate_count?: number
  candidates?: Array<{
    id: string
    person?: Person | null
  }>
}

export interface OciaSessionWithRelations extends OciaSession {
  coordinator?: Person | null
  ocia_event?: EventWithRelations | null
  candidates: Person[]
}

export interface OciaSessionStats {
  total: number
  upcoming: number
  past: number
  filtered: number
}

export async function getOciaSessionStats(filteredOciaSessions: OciaSessionWithNames[]): Promise<OciaSessionStats> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Fetch all OCIA sessions for total stats (no filters)
  const { data: allOciaSessions } = await supabase
    .from('ocia_sessions')
    .select(`
      *,
      ocia_event:events!ocia_event_id(*)
    `)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const total = allOciaSessions?.length || 0
  const upcoming = allOciaSessions?.filter(session => {
    const eventDate = session.ocia_event?.start_date
    if (!eventDate) return false
    return new Date(eventDate) >= today
  }).length || 0
  const past = allOciaSessions?.filter(session => {
    const eventDate = session.ocia_event?.start_date
    if (!eventDate) return false
    return new Date(eventDate) < today
  }).length || 0
  const filtered = filteredOciaSessions.length

  return {
    total,
    upcoming,
    past,
    filtered
  }
}

export async function getOciaSessions(filters?: OciaSessionFilterParams): Promise<OciaSessionWithNames[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Calculate pagination
  const offset = filters?.offset || 0
  const limit = filters?.limit || LIST_VIEW_PAGE_SIZE

  let query = supabase
    .from('ocia_sessions')
    .select(`
      *,
      coordinator:people!coordinator_id(*),
      ocia_event:events!ocia_event_id(*, location:locations(*))
    `)

  // Apply status filter at database level
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  // Apply database-level sorting for created_at fields
  if (filters?.sort === 'created_asc') {
    query = query.order('created_at', { ascending: true })
  } else if (filters?.sort === 'created_desc') {
    query = query.order('created_at', { ascending: false })
  } else {
    // Default to most recent first
    query = query.order('created_at', { ascending: false })
  }

  // Apply pagination at database level
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching OCIA sessions:', error)
    throw new Error('Failed to fetch OCIA sessions')
  }

  let ociaSessions = data || []

  // Fetch candidate counts and first 5 people for each session
  const ociaSessionsWithCounts = await Promise.all(
    ociaSessions.map(async (session) => {
      const { count } = await supabase
        .from('people')
        .select('*', { count: 'exact', head: true })
        .eq('ocia_session_id', session.id)

      // Fetch first 5 candidates for avatars
      const { data: candidates } = await supabase
        .from('people')
        .select('id, first_name, last_name, full_name, avatar_url')
        .eq('ocia_session_id', session.id)
        .limit(5)

      return {
        ...session,
        candidate_count: count || 0,
        candidates: candidates?.map(c => ({ id: c.id, person: c })) || []
      }
    })
  )

  // Apply search filter in application layer
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
    ociaSessions = ociaSessionsWithCounts.filter(session => {
      const name = session.name?.toLowerCase() || ''
      const notes = session.note?.toLowerCase() || ''

      return (
        name.includes(searchTerm) ||
        notes.includes(searchTerm)
      )
    })
  } else {
    ociaSessions = ociaSessionsWithCounts
  }

  // Apply date range filter
  if (filters?.start_date || filters?.end_date) {
    ociaSessions = ociaSessions.filter(session => {
      const eventDate = session.ocia_event?.start_date
      if (!eventDate) return false

      const date = new Date(eventDate)
      const startDate = filters.start_date ? new Date(filters.start_date) : null
      const endDate = filters.end_date ? new Date(filters.end_date) : null

      if (startDate && date < startDate) return false
      if (endDate && date > endDate) return false

      return true
    })
  }

  // Apply application-level sorting for related fields (date and name)
  if (filters?.sort === 'date_asc' || filters?.sort === 'date_desc') {
    ociaSessions = ociaSessions.sort((a, b) => {
      const dateA = a.ocia_event?.start_date || ''
      const dateB = b.ocia_event?.start_date || ''

      // Handle nulls - push to end
      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1

      const comparison = new Date(dateA).getTime() - new Date(dateB).getTime()
      return filters.sort === 'date_asc' ? comparison : -comparison
    })
  } else if (filters?.sort === 'name_asc' || filters?.sort === 'name_desc') {
    ociaSessions = ociaSessions.sort((a, b) => {
      const nameA = a.name || ''
      const nameB = b.name || ''

      const comparison = nameA.localeCompare(nameB)
      return filters.sort === 'name_asc' ? comparison : -comparison
    })
  }

  return ociaSessions
}

export async function getOciaSession(id: string): Promise<OciaSession | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: ociaSession, error } = await supabase
    .from('ocia_sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching OCIA session:', error)
    throw new Error('Failed to fetch OCIA session')
  }

  return ociaSession
}

export async function getOciaSessionWithRelations(id: string): Promise<OciaSessionWithRelations | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the OCIA session
  const { data: ociaSession, error } = await supabase
    .from('ocia_sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching OCIA session:', error)
    throw new Error('Failed to fetch OCIA session')
  }

  // Fetch related data in parallel
  const [
    coordinatorData,
    ociaEventData,
    candidatesData
  ] = await Promise.all([
    ociaSession.coordinator_id ? supabase.from('people').select('*').eq('id', ociaSession.coordinator_id).single() : Promise.resolve({ data: null }),
    ociaSession.ocia_event_id ? supabase.from('events').select('*, location:locations(*)').eq('id', ociaSession.ocia_event_id).single() : Promise.resolve({ data: null }),
    supabase
      .from('people')
      .select('*')
      .eq('ocia_session_id', id)
  ])

  return {
    ...ociaSession,
    coordinator: coordinatorData.data,
    ocia_event: ociaEventData.data,
    candidates: candidatesData.data || []
  }
}

export async function createOciaSession(data: CreateOciaSessionData): Promise<OciaSession> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'ocia-sessions')

  // REQUIRED: Server-side validation (security boundary)
  const validatedData = createOciaSessionSchema.parse(data)

  const { data: ociaSession, error } = await supabase
    .from('ocia_sessions')
    .insert([
      {
        parish_id: selectedParishId,
        name: validatedData.name,
        ocia_event_id: validatedData.ocia_event_id || null,
        coordinator_id: validatedData.coordinator_id || null,
        status: validatedData.status || 'PLANNING',
        note: validatedData.note || null,
        ocia_template_id: validatedData.ocia_template_id || null,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating OCIA session:', error)
    throw new Error('Failed to create OCIA session')
  }

  revalidatePath('/ocia-sessions')

  return ociaSession
}

export async function updateOciaSession(id: string, data: UpdateOciaSessionData): Promise<OciaSession> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'ocia-sessions')

  // REQUIRED: Server-side validation (security boundary)
  const validatedData = updateOciaSessionSchema.parse(data)

  const { data: ociaSession, error } = await supabase
    .from('ocia_sessions')
    .update({
      name: validatedData.name,
      ocia_event_id: validatedData.ocia_event_id,
      coordinator_id: validatedData.coordinator_id,
      status: validatedData.status,
      note: validatedData.note,
      ocia_template_id: validatedData.ocia_template_id,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating OCIA session:', error)
    throw new Error('Failed to update OCIA session')
  }

  revalidatePath('/ocia-sessions')
  revalidatePath(`/ocia-sessions/${id}`)
  revalidatePath(`/ocia-sessions/${id}/edit`)

  return ociaSession
}

export async function deleteOciaSession(id: string, options?: { deleteLinkedCandidates?: boolean }): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'ocia-sessions')

  // If deleteLinkedCandidates is true, delete all linked candidates first
  if (options?.deleteLinkedCandidates) {
    const { error: candidatesError } = await supabase
      .from('people')
      .delete()
      .eq('ocia_session_id', id)

    if (candidatesError) {
      console.error('Error deleting linked candidates:', candidatesError)
      throw new Error('Failed to delete linked candidates')
    }
  }

  // Delete the OCIA session (linked candidates will have ocia_session_id set to NULL if not deleted)
  const { error } = await supabase
    .from('ocia_sessions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting OCIA session:', error)
    throw new Error('Failed to delete OCIA session')
  }

  revalidatePath('/ocia-sessions')
  revalidatePath('/people')
}

/**
 * Add an existing person to an OCIA session as a candidate
 * @param ociaSessionId - ID of the OCIA session
 * @param personId - ID of the person to add
 */
export async function addCandidateToSession(ociaSessionId: string, personId: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'ocia-sessions')

  // Check that the person is not already in a session
  const { data: person } = await supabase
    .from('people')
    .select('ocia_session_id')
    .eq('id', personId)
    .single()

  if (person?.ocia_session_id) {
    throw new Error('This person is already part of an OCIA session')
  }

  // Update the person to link them to the session
  const { error } = await supabase
    .from('people')
    .update({ ocia_session_id: ociaSessionId })
    .eq('id', personId)

  if (error) {
    console.error('Error adding candidate to session:', error)
    throw new Error('Failed to add candidate to session')
  }

  revalidatePath(`/ocia-sessions/${ociaSessionId}`)
  revalidatePath(`/ocia-sessions/${ociaSessionId}/edit`)
  revalidatePath(`/people/${personId}`)
}

/**
 * Remove a candidate from an OCIA session
 * @param personId - ID of the person to remove
 */
export async function removeCandidateFromSession(personId: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'ocia-sessions')

  // Get the ocia_session_id before removing
  const { data: person } = await supabase
    .from('people')
    .select('ocia_session_id')
    .eq('id', personId)
    .single()

  const ociaSessionId = person?.ocia_session_id

  // Update the person to unlink them from the session
  const { error } = await supabase
    .from('people')
    .update({ ocia_session_id: null })
    .eq('id', personId)

  if (error) {
    console.error('Error removing candidate from session:', error)
    throw new Error('Failed to remove candidate from session')
  }

  if (ociaSessionId) {
    revalidatePath(`/ocia-sessions/${ociaSessionId}`)
    revalidatePath(`/ocia-sessions/${ociaSessionId}/edit`)
  }
  revalidatePath(`/people/${personId}`)
}
