'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import {
  EventPreset,
  EventPresetWithRelations,
  UpdateEventPresetData,
  PresetData
} from '@/lib/types'
import { logError, logInfo } from '@/lib/utils/console'
import { getEventWithRelations } from './parish-events'
import {
  createAuthenticatedClient,
  isNotFoundError,
} from './server-action-utils'


/**
 * Get all presets across all event types with event type information
 */
export async function getAllPresets(): Promise<EventPresetWithRelations[]> {
  const { supabase, parishId } = await createAuthenticatedClient()

  const { data, error } = await supabase
    .from('event_presets')
    .select(`
      *,
      event_type:event_types(*)
    `)
    .eq('parish_id', parishId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    logError('Error fetching all presets: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch presets')
  }

  return data || []
}

/**
 * Get all presets for a specific event type
 */
export async function getPresetsByEventType(eventTypeId: string): Promise<EventPreset[]> {
  const { supabase, parishId } = await createAuthenticatedClient()

  const { data, error } = await supabase
    .from('event_presets')
    .select('*')
    .eq('parish_id', parishId)
    .eq('event_type_id', eventTypeId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    logError('Error fetching presets by event type: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch presets')
  }

  return data || []
}

/**
 * Get a single preset by ID with event type information
 */
export async function getPreset(id: string): Promise<EventPresetWithRelations | null> {
  const { supabase, parishId } = await createAuthenticatedClient()

  const { data, error } = await supabase
    .from('event_presets')
    .select(`
      *,
      event_type:event_types(*)
    `)
    .eq('id', id)
    .eq('parish_id', parishId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (isNotFoundError(error)) {
      return null // Not found
    }
    logError('Error fetching preset: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch preset')
  }

  return data
}

/**
 * Save a master event as a preset
 */
export async function createPresetFromEvent(
  masterEventId: string,
  presetName: string,
  presetDescription?: string
): Promise<{ success: boolean; preset?: EventPreset; error?: string }> {
  try {
    const parishId = await requireSelectedParish()
    const supabase = await createClient()
    await ensureJWTClaims()

    // Get current user for created_by field
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || null

    // Fetch master event with relations
    const masterEvent = await getEventWithRelations(masterEventId)
    if (!masterEvent) {
      return { success: false, error: 'Event not found' }
    }

    // Build preset_data JSONB
    const presetData: PresetData = {
      field_values: masterEvent.field_values,
      presider_id: null,
      homilist_id: null,
      calendar_events: {}
    }

    // Process calendar events - store location and is_all_day, NOT datetimes
    for (const calendarEvent of masterEvent.calendar_events) {
      // Find the field definition name for this calendar event
      const fieldDef = masterEvent.event_type.input_field_definitions?.find(
        f => f.id === calendarEvent.input_field_definition_id
      )

      if (fieldDef) {
        // Calculate duration_days for multi-day all-day events
        let durationDays: number | null = null
        if (calendarEvent.is_all_day && calendarEvent.end_datetime) {
          const start = new Date(calendarEvent.start_datetime)
          const end = new Date(calendarEvent.end_datetime)
          const diffTime = Math.abs(end.getTime() - start.getTime())
          durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        }

        presetData.calendar_events[fieldDef.name] = {
          location_id: calendarEvent.location_id,
          is_all_day: calendarEvent.is_all_day,
          duration_days: durationDays
        }
      }
    }

    // Insert preset
    const { data: preset, error } = await supabase
      .from('event_presets')
      .insert([
        {
          parish_id: parishId,
          event_type_id: masterEvent.event_type_id,
          name: presetName,
          description: presetDescription || null,
          preset_data: presetData,
          created_by: userId
        }
      ])
      .select()
      .single()

    if (error) {
      logError('Error creating preset: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
      return { success: false, error: 'Failed to create preset' }
    }

    logInfo('Preset created successfully: ' + JSON.stringify({ presetId: preset.id, presetName }))
    revalidatePath(`/events/${masterEvent.event_type_id}`)
    return { success: true, preset }
  } catch (error) {
    logError('Error in createPresetFromEvent: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Update a preset's name or description (NOT preset_data)
 */
export async function updatePreset(
  id: string,
  data: UpdateEventPresetData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, parishId } = await createAuthenticatedClient()

    // Build update object
    const updateData: { name?: string; description?: string | null } = {}
    if (data.name !== undefined) {
      updateData.name = data.name
    }
    if (data.description !== undefined) {
      updateData.description = data.description
    }

    if (Object.keys(updateData).length === 0) {
      return { success: true }
    }

    const { error } = await supabase
      .from('event_presets')
      .update(updateData)
      .eq('id', id)
      .eq('parish_id', parishId)

    if (error) {
      logError('Error updating preset: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
      return { success: false, error: 'Failed to update preset' }
    }

    logInfo('Preset updated successfully: ' + JSON.stringify({ presetId: id }))
    revalidatePath('/events')
    return { success: true }
  } catch (error) {
    logError('Error in updatePreset: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Soft delete a preset
 */
export async function deletePreset(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, parishId } = await createAuthenticatedClient()

    const { error } = await supabase
      .from('event_presets')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('parish_id', parishId)

    if (error) {
      logError('Error deleting preset: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
      return { success: false, error: 'Failed to delete preset' }
    }

    logInfo('Preset deleted successfully: ' + JSON.stringify({ presetId: id }))
    revalidatePath('/events')
    return { success: true }
  } catch (error) {
    logError('Error in deletePreset: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    return { success: false, error: 'An unexpected error occurred' }
  }
}
