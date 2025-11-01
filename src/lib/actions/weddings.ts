'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { Wedding } from '@/lib/types'

export interface CreateWeddingData {
  wedding_event_id?: string
  bride_id?: string
  groom_id?: string
  coordinator_id?: string
  presider_id?: string
  homilist_id?: string
  lead_musician_id?: string
  cantor_id?: string
  reception_event_id?: string
  rehearsal_event_id?: string
  rehearsal_dinner_event_id?: string
  witness_1_id?: string
  witness_2_id?: string
  status?: string
  first_reading_id?: string
  psalm_id?: string
  psalm_reader_id?: string
  psalm_is_sung?: boolean
  second_reading_id?: string
  gospel_reading_id?: string
  gospel_reader_id?: string
  first_reader_id?: string
  second_reader_id?: string
  petitions_read_by_second_reader?: boolean
  petition_reader_id?: string
  petitions?: string
  announcements?: string
  notes?: string
}

export interface UpdateWeddingData {
  wedding_event_id?: string | null
  bride_id?: string | null
  groom_id?: string | null
  coordinator_id?: string | null
  presider_id?: string | null
  homilist_id?: string | null
  lead_musician_id?: string | null
  cantor_id?: string | null
  reception_event_id?: string | null
  rehearsal_event_id?: string | null
  rehearsal_dinner_event_id?: string | null
  witness_1_id?: string | null
  witness_2_id?: string | null
  status?: string | null
  first_reading_id?: string | null
  psalm_id?: string | null
  psalm_reader_id?: string | null
  psalm_is_sung?: boolean
  second_reading_id?: string | null
  gospel_reading_id?: string | null
  gospel_reader_id?: string | null
  first_reader_id?: string | null
  second_reader_id?: string | null
  petitions_read_by_second_reader?: boolean
  petition_reader_id?: string | null
  petitions?: string | null
  announcements?: string | null
  notes?: string | null
}

export interface WeddingFilterParams {
  search?: string
  status?: string
}

export async function getWeddings(filters?: WeddingFilterParams): Promise<Wedding[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  let query = supabase
    .from('weddings')
    .select('*')

  // Apply filters
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.search) {
    // Search across status and notes
    query = query.or(`status.ilike.%${filters.search}%,notes.ilike.%${filters.search}%,announcements.ilike.%${filters.search}%`)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching weddings:', error)
    throw new Error('Failed to fetch weddings')
  }

  return data || []
}

export async function getWedding(id: string): Promise<Wedding | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('weddings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching wedding:', error)
    throw new Error('Failed to fetch wedding')
  }

  return data
}

export async function createWedding(data: CreateWeddingData): Promise<Wedding> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: wedding, error } = await supabase
    .from('weddings')
    .insert([
      {
        parish_id: selectedParishId,
        wedding_event_id: data.wedding_event_id || null,
        bride_id: data.bride_id || null,
        groom_id: data.groom_id || null,
        coordinator_id: data.coordinator_id || null,
        presider_id: data.presider_id || null,
        homilist_id: data.homilist_id || null,
        lead_musician_id: data.lead_musician_id || null,
        cantor_id: data.cantor_id || null,
        reception_event_id: data.reception_event_id || null,
        rehearsal_event_id: data.rehearsal_event_id || null,
        rehearsal_dinner_event_id: data.rehearsal_dinner_event_id || null,
        witness_1_id: data.witness_1_id || null,
        witness_2_id: data.witness_2_id || null,
        status: data.status || null,
        first_reading_id: data.first_reading_id || null,
        psalm_id: data.psalm_id || null,
        psalm_reader_id: data.psalm_reader_id || null,
        psalm_is_sung: data.psalm_is_sung || false,
        second_reading_id: data.second_reading_id || null,
        gospel_reading_id: data.gospel_reading_id || null,
        gospel_reader_id: data.gospel_reader_id || null,
        first_reader_id: data.first_reader_id || null,
        second_reader_id: data.second_reader_id || null,
        petitions_read_by_second_reader: data.petitions_read_by_second_reader || false,
        petition_reader_id: data.petition_reader_id || null,
        petitions: data.petitions || null,
        announcements: data.announcements || null,
        notes: data.notes || null,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating wedding:', error)
    throw new Error('Failed to create wedding')
  }

  revalidatePath('/weddings')
  return wedding
}

export async function updateWedding(id: string, data: UpdateWeddingData): Promise<Wedding> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {}
  if (data.wedding_event_id !== undefined) updateData.wedding_event_id = data.wedding_event_id
  if (data.bride_id !== undefined) updateData.bride_id = data.bride_id
  if (data.groom_id !== undefined) updateData.groom_id = data.groom_id
  if (data.coordinator_id !== undefined) updateData.coordinator_id = data.coordinator_id
  if (data.presider_id !== undefined) updateData.presider_id = data.presider_id
  if (data.homilist_id !== undefined) updateData.homilist_id = data.homilist_id
  if (data.lead_musician_id !== undefined) updateData.lead_musician_id = data.lead_musician_id
  if (data.cantor_id !== undefined) updateData.cantor_id = data.cantor_id
  if (data.reception_event_id !== undefined) updateData.reception_event_id = data.reception_event_id
  if (data.rehearsal_event_id !== undefined) updateData.rehearsal_event_id = data.rehearsal_event_id
  if (data.rehearsal_dinner_event_id !== undefined) updateData.rehearsal_dinner_event_id = data.rehearsal_dinner_event_id
  if (data.witness_1_id !== undefined) updateData.witness_1_id = data.witness_1_id
  if (data.witness_2_id !== undefined) updateData.witness_2_id = data.witness_2_id
  if (data.status !== undefined) updateData.status = data.status
  if (data.first_reading_id !== undefined) updateData.first_reading_id = data.first_reading_id
  if (data.psalm_id !== undefined) updateData.psalm_id = data.psalm_id
  if (data.psalm_reader_id !== undefined) updateData.psalm_reader_id = data.psalm_reader_id
  if (data.psalm_is_sung !== undefined) updateData.psalm_is_sung = data.psalm_is_sung
  if (data.second_reading_id !== undefined) updateData.second_reading_id = data.second_reading_id
  if (data.gospel_reading_id !== undefined) updateData.gospel_reading_id = data.gospel_reading_id
  if (data.gospel_reader_id !== undefined) updateData.gospel_reader_id = data.gospel_reader_id
  if (data.first_reader_id !== undefined) updateData.first_reader_id = data.first_reader_id
  if (data.second_reader_id !== undefined) updateData.second_reader_id = data.second_reader_id
  if (data.petitions_read_by_second_reader !== undefined) updateData.petitions_read_by_second_reader = data.petitions_read_by_second_reader
  if (data.petition_reader_id !== undefined) updateData.petition_reader_id = data.petition_reader_id
  if (data.petitions !== undefined) updateData.petitions = data.petitions
  if (data.announcements !== undefined) updateData.announcements = data.announcements
  if (data.notes !== undefined) updateData.notes = data.notes

  const { data: wedding, error } = await supabase
    .from('weddings')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating wedding:', error)
    throw new Error('Failed to update wedding')
  }

  revalidatePath('/weddings')
  revalidatePath(`/weddings/${id}`)
  return wedding
}

export async function deleteWedding(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { error } = await supabase
    .from('weddings')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting wedding:', error)
    throw new Error('Failed to delete wedding')
  }

  revalidatePath('/weddings')
}
