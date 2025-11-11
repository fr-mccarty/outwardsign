/**
 * Mass Full Script (Spanish) Template
 *
 * Liturgia completa de Misa con todas las lecturas, peticiones e indicaciones
 */

import { MassWithRelations } from '@/lib/actions/masses'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatEventDateTime } from '@/lib/utils/formatters'
import {
  buildPetitionsSection,
} from '@/lib/content-builders/shared/script-sections'

/**
 * Build summary section (Mass info, liturgical event, ministers) - Spanish
 */
function buildSummarySection(mass: MassWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Mass Information
  elements.push({
    type: 'section-title',
    text: 'Información de la Misa',
  })

  if (mass.event?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Fecha y Hora:',
      value: formatEventDateTime(mass.event),
    })
  }

  if (mass.event?.location) {
    const location = mass.event.location
    const locationText = location.name +
      (location.street || location.city ?
        ` (${[location.street, location.city, location.state].filter(Boolean).join(', ')})` :
        '')
    elements.push({
      type: 'info-row',
      label: 'Lugar:',
      value: locationText,
    })
  }

  // Liturgical Event
  if (mass.liturgical_event) {
    const eventData = mass.liturgical_event.event_data as any
    if (eventData?.name) {
      elements.push({
        type: 'info-row',
        label: 'Evento Litúrgico:',
        value: `${eventData.name}${eventData.liturgical_season ? ` (${eventData.liturgical_season})` : ''}`,
      })
    }
  }

  // Ministers
  elements.push({
    type: 'section-title',
    text: 'Ministros',
  })

  if (mass.presider) {
    elements.push({
      type: 'info-row',
      label: 'Celebrante:',
      value: formatPersonName(mass.presider),
    })
  }

  if (mass.homilist && mass.homilist.id !== mass.presider?.id) {
    elements.push({
      type: 'info-row',
      label: 'Homilista:',
      value: formatPersonName(mass.homilist),
    })
  }

  if (mass.pre_mass_announcement_person) {
    elements.push({
      type: 'info-row',
      label: 'Anuncios pre-Misa:',
      value: formatPersonName(mass.pre_mass_announcement_person),
    })
  }

  return {
    id: 'summary',
    title: 'Resumen de la Misa',
    elements,
  }
}

/**
 * Build liturgy section with Mass structure - Spanish
 */
function buildLiturgySection(mass: MassWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Ritos Iniciales
  elements.push({
    type: 'section-title',
    text: 'RITOS INICIALES',
  })

  elements.push({
    type: 'text',
    formatting: ['italic'],
    text: '[El sacerdote y los ministros entran en procesión]',
  })

  elements.push({
    type: 'section-title',
    text: 'Canto de Entrada',
  })

  elements.push({
    type: 'text',
    formatting: ['italic'],
    text: '[Se canta el himno de entrada mientras la procesión entra]',
  })

  elements.push({
    type: 'section-title',
    text: 'Saludo',
  })

  elements.push({
    type: 'priest-dialogue',
    text: 'En el nombre del Padre, y del Hijo, y del Espíritu Santo.',
  })

  elements.push({
    type: 'text',
    text: 'Amén.',
  })

  elements.push({
    type: 'priest-dialogue',
    text: 'La gracia de nuestro Señor Jesucristo, el amor del Padre y la comunión del Espíritu Santo estén con todos ustedes.',
  })

  elements.push({
    type: 'text',
    text: 'Y con tu espíritu.',
  })

  // Anuncios pre-Misa
  if (mass.announcements || mass.pre_mass_announcement_person) {
    elements.push({
      type: 'section-title',
      text: 'Anuncios',
    })

    if (mass.pre_mass_announcement_person) {
      elements.push({
        type: 'text',
        formatting: ['italic'],
        text: `[Anuncios por ${formatPersonName(mass.pre_mass_announcement_person)}${mass.pre_mass_announcement_topic ? ` - ${mass.pre_mass_announcement_topic}` : ''}]`,
      })
    }

    if (mass.announcements) {
      elements.push({
        type: 'text',
        text: mass.announcements,
      })
    }
  }

  // Acto Penitencial
  elements.push({
    type: 'section-title',
    text: 'Acto Penitencial',
  })

  elements.push({
    type: 'priest-dialogue',
    text: 'Hermanos, reconozcamos nuestros pecados, para prepararnos a celebrar los sagrados misterios.',
  })

  elements.push({
    type: 'text',
    formatting: ['italic'],
    text: '[Breve pausa para el silencio]',
  })

  elements.push({
    type: 'priest-dialogue',
    text: 'Yo confieso ante Dios todopoderoso y ante ustedes, hermanos, que he pecado mucho de pensamiento, palabra, obra y omisión. Por mi culpa, por mi culpa, por mi gran culpa. Por eso ruego a Santa María, siempre Virgen, a los ángeles, a los santos y a ustedes, hermanos, que intercedan por mí ante Dios, nuestro Señor.',
  })

  elements.push({
    type: 'priest-dialogue',
    text: 'Dios todopoderoso tenga misericordia de nosotros, perdone nuestros pecados y nos lleve a la vida eterna.',
  })

  elements.push({
    type: 'text',
    text: 'Amén.',
  })

  // Gloria
  elements.push({
    type: 'section-title',
    text: 'Gloria',
  })

  elements.push({
    type: 'text',
    formatting: ['italic'],
    text: '[Se canta o se dice el Gloria]',
  })

  // Colecta
  elements.push({
    type: 'section-title',
    text: 'Oración Colecta',
  })

  elements.push({
    type: 'priest-dialogue',
    text: 'Oremos.',
  })

  elements.push({
    type: 'text',
    formatting: ['italic'],
    text: '[Breve pausa para la oración en silencio]',
  })

  elements.push({
    type: 'text',
    formatting: ['italic'],
    text: '[El sacerdote dice la Colecta del día]',
  })

  // Liturgia de la Palabra
  elements.push({
    type: 'section-title',
    text: 'LITURGIA DE LA PALABRA',
  })

  elements.push({
    type: 'section-title',
    text: 'Primera Lectura',
  })

  elements.push({
    type: 'text',
    formatting: ['italic'],
    text: '[Se proclama la primera lectura del Leccionario]',
  })

  elements.push({
    type: 'section-title',
    text: 'Salmo Responsorial',
  })

  elements.push({
    type: 'text',
    formatting: ['italic'],
    text: '[Se canta o se recita el salmo responsorial]',
  })

  elements.push({
    type: 'section-title',
    text: 'Segunda Lectura',
  })

  elements.push({
    type: 'text',
    formatting: ['italic'],
    text: '[Se proclama la segunda lectura del Leccionario]',
  })

  elements.push({
    type: 'section-title',
    text: 'Aclamación del Evangelio',
  })

  elements.push({
    type: 'text',
    formatting: ['italic'],
    text: '[Todos de pie]',
  })

  elements.push({
    type: 'text',
    text: 'Aleluya, aleluya.',
  })

  elements.push({
    type: 'section-title',
    text: 'Evangelio',
  })

  elements.push({
    type: 'priest-dialogue',
    text: 'El Señor esté con ustedes.',
  })

  elements.push({
    type: 'text',
    text: 'Y con tu espíritu.',
  })

  elements.push({
    type: 'text',
    formatting: ['italic'],
    text: '[Se proclama el Evangelio]',
  })

  // Homilía
  elements.push({
    type: 'section-title',
    text: 'Homilía',
  })

  const homilist = mass.homilist || mass.presider
  if (homilist) {
    elements.push({
      type: 'text',
      formatting: ['italic'],
      text: `[Homilía por ${formatPersonName(homilist)}]`,
    })
  } else {
    elements.push({
      type: 'text',
      formatting: ['italic'],
      text: '[Homilía]',
    })
  }

  return {
    id: 'liturgy',
    title: 'Liturgia de la Misa',
    elements,
  }
}

/**
 * Build Universal Prayer (Prayer of the Faithful) section - Spanish
 */
function buildUniversalPrayerSection(mass: MassWithRelations): ContentSection | null {
  if (!mass.petitions) return null

  return buildPetitionsSection({
    petitions: mass.petitions
  })
}

/**
 * Build main export function - Spanish
 */
export function buildFullScriptSpanish(mass: MassWithRelations): LiturgyDocument {
  const sections: ContentSection[] = []

  // Summary section
  sections.push(buildSummarySection(mass))

  // Liturgy section
  sections.push(buildLiturgySection(mass))

  // Universal Prayer (Petitions)
  const petitionsSection = buildUniversalPrayerSection(mass)
  if (petitionsSection) {
    sections.push(petitionsSection)
  }

  return {
    id: mass.id,
    type: 'mass',
    language: 'es',
    template: 'mass-full-script-spanish',
    title: 'Liturgia de la Misa',
    sections,
  }
}
