'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { getUserParishRole, requireModuleAccess } from '@/lib/auth/permissions'
import { Mass, Person, MassRolesTemplate, MassRole, MassRoleInstance, MassIntention } from '@/lib/types'
import { EventWithRelations } from '@/lib/actions/events'
import { GlobalLiturgicalEvent } from '@/lib/actions/global-liturgical-events'
import type { PaginatedParams, PaginatedResult } from './people'
import type { MassStatus } from '@/lib/constants'
import { createMassSchema, updateMassSchema, type CreateMassData, type UpdateMassData } from '@/lib/schemas/masses'

export type { CreateMassData, UpdateMassData }

export interface MassFilterParams {
  search?: string
  status?: MassStatus | 'all'
  start_date?: string
  end_date?: string
  sort?: 'date_asc' | 'date_desc' | 'created_asc' | 'created_desc'
  page?: number
  limit?: number
}

export interface MassStats {
  total: number
  upcoming: number
  past: number
  filtered: number
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

  const page = filters?.page || 1
  const limit = filters?.limit || 50
  const offset = (page - 1) * limit

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

  // Apply sorting at database level for created_at, otherwise will sort in memory
  const sort = filters?.sort || 'date_desc'
  if (sort === 'created_asc') {
    query = query.order('created_at', { ascending: true })
  } else if (sort === 'created_desc') {
    query = query.order('created_at', { ascending: false })
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching masses:', error)
    throw new Error('Failed to fetch masses')
  }

  let masses = data || []

  // Apply date range filters in application layer (filtering on related table)
  if (filters?.start_date || filters?.end_date) {
    masses = masses.filter(mass => {
      if (!mass.event?.start_date) return false

      const massDate = new Date(mass.event.start_date)

      if (filters.start_date) {
        const startDate = new Date(filters.start_date)
        if (massDate < startDate) return false
      }

      if (filters.end_date) {
        const endDate = new Date(filters.end_date)
        if (massDate > endDate) return false
      }

      return true
    })
  }

  // Apply search filter in application layer (searching related table fields)
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
    masses = masses.filter(mass => {
      const presiderFirstName = mass.presider?.first_name?.toLowerCase() || ''
      const presiderLastName = mass.presider?.last_name?.toLowerCase() || ''
      const homilistFirstName = mass.homilist?.first_name?.toLowerCase() || ''
      const homilistLastName = mass.homilist?.last_name?.toLowerCase() || ''
      const eventName = mass.event?.name?.toLowerCase() || ''

      return (
        presiderFirstName.includes(searchTerm) ||
        presiderLastName.includes(searchTerm) ||
        homilistFirstName.includes(searchTerm) ||
        homilistLastName.includes(searchTerm) ||
        eventName.includes(searchTerm)
      )
    })
  }

  // Apply date-based sorting in application layer (since we can't sort by nested relations in Supabase)
  if (sort === 'date_asc' || sort === 'date_desc') {
    masses.sort((a, b) => {
      const dateA = a.event?.start_date ? new Date(a.event.start_date).getTime() : 0
      const dateB = b.event?.start_date ? new Date(b.event.start_date).getTime() : 0

      // Nulls last for both ascending and descending
      if (!a.event?.start_date && !b.event?.start_date) return 0
      if (!a.event?.start_date) return 1
      if (!b.event?.start_date) return 1

      return sort === 'date_asc' ? dateA - dateB : dateB - dateA
    })
  }

  return masses
}

export async function getMassStats(filters?: MassFilterParams): Promise<MassStats> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get all masses for stats calculation (no pagination)
  const query = supabase
    .from('masses')
    .select(`
      *,
      event:events!event_id(*,location:locations(*)),
      presider:people!presider_id(*),
      homilist:people!homilist_id(*)
    `)

  const { data, error } = await query

  if (error) {
    console.error('Error fetching masses for stats:', error)
    throw new Error('Failed to fetch masses for stats')
  }

  const allMasses = data || []

  // Calculate total count
  const total = allMasses.length

  // Calculate upcoming and past based on event dates
  const now = new Date()
  const upcoming = allMasses.filter(mass => {
    if (!mass.event?.start_date) return false
    return new Date(mass.event.start_date) >= now
  }).length

  const past = allMasses.filter(mass => {
    if (!mass.event?.start_date) return false
    return new Date(mass.event.start_date) < now
  }).length

  // Get filtered masses using the same getMasses function
  const filteredMasses = await getMasses(filters)
  const filtered = filteredMasses.length

  return {
    total,
    upcoming,
    past,
    filtered
  }
}

export async function getMassesPaginated(params?: PaginatedParams): Promise<PaginatedResult<MassWithNames>> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const page = params?.page || 1
  const limit = params?.limit || 10
  const search = params?.search || ''

  // Calculate offset
  const offset = (page - 1) * limit

  // Build base query with relations
  let query = supabase
    .from('masses')
    .select(`
      *,
      event:events!event_id(*,location:locations(*)),
      presider:people!presider_id(*),
      homilist:people!homilist_id(*)
    `, { count: 'exact' })

  // Apply ordering, pagination
  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching paginated masses:', error)
    throw new Error('Failed to fetch paginated masses')
  }

  let masses = data || []

  // Apply search filter in application layer (searching related table fields)
  if (search) {
    const searchTerm = search.toLowerCase()
    masses = masses.filter(mass => {
      const presiderFirstName = mass.presider?.first_name?.toLowerCase() || ''
      const presiderLastName = mass.presider?.last_name?.toLowerCase() || ''
      const homilistFirstName = mass.homilist?.first_name?.toLowerCase() || ''
      const homilistLastName = mass.homilist?.last_name?.toLowerCase() || ''
      const eventName = mass.event?.name?.toLowerCase() || ''

      return (
        presiderFirstName.includes(searchTerm) ||
        presiderLastName.includes(searchTerm) ||
        homilistFirstName.includes(searchTerm) ||
        homilistLastName.includes(searchTerm) ||
        eventName.includes(searchTerm)
      )
    })
  }

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / limit)

  return {
    items: masses,
    totalCount,
    page,
    limit,
    totalPages,
  }
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
  mass_intention?: (MassIntention & {
    requested_by?: Person | null
  }) | null
  mass_roles?: Array<MassRoleInstance & {
    person?: Person
    mass_roles_template_item?: {
      id: string
      mass_role: MassRole
    }
  }> | null
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
    massIntentionData,
    massRolesData
  ] = await Promise.all([
    mass.event_id ? supabase.from('events').select('*, location:locations(*)').eq('id', mass.event_id).single() : Promise.resolve({ data: null }),
    mass.presider_id ? supabase.from('people').select('*').eq('id', mass.presider_id).single() : Promise.resolve({ data: null }),
    mass.homilist_id ? supabase.from('people').select('*').eq('id', mass.homilist_id).single() : Promise.resolve({ data: null }),
    mass.liturgical_event_id ? supabase.from('global_liturgical_events').select('*').eq('id', mass.liturgical_event_id).single() : Promise.resolve({ data: null }),
    mass.mass_roles_template_id ? supabase.from('mass_roles_templates').select('*').eq('id', mass.mass_roles_template_id).single() : Promise.resolve({ data: null }),
    supabase.from('mass_intentions').select('*, requested_by:people!requested_by_id(*)').eq('mass_id', id).maybeSingle(),
    supabase.from('mass_assignment').select('*, person:people(*), mass_roles_template_item:mass_roles_template_items(*, mass_role:mass_roles(*))').eq('mass_id', id)
  ])

  return {
    ...mass,
    event: eventData.data,
    presider: presiderData.data,
    homilist: homilistData.data,
    liturgical_event: liturgicalEventData.data,
    mass_roles_template: massRolesTemplateData.data,
    mass_intention: massIntentionData.data,
    mass_roles: massRolesData.data || []
  }
}

export async function createMass(data: CreateMassData): Promise<Mass> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'masses')

  // Validate data with Zod schema
  const validatedData = createMassSchema.parse(data)

  const { data: mass, error } = await supabase
    .from('masses')
    .insert([
      {
        parish_id: selectedParishId,
        event_id: validatedData.event_id || null,
        presider_id: validatedData.presider_id || null,
        homilist_id: validatedData.homilist_id || null,
        liturgical_event_id: validatedData.liturgical_event_id || null,
        mass_roles_template_id: validatedData.mass_roles_template_id || null,
        status: validatedData.status || 'PLANNING',
        mass_template_id: validatedData.mass_template_id || null,
        announcements: validatedData.announcements || null,
        note: validatedData.note || null,
        petitions: validatedData.petitions || null,
        liturgical_color: validatedData.liturgical_color || null,
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

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'masses')

  // Validate data with Zod schema
  const validatedData = updateMassSchema.parse(data)

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    Object.entries(validatedData).filter(([, value]) => value !== undefined)
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

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'masses')

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

// ============================================================================
// MASS ROLE ASSIGNMENTS
// ============================================================================

export interface CreateMassRoleData {
  mass_id: string
  person_id: string
  mass_roles_template_item_id: string
}

export interface UpdateMassRoleData {
  person_id?: string
  mass_roles_template_item_id?: string
}

export interface MassRoleInstanceWithRelations extends MassRoleInstance {
  person?: Person
  mass_roles_template_item?: {
    id: string
    mass_role: MassRole
  }
}

export async function getMassRoles(massId: string): Promise<MassRoleInstanceWithRelations[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_assignment')
    .select(`
      *,
      person:people(*),
      mass_roles_template_item:mass_roles_template_items(
        *,
        mass_role:mass_roles(*)
      )
    `)
    .eq('mass_id', massId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching mass roles:', error)
    throw new Error('Failed to fetch mass roles')
  }

  return data || []
}

export async function createMassRole(data: CreateMassRoleData): Promise<MassRoleInstance> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'masses')

  const { data: massRoleInstance, error } = await supabase
    .from('mass_assignment')
    .insert([
      {
        mass_id: data.mass_id,
        person_id: data.person_id,
        mass_roles_template_item_id: data.mass_roles_template_item_id,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating mass role instance:', error)
    throw new Error('Failed to create mass role instance')
  }

  revalidatePath('/masses')
  revalidatePath(`/masses/${data.mass_id}`)
  revalidatePath(`/masses/${data.mass_id}/edit`)
  return massRoleInstance
}

export async function updateMassRole(id: string, data: UpdateMassRoleData): Promise<MassRoleInstance> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'masses')

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )

  const { data: massRoleInstance, error } = await supabase
    .from('mass_assignment')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating mass role instance:', error)
    throw new Error('Failed to update mass role instance')
  }

  // Get the mass_id for revalidation
  const { data: instanceData } = await supabase
    .from('mass_assignment')
    .select('mass_id')
    .eq('id', id)
    .single()

  if (instanceData) {
    revalidatePath('/masses')
    revalidatePath(`/masses/${instanceData.mass_id}`)
    revalidatePath(`/masses/${instanceData.mass_id}/edit`)
  }

  return massRoleInstance
}

export async function deleteMassRole(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'masses')

  // Get the mass_id before deleting for revalidation
  const { data: instanceData } = await supabase
    .from('mass_assignment')
    .select('mass_id')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('mass_assignment')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting mass role instance:', error)
    throw new Error('Failed to delete mass role instance')
  }

  if (instanceData) {
    revalidatePath('/masses')
    revalidatePath(`/masses/${instanceData.mass_id}`)
    revalidatePath(`/masses/${instanceData.mass_id}/edit`)
  }
}

export async function bulkCreateMassRoles(massId: string, assignments: CreateMassRoleData[]): Promise<MassRoleInstance[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'masses')

  const instancesToInsert = assignments.map(assignment => ({
    mass_id: massId,
    person_id: assignment.person_id,
    mass_roles_template_item_id: assignment.mass_roles_template_item_id,
  }))

  const { data: massRoleInstances, error } = await supabase
    .from('mass_assignment')
    .insert(instancesToInsert)
    .select()

  if (error) {
    console.error('Error creating mass role instances in bulk:', error)
    throw new Error('Failed to create mass role instances in bulk')
  }

  revalidatePath('/masses')
  revalidatePath(`/masses/${massId}`)
  revalidatePath(`/masses/${massId}/edit`)
  return massRoleInstances || []
}

export interface ApplyTemplateData {
  mass_id: string
  template_id: string
  overwrite_existing: boolean
}

/**
 * Apply a mass roles template to a mass
 * This clears existing assignments (if requested) and returns the template configuration
 * Template parameters structure:
 * {
 *   roles: [
 *     { role_id: 'uuid', count: 1, required: true },
 *     { role_id: 'uuid', count: 4, required: false },
 *     ...
 *   ]
 * }
 *
 * NOTE: Template application only clears existing roles if overwrite_existing is true.
 * The UI should display the template requirements and allow users to assign people manually.
 * We don't create placeholder records because person_id is NOT NULL in the schema.
 */
export async function applyMassTemplate(data: ApplyTemplateData): Promise<MassRoleInstanceWithRelations[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // 1. Fetch template with mass role requirements
  const { data: template, error: templateError } = await supabase
    .from('mass_roles_templates')
    .select('*')
    .eq('id', data.template_id)
    .single()

  if (templateError) {
    console.error('Error fetching mass roles template:', templateError)
    throw new Error('Failed to fetch mass roles template')
  }

  // 2. If overwrite_existing, delete current assignments
  if (data.overwrite_existing) {
    const { error: deleteError } = await supabase
      .from('mass_roles')
      .delete()
      .eq('mass_id', data.mass_id)

    if (deleteError) {
      console.error('Error deleting existing mass roles:', deleteError)
      throw new Error('Failed to delete existing mass roles')
    }
  }

  // 3. Update the mass to reference this template
  await supabase
    .from('masses')
    .update({ mass_roles_template_id: data.template_id })
    .eq('id', data.mass_id)

  revalidatePath('/masses')
  revalidatePath(`/masses/${data.mass_id}`)
  revalidatePath(`/masses/${data.mass_id}/edit`)

  // Return empty array - the UI will use the template parameters to show which roles need to be filled
  return []
}

// Link a mass intention to a mass
export async function linkMassIntention(massId: string, massIntentionId: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Update the mass intention to link it to this mass
  const { error } = await supabase
    .from('mass_intentions')
    .update({ mass_id: massId })
    .eq('id', massIntentionId)

  if (error) {
    console.error('Error linking mass intention:', error)
    throw new Error('Failed to link mass intention')
  }

  revalidatePath('/masses')
  revalidatePath(`/masses/${massId}`)
  revalidatePath(`/masses/${massId}/edit`)
  revalidatePath('/mass-intentions')
  revalidatePath(`/mass-intentions/${massIntentionId}`)
}

// Unlink a mass intention from a mass
export async function unlinkMassIntention(massIntentionId: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the mass_id before unlinking for revalidation
  const { data: intentionData } = await supabase
    .from('mass_intentions')
    .select('mass_id')
    .eq('id', massIntentionId)
    .single()

  // Update the mass intention to unlink it
  const { error } = await supabase
    .from('mass_intentions')
    .update({ mass_id: null })
    .eq('id', massIntentionId)

  if (error) {
    console.error('Error unlinking mass intention:', error)
    throw new Error('Failed to unlink mass intention')
  }

  if (intentionData?.mass_id) {
    revalidatePath('/masses')
    revalidatePath(`/masses/${intentionData.mass_id}`)
    revalidatePath(`/masses/${intentionData.mass_id}/edit`)
  }
  revalidatePath('/mass-intentions')
  revalidatePath(`/mass-intentions/${massIntentionId}`)
}
