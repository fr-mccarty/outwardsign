/**
 * Mass (English) Template
 *
 * Mass information, ministers, petitions, and announcements
 */

import { MassWithRelations } from '@/lib/actions/masses'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatPersonWithPhone, formatEventDateTime, formatLocationWithAddress } from '@/lib/utils/formatters'
import {
  buildPetitionsSection,
  buildAnnouncementsSection,
} from '@/lib/content-builders/shared/script-sections'
import { addPageBreaksBetweenSections } from '@/lib/content-builders/shared/helpers'
import { LITURGICAL_COLOR_LABELS } from '@/lib/constants'

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

  // Liturgical Color
  if (mass.liturgical_color) {
    elements.push({
      type: 'info-row',
      label: 'Liturgical Color:',
      value: LITURGICAL_COLOR_LABELS[mass.liturgical_color as keyof typeof LITURGICAL_COLOR_LABELS]?.en || mass.liturgical_color,
    })
  }

  // Mass Intention
  if (mass.mass_intention) {
    elements.push({
      type: 'section-title',
      text: 'Mass Intention',
    })

    if (mass.mass_intention.mass_offered_for) {
      elements.push({
        type: 'info-row',
        label: 'Offered For:',
        value: mass.mass_intention.mass_offered_for,
      })
    }

    if (mass.mass_intention.requested_by) {
      elements.push({
        type: 'info-row',
        label: 'Requested By:',
        value: formatPersonWithPhone(mass.mass_intention.requested_by),
      })
    }

    if (mass.mass_intention.note) {
      elements.push({
        type: 'text',
        text: mass.mass_intention.note,
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
        value: formatPersonWithPhone(mass.presider),
      })
    }

    if (mass.homilist && mass.homilist.id !== mass.presider?.id) {
      elements.push({
        type: 'info-row',
        label: 'Homilist:',
        value: formatPersonWithPhone(mass.homilist),
      })
    }
  }

  // Role Assignments
  if (mass.mass_roles && mass.mass_roles.length > 0) {
    elements.push({
      type: 'section-title',
      text: 'Role Assignments',
    })

    // Group roles by mass role name
    mass.mass_roles.forEach((roleInstance) => {
      const roleName = roleInstance.mass_roles_template_item?.mass_role?.name || 'Unknown Role'
      const personName = roleInstance.person
        ? formatPersonWithPhone(roleInstance.person)
        : 'Unassigned'

      elements.push({
        type: 'info-row',
        label: `${roleName}:`,
        value: personName,
      })
    })
  }

  // Notes (at the end of the cover page)
  if (mass.note) {
    elements.push({
      type: 'section-title',
      text: 'Notes',
    })
    elements.push({
      type: 'text',
      text: mass.note,
    })
  }

  return {
    id: 'summary',
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

  // Build summary section
  sections.push(buildSummarySection(mass))

  // Build petitions section
  const petitionsSection = mass.petitions
    ? buildPetitionsSection({
        petitions: mass.petitions
      })
    : null

  // Build announcements section using shared builder
  const announcementsSection = buildAnnouncementsSection(mass.announcements)

  // Add other sections (only non-null ones)
  if (petitionsSection) sections.push(petitionsSection)
  if (announcementsSection) sections.push(announcementsSection)

  // Add page breaks between sections (not after the last section)
  addPageBreaksBetweenSections(sections)

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
