/**
 * Word Document Renderer
 *
 * Converts LiturgyDocument to docx Paragraph format using global styles from liturgical-script-styles.ts
 */

import { Paragraph, TextRun, PageBreak, AlignmentType } from 'docx'
import {
  LiturgyDocument,
  ContentSection,
  ContentElement,
} from '@/lib/types/liturgy-content'
import { ELEMENT_STYLES, LITURGY_COLORS, LITURGY_FONT, convert } from '@/lib/styles/liturgical-script-styles'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert alignment string to docx AlignmentType
 */
function getAlignmentType(alignment: 'left' | 'center' | 'right' | 'justify'): typeof AlignmentType[keyof typeof AlignmentType] {
  switch (alignment) {
    case 'center':
      return AlignmentType.CENTER
    case 'right':
      return AlignmentType.RIGHT
    case 'justify':
      return AlignmentType.JUSTIFIED
    default:
      return AlignmentType.LEFT
  }
}

/**
 * Get color in Word format (without # prefix)
 */
function getColor(color: 'black' | 'liturgy-red'): string {
  return color === 'liturgy-red'
    ? LITURGY_COLORS.liturgyRed.replace('#', '')
    : LITURGY_COLORS.black.replace('#', '')
}

/**
 * Create a Word paragraph from element style
 */
function createStyledParagraph(
  elementType: keyof typeof ELEMENT_STYLES,
  textRuns: TextRun[]
): Paragraph {
  if (elementType === 'spacer') {
    return new Paragraph({ children: [] })
  }

  const style = ELEMENT_STYLES[elementType]

  return new Paragraph({
    children: textRuns,
    alignment: getAlignmentType(style.alignment),
    spacing: {
      before: convert.pointsToTwips(style.marginTop),
      after: convert.pointsToTwips(style.marginBottom),
      line: style.lineHeight === 1.4 ? 280 : style.lineHeight === 1.2 ? 240 : 320,
    },
  })
}

/**
 * Create a TextRun with element style
 */
function createStyledTextRun(
  elementType: keyof typeof ELEMENT_STYLES,
  text: string,
  overrides?: { bold?: boolean; italics?: boolean; color?: string }
): TextRun {
  const style = ELEMENT_STYLES[elementType]

  // Spacer doesn't have fontSize, so check for it
  if (!('fontSize' in style)) {
    throw new Error(`Element type ${elementType} does not support text runs`)
  }

  return new TextRun({
    font: LITURGY_FONT,
    text: text,
    size: convert.pointsToHalfPoints(style.fontSize),
    bold: overrides?.bold !== undefined ? overrides.bold : style.bold,
    italics: overrides?.italics !== undefined ? overrides.italics : style.italic,
    color: overrides?.color || getColor(style.color as 'black' | 'liturgy-red'),
  })
}

// ============================================================================
// ELEMENT RENDERERS
// ============================================================================

/**
 * Render a single content element to docx Paragraph
 */
function renderElement(element: ContentElement): Paragraph | Paragraph[] {
  switch (element.type) {
    case 'event-title':
      return createStyledParagraph('event-title', [
        createStyledTextRun('event-title', element.text),
      ])

    case 'event-datetime':
      return createStyledParagraph('event-datetime', [
        createStyledTextRun('event-datetime', element.text),
      ])

    case 'section-title':
      return createStyledParagraph('section-title', [
        createStyledTextRun('section-title', element.text),
      ])

    case 'reading-title':
      return createStyledParagraph('reading-title', [
        createStyledTextRun('reading-title', element.text),
      ])

    case 'pericope':
      return createStyledParagraph('pericope', [
        createStyledTextRun('pericope', element.text),
      ])

    case 'reader-name':
      return createStyledParagraph('reader-name', [
        createStyledTextRun('reader-name', element.text),
      ])

    case 'introduction':
      return createStyledParagraph('introduction', [
        createStyledTextRun('introduction', element.text),
      ])

    case 'reading-text':
      return createStyledParagraph('reading-text', [
        createStyledTextRun('reading-text', element.text),
      ])

    case 'conclusion':
      return createStyledParagraph('conclusion', [
        createStyledTextRun('conclusion', element.text),
      ])

    case 'response':
      return createStyledParagraph('response', [
        createStyledTextRun('response', element.label || '', { bold: true }),
        createStyledTextRun('response', ' ' + (element.text || '')),
      ])

    case 'priest-dialogue':
      return createStyledParagraph('priest-dialogue', [
        createStyledTextRun('priest-dialogue', element.text),
      ])

    case 'petition':
      return createStyledParagraph('petition', [
        createStyledTextRun('petition', element.label || '', {
          bold: true,
          color: LITURGY_COLORS.liturgyRed.replace('#', ''),
        }),
        createStyledTextRun('petition', ' ' + (element.text || '')),
      ])

    case 'text':
      return createStyledParagraph('text', [
        createStyledTextRun('text', element.text),
      ])

    case 'rubric':
      return createStyledParagraph('rubric', [
        createStyledTextRun('rubric', element.text),
      ])

    case 'prayer-text':
      return createStyledParagraph('prayer-text', [
        createStyledTextRun('prayer-text', element.text),
      ])

    case 'priest-text':
      return createStyledParagraph('priest-text', [
        createStyledTextRun('priest-text', element.text),
      ])

    case 'info-row':
      const infoStyle = ELEMENT_STYLES['info-row']
      return new Paragraph({
        children: [
          new TextRun({
            font: LITURGY_FONT,
            text: element.label,
            size: convert.pointsToHalfPoints(infoStyle.fontSize),
            bold: true,
          }),
          new TextRun({
            font: LITURGY_FONT,
            text: ' ' + element.value,
            size: convert.pointsToHalfPoints(infoStyle.fontSize),
          }),
        ],
        spacing: {
          before: convert.pointsToTwips(infoStyle.marginTop),
          after: convert.pointsToTwips(infoStyle.marginBottom),
        },
      })

    case 'spacer':
      const spacerSize = element.size === 'large'
        ? ELEMENT_STYLES.spacer.large
        : element.size === 'medium'
        ? ELEMENT_STYLES.spacer.medium
        : ELEMENT_STYLES.spacer.small
      return new Paragraph({
        children: [],
        spacing: { after: convert.pointsToTwips(spacerSize) },
      })

    case 'multi-part-text':
      // Deprecated - render as plain text
      return createStyledParagraph('text', [
        createStyledTextRun('text', element.parts.map((part) => part.text).join('')),
      ])

    default:
      return new Paragraph({ children: [] })
  }
}

/**
 * Render a content section to docx Paragraphs
 */
function renderSection(section: ContentSection): Paragraph[] {
  const paragraphs: Paragraph[] = []

  // Add page break before if needed
  if (section.pageBreakBefore) {
    paragraphs.push(new Paragraph({ children: [new PageBreak()] }))
  }

  // Render all elements in the section
  section.elements.forEach((element) => {
    const rendered = renderElement(element)
    if (Array.isArray(rendered)) {
      paragraphs.push(...rendered)
    } else {
      paragraphs.push(rendered)
    }
  })

  // Add page break after if needed
  if (section.pageBreakAfter) {
    paragraphs.push(new Paragraph({ children: [new PageBreak()] }))
  }

  return paragraphs
}

// ============================================================================
// MAIN RENDERER
// ============================================================================

/**
 * Render LiturgyDocument to array of docx Paragraphs
 */
export function renderWord(document: LiturgyDocument): Paragraph[] {
  const paragraphs: Paragraph[] = []

  // Render all sections
  document.sections.forEach((section) => {
    paragraphs.push(...renderSection(section))
  })

  return paragraphs
}
