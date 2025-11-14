'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'

export interface Reading {
  id: string
  categories: string[] | null
  conclusion: string | null
  created_at: string
  introduction: string | null
  language: string | null
  pericope: string | null
  text: string | null
  parish_id: string | null
}

export interface CreateReadingData {
  categories?: string[]
  conclusion?: string
  introduction?: string
  language?: string
  pericope: string
  text: string
}

export interface ReadingFilterParams {
  search?: string
  language?: string
  category?: string
}

export async function createReading(data: CreateReadingData): Promise<Reading> {
  const supabase = await createClient()

  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const { data: reading, error } = await supabase
    .from('readings')
    .insert([
      {
        parish_id: selectedParishId,
        categories: data.categories || null,
        conclusion: data.conclusion || null,
        introduction: data.introduction || null,
        language: data.language || null,
        pericope: data.pericope,
        text: data.text,
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error('Failed to create reading')
  }

  revalidatePath('/readings')

  return reading
}

export async function getReadings(filters?: ReadingFilterParams): Promise<Reading[]> {
  const supabase = await createClient()

  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  let query = supabase
    .from('readings')
    .select('*')

  // Apply filters
  if (filters?.language && filters.language !== 'all') {
    query = query.eq('language', filters.language)
  }

  if (filters?.category && filters.category !== 'all') {
    query = query.contains('categories', [filters.category])
  }

  if (filters?.search) {
    // Use OR condition for search across multiple fields
    query = query.or(`pericope.ilike.%${filters.search}%,text.ilike.%${filters.search}%`)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    throw new Error('Failed to fetch readings')
  }

  return data || []
}

export async function getReading(id: string): Promise<Reading | null> {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const { data, error } = await supabase
    .from('readings')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export async function updateReading(id: string, data: CreateReadingData): Promise<Reading> {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const { data: reading, error } = await supabase
    .from('readings')
    .update({
      categories: data.categories || null,
      conclusion: data.conclusion || null,
      introduction: data.introduction || null,
      language: data.language || null,
      pericope: data.pericope,
      text: data.text,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error('Failed to update reading')
  }

  revalidatePath('/readings')
  revalidatePath(`/readings/${id}`)

  return reading
}

export async function deleteReading(id: string): Promise<void> {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const { error } = await supabase
    .from('readings')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error('Failed to delete reading')
  }

  revalidatePath('/readings')
}

export async function getReadingsByCategory(category: string): Promise<Reading[]> {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const { data, error } = await supabase
    .from('readings')
    .select('*')
    .contains('categories', [category])
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch readings by category')
  }

  return data || []
}

export async function getReadingsByLanguage(language: string): Promise<Reading[]> {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const { data, error } = await supabase
    .from('readings')
    .select('*')
    .eq('language', language)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch readings by language')
  }

  return data || []
}

// Legacy type definition for compatibility
export interface IndividualReading {
  id: string
  parish_id?: string
  pericope: string
  title: string
  category: string
  // Add full categories array for filtering
  categories?: string[]
  language?: string
  translation_id: number
  sort_order: number
  introduction?: string
  text: string
  conclusion?: string
  is_template: boolean
  created_at: string
  updated_at: string
}

export interface CreateIndividualReadingData {
  pericope: string
  title: string
  category: string
  translation_id?: number
  sort_order?: number
  introduction?: string
  reading_text: string
  conclusion?: string
  is_template?: boolean
}

// Placeholder functions for legacy compatibility
export async function getIndividualReadings(): Promise<IndividualReading[]> {
  const readings = await getReadings()
  // Transform Reading to IndividualReading format
  return readings.map(reading => ({
    id: reading.id,
    parish_id: reading.parish_id || undefined,
    pericope: reading.pericope || '',
    title: reading.pericope || 'Untitled Reading',
    category: reading.categories?.[0] || 'general',
    // Add full categories array for filtering
    categories: reading.categories || [],
    language: reading.language || undefined,
    translation_id: 1,
    sort_order: 0,
    introduction: reading.introduction || '',
    text: reading.text || '',
    conclusion: reading.conclusion || '',
    is_template: false,
    created_at: reading.created_at,
    updated_at: reading.created_at
  }))
}

export async function getIndividualReading(id: string): Promise<IndividualReading | null> {
  const reading = await getReading(id)
  if (!reading) return null

  // Transform Reading to IndividualReading format
  return {
    id: reading.id,
    parish_id: reading.parish_id || undefined,
    pericope: reading.pericope || '',
    title: reading.pericope || 'Untitled Reading',
    category: reading.categories?.[0] || 'general',
    language: reading.language || undefined,
    translation_id: 1,
    sort_order: 0,
    introduction: reading.introduction || '',
    text: reading.text || '',
    conclusion: reading.conclusion || '',
    is_template: false,
    created_at: reading.created_at,
    updated_at: reading.created_at
  }
}

export async function createIndividualReading(data: CreateIndividualReadingData): Promise<IndividualReading> {
  const readingData: CreateReadingData = {
    pericope: data.pericope,
    text: data.reading_text,
    categories: [data.category],
    language: 'English'
  }

  const reading = await createReading(readingData)

  // Transform Reading to IndividualReading format
  return {
    id: reading.id,
    parish_id: reading.parish_id || undefined,
    pericope: reading.pericope || '',
    title: data.title,
    category: data.category,
    language: reading.language || undefined,
    translation_id: data.translation_id || 1,
    sort_order: data.sort_order || 0,
    introduction: data.introduction || '',
    text: data.reading_text,
    conclusion: data.conclusion || '',
    is_template: data.is_template || false,
    created_at: reading.created_at,
    updated_at: reading.created_at
  }
}

export async function getReadingCollections(): Promise<unknown[]> {
  // Legacy function - return empty array for now
  return []
}

export async function getReadingCollectionWithItems(): Promise<unknown | null> {
  // Legacy function - return null for now
  return null
}