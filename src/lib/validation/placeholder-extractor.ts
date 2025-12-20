/**
 * Placeholder Extractor
 *
 * Extracts all {{placeholder}} patterns from markdown content
 * and returns the property names referenced.
 *
 * Handles:
 * - Simple: {{field_name}}
 * - Dot notation: {{field_name.property}}
 * - Gendered: {{field_name | male | female}}
 * - Parish (skipped): {{parish.name}}
 */

/** Regex to match all {{...}} placeholders */
const PLACEHOLDER_REGEX = /\{\{([^}]+)\}\}/g

/** Property names that are built-in and don't need field definitions */
const BUILT_IN_PROPERTIES = new Set([
  'parish', // {{parish.name}}, {{parish.address}}, etc.
])

export interface ExtractedPlaceholder {
  /** The full placeholder text as found in content */
  fullMatch: string
  /** The inner content between {{ and }} */
  innerContent: string
  /** The extracted property_name (first part before . or |) */
  propertyName: string
  /** Whether this is a built-in placeholder (like parish) */
  isBuiltIn: boolean
}

/**
 * Extracts all placeholders from content and returns details about each
 *
 * @param content - The markdown content to extract placeholders from
 * @returns Array of extracted placeholder details
 */
export function extractPlaceholdersWithDetails(
  content: string | null | undefined
): ExtractedPlaceholder[] {
  if (!content) return []

  const results: ExtractedPlaceholder[] = []
  const matches = content.matchAll(PLACEHOLDER_REGEX)

  for (const match of matches) {
    const fullMatch = match[0]
    const innerContent = match[1].trim()

    // Handle pipe syntax: {{field | male | female}}
    const parts = innerContent.split('|').map((p) => p.trim())
    const fieldRef = parts[0]

    // Handle dot notation: {{field.property}}
    const dotIndex = fieldRef.indexOf('.')
    const propertyName = dotIndex > 0 ? fieldRef.slice(0, dotIndex) : fieldRef

    // Check if this is a built-in property
    const isBuiltIn = BUILT_IN_PROPERTIES.has(propertyName)

    results.push({
      fullMatch,
      innerContent,
      propertyName,
      isBuiltIn,
    })
  }

  return results
}

/**
 * Extracts unique property names from content (excluding built-ins)
 *
 * @param content - The markdown content to extract placeholders from
 * @returns Array of unique property names that need field definitions
 */
export function extractPropertyNames(
  content: string | null | undefined
): string[] {
  const placeholders = extractPlaceholdersWithDetails(content)

  // Filter out built-ins and dedupe
  const propertyNames = placeholders
    .filter((p) => !p.isBuiltIn)
    .map((p) => p.propertyName)

  return [...new Set(propertyNames)]
}

/**
 * Extracts all property names from multiple content sections
 *
 * @param sections - Array of content sections with a content property
 * @returns Array of unique property names across all sections
 */
export function extractPropertyNamesFromSections(
  sections: Array<{ content: string | null | undefined }>
): string[] {
  const allPropertyNames: string[] = []

  for (const section of sections) {
    const names = extractPropertyNames(section.content)
    allPropertyNames.push(...names)
  }

  return [...new Set(allPropertyNames)]
}

/**
 * Validates that all placeholders in content have corresponding field definitions
 *
 * @param content - The markdown content to validate
 * @param validPropertyNames - Set of valid property_name values from field definitions
 * @returns Array of invalid placeholder details
 */
export function findInvalidPlaceholders(
  content: string | null | undefined,
  validPropertyNames: Set<string>
): ExtractedPlaceholder[] {
  const placeholders = extractPlaceholdersWithDetails(content)

  return placeholders.filter(
    (p) => !p.isBuiltIn && !validPropertyNames.has(p.propertyName)
  )
}
