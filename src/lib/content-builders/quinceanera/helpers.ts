/**
 * Quinceanera Template Helpers
 *
 * Shared helper functions used across all quinceanera templates
 * ALL fallback logic and conditional checks should be in this file, NOT in templates
 */

import { QuinceaneraWithRelations } from '@/lib/actions/quinceaneras'
import { IndividualReading, Location } from '@/lib/types'
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
// READING HELPERS
// ============================================================================

/**
 * Get reading pericope with empty string fallback
 */
export function getReadingPericope(reading: IndividualReading | null | undefined): string {
  return reading?.pericope || ''
}

// ============================================================================
// TITLE AND SUBTITLE HELPERS
// ============================================================================

/**
 * Build document title for English template
 */
export function buildTitleEnglish(quinceanera: QuinceaneraWithRelations): string {
  if (quinceanera.quinceanera) {
    return `Quinceañera Celebration for ${formatPersonName(quinceanera.quinceanera)}`
  }
  return 'Quinceañera Celebration'
}

/**
 * Build document title for Spanish template
 */
export function buildTitleSpanish(quinceanera: QuinceaneraWithRelations): string {
  if (quinceanera.quinceanera) {
    return `Celebración de Quinceañera para ${formatPersonName(quinceanera.quinceanera)}`
  }
  return 'Celebración de Quinceañera'
}

/**
 * Get event subtitle (date/time) for English template
 */
export function getEventSubtitleEnglish(quinceanera: QuinceaneraWithRelations): string {
  if (quinceanera.quinceanera_event?.start_date && quinceanera.quinceanera_event?.start_time) {
    return formatEventDateTime(quinceanera.quinceanera_event)
  }
  return 'Missing Date and Time'
}

/**
 * Get event subtitle (date/time) for Spanish template
 */
export function getEventSubtitleSpanish(quinceanera: QuinceaneraWithRelations): string {
  if (quinceanera.quinceanera_event?.start_date && quinceanera.quinceanera_event?.start_time) {
    return formatEventDateTime(quinceanera.quinceanera_event)
  }
  return 'Falta Fecha y Hora'
}
