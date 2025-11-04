'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { Wedding, Person, Event } from '@/lib/types'
import { IndividualReading } from '@/lib/actions/readings'

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
  wedding_template_id?: string
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
  wedding_template_id?: string | null
}

export interface WeddingFilterParams {
  search?: string
  status?: string
}

export interface WeddingWithNames extends Wedding {
  bride?: Person | null
  groom?: Person | null
  wedding_event?: Event | null
}

export async function getWeddings(filters?: WeddingFilterParams): Promise<WeddingWithNames[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  let query = supabase
    .from('weddings')
    .select(`
      *,
      bride:people!bride_id(*),
      groom:people!groom_id(*),
      wedding_event:events!wedding_event_id(*)
    `)

  // Apply status filter at database level
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching weddings:', error)
    throw new Error('Failed to fetch weddings')
  }

  let weddings = data || []

  // Apply search filter in application layer (searching related table fields)
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
    weddings = weddings.filter(wedding => {
      const brideFirstName = wedding.bride?.first_name?.toLowerCase() || ''
      const brideLastName = wedding.bride?.last_name?.toLowerCase() || ''
      const groomFirstName = wedding.groom?.first_name?.toLowerCase() || ''
      const groomLastName = wedding.groom?.last_name?.toLowerCase() || ''

      return (
        brideFirstName.includes(searchTerm) ||
        brideLastName.includes(searchTerm) ||
        groomFirstName.includes(searchTerm) ||
        groomLastName.includes(searchTerm)
      )
    })
  }

  return weddings
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

// Enhanced wedding interface with all related data
export interface WeddingWithRelations extends Wedding {
  bride?: Person | null
  groom?: Person | null
  coordinator?: Person | null
  presider?: Person | null
  homilist?: Person | null
  lead_musician?: Person | null
  cantor?: Person | null
  witness_1?: Person | null
  witness_2?: Person | null
  wedding_event?: Event | null
  reception_event?: Event | null
  rehearsal_event?: Event | null
  rehearsal_dinner_event?: Event | null
  first_reading?: IndividualReading | null
  psalm?: IndividualReading | null
  second_reading?: IndividualReading | null
  gospel_reading?: IndividualReading | null
  first_reader?: Person | null
  second_reader?: Person | null
  psalm_reader?: Person | null
  gospel_reader?: Person | null
  petition_reader?: Person | null
}

export async function getWeddingWithRelations(id: string): Promise<WeddingWithRelations | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the wedding
  const { data: wedding, error } = await supabase
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

  // Fetch all related data in parallel
  const [
    brideData,
    groomData,
    coordinatorData,
    presiderData,
    homilistData,
    leadMusicianData,
    cantorData,
    witness1Data,
    witness2Data,
    weddingEventData,
    receptionEventData,
    rehearsalEventData,
    rehearsalDinnerEventData,
    firstReadingData,
    psalmData,
    secondReadingData,
    gospelReadingData,
    firstReaderData,
    secondReaderData,
    psalmReaderData,
    gospelReaderData,
    petitionReaderData
  ] = await Promise.all([
    wedding.bride_id ? supabase.from('people').select('*').eq('id', wedding.bride_id).single() : Promise.resolve({ data: null }),
    wedding.groom_id ? supabase.from('people').select('*').eq('id', wedding.groom_id).single() : Promise.resolve({ data: null }),
    wedding.coordinator_id ? supabase.from('people').select('*').eq('id', wedding.coordinator_id).single() : Promise.resolve({ data: null }),
    wedding.presider_id ? supabase.from('people').select('*').eq('id', wedding.presider_id).single() : Promise.resolve({ data: null }),
    wedding.homilist_id ? supabase.from('people').select('*').eq('id', wedding.homilist_id).single() : Promise.resolve({ data: null }),
    wedding.lead_musician_id ? supabase.from('people').select('*').eq('id', wedding.lead_musician_id).single() : Promise.resolve({ data: null }),
    wedding.cantor_id ? supabase.from('people').select('*').eq('id', wedding.cantor_id).single() : Promise.resolve({ data: null }),
    wedding.witness_1_id ? supabase.from('people').select('*').eq('id', wedding.witness_1_id).single() : Promise.resolve({ data: null }),
    wedding.witness_2_id ? supabase.from('people').select('*').eq('id', wedding.witness_2_id).single() : Promise.resolve({ data: null }),
    wedding.wedding_event_id ? supabase.from('events').select('*').eq('id', wedding.wedding_event_id).single() : Promise.resolve({ data: null }),
    wedding.reception_event_id ? supabase.from('events').select('*').eq('id', wedding.reception_event_id).single() : Promise.resolve({ data: null }),
    wedding.rehearsal_event_id ? supabase.from('events').select('*').eq('id', wedding.rehearsal_event_id).single() : Promise.resolve({ data: null }),
    wedding.rehearsal_dinner_event_id ? supabase.from('events').select('*').eq('id', wedding.rehearsal_dinner_event_id).single() : Promise.resolve({ data: null }),
    wedding.first_reading_id ? supabase.from('readings').select('*').eq('id', wedding.first_reading_id).single() : Promise.resolve({ data: null }),
    wedding.psalm_id ? supabase.from('readings').select('*').eq('id', wedding.psalm_id).single() : Promise.resolve({ data: null }),
    wedding.second_reading_id ? supabase.from('readings').select('*').eq('id', wedding.second_reading_id).single() : Promise.resolve({ data: null }),
    wedding.gospel_reading_id ? supabase.from('readings').select('*').eq('id', wedding.gospel_reading_id).single() : Promise.resolve({ data: null }),
    wedding.first_reader_id ? supabase.from('people').select('*').eq('id', wedding.first_reader_id).single() : Promise.resolve({ data: null }),
    wedding.second_reader_id ? supabase.from('people').select('*').eq('id', wedding.second_reader_id).single() : Promise.resolve({ data: null }),
    wedding.psalm_reader_id ? supabase.from('people').select('*').eq('id', wedding.psalm_reader_id).single() : Promise.resolve({ data: null }),
    wedding.gospel_reader_id ? supabase.from('people').select('*').eq('id', wedding.gospel_reader_id).single() : Promise.resolve({ data: null }),
    wedding.petition_reader_id ? supabase.from('people').select('*').eq('id', wedding.petition_reader_id).single() : Promise.resolve({ data: null })
  ])

  return {
    ...wedding,
    bride: brideData.data,
    groom: groomData.data,
    coordinator: coordinatorData.data,
    presider: presiderData.data,
    homilist: homilistData.data,
    lead_musician: leadMusicianData.data,
    cantor: cantorData.data,
    witness_1: witness1Data.data,
    witness_2: witness2Data.data,
    wedding_event: weddingEventData.data,
    reception_event: receptionEventData.data,
    rehearsal_event: rehearsalEventData.data,
    rehearsal_dinner_event: rehearsalDinnerEventData.data,
    first_reading: firstReadingData.data,
    psalm: psalmData.data,
    second_reading: secondReadingData.data,
    gospel_reading: gospelReadingData.data,
    first_reader: firstReaderData.data,
    second_reader: secondReaderData.data,
    psalm_reader: psalmReaderData.data,
    gospel_reader: gospelReaderData.data,
    petition_reader: petitionReaderData.data
  }
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
        wedding_template_id: data.wedding_template_id || null,
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

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )

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
  revalidatePath(`/weddings/${id}/edit`)
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
