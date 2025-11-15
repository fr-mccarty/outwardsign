/**
 * Type definitions for liturgical content structure
 *
 * This provides a format-agnostic way to represent liturgical documents
 * that can be rendered to HTML, PDF, or Word with consistent styling.
 *
 * All styling is controlled globally via liturgical-script-styles.ts
 * Elements only contain semantic content (text, labels), not style properties.
 */

// ============================================================================
// CONTENT ELEMENT TYPES
// ============================================================================

/**
 * Base element type that all content elements extend
 */
export interface BaseElement {
  type: string
  id?: string
}

/**
 * Simple text element
 */
export interface TextElement extends BaseElement {
  type: 'text'
  text: string
}

/**
 * Event title (e.g., "Jane Doe & John Smith")
 */
export interface EventTitleElement extends BaseElement {
  type: 'event-title'
  text: string
}

/**
 * Event date/time
 */
export interface EventDateTimeElement extends BaseElement {
  type: 'event-datetime'
  text: string
}

/**
 * Section title (e.g., "Rehearsal", "Wedding", "Sacred Liturgy")
 */
export interface SectionTitleElement extends BaseElement {
  type: 'section-title'
  text: string
}

/**
 * Reading title (e.g., "FIRST READING", "Psalm", "Gospel")
 */
export interface ReadingTitleElement extends BaseElement {
  type: 'reading-title'
  text: string
}

/**
 * Scripture reference (pericope)
 */
export interface PericopeElement extends BaseElement {
  type: 'pericope'
  text: string
}

/**
 * Reader name
 */
export interface ReaderNameElement extends BaseElement {
  type: 'reader-name'
  text: string
}

/**
 * Reading introduction (e.g., "A reading from...")
 */
export interface IntroductionElement extends BaseElement {
  type: 'introduction'
  text: string
}

/**
 * Reading text (scripture passage)
 */
export interface ReadingTextElement extends BaseElement {
  type: 'reading-text'
  text: string
}

/**
 * Reading conclusion (e.g., "The word of the Lord")
 */
export interface ConclusionElement extends BaseElement {
  type: 'conclusion'
  text: string
}

/**
 * Response (e.g., "People: Thanks be to God")
 * Label is rendered bold, text is rendered normal
 */
export interface ResponseElement extends BaseElement {
  type: 'response'
  label: string  // e.g., "People:"
  text: string   // e.g., "Thanks be to God"
}

/**
 * Priest/Deacon dialogue
 */
export interface PriestDialogueElement extends BaseElement {
  type: 'priest-dialogue'
  text: string
}

/**
 * Petition text
 * Label is rendered bold + liturgy red, text is rendered normal
 */
export interface PetitionElement extends BaseElement {
  type: 'petition'
  label: string  // e.g., "Reader:"
  text: string   // e.g., "For the Church, let us pray to the Lord"
}

/**
 * Rubric (liturgical instruction/direction in italics)
 */
export interface RubricElement extends BaseElement {
  type: 'rubric'
  text: string
}

/**
 * Prayer text (formatted prayer content)
 */
export interface PrayerTextElement extends BaseElement {
  type: 'prayer-text'
  text: string
}

/**
 * Priest text (priest's response or dialogue)
 */
export interface PriestTextElement extends BaseElement {
  type: 'priest-text'
  text: string
}

/**
 * Info grid row (label: value pairs for summary section)
 */
export interface InfoRowElement extends BaseElement {
  type: 'info-row'
  label: string
  value: string
}

/**
 * Empty line for spacing
 */
export interface SpacerElement extends BaseElement {
  type: 'spacer'
  size?: 'small' | 'medium' | 'large'
}

/**
 * Union type of all possible content elements
 */
export type ContentElement =
  | TextElement
  | EventTitleElement
  | EventDateTimeElement
  | SectionTitleElement
  | ReadingTitleElement
  | PericopeElement
  | ReaderNameElement
  | IntroductionElement
  | ReadingTextElement
  | ConclusionElement
  | ResponseElement
  | PriestDialogueElement
  | PetitionElement
  | RubricElement
  | PrayerTextElement
  | PriestTextElement
  | InfoRowElement
  | SpacerElement

// ============================================================================
// SECTION TYPES
// ============================================================================

/**
 * A section is a group of related content elements
 */
export interface ContentSection {
  id: string
  title?: string
  pageBreakBefore?: boolean
  pageBreakAfter?: boolean
  elements: ContentElement[]
}

// ============================================================================
// DOCUMENT STRUCTURE
// ============================================================================

/**
 * Complete liturgical document
 */
export interface LiturgyDocument {
  /** Metadata */
  id: string
  type: 'wedding' | 'baptism' | 'funeral' | 'quinceanera' | 'presentation' | 'mass' | 'mass-intention'
  language: string
  template: string

  /** Document title and subtitle */
  title: string
  subtitle?: string

  /** Organized sections */
  sections: ContentSection[]
}

// ============================================================================
// TEMPLATE DEFINITION
// ============================================================================

/**
 * Template builder function signature
 */
export type TemplateBuilder<T = any> = (data: T) => LiturgyDocument

/**
 * Template definition
 */
export interface LiturgyTemplate<T = any> {
  id: string
  name: string
  description: string
  supportedLanguages: string[]
  builder: TemplateBuilder<T>
}
