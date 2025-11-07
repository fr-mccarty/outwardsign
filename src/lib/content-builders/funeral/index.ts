/**
 * Funeral Content Builders
 *
 * Template registry and main export for funeral liturgy content builders
 */

import { FuneralWithRelations } from '@/lib/actions/funerals'
import { LiturgyDocument, LiturgyTemplate } from '@/lib/types/liturgy-content'
import { buildFullScriptEnglish } from './templates/full-script-english'
import { buildFullScriptSpanish } from './templates/full-script-spanish'

/**
 * Template Registry
 * Add new funeral templates here as they are created
 */
export const FUNERAL_TEMPLATES: Record<string, LiturgyTemplate<FuneralWithRelations>> = {
  'funeral-full-script-english': {
    id: 'funeral-full-script-english',
    name: 'Full Funeral Liturgy Script (English)',
    description: 'Complete funeral liturgy with all readings, responses, and directions',
    supportedLanguages: ['en'],
    builder: buildFullScriptEnglish,
  },
  'funeral-full-script-spanish': {
    id: 'funeral-full-script-spanish',
    name: 'Guión Completo de la Liturgia Fúnebre (Español)',
    description: 'Liturgia fúnebre completa con todas las lecturas, respuestas e indicaciones',
    supportedLanguages: ['es'],
    builder: buildFullScriptSpanish,
  },
  // Future templates:
  // 'funeral-readings-only-english': { ... },
}

/**
 * Main export: Build funeral liturgy content
 */
export function buildFuneralLiturgy(
  funeral: FuneralWithRelations,
  templateId: string = 'funeral-full-script-english'
): LiturgyDocument {
  const template = FUNERAL_TEMPLATES[templateId] || FUNERAL_TEMPLATES['funeral-full-script-english']
  return template.builder(funeral)
}
