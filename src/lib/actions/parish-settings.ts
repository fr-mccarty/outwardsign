'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSelectedParish } from '@/lib/auth/parish'

export async function getParishSettings() {
  const supabase = await createClient()
  const parishId = await requireSelectedParish()

  const { data: settings, error } = await supabase
    .from('parish_settings')
    .select('*')
    .eq('parish_id', parishId)
    .single()

  if (error) {
    // If settings don't exist, create default settings
    if (error.code === 'PGRST116') {
      const { data: newSettings, error: createError } = await supabase
        .from('parish_settings')
        .insert({
          parish_id: parishId,
          default_petitions: null
        })
        .select()
        .single()

      if (createError) {
        throw new Error(`Failed to create parish settings: ${createError.message}`)
      }
      return newSettings
    }
    throw new Error(`Failed to fetch parish settings: ${error.message}`)
  }

  return settings
}

export async function updateDefaultPetitions(defaultPetitions: string) {
  const supabase = await createClient()
  const parishId = await requireSelectedParish()

  // First, ensure parish settings exist
  let settings = await getParishSettings()

  // Update the default_petitions field
  const { data, error } = await supabase
    .from('parish_settings')
    .update({
      default_petitions: defaultPetitions,
      updated_at: new Date().toISOString()
    })
    .eq('parish_id', parishId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update default petitions: ${error.message}`)
  }

  return data
}

export async function getDefaultPetitions(): Promise<string | null> {
  const settings = await getParishSettings()
  return settings.default_petitions
}