'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { getUserParishRole, requireModuleAccess } from '@/lib/auth/permissions'
import { Funeral, Person, Event } from '@/lib/types'
import { IndividualReading } from '@/lib/actions/readings'
import { EventWithRelations } from '@/lib/actions/events'
import type { ModuleStatus } from '@/lib/constants'

export interface CreateFuneralData {
  funeral_event_id?: string
  funeral_meal_event_id?: string
  deceased_id?: string
  family_contact_id?: string
  coordinator_id?: string
  presider_id?: string
  homilist_id?: string
  lead_musician_id?: string
  cantor_id?: string
  status?: ModuleStatus
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
  note?: string
  funeral_template_id?: string
}

export interface UpdateFuneralData {
  funeral_event_id?: string | null
  funeral_meal_event_id?: string | null
  deceased_id?: string | null
  family_contact_id?: string | null
  coordinator_id?: string | null
  presider_id?: string | null
  homilist_id?: string | null
  lead_musician_id?: string | null
  cantor_id?: string | null
  status?: ModuleStatus | null
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
  note?: string | null
  funeral_template_id?: string | null
}

export interface FuneralFilterParams {
  search?: string
  status?: ModuleStatus | 'all'
}

export interface FuneralWithNames extends Funeral {
  deceased?: Person | null
  family_contact?: Person | null
  funeral_event?: Event | null
}

export async function getFunerals(filters?: FuneralFilterParams): Promise<FuneralWithNames[]> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  let query = supabase
    .from('funerals')
    .select(`
      *,
      deceased:people!deceased_id(*),
      family_contact:people!family_contact_id(*),
      funeral_event:events!funeral_event_id(*)
    `)

  // Apply status filter at database level
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching funerals:', error)
    throw new Error('Failed to fetch funerals')
  }

  let funerals = data || []

  // Apply search filter in application layer (searching related table fields)
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
    funerals = funerals.filter(funeral => {
      const deceasedFirstName = funeral.deceased?.first_name?.toLowerCase() || ''
      const deceasedLastName = funeral.deceased?.last_name?.toLowerCase() || ''
      const contactFirstName = funeral.family_contact?.first_name?.toLowerCase() || ''
      const contactLastName = funeral.family_contact?.last_name?.toLowerCase() || ''

      return (
        deceasedFirstName.includes(searchTerm) ||
        deceasedLastName.includes(searchTerm) ||
        contactFirstName.includes(searchTerm) ||
        contactLastName.includes(searchTerm)
      )
    })
  }

  return funerals
}

export async function getFuneral(id: string): Promise<Funeral | null> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('funerals')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching funeral:', error)
    throw new Error('Failed to fetch funeral')
  }

  return data
}

// Enhanced funeral interface with all related data
export interface FuneralWithRelations extends Funeral {
  deceased?: Person | null
  family_contact?: Person | null
  coordinator?: Person | null
  presider?: Person | null
  homilist?: Person | null
  lead_musician?: Person | null
  cantor?: Person | null
  funeral_event?: EventWithRelations | null
  funeral_meal_event?: EventWithRelations | null
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

export async function getFuneralWithRelations(id: string): Promise<FuneralWithRelations | null> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the funeral
  const { data: funeral, error } = await supabase
    .from('funerals')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching funeral:', error)
    throw new Error('Failed to fetch funeral')
  }

  // Fetch all related data in parallel
  const [
    deceasedData,
    familyContactData,
    coordinatorData,
    presiderData,
    homilistData,
    leadMusicianData,
    cantorData,
    funeralEventData,
    funeralMealEventData,
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
    funeral.deceased_id ? supabase.from('people').select('*').eq('id', funeral.deceased_id).single() : Promise.resolve({ data: null }),
    funeral.family_contact_id ? supabase.from('people').select('*').eq('id', funeral.family_contact_id).single() : Promise.resolve({ data: null }),
    funeral.coordinator_id ? supabase.from('people').select('*').eq('id', funeral.coordinator_id).single() : Promise.resolve({ data: null }),
    funeral.presider_id ? supabase.from('people').select('*').eq('id', funeral.presider_id).single() : Promise.resolve({ data: null }),
    funeral.homilist_id ? supabase.from('people').select('*').eq('id', funeral.homilist_id).single() : Promise.resolve({ data: null }),
    funeral.lead_musician_id ? supabase.from('people').select('*').eq('id', funeral.lead_musician_id).single() : Promise.resolve({ data: null }),
    funeral.cantor_id ? supabase.from('people').select('*').eq('id', funeral.cantor_id).single() : Promise.resolve({ data: null }),
    funeral.funeral_event_id ? supabase.from('events').select('*, location:locations(*)').eq('id', funeral.funeral_event_id).single() : Promise.resolve({ data: null }),
    funeral.funeral_meal_event_id ? supabase.from('events').select('*, location:locations(*)').eq('id', funeral.funeral_meal_event_id).single() : Promise.resolve({ data: null }),
    funeral.first_reading_id ? supabase.from('readings').select('*').eq('id', funeral.first_reading_id).single() : Promise.resolve({ data: null }),
    funeral.psalm_id ? supabase.from('readings').select('*').eq('id', funeral.psalm_id).single() : Promise.resolve({ data: null }),
    funeral.second_reading_id ? supabase.from('readings').select('*').eq('id', funeral.second_reading_id).single() : Promise.resolve({ data: null }),
    funeral.gospel_reading_id ? supabase.from('readings').select('*').eq('id', funeral.gospel_reading_id).single() : Promise.resolve({ data: null }),
    funeral.first_reader_id ? supabase.from('people').select('*').eq('id', funeral.first_reader_id).single() : Promise.resolve({ data: null }),
    funeral.second_reader_id ? supabase.from('people').select('*').eq('id', funeral.second_reader_id).single() : Promise.resolve({ data: null }),
    funeral.psalm_reader_id ? supabase.from('people').select('*').eq('id', funeral.psalm_reader_id).single() : Promise.resolve({ data: null }),
    funeral.gospel_reader_id ? supabase.from('people').select('*').eq('id', funeral.gospel_reader_id).single() : Promise.resolve({ data: null }),
    funeral.petition_reader_id ? supabase.from('people').select('*').eq('id', funeral.petition_reader_id).single() : Promise.resolve({ data: null })
  ])

  return {
    ...funeral,
    deceased: deceasedData.data,
    family_contact: familyContactData.data,
    coordinator: coordinatorData.data,
    presider: presiderData.data,
    homilist: homilistData.data,
    lead_musician: leadMusicianData.data,
    cantor: cantorData.data,
    funeral_event: funeralEventData.data,
    funeral_meal_event: funeralMealEventData.data,
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

export async function createFuneral(data: CreateFuneralData): Promise<Funeral> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'funerals')

  const { data: funeral, error } = await supabase
    .from('funerals')
    .insert([
      {
        parish_id: selectedParishId,
        funeral_event_id: data.funeral_event_id || null,
        funeral_meal_event_id: data.funeral_meal_event_id || null,
        deceased_id: data.deceased_id || null,
        family_contact_id: data.family_contact_id || null,
        coordinator_id: data.coordinator_id || null,
        presider_id: data.presider_id || null,
        homilist_id: data.homilist_id || null,
        lead_musician_id: data.lead_musician_id || null,
        cantor_id: data.cantor_id || null,
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
        note: data.note || null,
        funeral_template_id: data.funeral_template_id || null,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating funeral:', error)
    throw new Error('Failed to create funeral')
  }

  revalidatePath('/funerals')
  return funeral
}

export async function updateFuneral(id: string, data: UpdateFuneralData): Promise<Funeral> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'funerals')

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )

  const { data: funeral, error } = await supabase
    .from('funerals')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating funeral:', error)
    throw new Error('Failed to update funeral')
  }

  revalidatePath('/funerals')
  revalidatePath(`/funerals/${id}`)
  revalidatePath(`/funerals/${id}/edit`)
  return funeral
}

export async function deleteFuneral(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'funerals')

  const { error } = await supabase
    .from('funerals')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting funeral:', error)
    throw new Error('Failed to delete funeral')
  }

  revalidatePath('/funerals')
}
