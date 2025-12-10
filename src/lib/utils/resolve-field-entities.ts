/**
 * Resolves entity references in event field values
 *
 * When an event has field values that reference other entities (people, locations, groups, etc.),
 * this utility fetches those entities so they can be displayed in exports and views.
 */

import type { InputFieldDefinition } from '@/lib/types/event-types'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface ResolvedEntities {
  people: Record<string, any>
  locations: Record<string, any>
  groups: Record<string, any>
  listItems: Record<string, any>
  documents: Record<string, any>
}

/**
 * Resolves all entity references in event field values
 *
 * @param supabase - Supabase client
 * @param fieldValues - The event's field_values JSON object
 * @param inputFieldDefinitions - The field definitions for the event type
 * @returns Object with resolved entities keyed by their IDs
 */
export async function resolveFieldEntities(
  supabase: SupabaseClient,
  fieldValues: Record<string, any>,
  inputFieldDefinitions: InputFieldDefinition[]
): Promise<ResolvedEntities> {
  const resolved: ResolvedEntities = {
    people: {},
    locations: {},
    groups: {},
    listItems: {},
    documents: {}
  }

  // Collect all entity IDs that need to be fetched
  const personIds: string[] = []
  const locationIds: string[] = []
  const groupIds: string[] = []
  const listItemIds: string[] = []
  const documentIds: string[] = []

  for (const fieldDef of inputFieldDefinitions) {
    const value = fieldValues[fieldDef.name]
    if (!value) continue

    switch (fieldDef.type) {
      case 'person':
        if (typeof value === 'string' && value.length > 0) {
          personIds.push(value)
        }
        break
      case 'location':
        if (typeof value === 'string' && value.length > 0) {
          locationIds.push(value)
        }
        break
      case 'group':
        if (typeof value === 'string' && value.length > 0) {
          groupIds.push(value)
        }
        break
      case 'list_item':
        if (typeof value === 'string' && value.length > 0) {
          listItemIds.push(value)
        }
        break
      case 'document':
        if (typeof value === 'string' && value.length > 0) {
          documentIds.push(value)
        }
        break
    }
  }

  // Fetch all entities in parallel
  const [peopleResult, locationsResult, groupsResult, listItemsResult, documentsResult] = await Promise.all([
    // Fetch people
    personIds.length > 0
      ? supabase.from('people').select('*').in('id', personIds)
      : { data: [], error: null },
    // Fetch locations
    locationIds.length > 0
      ? supabase.from('locations').select('*').in('id', locationIds)
      : { data: [], error: null },
    // Fetch groups
    groupIds.length > 0
      ? supabase.from('groups').select('*').in('id', groupIds)
      : { data: [], error: null },
    // Fetch list items
    listItemIds.length > 0
      ? supabase.from('custom_list_items').select('*').in('id', listItemIds)
      : { data: [], error: null },
    // Fetch documents
    documentIds.length > 0
      ? supabase.from('documents').select('*').in('id', documentIds)
      : { data: [], error: null }
  ])

  // Map people by ID
  if (peopleResult.data) {
    for (const person of peopleResult.data) {
      resolved.people[person.id] = person
    }
  }

  // Map locations by ID
  if (locationsResult.data) {
    for (const location of locationsResult.data) {
      resolved.locations[location.id] = location
    }
  }

  // Map groups by ID
  if (groupsResult.data) {
    for (const group of groupsResult.data) {
      resolved.groups[group.id] = group
    }
  }

  // Map list items by ID
  if (listItemsResult.data) {
    for (const listItem of listItemsResult.data) {
      resolved.listItems[listItem.id] = listItem
    }
  }

  // Map documents by ID
  if (documentsResult.data) {
    for (const document of documentsResult.data) {
      resolved.documents[document.id] = document
    }
  }

  return resolved
}
