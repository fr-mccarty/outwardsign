/**
 * Cover Page Builder
 *
 * Abstracted builder for creating cover/summary pages in liturgy documents
 * Used for the first page that displays event details, participants, and metadata
 */

import { ContentSection, ContentElement } from '@/lib/types/liturgy-content'

/**
 * Configuration for a single info row on the cover page
 */
export interface CoverPageInfoRow {
  label: string
  value: string
}

/**
 * Configuration for a section group on the cover page
 */
export interface CoverPageSection {
  title: string
  rows: CoverPageInfoRow[]
}

/**
 * Configuration for building a cover page
 */
export interface CoverPageConfig {
  id?: string // Section ID (default: 'summary')
  sections: CoverPageSection[] // Groups of related information
  pageBreakAfter?: boolean // Whether to add page break after cover
}

/**
 * Build a cover/summary page section
 *
 * Creates a structured cover page with multiple subsections of information.
 * Each subsection has a title and a list of label-value pairs.
 *
 * @example
 * const coverPage = buildCoverPage({
 *   sections: [
 *     {
 *       title: 'Wedding Information',
 *       rows: [
 *         { label: 'Bride:', value: 'Jane Smith' },
 *         { label: 'Groom:', value: 'John Doe' },
 *       ]
 *     },
 *     {
 *       title: 'Ministers',
 *       rows: [
 *         { label: 'Presider:', value: 'Fr. Michael Johnson' },
 *       ]
 *     }
 *   ],
 *   pageBreakAfter: true
 * })
 */
export function buildCoverPage(config: CoverPageConfig): ContentSection {
  const { id = 'summary', sections, pageBreakAfter = false } = config

  const elements: ContentElement[] = []

  // Build each subsection
  sections.forEach((section, index) => {
    // Add section title
    elements.push({
      type: 'section-title',
      text: section.title,
    })

    // Add all info rows for this section
    section.rows.forEach((row) => {
      elements.push({
        type: 'info-row',
        label: row.label,
        value: row.value,
      })
    })

    // Add spacing between sections (except after last section)
    if (index < sections.length - 1) {
      elements.push({
        type: 'spacer',
        size: 'medium',
      })
    }
  })

  return {
    id,
    pageBreakAfter,
    elements,
  }
}

/**
 * Helper: Build a simple cover page with just one section
 *
 * Convenience wrapper for when you only need a single section
 */
export function buildSimpleCoverPage(
  title: string,
  rows: CoverPageInfoRow[],
  pageBreakAfter = false
): ContentSection {
  return buildCoverPage({
    sections: [{ title, rows }],
    pageBreakAfter,
  })
}
