/**
 * Presentation Bilingual Script - English & Spanish
 * A bilingual version of the Presentation in the Temple liturgy
 */

import { PresentationWithRelations } from '@/lib/actions/presentations'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatEventDateTime, formatPersonName } from '@/lib/utils/formatters'

/**
 * Build summary section (presentation info) in bilingual format
 */
function buildSummarySection(presentation: PresentationWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Presentation Information subsection
  elements.push({
    type: 'section-title',
    text: 'Presentation Information / Información de la Presentación',
  })

  if (presentation.child) {
    elements.push({
      type: 'info-row',
      label: 'Child / Niño/a:',
      value: formatPersonName(presentation.child),
    })
  }

  if (presentation.mother) {
    elements.push({
      type: 'info-row',
      label: 'Mother / Madre:',
      value: formatPersonName(presentation.mother),
    })
  }

  if (presentation.father) {
    elements.push({
      type: 'info-row',
      label: 'Father / Padre:',
      value: formatPersonName(presentation.father),
    })
  }

  if (presentation.coordinator) {
    elements.push({
      type: 'info-row',
      label: 'Coordinator / Coordinador(a):',
      value: formatPersonName(presentation.coordinator),
    })
  }

  if (presentation.presentation_event?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Event Date & Time / Fecha y Hora del Evento:',
      value: formatEventDateTime(presentation.presentation_event),
    })
  }

  if (presentation.presentation_event?.location) {
    const location = presentation.presentation_event.location
    const locationText = location.name +
      (location.street || location.city ?
        ` (${[location.street, location.city, location.state].filter(Boolean).join(', ')})` :
        '')
    elements.push({
      type: 'info-row',
      label: 'Location / Lugar:',
      value: locationText,
    })
  }

  elements.push({
    type: 'info-row',
    label: 'Baptism Status / Estado de Bautismo:',
    value: presentation.is_baptized ? 'Baptized / Bautizado/a' : 'Not yet baptized / Aún no bautizado/a',
  })

  if (presentation.note) {
    elements.push({
      type: 'info-row',
      label: 'Notes / Notas:',
      value: presentation.note,
    })
  }

  return {
    id: 'summary',
    pageBreakAfter: true,
    elements,
  }
}

export function buildBilingual(presentation: PresentationWithRelations): LiturgyDocument {
  const child = presentation.child
  const mother = presentation.mother
  const father = presentation.father
  const childName = child ? `${child.first_name} ${child.last_name}` : '[Child\'s Name / Nombre del Niño/a]'
  const childSex = child?.sex || 'Male'
  const motherName = mother ? `${mother.first_name} ${mother.last_name}` : '[Mother\'s Name / Nombre de la Madre]'
  const fatherName = father ? `${father.first_name} ${father.last_name}` : '[Father\'s Name / Nombre del Padre]'
  const isBaptized = presentation.is_baptized

  // Helper function for gendered text (returns both English and Spanish)
  const genderedEn = (maleText: string, femaleText: string) => {
    return childSex === 'Male' ? maleText : femaleText
  }

  const genderedEs = (maleText: string, femaleText: string) => {
    return childSex === 'Male' ? maleText : femaleText
  }

  // Build title and subtitle
  const title = `Presentation in the Temple / Presentación en el Templo - ${childName}`
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
    text: 'After the Homily / Después de la Homilía',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Celebrant invitation - English
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: 'CELEBRANT: ',
        formatting: ['bold'],
      },
      {
        text: `Life is God's greatest gift to us. Grateful for the life of their ${genderedEn('son', 'daughter')}, ${motherName} and ${fatherName} would like to present their ${genderedEn('son', 'daughter')} ${childName} to the Lord and to this community. We welcome you here to the front of the church.`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Celebrant invitation - Spanish
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: 'CELEBRANTE: ',
        formatting: ['bold'],
      },
      {
        text: `La vida es el mayor regalo de Dios para nosotros. Agradecidos por la vida de su ${genderedEs('hijo', 'hija')}, ${motherName} y ${fatherName} quisieran presentar a su ${genderedEs('hijo', 'hija')} ${childName} al Señor y a esta comunidad. Les damos la bienvenida aquí al frente de la iglesia.`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  liturgyElements.push({
    type: 'text',
    text: '[Walk to the front of the altar / Caminar al frente del altar]',
    formatting: ['italic'],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Commitment question - English
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: 'CELEBRANT (to the parents): ',
        formatting: ['bold'],
      },
      {
        text: `By presenting this ${genderedEn('boy', 'girl')} to the Lord and to this community today, you ${isBaptized ? 'renew your commitment' : 'commit yourselves'} to raise ${genderedEn('him', 'her')} in the ways of faith. Do you understand and accept this responsibility?`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Commitment question - Spanish
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: 'CELEBRANTE (a los padres): ',
        formatting: ['bold'],
      },
      {
        text: `Al presentar a ${genderedEs('este niño', 'esta niña')} al Señor y a esta comunidad hoy, ${isBaptized ? 'renuevan su compromiso' : 'se comprometen'} a ${genderedEs('criarlo', 'criarla')} en los caminos de la fe. ¿Entienden y aceptan esta responsabilidad?`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Parents' response - Bilingual
  liturgyElements.push({
    type: 'response',
    parts: [
      {
        text: 'PARENTS / PADRES: ',
        formatting: ['bold'],
      },
      {
        text: 'Yes, we do. / Sí, aceptamos.',
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Sign of the cross - English
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: `CELEBRANT (to the ${genderedEn('boy', 'girl')}): `,
        formatting: ['bold'],
      },
      {
        text: `${isBaptized ? 'As on the day of your baptism, I' : 'I'} sign you with the sign of the cross, and I ask your parents to do the same.`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Sign of the cross - Spanish
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: `CELEBRANTE (${genderedEs('al niño', 'a la niña')}): `,
        formatting: ['bold'],
      },
      {
        text: `${isBaptized ? 'Como el día de tu bautismo, te' : 'Te'} signo con la señal de la cruz, y pido a tus padres que hagan lo mismo.`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  liturgyElements.push({
    type: 'text',
    text: '[Celebrant and parents sign the child with the cross / El celebrante y los padres hacen la señal de la cruz]',
    formatting: ['italic'],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Prayer - English
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: 'CELEBRANT: ',
        formatting: ['bold'],
      },
      {
        text: `Heavenly Father, you are the giver of all life. You gave us this ${genderedEn('son', 'daughter')} and we present ${genderedEn('him', 'her')} to you, as Mary presented Jesus in the temple. We pray for these parents. Bless them in their efforts to raise this ${genderedEn('boy', 'girl')} as a good Christian and as a good Catholic. Bless this child. Give ${genderedEn('him', 'her')} good health, protect ${genderedEn('him', 'her')} from any danger of body and spirit, and help ${genderedEn('him', 'her')} to grow in age and in wisdom, always in your presence.`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Prayer - Spanish
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: 'CELEBRANTE: ',
        formatting: ['bold'],
      },
      {
        text: `Padre celestial, tú eres el dador de toda vida. Nos diste ${genderedEs('este hijo', 'esta hija')} y ${genderedEs('lo', 'la')} presentamos a ti, como María presentó a Jesús en el templo. Oramos por estos padres. Bendícelos en sus esfuerzos por criar a ${genderedEs('este niño', 'esta niña')} como ${genderedEs('un buen cristiano y un buen católico', 'una buena cristiana y una buena católica')}. Bendice a ${genderedEs('este niño', 'esta niña')}. Dale buena salud, ${genderedEs('protégelo', 'protégela')} de todo peligro del cuerpo y del espíritu, y ayúda${genderedEs('lo', 'la')} a crecer en edad y en sabiduría, siempre en tu presencia.`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Prayer to Mary - Bilingual
  liturgyElements.push({
    type: 'text',
    text: `Holy Mary, Mother of God and our Mother, we ask your protection over this family and over this ${genderedEn('son', 'daughter')}. It is by following your example that this family brings this ${genderedEn('boy', 'girl')} to be presented to God, our creator, and to this community today. Help these parents to raise this child with word and example.`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  liturgyElements.push({
    type: 'text',
    text: `Santa María, Madre de Dios y Madre nuestra, pedimos tu protección sobre esta familia y sobre ${genderedEs('este hijo', 'esta hija')}. Es siguiendo tu ejemplo que esta familia trae a ${genderedEs('este niño', 'esta niña')} para ser ${genderedEs('presentado', 'presentada')} a Dios, nuestro creador, y a esta comunidad hoy. Ayuda a estos padres a criar a ${genderedEs('este niño', 'esta niña')} con palabra y ejemplo.`,
  })

  liturgyElements.push({
    type: 'spacer',
  })

  liturgyElements.push({
    type: 'text',
    text: 'We make our prayer in the name of Jesus Christ, who is Lord forever and ever. / Hacemos nuestra oración en el nombre de Jesucristo, que es Señor por los siglos de los siglos.',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Assembly response - Bilingual
  liturgyElements.push({
    type: 'response',
    parts: [
      {
        text: 'ASSEMBLY / ASAMBLEA: ',
        formatting: ['bold'],
      },
      {
        text: 'Amen. / Amén.',
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Blessing of religious articles
  liturgyElements.push({
    type: 'text',
    text: '[Bless religious articles / Bendecir artículos religiosos]',
    formatting: ['italic'],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Dismissal - Bilingual
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: 'CELEBRANT / CELEBRANTE: ',
        formatting: ['bold'],
      },
      {
        text: 'Now we send you back to your places, as we show you our support with applause. / Ahora los enviamos de regreso a sus lugares, mientras les mostramos nuestro apoyo con un aplauso.',
      },
    ],
  })

  // Add header to summary section
  const summarySection = buildSummarySection(presentation)
  summarySection.elements.unshift(
    {
      type: 'event-title',
      text: title,
      alignment: 'center',
    },
    {
      type: 'event-datetime',
      text: subtitle || 'No date/time / Sin fecha/hora',
      alignment: 'center',
    }
  )
  sections.push(summarySection)

  // Add liturgy section
  sections.push({
    id: 'liturgy',
    title: 'Presentation Liturgy / Liturgia de Presentación',
    elements: liturgyElements,
  })

  return {
    id: presentation.id,
    type: 'presentation',
    language: 'both',
    template: 'presentation-bilingual',
    title,
    subtitle,
    sections,
  }
}
