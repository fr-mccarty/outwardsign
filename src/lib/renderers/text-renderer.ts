/**
 * Text Renderer
 *
 * Converts LiturgyDocument to plain text format
 */

import {
  LiturgyDocument,
  ContentSection,
  ContentElement,
} from '@/lib/types/liturgy-content'

// ============================================================================
// CONSTANTS
// ============================================================================

const LINE_WIDTH = 70

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Center text within the line width
 */
function centerText(text: string): string {
  const padding = Math.max(0, Math.floor((LINE_WIDTH - text.length) / 2))
  return ' '.repeat(padding) + text
}

/**
 * Create underline of equals signs matching text length
 */
function createUnderline(text: string): string {
  const padding = Math.max(0, Math.floor((LINE_WIDTH - text.length) / 2))
  return ' '.repeat(padding) + '='.repeat(text.length)
}

// ============================================================================
// ELEMENT RENDERERS
// ============================================================================

/**
 * Render a single content element to plain text
 */
function renderElement(element: ContentElement): string {
  switch (element.type) {
    case 'event-title':
      return centerText(element.text.toUpperCase()) + '\n'

    case 'event-datetime':
      return centerText(element.text) + '\n'

    case 'section-title':
      return '\n' + centerText(element.text) + '\n' + createUnderline(element.text) + '\n'

    case 'reading-title':
      return '\n' + element.text.toUpperCase() + '\n'

    case 'pericope':
      return element.text + '\n'

    case 'reader-name':
      return 'Reader: ' + element.text + '\n'

    case 'introduction':
      return element.text + '\n'

    case 'reading-text':
      return '\n' + element.text + '\n'

    case 'conclusion':
      return '\n' + element.text + '\n'

    case 'response-dialogue':
      return `${element.label} ${element.text}\n`

    case 'presider-dialogue':
      if (element.label) {
        return `${element.label} ${element.text}\n`
      }
      return element.text + '\n'

    case 'petition':
      return `${element.label} ${element.text}\n`

    case 'text':
      return element.text + '\n'

    case 'rubric':
      return `[${element.text}]\n`

    case 'prayer-text':
      return element.text + '\n'

    case 'priest-text':
      return element.text + '\n'

    case 'info-row':
      return `${element.label} ${element.value}\n`

    case 'info-row-with-avatar':
      return `${element.label} ${element.value}\n`

    case 'spacer':
      return '\n'

    case 'image':
      return element.alt ? `[Image: ${element.alt}]\n` : ''

    default:
      return ''
  }
}

/**
 * Render a content section to plain text
 */
function renderSection(section: ContentSection, isLastSection: boolean): string {
  let output = ''

  // Add page break indicator before if needed
  if (section.pageBreakBefore) {
    output += '\n--- PAGE BREAK ---\n\n'
  }

  // Render all elements in the section
  section.elements.forEach((element) => {
    output += renderElement(element)
  })

  // Add page break indicator after if needed (but not for the last section)
  if (section.pageBreakAfter && !isLastSection) {
    output += '\n--- PAGE BREAK ---\n\n'
  }

  return output
}

// ============================================================================
// MAIN RENDERER
// ============================================================================

/**
 * Render LiturgyDocument to plain text string
 */
export function renderText(document: LiturgyDocument): string {
  let output = ''

  // Render title at the top
  output += centerText(document.title.toUpperCase()) + '\n'
  output += createUnderline(document.title) + '\n'

  // Render subtitle (if present)
  if (document.subtitle) {
    output += centerText(document.subtitle) + '\n'
  }

  output += '\n'

  // Render all sections
  document.sections.forEach((section, index) => {
    const isLastSection = index === document.sections.length - 1
    output += renderSection(section, isLastSection)
  })

  return output
}
