/**
 * Word Document Renderer
 *
 * Converts LiturgyDocument to docx Paragraph format
 */

import { Paragraph, TextRun, PageBreak, AlignmentType } from 'docx'
import {
  LiturgyDocument,
  ContentSection,
  ContentElement,
  TextAlignment,
} from '@/lib/types/liturgy-content'
import { wordStyles } from '@/lib/styles/liturgy-styles'

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert alignment string to docx AlignmentType
 */
function getAlignment(alignment?: TextAlignment) {
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

// ============================================================================
// ELEMENT RENDERERS
// ============================================================================

/**
 * Render a single content element to docx Paragraph
 */
function renderElement(element: ContentElement): Paragraph | Paragraph[] {
  switch (element.type) {
    case 'event-title':
      return new Paragraph({
        children: [
          new TextRun({
            font: wordStyles.fonts.primary,
            text: element.text,
            size: wordStyles.sizes.eventTitle,
            bold: true,
          }),
        ],
        alignment: getAlignment(element.alignment),
        spacing: { after: wordStyles.spacing.medium },
      })

    case 'event-datetime':
      return new Paragraph({
        children: [
          new TextRun({
            font: wordStyles.fonts.primary,
            text: element.text,
            size: wordStyles.sizes.eventDateTime,
          }),
        ],
        alignment: getAlignment(element.alignment),
        spacing: { before: wordStyles.spacing.small, after: wordStyles.spacing.large },
      })

    case 'section-title':
      return new Paragraph({
        children: [
          new TextRun({
            font: wordStyles.fonts.primary,
            text: element.text,
            size: wordStyles.sizes.sectionTitle,
            bold: true,
          }),
        ],
        alignment: getAlignment(element.alignment),
        spacing: { before: wordStyles.spacing.beforeSection, after: wordStyles.spacing.afterSection },
      })

    case 'reading-title':
      return new Paragraph({
        children: [
          new TextRun({
            font: wordStyles.fonts.primary,
            text: element.text,
            size: wordStyles.sizes.readingTitle,
            bold: true,
            color: wordStyles.color,
          }),
        ],
        alignment: getAlignment(element.alignment),
        spacing: { before: wordStyles.spacing.beforeReading, after: wordStyles.spacing.small },
      })

    case 'pericope':
      return new Paragraph({
        children: [
          new TextRun({
            font: wordStyles.fonts.primary,
            text: element.text,
            size: wordStyles.sizes.pericope,
            bold: true,
            italics: true,
            color: wordStyles.color,
          }),
        ],
        alignment: getAlignment(element.alignment),
        spacing: { before: wordStyles.spacing.small, after: wordStyles.spacing.tiny },
      })

    case 'reader-name':
      return new Paragraph({
        children: [
          new TextRun({
            font: wordStyles.fonts.primary,
            text: element.text,
            size: wordStyles.sizes.readerName,
            bold: true,
            color: wordStyles.color,
          }),
        ],
        alignment: getAlignment(element.alignment),
        spacing: { after: wordStyles.spacing.afterResponse },
      })

    case 'introduction':
      return new Paragraph({
        children: [
          new TextRun({
            font: wordStyles.fonts.primary,
            text: element.text,
            bold: true,
          }),
        ],
        spacing: {
          before: wordStyles.spacing.beforeParagraph,
          after: wordStyles.spacing.afterParagraph,
          line: wordStyles.lineHeight.normal,
        },
      })

    case 'reading-text':
      return new Paragraph({
        children: [
          new TextRun({
            font: wordStyles.fonts.primary,
            text: element.text,
          }),
        ],
        spacing: {
          before: wordStyles.spacing.beforeParagraph,
          after: wordStyles.spacing.afterParagraph,
          line: wordStyles.lineHeight.normal,
        },
      })

    case 'conclusion':
      return new Paragraph({
        children: [
          new TextRun({
            font: wordStyles.fonts.primary,
            text: element.text,
            bold: true,
          }),
        ],
        spacing: {
          before: wordStyles.spacing.beforeParagraph,
          after: wordStyles.spacing.afterParagraph,
          line: wordStyles.lineHeight.normal,
        },
      })

    case 'response':
      return new Paragraph({
        children: element.parts.map(
          (part) =>
            new TextRun({
              font: wordStyles.fonts.primary,
              text: part.text,
              bold: part.formatting?.includes('bold'),
              italics: part.formatting?.includes('italic'),
            })
        ),
        spacing: {
          before: wordStyles.spacing.beforeResponse,
          after: wordStyles.spacing.afterResponse,
          line: wordStyles.lineHeight.normal,
        },
      })

    case 'priest-dialogue':
      return new Paragraph({
        children: [
          new TextRun({
            font: wordStyles.fonts.primary,
            text: element.text,
          }),
        ],
        spacing: {
          before: wordStyles.spacing.beforeParagraph,
          after: wordStyles.spacing.afterParagraph,
          line: wordStyles.lineHeight.normal,
        },
      })

    case 'petition':
      return new Paragraph({
        children: element.parts.map(
          (part) =>
            new TextRun({
              font: wordStyles.fonts.primary,
              text: part.text,
              bold: part.formatting?.includes('bold'),
              italics: part.formatting?.includes('italic'),
              color: part.color === 'liturgy-red' ? wordStyles.color : undefined,
            })
        ),
        spacing: {
          before: wordStyles.spacing.beforeParagraph,
          after: wordStyles.spacing.afterParagraph,
          line: wordStyles.lineHeight.normal,
        },
      })

    case 'info-row':
      return new Paragraph({
        children: [
          new TextRun({
            font: wordStyles.fonts.primary,
            text: `${element.label} `,
            bold: true,
          }),
          new TextRun({
            font: wordStyles.fonts.primary,
            text: element.value,
          }),
        ],
        spacing: {
          before: wordStyles.spacing.beforeParagraph,
          after: wordStyles.spacing.afterParagraph,
          line: wordStyles.lineHeight.normal,
        },
      })

    case 'spacer':
      const spacerSize =
        element.size === 'large'
          ? wordStyles.spacing.large
          : element.size === 'medium'
          ? wordStyles.spacing.medium
          : wordStyles.spacing.small
      return new Paragraph({
        text: '',
        spacing: { after: spacerSize },
      })

    case 'text':
      return new Paragraph({
        children: [
          new TextRun({
            font: wordStyles.fonts.primary,
            text: element.text,
            bold: element.formatting?.includes('bold'),
            italics: element.formatting?.includes('italic'),
          }),
        ],
        alignment: getAlignment(element.alignment),
        spacing: {
          before: wordStyles.spacing.beforeParagraph,
          after: wordStyles.spacing.afterParagraph,
        },
      })

    case 'multi-part-text':
      return new Paragraph({
        children: element.parts.map(
          (part) =>
            new TextRun({
              font: wordStyles.fonts.primary,
              text: part.text,
              bold: part.formatting?.includes('bold'),
              italics: part.formatting?.includes('italic'),
              color: part.color === 'liturgy-red' ? wordStyles.color : undefined,
            })
        ),
        alignment: getAlignment(element.alignment),
        spacing: {
          before: wordStyles.spacing.beforeParagraph,
          after: wordStyles.spacing.afterParagraph,
        },
      })

    default:
      return new Paragraph({ text: '' })
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
 * Render LiturgyDocument to docx Paragraph array
 */
export function renderWord(document: LiturgyDocument): Paragraph[] {
  const paragraphs: Paragraph[] = []

  // Render all sections
  document.sections.forEach((section) => {
    paragraphs.push(...renderSection(section))
  })

  return paragraphs
}
