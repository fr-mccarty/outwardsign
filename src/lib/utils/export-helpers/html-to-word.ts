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

// Liturgical red color (without # prefix for Word)
const RED_COLOR = 'c41e3a'

// Default font size in points
const DEFAULT_FONT_SIZE = 11

/**
 * Parsed paragraph styles from HTML
 */
interface ParagraphStyles {
  alignment?: (typeof AlignmentType)[keyof typeof AlignmentType]
  color?: string
  fontSize?: number
  marginTop?: number
  marginBottom?: number
  lineHeight?: number
  italic?: boolean
}

/**
 * Parses paragraph-level styles from an HTML tag
 * Returns alignment, color, font-size, margins, line-height, and italic if present
 */
function parseParagraphStyle(tagContent: string): ParagraphStyles {
  const result: ParagraphStyles = {}

  const styleMatch = tagContent.match(/style=["']([^"']+)["']/)
  if (!styleMatch) return result

  const style = styleMatch[1]

  // Check for text-align
  const alignMatch = style.match(/text-align:\s*(left|right|center|justify)/)
  if (alignMatch) {
    switch (alignMatch[1]) {
      case 'left':
        result.alignment = AlignmentType.LEFT
        break
      case 'right':
        result.alignment = AlignmentType.RIGHT
        break
      case 'center':
        result.alignment = AlignmentType.CENTER
        break
      case 'justify':
        result.alignment = AlignmentType.JUSTIFIED
        break
    }
  }

  // Check for color
  const colorMatch = style.match(/color:\s*([^;]+)/)
  if (colorMatch) {
    const color = colorMatch[1].trim()
    if (color === 'red' || color === '#c41e3a') {
      result.color = RED_COLOR
    } else if (color.startsWith('#')) {
      result.color = color.substring(1) // Remove # for Word
    }
  }

  // Check for font-size (supports pt, px, em)
  const fontSizeMatch = style.match(/font-size:\s*([^;]+)/)
  if (fontSizeMatch) {
    const fontSizeValue = fontSizeMatch[1].trim()
    if (fontSizeValue.endsWith('pt')) {
      result.fontSize = parseFloat(fontSizeValue)
    } else if (fontSizeValue.endsWith('px')) {
      // Convert px to pt (1pt ≈ 1.333px)
      result.fontSize = Math.round(parseFloat(fontSizeValue) / 1.333)
    } else if (fontSizeValue.endsWith('em')) {
      // Convert em to pt (base 11pt)
      result.fontSize = Math.round(DEFAULT_FONT_SIZE * parseFloat(fontSizeValue))
    }
  }

  // Check for margin-top (supports pt, px)
  const marginTopMatch = style.match(/margin-top:\s*([^;]+)/)
  if (marginTopMatch) {
    const marginValue = marginTopMatch[1].trim()
    if (marginValue.endsWith('pt')) {
      result.marginTop = parseFloat(marginValue)
    } else if (marginValue.endsWith('px')) {
      result.marginTop = Math.round(parseFloat(marginValue) / 1.333)
    }
  }

  // Check for margin-bottom (supports pt, px)
  const marginBottomMatch = style.match(/margin-bottom:\s*([^;]+)/)
  if (marginBottomMatch) {
    const marginValue = marginBottomMatch[1].trim()
    if (marginValue.endsWith('pt')) {
      result.marginBottom = parseFloat(marginValue)
    } else if (marginValue.endsWith('px')) {
      result.marginBottom = Math.round(parseFloat(marginValue) / 1.333)
    }
  }

  // Check for line-height
  const lineHeightMatch = style.match(/line-height:\s*([^;]+)/)
  if (lineHeightMatch) {
    const lineHeightValue = lineHeightMatch[1].trim()
    // Line height can be unitless (1.4) or with units (1.4em, 140%)
    if (lineHeightValue.endsWith('%')) {
      result.lineHeight = parseFloat(lineHeightValue) / 100
    } else if (lineHeightValue.endsWith('em')) {
      result.lineHeight = parseFloat(lineHeightValue)
    } else {
      result.lineHeight = parseFloat(lineHeightValue)
    }
  }

  // Check for font-style: italic
  const fontStyleMatch = style.match(/font-style:\s*(italic|normal)/)
  if (fontStyleMatch && fontStyleMatch[1] === 'italic') {
    result.italic = true
  }

  return result
}

/**
 * Extracts the inner content from an HTML tag line
 * e.g., '<p style="...">content</p>' -> 'content'
 */
function extractInnerContent(line: string, tagName: string): string {
  // Match opening tag (with optional attributes) and closing tag
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*)<\\/${tagName}>`, 'i')
  const match = line.match(regex)
  return match ? match[1] : line.replace(/<[^>]*>/g, '')
}

/**
 * Options for creating styled text runs with paragraph-level defaults
 */
interface TextRunStyleOptions {
  color?: string
  italic?: boolean
}

/**
 * Creates styled text runs with optional paragraph-level styles applied
 */
function createColoredTextRuns(text: string, baseFontSize: number, options?: TextRunStyleOptions): TextRun[] {
  const runs = createStyledTextRuns(text, baseFontSize)

  // If paragraph has styles that should apply to runs, apply them
  if (options?.color || options?.italic) {
    return runs.map(run => {
      // TextRun doesn't expose its properties directly, so we need to recreate with styles
      // This is a workaround - ideally we'd modify createStyledTextRuns to accept defaults
      const runOptions = (run as any).root?.[1] || {}
      const mergedOptions = { ...runOptions }

      if (options.color && !runOptions.color) {
        mergedOptions.color = options.color
      }
      if (options.italic && !runOptions.italics) {
        mergedOptions.italics = true
      }

      return new TextRun(mergedOptions)
    })
  }

  return runs
}

/**
 * Calculate line spacing in twips for Word
 * Word line spacing is: fontSize * lineHeight * 20
 */
function calculateLineSpacing(fontSize: number, lineHeight?: number): number | undefined {
  if (!lineHeight) return undefined
  return Math.round(fontSize * lineHeight * POINT_TO_TWIP)
}

/**
 * Converts HTML content to Word paragraphs
 * Handles inline styles and standard HTML tags
 */
export function htmlToWordParagraphs(
  html: string,
  options: RenderMarkdownOptions
): Paragraph[] {
  // Step 1: Replace {{Field Name}} placeholders (first pass)
  let content = replacePlaceholders(html, options)

  // Step 2: Replace any placeholders that were inside content bodies (second pass)
  // This allows content to include placeholders like {{first_reader.full_name}}
  content = replacePlaceholders(content, options)

  // Step 3: Convert HTML to Word paragraphs
  const lines = content.split('\n').filter(line => line.trim())
  const paragraphs: Paragraph[] = []

  for (const line of lines) {
    // Handle headings - all centered to match HTML view
    if (line.match(/^<h1[\s>]/i)) {
      const text = extractInnerContent(line, 'h1')
      const styles = parseParagraphStyle(line)
      const fontSize = styles.fontSize || 18
      paragraphs.push(
        new Paragraph({
          children: createColoredTextRuns(text, fontSize, { color: styles.color, italic: styles.italic }),
          heading: HeadingLevel.HEADING_1,
          alignment: styles.alignment || AlignmentType.CENTER,
          spacing: {
            before: (styles.marginTop ?? 12) * POINT_TO_TWIP,
            after: (styles.marginBottom ?? 6) * POINT_TO_TWIP,
            line: calculateLineSpacing(fontSize, styles.lineHeight)
          }
        })
      )
    } else if (line.match(/^<h2[\s>]/i)) {
      const text = extractInnerContent(line, 'h2')
      const styles = parseParagraphStyle(line)
      const fontSize = styles.fontSize || 16
      paragraphs.push(
        new Paragraph({
          children: createColoredTextRuns(text, fontSize, { color: styles.color, italic: styles.italic }),
          heading: HeadingLevel.HEADING_2,
          alignment: styles.alignment || AlignmentType.CENTER,
          spacing: {
            before: (styles.marginTop ?? 10) * POINT_TO_TWIP,
            after: (styles.marginBottom ?? 5) * POINT_TO_TWIP,
            line: calculateLineSpacing(fontSize, styles.lineHeight)
          }
        })
      )
    } else if (line.match(/^<h3[\s>]/i)) {
      const text = extractInnerContent(line, 'h3')
      const styles = parseParagraphStyle(line)
      const fontSize = styles.fontSize || 14
      paragraphs.push(
        new Paragraph({
          children: createColoredTextRuns(text, fontSize, { color: styles.color, italic: styles.italic }),
          heading: HeadingLevel.HEADING_3,
          alignment: styles.alignment || AlignmentType.CENTER,
          spacing: {
            before: (styles.marginTop ?? 8) * POINT_TO_TWIP,
            after: (styles.marginBottom ?? 4) * POINT_TO_TWIP,
            line: calculateLineSpacing(fontSize, styles.lineHeight)
          }
        })
      )
    } else if (line.match(/^<p[\s>]/i)) {
      const text = extractInnerContent(line, 'p')
      const styles = parseParagraphStyle(line)
      const fontSize = styles.fontSize || 11
      paragraphs.push(
        new Paragraph({
          children: createColoredTextRuns(text, fontSize, { color: styles.color, italic: styles.italic }),
          alignment: styles.alignment || AlignmentType.JUSTIFIED,
          spacing: {
            before: styles.marginTop ? styles.marginTop * POINT_TO_TWIP : undefined,
            after: (styles.marginBottom ?? 6) * POINT_TO_TWIP,
            line: calculateLineSpacing(fontSize, styles.lineHeight)
          }
        })
      )
    } else if (line.startsWith('<ul>') || line.startsWith('<ol>') || line.startsWith('</ul>') || line.startsWith('</ol>')) {
      // Skip list container tags
      continue
    } else if (line.match(/^<li[\s>]/i)) {
      const text = extractInnerContent(line, 'li')
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
