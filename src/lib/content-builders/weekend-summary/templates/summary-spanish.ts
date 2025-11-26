/**
 * Weekend Summary Template (Spanish)
 *
 * Genera un resumen completo de todas las actividades parroquiales del fin de semana
 */

import { WeekendSummaryData, WeekendSummaryParams } from '@/lib/actions/weekend-summary'
import { LiturgyDocument, ContentSection, ContentElement } from '@/lib/types/liturgy-content'
import { formatDatePretty, formatTime } from '@/lib/utils/formatters'

// Tipo auxiliar para eventos ordenables
interface SortableEvent {
  date: string
  time: string
  sortKey: string
  type: string
  text: string
}

export function buildSummarySpanish(
  data: WeekendSummaryData,
  params: WeekendSummaryParams
): LiturgyDocument {
  const sections: ContentSection[] = []
  const elements: ContentElement[] = []
  const allEvents: SortableEvent[] = []

  // Recopilar Misas
  if (params.includeMasses && data.masses.length > 0) {
    data.masses.forEach(mass => {
      const date = mass.event?.start_date || ''
      const time = mass.event?.start_time || ''
      const name = mass.event?.location?.name || 'Ubicación no asignada'
      const presider = mass.presider?.full_name || 'Celebrante no asignado'

      allEvents.push({
        date,
        time,
        sortKey: `${date} ${time}`,
        type: 'Misas',
        text: `${formatDatePretty(date)} ${formatTime(time)} — ${name} — ${presider}`,
      })
    })
  }

  // Recopilar Bodas
  if (params.includeSacraments && data.weddings.length > 0) {
    data.weddings.forEach(wedding => {
      const bride = wedding.bride?.full_name || 'Novia no asignada'
      const groom = wedding.groom?.full_name || 'Novio no asignado'
      const date = wedding.wedding_event?.start_date || ''
      const time = wedding.wedding_event?.start_time || ''
      const name = `${bride} y ${groom}`
      const presider = wedding.presider?.full_name || 'Celebrante no asignado'

      allEvents.push({
        date,
        time,
        sortKey: `${date} ${time}`,
        type: 'Bodas',
        text: `${formatDatePretty(date)} ${formatTime(time)} — ${name} — ${presider}`,
      })
    })
  }

  // Recopilar Bautizos
  if (params.includeSacraments && data.baptisms.length > 0) {
    data.baptisms.forEach(baptism => {
      const date = baptism.baptism_event?.start_date || ''
      const time = baptism.baptism_event?.start_time || ''
      const name = baptism.child?.full_name || 'Niño/a no asignado/a'
      const presider = baptism.presider?.full_name || 'Celebrante no asignado'

      allEvents.push({
        date,
        time,
        sortKey: `${date} ${time}`,
        type: 'Bautizos',
        text: `${formatDatePretty(date)} ${formatTime(time)} — ${name} — ${presider}`,
      })
    })
  }

  // Recopilar Funerales
  if (params.includeSacraments && data.funerals.length > 0) {
    data.funerals.forEach(funeral => {
      const date = funeral.funeral_event?.start_date || ''
      const time = funeral.funeral_event?.start_time || ''
      const name = funeral.deceased?.full_name || 'Difunto/a no asignado/a'
      const presider = funeral.presider?.full_name || 'Celebrante no asignado'

      allEvents.push({
        date,
        time,
        sortKey: `${date} ${time}`,
        type: 'Funerales',
        text: `${formatDatePretty(date)} ${formatTime(time)} — ${name} — ${presider}`,
      })
    })
  }

  // Recopilar Presentaciones
  if (params.includeSacraments && data.presentations.length > 0) {
    data.presentations.forEach(presentation => {
      const date = presentation.presentation_event?.start_date || ''
      const time = presentation.presentation_event?.start_time || ''
      const name = presentation.child?.full_name || 'Niño/a no asignado/a'
      const coordinator = presentation.coordinator?.full_name || 'Celebrante no asignado'

      allEvents.push({
        date,
        time,
        sortKey: `${date} ${time}`,
        type: 'Presentaciones',
        text: `${formatDatePretty(date)} ${formatTime(time)} — ${name} — ${coordinator}`,
      })
    })
  }

  // Recopilar Quinceañeras
  if (params.includeSacraments && data.quinceaneras.length > 0) {
    data.quinceaneras.forEach(quince => {
      const date = quince.quinceanera_event?.start_date || ''
      const time = quince.quinceanera_event?.start_time || ''
      const name = quince.quinceanera?.full_name || 'Quinceañera no asignada'
      const presider = quince.presider?.full_name || 'Celebrante no asignado'

      allEvents.push({
        date,
        time,
        sortKey: `${date} ${time}`,
        type: 'Quinceañeras',
        text: `${formatDatePretty(date)} ${formatTime(time)} — ${name} — ${presider}`,
      })
    })
  }

  // Ordenar todos los eventos por fecha y hora
  allEvents.sort((a, b) => a.sortKey.localeCompare(b.sortKey))

  // Agrupar por tipo y construir secciones
  const eventsByType: Record<string, SortableEvent[]> = {}
  allEvents.forEach(event => {
    if (!eventsByType[event.type]) {
      eventsByType[event.type] = []
    }
    eventsByType[event.type].push(event)
  })

  // Construir secciones en orden: Misas, Bodas, Bautizos, Funerales, Presentaciones, Quinceañeras
  const typeOrder = ['Misas', 'Bodas', 'Bautizos', 'Funerales', 'Presentaciones', 'Quinceañeras']

  typeOrder.forEach(type => {
    if (eventsByType[type] && eventsByType[type].length > 0) {
      elements.push({
        type: 'section-title',
        text: type,
      })

      eventsByType[type].forEach(event => {
        elements.push({
          type: 'text',
          text: event.text,
        })
      })

      elements.push({ type: 'spacer', size: 'medium' })
    }
  })

  // Estado vacío
  if (elements.length === 0) {
    elements.push({
      type: 'section-title',
      text: 'Sin Actividades',
    })
    elements.push({
      type: 'text',
      text: 'No hay actividades programadas para este fin de semana.',
    })
  }

  // Construir una sola sección con todo el contenido (sin salto de página ya que es la única sección)
  sections.push({
    id: 'summary',
    elements,
  })

  return {
    id: `weekend-summary-${data.sundayDate}`,
    type: 'event',
    language: 'es',
    template: 'weekend-summary-spanish',
    title: 'Resumen del Fin de Semana',
    subtitle: `${formatDatePretty(data.saturdayDate)} - ${formatDatePretty(data.sundayDate)}`,
    sections,
  }
}
