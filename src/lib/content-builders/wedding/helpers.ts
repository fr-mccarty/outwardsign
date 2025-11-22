/**
 * Wedding Template Helpers
 *
 * Shared helper functions used across all wedding templates
 * ALL fallback logic and conditional checks should be in this file, NOT in templates
 */

import { WeddingWithRelations } from '@/lib/actions/weddings'
import { IndividualReading } from '@/lib/types'
import {
  formatEventSubtitleEnglish,
  formatEventSubtitleSpanish
} from '@/lib/utils/formatters'

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
    return wedding.second_reader.full_name
  }
  if (wedding.petition_reader) {
    return wedding.petition_reader.full_name
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
 * Delegates to centralized formatter
 */
export function getEventSubtitleEnglish(wedding: WeddingWithRelations): string {
  return formatEventSubtitleEnglish(wedding.wedding_event)
}

/**
 * Get event subtitle (date/time) for Spanish template
 * Delegates to centralized formatter
 */
export function getEventSubtitleSpanish(wedding: WeddingWithRelations): string {
  return formatEventSubtitleSpanish(wedding.wedding_event)
}
