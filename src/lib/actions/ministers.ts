'use server'

import { createClient } from '@/lib/supabase/server'
import { CreateMinisterData, Minister } from '@/lib/types'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'

export async function createMinister(data: CreateMinisterData) {
  const supabase = await createClient()
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const { data: minister, error } = await supabase
    .from('ministers')
    .insert([
      {
        parish_id: selectedParishId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        availability: data.availability || {},
        notes: data.notes,
        is_active: data.is_active ?? true,
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error('Failed to create minister')
  }

  return minister
}

export async function getMinisters(): Promise<Minister[]> {
  const supabase = await createClient()
  await requireSelectedParish()
  await ensureJWTClaims()

  const { data, error } = await supabase
    .from('ministers')
    .select()
    .order('name', { ascending: true })

  if (error) {
    // If table doesn't exist yet, return empty array
    if (error.message?.includes('relation "public.ministers" does not exist')) {
      console.warn('Ministers table not yet created. Please run database migrations.')
      return []
    }
    throw new Error('Failed to fetch ministers')
  }

  return data || []
}

export async function getMinister(id: string): Promise<Minister | null> {
  const supabase = await createClient()
  await requireSelectedParish()
  await ensureJWTClaims()

  const { data, error } = await supabase
    .from('ministers')
    .select()
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export async function updateMinister(id: string, data: CreateMinisterData) {
  const supabase = await createClient()
  await requireSelectedParish()
  await ensureJWTClaims()

  const { data: minister, error } = await supabase
    .from('ministers')
    .update({
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      availability: data.availability || {},
      notes: data.notes,
      is_active: data.is_active ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error('Failed to update minister')
  }

  return minister
}

export async function deleteMinister(id: string) {
  const supabase = await createClient()
  await requireSelectedParish()
  await ensureJWTClaims()

  const { error } = await supabase
    .from('ministers')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error('Failed to delete minister')
  }
}