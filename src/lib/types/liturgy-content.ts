/**
 * Type definitions for liturgical content structure
 *
 * This provides a format-agnostic way to represent liturgical documents
 * that can be rendered to HTML, PDF, or Word with consistent styling.
 */

// ============================================================================
// FORMATTING & ALIGNMENT
// ============================================================================

export type TextFormatting = 'bold' | 'italic' | 'bolditalic'

export type TextAlignment = 'left' | 'center' | 'right' | 'justify'

export type TextColor = 'default' | 'liturgy-red'

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
 * Simple text element with optional formatting
 */
export interface TextElement extends BaseElement {
  type: 'text'
  text: string
  formatting?: TextFormatting[]
  alignment?: TextAlignment
  color?: TextColor
  preserveLineBreaks?: boolean
}

/**
 * Multi-part text element (e.g., "People: Thanks be to God" with different formatting)
 */
export interface MultiPartTextElement extends BaseElement {
  type: 'multi-part-text'
  parts: Array<{
    text: string
    formatting?: TextFormatting[]
    color?: TextColor
  }>
  alignment?: TextAlignment
}

/**
 * Event title (e.g., "Jane Doe & John Smith")
 */
export interface EventTitleElement extends BaseElement {
  type: 'event-title'
  text: string
  alignment?: TextAlignment
}

/**
 * Event date/time
 */
export interface EventDateTimeElement extends BaseElement {
  type: 'event-datetime'
  text: string
  alignment?: TextAlignment
}

/**
 * Section title (e.g., "Rehearsal", "Wedding", "Sacred Liturgy")
 */
export interface SectionTitleElement extends BaseElement {
  type: 'section-title'
  text: string
  alignment?: TextAlignment
}

/**
 * Reading title (e.g., "FIRST READING", "Psalm", "Gospel")
 */
export interface ReadingTitleElement extends BaseElement {
  type: 'reading-title'
  text: string
  alignment?: TextAlignment
}

/**
 * Scripture reference (pericope)
 */
export interface PericopeElement extends BaseElement {
  type: 'pericope'
  text: string
  alignment?: TextAlignment
}

/**
 * Reader name
 */
export interface ReaderNameElement extends BaseElement {
  type: 'reader-name'
  text: string
  alignment?: TextAlignment
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
  preserveLineBreaks: boolean
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
 */
export interface ResponseElement extends BaseElement {
  type: 'response'
  parts: Array<{
    text: string
    formatting?: TextFormatting[]
  }>
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
 */
export interface PetitionElement extends BaseElement {
  type: 'petition'
  parts: Array<{
    text: string
    formatting?: TextFormatting[]
    color?: TextColor
  }>
}

/**
 * Rubric (liturgical instruction/direction in italics)
 */
export interface RubricElement extends BaseElement {
  type: 'rubric'
  text: string
  alignment?: TextAlignment
}

/**
 * Prayer text (formatted prayer content)
 */
export interface PrayerTextElement extends BaseElement {
  type: 'prayer-text'
  text: string
  preserveLineBreaks?: boolean
  alignment?: TextAlignment
}

/**
 * Priest text (priest's response or dialogue)
 */
export interface PriestTextElement extends BaseElement {
  type: 'priest-text'
  text: string
  alignment?: TextAlignment
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
  | MultiPartTextElement
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
