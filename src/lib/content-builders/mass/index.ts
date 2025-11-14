/**
 * Mass Content Builders
 *
 * Template registry and main export for Mass liturgy content builders
 */

import { MassWithRelations } from '@/lib/actions/masses'
import { LiturgyDocument, LiturgyTemplate } from '@/lib/types/liturgy-content'
import { buildFullScriptEnglish } from './templates/full-script-english'
import { buildFullScriptSpanish } from './templates/full-script-spanish'
import { buildReadingsOnly } from './templates/readings-only'

// Export shared helpers for use in templates
export * from './helpers'

/**
 * Template Registry
 * Add new Mass templates here as they are created
 */
export const MASS_TEMPLATES: Record<string, LiturgyTemplate<MassWithRelations>> = {
  'mass-full-script-english': {
    id: 'mass-full-script-english',
    name: 'Full Mass Script (English)',
    description: 'Complete Mass liturgy with all readings, petitions, and directions',
    supportedLanguages: ['en'],
    builder: buildFullScriptEnglish,
  },
  'mass-full-script-spanish': {
    id: 'mass-full-script-spanish',
    name: 'Guión Completo de Misa (Español)',
    description: 'Liturgia completa de Misa con todas las lecturas, peticiones e indicaciones',
    supportedLanguages: ['es'],
    builder: buildFullScriptSpanish,
  },
  'mass-readings-only': {
    id: 'mass-readings-only',
    name: 'Readings Only',
    description: 'Mass readings and petitions without full liturgy script',
    supportedLanguages: ['en', 'es'],
    builder: buildReadingsOnly,
  },
}

/**
 * Main export: Build Mass liturgy content
 */
export function buildMassLiturgy(
  mass: MassWithRelations,
  templateId: string = 'mass-full-script-english'
): LiturgyDocument {
  const template = MASS_TEMPLATES[templateId] || MASS_TEMPLATES['mass-full-script-english']
  return template.builder(mass)
}
