/**
 * Presentation Template Helpers
 *
 * Shared helper functions used across all presentation templates
 */

import { PresentationWithRelations } from '@/lib/actions/presentations'
import { formatEventDateTime } from '@/lib/utils/formatters'

// ============================================================================
// NAME HELPERS
// ============================================================================

/**
 * Get child's full name (English fallback)
 */
export function getChildName(presentation: PresentationWithRelations): string {
  const child = presentation.child
  return child ? `${child.first_name} ${child.last_name}` : '[Child\'s Name]'
}

/**
 * Get child's full name (Spanish fallback)
 */
export function getChildNameSpanish(presentation: PresentationWithRelations): string {
  const child = presentation.child
  return child ? `${child.first_name} ${child.last_name}` : '[Nombre del Niño/a]'
}

/**
 * Get mother's full name (English fallback)
 */
export function getMotherName(presentation: PresentationWithRelations): string {
  const mother = presentation.mother
  return mother ? `${mother.first_name} ${mother.last_name}` : '[Mother\'s Name]'
}

/**
 * Get mother's full name (Spanish fallback)
 */
export function getMotherNameSpanish(presentation: PresentationWithRelations): string {
  const mother = presentation.mother
  return mother ? `${mother.first_name} ${mother.last_name}` : '[Nombre de la Madre]'
}

/**
 * Get father's full name (English fallback)
 */
export function getFatherName(presentation: PresentationWithRelations): string {
  const father = presentation.father
  return father ? `${father.first_name} ${father.last_name}` : '[Father\'s Name]'
}

/**
 * Get father's full name (Spanish fallback)
 */
export function getFatherNameSpanish(presentation: PresentationWithRelations): string {
  const father = presentation.father
  return father ? `${father.first_name} ${father.last_name}` : '[Nombre del Padre]'
}

/**
 * Get child's full name (Bilingual fallback)
 */
export function getChildNameBilingual(presentation: PresentationWithRelations): string {
  const child = presentation.child
  return child ? `${child.first_name} ${child.last_name}` : '[Child\'s Name / Nombre del Niño/a]'
}

/**
 * Get mother's full name (Bilingual fallback)
 */
export function getMotherNameBilingual(presentation: PresentationWithRelations): string {
  const mother = presentation.mother
  return mother ? `${mother.first_name} ${mother.last_name}` : '[Mother\'s Name / Nombre de la Madre]'
}

/**
 * Get father's full name (Bilingual fallback)
 */
export function getFatherNameBilingual(presentation: PresentationWithRelations): string {
  const father = presentation.father
  return father ? `${father.first_name} ${father.last_name}` : '[Father\'s Name / Nombre del Padre]'
}

/**
 * Get child's sex with fallback
 */
export function getChildSex(presentation: PresentationWithRelations): 'Male' | 'Female' {
  return presentation.child?.sex || 'Male'
}

/**
 * Check if child is baptized
 */
export function isBaptized(presentation: PresentationWithRelations): boolean {
  return presentation.is_baptized
}

// ============================================================================
// GENDERED TEXT HELPERS
// ============================================================================

/**
 * Get gendered text based on child's sex
 *
 * @example
 * gendered(presentation, 'son', 'daughter') // Returns 'son' if child is male
 */
export function gendered(
  presentation: PresentationWithRelations,
  maleText: string,
  femaleText: string
): string {
  const sex = getChildSex(presentation)
  return sex === 'Male' ? maleText : femaleText
}

/**
 * Get gendered pronoun
 *
 * @example
 * genderedPronoun(presentation, 'en') // Returns 'he/him/his' based on child's sex
 */
export function genderedPronoun(
  presentation: PresentationWithRelations,
  language: 'en' | 'es',
  type: 'subject' | 'object' | 'possessive'
): string {
  const sex = getChildSex(presentation)

  if (language === 'en') {
    if (type === 'subject') return sex === 'Male' ? 'he' : 'she'
    if (type === 'object') return sex === 'Male' ? 'him' : 'her'
    if (type === 'possessive') return sex === 'Male' ? 'his' : 'her'
  }

  if (language === 'es') {
    if (type === 'subject') return sex === 'Male' ? 'él' : 'ella'
    if (type === 'object') return sex === 'Male' ? 'lo' : 'la'
    if (type === 'possessive') return sex === 'Male' ? 'su' : 'su'
  }

  return ''
}

// ============================================================================
// PARENTS TEXT HELPERS
// ============================================================================

/**
 * Get formatted parents text (English)
 *
 * @example
 * getParentsTextEnglish(presentation) // "the parents, Mary Smith and John Smith"
 */
export function getParentsTextEnglish(presentation: PresentationWithRelations): string {
  const motherName = getMotherName(presentation)
  const fatherName = getFatherName(presentation)
  return `the parents, ${motherName} and ${fatherName}`
}

/**
 * Get formatted parents text (Spanish)
 *
 * @example
 * getParentsTextSpanish(presentation) // "los padres, María García y Juan García"
 */
export function getParentsTextSpanish(presentation: PresentationWithRelations): string {
  const motherName = getMotherNameSpanish(presentation)
  const fatherName = getFatherNameSpanish(presentation)
  return `los padres, ${motherName} y ${fatherName}`
}

// ============================================================================
// AUDIENCE TEXT HELPERS
// ============================================================================

/**
 * Get audience text (English)
 * Currently returns 'parents' but can be extended for godparents, etc.
 */
export function getAudienceTextEnglish(): string {
  return 'parents'
}

/**
 * Get audience text (Spanish)
 * Currently returns 'padres' but can be extended for godparents, etc.
 */
export function getAudienceTextSpanish(): string {
  return 'padres'
}

// ============================================================================
// TITLE BUILDERS
// ============================================================================

/**
 * Build default title (English)
 */
export function buildTitleEnglish(presentation: PresentationWithRelations): string {
  const childName = getChildName(presentation)
  return `Presentation in the Temple - ${childName}`
}

/**
 * Build default title (Spanish)
 */
export function buildTitleSpanish(presentation: PresentationWithRelations): string {
  const childName = getChildNameSpanish(presentation)
  return `Presentación en el Templo - ${childName}`
}

// ============================================================================
// EVENT HELPERS
// ============================================================================

/**
 * Get event subtitle with fallback text (English)
 */
export function getEventSubtitleEnglish(presentation: PresentationWithRelations): string {
  if (!presentation.presentation_event?.start_date) {
    return 'No date/time'
  }
  return formatEventDateTime(presentation.presentation_event)
}

/**
 * Get event subtitle with fallback text (Spanish)
 */
export function getEventSubtitleSpanish(presentation: PresentationWithRelations): string {
  if (!presentation.presentation_event?.start_date) {
    return 'Sin fecha/hora'
  }
  return formatEventDateTime(presentation.presentation_event)
}

/**
 * Get event subtitle with fallback text (Bilingual)
 */
export function getEventSubtitleBilingual(presentation: PresentationWithRelations): string {
  if (!presentation.presentation_event?.start_date) {
    return 'No date/time / Sin fecha/hora'
  }
  return formatEventDateTime(presentation.presentation_event)
}
