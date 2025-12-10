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

  // TODO: Agregar eventos dinámicos (sacramentos) cuando estén integrados
  // Los sacramentos han sido migrados a un sistema de eventos dinámicos
  // Esta plantilla se actualizará para obtener datos de eventos dinámicos

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

  // Construir secciones en orden
  const typeOrder = ['Misas']

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
