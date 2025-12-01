/**
 * Cover Page Builder
 *
 * Builds the cover/summary page for liturgy documents
 * Structure: Title (doc level) > Subtitle (doc level) > Sections > Content (labels/values)
 */

import { ContentSection, ContentElement } from '@/lib/types/liturgy-content'

/**
 * A single label-value row on the cover page
 */
export interface CoverPageRow {
  label: string
  value: string
}

/**
 * A section on the cover page (e.g., "Wedding Information", "Ministers")
 */
export interface CoverPageSection {
  title: string
  rows: CoverPageRow[]
}

/**
 * Build cover page section
 *
 * Creates the first page with event details organized into subsections.
 * Note: Does NOT include pageBreakAfter - the parent template builder is responsible
 * for adding page breaks BETWEEN sections (not after the last section).
 *
 * @param sections - Array of subsections, each with title and label-value rows
 * @returns ContentSection with all cover page elements
 *
 * @example
 * buildCoverPage([
 *   {
 *     title: 'Wedding Information',
 *     rows: [
 *       { label: 'Bride:', value: 'Jane Smith' },
 *       { label: 'Groom:', value: 'John Doe' }
 *     ]
 *   },
 *   {
 *     title: 'Ministers',
 *     rows: [
 *       { label: 'Presider:', value: 'Fr. Michael Johnson' }
 *     ]
 *   }
 * ])
 */
export function buildCoverPage(sections: CoverPageSection[]): ContentSection {
  const elements: ContentElement[] = []

  sections.forEach((section) => {
    // Section title
    elements.push({
      type: 'section-title',
      text: section.title,
    })

    // Label-value rows
    section.rows.forEach((row) => {
      elements.push({
        type: 'info-row',
        label: row.label,
        value: row.value,
      })
    })

    // Spacing between sections
    elements.push({
      type: 'spacer',
      size: 'medium',
    })
  })

  return {
    id: 'summary',
    elements,
  }
}
