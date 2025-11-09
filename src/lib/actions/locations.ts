'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'

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

export interface CreateLocationData {
  name: string
  description?: string
  street?: string
  city?: string
  state?: string
  country?: string
  phone_number?: string
}

export interface UpdateLocationData {
  name?: string
  description?: string
  street?: string
  city?: string
  state?: string
  country?: string
  phone_number?: string
}

export interface LocationFilterParams {
  search?: string
}

export async function getLocations(filters?: LocationFilterParams): Promise<Location[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  let query = supabase
    .from('locations')
    .select('*')

  // Apply search filter
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,city.ilike.%${filters.search}%`)
  }

  query = query.order('name', { ascending: true })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching locations:', error)
    throw new Error('Failed to fetch locations')
  }

  return data || []
}

export async function getLocation(id: string): Promise<Location | null> {
  const selectedParishId = await requireSelectedParish()
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
    console.error('Error fetching location:', error)
    throw new Error('Failed to fetch location')
  }

  return data
}

export async function createLocation(data: CreateLocationData): Promise<Location> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

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
    console.error('Error creating location:', error)
    throw new Error('Failed to create location')
  }

  revalidatePath('/locations')
  return location
}

export async function updateLocation(id: string, data: UpdateLocationData): Promise<Location> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )

  const { data: location, error } = await supabase
    .from('locations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating location:', error)
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

  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting location:', error)
    throw new Error('Failed to delete location')
  }

  revalidatePath('/locations')
}
