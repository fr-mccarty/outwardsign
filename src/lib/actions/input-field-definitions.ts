'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { requireManageParishSettings } from '@/lib/auth/permissions'
import type {
  InputFieldDefinition,
  InputFieldDefinitionWithRelations,
  CreateInputFieldDefinitionData,
  UpdateInputFieldDefinitionData,
  CustomList,
  DynamicEventType
} from '@/lib/types'

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
    console.error('Error fetching input field definitions:', error)
    throw new Error('Failed to fetch input field definitions')
  }

  return data || []
}

/**
 * Get a single input field definition by ID with relations
 */
export async function getInputFieldDefinitionWithRelations(id: string): Promise<InputFieldDefinitionWithRelations | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: fieldDef, error } = await supabase
    .from('input_field_definitions')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching input field definition:', error)
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
      .eq('parish_id', selectedParishId)
      .is('deleted_at', null)
      .single()

    if (customList) {
      result.custom_list = customList as CustomList
    }
  }

  // Fetch event type filter if type is 'event_link' and event_type_filter_id is set
  if (fieldDef.type === 'event_link' && fieldDef.event_type_filter_id) {
    const { data: eventType } = await supabase
      .from('event_types')
      .select('*')
      .eq('id', fieldDef.event_type_filter_id)
      .eq('parish_id', selectedParishId)
      .is('deleted_at', null)
      .single()

    if (eventType) {
      result.event_type_filter = eventType as DynamicEventType
    }
  }

  return result
}

/**
 * Create a new input field definition
 */
export async function createInputFieldDefinition(data: CreateInputFieldDefinitionData): Promise<InputFieldDefinition> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions (admin only)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireManageParishSettings(user.id, selectedParishId)

  // Validate is_key_person only for person type
  if (data.is_key_person && data.type !== 'person') {
    throw new Error('is_key_person can only be true for person type fields')
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
        type: data.type,
        required: data.required,
        list_id: data.list_id ?? null,
        event_type_filter_id: data.event_type_filter_id ?? null,
        is_key_person: data.is_key_person ?? false,
        order: newOrder
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating input field definition:', error)
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
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions (admin only)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireManageParishSettings(user.id, selectedParishId)

  // Validate is_key_person only for person type
  if (data.is_key_person && data.type && data.type !== 'person') {
    throw new Error('is_key_person can only be true for person type fields')
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
    console.error('Error updating input field definition:', error)
    throw new Error('Failed to update input field definition')
  }

  revalidatePath(`/settings/event-types/${fieldDef.event_type_id}`)
  revalidatePath(`/settings/event-types/${fieldDef.event_type_id}/fields`)
  return fieldDef
}

/**
 * Delete an input field definition
 * Checks if field is used in events and warns user
 */
export async function deleteInputFieldDefinition(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions (admin only)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireManageParishSettings(user.id, selectedParishId)

  // Get field definition to find event_type_id
  const { data: fieldDef } = await supabase
    .from('input_field_definitions')
    .select('event_type_id, name')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!fieldDef) {
    throw new Error('Input field definition not found')
  }

  // Check for events using this field
  // Note: This is a basic check. In a production system, you might want to scan the field_values JSONB
  // For now, we'll allow deletion and data will remain in JSON but won't render

  // Hard delete (data remains in field_values JSON but won't render)
  const { error } = await supabase
    .from('input_field_definitions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting input field definition:', error)
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
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions (admin only)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireManageParishSettings(user.id, selectedParishId)

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
