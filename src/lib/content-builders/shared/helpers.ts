/**
 * Shared Content Builder Helpers
 *
 * Reusable helper functions for use across all content builder templates
 */

import { Person } from '@/lib/types'
import { ALL_STATUS_LABELS } from '@/lib/constants'

// ============================================================================
// GENDERED TEXT HELPERS
// ============================================================================

/**
 * Get gendered text based on person's sex
 *
 * @param person - Person object with optional sex field
 * @param maleText - Text to return if person is male
 * @param femaleText - Text to return if person is female
 * @param defaultSex - Default sex to use if person.sex is undefined (defaults to 'Male')
 * @returns The appropriate gendered text
 *
 * @example
 * gendered(child, 'son', 'daughter') // Returns 'son' if child is male
 * gendered(bride, 'groom', 'bride') // Returns 'bride' if bride is female
 */
export function gendered(
  person: Person | null | undefined,
  maleText: string,
  femaleText: string,
  defaultSex: 'Male' | 'Female' = 'Male'
): string {
  const sex = person?.sex ?? defaultSex
  return sex === 'Male' ? maleText : femaleText
}

// ============================================================================
// STATUS LABEL HELPERS
// ============================================================================

/**
 * Get language-appropriate status label from constants
 *
 * 🔴 CRITICAL: NEVER display raw database status values to users.
 * Always use this helper to convert database values to human-readable labels.
 *
 * This function looks up the status in the ALL_STATUS_LABELS constant
 * which contains all status values from all modules.
 *
 * @param status - The database status value (e.g., 'ACTIVE', 'PLANNING', 'REQUESTED', 'SCHEDULED')
 * @param language - The language for the label ('en' or 'es')
 * @returns The localized status label, or the raw status if no label is found
 *
 * @example
 * getStatusLabel('ACTIVE', 'en')      // Returns 'Active'
 * getStatusLabel('PLANNING', 'es')    // Returns 'Planificación'
 * getStatusLabel('REQUESTED', 'en')   // Returns 'Requested'
 * getStatusLabel('SCHEDULED', 'es')   // Returns 'Programado'
 * getStatusLabel('CONFIRMED', 'en')   // Returns 'Confirmed'
 */
export function getStatusLabel(
  status: string | null | undefined,
  language: 'en' | 'es'
): string {
  if (!status) return ''

  // Look up the status in the combined labels constant
  const labelObj = ALL_STATUS_LABELS[status]

  // Return the localized label, or fall back to the raw status if not found
  return labelObj ? labelObj[language] : status
}
