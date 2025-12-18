'use server'

import { createClient } from '@/lib/supabase/server'
// redirect import removed - not used
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { logError } from '@/lib/utils/console'

export interface Ministry {
  id: string
  parish: string
  name: string
  description?: string
  requirements?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CreateMinistryData {
  name: string
  description?: string
  requirements?: string
  is_active?: boolean
  sort_order?: number
}

export interface UpdateMinistryData {
  name?: string
  description?: string
  requirements?: string
  is_active?: boolean
  sort_order?: number
}

export async function getMinistries(): Promise<Ministry[]> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ministries')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    logError('Error fetching ministries:' + error)
    throw new Error('Failed to fetch ministries')
  }

  return data || []
}

export async function getMinistry(id: string): Promise<Ministry | null> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ministries')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    logError('Error fetching ministry:' + error)
    throw new Error('Failed to fetch ministry')
  }

  return data
}

export async function createMinistry(data: CreateMinistryData): Promise<Ministry> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the next sort order
  const { data: lastMinistry } = await supabase
    .from('ministries')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const nextSortOrder = data.sort_order ?? ((lastMinistry?.sort_order || 0) + 1)

  const { data: ministry, error } = await supabase
    .from('ministries')
    .insert([
      {
        parish_id: selectedParishId,
        name: data.name,
        description: data.description || null,
        requirements: data.requirements || null,
        is_active: data.is_active ?? true,
        sort_order: nextSortOrder,
      }
    ])
    .select()
    .single()

  if (error) {
    logError('Error creating ministry:' + error)
    throw new Error('Failed to create ministry')
  }

  revalidatePath('/ministries')
  return ministry
}

export async function updateMinistry(id: string, data: UpdateMinistryData): Promise<Ministry> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description || null
  if (data.requirements !== undefined) updateData.requirements = data.requirements || null
  if (data.is_active !== undefined) updateData.is_active = data.is_active
  if (data.sort_order !== undefined) updateData.sort_order = data.sort_order

  const { data: ministry, error } = await supabase
    .from('ministries')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    logError('Error updating ministry:' + error)
    throw new Error('Failed to update ministry')
  }

  revalidatePath('/ministries')
  return ministry
}

export async function deleteMinistry(id: string): Promise<void> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { error } = await supabase
    .from('ministries')
    .delete()
    .eq('id', id)

  if (error) {
    logError('Error deleting ministry:' + error)
    throw new Error('Failed to delete ministry')
  }

  revalidatePath('/ministries')
}

export async function reorderMinistries(ministryIds: string[]): Promise<void> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Update each ministry with its new sort order
  const updates = ministryIds.map((id, index) => 
    supabase
      .from('ministries')
      .update({ sort_order: index + 1 })
      .eq('id', id)
  )

  const results = await Promise.allSettled(updates)
  
  const failures = results.filter(result => result.status === 'rejected')
  if (failures.length > 0) {
    logError('Error reordering ministries:' + failures)
    throw new Error('Failed to reorder some ministries')
  }

  revalidatePath('/ministries')
}

export async function getActiveMinistries(): Promise<Ministry[]> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ministries')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    logError('Error fetching active ministries:' + error)
    throw new Error('Failed to fetch active ministries')
  }

  return data || []
}

// Initialize default ministries for a new parish
export async function initializeDefaultMinistries(): Promise<Ministry[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check if parish already has ministries
  const { data: existing } = await supabase
    .from('ministries')
    .select('id')
    .limit(1)

  if (existing && existing.length > 0) {
    // Parish already has ministries, return existing ones
    return getMinistries()
  }

  // Create default ministries
  const defaultMinistries = [
    { name: 'Usher', description: 'Assists with seating, collection, and maintaining order during services', requirements: 'Friendly demeanor, punctuality', sort_order: 1 },
    { name: 'Extraordinary Eucharistic Minister', description: 'Assists with distribution of Holy Communion', requirements: 'Must be trained and commissioned by the parish', sort_order: 2 },
    { name: 'Server/Acolyte', description: 'Assists the priest during Mass with liturgical duties', requirements: 'Training required, usually children or young adults', sort_order: 3 },
    { name: 'Lector', description: 'Proclaims the Word of God during liturgical services', requirements: 'Clear speaking voice, comfort with public reading', sort_order: 4 },
    { name: 'Welcoming Ministry', description: 'Greets parishioners and visitors before and after services', requirements: 'Warm personality, knowledge of parish programs', sort_order: 5 },
    { name: 'Music Ministry', description: 'Provides musical leadership during liturgical celebrations', requirements: 'Musical ability, commitment to regular practice', sort_order: 6 },
    { name: 'Altar Server Coordinator', description: 'Coordinates and trains altar servers', requirements: 'Experience as altar server, leadership skills', sort_order: 7 },
    { name: 'Sacristan', description: 'Prepares liturgical items and maintains sacred space', requirements: 'Knowledge of liturgical requirements, attention to detail', sort_order: 8 },
  ]

  const { data: ministries, error } = await supabase
    .from('ministries')
    .insert(
      defaultMinistries.map(ministry => ({
        ...ministry,
        parish_id: selectedParishId,
        is_active: true,
      }))
    )
    .select()

  if (error) {
    logError('Error creating default ministries:' + error)
    throw new Error('Failed to create default ministries')
  }

  revalidatePath('/ministries')
  return ministries || []
}