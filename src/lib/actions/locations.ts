'use server'

import { createClient } from '@/lib/supabase/server'
import { logError } from '@/lib/utils/console'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { requireEditSharedResources } from '@/lib/auth/permissions'
import type { PaginatedParams, PaginatedResult } from './people'
import { createLocationSchema, updateLocationSchema, type CreateLocationData, type UpdateLocationData } from '@/lib/schemas/locations'

export interface Location {
  id: string
  parish_id: string
  name: string
  description?: string | null
  street?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  phone_number?: string | null
  created_at: string
  updated_at: string
}

// Note: Import CreateLocationData and UpdateLocationData from '@/lib/schemas/locations' instead

export interface LocationFilterParams {
  search?: string
  sort?: string
  offset?: number
  limit?: number
}

export interface LocationStats {
  total: number
  filtered: number
}

export async function getLocations(filters?: LocationFilterParams): Promise<Location[]> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const query = supabase
    .from('locations')
    .select('*')

  const { data, error } = await query

  if (error) {
    logError('Error fetching locations: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch locations')
  }

  let results = data || []

  // Apply search filter (application-level)
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase()
    results = results.filter(location =>
      location.name.toLowerCase().includes(searchLower) ||
      location.description?.toLowerCase().includes(searchLower) ||
      location.city?.toLowerCase().includes(searchLower)
    )
  }

  // Apply sorting (application-level)
  const sort = filters?.sort || 'name_asc'
  switch (sort) {
    case 'name_asc':
      results.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'name_desc':
      results.sort((a, b) => b.name.localeCompare(a.name))
      break
    case 'created_asc':
      results.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      break
    case 'created_desc':
      results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      break
    default:
      results.sort((a, b) => a.name.localeCompare(b.name))
  }

  return results
}

export async function getLocationStats(filters?: LocationFilterParams): Promise<LocationStats> {
  await requireSelectedParish()
  await ensureJWTClaims()

  // Get all locations for total count
  const allLocations = await getLocations()
  const total = allLocations.length

  // Get filtered locations for filtered count
  const filteredLocations = await getLocations(filters)
  const filtered = filteredLocations.length

  return {
    total,
    filtered
  }
}

export async function getLocationsPaginated(params?: PaginatedParams): Promise<PaginatedResult<Location>> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const offset = params?.offset || 0
  const limit = params?.limit || 10
  const search = params?.search || ''

  // Build base query
  let query = supabase
    .from('locations')
    .select('*', { count: 'exact' })

  // Apply search filter
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,city.ilike.%${search}%`)
  }

  // Apply ordering, pagination
  query = query
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    logError('Error fetching paginated locations: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch paginated locations')
  }

  const totalCount = count || 0
  const totalPages = Math.ceil(totalCount / limit)
  const page = Math.floor(offset / limit) + 1

  return {
    items: data || [],
    totalCount,
    page,
    limit,
    totalPages,
  }
}

export async function getLocation(id: string): Promise<Location | null> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    logError('Error fetching location: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch location')
  }

  return data
}

export async function createLocation(data: CreateLocationData): Promise<Location> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  // Validate data
  createLocationSchema.parse(data)

  const { data: location, error } = await supabase
    .from('locations')
    .insert([
      {
        parish_id: selectedParishId,
        name: data.name,
        description: data.description || null,
        street: data.street || null,
        city: data.city || null,
        state: data.state || null,
        country: data.country || null,
        phone_number: data.phone_number || null,
      }
    ])
    .select()
    .single()

  if (error) {
    logError('Error creating location: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to create location')
  }

  revalidatePath('/locations')
  return location
}

export async function updateLocation(id: string, data: UpdateLocationData): Promise<Location> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  await requireEditSharedResources(user.id, selectedParishId)

  // Validate data
  updateLocationSchema.parse(data)

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(data).filter(([_key, value]) => value !== undefined)
  )

  const { data: location, error } = await supabase
    .from('locations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    logError('Error updating location: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to update location')
  }

  revalidatePath('/locations')
  revalidatePath(`/locations/${id}`)
  revalidatePath(`/locations/${id}/edit`)
  return location
}

export async function deleteLocation(id: string): Promise<void> {
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
    .from('locations')
    .delete()
    .eq('id', id)

  if (error) {
    logError('Error deleting location: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to delete location')
  }

  revalidatePath('/locations')
}
