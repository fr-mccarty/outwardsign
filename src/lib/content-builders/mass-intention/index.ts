/**
 * Mass Intention Content Builders
 *
 * Template registry and main export for Mass Intention content builders
 */

import { MassIntentionWithRelations } from '@/lib/actions/mass-intentions'
import { LiturgyDocument, LiturgyTemplate } from '@/lib/types/liturgy-content'
import { buildSummaryEnglish } from './templates/summary-english'
import { buildSummarySpanish } from './templates/summary-spanish'

/**
 * Template Registry
 * Add new Mass Intention templates here as they are created
 */
export const MASS_INTENTION_TEMPLATES: Record<string, LiturgyTemplate<MassIntentionWithRelations>> = {
  'mass-intention-summary-english': {
    id: 'mass-intention-summary-english',
    name: 'Mass Intention Summary (English)',
    description: 'Summary of mass intention details in English',
    supportedLanguages: ['en'],
    builder: buildSummaryEnglish,
  },
  'mass-intention-summary-spanish': {
    id: 'mass-intention-summary-spanish',
    name: 'Resumen de Intención de Misa (Español)',
    description: 'Resumen de los detalles de la intención de misa en español',
    supportedLanguages: ['es'],
    builder: buildSummarySpanish,
  },
}

/**
 * Main export: Build Mass Intention content
 */
export function buildMassIntentionLiturgy(
  massIntention: MassIntentionWithRelations,
  templateId: string = 'mass-intention-summary-english'
): LiturgyDocument {
  const template = MASS_INTENTION_TEMPLATES[templateId] || MASS_INTENTION_TEMPLATES['mass-intention-summary-english']
  return template.builder(massIntention)
}
