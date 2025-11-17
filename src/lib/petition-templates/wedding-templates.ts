/**
 * Default petition templates for weddings
 * Variables use {{variable_name}} syntax
 * Available variables: {{bride_name}}, {{groom_name}}
 */

export interface PetitionTemplate {
  id: string
  name: string
  description?: string
  petitions: string[]
}

export const WEDDING_PETITION_TEMPLATES: PetitionTemplate[] = [
  {
    id: 'wedding-english-default',
    name: 'Wedding (English) - Default',
    description: 'Standard wedding petitions in English',
    petitions: [
      'For {{bride_name}} and {{groom_name}}, joined now in marriage, that their love will grow and their commitment will deepen every day',
      'For the parents and grandparents of {{bride_name}} and {{groom_name}}, without whose dedication to God and family we would not be gathered here today, that they will be blessed as they gain a son or daughter',
      'For the families and friends of {{bride_name}} and {{groom_name}}, gathered here today, that they continue to enrich each other with love and support through the years',
      'For all married couples, that they may continue to give, be able to forgive, and experience deeper joy with each passing day',
      'For young people preparing for marriage, that they may have the wisdom and patience to build relationships founded on mutual respect and self-giving love',
      'For those who are sick, lonely, or suffering, that they may know the healing presence of Christ',
      'For all who have died, especially the deceased members of our families, that they may enjoy eternal life in the presence of God',
    ],
  },
  {
    id: 'wedding-english-traditional',
    name: 'Wedding (English) - Traditional',
    description: 'Traditional wedding petitions',
    petitions: [
      'That God will bless the covenant of {{bride_name}} and {{groom_name}} as he chose to sanctify marriage at Cana in Galilee',
      'That they be granted perfect and fruitful love, peace and strength, and that they bear faithful witness to the name of Christian',
      'That the Christian people may grow in virtue day by day and that all who are burdened by any need may receive the help of grace from above',
      'That the grace of the Sacrament will be renewed by the Holy Spirit in all married persons here present',
    ],
  },
  {
    id: 'wedding-spanish-default',
    name: 'Wedding (Spanish) - Default',
    description: 'Standard wedding petitions in Spanish',
    petitions: [
      'Por {{bride_name}} y {{groom_name}}, que su amor crezca y su compromiso se profundice cada día',
      'Por los padres y abuelos de {{bride_name}} y {{groom_name}}, que sean bendecidos al recibir un hijo o una hija',
      'Por las familias y amigos de {{bride_name}} y {{groom_name}}, que continúen enriqueciéndose mutuamente con amor y apoyo',
      'Por todos los matrimonios, que puedan continuar dando, perdonando y experimentando mayor alegría cada día',
      'Por los jóvenes que se preparan para el matrimonio, que tengan la sabiduría y la paciencia para construir relaciones fundadas en el respeto mutuo',
      'Por los enfermos, los solitarios y los que sufren, que conozcan la presencia sanadora de Cristo',
      'Por todos los difuntos, especialmente los miembros fallecidos de nuestras familias, que gocen de la vida eterna en la presencia de Dios',
    ],
  },
]

/**
 * Get the default wedding template (first in list)
 */
export function getDefaultWeddingTemplate(): PetitionTemplate {
  return WEDDING_PETITION_TEMPLATES[0]
}

/**
 * Get wedding template by ID
 */
export function getWeddingTemplateById(id: string): PetitionTemplate | undefined {
  return WEDDING_PETITION_TEMPLATES.find(t => t.id === id)
}
