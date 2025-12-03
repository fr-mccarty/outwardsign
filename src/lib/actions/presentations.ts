'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { getUserParishRole, requireModuleAccess } from '@/lib/auth/permissions'
import { Presentation, Person } from '@/lib/types'
import { EventWithRelations } from '@/lib/actions/events'
import {
  createPresentationSchema,
  updatePresentationSchema,
  type CreatePresentationData,
  type UpdatePresentationData
} from '@/lib/schemas/presentations'
import type { ModuleStatus } from '@/lib/constants'

// Note: Schemas and types are imported from '@/lib/schemas/presentations'
// They cannot be re-exported from this 'use server' file

export interface PresentationFilterParams {
  search?: string
  status?: ModuleStatus | 'all'
  sort?: 'date_asc' | 'date_desc' | 'name_asc' | 'name_desc' | 'created_asc' | 'created_desc'
  offset?: number
  limit?: number
  start_date?: string
  end_date?: string
}

export interface PresentationWithNames extends Presentation {
  child?: Person | null
  mother?: Person | null
  father?: Person | null
  coordinator?: Person | null
  presentation_event?: EventWithRelations | null
}

export interface PresentationStats {
  total: number
  upcoming: number
  past: number
  filtered: number
}

export async function getPresentationStats(presentations: PresentationWithNames[]): Promise<PresentationStats> {
  const now = new Date()
  const todayString = now.toISOString().split('T')[0]

  return {
    total: presentations.length,
    upcoming: presentations.filter(p => p.presentation_event?.start_date && p.presentation_event.start_date >= todayString).length,
    past: presentations.filter(p => p.presentation_event?.start_date && p.presentation_event.start_date < todayString).length,
    filtered: presentations.length
  }
}

export async function getPresentations(filters?: PresentationFilterParams): Promise<PresentationWithNames[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  let query = supabase
    .from('presentations')
    .select(`
      *,
      child:people!child_id(*),
      mother:people!mother_id(*),
      father:people!father_id(*),
      coordinator:people!coordinator_id(*),
      presentation_event:events!presentation_event_id(*, location:locations(*))
    `)

  // Apply status filter at database level
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  // Handle sorting
  if (filters?.sort) {
    const sortParts = filters.sort.split('_')
    const direction = sortParts[sortParts.length - 1]
    const ascending = direction === 'asc'

    if (filters.sort.startsWith('created_')) {
      // Database-level sorting by created_at
      query = query.order('created_at', { ascending })
    }
  } else {
    // Default sort: most recent first
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching presentations:', error)
    throw new Error('Failed to fetch presentations')
  }

  let presentations = data || []

  // Apply search filter in application layer (searching related table fields)
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
    presentations = presentations.filter(presentation => {
      const childFullName = presentation.child?.full_name?.toLowerCase() || ''
      const notes = presentation.note?.toLowerCase() || ''

      return (
        childFullName.includes(searchTerm) ||
        notes.includes(searchTerm)
      )
    })
  }

  // Apply date range filters
  if (filters?.start_date) {
    presentations = presentations.filter(presentation =>
      presentation.presentation_event?.start_date && presentation.presentation_event.start_date >= filters.start_date!
    )
  }
  if (filters?.end_date) {
    presentations = presentations.filter(presentation =>
      presentation.presentation_event?.start_date && presentation.presentation_event.start_date <= filters.end_date!
    )
  }

  // Apply application-level sorting for related fields (name and date)
  if (filters?.sort) {
    const sortParts = filters.sort.split('_')
    const direction = sortParts[sortParts.length - 1]
    const ascending = direction === 'asc'

    if (filters.sort.startsWith('name_')) {
      // Application-level sorting by child's name
      presentations.sort((a, b) => {
        const nameA = a.child?.full_name || ''
        const nameB = b.child?.full_name || ''
        return ascending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      })
    } else if (filters.sort.startsWith('date_')) {
      // Application-level sorting by event date
      presentations.sort((a, b) => {
        const dateA = a.presentation_event?.start_date || ''
        const dateB = b.presentation_event?.start_date || ''
        if (!dateA && !dateB) return 0
        if (!dateA) return 1
        if (!dateB) return -1
        return ascending ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA)
      })
    }
  }

  return presentations
}

export async function getPresentation(id: string): Promise<Presentation | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching presentation:', error)
    throw new Error('Failed to fetch presentation')
  }

  return data
}

// Enhanced presentation interface with all related data
export interface PresentationWithRelations extends Presentation {
  child?: Person | null
  mother?: Person | null
  father?: Person | null
  coordinator?: Person | null
  presentation_event?: EventWithRelations | null
}

export async function getPresentationWithRelations(id: string): Promise<PresentationWithRelations | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the presentation
  const { data: presentation, error } = await supabase
    .from('presentations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching presentation:', error)
    throw new Error('Failed to fetch presentation')
  }

  // Fetch all related data in parallel
  const [
    childData,
    motherData,
    fatherData,
    coordinatorData,
    presentationEventData
  ] = await Promise.all([
    presentation.child_id ? supabase.from('people').select('*').eq('id', presentation.child_id).single() : Promise.resolve({ data: null }),
    presentation.mother_id ? supabase.from('people').select('*').eq('id', presentation.mother_id).single() : Promise.resolve({ data: null }),
    presentation.father_id ? supabase.from('people').select('*').eq('id', presentation.father_id).single() : Promise.resolve({ data: null }),
    presentation.coordinator_id ? supabase.from('people').select('*').eq('id', presentation.coordinator_id).single() : Promise.resolve({ data: null }),
    presentation.presentation_event_id ? supabase.from('events').select('*, location:locations(*)').eq('id', presentation.presentation_event_id).single() : Promise.resolve({ data: null })
  ])

  return {
    ...presentation,
    child: childData.data,
    mother: motherData.data,
    father: fatherData.data,
    coordinator: coordinatorData.data,
    presentation_event: presentationEventData.data
  }
}

export async function createPresentation(data: CreatePresentationData): Promise<Presentation> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'presentations')

  // Server-side validation (security boundary)
  const validatedData = createPresentationSchema.parse(data)

  const { data: presentation, error } = await supabase
    .from('presentations')
    .insert([
      {
        parish_id: selectedParishId,
        presentation_event_id: validatedData.presentation_event_id || null,
        child_id: validatedData.child_id || null,
        mother_id: validatedData.mother_id || null,
        father_id: validatedData.father_id || null,
        coordinator_id: validatedData.coordinator_id || null,
        is_baptized: validatedData.is_baptized || false,
        status: validatedData.status || null,
        note: validatedData.note || null,
        presentation_template_id: validatedData.presentation_template_id || null,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating presentation:', error)
    throw new Error('Failed to create presentation')
  }

  revalidatePath('/presentations')
  return presentation
}

export async function updatePresentation(id: string, data: UpdatePresentationData): Promise<Presentation> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'presentations')

  // Server-side validation (security boundary)
  const validatedData = updatePresentationSchema.parse(data)

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    Object.entries(validatedData).filter(([_, value]) => value !== undefined)
  )

  const { data: presentation, error } = await supabase
    .from('presentations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating presentation:', error)
    throw new Error('Failed to update presentation')
  }

  revalidatePath('/presentations')
  revalidatePath(`/presentations/${id}`)
  revalidatePath(`/presentations/${id}/edit`)
  return presentation
}

export async function deletePresentation(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'presentations')

  const { error } = await supabase
    .from('presentations')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting presentation:', error)
    throw new Error('Failed to delete presentation')
  }

  revalidatePath('/presentations')
}
