/**
 * Funeral Template Helpers
 *
 * Shared helper functions used across all funeral templates
 * ALL fallback logic and conditional checks should be in this file, NOT in templates
 */

import { FuneralWithRelations } from '@/lib/actions/funerals'
import {
  formatPersonName,
  formatEventSubtitleEnglish,
  formatEventSubtitleSpanish
} from '@/lib/utils/formatters'

// ============================================================================
// TITLE AND SUBTITLE HELPERS
// ============================================================================

/**
 * Build document title for English template
 */
export function buildTitleEnglish(funeral: FuneralWithRelations): string {
  if (funeral.deceased) {
    return `Funeral Liturgy for ${formatPersonName(funeral.deceased)}`
  }
  return 'Funeral Liturgy'
}

/**
 * Build document title for Spanish template
 */
export function buildTitleSpanish(funeral: FuneralWithRelations): string {
  if (funeral.deceased) {
    return `Liturgia Fúnebre para ${formatPersonName(funeral.deceased)}`
  }
  return 'Liturgia Fúnebre'
}

/**
 * Get event subtitle (date/time) for English template
 * Delegates to centralized formatter
 */
export function getEventSubtitleEnglish(funeral: FuneralWithRelations): string {
  return formatEventSubtitleEnglish(funeral.funeral_event)
}

/**
 * Get event subtitle (date/time) for Spanish template
 * Delegates to centralized formatter
 */
export function getEventSubtitleSpanish(funeral: FuneralWithRelations): string {
  return formatEventSubtitleSpanish(funeral.funeral_event)
}
