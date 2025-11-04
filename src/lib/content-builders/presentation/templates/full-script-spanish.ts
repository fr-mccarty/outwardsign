/**
 * Presentation Full Script - Spanish
 * Based on the traditional Presentation in the Temple liturgy
 */

import { PresentationWithRelations } from '@/lib/actions/presentations'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatEventDateTime } from '@/lib/utils/formatters'

export function buildFullScriptSpanish(presentation: PresentationWithRelations): LiturgyDocument {
  const child = presentation.child
  const mother = presentation.mother
  const father = presentation.father
  const childName = child ? `${child.first_name} ${child.last_name}` : '[Nombre del Niño/a]'
  const childSex = child?.sex || 'Male'
  const motherName = mother ? `${mother.first_name} ${mother.last_name}` : '[Nombre de la Madre]'
  const fatherName = father ? `${father.first_name} ${father.last_name}` : '[Nombre del Padre]'
  const isBaptized = presentation.is_baptized

  // Helper function for gendered text in Spanish
  const gendered = (maleText: string, femaleText: string) => {
    return childSex === 'Male' ? maleText : femaleText
  }

  const getParentsText = () => {
    return `los padres, ${motherName} y ${fatherName}`
  }

  const getAudienceText = () => 'padres'

  // Build title and subtitle
  const title = `Presentación en el Templo - ${childName}`
  const subtitle = presentation.presentation_event
    ? formatEventDateTime(presentation.presentation_event)
    : undefined

  // Build sections
  const sections: ContentSection[] = []

  // Main Liturgy Section
  const liturgyElements: ContentElement[] = []

  // After the Homily
  liturgyElements.push({
    type: 'section-title',
    text: 'Después de la Homilía',
  })

  liturgyElements.push({
    type: 'text',
    text: '[Después de la Homilía]',
    formatting: ['italic'],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Celebrant invitation
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: 'CELEBRANTE: ',
        formatting: ['bold'],
      },
      {
        text: `La vida es el mayor regalo de Dios para nosotros. Agradecidos por la vida de su ${gendered('hijo', 'hija')}, ${getParentsText()} quisieran presentar a su ${gendered('hijo', 'hija')} ${childName} al Señor y a esta comunidad. Les damos la bienvenida aquí al frente de la iglesia.`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  liturgyElements.push({
    type: 'text',
    text: '[Caminar al frente del altar]',
    formatting: ['italic'],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Commitment question
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: `CELEBRANTE (a los ${getAudienceText()}): `,
        formatting: ['bold'],
      },
      {
        text: `Al presentar a ${gendered('este niño', 'esta niña')} al Señor y a esta comunidad hoy, ${isBaptized ? 'renuevan su compromiso' : 'se comprometen'} a ${gendered('criarlo', 'criarla')} en los caminos de la fe. ¿Entienden y aceptan esta responsabilidad?`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Parents' response
  liturgyElements.push({
    type: 'response',
    parts: [
      {
        text: 'PADRES: ',
        formatting: ['bold'],
      },
      {
        text: 'Sí, aceptamos.',
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Sign of the cross
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: `CELEBRANTE (al ${gendered('niño', 'niña')}): `,
        formatting: ['bold'],
      },
      {
        text: `${isBaptized ? 'Como en el día de tu bautismo, te' : 'Te'} signo con la señal de la cruz, y pido a tus ${getAudienceText()} que hagan lo mismo.`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Prayer
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: 'CELEBRANTE: ',
        formatting: ['bold'],
      },
      {
        text: `Padre Celestial, tú eres el dador de toda vida. Nos diste ${gendered('este hijo', 'esta hija')} y te ${gendered('lo', 'la')} presentamos, como María presentó a Jesús en el templo. Te rogamos por estos ${getAudienceText()}. Bendícelos en sus esfuerzos por criar a ${gendered('este niño', 'esta niña')} como ${gendered('un buen cristiano', 'una buena cristiana')} y como ${gendered('un buen católico', 'una buena católica')}. Bendice a ${gendered('este niño', 'esta niña')}. Dale buena salud, protége${gendered('lo', 'la')} de cualquier peligro del cuerpo y del espíritu, y ayúda${gendered('lo', 'la')} a crecer en edad y en sabiduría, siempre en tu presencia.`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Prayer to Mary
  liturgyElements.push({
    type: 'text',
    text: `Santa María, Madre de Dios y Madre nuestra, pedimos tu protección sobre esta familia y sobre ${gendered('este hijo', 'esta hija')}. Es siguiendo tu ejemplo que esta familia trae a ${gendered('este niño', 'esta niña')} para ser presentado a Dios, nuestro creador, y a esta comunidad hoy. Ayuda a estos padres a criar a ${gendered('este niño', 'esta niña')} con palabra y ejemplo. Hacemos nuestra oración en el nombre de Jesucristo, que es Señor por los siglos de los siglos.`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Assembly response
  liturgyElements.push({
    type: 'response',
    parts: [
      {
        text: 'ASAMBLEA: ',
        formatting: ['bold'],
      },
      {
        text: 'Amén.',
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Blessing of religious articles
  liturgyElements.push({
    type: 'text',
    text: '[Bendecir artículos religiosos]',
    formatting: ['italic'],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Dismissal
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: 'CELEBRANTE: ',
        formatting: ['bold'],
      },
      {
        text: 'Ahora los enviamos de regreso a sus lugares, mientras les mostramos nuestro apoyo con un aplauso.',
      },
    ],
  })

  // Add liturgy section
  sections.push({
    id: 'liturgy',
    title: 'Liturgia de Presentación',
    elements: liturgyElements,
  })

  return {
    id: presentation.id,
    type: 'presentation',
    language: 'es',
    template: 'presentation-spanish',
    title,
    subtitle,
    sections,
  }
}
