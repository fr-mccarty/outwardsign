/**
 * Mass Template Helpers
 *
 * Shared helper functions used across all mass templates
 * ALL fallback logic and conditional checks should be in this file, NOT in templates
 */

import { MassWithRelations } from '@/lib/actions/masses'
import { Person } from '@/lib/types'
import { formatEventDateTime, formatLocationWithAddress } from '@/lib/utils/formatters'

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
