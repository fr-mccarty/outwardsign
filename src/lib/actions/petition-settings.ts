'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { getPetitionTextFromContext } from '@/lib/petition-context-utils'

export interface PetitionContextSettings {
  [contextId: string]: string
}

export async function getPetitionContextSettings(): Promise<PetitionContextSettings> {
  const supabase = await createClient()
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const { data, error } = await supabase
    .from('petition_templates')
    .select('*')

  if (error && error.code !== 'PGRST116') {
    throw new Error('Failed to load petition templates')
  }

  const settings: PetitionContextSettings = {}
  if (data) {
    data.forEach(context => {
      settings[context.id] = getPetitionTextFromContext(context.context)
    })
  }

  return settings
}

export async function updatePetitionContextSetting(contextId: string, petitionText: string) {
  const supabase = await createClient()
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  // Simply store the petition text directly in the context field
  const { error } = await supabase
    .from('petition_templates')
    .update({
      context: petitionText,
      updated_at: new Date().toISOString()
    })
    .eq('id', contextId)

  if (error) {
    throw new Error('Failed to update petition template setting')
  }
}

export async function updateAllPetitionContextSettings(settings: PetitionContextSettings) {
  // Update each context individually
  for (const [contextId, petitionText] of Object.entries(settings)) {
    await updatePetitionContextSetting(contextId, petitionText)
  }
}

export async function deletePetitionContextSetting() {
  // When deleting a context, the petition setting goes with it
  // This function is mainly for API compatibility
  return Promise.resolve()
}