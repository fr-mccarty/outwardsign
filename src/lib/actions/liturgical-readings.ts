'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import type { LiturgicalReading, CreateLiturgicalReadingData } from '@/lib/types'

export async function createLiturgicalReading(data: CreateLiturgicalReadingData): Promise<LiturgicalReading> {
  console.log('Creating liturgical reading with data:', data)
  
  try {
    const supabase = await createClient()
    
    const selectedParishId = await requireSelectedParish()
    console.log('Selected parish ID:', selectedParishId)
    
    await ensureJWTClaims()

    // Parish-based liturgical readings (no user_id column exists)
    const insertData = {
      parish_id: selectedParishId,
      title: data.title,
      description: data.description || null,
      // Only include optional fields if they're provided
      ...(data.date && { date: data.date }),
      ...(data.first_reading_id && { first_reading_id: data.first_reading_id }),
      ...(data.first_reading_lector && { first_reading_lector: data.first_reading_lector }),
      ...(data.psalm_id && { psalm_id: data.psalm_id }),
      ...(data.psalm_lector && { psalm_lector: data.psalm_lector }),
      ...(data.second_reading_id && { second_reading_id: data.second_reading_id }),
      ...(data.second_reading_lector && { second_reading_lector: data.second_reading_lector }),
      ...(data.gospel_reading_id && { gospel_reading_id: data.gospel_reading_id }),
      ...(data.gospel_lector && { gospel_lector: data.gospel_lector }),
      ...(data.sung_petitions !== undefined && { sung_petitions: data.sung_petitions }),
    }
    
    console.log('Inserting data into liturgical_readings:', insertData)

    const { data: liturgicalReading, error } = await supabase
      .from('liturgical_readings')
      .insert([insertData])
      .select()
      .single()

    if (error) {
      console.error('Database error creating liturgical reading:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      throw new Error(`Failed to create liturgical reading: ${error.message}`)
    }

    console.log('Successfully created liturgical reading:', liturgicalReading)
    return liturgicalReading
  } catch (err) {
    console.error('Caught error in createLiturgicalReading:', err)
    throw err
  }
}

export async function getLiturgicalReadings(): Promise<LiturgicalReading[]> {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const { data, error } = await supabase
    .from('liturgical_readings')
    .select('*')
    .eq('parish_id', selectedParishId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch liturgical readings')
  }

  return data || []
}

export async function getLiturgicalReading(id: string): Promise<LiturgicalReading | null> {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const { data, error } = await supabase
    .from('liturgical_readings')
    .select('*')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export async function updateLiturgicalReading(id: string, data: Partial<CreateLiturgicalReadingData>): Promise<LiturgicalReading> {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const updateData: Record<string, unknown> = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.description !== undefined) updateData.description = data.description || null
  if (data.date !== undefined) updateData.date = data.date || null
  if (data.first_reading_id !== undefined) updateData.first_reading_id = data.first_reading_id || null
  if (data.first_reading_lector !== undefined) updateData.first_reading_lector = data.first_reading_lector || null
  if (data.psalm_id !== undefined) updateData.psalm_id = data.psalm_id || null
  if (data.psalm_lector !== undefined) updateData.psalm_lector = data.psalm_lector || null
  if (data.second_reading_id !== undefined) updateData.second_reading_id = data.second_reading_id || null
  if (data.second_reading_lector !== undefined) updateData.second_reading_lector = data.second_reading_lector || null
  if (data.gospel_reading_id !== undefined) updateData.gospel_reading_id = data.gospel_reading_id || null
  if (data.gospel_lector !== undefined) updateData.gospel_lector = data.gospel_lector || null
  if (data.sung_petitions !== undefined) updateData.sung_petitions = data.sung_petitions || false

  const { data: liturgicalReading, error } = await supabase
    .from('liturgical_readings')
    .update(updateData)
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .select()
    .single()

  if (error) {
    console.error('Database error updating liturgical reading:', error)
    throw new Error(`Failed to update liturgical reading: ${error.message}`)
  }

  return liturgicalReading
}

export async function getLiturgicalReadingsByDateRange(startDate: string, endDate: string): Promise<LiturgicalReading[]> {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const { data, error } = await supabase
    .from('liturgical_readings')
    .select('*')
    .eq('parish_id', selectedParishId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) {
    throw new Error('Failed to fetch liturgical readings by date range')
  }

  return data || []
}

export async function deleteLiturgicalReading(id: string): Promise<void> {
  const supabase = await createClient()
  
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const { error } = await supabase
    .from('liturgical_readings')
    .delete()
    .eq('id', id)
    .eq('parish_id', selectedParishId)

  if (error) {
    console.error('Database error deleting liturgical reading:', error)
    throw new Error(`Failed to delete liturgical reading: ${error.message}`)
  }
}