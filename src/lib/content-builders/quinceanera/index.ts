/**
 * Quinceañera Content Builders
 *
 * Template registry and main export for quinceañera liturgy content builders
 */

import { QuinceaneraWithRelations } from '@/lib/actions/quinceaneras'
import { LiturgyDocument, LiturgyTemplate } from '@/lib/types/liturgy-content'
import { buildFullScriptEnglish } from './templates/full-script-english'
import { buildFullScriptSpanish } from './templates/full-script-spanish'

/**
 * Template Registry
 * Add new quinceañera templates here as they are created
 */
export const QUINCEANERA_TEMPLATES: Record<string, LiturgyTemplate<QuinceaneraWithRelations>> = {
  'quinceanera-full-script-english': {
    id: 'quinceanera-full-script-english',
    name: 'Full Ceremony Script (English)',
    description: 'Complete quinceañera liturgy with all readings, responses, and directions',
    supportedLanguages: ['en'],
    builder: buildFullScriptEnglish,
  },
  'quinceanera-full-script-spanish': {
    id: 'quinceanera-full-script-spanish',
    name: 'Guión Completo de la Ceremonia (Español)',
    description: 'Liturgia completa de quinceañera con todas las lecturas, respuestas e instrucciones',
    supportedLanguages: ['es'],
    builder: buildFullScriptSpanish,
  },
}

/**
 * Main export: Build quinceañera liturgy content
 */
export function buildQuinceaneraLiturgy(
  quinceanera: QuinceaneraWithRelations,
  templateId: string = 'quinceanera-full-script-english'
): LiturgyDocument {
  const template = QUINCEANERA_TEMPLATES[templateId] || QUINCEANERA_TEMPLATES['quinceanera-full-script-english']
  return template.builder(quinceanera)
}
