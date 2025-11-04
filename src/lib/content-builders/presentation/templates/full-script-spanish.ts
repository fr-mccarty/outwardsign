/**
 * Presentation Full Script - Spanish
 * Based on the traditional Presentation in the Temple liturgy
 */

import { PresentationWithRelations } from '@/lib/actions/presentations'
import { LiturgyDocument } from '@/lib/types/liturgy-content'

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

  return {
    title: 'Presentación en el Templo',
    language: 'es',
    sections: [
      {
        type: 'section',
        heading: 'Después de la Homilía',
        level: 2,
        content: [
          {
            type: 'direction',
            text: 'Después de la Homilía'
          }
        ]
      },
      {
        type: 'section',
        content: [
          {
            type: 'speaker',
            speaker: 'CELEBRANTE',
            text: `La vida es el mayor regalo de Dios para nosotros. Agradecidos por la vida de su ${gendered('hijo', 'hija')}, ${getParentsText()} quisieran presentar a su ${gendered('hijo', 'hija')} ${childName} al Señor y a esta comunidad. Les damos la bienvenida aquí al frente de la iglesia.`
          }
        ]
      },
      {
        type: 'section',
        content: [
          {
            type: 'direction',
            text: 'Caminar al frente del altar'
          }
        ]
      },
      {
        type: 'section',
        content: [
          {
            type: 'speaker',
            speaker: `CELEBRANTE (a los ${getAudienceText()})`,
            text: `Al presentar a ${gendered('este niño', 'esta niña')} al Señor y a esta comunidad hoy, ${isBaptized ? 'renuevan su compromiso' : 'se comprometen'} a ${gendered('criarlo', 'criarla')} en los caminos de la fe. ¿Entienden y aceptan esta responsabilidad?`
          }
        ]
      },
      {
        type: 'section',
        content: [
          {
            type: 'dialogue',
            speaker: 'PADRES',
            response: 'Sí, aceptamos.'
          }
        ]
      },
      {
        type: 'section',
        content: [
          {
            type: 'speaker',
            speaker: `CELEBRANTE (al ${gendered('niño', 'niña')})`,
            text: `${isBaptized ? 'Como en el día de tu bautismo, te' : 'Te'} signo con la señal de la cruz, y pido a tus ${getAudienceText()} que hagan lo mismo.`
          }
        ]
      },
      {
        type: 'section',
        content: [
          {
            type: 'speaker',
            speaker: 'CELEBRANTE',
            text: `Padre Celestial, tú eres el dador de toda vida. Nos diste ${gendered('este hijo', 'esta hija')} y te ${gendered('lo', 'la')} presentamos, como María presentó a Jesús en el templo. Te rogamos por estos ${getAudienceText()}. Bendícelos en sus esfuerzos por criar a ${gendered('este niño', 'esta niña')} como ${gendered('un buen cristiano', 'una buena cristiana')} y como ${gendered('un buen católico', 'una buena católica')}. Bendice a ${gendered('este niño', 'esta niña')}. Dale buena salud, protége${gendered('lo', 'la')} de cualquier peligro del cuerpo y del espíritu, y ayúda${gendered('lo', 'la')} a crecer en edad y en sabiduría, siempre en tu presencia.`
          }
        ]
      },
      {
        type: 'section',
        content: [
          {
            type: 'paragraph',
            text: `Santa María, Madre de Dios y Madre nuestra, pedimos tu protección sobre esta familia y sobre ${gendered('este hijo', 'esta hija')}. Es siguiendo tu ejemplo que esta familia trae a ${gendered('este niño', 'esta niña')} para ser presentado a Dios, nuestro creador, y a esta comunidad hoy. Ayuda a estos padres a criar a ${gendered('este niño', 'esta niña')} con palabra y ejemplo. Hacemos nuestra oración en el nombre de Jesucristo, que es Señor por los siglos de los siglos.`
          }
        ]
      },
      {
        type: 'section',
        content: [
          {
            type: 'dialogue',
            speaker: 'ASAMBLEA',
            response: 'Amén.'
          }
        ]
      },
      {
        type: 'section',
        content: [
          {
            type: 'direction',
            text: 'Bendecir artículos religiosos'
          }
        ]
      },
      {
        type: 'section',
        content: [
          {
            type: 'speaker',
            speaker: 'CELEBRANTE',
            text: 'Ahora los enviamos de regreso a sus lugares, mientras les mostramos nuestro apoyo con un aplauso.'
          }
        ]
      }
    ]
  }
}
