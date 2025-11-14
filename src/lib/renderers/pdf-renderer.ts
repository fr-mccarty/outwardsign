/**
 * PDF Renderer
 *
 * Converts LiturgyDocument to pdfmake content format using global styles from liturgical-script-styles.ts
 */

import { Content } from 'pdfmake/interfaces'
import {
  LiturgyDocument,
  ContentSection,
  ContentElement,
} from '@/lib/types/liturgy-content'
import { ELEMENT_STYLES, LITURGY_COLORS } from '@/lib/styles/liturgical-script-styles'

// ============================================================================
// STYLE HELPERS
// ============================================================================

/**
 * Convert element style to pdfmake format (using points directly)
 */
function getElementStyle(elementType: keyof typeof ELEMENT_STYLES) {
  if (elementType === 'spacer') {
    return {} // Spacer handled separately
  }

  const style = ELEMENT_STYLES[elementType]

  return {
    fontSize: style.fontSize,
    bold: style.bold,
    italics: style.italic,
    color: style.color === 'liturgy-red' ? LITURGY_COLORS.liturgyRed : undefined,
    alignment: style.alignment as 'left' | 'center' | 'right' | 'justify',
    margin: [0, style.marginTop, 0, style.marginBottom] as [number, number, number, number],
    lineHeight: style.lineHeight,
    preserveLeadingSpaces: style.preserveLineBreaks,
  }
}

// ============================================================================
// ELEMENT RENDERERS
// ============================================================================

/**
 * Render a single content element to pdfmake format
 */
function renderElement(element: ContentElement): Content {
  switch (element.type) {
    case 'event-title':
      return {
        text: element.text,
        ...getElementStyle('event-title'),
      }

    case 'event-datetime':
      return {
        text: element.text,
        ...getElementStyle('event-datetime'),
      }

    case 'section-title':
      return {
        text: element.text,
        ...getElementStyle('section-title'),
      }

    case 'reading-title':
      return {
        text: element.text,
        ...getElementStyle('reading-title'),
      }

    case 'pericope':
      return {
        text: element.text,
        ...getElementStyle('pericope'),
      }

    case 'reader-name':
      return {
        text: element.text,
        ...getElementStyle('reader-name'),
      }

    case 'introduction':
      return {
        text: element.text,
        ...getElementStyle('introduction'),
      }

    case 'reading-text':
      return {
        text: element.text,
        ...getElementStyle('reading-text'),
      }

    case 'conclusion':
      return {
        text: element.text,
        ...getElementStyle('conclusion'),
      }

    case 'response':
      const responseStyle = getElementStyle('response')
      return {
        text: [
          { text: element.label || '', bold: true },
          { text: ' ' + (element.text || '') },
        ],
        ...responseStyle,
      }

    case 'priest-dialogue':
      return {
        text: element.text,
        ...getElementStyle('priest-dialogue'),
      }

    case 'petition':
      const petitionStyle = getElementStyle('petition')
      return {
        text: [
          { text: element.label || '', bold: true, color: LITURGY_COLORS.liturgyRed },
          { text: ' ' + (element.text || '') },
        ],
        ...petitionStyle,
      }

    case 'text':
      return {
        text: element.text,
        ...getElementStyle('text'),
      }

    case 'rubric':
      return {
        text: element.text,
        ...getElementStyle('rubric'),
      }

    case 'prayer-text':
      return {
        text: element.text,
        ...getElementStyle('prayer-text'),
      }

    case 'priest-text':
      return {
        text: element.text,
        ...getElementStyle('priest-text'),
      }

    case 'info-row':
      const infoStyle = getElementStyle('info-row')
      return {
        columns: [
          {
            text: element.label,
            bold: true,
            width: 150,
          },
          {
            text: element.value,
            width: '*',
          },
        ],
        margin: infoStyle.margin,
      }

    case 'spacer':
      const spacerSize = element.size === 'large'
        ? ELEMENT_STYLES.spacer.large
        : element.size === 'medium'
        ? ELEMENT_STYLES.spacer.medium
        : ELEMENT_STYLES.spacer.small
      return {
        text: '',
        margin: [0, 0, 0, spacerSize],
      }

    case 'multi-part-text':
      // Deprecated - render as plain text
      return {
        text: element.parts.map((part) => part.text).join(''),
        ...getElementStyle('text'),
      }

    default:
      return { text: '' }
  }
}

/**
 * Render a content section to pdfmake format
 */
function renderSection(section: ContentSection): Content[] {
  const content: Content[] = []

  // Add page break before if needed
  if (section.pageBreakBefore) {
    content.push({ text: '', pageBreak: 'before' as const })
  }

  // Render all elements in the section
  section.elements.forEach((element) => {
    content.push(renderElement(element))
  })

  // Add page break after if needed
  if (section.pageBreakAfter) {
    content.push({ text: '', pageBreak: 'after' as const })
  }

  return content
}

// ============================================================================
// MAIN RENDERER
// ============================================================================

/**
 * Render LiturgyDocument to pdfmake content array
 */
export function renderPDF(document: LiturgyDocument): Content[] {
  const content: Content[] = []

  // Render all sections
  document.sections.forEach((section) => {
    content.push(...renderSection(section))
  })

  return content
}
