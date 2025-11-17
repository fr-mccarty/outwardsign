/**
 * Mass Template Helpers
 *
 * Shared helper functions used across all mass templates
 * ALL fallback logic and conditional checks should be in this file, NOT in templates
 */

import { MassWithRelations } from '@/lib/actions/masses'
import { Person } from '@/lib/types'
import {
  formatEventDateTime,
  formatLocationWithAddress,
  formatEventSubtitleEnglish,
  formatEventSubtitleSpanish
} from '@/lib/utils/formatters'

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
 * Delegates to centralized formatter
 */
export function getEventSubtitleEnglish(mass: MassWithRelations): string {
  return formatEventSubtitleEnglish(mass.event)
}

/**
 * Get event subtitle (date/time) for Spanish template
 * Delegates to centralized formatter
 */
export function getEventSubtitleSpanish(mass: MassWithRelations): string {
  return formatEventSubtitleSpanish(mass.event)
}
