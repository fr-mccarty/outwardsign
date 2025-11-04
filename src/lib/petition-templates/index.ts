/**
 * Central export for all petition templates
 */

export * from './wedding-templates'

// Import types
import { PetitionTemplate } from './wedding-templates'

/**
 * Module type for petitions
 */
export type PetitionModuleType = 'wedding' | 'funeral' | 'baptism' | 'presentation' | 'general'

/**
 * Template for funerals
 * Uses gender-aware pronouns: {{he_she}}, {{him_her}}, {{his_her}}
 */
export const FUNERAL_PETITION_TEMPLATES: PetitionTemplate[] = [
  {
    id: 'funeral-english-default',
    name: 'Funeral (English) - Default',
    description: 'Standard funeral petitions in English',
    petitions: [
      'For {{deceased_name}}, that {{he_she}} may rest in eternal peace and enjoy the fullness of God\'s love',
      'For {{deceased_name}}, that the good {{he_she}} did in life may inspire us and that {{his_her}} faith may be rewarded',
      'For the family and friends who mourn, that they may find comfort in God\'s love and the support of this community',
      'For all the faithful departed, especially those who have no one to pray for them, that they may rest in peace',
      'For those who minister to the grieving and dying, that they may be strengthened in their service',
      'For our community, that we may support one another in times of loss and sorrow',
      'For all who are sick and approaching death, that they may know God\'s peace',
      'For ourselves, that we may be prepared for our own journey to eternal life',
    ],
  },
  {
    id: 'funeral-spanish-default',
    name: 'Funeral (Spanish) - Default',
    description: 'Peticiones estándar para funerales en español',
    petitions: [
      'Por {{deceased_name}}, para que {{el_la}} {{difunto_difunta}} descanse en paz eterna y goce de la plenitud del amor de Dios',
      'Por {{deceased_name}}, para que el bien que hizo en vida nos inspire y su fe sea recompensada',
      'Por la familia y amigos que lloran, para que encuentren consuelo en el amor de Dios y el apoyo de esta comunidad',
      'Por todos los fieles difuntos, especialmente por aquellos que no tienen quien rece por ellos, para que descansen en paz',
      'Por aquellos que ministran a los afligidos y moribundos, para que sean fortalecidos en su servicio',
      'Por nuestra comunidad, para que nos apoyemos unos a otros en tiempos de pérdida y dolor',
      'Por todos los que están enfermos y se acercan a la muerte, para que conozcan la paz de Dios',
      'Por nosotros mismos, para que estemos preparados para nuestro propio viaje a la vida eterna',
    ],
  },
]

/**
 * Template for baptisms
 * Uses gender-aware pronouns for child
 */
export const BAPTISM_PETITION_TEMPLATES: PetitionTemplate[] = [
  {
    id: 'baptism-english-default',
    name: 'Baptism (English) - Default',
    description: 'Standard baptism petitions in English',
    petitions: [
      'For {{child_name}}, who is being baptized today, that {{he_she}} may grow in faith, hope, and love',
      'For {{child_name}}\'s parents, {{parent_names}}, that they may be faithful examples of Christian life for their child',
      'For {{child_name}}\'s godparents, that they may support and guide {{him_her}} in {{his_her}} faith journey',
      'For all parents, that they may have the wisdom and strength to raise their children in the faith',
      'For our parish community, that we may welcome and support all who are newly baptized',
      'For all children, that they may know God\'s love and grow to be faithful disciples',
    ],
  },
  {
    id: 'baptism-spanish-default',
    name: 'Baptism (Spanish) - Default',
    description: 'Peticiones estándar para bautismos en español',
    petitions: [
      'Por {{child_name}}, que está siendo {{bautizado_bautizada}} hoy, para que crezca en fe, esperanza y amor',
      'Por los padres de {{child_name}}, {{parent_names}}, para que sean ejemplos fieles de vida cristiana para su {{hijo_hija}}',
      'Por los padrinos de {{child_name}}, para que apoyen y guíen {{al_a_la}} {{niño_niña}} en su camino de fe',
      'Por todos los padres, para que tengan la sabiduría y la fuerza para criar a sus hijos en la fe',
      'Por nuestra comunidad parroquial, para que acojamos y apoyemos a todos los recién bautizados',
      'Por todos los niños, para que conozcan el amor de Dios y crezcan para ser discípulos fieles',
    ],
  },
]

/**
 * Template for presentations
 * Uses gender-aware pronouns for child
 */
export const PRESENTATION_PETITION_TEMPLATES: PetitionTemplate[] = [
  {
    id: 'presentation-english-default',
    name: 'Presentation (English) - Default',
    description: 'Standard presentation petitions in English',
    petitions: [
      'For {{child_name}}, who is being presented today, that {{he_she}} may always know God\'s love and protection',
      'For {{child_name}}\'s parents, that they may guide their child in faith and love',
      'For all families, that they may be united in love and supported by this community',
      'For our parish, that we may welcome and nurture all children in the faith',
    ],
  },
  {
    id: 'presentation-spanish-default',
    name: 'Presentation (Spanish) - Default',
    description: 'Peticiones estándar para presentaciones en español',
    petitions: [
      'Por {{child_name}}, que está siendo {{presentado_presentada}} hoy, para que siempre conozca el amor y la protección de Dios',
      'Por los padres de {{child_name}}, para que guíen a su {{hijo_hija}} en la fe y el amor',
      'Por todas las familias, para que estén unidas en amor y apoyadas por esta comunidad',
      'Por nuestra parroquia, para que acojamos y nutriamos a todos los niños en la fe',
    ],
  },
]

/**
 * General petition templates (for Mass, etc.)
 */
export const GENERAL_PETITION_TEMPLATES: PetitionTemplate[] = [
  {
    id: 'sunday-mass-english',
    name: 'Sunday Mass (English)',
    description: 'Standard Sunday Mass petitions',
    petitions: [
      'For our Holy Father, our Bishop, and all the clergy, that they may faithfully shepherd God\'s people',
      'For our nation\'s leaders and all who serve in public office, that they may work for justice and peace',
      'For peace in our world and protection of the innocent, especially those suffering from war and violence',
      'For the unemployed and those struggling with financial hardship, that they may find help and hope',
      'For the sick and those who minister to them, that they may know God\'s healing presence',
      'For our young people and all who guide them, that they may grow in faith and wisdom',
      'For our deceased parishioners and all who have gone before us, that they may rest in peace',
      'For our parish community and all our special intentions',
    ],
  },
]

/**
 * Get templates by module type
 */
export function getTemplatesByModule(moduleType: PetitionModuleType): PetitionTemplate[] {
  switch (moduleType) {
    case 'wedding':
      // Import wedding templates
      const { WEDDING_PETITION_TEMPLATES } = require('./wedding-templates')
      return WEDDING_PETITION_TEMPLATES
    case 'funeral':
      return FUNERAL_PETITION_TEMPLATES
    case 'baptism':
      return BAPTISM_PETITION_TEMPLATES
    case 'presentation':
      return PRESENTATION_PETITION_TEMPLATES
    case 'general':
      return GENERAL_PETITION_TEMPLATES
    default:
      return GENERAL_PETITION_TEMPLATES
  }
}

// Re-export the type
export type { PetitionTemplate }
