/**
 * Funeral Template Helpers
 *
 * Shared helper functions used across all funeral templates
 * ALL fallback logic and conditional checks should be in this file, NOT in templates
 */

import { FuneralWithRelations } from '@/lib/actions/funerals'
import { Location } from '@/lib/types'
import { formatPersonName, formatEventDateTime } from '@/lib/utils/formatters'

// ============================================================================
// LOCATION HELPERS
// ============================================================================

/**
 * Format location text with name and optional address details
 *
 * @example
 * formatLocationText(location) // "St. Mary Church (123 Main St, Springfield, IL)"
 * formatLocationText(location) // "St. Mary Church" (if no address details)
 */
export function formatLocationText(location: Location | null | undefined): string {
  if (!location) return ''

  const addressParts = [location.street, location.city, location.state].filter(Boolean)

  if (addressParts.length > 0) {
    return `${location.name} (${addressParts.join(', ')})`
  }

  return location.name
}

// ============================================================================
// TITLE AND SUBTITLE HELPERS
// ============================================================================

/**
 * Build document title for English template
 */
export function buildTitleEnglish(funeral: FuneralWithRelations): string {
  if (funeral.deceased) {
    return `Funeral Liturgy for ${formatPersonName(funeral.deceased)}`
  }
  return 'Funeral Liturgy'
}

/**
 * Build document title for Spanish template
 */
export function buildTitleSpanish(funeral: FuneralWithRelations): string {
  if (funeral.deceased) {
    return `Liturgia Fúnebre para ${formatPersonName(funeral.deceased)}`
  }
  return 'Liturgia Fúnebre'
}

/**
 * Get event subtitle (date/time) for English template
 */
export function getEventSubtitleEnglish(funeral: FuneralWithRelations): string {
  if (funeral.funeral_event?.start_date && funeral.funeral_event?.start_time) {
    return formatEventDateTime(funeral.funeral_event)
  }
  return 'Missing Date and Time'
}

/**
 * Get event subtitle (date/time) for Spanish template
 */
export function getEventSubtitleSpanish(funeral: FuneralWithRelations): string {
  if (funeral.funeral_event?.start_date && funeral.funeral_event?.start_time) {
    return formatEventDateTime(funeral.funeral_event)
  }
  return 'Falta Fecha y Hora'
}
