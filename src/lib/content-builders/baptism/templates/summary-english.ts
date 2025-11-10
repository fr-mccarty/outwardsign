/**
 * Baptism Summary (English) Template
 *
 * Simple summary of baptism information for sacristy use
 */

import { BaptismWithRelations } from '@/lib/actions/baptisms'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatPersonWithPhone, formatEventDateTime } from '@/lib/utils/formatters'

/**
 * Build summary section with all baptism data
 */
function buildSummarySection(baptism: BaptismWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Baptism Event
  elements.push({
    type: 'section-title',
    text: 'Baptism Celebration',
  })

  if (baptism.baptism_event?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Date & Time:',
      value: formatEventDateTime(baptism.baptism_event),
    })
  }

  if (baptism.baptism_event?.location) {
    const location = baptism.baptism_event.location
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

  // Child
  elements.push({
    type: 'section-title',
    text: 'Child to be Baptized',
  })

  if (baptism.child) {
    elements.push({
      type: 'info-row',
      label: 'Name:',
      value: formatPersonWithPhone(baptism.child),
    })
  }

  // Parents
  elements.push({
    type: 'section-title',
    text: 'Parents',
  })

  if (baptism.mother) {
    elements.push({
      type: 'info-row',
      label: 'Mother:',
      value: formatPersonWithPhone(baptism.mother),
    })
  }

  if (baptism.father) {
    elements.push({
      type: 'info-row',
      label: 'Father:',
      value: formatPersonWithPhone(baptism.father),
    })
  }

  // Sponsors/Godparents
  elements.push({
    type: 'section-title',
    text: 'Sponsors (Godparents)',
  })

  if (baptism.sponsor_1) {
    elements.push({
      type: 'info-row',
      label: 'Sponsor 1:',
      value: formatPersonWithPhone(baptism.sponsor_1),
    })
  }

  if (baptism.sponsor_2) {
    elements.push({
      type: 'info-row',
      label: 'Sponsor 2:',
      value: formatPersonWithPhone(baptism.sponsor_2),
    })
  }

  // Presider
  elements.push({
    type: 'section-title',
    text: 'Minister',
  })

  if (baptism.presider) {
    elements.push({
      type: 'info-row',
      label: 'Presider:',
      value: formatPersonWithPhone(baptism.presider),
    })
  }

  // Note
  if (baptism.note) {
    elements.push({
      type: 'section-title',
      text: 'Additional Note',
    })
    elements.push({
      type: 'paragraph',
      text: baptism.note,
    })
  }

  return {
    title: 'Baptism Summary',
    elements,
  }
}

/**
 * Main builder function for baptism summary template
 */
export function buildSummaryEnglish(baptism: BaptismWithRelations): LiturgyDocument {
  const sections: ContentSection[] = []

  // Summary section
  sections.push(buildSummarySection(baptism))

  return {
    title: 'Baptism Summary',
    sections,
  }
}
