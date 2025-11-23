'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { requireEditSharedResources } from '@/lib/auth/permissions'
import { Person } from '@/lib/types'

/**
 * Build robust search conditions for people queries
 * Normalizes search input to handle periods, spaces, and phone formatting
 */
function buildPeopleSearchConditions(search: string): string[] {
  // Normalize the search string: trim and collapse multiple spaces
  const normalized = search.trim().replace(/\s+/g, ' ')

  // Create search conditions array
  const searchConditions: string[] = []

  // 1. Standard field searches (case-insensitive, original search)
  searchConditions.push(`first_name.ilike.%${normalized}%`)
  searchConditions.push(`last_name.ilike.%${normalized}%`)
  searchConditions.push(`email.ilike.%${normalized}%`)

  // 2. Phone number search - strip all non-numeric characters for flexible matching
  // This allows "5551234567" to match "(555) 123-4567" or "555-123-4567"
  const numericSearch = normalized.replace(/\D/g, '')
  if (numericSearch.length >= 3) {
    // Only search phone if we have at least 3 digits
    searchConditions.push(`phone_number.ilike.%${numericSearch}%`)
  }

  // 3. Full-name search - treat periods, dashes, commas as spaces
  // This handles searches like "John.Doe" or "John-Doe" by converting them to "John Doe"
  // Also strips periods from database fields to match "fr. josh mccarty" with "fr. josh."
  const cleanSearch = normalized.replace(/[.\-,]/g, ' ').replace(/\s+/g, ' ').trim()
  if (cleanSearch !== normalized && cleanSearch.length > 0) {
    // Search in concatenated first_name + space + last_name, stripping periods from both
    // PostgreSQL replace() function removes periods from database fields
    // This matches "fr josh mccarty" search with "fr. josh. mccarty" in database
    searchConditions.push(`replace(replace(concat(first_name,' ',last_name),'.',''),'-','').ilike.%${cleanSearch.replace(/[\s]+/g, '%')}%`)
  }

  // 4. Handle searches with separators (spaces, periods, dashes, commas)
  // Replace common separators with wildcard to match any separator or no separator
  const separatorPattern = normalized.replace(/[\s.\-,]+/g, '%')
  if (separatorPattern !== normalized && !separatorPattern.includes('%%')) {
    searchConditions.push(`first_name.ilike.%${separatorPattern}%`)
    searchConditions.push(`last_name.ilike.%${separatorPattern}%`)
  }

  // 5. If search contains space, period, dash, or comma - treat as "FirstName LastName" pattern
  if (/[\s.\-,]/.test(normalized)) {
    // Split by any separator
    const parts = normalized.split(/[\s.\-,]+/).filter(p => p.length > 0)

    if (parts.length >= 2) {
      const firstPart = parts[0]
      const lastPart = parts.slice(1).join(' ')

      // Match first_name starting with first part AND last_name starting with last part
      searchConditions.push(`and(first_name.ilike.${firstPart}%,last_name.ilike.${lastPart}%)`)

      // Also try reversed (in case they typed "LastName FirstName")
      searchConditions.push(`and(first_name.ilike.${lastPart}%,last_name.ilike.${firstPart}%)`)
    }
  }

  return searchConditions
}

export interface CreatePersonData {
  first_name: string
  first_name_pronunciation?: string
  last_name: string
  last_name_pronunciation?: string
  phone_number?: string
  email?: string
  street?: string
  city?: string
  state?: string
  zipcode?: string
  sex?: 'Male' | 'Female'
  note?: string
  mass_times_template_item_ids?: string[]
}

export interface UpdatePersonData {
  first_name?: string
  first_name_pronunciation?: string
  last_name?: string
  last_name_pronunciation?: string
  phone_number?: string
  email?: string
  street?: string
  city?: string
  state?: string
  zipcode?: string
  sex?: 'Male' | 'Female'
  note?: string
  mass_times_template_item_ids?: string[]
}

export interface PersonFilterParams {
  search?: string
}

export interface PaginatedParams {
  page?: number
  limit?: number
  search?: string
  massRoleId?: string // Filter by mass role membership
}

export interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  page: number
  limit: number
  totalPages: number
}

export async function getPeople(filters?: PersonFilterParams): Promise<Person[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  let query = supabase
    .from('people')
    .select('*')
    .eq('parish_id', selectedParishId)

  // Apply filters
  if (filters?.search) {
    const searchConditions = buildPeopleSearchConditions(filters.search)
    query = query.or(searchConditions.join(','))
  }

  query = query.order('last_name', { ascending: true })
    .order('first_name', { ascending: true })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching people:', error)
    throw new Error('Failed to fetch people')
  }

  return data || []
}

export async function getPeoplePaginated(params?: PaginatedParams): Promise<PaginatedResult<Person>> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const page = params?.page || 1
  const limit = params?.limit || 10
  const search = params?.search || ''
  const massRoleId = params?.massRoleId

  // Calculate offset
  const offset = (page - 1) * limit

  // Build base query - if filtering by mass role, join with mass_role_members
  let query
  if (massRoleId) {
    query = supabase
      .from('people')
      .select(`
        *,
        mass_role_members!inner(mass_role_id, active)
      `, { count: 'exact' })
      .eq('parish_id', selectedParishId)
      .eq('mass_role_members.mass_role_id', massRoleId)
      .eq('mass_role_members.active', true)
  } else {
    query = supabase
      .from('people')
      .select('*', { count: 'exact' })
      .eq('parish_id', selectedParishId)
  }

  // Apply search filter
  if (search) {
    const searchConditions = buildPeopleSearchConditions(search)
    query = query.or(searchConditions.join(','))
  }

  // Apply ordering, pagination
  query = query
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching paginated people:', error)
    throw new Error('Failed to fetch paginated people')
  }

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / limit)

  return {
    items: data || [],
    totalCount,
    page,
    limit,
    totalPages,
  }
}

export async function getPerson(id: string): Promise<Person | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('parish_id', selectedParishId)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching person:', error)
    throw new Error('Failed to fetch person')
  }

  return data
}

export async function createPerson(data: CreatePersonData): Promise<Person> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  const { data: person, error } = await supabase
    .from('people')
    .insert([
      {
        parish_id: selectedParishId,
        first_name: data.first_name,
        first_name_pronunciation: data.first_name_pronunciation || null,
        last_name: data.last_name,
        last_name_pronunciation: data.last_name_pronunciation || null,
        phone_number: data.phone_number || null,
        email: data.email || null,
        street: data.street || null,
        city: data.city || null,
        state: data.state || null,
        zipcode: data.zipcode || null,
        sex: data.sex || null,
        note: data.note || null,
        mass_times_template_item_ids: data.mass_times_template_item_ids || [],
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating person:', error)
    throw new Error(`Failed to create person: ${error.message}`)
  }

  revalidatePath('/people')
  revalidatePath(`/people/${person.id}`)

  return person
}

export async function updatePerson(id: string, data: UpdatePersonData): Promise<Person> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  const updateData: Record<string, unknown> = {}
  if (data.first_name !== undefined) updateData.first_name = data.first_name
  if (data.first_name_pronunciation !== undefined) updateData.first_name_pronunciation = data.first_name_pronunciation || null
  if (data.last_name !== undefined) updateData.last_name = data.last_name
  if (data.last_name_pronunciation !== undefined) updateData.last_name_pronunciation = data.last_name_pronunciation || null
  if (data.phone_number !== undefined) updateData.phone_number = data.phone_number || null
  if (data.email !== undefined) updateData.email = data.email || null
  if (data.street !== undefined) updateData.street = data.street || null
  if (data.city !== undefined) updateData.city = data.city || null
  if (data.state !== undefined) updateData.state = data.state || null
  if (data.zipcode !== undefined) updateData.zipcode = data.zipcode || null
  if (data.sex !== undefined) updateData.sex = data.sex || null
  if (data.note !== undefined) updateData.note = data.note || null
  if (data.mass_times_template_item_ids !== undefined) updateData.mass_times_template_item_ids = data.mass_times_template_item_ids || []

  const { data: person, error } = await supabase
    .from('people')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating person:', error)
    throw new Error('Failed to update person')
  }

  revalidatePath('/people')
  revalidatePath(`/people/${id}`)
  return person
}

export async function deletePerson(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  const { error } = await supabase
    .from('people')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting person:', error)
    throw new Error('Failed to delete person')
  }

  revalidatePath('/people')
}

// ============================================================================
// PEOPLE WITH GROUP ROLES (for mass role picker)
// ============================================================================

export interface PersonWithGroupRoles extends Person {
  group_members?: Array<{
    id: string
    group_id: string
    roles?: string[] | null
    group?: {
      id: string
      name: string
    }
  }>
}

export async function getPeopleWithRolesPaginated(params?: PaginatedParams): Promise<PaginatedResult<PersonWithGroupRoles>> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const page = params?.page || 1
  const limit = params?.limit || 10
  const search = params?.search || ''

  // Calculate offset
  const offset = (page - 1) * limit

  // Build base query with group_members relation
  let query = supabase
    .from('people')
    .select(`
      *,
      group_members!inner (
        id,
        group_id,
        roles,
        group:groups (
          id,
          name
        )
      )
    `, { count: 'exact' })
    .eq('parish_id', selectedParishId)

  // Apply search filter
  if (search) {
    const searchConditions = buildPeopleSearchConditions(search)
    query = query.or(searchConditions.join(','))
  }

  // Apply ordering, pagination
  query = query
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching paginated people with roles:', error)
    throw new Error('Failed to fetch paginated people with roles')
  }

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / limit)

  return {
    items: data || [],
    totalCount,
    page,
    limit,
    totalPages,
  }
}
