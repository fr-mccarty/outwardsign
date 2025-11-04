/**
 * Wedding Petition Content Builder
 *
 * Builds petition content based on wedding data and selected template
 */

import { WeddingWithRelations } from '@/lib/actions/weddings'
import { PetitionCollection, PetitionContent, PetitionTemplateId } from './types'

/**
 * Build wedding petitions from template
 */
export function buildWeddingPetitions(
  wedding: WeddingWithRelations,
  templateId: PetitionTemplateId = 'wedding-english-default'
): PetitionCollection {
  // Extract names - use actual names or empty string, no placeholders
  const brideName = wedding.bride?.first_name || ''
  const groomName = wedding.groom?.first_name || ''

  // Build petitions based on template
  switch (templateId) {
    case 'wedding-english-default':
      return buildEnglishDefaultPetitions(brideName, groomName)
    case 'wedding-spanish-default':
      return buildSpanishDefaultPetitions(brideName, groomName)
    default:
      return buildEnglishDefaultPetitions(brideName, groomName)
  }
}

/**
 * Build English default wedding petitions
 */
function buildEnglishDefaultPetitions(
  brideName: string,
  groomName: string
): PetitionCollection {
  const petitions: PetitionContent[] = [
    {
      text: `For ${brideName} and ${groomName}, joined now in marriage, that their love will grow and their commitment will deepen every day`,
    },
    {
      text: `For the parents and grandparents of ${brideName} and ${groomName}, without whose dedication to God and family we would not be gathered here today, that they will be blessed as they gain a son or daughter`,
    },
    {
      text: `For the families and friends of ${brideName} and ${groomName}, gathered here today, that they continue to enrich each other with love and support through the years`,
    },
    {
      text: 'For all married couples, that they may continue to give, be able to forgive, and experience deeper joy with each passing day',
    },
    {
      text: 'For young people preparing for marriage, that they may have the wisdom and patience to build relationships founded on mutual respect and self-giving love',
    },
    {
      text: 'For those who are sick, lonely, or suffering, that they may know the healing presence of Christ',
    },
    {
      text: 'For all who have died, especially the deceased members of our families, that they may enjoy eternal life in the presence of God',
    },
  ]

  return { petitions }
}

/**
 * Build Spanish default wedding petitions
 */
function buildSpanishDefaultPetitions(
  brideName: string,
  groomName: string
): PetitionCollection {
  const petitions: PetitionContent[] = [
    {
      text: `Por ${brideName} y ${groomName}, que su amor crezca y su compromiso se profundice cada día`,
    },
    {
      text: `Por los padres y abuelos de ${brideName} y ${groomName}, que sean bendecidos al recibir un hijo o una hija`,
    },
    {
      text: `Por las familias y amigos de ${brideName} y ${groomName}, que continúen enriqueciéndose mutuamente con amor y apoyo`,
    },
    {
      text: 'Por todos los matrimonios, que puedan continuar dando, perdonando y experimentando mayor alegría cada día',
    },
    {
      text: 'Por los jóvenes que se preparan para el matrimonio, que tengan la sabiduría y la paciencia para construir relaciones fundadas en el respeto mutuo',
    },
    {
      text: 'Por los enfermos, los solitarios y los que sufren, que conozcan la presencia sanadora de Cristo',
    },
    {
      text: 'Por todos los difuntos, especialmente los miembros fallecidos de nuestras familias, que gocen de la vida eterna en la presencia de Dios',
    },
  ]

  return { petitions }
}

/**
 * Get available templates for weddings
 */
export function getWeddingPetitionTemplates(): Array<{
  id: PetitionTemplateId
  name: string
  description: string
}> {
  return [
    {
      id: 'wedding-english-default',
      name: 'Wedding (English) - Default',
      description: 'Standard wedding petitions in English',
    },
    {
      id: 'wedding-spanish-default',
      name: 'Wedding (Spanish) - Default',
      description: 'Peticiones estándar para bodas en español',
    },
  ]
}
