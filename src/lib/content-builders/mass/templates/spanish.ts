/**
 * Mass (Spanish) Template
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
      value: formatLocationText(mass.event.location),
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

  // Ministers
  elements.push({
    type: 'section-title',
    text: 'Ministros',
  })

  if (mass.presider) {
    elements.push({
      type: 'info-row',
      label: 'Celebrante:',
      value: formatPersonName(mass.presider),
    })
  }

  if (mass.homilist && mass.homilist.id !== mass.presider?.id) {
    elements.push({
      type: 'info-row',
      label: 'Homilista:',
      value: formatPersonName(mass.homilist),
    })
  }

  return {
    id: 'summary',
    title: 'Resumen de la Misa',
    elements,
  }
}

/**
 * Build announcements section (full text content) - Spanish
 */
function buildAnnouncementsSection(mass: MassWithRelations): ContentSection | null {
  if (!mass.announcements) {
    return null
  }

  const elements: ContentElement[] = []

  // Section title
  elements.push({
    type: 'section-title',
    text: 'Anuncios',
  })

  elements.push({
    type: 'text',
    text: mass.announcements,
  })

  return {
    id: 'announcements',
    title: 'Anuncios',
    elements,
  }
}

/**
 * Build main export function - Spanish
 */
export function buildMassSpanish(mass: MassWithRelations): LiturgyDocument {
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
      title: 'Notas',
      elements: [{
        type: 'text',
        text: mass.note,
      }],
    })
  }

  return {
    id: mass.id,
    type: 'mass',
    language: 'es',
    template: 'mass-spanish',
    title: 'Misa',
    sections,
  }
}
