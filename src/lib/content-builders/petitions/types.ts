/**
 * Types for petition content builders
 */

/**
 * A single petition with its text
 */
export interface PetitionContent {
  text: string
}

/**
 * Collection of petitions
 */
export interface PetitionCollection {
  petitions: PetitionContent[]
}

/**
 * Template ID for different petition types
 */
export type PetitionTemplateId =
  | 'wedding-english-default'
  | 'wedding-spanish-default'
  | 'funeral-english-default'
  | 'funeral-spanish-default'
  | 'baptism-english-default'
  | 'baptism-spanish-default'
  | 'presentation-english-default'
  | 'presentation-spanish-default'
