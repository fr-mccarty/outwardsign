'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { getUserParishRole, requireModuleAccess } from '@/lib/auth/permissions'
import { Quinceanera, Person, Event } from '@/lib/types'
import { IndividualReading } from '@/lib/actions/readings'
import { EventWithRelations } from '@/lib/actions/events'
import {
  createQuinceaneraSchema,
  updateQuinceaneraSchema,
  type CreateQuinceaneraData,
  type UpdateQuinceaneraData
} from '@/lib/schemas/quinceaneras'
import type { ModuleStatus } from '@/lib/constants'

export interface QuinceaneraFilterParams {
  search?: string
  status?: ModuleStatus | 'all'
  sort?: 'date_asc' | 'date_desc' | 'name_asc' | 'name_desc' | 'created_asc' | 'created_desc'
  page?: number
  limit?: number
  start_date?: string
  end_date?: string
}

export interface QuinceaneraWithNames extends Quinceanera {
  quinceanera?: Person | null
  family_contact?: Person | null
  presider?: Person | null
  quinceanera_event?: EventWithRelations | null
}

export interface QuinceaneraStats {
  total: number
  upcoming: number
  past: number
  filtered: number
}

export async function getQuinceaneraStats(quinceaneras: QuinceaneraWithNames[]): Promise<QuinceaneraStats> {
  const now = new Date()
  const todayString = now.toISOString().split('T')[0]

  return {
    total: quinceaneras.length,
    upcoming: quinceaneras.filter(q => q.quinceanera_event?.start_date && q.quinceanera_event.start_date >= todayString).length,
    past: quinceaneras.filter(q => q.quinceanera_event?.start_date && q.quinceanera_event.start_date < todayString).length,
    filtered: quinceaneras.length
  }
}

export async function getQuinceaneras(filters?: QuinceaneraFilterParams): Promise<QuinceaneraWithNames[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  let query = supabase
    .from('quinceaneras')
    .select(`
      *,
      quinceanera:people!quinceanera_id(*),
      family_contact:people!family_contact_id(*),
      presider:people!presider_id(*),
      quinceanera_event:events!quinceanera_event_id(*, location:locations(*))
    `)

  // Apply status filter at database level
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  // Handle sorting
  if (filters?.sort) {
    const sortParts = filters.sort.split('_')
    const direction = sortParts[sortParts.length - 1]
    const ascending = direction === 'asc'

    if (filters.sort.startsWith('created_')) {
      // Database-level sorting by created_at
      query = query.order('created_at', { ascending })
    }
  } else {
    // Default sort: most recent first
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching quinceaneras:', error)
    throw new Error('Failed to fetch quinceaneras')
  }

  let quinceaneras = data || []

  // Apply search filter in application layer (searching related table fields)
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
    quinceaneras = quinceaneras.filter(quinceanera => {
      const quinceaneraFullName = quinceanera.quinceanera?.full_name?.toLowerCase() || ''
      const contactFullName = quinceanera.family_contact?.full_name?.toLowerCase() || ''
      const notes = quinceanera.note?.toLowerCase() || ''

      return (
        quinceaneraFullName.includes(searchTerm) ||
        contactFullName.includes(searchTerm) ||
        notes.includes(searchTerm)
      )
    })
  }

  // Apply date range filters
  if (filters?.start_date) {
    quinceaneras = quinceaneras.filter(quinceanera =>
      quinceanera.quinceanera_event?.start_date && quinceanera.quinceanera_event.start_date >= filters.start_date!
    )
  }
  if (filters?.end_date) {
    quinceaneras = quinceaneras.filter(quinceanera =>
      quinceanera.quinceanera_event?.start_date && quinceanera.quinceanera_event.start_date <= filters.end_date!
    )
  }

  // Apply application-level sorting for related fields (name and date)
  if (filters?.sort) {
    const sortParts = filters.sort.split('_')
    const direction = sortParts[sortParts.length - 1]
    const ascending = direction === 'asc'

    if (filters.sort.startsWith('name_')) {
      // Application-level sorting by quinceanera's name
      quinceaneras.sort((a, b) => {
        const nameA = a.quinceanera?.full_name || ''
        const nameB = b.quinceanera?.full_name || ''
        return ascending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      })
    } else if (filters.sort.startsWith('date_')) {
      // Application-level sorting by event date
      quinceaneras.sort((a, b) => {
        const dateA = a.quinceanera_event?.start_date || ''
        const dateB = b.quinceanera_event?.start_date || ''
        if (!dateA && !dateB) return 0
        if (!dateA) return 1
        if (!dateB) return -1
        return ascending ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA)
      })
    }
  }

  return quinceaneras
}

export async function getQuinceanera(id: string): Promise<Quinceanera | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('quinceaneras')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching quinceanera:', error)
    throw new Error('Failed to fetch quinceanera')
  }

  return data
}

// Enhanced quinceanera interface with all related data
export interface QuinceaneraWithRelations extends Quinceanera {
  quinceanera?: Person | null
  family_contact?: Person | null
  coordinator?: Person | null
  presider?: Person | null
  homilist?: Person | null
  lead_musician?: Person | null
  cantor?: Person | null
  quinceanera_event?: EventWithRelations | null
  quinceanera_reception?: EventWithRelations | null
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

export async function getQuinceaneraWithRelations(id: string): Promise<QuinceaneraWithRelations | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the quinceanera
  const { data: quinceanera, error } = await supabase
    .from('quinceaneras')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching quinceanera:', error)
    throw new Error('Failed to fetch quinceanera')
  }

  // Fetch all related data in parallel
  const [
    quinceaneraData,
    familyContactData,
    coordinatorData,
    presiderData,
    homilistData,
    leadMusicianData,
    cantorData,
    quinceaneraEventData,
    quinceaneraReceptionData,
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
    quinceanera.quinceanera_id ? supabase.from('people').select('*').eq('id', quinceanera.quinceanera_id).single() : Promise.resolve({ data: null }),
    quinceanera.family_contact_id ? supabase.from('people').select('*').eq('id', quinceanera.family_contact_id).single() : Promise.resolve({ data: null }),
    quinceanera.coordinator_id ? supabase.from('people').select('*').eq('id', quinceanera.coordinator_id).single() : Promise.resolve({ data: null }),
    quinceanera.presider_id ? supabase.from('people').select('*').eq('id', quinceanera.presider_id).single() : Promise.resolve({ data: null }),
    quinceanera.homilist_id ? supabase.from('people').select('*').eq('id', quinceanera.homilist_id).single() : Promise.resolve({ data: null }),
    quinceanera.lead_musician_id ? supabase.from('people').select('*').eq('id', quinceanera.lead_musician_id).single() : Promise.resolve({ data: null }),
    quinceanera.cantor_id ? supabase.from('people').select('*').eq('id', quinceanera.cantor_id).single() : Promise.resolve({ data: null }),
    quinceanera.quinceanera_event_id ? supabase.from('events').select('*, location:locations(*)').eq('id', quinceanera.quinceanera_event_id).single() : Promise.resolve({ data: null }),
    quinceanera.quinceanera_reception_id ? supabase.from('events').select('*, location:locations(*)').eq('id', quinceanera.quinceanera_reception_id).single() : Promise.resolve({ data: null }),
    quinceanera.first_reading_id ? supabase.from('readings').select('*').eq('id', quinceanera.first_reading_id).single() : Promise.resolve({ data: null }),
    quinceanera.psalm_id ? supabase.from('readings').select('*').eq('id', quinceanera.psalm_id).single() : Promise.resolve({ data: null }),
    quinceanera.second_reading_id ? supabase.from('readings').select('*').eq('id', quinceanera.second_reading_id).single() : Promise.resolve({ data: null }),
    quinceanera.gospel_reading_id ? supabase.from('readings').select('*').eq('id', quinceanera.gospel_reading_id).single() : Promise.resolve({ data: null }),
    quinceanera.first_reader_id ? supabase.from('people').select('*').eq('id', quinceanera.first_reader_id).single() : Promise.resolve({ data: null }),
    quinceanera.second_reader_id ? supabase.from('people').select('*').eq('id', quinceanera.second_reader_id).single() : Promise.resolve({ data: null }),
    quinceanera.psalm_reader_id ? supabase.from('people').select('*').eq('id', quinceanera.psalm_reader_id).single() : Promise.resolve({ data: null }),
    quinceanera.gospel_reader_id ? supabase.from('people').select('*').eq('id', quinceanera.gospel_reader_id).single() : Promise.resolve({ data: null }),
    quinceanera.petition_reader_id ? supabase.from('people').select('*').eq('id', quinceanera.petition_reader_id).single() : Promise.resolve({ data: null })
  ])

  return {
    ...quinceanera,
    quinceanera: quinceaneraData.data,
    family_contact: familyContactData.data,
    coordinator: coordinatorData.data,
    presider: presiderData.data,
    homilist: homilistData.data,
    lead_musician: leadMusicianData.data,
    cantor: cantorData.data,
    quinceanera_event: quinceaneraEventData.data,
    quinceanera_reception: quinceaneraReceptionData.data,
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

export async function createQuinceanera(data: CreateQuinceaneraData): Promise<Quinceanera> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'quinceaneras')

  // Validate data with schema
  createQuinceaneraSchema.parse(data)

  const { data: quinceanera, error } = await supabase
    .from('quinceaneras')
    .insert([
      {
        parish_id: selectedParishId,
        quinceanera_event_id: data.quinceanera_event_id || null,
        quinceanera_reception_id: data.quinceanera_reception_id || null,
        quinceanera_id: data.quinceanera_id || null,
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
        quinceanera_template_id: data.quinceanera_template_id || null,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating quinceanera:', error)
    throw new Error('Failed to create quinceanera')
  }

  revalidatePath('/quinceaneras')
  return quinceanera
}

export async function updateQuinceanera(id: string, data: UpdateQuinceaneraData): Promise<Quinceanera> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'quinceaneras')

  // Validate data with schema
  updateQuinceaneraSchema.parse(data)

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )

  const { data: quinceanera, error } = await supabase
    .from('quinceaneras')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating quinceanera:', error)
    throw new Error('Failed to update quinceanera')
  }

  revalidatePath('/quinceaneras')
  revalidatePath(`/quinceaneras/${id}`)
  revalidatePath(`/quinceaneras/${id}/edit`)
  return quinceanera
}

export async function deleteQuinceanera(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'quinceaneras')

  const { error } = await supabase
    .from('quinceaneras')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting quinceanera:', error)
    throw new Error('Failed to delete quinceanera')
  }

  revalidatePath('/quinceaneras')
}
