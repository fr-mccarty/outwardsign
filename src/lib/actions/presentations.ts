'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { Presentation } from '@/lib/types'

export interface CreatePresentationData {
  child_name: string
  child_sex: 'Male' | 'Female'
  mother_name: string
  father_name: string
  godparents_names?: string
  is_baptized: boolean
  language: 'English' | 'Spanish'
  event_id?: string
  notes?: string
}

export interface UpdatePresentationData {
  child_name?: string
  child_sex?: 'Male' | 'Female'
  mother_name?: string
  father_name?: string
  godparents_names?: string
  is_baptized?: boolean
  language?: 'English' | 'Spanish'
  event_id?: string
  notes?: string
}

export interface PresentationFilterParams {
  search?: string
  language?: string
  child_sex?: string
}

export async function getPresentations(filters?: PresentationFilterParams): Promise<Presentation[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  let query = supabase
    .from('presentations')
    .select('*')

  // Apply filters
  if (filters?.language && filters.language !== 'all') {
    query = query.eq('language', filters.language)
  }

  if (filters?.child_sex && filters.child_sex !== 'all') {
    query = query.eq('child_sex', filters.child_sex)
  }

  if (filters?.search) {
    // Use OR condition for search across multiple fields
    query = query.or(`child_name.ilike.%${filters.search}%,mother_name.ilike.%${filters.search}%,father_name.ilike.%${filters.search}%`)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching presentations:', error)
    throw new Error('Failed to fetch presentations')
  }

  return data || []
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

export async function createPresentation(data: CreatePresentationData): Promise<Presentation> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: presentation, error } = await supabase
    .from('presentations')
    .insert([
      {
        parish_id: selectedParishId,
        child_name: data.child_name,
        child_sex: data.child_sex,
        mother_name: data.mother_name,
        father_name: data.father_name,
        godparents_names: data.godparents_names || null,
        is_baptized: data.is_baptized,
        language: data.language,
        event_id: data.event_id || null,
        notes: data.notes || null,
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

  const updateData: Record<string, unknown> = {}
  if (data.child_name !== undefined) updateData.child_name = data.child_name
  if (data.child_sex !== undefined) updateData.child_sex = data.child_sex
  if (data.mother_name !== undefined) updateData.mother_name = data.mother_name
  if (data.father_name !== undefined) updateData.father_name = data.father_name
  if (data.godparents_names !== undefined) updateData.godparents_names = data.godparents_names || null
  if (data.is_baptized !== undefined) updateData.is_baptized = data.is_baptized
  if (data.language !== undefined) updateData.language = data.language
  if (data.event_id !== undefined) updateData.event_id = data.event_id || null
  if (data.notes !== undefined) updateData.notes = data.notes || null

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
