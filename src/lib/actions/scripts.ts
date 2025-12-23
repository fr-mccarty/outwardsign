'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { requireManageParishSettings } from '@/lib/auth/permissions'
import {
  Script,
  ScriptWithSections,
  CreateScriptData,
  UpdateScriptData,
  Section
} from '@/lib/types'
import { logError } from '@/lib/utils/console'
import {
  createAuthenticatedClient,
  isNotFoundError,
} from './server-action-utils'


/**
 * Get all scripts for an event type
 */
export async function getScripts(eventTypeId: string): Promise<Script[]> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('scripts')
    .select('*')
    .eq('event_type_id', eventTypeId)
    .is('deleted_at', null)
    .order('order', { ascending: true })

  if (error) {
    logError('Error fetching scripts: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch scripts')
  }

  return data || []
}

/**
 * Get a single script by ID
 */
export async function getScript(id: string): Promise<Script | null> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('scripts')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (isNotFoundError(error)) {
      return null // Not found
    }
    logError('Error fetching script: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch script')
  }

  return data
}

/**
 * Get script with all sections
 */
export async function getScriptWithSections(id: string): Promise<ScriptWithSections | null> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the script
  const { data: script, error } = await supabase
    .from('scripts')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (isNotFoundError(error)) {
      return null // Not found
    }
    logError('Error fetching script: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch script')
  }

  // Fetch sections for this script
  const { data: sections, error: sectionsError } = await supabase
    .from('sections')
    .select('*')
    .eq('script_id', id)
    .is('deleted_at', null)
    .order('order', { ascending: true })

  if (sectionsError) {
    logError('Error fetching sections: ' + (sectionsError instanceof Error ? sectionsError.message : JSON.stringify(sectionsError)))
    throw new Error('Failed to fetch sections')
  }

  return {
    ...script,
    sections: sections as Section[] || []
  }
}

/**
 * Create a new script
 */
export async function createScript(data: CreateScriptData): Promise<Script> {
  const { supabase, parishId } = await createAuthenticatedClient()

  // Check permissions (admin only)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireManageParishSettings(user.id, parishId)

  // Get max order for this event type
  const { data: existingScripts } = await supabase
    .from('scripts')
    .select('order')
    .eq('event_type_id', data.event_type_id)
    .is('deleted_at', null)
    .order('order', { ascending: false })
    .limit(1)

  const maxOrder = existingScripts?.[0]?.order ?? -1
  const newOrder = maxOrder + 1

  // Insert script
  const { data: script, error } = await supabase
    .from('scripts')
    .insert([
      {
        event_type_id: data.event_type_id,
        name: data.name,
        description: data.description ?? null,
        order: newOrder
      }
    ])
    .select()
    .single()

  if (error) {
    logError('Error creating script: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to create script')
  }

  revalidatePath(`/settings/event-types/${data.event_type_id}`)
  revalidatePath(`/settings/event-types/${data.event_type_id}/scripts`)
  return script
}

/**
 * Update an existing script
 */
export async function updateScript(id: string, data: UpdateScriptData): Promise<Script> {
  const { supabase, parishId } = await createAuthenticatedClient()

  // Check permissions (admin only)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireManageParishSettings(user.id, parishId)

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(data).filter(([_key, value]) => value !== undefined)
  )

  const { data: script, error } = await supabase
    .from('scripts')
    .update(updateData)
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single()

  if (error) {
    logError('Error updating script: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to update script')
  }

  revalidatePath(`/settings/event-types/${script.event_type_id}`)
  revalidatePath(`/settings/event-types/${script.event_type_id}/scripts`)
  revalidatePath(`/settings/event-types/${script.event_type_id}/scripts/${id}`)
  return script
}

/**
 * Delete a script
 * This will cascade delete all sections
 */
export async function deleteScript(id: string): Promise<void> {
  const { supabase, parishId } = await createAuthenticatedClient()

  // Check permissions (admin only)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireManageParishSettings(user.id, parishId)

  // Get event_type_id for revalidation
  const { data: script } = await supabase
    .from('scripts')
    .select('event_type_id')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!script) {
    throw new Error('Script not found')
  }

  // Hard delete (will cascade to sections)
  const { error } = await supabase
    .from('scripts')
    .delete()
    .eq('id', id)

  if (error) {
    logError('Error deleting script: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to delete script')
  }

  revalidatePath(`/settings/event-types/${script.event_type_id}`)
  revalidatePath(`/settings/event-types/${script.event_type_id}/scripts`)
}

/**
 * Reorder scripts
 * Updates the order field for all provided scripts
 */
export async function reorderScripts(eventTypeId: string, orderedIds: string[]): Promise<void> {
  const { supabase, parishId } = await createAuthenticatedClient()

  // Check permissions (admin only)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireManageParishSettings(user.id, parishId)

  // Update each script's order
  const updates = orderedIds.map((id, index) =>
    supabase
      .from('scripts')
      .update({ order: index })
      .eq('id', id)
      .eq('event_type_id', eventTypeId)
  )

  await Promise.all(updates)

  revalidatePath(`/settings/event-types/${eventTypeId}`)
  revalidatePath(`/settings/event-types/${eventTypeId}/scripts`)
}
