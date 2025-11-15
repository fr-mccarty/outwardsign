/**
 * Mass (English) Template
 *
 * Mass information, ministers, petitions, and announcements
 */

import { MassWithRelations } from '@/lib/actions/masses'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonName, formatEventDateTime } from '@/lib/utils/formatters'
import {
  buildPetitionsSection,
} from '@/lib/content-builders/shared/script-sections'
import { formatLocationText } from '../helpers'

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
      value: formatLocationText(mass.event.location),
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

  // Ministers
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

  // Pre-Mass Announcement section (at bottom of first page)
  if (mass.pre_mass_announcement_person || mass.pre_mass_announcement_topic) {
    elements.push({
      type: 'section-title',
      text: 'Pre-Mass Announcement',
    })

    if (mass.pre_mass_announcement_person) {
      elements.push({
        type: 'info-row',
        label: 'Announced by:',
        value: formatPersonName(mass.pre_mass_announcement_person),
      })
    }

    if (mass.pre_mass_announcement_topic) {
      elements.push({
        type: 'info-row',
        label: 'Topic:',
        value: mass.pre_mass_announcement_topic,
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
    sections,
  }
}
