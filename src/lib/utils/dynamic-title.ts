import type { ParishEventWithRelations, EventTypeWithRelations, Person } from '@/lib/types'

/**
 * Build a dynamic title for an event from key person names.
 *
 * Uses fields marked as `is_key_person` to extract names and build a title.
 * Falls back to event type name if no key persons are found.
 *
 * Examples:
 *   - Wedding: "Smith-Johnson Wedding"
 *   - Baptism: "Maria Garcia Baptism"
 *   - Funeral: "John Doe Funeral"
 */
export function buildDynamicTitle(
  event: ParishEventWithRelations,
  eventType: EventTypeWithRelations
): string {
  const keyPersonFields = eventType.input_field_definitions?.filter(
    (field) => field.is_key_person && field.type === 'person' && !field.deleted_at
  ) || []

  if (keyPersonFields.length === 0) {
    return eventType.name
  }

  // Extract key person names from resolved_fields
  const keyNames: string[] = []

  for (const field of keyPersonFields) {
    const resolved = event.resolved_fields?.[field.property_name]
    if (resolved?.resolved_value) {
      const person = resolved.resolved_value as Person
      // Use last name if available, otherwise full name
      const name = person.last_name || person.full_name?.split(' ').pop() || person.full_name
      if (name) {
        keyNames.push(name)
      }
    }
  }

  if (keyNames.length === 0) {
    return eventType.name
  }

  // Join names with hyphen and append event type
  // e.g., "Smith-Johnson Wedding" or "Garcia Baptism"
  return `${keyNames.join('-')} ${eventType.name}`
}

/**
 * Get a short display name for an event (just the key person names).
 * Useful for lists and navigation where the event type is already shown.
 */
export function getKeyPersonNames(
  event: ParishEventWithRelations,
  eventType: EventTypeWithRelations
): string | null {
  const keyPersonFields = eventType.input_field_definitions?.filter(
    (field) => field.is_key_person && field.type === 'person' && !field.deleted_at
  ) || []

  if (keyPersonFields.length === 0) {
    return null
  }

  const keyNames: string[] = []

  for (const field of keyPersonFields) {
    const resolved = event.resolved_fields?.[field.property_name]
    if (resolved?.resolved_value) {
      const person = resolved.resolved_value as Person
      const name = person.last_name || person.full_name?.split(' ').pop() || person.full_name
      if (name) {
        keyNames.push(name)
      }
    }
  }

  return keyNames.length > 0 ? keyNames.join('-') : null
}
