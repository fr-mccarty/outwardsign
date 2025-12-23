'use server'

import { createLocationSchema, updateLocationSchema, type CreateLocationData, type UpdateLocationData } from '@/lib/schemas/locations'
import {
  createAuthenticatedClient,
  createAuthenticatedClientWithPermissions,
  handleSupabaseError,
  isNotFoundError,
  revalidateEntity,
  buildPaginatedResult,
  buildUpdateData,
  type PaginatedResult,
} from '@/lib/actions/server-action-utils'

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
  const { supabase } = await createAuthenticatedClient()

  const { data, error } = await supabase
    .from('locations')
    .select('*')

  if (error) handleSupabaseError(error, 'fetching', 'locations')

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
  const allLocations = await getLocations()
  const filteredLocations = await getLocations(filters)

  return {
    total: allLocations.length,
    filtered: filteredLocations.length
  }
}

export async function getLocationsPaginated(params?: { offset?: number; limit?: number; search?: string }): Promise<PaginatedResult<Location>> {
  const { supabase } = await createAuthenticatedClient()

  const offset = params?.offset || 0
  const limit = params?.limit || 10
  const search = params?.search || ''

  let query = supabase
    .from('locations')
    .select('*', { count: 'exact' })

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,city.ilike.%${search}%`)
  }

  query = query
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) handleSupabaseError(error, 'fetching', 'paginated locations')

  return buildPaginatedResult(data, count, offset, limit)
}

export async function getLocation(id: string): Promise<Location | null> {
  const { supabase } = await createAuthenticatedClient()

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (isNotFoundError(error)) return null
    handleSupabaseError(error, 'fetching', 'location')
  }

  return data
}

export async function createLocation(data: CreateLocationData): Promise<Location> {
  const { supabase, parishId } = await createAuthenticatedClientWithPermissions()

  createLocationSchema.parse(data)

  const { data: location, error } = await supabase
    .from('locations')
    .insert([
      {
        parish_id: parishId,
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

  if (error) handleSupabaseError(error, 'creating', 'location')

  revalidateEntity('locations')
  return location
}

export async function updateLocation(id: string, data: UpdateLocationData): Promise<Location> {
  const { supabase } = await createAuthenticatedClientWithPermissions()

  updateLocationSchema.parse(data)
  const updateData = buildUpdateData(data)

  const { data: location, error } = await supabase
    .from('locations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) handleSupabaseError(error, 'updating', 'location')

  revalidateEntity('locations', id, { includeEdit: true })
  return location
}

export async function deleteLocation(id: string): Promise<void> {
  const { supabase } = await createAuthenticatedClientWithPermissions()

  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id)

  if (error) handleSupabaseError(error, 'deleting', 'location')

  revalidateEntity('locations')
}
