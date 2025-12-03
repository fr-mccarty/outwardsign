'use server'

import { createClient } from '@/lib/supabase/server'
// redirect import removed - not used
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { requireEditSharedResources } from '@/lib/auth/permissions'
import type { LiturgicalLanguage, ReadingCategory } from '@/lib/constants'
import { LIST_VIEW_PAGE_SIZE } from '@/lib/constants'
import {
  createReadingSchema,
  updateReadingSchema,
  type CreateReadingData,
  type UpdateReadingData
} from '@/lib/schemas/readings'

export interface Reading {
  id: string
  categories: string[] | null
  conclusion: string | null
  created_at: string
  introduction: string | null
  language: LiturgicalLanguage | null
  pericope: string | null
  text: string | null
  parish_id: string | null
}

export interface ReadingFilterParams {
  search?: string
  language?: LiturgicalLanguage | 'all'
  category?: ReadingCategory | 'all'
  sort?: 'pericope_asc' | 'pericope_desc' | 'created_asc' | 'created_desc'
  offset?: number
  limit?: number
}

export interface ReadingStats {
  total: number
  filtered: number
}

export async function getReadingStats(filteredReadings: Reading[]): Promise<ReadingStats> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Fetch all readings for total stats (no filters)
  const { data: allReadings } = await supabase
    .from('readings')
    .select('*')

  const total = allReadings?.length || 0
  const filtered = filteredReadings.length

  return {
    total,
    filtered
  }
}

export async function createReading(data: CreateReadingData): Promise<Reading> {
  const supabase = await createClient()

  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  // Validate data with schema
  const validatedData = createReadingSchema.parse(data)

  const { data: reading, error } = await supabase
    .from('readings')
    .insert([
      {
        parish_id: selectedParishId,
        categories: validatedData.categories || null,
        conclusion: validatedData.conclusion || null,
        introduction: validatedData.introduction || null,
        language: validatedData.language || null,
        pericope: validatedData.pericope,
        text: validatedData.text,
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

  // Calculate pagination
  const offset = filters?.offset || 0
  const limit = filters?.limit || LIST_VIEW_PAGE_SIZE

  let query = supabase
    .from('readings')
    .select('*')

  // Apply database-level language filter
  if (filters?.language && filters.language !== 'all') {
    query = query.eq('language', filters.language)
  }

  // Apply database-level category filter
  if (filters?.category && filters.category !== 'all') {
    query = query.contains('categories', [filters.category])
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
    console.error('Error fetching readings:', error)
    throw new Error('Failed to fetch readings')
  }

  let readings = data || []

  // Apply search filter in application layer (searching multiple fields)
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
    readings = readings.filter(reading => {
      const pericope = reading.pericope?.toLowerCase() || ''
      const text = reading.text?.toLowerCase() || ''
      const introduction = reading.introduction?.toLowerCase() || ''
      const conclusion = reading.conclusion?.toLowerCase() || ''

      return (
        pericope.includes(searchTerm) ||
        text.includes(searchTerm) ||
        introduction.includes(searchTerm) ||
        conclusion.includes(searchTerm)
      )
    })
  }

  // Apply application-level sorting for pericope
  if (filters?.sort === 'pericope_asc') {
    readings.sort((a, b) => {
      const aVal = a.pericope?.toLowerCase() || ''
      const bVal = b.pericope?.toLowerCase() || ''
      return aVal.localeCompare(bVal)
    })
  } else if (filters?.sort === 'pericope_desc') {
    readings.sort((a, b) => {
      const aVal = a.pericope?.toLowerCase() || ''
      const bVal = b.pericope?.toLowerCase() || ''
      return bVal.localeCompare(aVal)
    })
  }

  return readings
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

export async function updateReading(id: string, data: UpdateReadingData): Promise<Reading> {
  const supabase = await createClient()

  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  // Validate data with schema
  const validatedData = updateReadingSchema.parse(data)

  const { data: reading, error } = await supabase
    .from('readings')
    .update({
      categories: validatedData.categories || null,
      conclusion: validatedData.conclusion || null,
      introduction: validatedData.introduction || null,
      language: validatedData.language || null,
      pericope: validatedData.pericope,
      text: validatedData.text,
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

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  const { error } = await supabase
    .from('readings')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error('Failed to delete reading')
  }

  revalidatePath('/readings')
}

export async function getReadingsByCategory(category: ReadingCategory): Promise<Reading[]> {
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

export async function getReadingsByLanguage(language: LiturgicalLanguage): Promise<Reading[]> {
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
  category: ReadingCategory
  // Add full categories array for filtering
  categories?: string[]
  language?: LiturgicalLanguage
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
  category: ReadingCategory
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
    category: (reading.categories?.[0] || 'general') as any,
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
    category: (reading.categories?.[0] || 'general') as any,
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
    language: 'en'
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