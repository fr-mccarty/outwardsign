'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { Mass, Person, MassRolesTemplate, MassRole, Role } from '@/lib/types'
import { EventWithRelations } from '@/lib/actions/events'
import { GlobalLiturgicalEvent } from '@/lib/actions/global-liturgical-events'

export interface CreateMassData {
  event_id?: string
  presider_id?: string
  homilist_id?: string
  liturgical_event_id?: string
  mass_roles_template_id?: string
  pre_mass_announcement_id?: string
  pre_mass_announcement_topic?: string
  status?: string
  mass_template_id?: string
  announcements?: string
  note?: string
  petitions?: string
}

export interface UpdateMassData {
  event_id?: string | null
  presider_id?: string | null
  homilist_id?: string | null
  liturgical_event_id?: string | null
  mass_roles_template_id?: string | null
  pre_mass_announcement_id?: string | null
  pre_mass_announcement_topic?: string | null
  status?: string | null
  mass_template_id?: string | null
  announcements?: string | null
  note?: string | null
  petitions?: string | null
}

export interface MassFilterParams {
  search?: string
  status?: string
}

export interface MassWithNames extends Mass {
  event?: EventWithRelations | null
  presider?: Person | null
  homilist?: Person | null
}

export async function getMasses(filters?: MassFilterParams): Promise<MassWithNames[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  let query = supabase
    .from('masses')
    .select(`
      *,
      event:events!event_id(*,location:locations(*)),
      presider:people!presider_id(*),
      homilist:people!homilist_id(*)
    `)

  // Apply status filter at database level
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching masses:', error)
    throw new Error('Failed to fetch masses')
  }

  let masses = data || []

  // Apply search filter in application layer (searching related table fields)
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
    masses = masses.filter(mass => {
      const presiderFirstName = mass.presider?.first_name?.toLowerCase() || ''
      const presiderLastName = mass.presider?.last_name?.toLowerCase() || ''
      const homilistFirstName = mass.homilist?.first_name?.toLowerCase() || ''
      const homilistLastName = mass.homilist?.last_name?.toLowerCase() || ''

      return (
        presiderFirstName.includes(searchTerm) ||
        presiderLastName.includes(searchTerm) ||
        homilistFirstName.includes(searchTerm) ||
        homilistLastName.includes(searchTerm)
      )
    })
  }

  return masses
}

export async function getMass(id: string): Promise<Mass | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('masses')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching mass:', error)
    throw new Error('Failed to fetch mass')
  }

  return data
}

// Enhanced mass interface with all related data
export interface MassWithRelations extends Mass {
  event?: EventWithRelations | null
  presider?: Person | null
  homilist?: Person | null
  liturgical_event?: GlobalLiturgicalEvent | null
  mass_roles_template?: MassRolesTemplate | null
  pre_mass_announcement_person?: Person | null
  mass_roles?: Array<MassRole & { person?: Person; role?: Role }> | null
}

export async function getMassWithRelations(id: string): Promise<MassWithRelations | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the mass
  const { data: mass, error } = await supabase
    .from('masses')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching mass:', error)
    throw new Error('Failed to fetch mass')
  }

  // Fetch all related data in parallel
  const [
    eventData,
    presiderData,
    homilistData,
    liturgicalEventData,
    massRolesTemplateData,
    preMassAnnouncementData,
    massRolesData
  ] = await Promise.all([
    mass.event_id ? supabase.from('events').select('*, location:locations(*)').eq('id', mass.event_id).single() : Promise.resolve({ data: null }),
    mass.presider_id ? supabase.from('people').select('*').eq('id', mass.presider_id).single() : Promise.resolve({ data: null }),
    mass.homilist_id ? supabase.from('people').select('*').eq('id', mass.homilist_id).single() : Promise.resolve({ data: null }),
    mass.liturgical_event_id ? supabase.from('global_liturgical_events').select('*').eq('id', mass.liturgical_event_id).single() : Promise.resolve({ data: null }),
    mass.mass_roles_template_id ? supabase.from('mass_roles_templates').select('*').eq('id', mass.mass_roles_template_id).single() : Promise.resolve({ data: null }),
    mass.pre_mass_announcement_id ? supabase.from('people').select('*').eq('id', mass.pre_mass_announcement_id).single() : Promise.resolve({ data: null }),
    supabase.from('mass_roles').select('*, person:people(*), role:roles(*)').eq('mass_id', id)
  ])

  return {
    ...mass,
    event: eventData.data,
    presider: presiderData.data,
    homilist: homilistData.data,
    liturgical_event: liturgicalEventData.data,
    mass_roles_template: massRolesTemplateData.data,
    pre_mass_announcement_person: preMassAnnouncementData.data,
    mass_roles: massRolesData.data || []
  }
}

export async function createMass(data: CreateMassData): Promise<Mass> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: mass, error } = await supabase
    .from('masses')
    .insert([
      {
        parish_id: selectedParishId,
        event_id: data.event_id || null,
        presider_id: data.presider_id || null,
        homilist_id: data.homilist_id || null,
        liturgical_event_id: data.liturgical_event_id || null,
        mass_roles_template_id: data.mass_roles_template_id || null,
        pre_mass_announcement_id: data.pre_mass_announcement_id || null,
        pre_mass_announcement_topic: data.pre_mass_announcement_topic || null,
        status: data.status || 'PLANNING',
        mass_template_id: data.mass_template_id || null,
        announcements: data.announcements || null,
        note: data.note || null,
        petitions: data.petitions || null,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating mass:', error)
    throw new Error('Failed to create mass')
  }

  revalidatePath('/masses')
  return mass
}

export async function updateMass(id: string, data: UpdateMassData): Promise<Mass> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )

  const { data: mass, error } = await supabase
    .from('masses')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating mass:', error)
    throw new Error('Failed to update mass')
  }

  revalidatePath('/masses')
  revalidatePath(`/masses/${id}`)
  revalidatePath(`/masses/${id}/edit`)
  return mass
}

export async function deleteMass(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { error } = await supabase
    .from('masses')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting mass:', error)
    throw new Error('Failed to delete mass')
  }

  revalidatePath('/masses')
}
