/**
 * Quinceañera Petition Templates
 */

import { quinceaneraEnglishDefault } from './english-default'
import { quinceaneraSpanishDefault } from './spanish-default'

/**
 * Template interface
 */
export interface QuinceaneraPetitionTemplate {
  id: string
  name: string
  description: string
  build: (quinceaneraName: string) => string[]
}

/**
 * All quinceañera templates
 */
export const quinceaneraTemplates: QuinceaneraPetitionTemplate[] = [
  quinceaneraEnglishDefault,
  quinceaneraSpanishDefault,
]

/**
 * Get quinceañera template by ID
 */
export function getQuinceaneraTemplateById(id: string): QuinceaneraPetitionTemplate | undefined {
  return quinceaneraTemplates.find(t => t.id === id)
}

/**
 * Build petitions from template
 */
export function buildQuinceaneraPetitions(
  templateId: string,
  quinceaneraName: string
): string[] {
  const template = getQuinceaneraTemplateById(templateId)
  if (!template) {
    throw new Error(`Quinceañera template not found: ${templateId}`)
  }
  return template.build(quinceaneraName)
}
