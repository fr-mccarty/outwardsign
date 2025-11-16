/**
 * Event Content Builder
 *
 * Template registry and main builder function for event liturgy documents
 */

import { EventWithRelations } from '@/lib/actions/events'
import { LiturgyDocument, LiturgyTemplate } from '@/lib/types/liturgy-content'
import { buildFullScriptEnglish } from './templates/full-script-english'
import { buildFullScriptSpanish } from './templates/full-script-spanish'

/**
 * Standard template registry following the module pattern
 */
export const EVENT_TEMPLATES: Record<string, LiturgyTemplate<EventWithRelations>> = {
  'event-full-script-english': {
    id: 'event-full-script-english',
    name: 'Full Script (English)',
    description: 'Complete event script with all details in English',
    supportedLanguages: ['en'],
    builder: buildFullScriptEnglish,
  },
  'event-full-script-spanish': {
    id: 'event-full-script-spanish',
    name: 'Guión Completo (Español)',
    description: 'Guión completo del evento con todos los detalles en español',
    supportedLanguages: ['es'],
    builder: buildFullScriptSpanish,
  },
}

/**
 * Build event liturgy document using template ID
 *
 * @param event - Event data with relations
 * @param templateId - Template ID (e.g., 'event-full-script-english')
 * @returns LiturgyDocument ready for rendering
 */
export function buildEventLiturgy(
  event: EventWithRelations,
  templateId: string
): LiturgyDocument {
  const template = EVENT_TEMPLATES[templateId]

  if (!template) {
    throw new Error(`Template not found: ${templateId}`)
  }

  return template.builder(event)
}
