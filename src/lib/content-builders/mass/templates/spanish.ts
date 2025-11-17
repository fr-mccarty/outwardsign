/**
 * Mass (Spanish) Template
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

/**
 * Build summary section (Mass info, liturgical event, ministers) - Spanish
 */
function buildSummarySection(mass: MassWithRelations): ContentSection {
  const elements: ContentElement[] = []

  // Mass Information
  elements.push({
    type: 'section-title',
    text: 'Información de la Misa',
  })

  if (mass.event?.start_date) {
    elements.push({
      type: 'info-row',
      label: 'Fecha y Hora:',
      value: formatEventDateTime(mass.event),
    })
  }

  if (mass.event?.location) {
    elements.push({
      type: 'info-row',
      label: 'Lugar:',
      value: formatLocationWithAddress(mass.event.location),
    })
  }

  // Liturgical Event
  if (mass.liturgical_event) {
    const eventData = mass.liturgical_event.event_data as any
    if (eventData?.name) {
      elements.push({
        type: 'info-row',
        label: 'Evento Litúrgico:',
        value: `${eventData.name}${eventData.liturgical_season ? ` (${eventData.liturgical_season})` : ''}`,
      })
    }
  }

  // Ministers (only show section if at least one minister exists)
  const hasHomilist = mass.homilist && (!mass.presider || mass.homilist.id !== mass.presider.id)
  if (mass.presider || hasHomilist) {
    elements.push({
      type: 'section-title',
      text: 'Ministros',
    })

    if (mass.presider) {
      elements.push({
        type: 'info-row',
        label: 'Celebrante:',
        value: formatPersonWithPhone(mass.presider),
      })
    }

    if (mass.homilist && mass.homilist.id !== mass.presider?.id) {
      elements.push({
        type: 'info-row',
        label: 'Homilista:',
        value: formatPersonWithPhone(mass.homilist),
      })
    }
  }

  return {
    id: 'summary',
    elements,
  }
}

/**
 * Build main export function - Spanish
 */
export function buildMassSpanish(mass: MassWithRelations): LiturgyDocument {
  const subtitle =
    mass.event?.start_date && mass.event?.start_time
      ? formatEventDateTime(mass.event)
      : undefined

  const sections: ContentSection[] = []

  // Build summary section
  const summarySection = buildSummarySection(mass)

  // Build petitions section
  const petitionsSection = mass.petitions
    ? buildPetitionsSection({
        petitions: mass.petitions
      })
    : null

  // Build announcements section using shared builder
  const announcementsSection = buildAnnouncementsSection(mass.announcements)

  // Build notes section
  const notesSection = mass.note
    ? {
        id: 'notes',
        elements: [
          {
            type: 'section-title' as const,
            text: 'Notas',
          },
          {
            type: 'text' as const,
            text: mass.note,
          }
        ],
      }
    : null

  // Check if there are any sections after summary
  const hasFollowingSections = !!(
    petitionsSection ||
    announcementsSection ||
    notesSection
  )

  // Only add page break after summary if there are following sections
  summarySection.pageBreakAfter = hasFollowingSections

  // Add summary section
  sections.push(summarySection)

  // Add other sections (only non-null ones)
  if (petitionsSection) sections.push(petitionsSection)
  if (announcementsSection) sections.push(announcementsSection)
  if (notesSection) sections.push(notesSection)

  return {
    id: mass.id,
    type: 'mass',
    language: 'es',
    template: 'mass-spanish',
    title: 'Misa',
    subtitle,
    sections,
  }
}
