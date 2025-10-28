'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'

export interface Person {
  id: string
  parish_id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  notes?: string
  is_active: boolean
  availability?: Record<string, unknown> // JSON data for availability
  created_at: string
  updated_at: string
}

export interface CreatePersonData {
  first_name: string
  last_name: string
  email?: string
  phone?: string
  notes?: string
  is_active?: boolean
  availability?: Record<string, unknown>
}

export interface UpdatePersonData {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  notes?: string
  is_active?: boolean
  availability?: Record<string, unknown>
}

export async function getPeople(): Promise<Person[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('people')
    .select('*')
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })

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
        email: data.email || null,
        phone: data.phone || null,
        notes: data.notes || null,
        is_active: data.is_active ?? true,
        availability: data.availability || null,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating person:', error)
    throw new Error('Failed to create person')
  }

  revalidatePath('/people')
  return person
}

export async function updatePerson(id: string, data: UpdatePersonData): Promise<Person> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {}
  if (data.first_name !== undefined) updateData.first_name = data.first_name
  if (data.last_name !== undefined) updateData.last_name = data.last_name
  if (data.email !== undefined) updateData.email = data.email || null
  if (data.phone !== undefined) updateData.phone = data.phone || null
  if (data.notes !== undefined) updateData.notes = data.notes || null
  if (data.is_active !== undefined) updateData.is_active = data.is_active
  if (data.availability !== undefined) updateData.availability = data.availability

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

export async function getActivePeople(): Promise<Person[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('is_active', true)
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })

  if (error) {
    console.error('Error fetching active people:', error)
    throw new Error('Failed to fetch active people')
  }

  return data || []
}

export async function searchPeople(query: string): Promise<Person[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  if (!query.trim()) {
    return getActivePeople()
  }

  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('is_active', true)
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })
    .limit(20)

  if (error) {
    console.error('Error searching people:', error)
    throw new Error('Failed to search people')
  }

  return data || []
}