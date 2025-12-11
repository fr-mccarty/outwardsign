/**
 * Markdown Renderer for User-Defined Event Types
 *
 * Parses markdown content with custom syntax and replaces field placeholders
 * with actual values from event data.
 *
 * Custom Syntax:
 * - {{Field Name}} - Placeholder for dynamic field values
 * - {{Field Name | male_text | female_text}} - Gendered text based on person's gender
 * - {{Field.property | male_text | female_text}} - Gendered text with property access
 *   - If person is male → outputs male_text
 *   - If person is female → outputs female_text
 *   - If gender unknown → outputs "male_text/female_text"
 *   - Only works for person-type fields
 *   - Examples: {{Bride | él | ella}}, {{Deceased.first_name | his | her}}
 * - {red}text{/red} - Red text (liturgical color #c41e3a)
 *
 * This uses marked.js for markdown parsing.
 */

import { marked } from 'marked'
import type { InputFieldDefinition, InputFieldType } from '@/lib/types/event-types'
import type { Person, Content } from '@/lib/types'

/**
 * Resolved field value with type information
 */
export interface ResolvedFieldValue {
  raw_value: any
  display_value: string
  field_type: InputFieldType
}

/**
 * Parish info for placeholders
 */
export interface ParishInfo {
  name: string
  city: string
  state: string
}

/**
 * Options for rendering markdown
 */
export interface RenderMarkdownOptions {
  /** Field values from the event (JSON object) */
  fieldValues: Record<string, any>
  /** Input field definitions for the event type */
  inputFieldDefinitions: InputFieldDefinition[]
  /** Resolved entities (people, locations, etc.) */
  resolvedEntities?: {
    people?: Record<string, Person>
    locations?: Record<string, any>
    groups?: Record<string, any>
    listItems?: Record<string, any>
    documents?: Record<string, any>
    contents?: Record<string, Content>
  }
  /** Parish info for parish placeholders */
  parish?: ParishInfo
  /** Output format - affects how custom syntax is converted */
  format?: 'html' | 'pdf' | 'word' | 'text'
}

/**
 * UUID validation regex (PostgreSQL standard)
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Check if a value is a UUID
 */
function isUUID(value: any): boolean {
  return typeof value === 'string' && UUID_REGEX.test(value)
}

/**
 * Parses custom {red}text{/red} syntax
 * Converts to format-specific output
 */
function parseRedText(content: string, format: 'html' | 'pdf' | 'word' | 'text'): string {
  const redColor = '#c41e3a'

  switch (format) {
    case 'html':
      return content.replace(
        /\{red\}(.*?)\{\/red\}/g,
        `<span style="color: ${redColor}">$1</span>`
      )
    case 'pdf':
      // PDF will be handled separately in pdf-renderer
      return content
    case 'word':
      // Word will be handled separately in word-renderer
      return content
    case 'text':
      // Remove {red} tags for plain text
      return content.replace(/\{red\}(.*?)\{\/red\}/g, '$1')
    default:
      return content
  }
}

/**
 * Resolves parish placeholder to display string
 */
function resolveParishPlaceholder(
  placeholder: string,
  parish?: ParishInfo
): string {
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
 * Replaces {{Field Name}}, {{Field Name | male | female}}, and {{parish.*}} placeholders with actual values
 */
export function replacePlaceholders(
  content: string,
  options: RenderMarkdownOptions
): string {
  const { fieldValues, inputFieldDefinitions, resolvedEntities, parish } = options

  // Find all {{...}} placeholders (supports both simple and gendered syntax)
  const placeholderRegex = /\{\{([^}]+)\}\}/g

  return content.replace(placeholderRegex, (match, innerContent) => {
    // Check if this is a gendered placeholder: {{Field Name | male_text | female_text}}
    const parts = innerContent.split('|').map((p: string) => p.trim())

    if (parts.length === 3) {
      // Gendered syntax: {{Field Name | male_text | female_text}}
      const [fieldName, maleText, femaleText] = parts
      return resolveGenderedText(fieldName, maleText, femaleText, fieldValues, inputFieldDefinitions, resolvedEntities)
    }

    // Simple syntax: {{Field Name}} or {{parish.*}}
    const cleanFieldName = parts[0]

    // Check for parish placeholders
    if (cleanFieldName.startsWith('parish.')) {
      return resolveParishPlaceholder(cleanFieldName, parish)
    }

    // Find the field definition
    const fieldDef = inputFieldDefinitions.find(
      def => def.name === cleanFieldName
    )

    if (!fieldDef) {
      // Field not found in definitions - return placeholder as-is
      return match
    }

    // Get the raw value from fieldValues
    const rawValue = fieldValues[cleanFieldName]

    if (rawValue === null || rawValue === undefined || rawValue === '') {
      // No value provided - return "empty" per requirements
      return 'empty'
    }

    // Convert value to display string based on field type
    return getDisplayValue(rawValue, fieldDef, resolvedEntities)
  })
}

/**
 * Resolves gendered text based on a person field's gender
 *
 * Supports two formats:
 * - {{FieldName | male | female}} - Uses the field's person for gender lookup
 * - {{FieldName.property | male | female}} - Uses the field's person for gender, ignores property
 *
 * @param fieldRef - The field reference (e.g., "Bride" or "Bride.first_name")
 * @param maleText - Text to use if person is male
 * @param femaleText - Text to use if person is female
 * @returns The appropriate text based on gender, or "maleText/femaleText" if unknown
 */
function resolveGenderedText(
  fieldRef: string,
  maleText: string,
  femaleText: string,
  fieldValues: Record<string, any>,
  inputFieldDefinitions: InputFieldDefinition[],
  resolvedEntities?: RenderMarkdownOptions['resolvedEntities']
): string {
  // Extract the base field name (before any dot notation)
  const fieldName = fieldRef.split('.')[0]

  // Find the field definition
  const fieldDef = inputFieldDefinitions.find(def => def.name === fieldName)

  if (!fieldDef) {
    // Field not found - return both options
    return `${maleText}/${femaleText}`
  }

  // This only works for person-type fields
  if (fieldDef.type !== 'person') {
    // Not a person field - return both options
    return `${maleText}/${femaleText}`
  }

  // Get the person ID from field values
  const personId = fieldValues[fieldName]

  if (!personId) {
    // No person selected - return both options
    return `${maleText}/${femaleText}`
  }

  // Look up the person to get their sex
  const person = resolvedEntities?.people?.[personId]

  if (!person || !person.sex) {
    // Person not found or sex not set - return both options
    return `${maleText}/${femaleText}`
  }

  // Return text based on sex (uppercase in database)
  if (person.sex === 'MALE') {
    return maleText
  } else if (person.sex === 'FEMALE') {
    return femaleText
  }

  // Unknown sex value - return both options
  return `${maleText}/${femaleText}`
}

/**
 * Converts a field value to display string based on its type
 */
function getDisplayValue(
  rawValue: any,
  fieldDef: InputFieldDefinition,
  resolvedEntities?: RenderMarkdownOptions['resolvedEntities']
): string {
  switch (fieldDef.type) {
    case 'person': {
      // rawValue is person_id (UUID)
      const person = resolvedEntities?.people?.[rawValue]
      return person?.full_name || ''
    }

    case 'group': {
      // rawValue is group_id (UUID)
      const group = resolvedEntities?.groups?.[rawValue]
      return group?.name || ''
    }

    case 'location': {
      // rawValue is location_id (UUID)
      const location = resolvedEntities?.locations?.[rawValue]
      return location?.name || ''
    }

    case 'event_link': {
      // rawValue is event_id (UUID)
      // For now, just return the ID or empty string
      // In a full implementation, this would fetch the linked event's display name
      return rawValue || ''
    }

    case 'list_item': {
      // rawValue is custom_list_item_id (UUID)
      const listItem = resolvedEntities?.listItems?.[rawValue]
      return listItem?.value || ''
    }

    case 'document': {
      // rawValue is document_id (UUID)
      const document = resolvedEntities?.documents?.[rawValue]
      return document?.file_name || ''
    }

    case 'content': {
      // Hybrid renderer: rawValue could be UUID (new content reference) or text (legacy)
      if (isUUID(rawValue)) {
        // New content reference - fetch from resolvedEntities
        const content = resolvedEntities?.contents?.[rawValue]
        return content?.body || ''
      } else {
        // Legacy text value - use as-is
        return String(rawValue || '')
      }
    }

    case 'text':
    case 'rich_text': {
      // rawValue is string
      return String(rawValue || '')
    }

    case 'date': {
      // rawValue is date string (YYYY-MM-DD)
      if (!rawValue) return ''
      // Format date nicely
      const date = new Date(rawValue)
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    case 'time': {
      // rawValue is time string (HH:MM:SS)
      if (!rawValue) return ''
      // Format time nicely
      const [hours, minutes] = rawValue.split(':')
      const hour = parseInt(hours, 10)
      const minute = parseInt(minutes, 10)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`
    }

    case 'datetime': {
      // rawValue is datetime string (ISO 8601)
      if (!rawValue) return ''
      const date = new Date(rawValue)
      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    }

    case 'number': {
      // rawValue is number
      return String(rawValue || '')
    }

    case 'yes_no': {
      // rawValue is boolean
      return rawValue ? 'Yes' : 'No'
    }

    default:
      return String(rawValue || '')
  }
}

/**
 * Renders markdown to HTML with custom syntax support
 *
 * @param markdown - The markdown content with custom syntax
 * @param options - Rendering options including field values and definitions
 * @returns HTML string
 */
export async function renderMarkdownToHTML(
  markdown: string,
  options: RenderMarkdownOptions
): Promise<string> {
  // Step 1: Replace {{Field Name}} placeholders with actual values
  let content = replacePlaceholders(markdown, options)

  // Step 2: Parse {red}text{/red} syntax to HTML
  content = parseRedText(content, 'html')

  // Step 3: Convert standard markdown to HTML using marked
  const html = await marked.parse(content)

  return html
}

/**
 * Renders markdown to plain text (for text export)
 * Strips all markdown formatting and custom syntax
 *
 * @param markdown - The markdown content with custom syntax
 * @param options - Rendering options including field values and definitions
 * @returns Plain text string
 */
export function renderMarkdownToText(
  markdown: string,
  options: RenderMarkdownOptions
): string {
  // Step 1: Replace {{Field Name}} placeholders with actual values
  let content = replacePlaceholders(markdown, options)

  // Step 2: Remove {red} tags
  content = parseRedText(content, 'text')

  // Step 3: Keep markdown as-is (don't convert to HTML)
  // For text export, we preserve the markdown formatting
  return content
}

/**
 * Extracts red text spans from markdown for PDF/Word rendering
 * Returns array of text segments with color information
 *
 * This is used by PDF and Word renderers to apply color formatting
 */
export interface TextSegment {
  text: string
  isRed: boolean
}

export function extractTextSegments(content: string): TextSegment[] {
  const segments: TextSegment[] = []
  const redRegex = /\{red\}(.*?)\{\/red\}/g

  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = redRegex.exec(content)) !== null) {
    // Add text before the red span
    if (match.index > lastIndex) {
      segments.push({
        text: content.substring(lastIndex, match.index),
        isRed: false
      })
    }

    // Add the red text
    segments.push({
      text: match[1],
      isRed: true
    })

    lastIndex = redRegex.lastIndex
  }

  // Add remaining text after last red span
  if (lastIndex < content.length) {
    segments.push({
      text: content.substring(lastIndex),
      isRed: false
    })
  }

  // If no red text found, return entire content as single segment
  if (segments.length === 0) {
    segments.push({
      text: content,
      isRed: false
    })
  }

  return segments
}
