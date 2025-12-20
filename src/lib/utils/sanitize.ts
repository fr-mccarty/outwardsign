/**
 * Sanitization Utilities
 *
 * These functions sanitize user input by stripping HTML tags while preserving:
 * - Standard markdown syntax (**bold**, *italic*, # headings, - lists, etc.)
 * - Custom liturgical syntax: {red}text{/red}
 * - Field placeholders: {{field_name}}, {{field.property}}, {{field | male | female}}
 * - Parish placeholders: {{parish.name}}, {{parish.city_state}}
 *
 * Usage:
 * - sanitizeTextInput: For plain text fields (strips all HTML)
 * - sanitizeRichText: For rich text fields (preserves allowed syntax)
 * - sanitizeFieldValues: For sanitizing entire field_values objects
 */

/**
 * Sanitizes plain text input by stripping all HTML tags.
 * Use for simple text fields like names, titles, etc.
 *
 * @param input - The raw user input
 * @returns Sanitized string with HTML tags removed
 */
export function sanitizeTextInput(input: string | null | undefined): string {
  if (!input) return ''

  return input
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .trim()
}

/**
 * Sanitizes rich text input while preserving allowed syntax.
 * Use for rich_text fields that may contain markdown and custom syntax.
 *
 * Preserved:
 * - Markdown: **bold**, *italic*, # headings, - lists, [links](url), etc.
 * - Custom: {red}text{/red}
 * - Placeholders: {{field}}, {{field.prop}}, {{field | a | b}}
 *
 * Stripped:
 * - All HTML tags: <script>, <div>, <span>, <style>, etc.
 * - JavaScript event handlers: onclick, onerror, etc.
 *
 * @param input - The raw user input
 * @returns Sanitized string with HTML stripped but allowed syntax preserved
 */
export function sanitizeRichText(input: string | null | undefined): string {
  if (!input) return ''

  // Protect custom syntax from being stripped
  const protectionMap: Map<string, string> = new Map()
  let protectionIndex = 0

  // Protect {red}...{/red} syntax
  let protected_ = input.replace(/\{red\}([\s\S]*?)\{\/red\}/g, (match) => {
    const key = `___PROTECTED_${protectionIndex++}___`
    protectionMap.set(key, match)
    return key
  })

  // Protect {{...}} placeholders (including those with pipes and dots)
  protected_ = protected_.replace(/\{\{[^}]+\}\}/g, (match) => {
    const key = `___PROTECTED_${protectionIndex++}___`
    protectionMap.set(key, match)
    return key
  })

  // Strip HTML tags
  let sanitized = protected_.replace(/<[^>]*>/g, '')

  // Restore protected syntax
  protectionMap.forEach((value, key) => {
    sanitized = sanitized.replace(key, value)
  })

  return sanitized.trim()
}

/**
 * Determines if a field type should use rich text sanitization
 */
function isRichTextField(fieldType: string): boolean {
  return fieldType === 'rich_text' || fieldType === 'mass-intention'
}

/**
 * Determines if a field type should use plain text sanitization
 */
function isPlainTextField(fieldType: string): boolean {
  return fieldType === 'text'
}

/**
 * Sanitizes all text fields in a field_values object.
 * Use when saving master_events to ensure all text content is clean.
 *
 * @param fieldValues - The field_values JSONB object
 * @param fieldDefinitions - Array of input field definitions to determine types
 * @returns Sanitized field_values object
 */
export function sanitizeFieldValues(
  fieldValues: Record<string, unknown>,
  fieldDefinitions: Array<{ property_name: string; type: string }>
): Record<string, unknown> {
  if (!fieldValues) return {}

  const sanitized: Record<string, unknown> = { ...fieldValues }

  for (const field of fieldDefinitions) {
    const value = fieldValues[field.property_name]

    if (typeof value !== 'string') continue

    if (isRichTextField(field.type)) {
      sanitized[field.property_name] = sanitizeRichText(value)
    } else if (isPlainTextField(field.type)) {
      sanitized[field.property_name] = sanitizeTextInput(value)
    }
    // Other field types (person, location, content, etc.) store UUIDs
    // and don't need sanitization
  }

  return sanitized
}

/**
 * Sanitizes content body (used in contents table).
 * Content bodies support markdown and custom syntax.
 *
 * @param body - The content body text
 * @returns Sanitized content body
 */
export function sanitizeContentBody(body: string | null | undefined): string {
  return sanitizeRichText(body)
}

/**
 * Sanitizes section content (used in sections table).
 * Section content supports markdown, custom syntax, and placeholders.
 *
 * @param content - The section content text
 * @returns Sanitized section content
 */
export function sanitizeSectionContent(content: string | null | undefined): string {
  return sanitizeRichText(content)
}

/**
 * Strips HTML tags from output when displaying.
 * Use for defense-in-depth when rendering user content.
 *
 * Note: This is typically not needed since marked.parse() handles
 * markdown safely, but can be used as an additional safety layer.
 *
 * @param output - The content to display
 * @returns Content with HTML tags stripped
 */
export function stripTagsForDisplay(output: string | null | undefined): string {
  return sanitizeRichText(output)
}
