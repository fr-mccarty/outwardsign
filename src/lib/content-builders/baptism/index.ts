/**
 * Baptism Content Builders
 *
 * Template registry and main export for baptism liturgy content builders
 */

import { BaptismWithRelations } from '@/lib/actions/baptisms'
import { LiturgyDocument, LiturgyTemplate } from '@/lib/types/liturgy-content'
import { buildSummaryEnglish } from './templates/summary-english'
import { buildSummarySpanish } from './templates/summary-spanish'

// Export shared helpers for use in templates
export * from './helpers'

/**
 * Template Registry
 * Templates for baptism summaries
 */
export const BAPTISM_TEMPLATES: Record<string, LiturgyTemplate<BaptismWithRelations>> = {
  'baptism-summary-english': {
    id: 'baptism-summary-english',
    name: 'Baptism Summary (English)',
    description: 'Simple summary of all baptism information for sacristy use',
    supportedLanguages: ['en'],
    builder: buildSummaryEnglish,
  },
  'baptism-summary-spanish': {
    id: 'baptism-summary-spanish',
    name: 'Resumen del Bautismo (Español)',
    description: 'Resumen simple de toda la información del bautismo para uso en la sacristía',
    supportedLanguages: ['es'],
    builder: buildSummarySpanish,
  },
}

/**
 * Main export: Build baptism liturgy content
 */
export function buildBaptismLiturgy(
  baptism: BaptismWithRelations,
  templateId: string = 'baptism-summary-english'
): LiturgyDocument {
  const template = BAPTISM_TEMPLATES[templateId] || BAPTISM_TEMPLATES['baptism-summary-english']
  return template.builder(baptism)
}
