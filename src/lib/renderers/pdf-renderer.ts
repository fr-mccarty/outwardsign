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
import {
  ELEMENT_STYLES,
  resolveElementStyle,
  type ResolvedStyle,
} from '@/lib/styles/liturgical-script-styles'

// ============================================================================
// STYLE HELPERS
// ============================================================================

/**
 * Apply resolved style properties to pdfmake format
 * Pure converter - no style lookups or decisions
 */
function applyResolvedStyle(style: ResolvedStyle) {
  return {
    fontSize: style.fontSize,
    bold: style.bold,
    italics: style.italic,
    color: style.color,
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
    case 'event-title': {
      const style = resolveElementStyle('event-title')
      return style ? {
        text: element.text,
        ...applyResolvedStyle(style),
      } : { text: '' }
    }

    case 'event-datetime': {
      const style = resolveElementStyle('event-datetime')
      return style ? {
        text: element.text,
        ...applyResolvedStyle(style),
      } : { text: '' }
    }

    case 'section-title': {
      const style = resolveElementStyle('section-title')
      return style ? {
        text: element.text,
        ...applyResolvedStyle(style),
      } : { text: '' }
    }

    case 'reading-title': {
      const style = resolveElementStyle('reading-title')
      return style ? {
        text: element.text,
        ...applyResolvedStyle(style),
      } : { text: '' }
    }

    case 'pericope': {
      const style = resolveElementStyle('pericope')
      return style ? {
        text: element.text,
        ...applyResolvedStyle(style),
      } : { text: '' }
    }

    case 'reader-name': {
      const style = resolveElementStyle('reader-name')
      return style ? {
        text: element.text,
        ...applyResolvedStyle(style),
      } : { text: '' }
    }

    case 'introduction': {
      const style = resolveElementStyle('introduction')
      return style ? {
        text: element.text,
        ...applyResolvedStyle(style),
      } : { text: '' }
    }

    case 'reading-text': {
      const style = resolveElementStyle('reading-text')
      return style ? {
        text: element.text,
        ...applyResolvedStyle(style),
      } : { text: '' }
    }

    case 'conclusion': {
      const style = resolveElementStyle('conclusion')
      return style ? {
        text: element.text,
        ...applyResolvedStyle(style),
      } : { text: '' }
    }

    case 'response': {
      const containerStyle = resolveElementStyle('response')
      const labelStyle = resolveElementStyle('response-label')
      const textStyle = resolveElementStyle('response-text')
      return containerStyle && labelStyle && textStyle ? {
        text: [
          {
            text: element.label || '',
            bold: labelStyle.bold,
            italics: labelStyle.italic,
            color: labelStyle.color,
            fontSize: labelStyle.fontSize,
          },
          {
            text: ' ' + (element.text || ''),
            bold: textStyle.bold,
            italics: textStyle.italic,
            color: textStyle.color,
            fontSize: textStyle.fontSize,
          },
        ],
        ...applyResolvedStyle(containerStyle),
      } : { text: '' }
    }

    case 'priest-dialogue': {
      const style = resolveElementStyle('priest-dialogue')
      return style ? {
        text: element.text,
        ...applyResolvedStyle(style),
      } : { text: '' }
    }

    case 'petition': {
      const containerStyle = resolveElementStyle('petition')
      const labelStyle = resolveElementStyle('petition-label')
      const textStyle = resolveElementStyle('petition-text')
      return containerStyle && labelStyle && textStyle ? {
        text: [
          {
            text: element.label || '',
            bold: labelStyle.bold,
            italics: labelStyle.italic,
            color: labelStyle.color,
            fontSize: labelStyle.fontSize,
          },
          {
            text: ' ' + (element.text || ''),
            bold: textStyle.bold,
            italics: textStyle.italic,
            color: textStyle.color,
            fontSize: textStyle.fontSize,
          },
        ],
        ...applyResolvedStyle(containerStyle),
      } : { text: '' }
    }

    case 'text': {
      const style = resolveElementStyle('text')
      return style ? {
        text: element.text,
        ...applyResolvedStyle(style),
      } : { text: '' }
    }

    case 'rubric': {
      const style = resolveElementStyle('rubric')
      return style ? {
        text: element.text,
        ...applyResolvedStyle(style),
      } : { text: '' }
    }

    case 'prayer-text': {
      const style = resolveElementStyle('prayer-text')
      return style ? {
        text: element.text,
        ...applyResolvedStyle(style),
      } : { text: '' }
    }

    case 'priest-text': {
      const style = resolveElementStyle('priest-text')
      return style ? {
        text: element.text,
        ...applyResolvedStyle(style),
      } : { text: '' }
    }

    case 'info-row': {
      const containerStyle = resolveElementStyle('info-row')
      const labelStyle = resolveElementStyle('info-row-label')
      const valueStyle = resolveElementStyle('info-row-value')
      return containerStyle && labelStyle && valueStyle ? {
        columns: [
          {
            text: element.label,
            bold: labelStyle.bold,
            italics: labelStyle.italic,
            width: labelStyle.width,
            color: labelStyle.color,
            fontSize: labelStyle.fontSize,
          },
          {
            text: element.value,
            width: '*',
            bold: valueStyle.bold,
            italics: valueStyle.italic,
            color: valueStyle.color,
            fontSize: valueStyle.fontSize,
          },
        ],
        margin: containerStyle.marginTop ? [0, containerStyle.marginTop, 0, containerStyle.marginBottom] : undefined,
      } : { text: '' }
    }

    case 'spacer': {
      const spacerSize = element.size === 'large'
        ? ELEMENT_STYLES.spacer.large
        : element.size === 'medium'
        ? ELEMENT_STYLES.spacer.medium
        : ELEMENT_STYLES.spacer.small
      return {
        text: '',
        margin: [0, 0, 0, spacerSize],
      }
    }

    case 'multi-part-text': {
      // Deprecated - render as plain text
      const style = resolveElementStyle('text')
      return style ? {
        text: element.parts.map((part) => part.text).join(''),
        ...applyResolvedStyle(style),
      } : { text: '' }
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
