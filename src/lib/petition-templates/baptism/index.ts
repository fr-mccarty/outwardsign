/**
 * Baptism Petition Templates
 */

import { baptismEnglishDefault } from './english-default'

/**
 * Template interface
 */
export interface BaptismPetitionTemplate {
  id: string
  name: string
  description: string
  build: (childName: string, parentNames?: string, gender?: 'male' | 'female' | 'unknown') => string[]
}

/**
 * All baptism templates
 */
export const baptismTemplates: BaptismPetitionTemplate[] = [
  baptismEnglishDefault,
]

/**
 * Get baptism template by ID
 */
export function getBaptismTemplateById(id: string): BaptismPetitionTemplate | undefined {
  return baptismTemplates.find(t => t.id === id)
}

/**
 * Build petitions from template
 */
export function buildBaptismPetitions(
  templateId: string,
  childName: string,
  parentNames?: string,
  gender?: 'male' | 'female' | 'unknown'
): string[] {
  const template = getBaptismTemplateById(templateId)
  if (!template) {
    throw new Error(`Baptism template not found: ${templateId}`)
  }
  return template.build(childName, parentNames, gender)
}
