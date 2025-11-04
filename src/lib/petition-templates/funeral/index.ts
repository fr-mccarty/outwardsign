/**
 * Funeral Petition Templates
 */

import { funeralEnglishDefault } from './english-default'

/**
 * Template interface
 */
export interface FuneralPetitionTemplate {
  id: string
  name: string
  description: string
  build: (deceasedName: string, gender?: 'male' | 'female' | 'unknown') => string[]
}

/**
 * All funeral templates
 */
export const funeralTemplates: FuneralPetitionTemplate[] = [
  funeralEnglishDefault,
]

/**
 * Get funeral template by ID
 */
export function getFuneralTemplateById(id: string): FuneralPetitionTemplate | undefined {
  return funeralTemplates.find(t => t.id === id)
}

/**
 * Build petitions from template
 */
export function buildFuneralPetitions(
  templateId: string,
  deceasedName: string,
  gender?: 'male' | 'female' | 'unknown'
): string[] {
  const template = getFuneralTemplateById(templateId)
  if (!template) {
    throw new Error(`Funeral template not found: ${templateId}`)
  }
  return template.build(deceasedName, gender)
}
