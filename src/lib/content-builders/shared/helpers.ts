/**
 * Shared Content Builder Helpers
 *
 * Reusable helper functions for use across all content builder templates
 */

import { Person } from '@/lib/types'

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
