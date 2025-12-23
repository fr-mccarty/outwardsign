/**
 * Simple Event Script Content Builder
 *
 * Generates printable scripts for masses and parish events by reading custom fields
 * in their defined order. This is a code-based content builder that bypasses the
 * database script templates system used by special liturgies.
 *
 * System Types:
 * - 'mass': Uses this builder
 * - 'event': Uses this builder
 * - 'special-liturgy': Uses database script templates (NOT this builder)
 */

import { MasterEventWithRelations } from '@/lib/types'
import { EventTypeWithRelations, InputFieldDefinition } from '@/lib/types/event-types'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import {
  formatDatePretty,
  formatTime,
  formatLocationName,
} from '@/lib/utils/formatters'

/**
 * Build simple event script from custom field definitions
 *
 * This function generates a printable script by:
 * 1. Creating a cover page with event type name, date, time, location
 * 2. Reading custom fields in their defined order
 * 3. Formatting each field value based on its type
 *
 * @param event - Master event with relations (includes field_values and resolved_fields)
 * @param eventType - Event type with relations (includes input_field_definitions)
 * @returns LiturgyDocument ready for rendering
 *
 * @example
 * const script = buildSimpleEventScript(massEvent, massEventType)
 * // Returns a script with cover page + custom fields section
 */
export function buildSimpleEventScript(
  event: MasterEventWithRelations,
  eventType: EventTypeWithRelations
): LiturgyDocument {
  // Validate inputs
  if (!event.field_values) {
    throw new Error('Event must have field_values')
  }
  if (!eventType.input_field_definitions || eventType.input_field_definitions.length === 0) {
    throw new Error('Event type must have input_field_definitions')
  }

  const sections: ContentSection[] = []

  // Build cover page section
  sections.push(buildCoverPageSection(event, eventType))

  // Build custom fields section
  sections.push(buildCustomFieldsSection(event, eventType))

  return {
    id: event.id,
    type: 'event',
    language: 'en', // Simple scripts are English-only for now
    template: 'simple-event-script',
    title: `${eventType.name} Script`,
    subtitle: getPrimaryEventDateTime(event),
    sections,
  }
}

/**
 * Build cover page section with event type name, date, time, location
 */
function buildCoverPageSection(
  event: MasterEventWithRelations,
  eventType: EventTypeWithRelations
): ContentSection {
  const elements: ContentElement[] = []

  // Event type name as title
  elements.push({
    type: 'event-title',
    text: eventType.name,
  })

  // Find primary calendar event by looking for the input field definition with is_primary = true
  const primaryFieldDef = eventType.input_field_definitions?.find(
    field => field.type === 'calendar_event' && field.is_primary
  )

  let primaryCalendarEvent = null
  if (primaryFieldDef) {
    // Find the calendar event that matches this field definition
    primaryCalendarEvent = event.calendar_events?.find(
      ce => ce.input_field_definition_id === primaryFieldDef.id
    )
  }

  // Fallback: if no primary field def or no matching calendar event, use the first calendar event
  if (!primaryCalendarEvent && event.calendar_events && event.calendar_events.length > 0) {
    primaryCalendarEvent = event.calendar_events[0]
  }

  if (primaryCalendarEvent) {
    // Date
    if (primaryCalendarEvent.start_datetime) {
      const dateStr = primaryCalendarEvent.start_datetime.split('T')[0] // Extract date part
      elements.push({
        type: 'info-row',
        label: 'Date',
        value: formatDatePretty(dateStr),
      })
    }

    // Time
    if (primaryCalendarEvent.start_datetime && !primaryCalendarEvent.is_all_day) {
      const timeStr = primaryCalendarEvent.start_datetime.split('T')[1]?.substring(0, 8) // Extract time part (HH:MM:SS)
      if (timeStr) {
        elements.push({
          type: 'info-row',
          label: 'Time',
          value: formatTime(timeStr),
        })
      }
    }

    // Location
    if (primaryCalendarEvent.location && primaryCalendarEvent.location.name) {
      elements.push({
        type: 'info-row',
        label: 'Location',
        value: formatLocationName(primaryCalendarEvent.location),
      })
    }
  }

  // Add visual separator after cover page info
  elements.push({
    type: 'spacer',
    size: 'large',
  })

  return {
    id: 'cover-page',
    elements,
  }
}

/**
 * Build custom fields section by reading fields in their defined order
 */
function buildCustomFieldsSection(
  event: MasterEventWithRelations,
  eventType: EventTypeWithRelations
): ContentSection {
  const elements: ContentElement[] = []

  // Sort fields by order
  const sortedFields = [...eventType.input_field_definitions].sort((a, b) => a.order - b.order)

  // Process each field in order
  for (const field of sortedFields) {
    // Skip spacer fields (they don't have values)
    if (field.type === 'spacer') {
      elements.push({
        type: 'spacer',
        size: 'medium',
      })
      continue
    }

    // Skip calendar_event fields (already shown in cover page)
    if (field.type === 'calendar_event') {
      continue
    }

    // Get field value
    const rawValue = event.field_values[field.property_name]
    if (rawValue === null || rawValue === undefined) {
      continue // Skip fields with no value
    }

    // Format value based on field type
    const formattedValue = formatFieldValue(field, rawValue, event)

    // Add info row with label and formatted value
    elements.push({
      type: 'info-row',
      label: field.name,
      value: formattedValue,
    })
  }

  return {
    id: 'custom-fields',
    title: 'Details',
    pageBreakBefore: false,
    elements,
  }
}

/**
 * Format field value based on its type
 */
function formatFieldValue(
  field: InputFieldDefinition,
  rawValue: any,
  event: MasterEventWithRelations
): string {
  switch (field.type) {
    case 'person': {
      // Look up resolved person
      const resolvedField = event.resolved_fields?.[field.property_name]
      const person = resolvedField?.resolved_value as any
      return person?.full_name || rawValue
    }

    case 'group': {
      // Look up resolved group
      const resolvedField = event.resolved_fields?.[field.property_name]
      const group = resolvedField?.resolved_value as any
      return group?.name || rawValue
    }

    case 'location': {
      // Look up resolved location
      const resolvedField = event.resolved_fields?.[field.property_name]
      const location = resolvedField?.resolved_value as any
      return location?.name || rawValue
    }

    case 'list_item': {
      // Look up resolved list item
      const resolvedField = event.resolved_fields?.[field.property_name]
      const listItem = resolvedField?.resolved_value as any
      return listItem?.value || rawValue
    }

    case 'document': {
      // Look up resolved document
      const resolvedField = event.resolved_fields?.[field.property_name]
      const document = resolvedField?.resolved_value as any
      return document?.file_name || rawValue
    }

    case 'content': {
      // Look up resolved content
      const resolvedField = event.resolved_fields?.[field.property_name]
      const content = resolvedField?.resolved_value as any
      return content?.title || rawValue
    }

    case 'petition': {
      // Look up resolved petition
      const resolvedField = event.resolved_fields?.[field.property_name]
      const petition = resolvedField?.resolved_value as any
      return petition?.title || rawValue
    }

    case 'date': {
      return formatDatePretty(rawValue)
    }

    case 'time': {
      return formatTime(rawValue)
    }

    case 'datetime': {
      const dateStr = rawValue.split('T')[0]
      const timeStr = rawValue.split('T')[1]?.substring(0, 8)
      return `${formatDatePretty(dateStr)} at ${formatTime(timeStr)}`
    }

    case 'yes_no': {
      return rawValue ? 'Yes' : 'No'
    }

    case 'number': {
      return String(rawValue)
    }

    case 'text':
    case 'rich_text':
    case 'mass-intention': {
      return rawValue
    }

    default:
      return String(rawValue)
  }
}

/**
 * Get primary event date/time for subtitle
 */
function getPrimaryEventDateTime(event: MasterEventWithRelations): string | undefined {
  // Find the primary calendar event (first one, or the one linked to primary field definition)
  const primaryCalendarEvent = event.calendar_events?.[0]
  if (!primaryCalendarEvent?.start_datetime) {
    return undefined
  }

  const dateStr = primaryCalendarEvent.start_datetime.split('T')[0]
  const timeStr = primaryCalendarEvent.start_datetime.split('T')[1]?.substring(0, 8)

  if (timeStr && !primaryCalendarEvent.is_all_day) {
    return `${formatDatePretty(dateStr)} at ${formatTime(timeStr)}`
  }

  return formatDatePretty(dateStr)
}
