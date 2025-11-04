/**
 * Presentation Content Builders
 *
 * Template registry and main export for presentation liturgy content builders
 */

import { PresentationWithRelations } from '@/lib/actions/presentations'
import { LiturgyDocument, LiturgyTemplate } from '@/lib/types/liturgy-content'
import { buildFullScriptSpanish } from './templates/full-script-spanish'
import { buildFullScriptEnglish } from './templates/full-script-english'

/**
 * Template Registry
 * Add new presentation templates here as they are created
 */
export const PRESENTATION_TEMPLATES: Record<string, LiturgyTemplate<PresentationWithRelations>> = {
  'presentation-spanish': {
    id: 'presentation-spanish',
    name: 'Presentación en el Templo (Español)',
    description: 'Complete presentation liturgy in Spanish',
    supportedLanguages: ['es'],
    builder: buildFullScriptSpanish,
  },
  'presentation-english': {
    id: 'presentation-english',
    name: 'Presentation in the Temple (English)',
    description: 'Complete presentation liturgy in English',
    supportedLanguages: ['en'],
    builder: buildFullScriptEnglish,
  },
}

/**
 * Main export: Build presentation liturgy content
 */
export function buildPresentationLiturgy(
  presentation: PresentationWithRelations,
  templateId: string = 'presentation-spanish'
): LiturgyDocument {
  const template = PRESENTATION_TEMPLATES[templateId] || PRESENTATION_TEMPLATES['presentation-spanish']
  return template.builder(presentation)
}
