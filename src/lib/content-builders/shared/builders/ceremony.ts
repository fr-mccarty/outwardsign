/**
 * Ceremony/Liturgy Builder
 *
 * Highly customizable builder for creating ceremony sections with flexible content
 * Used for ritual actions, prayers, blessings, dialogues, and other liturgical elements
 */

import { ContentSection, ContentElement } from '@/lib/types/liturgy-content'

/**
 * Configuration for a single ceremony element
 *
 * Provides a flexible way to add different types of liturgical content
 */
export interface CeremonyElement {
  type:
    | 'section-title'
    | 'rubric'
    | 'priest-dialogue'
    | 'priest-text'
    | 'prayer-text'
    | 'response'
    | 'text'
    | 'spacer'
  text?: string // Text content (for most types)
  label?: string // Label for responses (e.g., 'ALL:', 'BRIDE:')
  size?: 'small' | 'medium' | 'large' // Size for spacers
}

/**
 * Configuration for building a ceremony section
 */
export interface CeremonySectionConfig {
  id: string // Section ID (e.g., 'marriage-consent', 'nuptial-blessing')
  title: string // Section title (displayed as section-title element)
  elements: CeremonyElement[] // Array of ceremony elements
  pageBreakBefore?: boolean // Add page break before section
  pageBreakAfter?: boolean // Add page break after section
  includeTitle?: boolean // Include section title element (default: true)
  introRubric?: string // Optional introductory rubric before elements
  closingRubric?: string // Optional closing rubric after elements
}

/**
 * Build a ceremony section
 *
 * Creates a flexible ceremony section with customizable liturgical elements.
 * Supports rubrics, prayers, dialogues, responses, and spacing.
 *
 * Returns the complete ceremony section ready to add to a liturgy document.
 *
 * @example
 * // Marriage Consent
 * const consent = buildCeremonySection({
 *   id: 'marriage-consent',
 *   title: 'MARRIAGE CONSENT',
 *   pageBreakBefore: true,
 *   introRubric: 'The priest addresses the bride and groom:',
 *   elements: [
 *     { type: 'priest-dialogue', text: 'Have you come here freely and without coercion?' },
 *     { type: 'spacer', size: 'small' },
 *     { type: 'response', label: 'COUPLE:', text: 'We have.' },
 *   ]
 * })
 *
 * @example
 * // Prayer Section
 * const prayer = buildCeremonySection({
 *   id: 'opening-prayer',
 *   title: 'OPENING PRAYER',
 *   elements: [
 *     { type: 'rubric', text: 'The priest invites all to pray:' },
 *     { type: 'spacer', size: 'small' },
 *     { type: 'priest-text', text: 'Lord, bless this gathering...' },
 *     { type: 'spacer', size: 'small' },
 *     { type: 'response', label: 'ALL:', text: 'Amen.' },
 *   ]
 * })
 */
export function buildCeremonySection(config: CeremonySectionConfig): ContentSection {
  const {
    id,
    title,
    elements,
    pageBreakBefore = false,
    pageBreakAfter = false,
    includeTitle = true,
    introRubric,
    closingRubric,
  } = config

  const contentElements: ContentElement[] = []

  // Add section title (if enabled)
  if (includeTitle) {
    contentElements.push({
      type: 'section-title',
      text: title,
    })

    // Add spacing after title
    contentElements.push({
      type: 'spacer',
      size: 'medium',
    })
  }

  // Add introductory rubric (if provided)
  if (introRubric) {
    contentElements.push({
      type: 'rubric',
      text: introRubric,
    })
    contentElements.push({
      type: 'spacer',
      size: 'small',
    })
  }

  // Add all ceremony elements
  elements.forEach((element) => {
    contentElements.push(element as ContentElement)
  })

  // Add closing rubric (if provided)
  if (closingRubric) {
    contentElements.push({
      type: 'spacer',
      size: 'small',
    })
    contentElements.push({
      type: 'rubric',
      text: closingRubric,
    })
  }

  return {
    id,
    pageBreakBefore,
    pageBreakAfter,
    elements: contentElements,
  }
}

/**
 * Helper: Build a simple dialogue exchange
 *
 * Convenience function for priest question + response pattern
 */
export function buildDialogueExchange(
  question: string,
  response: string,
  responseLabel = 'ALL:'
): CeremonyElement[] {
  return [
    { type: 'priest-dialogue', text: question },
    { type: 'spacer', size: 'small' },
    { type: 'response', label: responseLabel, text: response },
    { type: 'spacer', size: 'small' },
  ]
}

/**
 * Helper: Build a prayer with Amen response
 *
 * Convenience function for prayer text + Amen pattern
 */
export function buildPrayerWithAmen(
  prayerText: string,
  includeRubric = false,
  rubricText = 'The priest prays:'
): CeremonyElement[] {
  const elements: CeremonyElement[] = []

  if (includeRubric) {
    elements.push({ type: 'rubric', text: rubricText })
    elements.push({ type: 'spacer', size: 'small' })
  }

  elements.push({ type: 'priest-text', text: prayerText })
  elements.push({ type: 'spacer', size: 'small' })
  elements.push({ type: 'response', label: 'ALL:', text: 'Amen.' })

  return elements
}

/**
 * Helper: Build a series of questions and responses
 *
 * Convenience function for questionnaire-style ceremonies (e.g., baptismal promises)
 */
export function buildQuestionSeries(
  questions: Array<{ question: string; response: string; responseLabel?: string }>
): CeremonyElement[] {
  const elements: CeremonyElement[] = []

  questions.forEach((q, index) => {
    elements.push({ type: 'priest-dialogue', text: q.question })
    elements.push({ type: 'spacer', size: 'small' })
    elements.push({
      type: 'response',
      label: q.responseLabel || 'RESPONSE:',
      text: q.response,
    })

    // Add spacing between questions (except after last)
    if (index < questions.length - 1) {
      elements.push({ type: 'spacer', size: 'small' })
    }
  })

  return elements
}

/**
 * Helper: Build a rubric with action
 *
 * Convenience function for rubric + action pattern
 */
export function buildRubricAction(
  rubric: string,
  actionText?: string,
  actionType: 'priest-text' | 'prayer-text' = 'priest-text'
): CeremonyElement[] {
  const elements: CeremonyElement[] = [
    { type: 'rubric', text: rubric },
    { type: 'spacer', size: 'small' },
  ]

  if (actionText) {
    elements.push({ type: actionType, text: actionText })
  }

  return elements
}
