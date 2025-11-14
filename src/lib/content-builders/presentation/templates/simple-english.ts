/**
 * Presentation Simple Script - English
 * A shorter, simplified version of the Presentation in the Temple liturgy
 *
 * STRUCTURE:
 * 1. Cover Page - Summary (page break after)
 * 2. Liturgy Section - Simplified ceremony script
 */

import { PresentationWithRelations } from '@/lib/actions/presentations'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatEventDateTime } from '@/lib/utils/formatters'
import {
  getChildName,
  getMotherName,
  getFatherName,
  gendered,
  buildTitleEnglish,
  formatLocationText,
  getEventSubtitleEnglish,
} from '../helpers'

/**
 * Build cover page with presentation summary information
 */
function buildCoverPage(presentation: PresentationWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Title and subtitle header
  const title = buildTitleEnglish(presentation)
  const subtitle = getEventSubtitleEnglish(presentation)

  elements.push({
    type: 'event-title',
    text: title,
  })

  elements.push({
    type: 'event-datetime',
    text: subtitle,
  })

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
    elements.push({
      type: 'info-row',
      label: 'Location:',
      value: formatLocationText(presentation.presentation_event.location),
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
    id: 'cover',
    pageBreakAfter: true,
    elements,
  }
}

/**
 * Build liturgy section with simplified ceremony script
 */
function buildLiturgySection(presentation: PresentationWithRelations): ContentSection {
  // Get names using helpers
  const childName = getChildName(presentation)
  const motherName = getMotherName(presentation)
  const fatherName = getFatherName(presentation)

  // Helper function for gendered text
  const genderedText = (maleText: string, femaleText: string) => {
    return gendered(presentation, maleText, femaleText)
  }

  // Build liturgy elements
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
      },
      {
        text: `${motherName} and ${fatherName} present their ${genderedText('son', 'daughter')} ${childName} to the Lord and to this community. Please come forward.`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  liturgyElements.push({
    type: 'rubric',
    text: 'Family comes to the front of the altar',
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
    label: 'PARENTS:',
    text: 'We do.',
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
    type: 'rubric',
    text: 'Celebrant and parents sign the child with the cross',
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
      },
      {
        text: `Heavenly Father, bless this child and these parents. Help them raise ${genderedText('him', 'her')} in faith and love. We ask this through Christ our Lord.`,
      },
    ],
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Assembly response
  liturgyElements.push({
    type: 'response',
    label: 'ASSEMBLY:',
    text: 'Amen.',
  })

  liturgyElements.push({
    type: 'spacer',
  })

  // Blessing of religious articles (if applicable)
  liturgyElements.push({
    type: 'rubric',
    text: 'Bless religious articles if presented',
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
      },
      {
        text: 'Let us show our support with a round of applause.',
      },
    ],
  })

  return {
    id: 'liturgy',
    pageBreakBefore: true,
    elements: liturgyElements,
  }
}

/**
 * Build complete presentation liturgy document (Simple English)
 */
export function buildSimpleEnglish(presentation: PresentationWithRelations): LiturgyDocument {
  // Calculate title and subtitle
  const title = buildTitleEnglish(presentation)
  const subtitle = presentation.presentation_event
    ? formatEventDateTime(presentation.presentation_event)
    : undefined

  // Build all sections in order
  const sections: ContentSection[] = []

  // PAGE 1: Cover page
  sections.push(buildCoverPage(presentation))

  // PAGE 2: Liturgy section
  sections.push(buildLiturgySection(presentation))

  // Return complete document
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
