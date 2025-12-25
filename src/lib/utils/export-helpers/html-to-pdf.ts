/**
 * HTML to PDF Content Converter
 *
 * Converts HTML content to pdfmake content array.
 * Shared between events, mass-liturgies, and special-liturgies export routes.
 */

import { Content } from 'pdfmake/interfaces'
import { replacePlaceholders, type RenderMarkdownOptions } from '@/lib/utils/content-renderer'
import { parseInlineFormatting } from './pdf-inline-formatting'

/**
 * Converts HTML content to pdfmake content array
 * Handles inline styles and standard HTML tags
 */
export function htmlToPdfContent(
  html: string,
  options: RenderMarkdownOptions
): Content[] {
  // Step 1: Replace {{Field Name}} placeholders
  const content = replacePlaceholders(html, options)

  // Step 2: Convert HTML to pdfmake content
  const lines = content.split('\n').filter(line => line.trim())
  const pdfContent: Content[] = []

  for (const line of lines) {
    // Handle headings - all centered to match HTML view
    if (line.startsWith('<h1>')) {
      const text = line.replace(/<\/?h1>/g, '')
      pdfContent.push({
        text: parseInlineFormatting(text) as any,
        fontSize: 18,
        bold: true,
        alignment: 'center' as const,
        margin: [0, 12, 0, 6] as [number, number, number, number]
      })
    } else if (line.startsWith('<h2>')) {
      const text = line.replace(/<\/?h2>/g, '')
      pdfContent.push({
        text: parseInlineFormatting(text) as any,
        fontSize: 16,
        bold: true,
        alignment: 'center' as const,
        margin: [0, 10, 0, 5] as [number, number, number, number]
      })
    } else if (line.startsWith('<h3>')) {
      const text = line.replace(/<\/?h3>/g, '')
      pdfContent.push({
        text: parseInlineFormatting(text) as any,
        fontSize: 14,
        bold: true,
        alignment: 'center' as const,
        margin: [0, 8, 0, 4] as [number, number, number, number]
      })
    } else if (line.startsWith('<p>')) {
      const text = line.replace(/<\/?p>/g, '')
      pdfContent.push({
        text: parseInlineFormatting(text) as any,
        fontSize: 11,
        alignment: 'justify' as const,
        margin: [0, 0, 0, 6] as [number, number, number, number]
      })
    } else if (line.startsWith('<ul>') || line.startsWith('<ol>') || line.startsWith('</ul>') || line.startsWith('</ol>')) {
      // Skip list container tags
      continue
    } else if (line.startsWith('<li>')) {
      const text = line.replace(/<\/?li>/g, '')
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
