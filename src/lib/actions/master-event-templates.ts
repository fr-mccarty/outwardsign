'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import type {
  MasterEventTemplate,
  MasterEventTemplateWithRelations,
  UpdateMasterEventTemplateData,
  TemplateData
} from '@/lib/types'
import { logError, logInfo } from '@/lib/utils/console'
import { getEventWithRelations } from './master-events'

/**
 * Get all templates across all event types with event type information
 */
export async function getAllTemplates(): Promise<MasterEventTemplateWithRelations[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('master_event_templates')
    .select(`
      *,
      event_type:event_types(*)
    `)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    logError('Error fetching all templates: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch templates')
  }

  return data || []
}

/**
 * Get all templates for a specific event type
 */
export async function getTemplatesByEventType(eventTypeId: string): Promise<MasterEventTemplate[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('master_event_templates')
    .select('*')
    .eq('parish_id', selectedParishId)
    .eq('event_type_id', eventTypeId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    logError('Error fetching templates by event type: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch templates')
  }

  return data || []
}

/**
 * Get a single template by ID with event type information
 */
export async function getTemplate(id: string): Promise<MasterEventTemplateWithRelations | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('master_event_templates')
    .select(`
      *,
      event_type:event_types(*)
    `)
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    logError('Error fetching template: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch template')
  }

  return data
}

/**
 * Save a master event as a template
 */
export async function createTemplateFromEvent(
  masterEventId: string,
  templateName: string,
  templateDescription?: string
): Promise<{ success: boolean; template?: MasterEventTemplate; error?: string }> {
  try {
    const selectedParishId = await requireSelectedParish()
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

    // Build template_data JSONB
    const templateData: TemplateData = {
      field_values: masterEvent.field_values,
      presider_id: masterEvent.presider_id,
      homilist_id: masterEvent.homilist_id,
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

        templateData.calendar_events[fieldDef.name] = {
          location_id: calendarEvent.location_id,
          is_all_day: calendarEvent.is_all_day,
          duration_days: durationDays
        }
      }
    }

    // Insert template
    const { data: template, error } = await supabase
      .from('master_event_templates')
      .insert([
        {
          parish_id: selectedParishId,
          event_type_id: masterEvent.event_type_id,
          name: templateName,
          description: templateDescription || null,
          template_data: templateData,
          created_by: userId
        }
      ])
      .select()
      .single()

    if (error) {
      logError('Error creating template: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
      return { success: false, error: 'Failed to create template' }
    }

    logInfo('Template created successfully: ' + JSON.stringify({ templateId: template.id, templateName }))
    revalidatePath(`/events/${masterEvent.event_type_id}`)
    return { success: true, template }
  } catch (error) {
    logError('Error in createTemplateFromEvent: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Update a template's name or description (NOT template_data)
 */
export async function updateTemplate(
  id: string,
  data: UpdateMasterEventTemplateData
): Promise<{ success: boolean; error?: string }> {
  try {
    const selectedParishId = await requireSelectedParish()
    await ensureJWTClaims()
    const supabase = await createClient()

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
      .from('master_event_templates')
      .update(updateData)
      .eq('id', id)
      .eq('parish_id', selectedParishId)

    if (error) {
      logError('Error updating template: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
      return { success: false, error: 'Failed to update template' }
    }

    logInfo('Template updated successfully: ' + JSON.stringify({ templateId: id }))
    revalidatePath('/events')
    return { success: true }
  } catch (error) {
    logError('Error in updateTemplate: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Soft delete a template
 */
export async function deleteTemplate(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const selectedParishId = await requireSelectedParish()
    await ensureJWTClaims()
    const supabase = await createClient()

    const { error } = await supabase
      .from('master_event_templates')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('parish_id', selectedParishId)

    if (error) {
      logError('Error deleting template: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
      return { success: false, error: 'Failed to delete template' }
    }

    logInfo('Template deleted successfully: ' + JSON.stringify({ templateId: id }))
    revalidatePath('/events')
    return { success: true }
  } catch (error) {
    logError('Error in deleteTemplate: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    return { success: false, error: 'An unexpected error occurred' }
  }
}
