/**
 * Event Presets Seed Data - Default presets for parish events
 *
 * Creates event_presets for Religious Education and Staff Meeting
 * event types with a default location set to Parish Church.
 *
 * Preset Structure:
 * - preset_data.calendar_events stores location preferences by field name
 * - These presets make it easy to create new events with pre-filled locations
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { logError, logSuccess } from '@/lib/utils/console'

interface SeedEventPresetsOptions {
  parishId: string
  defaultLocationId: string | null
}

/**
 * Seeds event presets for Religious Education and Staff Meeting event types.
 *
 * @param supabase - Any Supabase client (server, service role, etc.)
 * @param options - Parish ID and optional default location ID
 */
export async function seedEventPresetsForParish(
  supabase: SupabaseClient,
  options: SeedEventPresetsOptions
) {
  const { parishId, defaultLocationId } = options

  // Fetch Religious Education and Staff Meeting event types
  const { data: eventTypes, error: eventTypesError } = await supabase
    .from('event_types')
    .select('id, slug, name, input_field_definitions!input_field_definitions_event_type_id_fkey(id, name, type, is_primary)')
    .eq('parish_id', parishId)
    .in('slug', ['religious-education', 'staff-meetings'])
    .is('deleted_at', null)

  if (eventTypesError || !eventTypes || eventTypes.length === 0) {
    logError(`Error fetching event types for presets: ${eventTypesError?.message || 'No event types found'}`)
    return { success: false, presetsCreated: 0 }
  }

  let presetsCreated = 0

  for (const eventType of eventTypes) {
    // Find the primary calendar_event field for this event type
    const calendarField = eventType.input_field_definitions?.find(
      (f: { type: string; is_primary: boolean }) => f.type === 'calendar_event' && f.is_primary
    )

    if (!calendarField) {
      logError(`No primary calendar_event field found for ${eventType.name}`)
      continue
    }

    // Build preset_data with location preference
    const presetData = {
      field_values: {},
      presider_id: null,
      homilist_id: null,
      calendar_events: defaultLocationId ? {
        [calendarField.name]: {
          location_id: defaultLocationId,
          is_all_day: false,
          duration_days: null
        }
      } : {}
    }

    // Create preset name based on event type
    const presetName = eventType.slug === 'religious-education'
      ? 'Standard Class Session'
      : 'Standard Meeting'

    const presetDescription = eventType.slug === 'religious-education'
      ? 'Default preset for religious education classes at the parish church'
      : 'Default preset for staff meetings at the parish church'

    // Insert the preset
    const { error: insertError } = await supabase
      .from('event_presets')
      .insert({
        parish_id: parishId,
        event_type_id: eventType.id,
        name: presetName,
        description: presetDescription,
        preset_data: presetData,
        created_by: null // System preset
      })

    if (insertError) {
      logError(`Error creating preset for ${eventType.name}: ${insertError.message}`)
      continue
    }

    presetsCreated++
    logSuccess(`Created preset: ${presetName} for ${eventType.name}`)
  }

  return { success: true, presetsCreated }
}
