/**
 * Mass Content Builders
 *
 * Template registry and main export for Mass liturgy content builders
 */

import { MassWithRelations } from '@/lib/actions/masses'
import { LiturgyDocument, LiturgyTemplate } from '@/lib/types/liturgy-content'
import { buildMassEnglish } from './templates/english'
import { buildMassSpanish } from './templates/spanish'

// Export shared helpers for use in templates
export * from './helpers'

/**
 * Template Registry
 * Add new Mass templates here as they are created
 */
export const MASS_TEMPLATES: Record<string, LiturgyTemplate<MassWithRelations>> = {
  'mass-english': {
    id: 'mass-english',
    name: 'Mass (English)',
    description: 'Mass information, ministers, petitions, and announcements',
    supportedLanguages: ['en'],
    builder: buildMassEnglish,
  },
  'mass-spanish': {
    id: 'mass-spanish',
    name: 'Misa (Español)',
    description: 'Información de la misa, ministros, peticiones y anuncios',
    supportedLanguages: ['es'],
    builder: buildMassSpanish,
  },
}

/**
 * Main export: Build Mass liturgy content
 */
export function buildMassLiturgy(
  mass: MassWithRelations,
  templateId: string = 'mass-english'
): LiturgyDocument {
  const template = MASS_TEMPLATES[templateId] || MASS_TEMPLATES['mass-english']
  return template.builder(mass)
}
