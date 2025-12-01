/**
 * Shared Content Builder Helpers
 *
 * Reusable helper functions for use across all content builder templates
 *
 * 🔴 SAFE DEFAULTS PRINCIPLE:
 * All functions should default to the SAFEST behavior that requires minimal assumptions:
 * - Page breaks: Default to NO page breaks (parent adds them explicitly)
 * - Optional content: Default to NOT rendering (only render when explicitly provided)
 * - Booleans: Use nullish coalescing (??) instead of logical OR (||) to preserve explicit false
 * - isPrintMode: Default to false (theme-aware view mode is safer than fixed print colors)
 *
 * This prevents unintended behavior and makes code more predictable.
 */

import { Person } from '@/lib/types'
import { MODULE_STATUS_LABELS, type Sex } from '@/lib/constants'
import { ContentSection } from '@/lib/types/liturgy-content'

// ============================================================================
// GENDERED TEXT HELPERS
// ============================================================================

/**
 * Get gendered text based on person's sex
 *
 * @param person - Person object with optional sex field
 * @param maleText - Text to return if person is male
 * @param femaleText - Text to return if person is female
 * @param defaultSex - Default sex to use if person.sex is undefined (defaults to 'MALE')
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
  defaultSex: Sex = 'MALE'
): string {
  const sex = person?.sex ?? defaultSex
  return sex === 'MALE' ? maleText : femaleText
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
 * This function looks up the status in the MODULE_STATUS_LABELS constant
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
  const labelObj = MODULE_STATUS_LABELS[status]

  // Return the localized label, or fall back to the raw status if not found
  return labelObj ? labelObj[language] : status
}

// ============================================================================
// PAGE BREAK HELPERS
// ============================================================================

/**
 * Add page breaks between sections (but NOT after the last section)
 *
 * 🔴 CRITICAL: Individual section builders (like buildCoverPage, buildReading, etc.)
 * should NOT add pageBreakAfter themselves. The parent template builder that assembles
 * all sections is responsible for adding page breaks BETWEEN sections.
 *
 * This prevents blank pages at the end of documents when the last section has pageBreakAfter: true.
 *
 * @param sections - Array of ContentSection objects
 * @returns The same array with pageBreakAfter added to all sections except the last one
 *
 * @example
 * const sections = [
 *   buildCoverPage(coverData),
 *   buildReading(readingData),
 *   buildPetitions(petitionsData)
 * ]
 * addPageBreaksBetweenSections(sections)
 * // Result: coverPage has pageBreakAfter: true, reading has pageBreakAfter: true, petitions has NO pageBreakAfter
 */
export function addPageBreaksBetweenSections(sections: ContentSection[]): ContentSection[] {
  sections.forEach((section, index) => {
    // Add pageBreakAfter to all sections EXCEPT the last one
    section.pageBreakAfter = index < sections.length - 1
  })
  return sections
}
