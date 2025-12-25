/**
 * Content Processing Utility for Dynamic Events Scripts
 *
 * This module provides utilities for processing HTML script content from dynamic events,
 * including field placeholder replacement, content rendering, and HTML sanitization.
 *
 * Content format: Pure HTML with inline styles from Tiptap editor
 * - Text formatting: <strong>, <em>, <u>
 * - Text size: <span style="font-size: ...">
 * - Text color: <span style="color: ...">
 * - Alignment: <p style="text-align: ...">
 * - Spacing: <p style="margin-top/bottom: ...; line-height: ...">
 *
 * Security: All HTML content is sanitized to prevent XSS attacks.
 */

import type { MasterEventWithRelations, ResolvedFieldValue } from '@/lib/types'
import { formatDatePretty } from '@/lib/utils/formatters'

/**
 * Sanitize HTML content to prevent XSS attacks
 *
 * Removes:
 * - Script tags and their content
 * - Event handlers (onclick, onerror, onload, etc.)
 * - javascript: URLs
 * - Dangerous tags (iframe, object, embed, link, style)
 *
 * Allows:
 * - Basic formatting: div, p, span, strong, em, b, i, u, br, hr
 * - Lists: ul, ol, li
 * - Safe inline styles (preserved)
 *
 * @param html - Raw HTML content
 * @returns Sanitized HTML content
 */
function sanitizeHTML(html: string): string {
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Remove dangerous tags (but preserve content)
  sanitized = sanitized.replace(/<(iframe|object|embed|link|form|input|button|select|textarea)\b[^>]*>/gi, '')
  sanitized = sanitized.replace(/<\/(iframe|object|embed|link|form|input|button|select|textarea)>/gi, '')

  // Remove style tags and their content (we allow inline styles but not style blocks)
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

  // Remove event handlers (on*)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '')

  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript\s*:/gi, '')

  // Remove data: URLs (can be used for XSS)
  sanitized = sanitized.replace(/data\s*:/gi, '')

  // Remove vbscript: URLs
  sanitized = sanitized.replace(/vbscript\s*:/gi, '')

  return sanitized
}

/**
 * Parish placeholder fields available in templates
 */
export const PARISH_PLACEHOLDERS = [
  { key: 'parish.name', label: 'Parish Name', example: 'St. Mary Catholic Church' },
  { key: 'parish.city', label: 'Parish City', example: 'Austin' },
  { key: 'parish.state', label: 'Parish State', example: 'TX' },
  { key: 'parish.city_state', label: 'City, State', example: 'Austin, TX' },
] as const

/**
 * Replace {{Field Name}} and {{Field Name | male | female}} placeholders in content
 *
 * Supports three syntaxes:
 * - {{Field Name}} - Simple field value replacement
 * - {{Field Name | male_text | female_text}} - Gendered text based on person's gender
 *   - If male → outputs male_text
 *   - If female → outputs female_text
 *   - If unknown → outputs "male_text/female_text"
 * - {{parish.name}}, {{parish.city}}, {{parish.state}}, {{parish.city_state}} - Parish info
 *
 * @param content - HTML content with placeholders
 * @param event - Event with resolved field values
 * @returns Content with all placeholders replaced
 */
export function replaceFieldPlaceholders(
  content: string,
  event: MasterEventWithRelations
): string {
  // Regex to find all {{...}} patterns
  const placeholderRegex = /\{\{([^}]+)\}\}/g

  return content.replace(placeholderRegex, (match, innerContent) => {
    // Check for gendered syntax: {{Field Name | male_text | female_text}}
    const parts = innerContent.split('|').map((p: string) => p.trim())

    if (parts.length === 3) {
      // Gendered syntax
      const [fieldName, maleText, femaleText] = parts
      return resolveGenderedText(fieldName, maleText, femaleText, event)
    }

    // Simple syntax: {{field_name}} or {{field_name.property}} or {{parish.*}}
    const trimmedFieldName = parts[0]

    // Check for parish placeholders
    if (trimmedFieldName.startsWith('parish.')) {
      return resolveParishPlaceholder(trimmedFieldName, event)
    }

    // Parse dot notation: {{field_name.property}}
    const dotIndex = trimmedFieldName.indexOf('.')
    const fieldName = dotIndex > 0 ? trimmedFieldName.slice(0, dotIndex) : trimmedFieldName
    const propertyPath = dotIndex > 0 ? trimmedFieldName.slice(dotIndex + 1) : null

    // Look up field in resolved_fields
    const resolvedField: ResolvedFieldValue | undefined = event.resolved_fields?.[fieldName]

    if (!resolvedField) {
      return 'empty'
    }

    return resolveFieldValue(resolvedField, propertyPath)
  })
}

/**
 * Resolve parish placeholder to display string
 *
 * @param placeholder - The parish placeholder (e.g., "parish.name")
 * @param event - Event with parish info
 * @returns The resolved parish value or 'empty'
 */
function resolveParishPlaceholder(
  placeholder: string,
  event: MasterEventWithRelations
): string {
  const parish = event.parish

  if (!parish) {
    return 'empty'
  }

  switch (placeholder) {
    case 'parish.name':
      return parish.name || 'empty'
    case 'parish.city':
      return parish.city || 'empty'
    case 'parish.state':
      return parish.state || 'empty'
    case 'parish.city_state':
      if (parish.city && parish.state) {
        return `${parish.city}, ${parish.state}`
      }
      return parish.city || parish.state || 'empty'
    default:
      return 'empty'
  }
}

/**
 * Resolve a single field value to display string
 *
 * @param resolvedField - The resolved field with type info and values
 * @param propertyPath - Optional property path for dot notation (e.g., "full_name", "first_name")
 */
function resolveFieldValue(resolvedField: ResolvedFieldValue, propertyPath: string | null = null): string {
  const { field_type, raw_value, resolved_value } = resolvedField

  // Handle different field types
  // Using type assertions since TypeScript can't narrow union types based on sibling properties
  switch (field_type) {
    case 'person': {
      const person = resolved_value as Record<string, unknown> | null | undefined
      if (!person) return 'empty'

      // If property path specified, use it
      if (propertyPath) {
        const value = person[propertyPath]
        return value ? String(value) : 'empty'
      }
      // Default to full_name for backwards compatibility
      return (person.full_name as string) || 'empty'
    }

    case 'calendar_event': {
      // Calendar event fields have date, time, location resolved
      const calendarEvent = resolved_value as Record<string, unknown> | null | undefined
      if (!calendarEvent) return 'empty'

      if (propertyPath === 'date') {
        const dateValue = calendarEvent.date || calendarEvent.start_datetime
        return dateValue ? formatDatePretty(String(dateValue)) : 'empty'
      }
      if (propertyPath === 'time') {
        // Format time from start_datetime or time field
        const timeValue = calendarEvent.time || calendarEvent.start_datetime
        if (!timeValue) return 'empty'
        // Extract time portion if it's a datetime
        const timeStr = String(timeValue)
        if (timeStr.includes('T')) {
          const timePart = timeStr.split('T')[1]?.slice(0, 5)
          return timePart || 'empty'
        }
        return timeStr.slice(0, 5) // HH:MM
      }
      if (propertyPath === 'location') {
        const location = calendarEvent.location as Record<string, unknown> | undefined
        return (location?.name as string) || 'empty'
      }
      if (propertyPath) {
        const value = calendarEvent[propertyPath]
        return value ? String(value) : 'empty'
      }
      // Default: return formatted date/time
      const dateValue = calendarEvent.date || calendarEvent.start_datetime
      return dateValue ? formatDatePretty(String(dateValue)) : 'empty'
    }

    case 'date':
      // Format date using helper
      return raw_value ? formatDatePretty(raw_value) : 'empty'

    case 'location': {
      // Use location name
      const location = resolved_value as { name?: string } | null | undefined
      return location?.name || 'empty'
    }

    case 'group': {
      // Use group name
      const group = resolved_value as { name?: string } | null | undefined
      return group?.name || 'empty'
    }

    case 'list_item': {
      // Use the value from the custom list item
      const listItem = resolved_value as { value?: string } | null | undefined
      return listItem?.value || 'empty'
    }

    case 'document': {
      // Use the filename
      const document = resolved_value as { file_name?: string } | null | undefined
      return document?.file_name || 'empty'
    }

    case 'content': {
      // Use body from resolved content, or raw_value for legacy text
      const content = resolved_value as { body?: string } | null | undefined
      if (content && content.body) {
        return content.body
      }
      // Legacy text value or missing content
      return raw_value ? String(raw_value) : 'empty'
    }

    case 'petition': {
      // Use text from resolved petition
      const petition = resolved_value as { text?: string } | null | undefined
      if (petition && petition.text) {
        return petition.text
      }
      return 'empty'
    }

    case 'text':
    case 'rich_text':
    case 'number':
    case 'yes_no':
    case 'time':
    case 'datetime':
    default:
      // For all other types, convert raw_value to string
      if (raw_value === null || raw_value === undefined || raw_value === '') {
        return 'empty'
      }
      return String(raw_value)
  }
}

/**
 * Resolve gendered text based on a person field's gender
 *
 * Supports two formats:
 * - {{FieldName | male | female}} - Uses the field's person for gender lookup
 * - {{FieldName.property | male | female}} - Uses the field's person for gender, ignores property
 *
 * @param fieldRef - The field reference (e.g., "Bride" or "Bride.first_name")
 * @param maleText - Text to use if person is male
 * @param femaleText - Text to use if person is female
 * @param event - Event with resolved field values
 * @returns The appropriate text based on gender, or "maleText/femaleText" if unknown
 */
function resolveGenderedText(
  fieldRef: string,
  maleText: string,
  femaleText: string,
  event: MasterEventWithRelations
): string {
  // Extract the base field name (before any dot notation)
  const fieldName = fieldRef.split('.')[0]

  // Look up the field in resolved_fields
  const resolvedField: ResolvedFieldValue | undefined = event.resolved_fields?.[fieldName]

  if (!resolvedField) {
    // Field not found - return both options
    return `${maleText}/${femaleText}`
  }

  // This only works for person-type fields
  if (resolvedField.field_type !== 'person') {
    // Not a person field - return both options
    return `${maleText}/${femaleText}`
  }

  // Get the person's gender from resolved_value
  // Type assertion since we've verified this is a person field
  const person = resolvedField.resolved_value as { gender?: string } | null | undefined
  const gender = person?.gender

  if (!gender) {
    // Gender not set - return both options
    return `${maleText}/${femaleText}`
  }

  // Return text based on gender
  if (gender === 'male') {
    return maleText
  } else if (gender === 'female') {
    return femaleText
  }

  // Unknown gender value - return both options
  return `${maleText}/${femaleText}`
}

/**
 * Process HTML content by sanitizing for safe rendering
 *
 * @param content - HTML content
 * @returns Sanitized HTML string
 */
export function parseContentToHTML(content: string): string {
  // Sanitize HTML to prevent XSS
  return sanitizeHTML(content)
}

/**
 * Process a script section by replacing placeholders and sanitizing
 *
 * @param sectionContent - HTML content from section
 * @param event - Event with resolved field values
 * @returns Sanitized HTML content with placeholders replaced
 */
export function processScriptSection(
  sectionContent: string,
  event: MasterEventWithRelations
): string {
  // Step 1: Replace field placeholders (first pass)
  const firstPass = replaceFieldPlaceholders(sectionContent, event)

  // Step 2: Replace any placeholders that were inside content bodies (second pass)
  // This allows content to include placeholders like {{first_reader.full_name}}
  const secondPass = replaceFieldPlaceholders(firstPass, event)

  // Step 3: Sanitize HTML
  const htmlContent = parseContentToHTML(secondPass)

  return htmlContent
}

/**
 * Process entire script for rendering
 *
 * @param script - Script with sections
 * @param event - Event with resolved field values
 * @returns Array of processed sections with HTML content
 */
export interface ProcessedSection {
  id: string
  name: string
  htmlContent: string
  pageBreakAfter: boolean
  order: number
  sectionType: 'text' | 'petition'
}

interface ScriptSection {
  id: string
  name: string
  section_type?: string | null  // Optional categorization hint (not enforced)
  content: string
  page_break_after: boolean
  order: number
}

/**
 * Get petition content from event's resolved fields
 */
function getPetitionContent(event: MasterEventWithRelations): string {
  // Find the petition field in resolved_fields
  if (!event.resolved_fields) {
    return '<p><em>No petitions configured for this event.</em></p>'
  }

  // Look for any petition-type field
  for (const fieldName in event.resolved_fields) {
    const field = event.resolved_fields[fieldName]
    if (field.field_type === 'petition' && field.resolved_value) {
      // Type assertion since we've verified this is a petition field
      const petition = field.resolved_value as { text?: string }
      const petitionText = petition.text
      if (petitionText) {
        // Process the petition text (already HTML)
        return parseContentToHTML(petitionText)
      }
    }
  }

  return '<p><em>No petitions have been added to this event.</em></p>'
}

export function processScriptForRendering(
  script: { sections: ScriptSection[] },
  event: MasterEventWithRelations
): ProcessedSection[] {
  return script.sections.map(section => {
    const sectionType = section.section_type || 'text'

    // Handle petition-type sections differently
    if (sectionType === 'petition') {
      return {
        id: section.id,
        name: section.name,
        htmlContent: getPetitionContent(event),
        pageBreakAfter: section.page_break_after,
        order: section.order,
        sectionType: 'petition',
      }
    }

    // Standard text section processing
    return {
      id: section.id,
      name: section.name,
      htmlContent: processScriptSection(section.content, event),
      pageBreakAfter: section.page_break_after,
      order: section.order,
      sectionType: 'text',
    }
  })
}
