/**
 * Ceremony Builder
 *
 * Builds ceremony sections for sacramental rites (vows, blessings, prayers)
 * Structure: Flexible content (rubrics, dialogues, prayers, responses)
 */

import { ContentSection, ContentElement } from '@/lib/types/liturgy-content'

/**
 * Build a ceremony section
 *
 * Creates a ceremony section with custom elements.
 * Note: Does NOT include pageBreakAfter - the parent template builder is responsible
 * for adding page breaks BETWEEN sections (not after the last section).
 *
 * @param id - Section ID (e.g., 'marriage-consent', 'nuptial-blessing')
 * @param elements - Array of ceremony elements
 * @returns ContentSection
 *
 * @example
 * buildCeremonySection('marriage-consent', [
 *   { type: 'section-title', text: 'MARRIAGE CONSENT' },
 *   { type: 'rubric', text: 'The priest addresses the couple:' },
 *   { type: 'presider-dialogue', text: 'Have you come here freely?' },
 *   { type: 'response-dialogue', label: 'COUPLE:', text: 'We have.' }
 * ])
 */
export function buildCeremonySection(
  id: string,
  elements: ContentElement[]
): ContentSection {
  return {
    id,
    elements,
  }
}
