/**
 * Export Helpers
 *
 * Shared utilities for PDF, DOCX, and TXT export routes.
 * These functions parse HTML with inline styles and convert to
 * the appropriate format for each export library.
 *
 * Used by:
 * - /api/events/.../export/{pdf,docx,txt}
 * - /api/mass-liturgies/.../export/{pdf,docx,txt}
 * - /api/special-liturgies/.../export/{pdf,docx,txt} (future)
 */

// Low-level inline formatting parsers
export { parseInlineFormatting } from './pdf-inline-formatting'
export { createStyledTextRuns, FONT_FAMILY, POINT_TO_HALF_POINT } from './docx-text-runs'

// High-level HTML to document converters
export { htmlToPdfContent } from './html-to-pdf'
export { htmlToWordParagraphs, POINT_TO_TWIP } from './html-to-word'
export { htmlToText, formatSectionTitleForText, TEXT_PAGE_BREAK } from './html-to-text'
export type { HtmlToTextOptions } from './html-to-text'
