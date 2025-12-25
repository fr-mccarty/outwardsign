/**
 * HTML to PDF Content Converter
 *
 * Converts HTML content to pdfmake content array.
 * Shared between events, mass-liturgies, and special-liturgies export routes.
 */

import { Content } from 'pdfmake/interfaces'
import { replacePlaceholders, type RenderMarkdownOptions } from '@/lib/utils/content-renderer'
import { parseInlineFormatting } from './pdf-inline-formatting'

// Liturgical red color
const RED_COLOR = '#c41e3a'

// Default font size in points
const DEFAULT_FONT_SIZE = 11

/**
 * Parsed paragraph styles from HTML
 */
interface ParagraphStyles {
  alignment?: 'left' | 'right' | 'center' | 'justify'
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
    result.alignment = alignMatch[1] as 'left' | 'right' | 'center' | 'justify'
  }

  // Check for color
  const colorMatch = style.match(/color:\s*([^;]+)/)
  if (colorMatch) {
    const color = colorMatch[1].trim()
    result.color = color === 'red' ? RED_COLOR : color
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
 * Converts HTML content to pdfmake content array
 * Handles inline styles and standard HTML tags
 */
export function htmlToPdfContent(
  html: string,
  options: RenderMarkdownOptions
): Content[] {
  // Step 1: Replace {{Field Name}} placeholders (first pass)
  let content = replacePlaceholders(html, options)

  // Step 2: Replace any placeholders that were inside content bodies (second pass)
  // This allows content to include placeholders like {{first_reader.full_name}}
  content = replacePlaceholders(content, options)

  // Step 3: Convert HTML to pdfmake content
  const lines = content.split('\n').filter(line => line.trim())
  const pdfContent: Content[] = []

  for (const line of lines) {
    // Handle headings - all centered to match HTML view
    if (line.match(/^<h1[\s>]/i)) {
      const text = extractInnerContent(line, 'h1')
      const styles = parseParagraphStyle(line)
      pdfContent.push({
        text: parseInlineFormatting(text) as any,
        fontSize: styles.fontSize || 18,
        bold: true,
        italics: styles.italic,
        alignment: styles.alignment || ('center' as const),
        color: styles.color,
        lineHeight: styles.lineHeight,
        margin: [0, styles.marginTop ?? 12, 0, styles.marginBottom ?? 6] as [number, number, number, number]
      })
    } else if (line.match(/^<h2[\s>]/i)) {
      const text = extractInnerContent(line, 'h2')
      const styles = parseParagraphStyle(line)
      pdfContent.push({
        text: parseInlineFormatting(text) as any,
        fontSize: styles.fontSize || 16,
        bold: true,
        italics: styles.italic,
        alignment: styles.alignment || ('center' as const),
        color: styles.color,
        lineHeight: styles.lineHeight,
        margin: [0, styles.marginTop ?? 10, 0, styles.marginBottom ?? 5] as [number, number, number, number]
      })
    } else if (line.match(/^<h3[\s>]/i)) {
      const text = extractInnerContent(line, 'h3')
      const styles = parseParagraphStyle(line)
      pdfContent.push({
        text: parseInlineFormatting(text) as any,
        fontSize: styles.fontSize || 14,
        bold: true,
        italics: styles.italic,
        alignment: styles.alignment || ('center' as const),
        color: styles.color,
        lineHeight: styles.lineHeight,
        margin: [0, styles.marginTop ?? 8, 0, styles.marginBottom ?? 4] as [number, number, number, number]
      })
    } else if (line.match(/^<p[\s>]/i)) {
      const text = extractInnerContent(line, 'p')
      const styles = parseParagraphStyle(line)
      pdfContent.push({
        text: parseInlineFormatting(text) as any,
        fontSize: styles.fontSize || 11,
        italics: styles.italic,
        alignment: styles.alignment || ('justify' as const),
        color: styles.color,
        lineHeight: styles.lineHeight,
        margin: [0, styles.marginTop ?? 0, 0, styles.marginBottom ?? 6] as [number, number, number, number]
      })
    } else if (line.startsWith('<ul>') || line.startsWith('<ol>') || line.startsWith('</ul>') || line.startsWith('</ol>')) {
      // Skip list container tags
      continue
    } else if (line.match(/^<li[\s>]/i)) {
      const text = extractInnerContent(line, 'li')
      pdfContent.push({
        text: ['• ', parseInlineFormatting(text)] as any,
        fontSize: 11,
        margin: [20, 0, 0, 3] as [number, number, number, number]
      })
    } else if (line.startsWith('</')) {
      // Skip any other closing tags
      continue
    } else if (line.startsWith('<')) {
      // Handle any other HTML tag by stripping it and keeping content
      const strippedText = line.replace(/<[^>]*>/g, '').trim()
      if (strippedText) {
        pdfContent.push({
          text: parseInlineFormatting(strippedText) as any,
          fontSize: 11,
          margin: [0, 0, 0, 3] as [number, number, number, number]
        })
      }
    } else if (line.trim()) {
      // Plain text line
      pdfContent.push({
        text: parseInlineFormatting(line) as any,
        fontSize: 11,
        margin: [0, 0, 0, 3] as [number, number, number, number]
      })
    }
  }

  return pdfContent
}
