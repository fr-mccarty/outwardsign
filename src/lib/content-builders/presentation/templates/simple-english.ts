/**
 * Presentation Simple Script - English
 * A shorter, simplified version of the Presentation in the Temple liturgy
 */

import { PresentationWithRelations } from '@/lib/actions/presentations'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatEventDateTime, formatPersonName } from '@/lib/utils/formatters'

/**
 * Build summary section (presentation info)
 */
function buildSummarySection(presentation: PresentationWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Presentation Information subsection
  elements.push({
    type: 'section-title',
    text: 'Presentation Information',
  })

  if (presentation.child) {
    elements.push({
      type: 'info-row',
      label: 'Child:',
      value: formatPersonName(presentation.child),
    })
  }

  if (presentation.mother) {
    elements.push({
      type: 'info-row',
      label: 'Mother:',
      value: formatPersonName(presentation.mother),
    })
  }

  if (presentation.father) {
    elements.push({
      type: 'info-row',
      label: 'Father:',
      value: formatPersonName(presentation.father),
    })
  }

  if (presentation.coordinator) {
    elements.push({
      type: 'info-row',
      label: 'Coordinator:',
      value: formatPersonName(presentation.coordinator),
    })
  }

  if (presentation.presentation_event?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Event Date & Time:',
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
      label: 'Location:',
      value: locationText,
    })
  }

  elements.push({
    type: 'info-row',
    label: 'Baptism Status:',
    value: presentation.is_baptized ? 'Baptized' : 'Not yet baptized',
  })

  if (presentation.note) {
    elements.push({
      type: 'info-row',
      label: 'Notes:',
      value: presentation.note,
    })
  }

  return {
    id: 'summary',
    pageBreakAfter: true,
    elements,
  }
}

export function buildSimpleEnglish(presentation: PresentationWithRelations): LiturgyDocument {
  const child = presentation.child
  const mother = presentation.mother
  const father = presentation.father
  const childName = child ? `${child.first_name} ${child.last_name}` : '[Child\'s Name]'
  const childSex = child?.sex || 'Male'
  const motherName = mother ? `${mother.first_name} ${mother.last_name}` : '[Mother\'s Name]'
  const fatherName = father ? `${father.first_name} ${father.last_name}` : '[Father\'s Name]'
  const isBaptized = presentation.is_baptized

  // Helper function for gendered text in English
  const gendered = (maleText: string, femaleText: string) => {
    return childSex === 'Male' ? maleText : femaleText
  }

  // Build title and subtitle
  const title = `Presentation in the Temple - ${childName}`
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
    text: 'After the Homily',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Celebrant invitation
  liturgyElements.push({
    type: 'multi-part-text',
    parts: [
      {
        text: 'CELEBRANT: ',
        formatting: ['bold'],
      },
      {
        text: `${motherName} and ${fatherName} present their ${gendered('son', 'daughter')} ${childName} to the Lord and to this community. Please come forward.`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  liturgyElements.push({
    type: 'text',
    text: '[Family comes to the front of the altar]',
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
        text: 'CELEBRANT: ',
        formatting: ['bold'],
      },
      {
        text: `Do you commit to raise ${childName} in the Catholic faith?`,
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
        text: 'PARENTS: ',
        formatting: ['bold'],
      },
      {
        text: 'We do.',
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
        text: 'CELEBRANT: ',
        formatting: ['bold'],
      },
      {
        text: `I sign you with the sign of the cross. Parents, please do the same.`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  liturgyElements.push({
    type: 'text',
    text: '[Celebrant and parents sign the child with the cross]',
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
        text: 'CELEBRANT: ',
        formatting: ['bold'],
      },
      {
        text: `Heavenly Father, bless this child and these parents. Help them raise ${gendered('him', 'her')} in faith and love. We ask this through Christ our Lord.`,
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
        text: 'ASSEMBLY: ',
        formatting: ['bold'],
      },
      {
        text: 'Amen.',
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Blessing of religious articles (if applicable)
  liturgyElements.push({
    type: 'text',
    text: '[Bless religious articles if presented]',
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
        text: 'CELEBRANT: ',
        formatting: ['bold'],
      },
      {
        text: 'Let us show our support with a round of applause.',
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
      text: subtitle || 'No date/time',
      alignment: 'center',
    }
  )
  sections.push(summarySection)

  // Add liturgy section
  sections.push({
    id: 'liturgy',
    title: 'Presentation Liturgy',
    elements: liturgyElements,
  })

  return {
    id: presentation.id,
    type: 'presentation',
    language: 'en',
    template: 'presentation-simple-english',
    title,
    subtitle,
    sections,
  }
}
