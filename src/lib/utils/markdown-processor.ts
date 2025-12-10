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
 * Replace {{Field Name}} placeholders in content with actual values from event data
 *
 * @param content - Markdown content with {{Field Name}} placeholders
 * @param event - Event with resolved field values
 * @returns Content with all placeholders replaced
 */
export function replaceFieldPlaceholders(
  content: string,
  event: EventWithRelations
): string {
  // Regex to find all {{Field Name}} patterns
  const placeholderRegex = /\{\{([^}]+)\}\}/g

  return content.replace(placeholderRegex, (match, fieldName) => {
    // Trim whitespace from field name
    const trimmedFieldName = fieldName.trim()

    // Look up field in resolved_fields
    const resolvedField: ResolvedFieldValue | undefined = event.resolved_fields[trimmedFieldName]

    if (!resolvedField) {
      return 'empty'
    }

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
  })
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
}

export function processScriptForRendering(
  script: { sections: Array<{ id: string; name: string; content: string; page_break_after: boolean; order: number }> },
  event: EventWithRelations
): ProcessedSection[] {
  return script.sections.map(section => ({
    id: section.id,
    name: section.name,
    htmlContent: processScriptSection(section.content, event),
    pageBreakAfter: section.page_break_after,
    order: section.order,
  }))
}
