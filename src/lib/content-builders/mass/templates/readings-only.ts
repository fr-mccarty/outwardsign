/**
 * Mass Readings Only Template
 *
 * Simplified template with just readings and petitions
 */

import { MassWithRelations } from '@/lib/actions/masses'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatEventDateTime } from '@/lib/utils/formatters'
import {
  buildPetitionsSection,
} from '@/lib/content-builders/shared/script-sections'
import { formatLocationText } from '../helpers'

/**
 * Build summary section
 */
function buildSummarySection(mass: MassWithRelations): ContentSection {
  const elements: ContentElement[] = []

  if (mass.event?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Date & Time:',
      value: formatEventDateTime(mass.event),
    })
  }

  if (mass.event?.location) {
    const location = mass.event.location
    const locationText = location.name
    elements.push({
      type: 'info-row',
      label: 'Location:',
      value: locationText,
    })
  }

  if (mass.liturgical_event) {
    const eventData = mass.liturgical_event.event_data as any
    if (eventData?.name) {
      elements.push({
        type: 'info-row',
        label: 'Liturgical Event:',
        value: eventData.name,
      })
    }
  }

  if (mass.presider) {
    elements.push({
      type: 'info-row',
      label: 'Presider:',
      value: formatPersonName(mass.presider),
    })
  }

  return {
    id: 'summary',
    title: 'Mass Information',
    elements,
  }
}

/**
 * Build readings section (placeholder for actual lectionary integration)
 */
function buildReadingsSection(): ContentSection {
  const elements: ContentElement[] = []

  elements.push({
    type: 'reading-title',
    text: 'First Reading',
  })

  elements.push({
    type: 'text',
    text: '[First reading from the Lectionary]',
  })

  elements.push({
    type: 'spacer',
  })

  elements.push({
    type: 'reading-title',
    text: 'Responsorial Psalm',
  })

  elements.push({
    type: 'text',
    text: '[Responsorial psalm]',
  })

  elements.push({
    type: 'spacer',
  })

  elements.push({
    type: 'reading-title',
    text: 'Second Reading',
  })

  elements.push({
    type: 'text',
    text: '[Second reading from the Lectionary]',
  })

  elements.push({
    type: 'spacer',
  })

  elements.push({
    type: 'reading-title',
    text: 'Gospel',
  })

  elements.push({
    type: 'text',
    text: '[Gospel reading]',
  })

  return {
    id: 'readings',
    title: 'Readings',
    elements,
  }
}

/**
 * Build readings-only template
 */
export function buildReadingsOnly(mass: MassWithRelations): LiturgyDocument {
  const sections: ContentSection[] = []

  // Summary section
  sections.push(buildSummarySection(mass))

  // Readings section
  sections.push(buildReadingsSection())

  // Petitions section
  if (mass.petitions) {
    const petitionsSection = buildPetitionsSection({
      petitions: mass.petitions,
    })
    if (petitionsSection) {
      sections.push(petitionsSection)
    }
  }

  return {
    id: mass.id,
    type: 'mass',
    language: 'en',
    template: 'readings-only',
    title: 'Mass Readings and Petitions',
    sections,
  }
}
