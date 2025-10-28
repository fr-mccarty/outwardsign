'use server'

import { createClient } from '@/lib/supabase/server'
import { CreateLiturgyPlanData, LiturgyPlan } from '@/lib/types'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'

export async function createLiturgyPlan(data: CreateLiturgyPlanData) {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: plan, error } = await supabase
    .from('liturgy_plans')
    .insert([
      {
        parish_id: selectedParishId,
        title: data.title,
        date: data.date,
        liturgy_type: data.liturgy_type,
        prayers: data.prayers || [],
        preface: data.preface,
        readings: data.readings || [],
        special_notes: data.special_notes,
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error('Failed to create liturgy plan')
  }

  return plan
}

export async function getLiturgyPlans(): Promise<LiturgyPlan[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('liturgy_plans')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    // If table doesn't exist yet, return empty array
    if (error.message?.includes('relation "public.liturgy_plans" does not exist')) {
      console.warn('Liturgy plans table not yet created. Please run database migrations.')
      return []
    }
    throw new Error('Failed to fetch liturgy plans')
  }

  return data || []
}

export async function getLiturgyPlan(id: string): Promise<LiturgyPlan | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('liturgy_plans')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export async function updateLiturgyPlan(id: string, data: CreateLiturgyPlanData) {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: plan, error } = await supabase
    .from('liturgy_plans')
    .update({
      title: data.title,
      date: data.date,
      liturgy_type: data.liturgy_type,
      prayers: data.prayers || [],
      preface: data.preface,
      readings: data.readings || [],
      special_notes: data.special_notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error('Failed to update liturgy plan')
  }

  return plan
}

export async function deleteLiturgyPlan(id: string) {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { error } = await supabase
    .from('liturgy_plans')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error('Failed to delete liturgy plan')
  }
}