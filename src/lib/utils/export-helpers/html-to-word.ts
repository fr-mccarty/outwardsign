/**
 * HTML to Word Paragraphs Converter
 *
 * Converts HTML content to Word (docx) paragraphs.
 * Shared between events, mass-liturgies, and special-liturgies export routes.
 */

import { Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'
import { replacePlaceholders, type RenderMarkdownOptions } from '@/lib/utils/content-renderer'
import { createStyledTextRuns, FONT_FAMILY, POINT_TO_HALF_POINT } from './docx-text-runs'

// Unit conversion helpers
const POINT_TO_TWIP = 20 // Word uses twips (1/20 point) for spacing

/**
 * Converts HTML content to Word paragraphs
 * Handles inline styles and standard HTML tags
 */
export function htmlToWordParagraphs(
  html: string,
  options: RenderMarkdownOptions
): Paragraph[] {
  // Step 1: Replace {{Field Name}} placeholders
  const content = replacePlaceholders(html, options)

  // Step 2: Convert HTML to Word paragraphs
  const lines = content.split('\n').filter(line => line.trim())
  const paragraphs: Paragraph[] = []

  for (const line of lines) {
    // Handle headings - all centered to match HTML view
    if (line.startsWith('<h1>')) {
      const text = line.replace(/<\/?h1>/g, '')
      paragraphs.push(
        new Paragraph({
          children: createStyledTextRuns(text, 18),
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: {
            before: 12 * POINT_TO_TWIP,
            after: 6 * POINT_TO_TWIP
          }
        })
      )
    } else if (line.startsWith('<h2>')) {
      const text = line.replace(/<\/?h2>/g, '')
      paragraphs.push(
        new Paragraph({
          children: createStyledTextRuns(text, 16),
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.CENTER,
          spacing: {
            before: 10 * POINT_TO_TWIP,
            after: 5 * POINT_TO_TWIP
          }
        })
      )
    } else if (line.startsWith('<h3>')) {
      const text = line.replace(/<\/?h3>/g, '')
      paragraphs.push(
        new Paragraph({
          children: createStyledTextRuns(text, 14),
          heading: HeadingLevel.HEADING_3,
          alignment: AlignmentType.CENTER,
          spacing: {
            before: 8 * POINT_TO_TWIP,
            after: 4 * POINT_TO_TWIP
          }
        })
      )
    } else if (line.startsWith('<p>')) {
      const text = line.replace(/<\/?p>/g, '')
      paragraphs.push(
        new Paragraph({
          children: createStyledTextRuns(text, 11),
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            after: 6 * POINT_TO_TWIP
          }
        })
      )
    } else if (line.startsWith('<ul>') || line.startsWith('<ol>') || line.startsWith('</ul>') || line.startsWith('</ol>')) {
      // Skip list container tags
      continue
    } else if (line.startsWith('<li>')) {
      const text = line.replace(/<\/?li>/g, '')
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '• ',
              font: FONT_FAMILY,
              size: 11 * POINT_TO_HALF_POINT
            }),
            ...createStyledTextRuns(text, 11)
          ],
          spacing: {
            after: 3 * POINT_TO_TWIP
          },
          indent: {
            left: 20 * POINT_TO_TWIP
          }
        })
      )
    } else if (line.startsWith('</')) {
      // Skip any other closing tags
      continue
    } else if (line.startsWith('<')) {
      // Handle any other HTML tag by stripping it and keeping content
      const strippedText = line.replace(/<[^>]*>/g, '').trim()
      if (strippedText) {
        paragraphs.push(
          new Paragraph({
            children: createStyledTextRuns(strippedText, 11),
            spacing: {
              after: 3 * POINT_TO_TWIP
            }
          })
        )
      }
    } else if (line.trim()) {
      // Plain text line
      paragraphs.push(
        new Paragraph({
          children: createStyledTextRuns(line, 11),
          spacing: {
            after: 3 * POINT_TO_TWIP
          }
        })
      )
    }
  }

  return paragraphs
}

// Re-export POINT_TO_TWIP for routes that need it for section titles
export { POINT_TO_TWIP }
