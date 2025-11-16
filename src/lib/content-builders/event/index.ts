/**
 * Event Content Builder
 *
 * Template registry and main builder function for event liturgy documents
 */

import { EventWithRelations } from '@/lib/actions/events'
import { LiturgyDocument } from '@/lib/types/liturgy-content'
import { buildFullScriptEnglish } from './templates/full-script-english'
import { buildFullScriptSpanish } from './templates/full-script-spanish'

/**
 * Available event template types
 */
export type EventTemplateType = 'full-script'

/**
 * Template builder function type
 */
type EventTemplateBuilder = (event: EventWithRelations) => LiturgyDocument

/**
 * Template registry mapping template types and languages to builder functions
 */
const TEMPLATE_REGISTRY: Record<
  EventTemplateType,
  Record<'en' | 'es', EventTemplateBuilder>
> = {
  'full-script': {
    en: buildFullScriptEnglish,
    es: buildFullScriptSpanish,
  },
}

/**
 * Build event liturgy document
 *
 * @param event - Event data with relations
 * @param template - Template type (default: 'full-script')
 * @param language - Language code (default: 'en')
 * @returns LiturgyDocument ready for rendering
 */
export function buildEventLiturgy(
  event: EventWithRelations,
  template: EventTemplateType = 'full-script',
  language: 'en' | 'es' = 'en'
): LiturgyDocument {
  const builder = TEMPLATE_REGISTRY[template]?.[language]

  if (!builder) {
    throw new Error(`Template not found: ${template} (${language})`)
  }

  return builder(event)
}
