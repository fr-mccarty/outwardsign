'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { getUserParishRole, requireModuleAccess } from '@/lib/auth/permissions'
import { Wedding, Person } from '@/lib/types'
import { IndividualReading } from '@/lib/actions/readings'
import { EventWithRelations } from '@/lib/actions/events'
import {
  createWeddingSchema,
  updateWeddingSchema,
  type CreateWeddingData,
  type UpdateWeddingData
} from '@/lib/schemas/weddings'
import type { ModuleStatus } from '@/lib/constants'
import { LIST_VIEW_PAGE_SIZE } from '@/lib/constants'

// Note: CreateWeddingData and UpdateWeddingData types are imported from '@/lib/schemas/weddings'
// They cannot be re-exported from this 'use server' file

export interface WeddingFilterParams {
  search?: string
  status?: ModuleStatus | 'all'
  sort?: 'date_asc' | 'date_desc' | 'name_asc' | 'name_desc' | 'created_asc' | 'created_desc'
  page?: number
  limit?: number
  start_date?: string
  end_date?: string
}

export interface WeddingWithNames extends Wedding {
  bride?: Person | null
  groom?: Person | null
  presider?: Person | null
  wedding_event?: EventWithRelations | null
}

export interface WeddingStats {
  total: number
  upcoming: number
  past: number
  filtered: number
}

export async function getWeddingStats(filteredWeddings: WeddingWithNames[]): Promise<WeddingStats> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Fetch all weddings for total stats (no filters)
  const { data: allWeddings } = await supabase
    .from('weddings')
    .select(`
      *,
      wedding_event:events!wedding_event_id(*)
    `)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const total = allWeddings?.length || 0
  const upcoming = allWeddings?.filter(w => {
    const weddingDate = w.wedding_event?.start_date
    if (!weddingDate) return false
    return new Date(weddingDate) >= today
  }).length || 0
  const past = allWeddings?.filter(w => {
    const weddingDate = w.wedding_event?.start_date
    if (!weddingDate) return false
    return new Date(weddingDate) < today
  }).length || 0
  const filtered = filteredWeddings.length

  return {
    total,
    upcoming,
    past,
    filtered
  }
}

export async function getWeddings(filters?: WeddingFilterParams): Promise<WeddingWithNames[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Calculate pagination
  const page = filters?.page || 1
  const limit = filters?.limit || LIST_VIEW_PAGE_SIZE
  const offset = (page - 1) * limit

  let query = supabase
    .from('weddings')
    .select(`
      *,
      bride:people!bride_id(*),
      groom:people!groom_id(*),
      presider:people!presider_id(*),
      wedding_event:events!wedding_event_id(*, location:locations(*))
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
    console.error('Error fetching weddings:', error)
    throw new Error('Failed to fetch weddings')
  }

  let weddings = data || []

  // Apply search filter in application layer (searching related table fields and notes)
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
    weddings = weddings.filter(wedding => {
      const brideFirstName = wedding.bride?.first_name?.toLowerCase() || ''
      const brideLastName = wedding.bride?.last_name?.toLowerCase() || ''
      const brideFull = wedding.bride?.full_name?.toLowerCase() || ''
      const groomFirstName = wedding.groom?.first_name?.toLowerCase() || ''
      const groomLastName = wedding.groom?.last_name?.toLowerCase() || ''
      const groomFull = wedding.groom?.full_name?.toLowerCase() || ''
      const notes = wedding.notes?.toLowerCase() || ''

      return (
        brideFirstName.includes(searchTerm) ||
        brideLastName.includes(searchTerm) ||
        brideFull.includes(searchTerm) ||
        groomFirstName.includes(searchTerm) ||
        groomLastName.includes(searchTerm) ||
        groomFull.includes(searchTerm) ||
        notes.includes(searchTerm)
      )
    })
  }

  // Apply date range filter
  if (filters?.start_date || filters?.end_date) {
    weddings = weddings.filter(wedding => {
      const weddingDate = wedding.wedding_event?.start_date
      if (!weddingDate) return false

      const date = new Date(weddingDate)
      const startDate = filters.start_date ? new Date(filters.start_date) : null
      const endDate = filters.end_date ? new Date(filters.end_date) : null

      if (startDate && date < startDate) return false
      if (endDate && date > endDate) return false

      return true
    })
  }

  // Apply application-level sorting for related fields (date and name)
  if (filters?.sort === 'date_asc' || filters?.sort === 'date_desc') {
    weddings = weddings.sort((a, b) => {
      const dateA = a.wedding_event?.start_date || ''
      const dateB = b.wedding_event?.start_date || ''

      // Handle nulls - push to end
      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1

      const comparison = new Date(dateA).getTime() - new Date(dateB).getTime()
      return filters.sort === 'date_asc' ? comparison : -comparison
    })
  } else if (filters?.sort === 'name_asc' || filters?.sort === 'name_desc') {
    weddings = weddings.sort((a, b) => {
      // Use bride's full name for primary sort (could also use groom or both)
      const nameA = a.bride?.full_name || a.groom?.full_name || ''
      const nameB = b.bride?.full_name || b.groom?.full_name || ''

      const comparison = nameA.localeCompare(nameB)
      return filters.sort === 'name_asc' ? comparison : -comparison
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
  wedding_event?: EventWithRelations | null
  reception_event?: EventWithRelations | null
  rehearsal_event?: EventWithRelations | null
  rehearsal_dinner_event?: EventWithRelations | null
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
    wedding.wedding_event_id ? supabase.from('events').select('*, location:locations(*)').eq('id', wedding.wedding_event_id).single() : Promise.resolve({ data: null }),
    wedding.reception_event_id ? supabase.from('events').select('*, location:locations(*)').eq('id', wedding.reception_event_id).single() : Promise.resolve({ data: null }),
    wedding.rehearsal_event_id ? supabase.from('events').select('*, location:locations(*)').eq('id', wedding.rehearsal_event_id).single() : Promise.resolve({ data: null }),
    wedding.rehearsal_dinner_event_id ? supabase.from('events').select('*, location:locations(*)').eq('id', wedding.rehearsal_dinner_event_id).single() : Promise.resolve({ data: null }),
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

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'weddings')

  // REQUIRED: Server-side validation (security boundary)
  const validatedData = createWeddingSchema.parse(data)

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

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'weddings')

  // REQUIRED: Server-side validation (security boundary)
  const validatedData = updateWeddingSchema.parse(data)

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    Object.entries(validatedData).filter(([_, value]) => value !== undefined)
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

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'weddings')

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
