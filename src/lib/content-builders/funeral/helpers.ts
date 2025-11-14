/**
 * Funeral Template Helpers
 *
 * Shared helper functions used across all funeral templates
 * ALL fallback logic and conditional checks should be in this file, NOT in templates
 */

import { FuneralWithRelations } from '@/lib/actions/funerals'
import { Location } from '@/lib/types'

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
