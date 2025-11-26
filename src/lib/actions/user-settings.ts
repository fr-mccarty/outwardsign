'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  updateUserSettingsSchema,
  type UpdateUserSettingsData
} from '@/lib/schemas/user-settings'

export interface UserSettings {
  id: string
  user_id: string
  selected_parish_id: string | null
  language: string
  created_at: string
  updated_at: string
}

export async function getUserSettings(): Promise<UserSettings | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No settings found, create default settings
      const { data: newSettings, error: createError } = await supabase
        .from('user_settings')
        .insert({
          user_id: user.id,
          language: 'en',
          selected_parish_id: null
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating default settings:', createError)
        return null
      }

      return newSettings
    }
    console.error('Error fetching user settings:', error)
    return null
  }

  return data
}

export async function updateUserSettings(data: UpdateUserSettingsData): Promise<UserSettings> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Validate data on server
  const validatedData = updateUserSettingsSchema.parse(data)

  const { data: settings, error } = await supabase
    .from('user_settings')
    .update(validatedData)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating user settings:', error)
    throw new Error('Failed to update user settings')
  }

  revalidatePath('/settings/user')
  return settings
}
