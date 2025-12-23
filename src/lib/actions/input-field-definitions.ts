'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { requireManageParishSettings } from '@/lib/auth/permissions'
import {
  InputFieldDefinition,
  InputFieldDefinitionWithRelations,
  CreateInputFieldDefinitionData,
  UpdateInputFieldDefinitionData,
  CustomList,
} from '@/lib/types'
import { logError } from '@/lib/utils/console'
import {
  createAuthenticatedClient,
  isNotFoundError,
} from './server-action-utils'


/**
 * Get all input field definitions for an event type
 */
export async function getInputFieldDefinitions(eventTypeId: string): Promise<InputFieldDefinition[]> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('input_field_definitions')
    .select('*')
    .eq('event_type_id', eventTypeId)
    .is('deleted_at', null)
    .order('order', { ascending: true })

  if (error) {
    logError('Error fetching input field definitions: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch input field definitions')
  }

  return data || []
}

/**
 * Get a single input field definition by ID with relations
 */
export async function getInputFieldDefinitionWithRelations(id: string): Promise<InputFieldDefinitionWithRelations | null> {
  const { supabase, parishId } = await createAuthenticatedClient()

  const { data: fieldDef, error } = await supabase
    .from('input_field_definitions')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (isNotFoundError(error)) {
      return null // Not found
    }
    logError('Error fetching input field definition: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch input field definition')
  }

  const result: InputFieldDefinitionWithRelations = {
    ...fieldDef
  }

  // Fetch custom list if type is 'list_item' and list_id is set
  if (fieldDef.type === 'list_item' && fieldDef.list_id) {
    const { data: customList } = await supabase
      .from('custom_lists')
      .select('*')
      .eq('id', fieldDef.list_id)
      .eq('parish_id', parishId)
      .is('deleted_at', null)
      .single()

    if (customList) {
      result.custom_list = customList as CustomList
    }
  }

  return result
}

/**
 * Create a new input field definition
 */
export async function createInputFieldDefinition(data: CreateInputFieldDefinitionData): Promise<InputFieldDefinition> {
  const { supabase, parishId } = await createAuthenticatedClient()

  // Check permissions (admin only)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireManageParishSettings(user.id, parishId)

  // Validate is_key_person only for person type
  if (data.is_key_person && data.type !== 'person') {
    throw new Error('is_key_person can only be true for person type fields')
  }

  // Validate is_primary only for calendar_event type
  if (data.is_primary && data.type !== 'calendar_event') {
    throw new Error('is_primary can only be true for calendar_event type fields')
  }

  // If marking as primary, check if there's already a primary calendar_event field
  if (data.is_primary && data.type === 'calendar_event') {
    const { data: existingPrimary } = await supabase
      .from('input_field_definitions')
      .select('id')
      .eq('event_type_id', data.event_type_id)
      .eq('type', 'calendar_event')
      .eq('is_primary', true)
      .is('deleted_at', null)
      .single()

    if (existingPrimary) {
      throw new Error('Only one calendar_event field can be marked as primary per event type')
    }
  }

  // Get max order for this event type
  const { data: existingFields } = await supabase
    .from('input_field_definitions')
    .select('order')
    .eq('event_type_id', data.event_type_id)
    .is('deleted_at', null)
    .order('order', { ascending: false })
    .limit(1)

  const maxOrder = existingFields?.[0]?.order ?? -1
  const newOrder = maxOrder + 1

  // Insert input field definition
  const { data: fieldDef, error } = await supabase
    .from('input_field_definitions')
    .insert([
      {
        event_type_id: data.event_type_id,
        name: data.name,
        property_name: data.property_name,
        type: data.type,
        required: data.required,
        list_id: data.list_id ?? null,
        is_key_person: data.is_key_person ?? false,
        is_primary: data.is_primary ?? false,
        order: newOrder
      }
    ])
    .select()
    .single()

  if (error) {
    logError('Error creating input field definition: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to create input field definition')
  }

  revalidatePath(`/settings/event-types/${data.event_type_id}`)
  revalidatePath(`/settings/event-types/${data.event_type_id}/fields`)
  return fieldDef
}

/**
 * Update an existing input field definition
 */
export async function updateInputFieldDefinition(id: string, data: UpdateInputFieldDefinitionData): Promise<InputFieldDefinition> {
  const { supabase, parishId } = await createAuthenticatedClient()

  // Check permissions (admin only)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireManageParishSettings(user.id, parishId)

  // Validate is_key_person only for person type
  if (data.is_key_person && data.type && data.type !== 'person') {
    throw new Error('is_key_person can only be true for person type fields')
  }

  // Validate is_primary only for calendar_event type
  if (data.is_primary && data.type && data.type !== 'calendar_event') {
    throw new Error('is_primary can only be true for calendar_event type fields')
  }

  // If marking as primary, check if there's already a primary calendar_event field
  if (data.is_primary && data.type === 'calendar_event') {
    // Get the field we're updating to find event_type_id
    const { data: currentField } = await supabase
      .from('input_field_definitions')
      .select('event_type_id')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (currentField) {
      const { data: existingPrimary } = await supabase
        .from('input_field_definitions')
        .select('id')
        .eq('event_type_id', currentField.event_type_id)
        .eq('type', 'calendar_event')
        .eq('is_primary', true)
        .neq('id', id) // Exclude current field
        .is('deleted_at', null)
        .single()

      if (existingPrimary) {
        throw new Error('Only one calendar_event field can be marked as primary per event type')
      }
    }
  }

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(data).filter(([_key, value]) => value !== undefined)
  )

  const { data: fieldDef, error } = await supabase
    .from('input_field_definitions')
    .update(updateData)
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single()

  if (error) {
    logError('Error updating input field definition: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to update input field definition')
  }

  revalidatePath(`/settings/event-types/${fieldDef.event_type_id}`)
  revalidatePath(`/settings/event-types/${fieldDef.event_type_id}/fields`)
  return fieldDef
}

/**
 * Count how many events use a specific custom field
 * Returns the count of events that have a value set for this field
 */
export async function countFieldUsage(fieldId: string): Promise<number> {
  const { supabase } = await createAuthenticatedClient()

  // Get field definition to find event_type_id and property_name
  const { data: fieldDef } = await supabase
    .from('input_field_definitions')
    .select('event_type_id, property_name')
    .eq('id', fieldId)
    .is('deleted_at', null)
    .single()

  if (!fieldDef) {
    return 0
  }

  // Count events that have this property_name key in field_values
  // Using raw SQL for JSONB key existence check
  const { count, error } = await supabase
    .from('master_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type_id', fieldDef.event_type_id)
    .is('deleted_at', null)
    .not('field_values', 'is', null)
    .filter(`field_values->>${fieldDef.property_name}`, 'not.is', null)

  if (error) {
    logError('Error counting field usage: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    return 0 // Fail gracefully
  }

  return count ?? 0
}

/**
 * Delete an input field definition
 * Prevents deletion if field is used in any events
 */
export async function deleteInputFieldDefinition(id: string): Promise<void> {
  const { supabase, parishId } = await createAuthenticatedClient()

  // Check permissions (admin only)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireManageParishSettings(user.id, parishId)

  // Get field definition to find event_type_id
  const { data: fieldDef } = await supabase
    .from('input_field_definitions')
    .select('event_type_id, name, property_name')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!fieldDef) {
    throw new Error('Input field definition not found')
  }

  // Check for events using this field
  const usageCount = await countFieldUsage(id)

  if (usageCount > 0) {
    throw new Error(
      `Cannot delete field "${fieldDef.name}". It is used in ${usageCount} event${usageCount === 1 ? '' : 's'}. ` +
      `Please remove this field from all events before deleting the definition.`
    )
  }

  // Safe to delete - no events are using this field
  const { error } = await supabase
    .from('input_field_definitions')
    .delete()
    .eq('id', id)

  if (error) {
    logError('Error deleting input field definition: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to delete input field definition')
  }

  revalidatePath(`/settings/event-types/${fieldDef.event_type_id}`)
  revalidatePath(`/settings/event-types/${fieldDef.event_type_id}/fields`)
}

/**
 * Reorder input field definitions
 * Updates the order field for all provided field definitions
 */
export async function reorderInputFieldDefinitions(eventTypeId: string, orderedIds: string[]): Promise<void> {
  const { supabase, parishId } = await createAuthenticatedClient()

  // Check permissions (admin only)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireManageParishSettings(user.id, parishId)

  // Update each field definition's order
  const updates = orderedIds.map((id, index) =>
    supabase
      .from('input_field_definitions')
      .update({ order: index })
      .eq('id', id)
      .eq('event_type_id', eventTypeId)
  )

  await Promise.all(updates)

  revalidatePath(`/settings/event-types/${eventTypeId}`)
  revalidatePath(`/settings/event-types/${eventTypeId}/fields`)
}
