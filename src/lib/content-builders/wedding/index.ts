/**
 * Wedding Content Builders
 *
 * Template registry and main export for wedding liturgy content builders
 */

import { WeddingWithRelations } from '@/lib/actions/weddings'
import { LiturgyDocument, LiturgyTemplate } from '@/lib/types/liturgy-content'
import { buildFullScriptEnglish } from './templates/full-script-english'
import { buildFullScriptSpanish } from './templates/full-script-spanish'

// Export shared helpers for use in templates
export * from './helpers'

/**
 * Template Registry
 * Add new wedding templates here as they are created
 */
export const WEDDING_TEMPLATES: Record<string, LiturgyTemplate<WeddingWithRelations>> = {
  'wedding-full-script-english': {
    id: 'wedding-full-script-english',
    name: 'Full Ceremony Script (English)',
    description: 'Complete wedding liturgy with all readings, responses, and directions',
    supportedLanguages: ['en'],
    builder: buildFullScriptEnglish,
  },
  'wedding-full-script-spanish': {
    id: 'wedding-full-script-spanish',
    name: 'Guión Completo de la Ceremonia (Español)',
    description: 'Liturgia completa de boda con todas las lecturas, respuestas e indicaciones',
    supportedLanguages: ['es'],
    builder: buildFullScriptSpanish,
  },
  // Future templates:
  // 'wedding-readings-only-english': { ... },
  // 'wedding-summary-card-english': { ... },
}

/**
 * Main export: Build wedding liturgy content
 */
export function buildWeddingLiturgy(
  wedding: WeddingWithRelations,
  templateId: string = 'wedding-full-script-english'
): LiturgyDocument {
  const template = WEDDING_TEMPLATES[templateId] || WEDDING_TEMPLATES['wedding-full-script-english']
  return template.builder(wedding)
}
