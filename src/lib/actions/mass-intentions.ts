'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { MassIntention, Person, Mass } from '@/lib/types'

export interface CreateMassIntentionData {
  mass_id?: string
  mass_offered_for?: string
  requested_by_id?: string
  date_received?: string
  date_requested?: string
  stipend_in_cents?: number
  status?: string
  note?: string
}

export interface UpdateMassIntentionData {
  mass_id?: string | null
  mass_offered_for?: string | null
  requested_by_id?: string | null
  date_received?: string | null
  date_requested?: string | null
  stipend_in_cents?: number | null
  status?: string | null
  note?: string | null
}

export interface MassIntentionFilterParams {
  search?: string
  status?: string
}

export interface MassIntentionWithNames extends MassIntention {
  mass?: Mass | null
  requested_by?: Person | null
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
