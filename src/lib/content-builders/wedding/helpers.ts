/**
 * Wedding Template Helpers
 *
 * Shared helper functions used across all wedding templates
 * ALL fallback logic and conditional checks should be in this file, NOT in templates
 */

import { WeddingWithRelations } from '@/lib/actions/weddings'
import { IndividualReading, Location, Event, Person } from '@/lib/types'
import { formatPersonName, formatEventDateTime, formatLocationWithAddress } from '@/lib/utils/formatters'

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

// ============================================================================
// TITLE AND SUBTITLE HELPERS
// ============================================================================

/**
 * Build document title for English template
 */
export function buildTitleEnglish(wedding: WeddingWithRelations): string {
  if (wedding.bride && wedding.groom) {
    return `${wedding.bride.first_name} ${wedding.bride.last_name} & ${wedding.groom.first_name} ${wedding.groom.last_name}`
  }
  return 'Wedding'
}

/**
 * Build document title for Spanish template
 */
export function buildTitleSpanish(wedding: WeddingWithRelations): string {
  if (wedding.bride && wedding.groom) {
    return `${wedding.bride.first_name} ${wedding.bride.last_name} & ${wedding.groom.first_name} ${wedding.groom.last_name}`
  }
  return 'Boda'
}

/**
 * Get event subtitle (date/time) for English template
 */
export function getEventSubtitleEnglish(wedding: WeddingWithRelations): string {
  if (wedding.wedding_event?.start_date && wedding.wedding_event?.start_time) {
    return formatEventDateTime(wedding.wedding_event)
  }
  return 'Missing Date and Time'
}

/**
 * Get event subtitle (date/time) for Spanish template
 */
export function getEventSubtitleSpanish(wedding: WeddingWithRelations): string {
  if (wedding.wedding_event?.start_date && wedding.wedding_event?.start_time) {
    return formatEventDateTime(wedding.wedding_event)
  }
  return 'Falta Fecha y Hora'
}
