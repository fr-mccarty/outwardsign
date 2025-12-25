/**
 * Content Renderer for User-Defined Event Types
 *
 * Processes HTML script content and replaces field placeholders with actual values
 * from event data. All content is HTML-only with sanitization for security.
 *
 * Content format: HTML with inline styles (e.g., <div style="color: red;">)
 *
 * FIELD MATCHING:
 * - Placeholders use `property_name` (lowercase, underscores) for reliable matching
 * - property_name is stored on input_field_definitions and used in templates
 * - Example: Display name "First Reader" → property_name "first_reader" → Template: {{first_reader.full_name}}
 *
 * Custom Syntax:
 *
 * PERSON FIELD VARIABLES (dot notation):
 * - {{field}} - Returns person's full_name (default)
 * - {{field.full_name}} - Returns person's full name explicitly
 * - {{field.first_name}} - Returns person's first name only
 * - {{field.last_name}} - Returns person's last name only
 * - If person is unassigned → returns "Unassigned" (English) or "Sin asignar" (Spanish)
 * - Examples: {{bride.first_name}}, {{first_reader.full_name}}, {{petition_reader.last_name}}
 *
 * GENDERED TEXT (pipe syntax):
 * - {{field.sex | male_text | female_text}} - Gendered text based on person's sex
 *   - If person is male → outputs male_text
 *   - If person is female → outputs female_text
 *   - If gender unknown → outputs "male_text/female_text"
 *   - Only works for person-type fields
 *   - Examples: {{bride.sex | él | ella}}, {{first_reader.sex | He | She}}
 *
 * PARISH PLACEHOLDERS:
 * - {{parish.name}} - Parish name
 * - {{parish.city}} - Parish city
 * - {{parish.state}} - Parish state
 * - {{parish.city_state}} - City, State formatted
 *
 * OTHER:
 * - {red}text{/red} - Red text (liturgical color #c41e3a)
 *
 * Security: All HTML content is sanitized to prevent XSS attacks.
 */

import type { InputFieldDefinition, InputFieldType } from '@/lib/types/event-types'
import type { Person, Content } from '@/lib/types'

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
 * Options for rendering content
 */
export interface RenderContentOptions {
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
  /** Language for internationalized text (e.g., "Unassigned") */
  language?: 'en' | 'es'
}

// Legacy alias for backward compatibility
export type RenderMarkdownOptions = RenderContentOptions

/**
 * Valid person property names for dot notation access
 */
type PersonProperty = 'full_name' | 'first_name' | 'last_name' | 'sex'

/**
 * Valid content property names for dot notation access
 */
type ContentProperty = 'title' | 'body'

/**
 * Internationalized text for unassigned fields
 */
const UNASSIGNED_TEXT: Record<'en' | 'es', string> = {
  en: 'Unassigned',
  es: 'Sin asignar'
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
 * Parses a field reference that may include dot notation
 *
 * Splits on the FIRST dot only to separate property_name from the person property.
 * property_name uses lowercase and underscores (no spaces).
 *
 * Examples:
 *   "bride" -> { propertyName: "bride", property: undefined }
 *   "bride.first_name" -> { propertyName: "bride", property: "first_name" }
 *   "first_reader.full_name" -> { propertyName: "first_reader", property: "full_name" }
 *   "petition_reader" -> { propertyName: "petition_reader", property: undefined }
 */
function parseFieldReference(fieldRef: string): { fieldName: string; property?: PersonProperty | ContentProperty } {
  const dotIndex = fieldRef.indexOf('.')
  if (dotIndex === -1) {
    return { fieldName: fieldRef }
  }

  const fieldName = fieldRef.substring(0, dotIndex)
  const property = fieldRef.substring(dotIndex + 1)

  // Validate property name - accept both person and content properties
  const validPersonProperties: PersonProperty[] = ['full_name', 'first_name', 'last_name', 'sex']
  const validContentProperties: ContentProperty[] = ['title', 'body']

  if (validPersonProperties.includes(property as PersonProperty)) {
    return { fieldName, property: property as PersonProperty }
  }

  if (validContentProperties.includes(property as ContentProperty)) {
    return { fieldName, property: property as ContentProperty }
  }

  // Invalid property - return just the field name
  return { fieldName }
}

/**
 * Replaces {{Field Name}}, {{Field.property}}, {{Field Name | male | female}}, and {{parish.*}} placeholders with actual values
 *
 * Supported syntax:
 * - {{Field}} - Returns full_name for person fields, or raw value for others
 * - {{Field.full_name}} - Returns person's full name
 * - {{Field.first_name}} - Returns person's first name
 * - {{Field.last_name}} - Returns person's last name
 * - {{Field.sex | male_text | female_text}} - Gendered text based on person's sex
 * - {{parish.name}}, {{parish.city}}, etc. - Parish information
 */
export function replacePlaceholders(
  content: string,
  options: RenderContentOptions
): string {
  const { fieldValues, inputFieldDefinitions, resolvedEntities, parish, language = 'en' } = options

  // Find all {{...}} placeholders (supports both simple and gendered syntax)
  const placeholderRegex = /\{\{([^}]+)\}\}/g

  return content.replace(placeholderRegex, (match, innerContent) => {
    // Check if this is a gendered placeholder: {{Field Name | male_text | female_text}}
    const parts = innerContent.split('|').map((p: string) => p.trim())

    if (parts.length === 3) {
      // Gendered syntax: {{Field Name | male_text | female_text}} or {{Field.sex | male_text | female_text}}
      const [fieldRef, maleText, femaleText] = parts
      return resolveGenderedText(fieldRef, maleText, femaleText, fieldValues, inputFieldDefinitions, resolvedEntities)
    }

    // Simple syntax: {{Field Name}}, {{Field.property}}, or {{parish.*}}
    const fieldRef = parts[0]

    // Check for parish placeholders
    if (fieldRef.startsWith('parish.')) {
      return resolveParishPlaceholder(fieldRef, parish)
    }

    // Parse field reference for dot notation (fieldName here is actually property_name)
    const { fieldName: propertyName, property } = parseFieldReference(fieldRef)

    // Find the field definition by property_name
    const fieldDef = inputFieldDefinitions.find(
      def => def.property_name === propertyName
    )

    if (!fieldDef) {
      // Field not found in definitions - return placeholder as-is
      return match
    }

    // Get the raw value from fieldValues (keyed by property_name)
    const rawValue = fieldValues[propertyName]

    if (rawValue === null || rawValue === undefined || rawValue === '') {
      // No value provided - return internationalized "Unassigned" for person fields
      if (fieldDef.type === 'person') {
        return UNASSIGNED_TEXT[language]
      }
      // For other field types, return "empty" per existing requirements
      return 'empty'
    }

    // Convert value to display string based on field type
    return getDisplayValue(rawValue, fieldDef, resolvedEntities, property, language)
  })
}

/**
 * Resolves gendered text based on a person field's gender
 *
 * Supports two formats:
 * - {{property_name | male | female}} - Uses the field's person for gender lookup
 * - {{property_name.sex | male | female}} - Uses the field's person for gender
 *
 * @param fieldRef - The field reference (e.g., "bride" or "bride.sex")
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
  resolvedEntities?: RenderContentOptions['resolvedEntities']
): string {
  // Extract the base property_name (before any dot notation)
  const propertyName = fieldRef.split('.')[0]

  // Find the field definition by property_name
  const fieldDef = inputFieldDefinitions.find(def => def.property_name === propertyName)

  if (!fieldDef) {
    // Field not found - return both options
    return `${maleText}/${femaleText}`
  }

  // This only works for person-type fields
  if (fieldDef.type !== 'person') {
    // Not a person field - return both options
    return `${maleText}/${femaleText}`
  }

  // Get the person ID from field values (keyed by property_name)
  const personId = fieldValues[propertyName]

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
 *
 * @param rawValue - The raw value from fieldValues
 * @param fieldDef - The field definition
 * @param resolvedEntities - Resolved entity references
 * @param property - For person fields, the specific property to access (full_name, first_name, last_name)
 * @param language - Language for internationalized fallback text
 */
function getDisplayValue(
  rawValue: any,
  fieldDef: InputFieldDefinition,
  resolvedEntities?: RenderContentOptions['resolvedEntities'],
  property?: PersonProperty | ContentProperty,
  language: 'en' | 'es' = 'en'
): string {
  switch (fieldDef.type) {
    case 'person': {
      // rawValue is person_id (UUID)
      const person = resolvedEntities?.people?.[rawValue]

      if (!person) {
        return UNASSIGNED_TEXT[language]
      }

      // Return the requested property, defaulting to full_name
      switch (property) {
        case 'first_name':
          return person.first_name || ''
        case 'last_name':
          return person.last_name || ''
        case 'sex':
          // sex property alone doesn't make sense - return empty
          // (sex is meant to be used with gendered pipe syntax)
          return ''
        case 'full_name':
        default:
          return person.full_name || ''
      }
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

        if (!content) return ''

        // Return the requested property, defaulting to body
        switch (property as ContentProperty) {
          case 'title':
            return content.title || ''
          case 'body':
          default:
            return content.body || ''
        }
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
 * Renders HTML content with custom syntax support and sanitization
 *
 * @param content - The HTML content with custom syntax
 * @param options - Rendering options including field values and definitions
 * @returns Sanitized HTML string
 */
export async function renderContentToHTML(
  content: string,
  options: RenderContentOptions
): Promise<string> {
  // Step 1: Replace {{Field Name}} placeholders with actual values
  let processedContent = replacePlaceholders(content, options)

  // Step 2: Parse {red}text{/red} syntax to HTML
  processedContent = parseRedText(processedContent, 'html')

  // Step 3: Sanitize HTML to prevent XSS
  return sanitizeHTML(processedContent)
}

// Legacy alias for backward compatibility
export const renderMarkdownToHTML = renderContentToHTML

/**
 * Renders content to plain text (for text export)
 * Strips all HTML tags and custom syntax
 *
 * @param content - The HTML content with custom syntax
 * @param options - Rendering options including field values and definitions
 * @returns Plain text string
 */
export function renderContentToText(
  content: string,
  options: RenderContentOptions
): string {
  // Step 1: Replace {{Field Name}} placeholders with actual values
  let processedContent = replacePlaceholders(content, options)

  // Step 2: Remove {red} tags
  processedContent = parseRedText(processedContent, 'text')

  // Step 3: Strip HTML tags for plain text output
  processedContent = processedContent.replace(/<[^>]*>/g, '')

  // Step 4: Decode HTML entities
  processedContent = processedContent
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

  return processedContent
}

// Legacy alias for backward compatibility
export const renderMarkdownToText = renderContentToText

/**
 * Extracts red text spans from content for PDF/Word rendering
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
