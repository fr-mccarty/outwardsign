/**
 * Mass Intention Content Builders
 *
 * Template registry and main export for Mass Intention content builders
 */

import { MassIntentionWithRelations } from '@/lib/actions/mass-intentions'
import { LiturgyDocument, LiturgyTemplate } from '@/lib/types/liturgy-content'
import { buildIntentionSummary } from './templates/intention-summary'

/**
 * Template Registry
 * Add new Mass Intention templates here as they are created
 */
export const MASS_INTENTION_TEMPLATES: Record<string, LiturgyTemplate<MassIntentionWithRelations>> = {
  'mass-intention-summary': {
    id: 'mass-intention-summary',
    name: 'Mass Intention Summary',
    description: 'Summary of mass intention details',
    supportedLanguages: ['en', 'es'],
    builder: buildIntentionSummary,
  },
}

/**
 * Main export: Build Mass Intention content
 */
export function buildMassIntentionLiturgy(
  massIntention: MassIntentionWithRelations,
  templateId: string = 'mass-intention-summary'
): LiturgyDocument {
  const template = MASS_INTENTION_TEMPLATES[templateId] || MASS_INTENTION_TEMPLATES['mass-intention-summary']
  return template.builder(massIntention)
}
