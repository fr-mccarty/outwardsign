'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { Person } from '@/lib/types'

export interface CreatePersonData {
  first_name: string
  last_name: string
  phone_number?: string
  email?: string
  street?: string
  city?: string
  state?: string
  zipcode?: string
  note?: string
}

export interface UpdatePersonData {
  first_name?: string
  last_name?: string
  phone_number?: string
  email?: string
  street?: string
  city?: string
  state?: string
  zipcode?: string
  note?: string
}

export interface PersonFilterParams {
  search?: string
}

export async function getPeople(filters?: PersonFilterParams): Promise<Person[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  let query = supabase
    .from('people')
    .select('*')

  // Apply filters
  if (filters?.search) {
    // Use OR condition for search across multiple fields
    query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone_number.ilike.%${filters.search}%`)
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

export async function getPerson(id: string): Promise<Person | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('people')
    .select('*')
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

  const { data: person, error } = await supabase
    .from('people')
    .insert([
      {
        parish_id: selectedParishId,
        first_name: data.first_name,
        last_name: data.last_name,
        phone_number: data.phone_number || null,
        email: data.email || null,
        street: data.street || null,
        city: data.city || null,
        state: data.state || null,
        zipcode: data.zipcode || null,
        note: data.note || null,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating person:', error)
    throw new Error(`Failed to create person: ${error.message}`)
  }

  return person
}

export async function updatePerson(id: string, data: UpdatePersonData): Promise<Person> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {}
  if (data.first_name !== undefined) updateData.first_name = data.first_name
  if (data.last_name !== undefined) updateData.last_name = data.last_name
  if (data.phone_number !== undefined) updateData.phone_number = data.phone_number || null
  if (data.email !== undefined) updateData.email = data.email || null
  if (data.street !== undefined) updateData.street = data.street || null
  if (data.city !== undefined) updateData.city = data.city || null
  if (data.state !== undefined) updateData.state = data.state || null
  if (data.zipcode !== undefined) updateData.zipcode = data.zipcode || null
  if (data.note !== undefined) updateData.note = data.note || null

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