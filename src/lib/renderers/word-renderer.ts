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
import {
  LITURGY_FONT,
  convert,
  resolveElementStyle,
  resolveSpacerSize,
  type ResolvedStyle,
} from '@/lib/styles/liturgical-script-styles'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert alignment string to docx AlignmentType
 * Pure converter - no style lookups
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
 * Apply resolved style to create a Word paragraph
 * Pure converter - no style lookups
 */
function applyResolvedStyleToParagraph(
  style: ResolvedStyle,
  textRuns: TextRun[]
): Paragraph {
  return new Paragraph({
    children: textRuns,
    alignment: getAlignmentType(style.alignment),
    spacing: {
      before: convert.pointsToTwips(style.marginTop),
      after: convert.pointsToTwips(style.marginBottom),
      line: convert.lineHeightToTwips(style.fontSize, style.lineHeight),
    },
  })
}

/**
 * Apply resolved style to create a Word TextRun
 * Pure converter - no style lookups
 */
function applyResolvedStyleToTextRun(
  style: ResolvedStyle,
  text: string
): TextRun {
  return new TextRun({
    font: LITURGY_FONT,
    text: text,
    size: convert.pointsToHalfPoints(style.fontSize),
    bold: style.bold,
    italics: style.italic,
    color: convert.colorToWord(style.color),
  })
}

/**
 * Create a styled paragraph using element type
 * Resolves style and creates paragraph with text runs
 */
function createStyledParagraph(
  elementType: string,
  textRuns: TextRun[]
): Paragraph {
  try {
    const style = resolveElementStyle(elementType as any)
    if (!style) {
      return new Paragraph({ children: textRuns })
    }
    return applyResolvedStyleToParagraph(style, textRuns)
  } catch {
    return new Paragraph({ children: textRuns })
  }
}

/**
 * Create a styled text run using element type
 * Resolves style and creates text run
 */
function createStyledTextRun(
  elementType: string,
  text: string
): TextRun {
  try {
    const style = resolveElementStyle(elementType as any)
    if (!style) {
      return new TextRun({ text, font: LITURGY_FONT })
    }
    return applyResolvedStyleToTextRun(style, text)
  } catch {
    return new TextRun({ text, font: LITURGY_FONT })
  }
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
        createStyledTextRun('response-label', element.label || ''),
        createStyledTextRun('response-text', ' ' + (element.text || '')),
      ])

    case 'priest-dialogue':
      return createStyledParagraph('priest-dialogue', [
        createStyledTextRun('priest-dialogue', element.text),
      ])

    case 'petition':
      return createStyledParagraph('petition', [
        createStyledTextRun('petition-label', element.label || ''),
        createStyledTextRun('petition-text', ' ' + (element.text || '')),
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

    case 'info-row': {
      const infoStyle = resolveElementStyle('info-row')
      if (!infoStyle) {
        return new Paragraph({
          children: [
            createStyledTextRun('info-row-label', element.label),
            createStyledTextRun('info-row-value', ' ' + element.value),
          ],
        })
      }
      return new Paragraph({
        children: [
          createStyledTextRun('info-row-label', element.label),
          createStyledTextRun('info-row-value', ' ' + element.value),
        ],
        spacing: {
          before: convert.pointsToTwips(infoStyle.marginTop),
          after: convert.pointsToTwips(infoStyle.marginBottom),
        },
      })
    }

    case 'spacer': {
      const spacerSize = resolveSpacerSize(element.size || 'small')
      return new Paragraph({
        children: [],
        spacing: { after: convert.pointsToTwips(spacerSize) },
      })
    }

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

  // Render title at the top using event-title styling
  const titleStyle = resolveElementStyle('event-title')
  if (titleStyle) {
    paragraphs.push(
      applyResolvedStyleToParagraph(titleStyle, [
        new TextRun({
          text: document.title,
          bold: titleStyle.bold,
          italics: titleStyle.italic,
          color: titleStyle.color.replace('#', ''),
          size: convert.pointsToHalfPoints(titleStyle.fontSize),
          font: LITURGY_FONT,
        }),
      ])
    )
  }

  // Render subtitle (if present) using event-datetime styling
  if (document.subtitle) {
    const subtitleStyle = resolveElementStyle('event-datetime')
    if (subtitleStyle) {
      paragraphs.push(
        applyResolvedStyleToParagraph(subtitleStyle, [
          new TextRun({
            text: document.subtitle,
            bold: subtitleStyle.bold,
            italics: subtitleStyle.italic,
            color: subtitleStyle.color.replace('#', ''),
            size: convert.pointsToHalfPoints(subtitleStyle.fontSize),
            font: LITURGY_FONT,
          }),
        ])
      )
    }
  }

  // Spacer after title/subtitle
  const spacerSize = resolveSpacerSize('large')
  paragraphs.push(
    new Paragraph({
      text: '',
      spacing: {
        after: convert.pointsToTwips(spacerSize),
      },
    })
  )

  // Render all sections
  document.sections.forEach((section) => {
    paragraphs.push(...renderSection(section))
  })

  return paragraphs
}
