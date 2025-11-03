/**
 * PDF Renderer
 *
 * Converts LiturgyDocument to pdfmake content format
 */

import { Content } from 'pdfmake/interfaces'
import {
  LiturgyDocument,
  ContentSection,
  ContentElement,
} from '@/lib/types/liturgy-content'
import { pdfStyles } from '@/lib/styles/liturgy-styles'

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
        fontSize: pdfStyles.sizes.eventTitle,
        bold: true,
        alignment: element.alignment || pdfStyles.alignment.left,
        margin: [0, 0, 0, pdfStyles.spacing.medium],
      }

    case 'event-datetime':
      return {
        text: element.text,
        fontSize: pdfStyles.sizes.eventDateTime,
        alignment: element.alignment || pdfStyles.alignment.left,
        margin: [0, pdfStyles.spacing.small, 0, pdfStyles.spacing.large],
      }

    case 'section-title':
      return {
        text: element.text,
        fontSize: pdfStyles.sizes.sectionTitle,
        bold: true,
        alignment: element.alignment || pdfStyles.alignment.left,
        margin: [0, pdfStyles.spacing.large, 0, pdfStyles.spacing.medium],
      }

    case 'reading-title':
      return {
        text: element.text,
        fontSize: pdfStyles.sizes.readingTitle,
        bold: true,
        color: pdfStyles.color,
        alignment: element.alignment || pdfStyles.alignment.left,
        margin: [0, pdfStyles.spacing.beforeReading, 0, pdfStyles.spacing.small],
      }

    case 'pericope':
      return {
        text: element.text,
        fontSize: pdfStyles.sizes.pericope,
        italics: true,
        color: pdfStyles.color,
        alignment: element.alignment || pdfStyles.alignment.left,
        margin: [0, pdfStyles.spacing.small, 0, pdfStyles.spacing.tiny],
      }

    case 'reader-name':
      return {
        text: element.text,
        fontSize: pdfStyles.sizes.readerName,
        color: pdfStyles.color,
        alignment: element.alignment || pdfStyles.alignment.left,
        margin: [0, 0, 0, pdfStyles.spacing.medium],
      }

    case 'introduction':
      return {
        text: element.text,
        fontSize: pdfStyles.sizes.introduction,
        italics: true,
        margin: [0, pdfStyles.spacing.small, 0, pdfStyles.spacing.small],
      }

    case 'reading-text':
      return {
        text: element.text,
        fontSize: pdfStyles.sizes.text,
        lineHeight: pdfStyles.lineHeight.normal,
        margin: [0, pdfStyles.spacing.small, 0, pdfStyles.spacing.small],
        preserveLeadingSpaces: element.preserveLineBreaks,
      }

    case 'conclusion':
      return {
        text: element.text,
        fontSize: pdfStyles.sizes.conclusion,
        italics: true,
        margin: [0, pdfStyles.spacing.small, 0, pdfStyles.spacing.small],
      }

    case 'response':
      return {
        text: element.parts.map((part) => ({
          text: part.text,
          bold: part.formatting?.includes('bold'),
          italics: part.formatting?.includes('italic'),
        })),
        fontSize: pdfStyles.sizes.response,
        margin: [0, pdfStyles.spacing.beforeResponse, 0, pdfStyles.spacing.afterResponse],
      }

    case 'priest-dialogue':
      return {
        text: element.text,
        fontSize: pdfStyles.sizes.priestDialogue,
        margin: [0, pdfStyles.spacing.small, 0, pdfStyles.spacing.small],
      }

    case 'petition':
      return {
        text: element.parts.map((part) => ({
          text: part.text,
          bold: part.formatting?.includes('bold'),
          italics: part.formatting?.includes('italic'),
          color: part.color === 'liturgy-red' ? pdfStyles.color : undefined,
        })),
        fontSize: pdfStyles.sizes.petition,
        lineHeight: pdfStyles.lineHeight.normal,
        margin: [0, pdfStyles.spacing.small, 0, pdfStyles.spacing.small],
      }

    case 'info-row':
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
        margin: [0, 2, 0, 2],
      }

    case 'spacer':
      const spacerSize = element.size === 'large' ? 20 : element.size === 'medium' ? 10 : 5
      return {
        text: '',
        margin: [0, 0, 0, spacerSize],
      }

    case 'text':
      return {
        text: element.text,
        fontSize: element.formatting?.includes('bold') ? pdfStyles.sizes.text : pdfStyles.sizes.text,
        bold: element.formatting?.includes('bold'),
        italics: element.formatting?.includes('italic'),
        alignment: element.alignment || pdfStyles.alignment.left,
        margin: [0, pdfStyles.spacing.small, 0, pdfStyles.spacing.small],
      }

    case 'multi-part-text':
      return {
        text: element.parts.map((part) => ({
          text: part.text,
          bold: part.formatting?.includes('bold'),
          italics: part.formatting?.includes('italic'),
          color: part.color === 'liturgy-red' ? pdfStyles.color : undefined,
        })),
        alignment: element.alignment || pdfStyles.alignment.left,
        margin: [0, pdfStyles.spacing.small, 0, pdfStyles.spacing.small],
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
