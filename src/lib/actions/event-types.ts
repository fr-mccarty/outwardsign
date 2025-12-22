'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { requireManageParishSettings } from '@/lib/auth/permissions'
import { logError } from '@/lib/utils/console'
import type {
  EventType,
  EventTypeWithRelations,
  CreateEventTypeData,
  UpdateEventTypeData,
  InputFieldDefinition,
  Script
} from '@/lib/types'
import { generateSlug } from '@/lib/utils/formatters'

export interface EventTypeFilterParams {
  search?: string
  sort?: 'order_asc' | 'order_desc' | 'name_asc' | 'name_desc' | 'created_asc' | 'created_desc'
  system_type?: 'mass' | 'special-liturgy' | 'event'
}

/**
 * Get active (non-deleted) event types for the selected parish
 * Used by picker components
 */
export async function getActiveEventTypes(): Promise<EventType[]> {
  return getEventTypes({ sort: 'order_asc' })
}

/**
 * Get all event types for the selected parish
 */
export async function getEventTypes(filters?: EventTypeFilterParams): Promise<EventType[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  let query = supabase
    .from('event_types')
    .select('*')
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)

  // Apply system_type filter
  if (filters?.system_type) {
    query = query.eq('system_type', filters.system_type)
  }

  // Apply sorting
  if (filters?.sort === 'order_asc' || !filters?.sort) {
    // Default to order ascending
    query = query.order('order', { ascending: true })
  } else if (filters?.sort === 'order_desc') {
    query = query.order('order', { ascending: false })
  } else if (filters?.sort === 'name_asc') {
    query = query.order('name', { ascending: true })
  } else if (filters?.sort === 'name_desc') {
    query = query.order('name', { ascending: false })
  } else if (filters?.sort === 'created_asc') {
    query = query.order('created_at', { ascending: true })
  } else if (filters?.sort === 'created_desc') {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    logError('Error fetching event types: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch event types')
  }

  let eventTypes = data || []

  // Apply search filter (if provided)
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
    eventTypes = eventTypes.filter(et =>
      et.name.toLowerCase().includes(searchTerm)
    )
  }

  return eventTypes
}

/**
 * Get a single event type by ID
 */
export async function getEventType(id: string): Promise<EventType | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('event_types')
    .select('*')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    logError('Error fetching event type: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch event type')
  }

  return data
}

/**
 * Get a single event type by slug
 */
export async function getEventTypeBySlug(slug: string): Promise<EventType | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('event_types')
    .select('*')
    .eq('slug', slug)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    logError('Error fetching event type by slug: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch event type by slug')
  }

  return data
}

/**
 * Get event type with all related data (input field definitions and scripts)
 */
export async function getEventTypeWithRelations(id: string): Promise<EventTypeWithRelations | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the event type
  const { data: eventType, error } = await supabase
    .from('event_types')
    .select('*')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    logError('Error fetching event type: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch event type')
  }

  // Fetch related data in parallel
  const [inputFieldsData, scriptsData] = await Promise.all([
    supabase
      .from('input_field_definitions')
      .select('*')
      .eq('event_type_id', id)
      .is('deleted_at', null)
      .order('order', { ascending: true }),
    supabase
      .from('scripts')
      .select('*')
      .eq('event_type_id', id)
      .is('deleted_at', null)
      .order('order', { ascending: true })
  ])

  if (inputFieldsData.error) {
    logError('Error fetching input field definitions: ' + (inputFieldsData.error instanceof Error ? inputFieldsData.error.message : JSON.stringify(inputFieldsData.error)))
    throw new Error('Failed to fetch input field definitions')
  }

  if (scriptsData.error) {
    logError('Error fetching scripts: ' + (scriptsData.error instanceof Error ? scriptsData.error.message : JSON.stringify(scriptsData.error)))
    throw new Error('Failed to fetch scripts')
  }

  return {
    ...eventType,
    input_field_definitions: inputFieldsData.data as InputFieldDefinition[] || [],
    scripts: scriptsData.data as Script[] || []
  }
}

/**
 * Get event type with all related data by slug
 */
export async function getEventTypeWithRelationsBySlug(slug: string): Promise<EventTypeWithRelations | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the event type by slug
  const { data: eventType, error } = await supabase
    .from('event_types')
    .select('*')
    .eq('slug', slug)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    logError('Error fetching event type by slug: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch event type by slug')
  }

  // Fetch related data in parallel
  const [inputFieldsData, scriptsData] = await Promise.all([
    supabase
      .from('input_field_definitions')
      .select('*')
      .eq('event_type_id', eventType.id)
      .is('deleted_at', null)
      .order('order', { ascending: true }),
    supabase
      .from('scripts')
      .select('*')
      .eq('event_type_id', eventType.id)
      .is('deleted_at', null)
      .order('order', { ascending: true })
  ])

  if (inputFieldsData.error) {
    logError('Error fetching input field definitions: ' + (inputFieldsData.error instanceof Error ? inputFieldsData.error.message : JSON.stringify(inputFieldsData.error)))
    throw new Error('Failed to fetch input field definitions')
  }

  if (scriptsData.error) {
    logError('Error fetching scripts: ' + (scriptsData.error instanceof Error ? scriptsData.error.message : JSON.stringify(scriptsData.error)))
    throw new Error('Failed to fetch scripts')
  }

  return {
    ...eventType,
    input_field_definitions: inputFieldsData.data as InputFieldDefinition[] || [],
    scripts: scriptsData.data as Script[] || []
  }
}

/**
 * Create a new event type
 */
export async function createEventType(data: CreateEventTypeData): Promise<EventType> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions (admin only)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireManageParishSettings(user.id, selectedParishId)

  // Get max order to assign next order
  const { data: existingEventTypes } = await supabase
    .from('event_types')
    .select('order')
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .order('order', { ascending: false })
    .limit(1)

  const maxOrder = existingEventTypes?.[0]?.order ?? -1
  const newOrder = maxOrder + 1

  // Generate slug from name (or use provided slug)
  const slug = data.slug || generateSlug(data.name)

  // Check slug uniqueness and append number if needed
  let slugCounter = 1
  let isUnique = false
  let finalSlug = slug

  while (!isUnique) {
    const { data: existingWithSlug } = await supabase
      .from('event_types')
      .select('id')
      .eq('parish_id', selectedParishId)
      .eq('slug', finalSlug)
      .is('deleted_at', null)
      .limit(1)

    if (!existingWithSlug || existingWithSlug.length === 0) {
      isUnique = true
    } else {
      slugCounter++
      finalSlug = `${slug}-${slugCounter}`
    }
  }

  // Insert event type
  const { data: eventType, error } = await supabase
    .from('event_types')
    .insert([
      {
        parish_id: selectedParishId,
        name: data.name,
        description: data.description || null,
        icon: data.icon,
        slug: finalSlug,
        system_type: data.system_type,
        order: newOrder
      }
    ])
    .select()
    .single()

  if (error) {
    logError('Error creating event type: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to create event type')
  }

  revalidatePath('/settings/event-types')
  revalidatePath('/dashboard')
  return eventType
}

/**
 * Update an existing event type
 */
export async function updateEventType(id: string, data: UpdateEventTypeData): Promise<EventType> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions (admin only)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireManageParishSettings(user.id, selectedParishId)

  // If slug is being updated, validate uniqueness
  if (data.slug !== undefined && data.slug !== null) {
    const { data: existingWithSlug } = await supabase
      .from('event_types')
      .select('id')
      .eq('parish_id', selectedParishId)
      .eq('slug', data.slug)
      .neq('id', id) // Exclude current event type
      .is('deleted_at', null)
      .limit(1)

    if (existingWithSlug && existingWithSlug.length > 0) {
      throw new Error('This slug already exists. Please choose a different slug.')
    }
  }

  // Build update object from only defined values
  const updateData = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(data).filter(([_key, value]) => value !== undefined)
  )

  const { data: eventType, error } = await supabase
    .from('event_types')
    .update(updateData)
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .select()
    .single()

  if (error) {
    logError('Error updating event type: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to update event type')
  }

  revalidatePath('/settings/event-types')
  revalidatePath(`/settings/event-types/${id}`)
  return eventType
}

/**
 * Delete an event type
 * Checks if there are existing events using this type first
 */
export async function deleteEventType(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions (admin only)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireManageParishSettings(user.id, selectedParishId)

  // Check for existing events using this event type
  const { data: events } = await supabase
    .from('events')
    .select('id')
    .eq('event_type_id', id)
    .is('deleted_at', null)
    .limit(1)

  if (events && events.length > 0) {
    throw new Error('Cannot delete event type with existing events. Delete events first.')
  }

  // Hard delete (will cascade to input_field_definitions, scripts, sections)
  const { error } = await supabase
    .from('event_types')
    .delete()
    .eq('id', id)
    .eq('parish_id', selectedParishId)

  if (error) {
    logError('Error deleting event type: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to delete event type')
  }

  revalidatePath('/settings/event-types')
  revalidatePath('/dashboard')
}

/**
 * Reorder event types
 * Updates the order field for all provided event types
 */
export async function reorderEventTypes(orderedIds: string[]): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check permissions (admin only)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }
  await requireManageParishSettings(user.id, selectedParishId)

  // Update each event type's order
  const updates = orderedIds.map((id, index) =>
    supabase
      .from('event_types')
      .update({ order: index })
      .eq('id', id)
      .eq('parish_id', selectedParishId)
  )

  await Promise.all(updates)

  revalidatePath('/settings/event-types')
  revalidatePath('/dashboard')
}

/**
 * Get event types filtered by system type
 */
export async function getEventTypesBySystemType(
  systemType: 'mass' | 'special-liturgy' | 'event'
): Promise<EventType[]> {
  return getEventTypes({ system_type: systemType })
}

