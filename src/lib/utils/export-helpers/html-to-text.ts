/**
 * HTML to Plain Text Converter
 *
 * Converts HTML content to plain text.
 * Shared between events, mass-liturgies, and special-liturgies TXT export routes.
 */

import { renderContentToText, type RenderMarkdownOptions } from '@/lib/utils/content-renderer'

// Re-export the text renderer for consistency with other export-helpers
export { renderContentToText as htmlToText }

// Also export the type for convenience
export type { RenderMarkdownOptions as HtmlToTextOptions }

/**
 * Formats a section title for plain text output
 * Centers the title and adds an underline
 *
 * @param title - The section title
 * @param lineWidth - The assumed line width (default 70)
 * @returns Formatted title with underline
 */
export function formatSectionTitleForText(title: string, lineWidth = 70): string {
  const padding = Math.max(0, Math.floor((lineWidth - title.length) / 2))
  const centeredTitle = ' '.repeat(padding) + title
  const centeredUnderline = ' '.repeat(padding) + '='.repeat(title.length)
  return `${centeredTitle}\n${centeredUnderline}\n\n`
}

/**
 * Page break indicator for text files
 */
export const TEXT_PAGE_BREAK = '\n--- PAGE BREAK ---\n\n'
