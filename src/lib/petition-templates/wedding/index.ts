/**
 * Wedding Petition Templates
 */

import { weddingEnglishDefault } from './english-default'
import { weddingSpanishDefault } from './spanish-default'
import { weddingTraditional } from './traditional'

/**
 * Template interface
 */
export interface WeddingPetitionTemplate {
  id: string
  name: string
  description: string
  build: (brideName: string, groomName: string) => string[]
}

/**
 * All wedding templates
 */
export const weddingTemplates: WeddingPetitionTemplate[] = [
  weddingEnglishDefault,
  weddingSpanishDefault,
  weddingTraditional,
]

/**
 * Get wedding template by ID
 */
export function getWeddingTemplateById(id: string): WeddingPetitionTemplate | undefined {
  return weddingTemplates.find(t => t.id === id)
}

/**
 * Build petitions from template
 */
export function buildWeddingPetitions(
  templateId: string,
  brideName: string,
  groomName: string
): string[] {
  const template = getWeddingTemplateById(templateId)
  if (!template) {
    throw new Error(`Wedding template not found: ${templateId}`)
  }
  return template.build(brideName, groomName)
}
