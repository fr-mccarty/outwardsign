/**
 * Markdown Processing Utility for Dynamic Events Scripts
 *
 * This module provides utilities for processing markdown content from dynamic event scripts,
 * including field placeholder replacement and markdown-to-HTML conversion.
 */

import { marked } from 'marked'
import type { EventWithRelations, ResolvedFieldValue } from '@/lib/types/event-types'
import { formatDatePretty } from '@/lib/utils/formatters'

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
 * @param content - Markdown content with placeholders
 * @param event - Event with resolved field values
 * @returns Content with all placeholders replaced
 */
export function replaceFieldPlaceholders(
  content: string,
  event: EventWithRelations
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

    // Simple syntax: {{Field Name}} or {{parish.*}}
    const trimmedFieldName = parts[0]

    // Check for parish placeholders
    if (trimmedFieldName.startsWith('parish.')) {
      return resolveParishPlaceholder(trimmedFieldName, event)
    }

    // Look up field in resolved_fields
    const resolvedField: ResolvedFieldValue | undefined = event.resolved_fields?.[trimmedFieldName]

    if (!resolvedField) {
      return 'empty'
    }

    return resolveFieldValue(resolvedField)
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
  event: EventWithRelations
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
 */
function resolveFieldValue(resolvedField: ResolvedFieldValue): string {
  const { field_type, raw_value, resolved_value } = resolvedField

  // Handle different field types
  switch (field_type) {
    case 'person':
      // Use full_name from resolved person
      return resolved_value?.full_name || 'empty'

    case 'date':
      // Format date using helper
      return raw_value ? formatDatePretty(raw_value) : 'empty'

    case 'location':
      // Use location name
      return resolved_value?.name || 'empty'

    case 'group':
      // Use group name
      return resolved_value?.name || 'empty'

    case 'event_link':
      // For linked events, we might want to show a title or reference
      // For now, just show 'empty' if no resolved value
      return resolved_value ? String(resolved_value) : 'empty'

    case 'list_item':
      // Use the value from the custom list item
      return resolved_value?.value || 'empty'

    case 'document':
      // Use the filename
      return resolved_value?.file_name || 'empty'

    case 'content':
      // Use body from resolved content, or raw_value for legacy text
      if (resolved_value && resolved_value.body) {
        return resolved_value.body
      }
      // Legacy text value or missing content
      return raw_value ? String(raw_value) : 'empty'

    case 'petition':
      // Use text from resolved petition
      if (resolved_value && resolved_value.text) {
        return resolved_value.text
      }
      return 'empty'

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
  event: EventWithRelations
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
  const person = resolvedField.resolved_value
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
 * Parse markdown content to HTML
 *
 * Supports standard markdown plus custom syntax:
 * - {red}text{/red} for liturgical red text
 *
 * @param content - Markdown content
 * @returns HTML string
 */
export function parseMarkdownToHTML(content: string): string {
  // Configure marked options
  marked.setOptions({
    breaks: true,  // Convert \n to <br>
    gfm: true,     // GitHub Flavored Markdown
  })

  // Parse markdown to HTML
  const html = marked.parse(content) as string

  // Post-process to handle custom {red}{/red} syntax
  const processedHtml = html.replace(
    /\{red\}(.*?)\{\/red\}/g,
    '<span style="color: #c41e3a">$1</span>'
  )

  return processedHtml
}

/**
 * Process a script section by replacing placeholders and converting to HTML
 *
 * @param sectionContent - Markdown content from section
 * @param event - Event with resolved field values
 * @returns HTML content with placeholders replaced
 */
export function processScriptSection(
  sectionContent: string,
  event: EventWithRelations
): string {
  // Step 1: Replace field placeholders
  const replacedContent = replaceFieldPlaceholders(sectionContent, event)

  // Step 2: Parse markdown to HTML
  const htmlContent = parseMarkdownToHTML(replacedContent)

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
  section_type?: 'text' | 'petition'
  content: string
  page_break_after: boolean
  order: number
}

/**
 * Get petition content from event's resolved fields
 */
function getPetitionContent(event: EventWithRelations): string {
  // Find the petition field in resolved_fields
  if (!event.resolved_fields) {
    return '<p><em>No petitions configured for this event.</em></p>'
  }

  // Look for any petition-type field
  for (const fieldName in event.resolved_fields) {
    const field = event.resolved_fields[fieldName]
    if (field.field_type === 'petition' && field.resolved_value) {
      const petitionText = field.resolved_value.text
      if (petitionText) {
        // Parse the petition text as markdown to HTML
        return parseMarkdownToHTML(petitionText)
      }
    }
  }

  return '<p><em>No petitions have been added to this event.</em></p>'
}

export function processScriptForRendering(
  script: { sections: ScriptSection[] },
  event: EventWithRelations
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
