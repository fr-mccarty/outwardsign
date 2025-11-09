/**
 * Presentation Simple Script - Spanish
 * A shorter, simplified version of the Presentation in the Temple liturgy
 */

import { PresentationWithRelations } from '@/lib/actions/presentations'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatEventDateTime, formatPersonName } from '@/lib/utils/formatters'

/**
 * Build summary section (presentation info) in Spanish
 */
function buildSummarySection(presentation: PresentationWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Presentation Information subsection
  elements.push({
    type: 'section-title',
    text: 'Información de la Presentación',
  })

  if (presentation.child) {
    elements.push({
      type: 'info-row',
      label: 'Niño/a:',
      value: formatPersonName(presentation.child),
    })
  }

  if (presentation.mother) {
    elements.push({
      type: 'info-row',
      label: 'Madre:',
      value: formatPersonName(presentation.mother),
    })
  }

  if (presentation.father) {
    elements.push({
      type: 'info-row',
      label: 'Padre:',
      value: formatPersonName(presentation.father),
    })
  }

  if (presentation.coordinator) {
    elements.push({
      type: 'info-row',
      label: 'Coordinador(a):',
      value: formatPersonName(presentation.coordinator),
    })
  }

  if (presentation.presentation_event?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Fecha y Hora del Evento:',
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
      label: 'Lugar:',
      value: locationText,
    })
  }

  elements.push({
    type: 'info-row',
    label: 'Estado de Bautismo:',
    value: presentation.is_baptized ? 'Bautizado/a' : 'Aún no bautizado/a',
  })

  if (presentation.note) {
    elements.push({
      type: 'info-row',
      label: 'Notas:',
      value: presentation.note,
    })
  }

  return {
    id: 'summary',
    pageBreakAfter: true,
    elements,
  }
}

export function buildSimpleSpanish(presentation: PresentationWithRelations): LiturgyDocument {
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
        text: `${motherName} y ${fatherName} presentan a su ${gendered('hijo', 'hija')} ${childName} al Señor y a esta comunidad. Por favor, pasen adelante.`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  liturgyElements.push({
    type: 'text',
    text: '[La familia viene al frente del altar]',
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
        text: 'CELEBRANTE: ',
        formatting: ['bold'],
      },
      {
        text: `¿Se comprometen a criar a ${childName} en la fe católica?`,
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
        text: 'Sí, nos comprometemos.',
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
        text: 'CELEBRANTE: ',
        formatting: ['bold'],
      },
      {
        text: `${gendered('Lo', 'La')} signo con la señal de la cruz. Padres, por favor hagan lo mismo.`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  liturgyElements.push({
    type: 'text',
    text: '[El celebrante y los padres hacen la señal de la cruz sobre el niño/a]',
    formatting: ['italic'],
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
        text: `Padre celestial, bendice a ${gendered('este niño', 'esta niña')} y a estos padres. Ayúdales a ${gendered('criarlo', 'criarla')} en la fe y el amor. Te lo pedimos por Cristo nuestro Señor.`,
      },
    ],
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

  // Blessing of religious articles (if applicable)
  liturgyElements.push({
    type: 'text',
    text: '[Bendecir artículos religiosos si se presentan]',
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
        text: 'Mostremos nuestro apoyo con un aplauso.',
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
      text: subtitle || 'Sin fecha/hora',
      alignment: 'center',
    }
  )
  sections.push(summarySection)

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
    template: 'presentation-simple-spanish',
    title,
    subtitle,
    sections,
  }
}
