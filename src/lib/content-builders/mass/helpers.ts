/**
 * Mass Template Helpers
 *
 * Shared helper functions used across all mass templates
 * ALL fallback logic and conditional checks should be in this file, NOT in templates
 */

import { MassWithRelations } from '@/lib/actions/masses'
import { Location, Person } from '@/lib/types'

// ============================================================================
// CONDITIONAL CHECK HELPERS
// ============================================================================

/**
 * Check if mass has announcements or announcement person
 */
export function hasAnnouncements(mass: MassWithRelations): boolean {
  return !!(mass.announcements || mass.pre_mass_announcement_person)
}

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
