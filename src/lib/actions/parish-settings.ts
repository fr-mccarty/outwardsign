'use server'

import {
  createAuthenticatedClient,
  isNotFoundError,
} from './server-action-utils'

export async function getParishSettings() {
  const { supabase, parishId } = await createAuthenticatedClient()

  const { data: settings, error } = await supabase
    .from('parish_settings')
    .select('*')
    .eq('parish_id', parishId)
    .single()

  if (error) {
    // If settings don't exist, create default settings
    if (isNotFoundError(error)) {
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
  const { supabase, parishId } = await createAuthenticatedClient()

  // First, ensure parish settings exist
  // Unused: const _settings = await getParishSettings()

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