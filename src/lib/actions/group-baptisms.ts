'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { getUserParishRole, requireModuleAccess } from '@/lib/auth/permissions'
import { GroupBaptism, Person, Event, Baptism } from '@/lib/types'
import { EventWithRelations } from '@/lib/actions/events'
import { BaptismWithRelations } from '@/lib/actions/baptisms'
import type { ModuleStatus } from '@/lib/constants'
import { LIST_VIEW_PAGE_SIZE } from '@/lib/constants'
import {
  createGroupBaptismSchema,
  updateGroupBaptismSchema,
  type CreateGroupBaptismData,
  type UpdateGroupBaptismData
} from '@/lib/schemas/group-baptisms'
import {
  createBaptismSchema,
  type CreateBaptismData
} from '@/lib/schemas/baptisms'

export interface GroupBaptismFilterParams {
  search?: string
  status?: ModuleStatus | 'all'
  sort?: 'date_asc' | 'date_desc' | 'name_asc' | 'name_desc' | 'created_asc' | 'created_desc'
  offset?: number
  limit?: number
  start_date?: string
  end_date?: string
}

export interface GroupBaptismWithNames extends GroupBaptism {
  presider?: Person | null
  group_baptism_event?: EventWithRelations | null
  baptism_count?: number
  baptisms?: Array<{
    id: string
    person?: Person | null
  }>
}

export interface GroupBaptismWithRelations extends GroupBaptism {
  presider?: Person | null
  group_baptism_event?: EventWithRelations | null
  baptisms: BaptismWithRelations[]
}

export interface GroupBaptismStats {
  total: number
  upcoming: number
  past: number
  filtered: number
}

export async function getGroupBaptismStats(filteredGroupBaptisms: GroupBaptismWithNames[]): Promise<GroupBaptismStats> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Fetch all group baptisms for total stats (no filters)
  const { data: allGroupBaptisms } = await supabase
    .from('group_baptisms')
    .select(`
      *,
      group_baptism_event:events!group_baptism_event_id(*)
    `)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const total = allGroupBaptisms?.length || 0
  const upcoming = allGroupBaptisms?.filter(gb => {
    const eventDate = gb.group_baptism_event?.start_date
    if (!eventDate) return false
    return new Date(eventDate) >= today
  }).length || 0
  const past = allGroupBaptisms?.filter(gb => {
    const eventDate = gb.group_baptism_event?.start_date
    if (!eventDate) return false
    return new Date(eventDate) < today
  }).length || 0
  const filtered = filteredGroupBaptisms.length

  return {
    total,
    upcoming,
    past,
    filtered
  }
}

export async function getGroupBaptisms(filters?: GroupBaptismFilterParams): Promise<GroupBaptismWithNames[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Calculate pagination
  const offset = filters?.offset || 0
  const limit = filters?.limit || LIST_VIEW_PAGE_SIZE

  let query = supabase
    .from('group_baptisms')
    .select(`
      *,
      presider:people!presider_id(*),
      group_baptism_event:events!group_baptism_event_id(*, location:locations(*))
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
    console.error('Error fetching group baptisms:', error)
    throw new Error('Failed to fetch group baptisms')
  }

  let groupBaptisms = data || []

  // Fetch baptism counts and first 5 people for each group baptism
  const groupBaptismsWithCounts = await Promise.all(
    groupBaptisms.map(async (gb) => {
      const { count } = await supabase
        .from('baptisms')
        .select('*', { count: 'exact', head: true })
        .eq('group_baptism_id', gb.id)

      // Fetch first 5 baptisms with child (person) data for avatars
      const { data: baptisms } = await supabase
        .from('baptisms')
        .select('id, person:people!child_id(*)')
        .eq('group_baptism_id', gb.id)
        .limit(5)

      return {
        ...gb,
        baptism_count: count || 0,
        baptisms: baptisms || []
      }
    })
  )

  // Apply search filter in application layer
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
    groupBaptisms = groupBaptismsWithCounts.filter(gb => {
      const name = gb.name?.toLowerCase() || ''
      const notes = gb.note?.toLowerCase() || ''

      return (
        name.includes(searchTerm) ||
        notes.includes(searchTerm)
      )
    })
  } else {
    groupBaptisms = groupBaptismsWithCounts
  }

  // Apply date range filter
  if (filters?.start_date || filters?.end_date) {
    groupBaptisms = groupBaptisms.filter(gb => {
      const eventDate = gb.group_baptism_event?.start_date
      if (!eventDate) return false

      const date = new Date(eventDate)
      const startDate = filters.start_date ? new Date(filters.start_date) : null
      const endDate = filters.end_date ? new Date(filters.end_date) : null

      if (startDate && date < startDate) return false
      if (endDate && date > endDate) return false

      return true
    })
  }

  // Apply application-level sorting for related fields (date and name)
  if (filters?.sort === 'date_asc' || filters?.sort === 'date_desc') {
    groupBaptisms = groupBaptisms.sort((a, b) => {
      const dateA = a.group_baptism_event?.start_date || ''
      const dateB = b.group_baptism_event?.start_date || ''

      // Handle nulls - push to end
      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1

      const comparison = new Date(dateA).getTime() - new Date(dateB).getTime()
      return filters.sort === 'date_asc' ? comparison : -comparison
    })
  } else if (filters?.sort === 'name_asc' || filters?.sort === 'name_desc') {
    groupBaptisms = groupBaptisms.sort((a, b) => {
      const nameA = a.name || ''
      const nameB = b.name || ''

      const comparison = nameA.localeCompare(nameB)
      return filters.sort === 'name_asc' ? comparison : -comparison
    })
  }

  return groupBaptisms
}

export async function getGroupBaptism(id: string): Promise<GroupBaptism | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: groupBaptism, error } = await supabase
    .from('group_baptisms')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching group baptism:', error)
    throw new Error('Failed to fetch group baptism')
  }

  return groupBaptism
}

export async function getGroupBaptismWithRelations(id: string): Promise<GroupBaptismWithRelations | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the group baptism
  const { data: groupBaptism, error } = await supabase
    .from('group_baptisms')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching group baptism:', error)
    throw new Error('Failed to fetch group baptism')
  }

  // Fetch related data in parallel
  const [
    presiderData,
    groupBaptismEventData,
    baptismsData
  ] = await Promise.all([
    groupBaptism.presider_id ? supabase.from('people').select('*').eq('id', groupBaptism.presider_id).single() : Promise.resolve({ data: null }),
    groupBaptism.group_baptism_event_id ? supabase.from('events').select('*, location:locations(*)').eq('id', groupBaptism.group_baptism_event_id).single() : Promise.resolve({ data: null }),
    supabase
      .from('baptisms')
      .select(`
        *,
        child:people!child_id(*),
        mother:people!mother_id(*),
        father:people!father_id(*),
        sponsor_1:people!sponsor_1_id(*),
        sponsor_2:people!sponsor_2_id(*),
        presider:people!presider_id(*),
        baptism_event:events!baptism_event_id(*, location:locations(*))
      `)
      .eq('group_baptism_id', id)
  ])

  return {
    ...groupBaptism,
    presider: presiderData.data,
    group_baptism_event: groupBaptismEventData.data,
    baptisms: baptismsData.data || []
  }
}

export async function createGroupBaptism(data: CreateGroupBaptismData): Promise<GroupBaptism> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'group-baptisms')

  // REQUIRED: Server-side validation (security boundary)
  const validatedData = createGroupBaptismSchema.parse(data)

  const { data: groupBaptism, error } = await supabase
    .from('group_baptisms')
    .insert([
      {
        parish_id: selectedParishId,
        name: validatedData.name,
        group_baptism_event_id: validatedData.group_baptism_event_id || null,
        presider_id: validatedData.presider_id || null,
        status: validatedData.status || 'PLANNING',
        note: validatedData.note || null,
        group_baptism_template_id: validatedData.group_baptism_template_id || null,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating group baptism:', error)
    throw new Error('Failed to create group baptism')
  }

  revalidatePath('/group-baptisms')

  return groupBaptism
}

export async function updateGroupBaptism(id: string, data: UpdateGroupBaptismData): Promise<GroupBaptism> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'group-baptisms')

  // REQUIRED: Server-side validation (security boundary)
  const validatedData = updateGroupBaptismSchema.parse(data)

  const { data: groupBaptism, error } = await supabase
    .from('group_baptisms')
    .update({
      name: validatedData.name,
      group_baptism_event_id: validatedData.group_baptism_event_id,
      presider_id: validatedData.presider_id,
      status: validatedData.status,
      note: validatedData.note,
      group_baptism_template_id: validatedData.group_baptism_template_id,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating group baptism:', error)
    throw new Error('Failed to update group baptism')
  }

  revalidatePath('/group-baptisms')
  revalidatePath(`/group-baptisms/${id}`)
  revalidatePath(`/group-baptisms/${id}/edit`)

  return groupBaptism
}

export async function deleteGroupBaptism(id: string, options?: { deleteLinkedBaptisms?: boolean }): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'group-baptisms')

  // If deleteLinkedBaptisms is true, delete all linked baptisms first
  if (options?.deleteLinkedBaptisms) {
    const { error: baptismsError } = await supabase
      .from('baptisms')
      .delete()
      .eq('group_baptism_id', id)

    if (baptismsError) {
      console.error('Error deleting linked baptisms:', baptismsError)
      throw new Error('Failed to delete linked baptisms')
    }
  }

  // Delete the group baptism (linked baptisms will have group_baptism_id set to NULL if not deleted)
  const { error } = await supabase
    .from('group_baptisms')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting group baptism:', error)
    throw new Error('Failed to delete group baptism')
  }

  revalidatePath('/group-baptisms')
  revalidatePath('/baptisms')
}

/**
 * Add an existing baptism to a group
 * @param groupBaptismId - ID of the group baptism
 * @param baptismId - ID of the baptism to add
 * @returns Updated baptism
 */
export async function addBaptismToGroup(groupBaptismId: string, baptismId: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'group-baptisms')

  // Check that the baptism is not already in a group
  const { data: baptism } = await supabase
    .from('baptisms')
    .select('group_baptism_id')
    .eq('id', baptismId)
    .single()

  if (baptism?.group_baptism_id) {
    throw new Error('This baptism is already part of a group')
  }

  // Update the baptism to link it to the group
  const { error } = await supabase
    .from('baptisms')
    .update({ group_baptism_id: groupBaptismId })
    .eq('id', baptismId)

  if (error) {
    console.error('Error adding baptism to group:', error)
    throw new Error('Failed to add baptism to group')
  }

  revalidatePath(`/group-baptisms/${groupBaptismId}`)
  revalidatePath(`/group-baptisms/${groupBaptismId}/edit`)
  revalidatePath(`/baptisms/${baptismId}`)
}

/**
 * Remove a baptism from a group
 * @param baptismId - ID of the baptism to remove
 */
export async function removeBaptismFromGroup(baptismId: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'group-baptisms')

  // Get the group_baptism_id before removing
  const { data: baptism } = await supabase
    .from('baptisms')
    .select('group_baptism_id')
    .eq('id', baptismId)
    .single()

  const groupBaptismId = baptism?.group_baptism_id

  // Update the baptism to unlink it from the group
  const { error } = await supabase
    .from('baptisms')
    .update({ group_baptism_id: null })
    .eq('id', baptismId)

  if (error) {
    console.error('Error removing baptism from group:', error)
    throw new Error('Failed to remove baptism from group')
  }

  if (groupBaptismId) {
    revalidatePath(`/group-baptisms/${groupBaptismId}`)
    revalidatePath(`/group-baptisms/${groupBaptismId}/edit`)
  }
  revalidatePath(`/baptisms/${baptismId}`)
}

/**
 * Create a new baptism and add it to a group
 * @param groupBaptismId - ID of the group baptism
 * @param data - Baptism data
 * @returns Newly created baptism
 */
export async function createBaptismInGroup(
  groupBaptismId: string,
  data: CreateBaptismData
): Promise<Baptism> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'group-baptisms')

  // Validate the data
  const validatedData = createBaptismSchema.parse(data)

  // Create the baptism with group_baptism_id
  const { data: baptism, error } = await supabase
    .from('baptisms')
    .insert({
      parish_id: selectedParishId,
      group_baptism_id: groupBaptismId,
      ...validatedData
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating baptism in group:', error)
    throw new Error('Failed to create baptism in group')
  }

  revalidatePath(`/group-baptisms/${groupBaptismId}`)
  revalidatePath(`/group-baptisms/${groupBaptismId}/edit`)
  revalidatePath('/baptisms')

  return baptism
}
