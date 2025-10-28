'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export interface ParishUser {
  user_id: string
  parish_id: string
  roles: string[]
}

export interface Parish {
  id: string
  name: string
  city: string
  state: string
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  selected_parish_id: string | null
  language: string
  created_at: string
  updated_at: string
}

export async function getSelectedParishId(): Promise<string | null> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  console.log('Fetching selected parish ID for user:', user.id)

  // First, let's try to get all user_settings records to see if the table exists
  const { data: allData, error: allError } = await supabase
    .from('user_settings')
    .select('*')
    .limit(5)

  console.log('All user_settings (first 5):', allData)
  if (allError) {
    console.error('Error fetching all user_settings:', allError)
  }

  // Now try the specific query - use limit(1) to get the first record
  const { data, error } = await supabase
    .from('user_settings')
    .select('selected_parish_id')
    .eq('user_id', user.id)
    .limit(1)

  console.log('Query result - data:', data, 'error:', error)

  if (error) {
    console.error('Error fetching selected parish ID:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return null
  }

  if (!data || data.length === 0) {
    console.log('No user settings found for user:', user.id)
    return null
  }

  console.log('Found selected parish ID:', data[0].selected_parish_id)
  return data[0].selected_parish_id
}

export async function getUserParishAssociations(): Promise<ParishUser[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data, error } = await supabase
    .from('parish_user')
    .select('*')
    .eq('user_id', user.id)

  if (error || !data) {
    return []
  }

  return data.map(item => ({
    user_id: item.user_id,
    parish_id: item.parish_id,
    roles: item.roles || []
  }))
}

export async function getCurrentParish(): Promise<Parish | null> {
  const selectedParishId = await getSelectedParishId()
  if (!selectedParishId) return null

  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('parishes')
    .select('*')
    .eq('id', selectedParishId)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export async function setSelectedParish(parishId: string): Promise<void> {
  console.log('Setting selected parish:', parishId)
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  console.log('User ID:', user.id)

  // Verify user has access to this parish
  const { data: parishUser, error: parishError } = await supabase
    .from('parish_user')
    .select('parish_id')
    .eq('user_id', user.id)
    .eq('parish_id', parishId)
    .single()

  if (parishError || !parishUser) {
    console.error('Parish access error:', parishError)
    throw new Error('User does not have access to this parish')
  }

  console.log('Parish access verified')

  // Update user settings - first try to update, then insert if not exists
  console.log('Attempting to update user settings...')
  const { data: updateData, error: updateError } = await supabase
    .from('user_settings')
    .update({
      selected_parish_id: parishId
    })
    .eq('user_id', user.id)
    .select()

  if (updateError) {
    console.error('Error updating user settings:', updateError)
    throw new Error(`Failed to update selected parish: ${updateError.message}`)
  }

  console.log('Update result:', updateData)

  // If no rows were updated, insert a new record
  if (!updateData || updateData.length === 0) {
    console.log('No rows updated, inserting new record...')
    const { data: insertData, error: insertError } = await supabase
      .from('user_settings')
      .insert({
        user_id: user.id,
        selected_parish_id: parishId,
        language: 'en'
      })
      .select()

    if (insertError) {
      console.error('Error inserting user settings:', insertError)
      throw new Error(`Failed to create user settings: ${insertError.message}`)
    }

    console.log('Insert result:', insertData)
  } else {
    console.log('Successfully updated user settings')
  }
  
  // Force a cache refresh by revalidating the path
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/dashboard')
    revalidatePath('/select-parish')
  } catch (error) {
    // revalidatePath might not be available in all contexts
    console.log('Could not revalidate path:', error)
  }
}

export async function requireSelectedParish(): Promise<string> {
  const selectedParishId = await getSelectedParishId()
  if (!selectedParishId) {
    redirect('/select-parish') // Will need to create this page
  }
  return selectedParishId
}