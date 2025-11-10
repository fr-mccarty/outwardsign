'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { Baptism, Person, Event } from '@/lib/types'
import { EventWithRelations } from '@/lib/actions/events'
import { z } from 'zod'

// Zod validation schemas
export const createBaptismSchema = z.object({
  baptism_event_id: z.string().uuid().optional(),
  child_id: z.string().uuid().optional(),
  mother_id: z.string().uuid().optional(),
  father_id: z.string().uuid().optional(),
  sponsor_1_id: z.string().uuid().optional(),
  sponsor_2_id: z.string().uuid().optional(),
  presider_id: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
  baptism_template_id: z.string().optional(),
  note: z.string().optional(),
})

export const updateBaptismSchema = createBaptismSchema.partial()

// Export types from schemas
export type CreateBaptismData = z.infer<typeof createBaptismSchema>
export type UpdateBaptismData = z.infer<typeof updateBaptismSchema>

export interface BaptismFilterParams {
  search?: string
  status?: string
}

export interface BaptismWithNames extends Baptism {
  child?: Person | null
  baptism_event?: Event | null
}

export async function getBaptisms(filters?: BaptismFilterParams): Promise<BaptismWithNames[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  let query = supabase
    .from('baptisms')
    .select(`
      *,
      child:people!child_id(*),
      baptism_event:events!baptism_event_id(*)
    `)

  // Apply status filter at database level
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching baptisms:', error)
    throw new Error('Failed to fetch baptisms')
  }

  let baptisms = data || []

  // Apply search filter in application layer (searching related table fields)
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
    baptisms = baptisms.filter(baptism => {
      const childFirstName = baptism.child?.first_name?.toLowerCase() || ''
      const childLastName = baptism.child?.last_name?.toLowerCase() || ''

      return (
        childFirstName.includes(searchTerm) ||
        childLastName.includes(searchTerm)
      )
    })
  }

  return baptisms
}

export async function getBaptism(id: string): Promise<Baptism | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('baptisms')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching baptism:', error)
    throw new Error('Failed to fetch baptism')
  }

  return data
}

// Enhanced baptism interface with all related data
export interface BaptismWithRelations extends Baptism {
  child?: Person | null
  mother?: Person | null
  father?: Person | null
  sponsor_1?: Person | null
  sponsor_2?: Person | null
  presider?: Person | null
  baptism_event?: EventWithRelations | null
}

export async function getBaptismWithRelations(id: string): Promise<BaptismWithRelations | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the baptism
  const { data: baptism, error } = await supabase
    .from('baptisms')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching baptism:', error)
    throw new Error('Failed to fetch baptism')
  }

  // Fetch all related data in parallel
  const [
    childData,
    motherData,
    fatherData,
    sponsor1Data,
    sponsor2Data,
    presiderData,
    baptismEventData
  ] = await Promise.all([
    baptism.child_id ? supabase.from('people').select('*').eq('id', baptism.child_id).single() : Promise.resolve({ data: null }),
    baptism.mother_id ? supabase.from('people').select('*').eq('id', baptism.mother_id).single() : Promise.resolve({ data: null }),
    baptism.father_id ? supabase.from('people').select('*').eq('id', baptism.father_id).single() : Promise.resolve({ data: null }),
    baptism.sponsor_1_id ? supabase.from('people').select('*').eq('id', baptism.sponsor_1_id).single() : Promise.resolve({ data: null }),
    baptism.sponsor_2_id ? supabase.from('people').select('*').eq('id', baptism.sponsor_2_id).single() : Promise.resolve({ data: null }),
    baptism.presider_id ? supabase.from('people').select('*').eq('id', baptism.presider_id).single() : Promise.resolve({ data: null }),
    baptism.baptism_event_id ? supabase.from('events').select('*, location:locations(*)').eq('id', baptism.baptism_event_id).single() : Promise.resolve({ data: null })
  ])

  return {
    ...baptism,
    child: childData.data,
    mother: motherData.data,
    father: fatherData.data,
    sponsor_1: sponsor1Data.data,
    sponsor_2: sponsor2Data.data,
    presider: presiderData.data,
    baptism_event: baptismEventData.data
  }
}

export async function createBaptism(data: CreateBaptismData): Promise<Baptism> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Server-side validation (security boundary)
  const validatedData = createBaptismSchema.parse(data)

  const { data: baptism, error } = await supabase
    .from('baptisms')
    .insert([
      {
        parish_id: selectedParishId,
        baptism_event_id: validatedData.baptism_event_id || null,
        child_id: validatedData.child_id || null,
        mother_id: validatedData.mother_id || null,
        father_id: validatedData.father_id || null,
        sponsor_1_id: validatedData.sponsor_1_id || null,
        sponsor_2_id: validatedData.sponsor_2_id || null,
        presider_id: validatedData.presider_id || null,
        status: validatedData.status || null,
        baptism_template_id: validatedData.baptism_template_id || null,
        note: validatedData.note || null,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating baptism:', error)
    throw new Error('Failed to create baptism')
  }

  revalidatePath('/baptisms')
  return baptism
}

export async function updateBaptism(id: string, data: UpdateBaptismData): Promise<Baptism> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Server-side validation (security boundary)
  const validatedData = updateBaptismSchema.parse(data)

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    Object.entries(validatedData).filter(([_, value]) => value !== undefined)
  )

  const { data: baptism, error } = await supabase
    .from('baptisms')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating baptism:', error)
    throw new Error('Failed to update baptism')
  }

  revalidatePath('/baptisms')
  revalidatePath(`/baptisms/${id}`)
  revalidatePath(`/baptisms/${id}/edit`)
  return baptism
}

export async function deleteBaptism(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { error } = await supabase
    .from('baptisms')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting baptism:', error)
    throw new Error('Failed to delete baptism')
  }

  revalidatePath('/baptisms')
}
