'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { Presentation, Person, Event } from '@/lib/types'

export interface CreatePresentationData {
  presentation_event_id?: string | null
  child_id?: string | null
  mother_id?: string | null
  father_id?: string | null
  coordinator_id?: string | null
  is_baptized?: boolean
  status?: string | null
  note?: string | null
  presentation_template_id?: string | null
}

export interface UpdatePresentationData {
  presentation_event_id?: string | null
  child_id?: string | null
  mother_id?: string | null
  father_id?: string | null
  coordinator_id?: string | null
  is_baptized?: boolean
  status?: string | null
  note?: string | null
  presentation_template_id?: string | null
}

export interface PresentationFilterParams {
  search?: string
  status?: string
}

export interface PresentationWithNames extends Presentation {
  child?: Person | null
  mother?: Person | null
  father?: Person | null
  presentation_event?: Event | null
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
      presentation_event:events!presentation_event_id(*)
    `)

  // Apply status filter at database level
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  query = query.order('created_at', { ascending: false })

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
      const childFirstName = presentation.child?.first_name?.toLowerCase() || ''
      const childLastName = presentation.child?.last_name?.toLowerCase() || ''
      const motherFirstName = presentation.mother?.first_name?.toLowerCase() || ''
      const motherLastName = presentation.mother?.last_name?.toLowerCase() || ''
      const fatherFirstName = presentation.father?.first_name?.toLowerCase() || ''
      const fatherLastName = presentation.father?.last_name?.toLowerCase() || ''

      return (
        childFirstName.includes(searchTerm) ||
        childLastName.includes(searchTerm) ||
        motherFirstName.includes(searchTerm) ||
        motherLastName.includes(searchTerm) ||
        fatherFirstName.includes(searchTerm) ||
        fatherLastName.includes(searchTerm)
      )
    })
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
  presentation_event?: Event | null
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
    presentation.presentation_event_id ? supabase.from('events').select('*').eq('id', presentation.presentation_event_id).single() : Promise.resolve({ data: null })
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

  const { data: presentation, error } = await supabase
    .from('presentations')
    .insert([
      {
        parish_id: selectedParishId,
        presentation_event_id: data.presentation_event_id || null,
        child_id: data.child_id || null,
        mother_id: data.mother_id || null,
        father_id: data.father_id || null,
        coordinator_id: data.coordinator_id || null,
        is_baptized: data.is_baptized || false,
        status: data.status || null,
        note: data.note || null,
        presentation_template_id: data.presentation_template_id || null,
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

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
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
