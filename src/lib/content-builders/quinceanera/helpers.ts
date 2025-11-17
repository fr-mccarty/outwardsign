/**
 * Quinceanera Template Helpers
 *
 * Shared helper functions used across all quinceanera templates
 * ALL fallback logic and conditional checks should be in this file, NOT in templates
 */

import { QuinceaneraWithRelations } from '@/lib/actions/quinceaneras'
import { IndividualReading } from '@/lib/types'
import {
  formatPersonName,
  formatEventDateTime,
  formatLocationWithAddress,
  formatEventSubtitleEnglish,
  formatEventSubtitleSpanish
} from '@/lib/utils/formatters'

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
 * Delegates to centralized formatter
 */
export function getEventSubtitleEnglish(quinceanera: QuinceaneraWithRelations): string {
  return formatEventSubtitleEnglish(quinceanera.quinceanera_event)
}

/**
 * Get event subtitle (date/time) for Spanish template
 * Delegates to centralized formatter
 */
export function getEventSubtitleSpanish(quinceanera: QuinceaneraWithRelations): string {
  return formatEventSubtitleSpanish(quinceanera.quinceanera_event)
}
