/**
 * Wedding Template Helpers
 *
 * Shared helper functions used across all wedding templates
 * ALL fallback logic and conditional checks should be in this file, NOT in templates
 */

import { WeddingWithRelations } from '@/lib/actions/weddings'
import { IndividualReading, Location, Event, Person } from '@/lib/types'
import { formatPersonName } from '@/lib/utils/formatters'

// ============================================================================
// CONDITIONAL CHECK HELPERS
// ============================================================================

/**
 * Check if wedding has any rehearsal events
 */
export function hasRehearsalEvents(wedding: WeddingWithRelations): boolean {
  return !!(wedding.rehearsal_event || wedding.rehearsal_dinner_event)
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
// READING HELPERS
// ============================================================================

/**
 * Get reading pericope with empty string fallback
 */
export function getReadingPericope(reading: IndividualReading | null | undefined): string {
  return reading?.pericope || ''
}

// ============================================================================
// PETITION READER HELPERS
// ============================================================================

/**
 * Get the name of the person who will read petitions
 * Priority: second_reader (if petitions_read_by_second_reader is true) > petition_reader
 * Returns formatted name or empty string
 */
export function getPetitionsReaderName(wedding: WeddingWithRelations): string {
  if (wedding.petitions_read_by_second_reader && wedding.second_reader) {
    return formatPersonName(wedding.second_reader)
  }
  if (wedding.petition_reader) {
    return formatPersonName(wedding.petition_reader)
  }
  return ''
}
