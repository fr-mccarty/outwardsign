/**
 * Mass Template Helpers
 *
 * Shared helper functions used across all mass templates
 * ALL fallback logic and conditional checks should be in this file, NOT in templates
 */

import { MassWithRelations } from '@/lib/actions/masses'
import { Location, Person } from '@/lib/types'
import { formatEventDateTime } from '@/lib/utils/formatters'

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
// PERSON HELPERS
// ============================================================================

/**
 * Get homilist, with fallback to presider if no homilist specified
 */
export function getHomilist(mass: MassWithRelations): Person | null {
  return mass.homilist || mass.presider || null
}

// ============================================================================
// EVENT SUBTITLE HELPERS
// ============================================================================

/**
 * Get event subtitle (date/time) for English template
 */
export function getEventSubtitleEnglish(mass: MassWithRelations): string {
  if (mass.event?.start_date && mass.event?.start_time) {
    return formatEventDateTime(mass.event)
  }
  return 'Missing Date and Time'
}

/**
 * Get event subtitle (date/time) for Spanish template
 */
export function getEventSubtitleSpanish(mass: MassWithRelations): string {
  if (mass.event?.start_date && mass.event?.start_time) {
    return formatEventDateTime(mass.event)
  }
  return 'Falta Fecha y Hora'
}
