'use server'

import { createAuthenticatedClient } from './server-action-utils'
import { logError } from '@/lib/utils/console'

export interface EventTypeForDebug {
  id: string
  name: string
  slug: string
  system_type: string
}

export interface ScriptForDebug {
  id: string
  name: string
  description: string | null
  order: number
  event_type_id: string
}

export interface SectionForDebug {
  id: string
  name: string
  section_type: string | null
  content: string
  page_break_after: boolean
  order: number
}

export interface ScriptWithSectionsForDebug extends ScriptForDebug {
  sections: SectionForDebug[]
  event_type: {
    id: string
    name: string
    slug: string
  }
}

/**
 * Get all event types for debugging (minimal data)
 */
export async function getEventTypesForDebug(): Promise<EventTypeForDebug[]> {
  const { supabase, parishId } = await createAuthenticatedClient()

  const { data, error } = await supabase
    .from('event_types')
    .select('id, name, slug, system_type')
    .eq('parish_id', parishId)
    .is('deleted_at', null)
    .order('order', { ascending: true })

  if (error) {
    logError('Error fetching event types for debug: ' + error.message)
    throw new Error('Failed to fetch event types')
  }

  return data || []
}

/**
 * Get scripts for a specific event type
 */
export async function getScriptsForEventType(eventTypeId: string): Promise<ScriptForDebug[]> {
  const { supabase, parishId } = await createAuthenticatedClient()

  // Verify the event type belongs to this parish
  const { data: eventType } = await supabase
    .from('event_types')
    .select('id')
    .eq('id', eventTypeId)
    .eq('parish_id', parishId)
    .single()

  if (!eventType) {
    throw new Error('Event type not found')
  }

  const { data, error } = await supabase
    .from('scripts')
    .select('id, name, description, order, event_type_id')
    .eq('event_type_id', eventTypeId)
    .is('deleted_at', null)
    .order('order', { ascending: true })

  if (error) {
    logError('Error fetching scripts for debug: ' + error.message)
    throw new Error('Failed to fetch scripts')
  }

  return data || []
}

/**
 * Get a script with all its sections for debugging
 */
export async function getScriptWithSectionsForDebug(scriptId: string): Promise<ScriptWithSectionsForDebug | null> {
  const { supabase, parishId } = await createAuthenticatedClient()

  // Get the script with its event type
  const { data: script, error: scriptError } = await supabase
    .from('scripts')
    .select(`
      id,
      name,
      description,
      order,
      event_type_id,
      event_types!inner (
        id,
        name,
        slug,
        parish_id
      )
    `)
    .eq('id', scriptId)
    .is('deleted_at', null)
    .single()

  if (scriptError || !script) {
    return null
  }

  // Verify parish ownership
  const eventType = script.event_types as unknown as { id: string; name: string; slug: string; parish_id: string }
  if (eventType.parish_id !== parishId) {
    return null
  }

  // Get sections for this script
  const { data: sections, error: sectionsError } = await supabase
    .from('sections')
    .select('id, name, section_type, content, page_break_after, order')
    .eq('script_id', scriptId)
    .is('deleted_at', null)
    .order('order', { ascending: true })

  if (sectionsError) {
    logError('Error fetching sections for debug: ' + sectionsError.message)
    throw new Error('Failed to fetch sections')
  }

  return {
    id: script.id,
    name: script.name,
    description: script.description,
    order: script.order,
    event_type_id: script.event_type_id,
    event_type: {
      id: eventType.id,
      name: eventType.name,
      slug: eventType.slug
    },
    sections: sections || []
  }
}

/**
 * Get content item by ID for debugging
 */
export async function getContentForDebug(contentId: string): Promise<{
  id: string
  title: string
  body: string
  language: string
  tags: string[]
} | null> {
  const { supabase, parishId } = await createAuthenticatedClient()

  const { data, error } = await supabase
    .from('contents')
    .select('id, title, body, language, tags')
    .eq('id', contentId)
    .eq('parish_id', parishId)
    .is('deleted_at', null)
    .single()

  if (error) {
    return null
  }

  return data
}

/**
 * Normalize a tag name for comparison
 * Converts "First Reading" to "first-reading" or keeps "first-reading" as is
 */
function normalizeTagName(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/\s+/g, '-')     // spaces to hyphens
    .replace(/[^a-z0-9-]/g, '') // remove special chars
}

/**
 * Get all content items for an event type's content fields
 * Returns content items organized by field property_name
 */
export async function getContentItemsForEventType(eventTypeId: string): Promise<Map<string, Array<{
  id: string
  title: string
  body: string
  language: string
  tags: string[]
}>>> {
  const { supabase, parishId } = await createAuthenticatedClient()

  // Get content-type fields for this event type
  const { data: contentFields } = await supabase
    .from('input_field_definitions')
    .select('property_name, input_filter_tags')
    .eq('event_type_id', eventTypeId)
    .eq('type', 'content')
    .is('deleted_at', null)

  if (!contentFields || contentFields.length === 0) {
    return new Map()
  }

  // Get all contents for this parish with their tags via tag_assignments
  const { data: contents } = await supabase
    .from('contents')
    .select('id, title, body, language')
    .eq('parish_id', parishId)
    .order('title', { ascending: true })

  if (!contents || contents.length === 0) {
    return new Map()
  }

  // Get all tag assignments for these contents
  const contentIds = contents.map(c => c.id)
  const { data: tagAssignments } = await supabase
    .from('tag_assignments')
    .select(`
      entity_id,
      category_tags!inner (
        name
      )
    `)
    .eq('entity_type', 'content')
    .in('entity_id', contentIds)

  // Build a map of content_id -> normalized tag names
  const contentTagsMap = new Map<string, string[]>()
  for (const assignment of tagAssignments || []) {
    const contentId = assignment.entity_id
    const tagName = (assignment.category_tags as unknown as { name: string }).name
    const normalizedTag = normalizeTagName(tagName)

    if (!contentTagsMap.has(contentId)) {
      contentTagsMap.set(contentId, [])
    }
    contentTagsMap.get(contentId)!.push(normalizedTag)
  }

  // Add tags to contents
  const contentsWithTags = contents.map(content => ({
    ...content,
    tags: contentTagsMap.get(content.id) || []
  }))

  // Organize contents by field based on matching tags
  const result = new Map<string, Array<{
    id: string
    title: string
    body: string
    language: string
    tags: string[]
  }>>()

  for (const field of contentFields) {
    // Normalize the filter tags for comparison
    const filterTags = (field.input_filter_tags || []).map(normalizeTagName)

    if (filterTags.length === 0) {
      result.set(field.property_name, [])
      continue
    }

    // Filter contents that have ALL the required tags
    const matchingContents = contentsWithTags.filter(content => {
      return filterTags.every((tag: string) => content.tags.includes(tag))
    })

    result.set(field.property_name, matchingContents)
  }

  return result
}

/**
 * Serializable version of getContentItemsForEventType for client consumption
 */
export async function getContentItemsForEventTypeSerializable(eventTypeId: string): Promise<Record<string, Array<{
  id: string
  title: string
  body: string
  language: string
  tags: string[]
}>>> {
  const map = await getContentItemsForEventType(eventTypeId)
  const result: Record<string, Array<{
    id: string
    title: string
    body: string
    language: string
    tags: string[]
  }>> = {}

  map.forEach((value, key) => {
    result[key] = value
  })

  return result
}


/**
 * Get input field definitions for an event type
 */
export async function getFieldDefinitionsForEventType(eventTypeId: string): Promise<Array<{
  id: string
  name: string
  property_name: string
  type: string
  required: boolean
  order: number
}>> {
  const { supabase, parishId } = await createAuthenticatedClient()

  // Verify the event type belongs to this parish
  const { data: eventType } = await supabase
    .from('event_types')
    .select('id')
    .eq('id', eventTypeId)
    .eq('parish_id', parishId)
    .single()

  if (!eventType) {
    throw new Error('Event type not found')
  }

  const { data, error } = await supabase
    .from('input_field_definitions')
    .select('id, name, property_name, type, required, order')
    .eq('event_type_id', eventTypeId)
    .is('deleted_at', null)
    .order('order', { ascending: true })

  if (error) {
    logError('Error fetching field definitions: ' + error.message)
    throw new Error('Failed to fetch field definitions')
  }

  return data || []
}
