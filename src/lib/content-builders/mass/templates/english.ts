/**
 * Mass (English) Template
 *
 * Mass information, ministers, petitions, and announcements
 */

import { MassWithRelations } from '@/lib/actions/masses'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatEventDateTime, formatLocationWithAddress } from '@/lib/utils/formatters'
import {
  buildPetitionsSection,
} from '@/lib/content-builders/shared/script-sections'

/**
 * Build summary section (Mass info, liturgical event, ministers)
 */
function buildSummarySection(mass: MassWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Mass Information
  elements.push({
    type: 'section-title',
    text: 'Mass Information',
  })

  if (mass.event?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Date & Time:',
      value: formatEventDateTime(mass.event),
    })
  }

  if (mass.event?.location) {
    elements.push({
      type: 'info-row',
      label: 'Location:',
      value: formatLocationWithAddress(mass.event.location),
    })
  }

  // Liturgical Event
  if (mass.liturgical_event) {
    const eventData = mass.liturgical_event.event_data as any
    if (eventData?.name) {
      elements.push({
        type: 'info-row',
        label: 'Liturgical Event:',
        value: `${eventData.name}${eventData.liturgical_season ? ` (${eventData.liturgical_season})` : ''}`,
      })
    }
  }

  // Ministers (only show section if at least one minister exists)
  const hasHomilist = mass.homilist && (!mass.presider || mass.homilist.id !== mass.presider.id)
  if (mass.presider || hasHomilist) {
    elements.push({
      type: 'section-title',
      text: 'Ministers',
    })

    if (mass.presider) {
      elements.push({
        type: 'info-row',
        label: 'Presider:',
        value: formatPersonName(mass.presider),
      })
    }

    if (mass.homilist && mass.homilist.id !== mass.presider?.id) {
      elements.push({
        type: 'info-row',
        label: 'Homilist:',
        value: formatPersonName(mass.homilist),
      })
    }
  }

  return {
    id: 'summary',
    title: 'Mass Summary',
    elements,
  }
}

/**
 * Build announcements section (full text content)
 */
function buildAnnouncementsSection(mass: MassWithRelations): ContentSection | null {
  if (!mass.announcements) {
    return null
  }

  const elements: ContentElement[] = []

  // Section title
  elements.push({
    type: 'section-title',
    text: 'Announcements',
  })

  elements.push({
    type: 'text',
    text: mass.announcements,
  })

  return {
    id: 'announcements',
    title: 'Announcements',
    elements,
  }
}

/**
 * Build main export function
 */
export function buildMassEnglish(mass: MassWithRelations): LiturgyDocument {
  const subtitle =
    mass.event?.start_date && mass.event?.start_time
      ? formatEventDateTime(mass.event)
      : undefined

  const sections: ContentSection[] = []

  // Summary section
  sections.push(buildSummarySection(mass))

  // Petitions
  if (mass.petitions) {
    const petitionsSection = buildPetitionsSection({
      petitions: mass.petitions
    })
    if (petitionsSection) {
      sections.push(petitionsSection)
    }
  }

  // Announcements
  const announcementsSection = buildAnnouncementsSection(mass)
  if (announcementsSection) {
    sections.push(announcementsSection)
  }

  // Notes
  if (mass.note) {
    sections.push({
      id: 'notes',
      title: 'Notes',
      elements: [{
        type: 'text',
        text: mass.note,
      }],
    })
  }

  return {
    id: mass.id,
    type: 'mass',
    language: 'en',
    template: 'mass-english',
    title: 'Mass',
    subtitle,
    sections,
  }
}
