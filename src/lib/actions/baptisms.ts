'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { getUserParishRole, requireModuleAccess } from '@/lib/auth/permissions'
import { Baptism, Person, Event } from '@/lib/types'
import { EventWithRelations } from '@/lib/actions/events'
import type { ModuleStatus } from '@/lib/constants'
import {
  createBaptismSchema,
  updateBaptismSchema,
  type CreateBaptismData,
  type UpdateBaptismData
} from '@/lib/schemas/baptisms'

export interface BaptismFilterParams {
  search?: string
  status?: ModuleStatus | 'all'
  sort?: 'date_asc' | 'date_desc' | 'name_asc' | 'name_desc' | 'created_asc' | 'created_desc'
  page?: number
  limit?: number
  start_date?: string
  end_date?: string
}

export interface BaptismWithNames extends Baptism {
  child?: Person | null
  mother?: Person | null
  father?: Person | null
  sponsor_1?: Person | null
  sponsor_2?: Person | null
  presider?: Person | null
  baptism_event?: EventWithRelations | null
}

export interface BaptismStats {
  total: number
  upcoming: number
  past: number
  filtered: number
}

export async function getBaptismStats(baptisms: BaptismWithNames[]): Promise<BaptismStats> {
  const now = new Date()
  const todayString = now.toISOString().split('T')[0]

  return {
    total: baptisms.length,
    upcoming: baptisms.filter(b => b.baptism_event?.start_date && b.baptism_event.start_date >= todayString).length,
    past: baptisms.filter(b => b.baptism_event?.start_date && b.baptism_event.start_date < todayString).length,
    filtered: baptisms.length
  }
}

export async function getBaptisms(filters?: BaptismFilterParams): Promise<BaptismWithNames[]> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  let query = supabase
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
    console.error('Error fetching baptisms:', error)
    throw new Error('Failed to fetch baptisms')
  }

  let baptisms = data || []

  // Apply search filter in application layer (searching related table fields)
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
    baptisms = baptisms.filter(baptism => {
      const childFullName = baptism.child?.full_name?.toLowerCase() || ''
      const motherFullName = baptism.mother?.full_name?.toLowerCase() || ''
      const fatherFullName = baptism.father?.full_name?.toLowerCase() || ''
      const sponsor1FullName = baptism.sponsor_1?.full_name?.toLowerCase() || ''
      const sponsor2FullName = baptism.sponsor_2?.full_name?.toLowerCase() || ''
      const notes = baptism.note?.toLowerCase() || ''

      return (
        childFullName.includes(searchTerm) ||
        motherFullName.includes(searchTerm) ||
        fatherFullName.includes(searchTerm) ||
        sponsor1FullName.includes(searchTerm) ||
        sponsor2FullName.includes(searchTerm) ||
        notes.includes(searchTerm)
      )
    })
  }

  // Apply date range filters
  if (filters?.start_date) {
    baptisms = baptisms.filter(baptism =>
      baptism.baptism_event?.start_date && baptism.baptism_event.start_date >= filters.start_date!
    )
  }
  if (filters?.end_date) {
    baptisms = baptisms.filter(baptism =>
      baptism.baptism_event?.start_date && baptism.baptism_event.start_date <= filters.end_date!
    )
  }

  // Apply application-level sorting for related fields (name and date)
  if (filters?.sort) {
    const sortParts = filters.sort.split('_')
    const direction = sortParts[sortParts.length - 1]
    const ascending = direction === 'asc'

    if (filters.sort.startsWith('name_')) {
      // Application-level sorting by child's name
      baptisms.sort((a, b) => {
        const nameA = a.child?.full_name || ''
        const nameB = b.child?.full_name || ''
        return ascending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      })
    } else if (filters.sort.startsWith('date_')) {
      // Application-level sorting by event date
      baptisms.sort((a, b) => {
        const dateA = a.baptism_event?.start_date || ''
        const dateB = b.baptism_event?.start_date || ''
        if (!dateA && !dateB) return 0
        if (!dateA) return 1
        if (!dateB) return -1
        return ascending ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA)
      })
    }
  }

  return baptisms
}

export async function getBaptism(id: string): Promise<Baptism | null> {
  await requireSelectedParish()
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
  await requireSelectedParish()
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

  // If part of a group, fetch group baptism to get event and presider
  let groupBaptismEventId: string | null = null
  let groupBaptismPresiderId: string | null = null

  if (baptism.group_baptism_id) {
    const { data: groupBaptism } = await supabase
      .from('group_baptisms')
      .select('group_baptism_event_id, presider_id')
      .eq('id', baptism.group_baptism_id)
      .single()

    if (groupBaptism) {
      groupBaptismEventId = groupBaptism.group_baptism_event_id
      groupBaptismPresiderId = groupBaptism.presider_id
    }
  }

  // Use group baptism's event and presider if individual baptism doesn't have them
  const effectiveEventId = baptism.baptism_event_id || groupBaptismEventId
  const effectivePresiderId = baptism.presider_id || groupBaptismPresiderId

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
    effectivePresiderId ? supabase.from('people').select('*').eq('id', effectivePresiderId).single() : Promise.resolve({ data: null }),
    effectiveEventId ? supabase.from('events').select('*, location:locations(*)').eq('id', effectiveEventId).single() : Promise.resolve({ data: null })
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

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'baptisms')

  // Validate data
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

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'baptisms')

  // Validate data
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

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'baptisms')

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
