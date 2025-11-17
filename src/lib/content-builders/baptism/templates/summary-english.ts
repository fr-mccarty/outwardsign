/**
 * Baptism Summary (English) Template
 *
 * Simple summary of baptism information for sacristy use
 */

import { BaptismWithRelations } from '@/lib/actions/baptisms'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatPersonWithPhone, formatEventDateTime } from '@/lib/utils/formatters'
import { formatLocationText } from '../helpers'

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
    elements.push({
      type: 'info-row',
      label: 'Location:',
      value: formatLocationText(baptism.baptism_event.location),
    })
  }

  // Child (only show section if child exists)
  if (baptism.child) {
    elements.push({
      type: 'section-title',
      text: 'Child to be Baptized',
    })
    elements.push({
      type: 'info-row',
      label: 'Name:',
      value: formatPersonWithPhone(baptism.child),
    })
  }

  // Parents (only show section if at least one parent exists)
  if (baptism.mother || baptism.father) {
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
  }

  // Sponsors/Godparents (only show section if at least one sponsor exists)
  if (baptism.sponsor_1 || baptism.sponsor_2) {
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
  }

  // Presider (only show section if presider exists)
  if (baptism.presider) {
    elements.push({
      type: 'section-title',
      text: 'Minister',
    })
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
      type: 'text',
      text: baptism.note,
    })
  }

  return {
    id: 'baptism-summary',
    title: 'Baptism Summary',
    elements,
  }
}

/**
 * Main builder function for baptism summary template
 */
export function buildSummaryEnglish(baptism: BaptismWithRelations): LiturgyDocument {
  const subtitle =
    baptism.baptism_event?.start_date && baptism.baptism_event?.start_time
      ? formatEventDateTime(baptism.baptism_event)
      : undefined

  const sections: ContentSection[] = []

  // Summary section
  sections.push(buildSummarySection(baptism))

  return {
    id: `baptism-summary-${baptism.id}`,
    type: 'baptism',
    language: 'en',
    template: 'summary-english',
    title: 'Baptism Summary',
    subtitle,
    sections,
  }
}
