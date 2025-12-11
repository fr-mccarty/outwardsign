/**
 * PDF Export API Route for User-Defined Event Scripts
 *
 * Generates a PDF document from a script with sections, replacing
 * {{Field Name}} placeholders with actual event data.
 *
 * Route: /api/events/[event_type_id]/[event_id]/scripts/[script_id]/export/pdf
 * Note: event_type_id can be either a UUID or a slug
 */

import { NextRequest, NextResponse } from 'next/server'
import PdfPrinter from 'pdfmake'
import { TDocumentDefinitions, Content } from 'pdfmake/interfaces'
import { replacePlaceholders } from '@/lib/utils/markdown-renderer'
import type { RenderMarkdownOptions } from '@/lib/utils/markdown-renderer'
import { getEventWithRelations } from '@/lib/actions/dynamic-events'
import { getScriptWithSections } from '@/lib/actions/scripts'
import { getEventTypeBySlug } from '@/lib/actions/event-types'
import { getInputFieldDefinitions } from '@/lib/actions/input-field-definitions'
import { marked } from 'marked'

// Define fonts for pdfmake
const fonts = {
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
}

const printer = new PdfPrinter(fonts)

// Liturgical red color
const RED_COLOR = '#c41e3a'

/**
 * Converts markdown to pdfmake content array
 * Handles {red}text{/red} syntax and standard markdown
 */
async function markdownToPdfContent(
  markdown: string,
  options: RenderMarkdownOptions
): Promise<Content[]> {
  // Step 1: Replace {{Field Name}} placeholders
  const content = replacePlaceholders(markdown, options)

  // Step 2: Parse markdown to HTML first
  const html = await marked.parse(content)

  // Step 3: Convert HTML to pdfmake content
  // For now, we'll use a simple conversion
  // A more sophisticated implementation would parse the HTML AST

  const lines = html.split('\n').filter(line => line.trim())
  const pdfContent: Content[] = []

  for (const line of lines) {
    // Handle headings - all centered to match HTML view
    if (line.startsWith('<h1>')) {
      const text = line.replace(/<\/?h1>/g, '')
      pdfContent.push({
        text: parseInlineFormatting(text),
        fontSize: 18,
        bold: true,
        alignment: 'center' as const,
        margin: [0, 12, 0, 6] as [number, number, number, number]
      })
    } else if (line.startsWith('<h2>')) {
      const text = line.replace(/<\/?h2>/g, '')
      pdfContent.push({
        text: parseInlineFormatting(text),
        fontSize: 16,
        bold: true,
        alignment: 'center' as const,
        margin: [0, 10, 0, 5] as [number, number, number, number]
      })
    } else if (line.startsWith('<h3>')) {
      const text = line.replace(/<\/?h3>/g, '')
      pdfContent.push({
        text: parseInlineFormatting(text),
        fontSize: 14,
        bold: true,
        alignment: 'center' as const,
        margin: [0, 8, 0, 4] as [number, number, number, number]
      })
    } else if (line.startsWith('<p>')) {
      const text = line.replace(/<\/?p>/g, '')
      pdfContent.push({
        text: parseInlineFormatting(text),
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
        text: ['• ', parseInlineFormatting(text)],
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
          text: parseInlineFormatting(strippedText),
          fontSize: 11,
          margin: [0, 0, 0, 3] as [number, number, number, number]
        })
      }
    } else if (line.trim()) {
      // Plain text line
      pdfContent.push({
        text: parseInlineFormatting(line),
        fontSize: 11,
        margin: [0, 0, 0, 3] as [number, number, number, number]
      })
    }
  }

  return pdfContent
}

/**
 * Parses inline HTML/formatting and converts to pdfmake text runs
 * Handles: <strong>, <b>, <em>, <i>, {red}...{/red}
 * Also strips: <a> tags (converting to plain text)
 */
function parseInlineFormatting(text: string): any {
  // First, strip <a> tags but keep their text content
  const cleanedText = text.replace(/<a[^>]*>(.*?)<\/a>/g, '$1')

  // If no formatting, return plain text
  if (!/<\/?(?:strong|b|em|i)>/.test(cleanedText) && !/{red}/.test(cleanedText)) {
    return cleanedText
  }

  const segments: Array<{ text: string; bold?: boolean; italics?: boolean; color?: string }> = []

  // Regex to match formatting tags
  const tagPattern = /<(strong|b|em|i)>(.*?)<\/\1>|\{red\}(.*?)\{\/red\}/g
  let lastIndex = 0
  let match

  // Reset regex
  tagPattern.lastIndex = 0

  while ((match = tagPattern.exec(cleanedText)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      const beforeText = cleanedText.slice(lastIndex, match.index)
      if (beforeText) {
        segments.push({ text: beforeText })
      }
    }

    if (match[1]) {
      // HTML tag match: match[1] is tag name, match[2] is content
      const tagName = match[1].toLowerCase()
      const content = match[2]

      if (tagName === 'strong' || tagName === 'b') {
        segments.push({ text: content, bold: true })
      } else if (tagName === 'em' || tagName === 'i') {
        segments.push({ text: content, italics: true })
      }
    } else if (match[3] !== undefined) {
      // Red tag match: match[3] is content
      segments.push({ text: match[3], color: RED_COLOR })
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text after last match
  if (lastIndex < cleanedText.length) {
    const afterText = cleanedText.slice(lastIndex)
    if (afterText) {
      segments.push({ text: afterText })
    }
  }

  // If only one segment with no special formatting, return as string
  if (segments.length === 1 && !segments[0].bold && !segments[0].italics && !segments[0].color) {
    return segments[0].text
  }

  // Return array of text runs for pdfmake
  return segments.length > 0 ? segments : cleanedText
}

/**
 * GET handler for PDF export
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ event_type_id: string; event_id: string; script_id: string }> }
) {
  try {
    const params = await context.params
    const { event_type_id, event_id, script_id } = params

    // Fetch event type by slug (server action handles auth)
    const eventType = await getEventTypeBySlug(event_type_id)
    if (!eventType) {
      return NextResponse.json(
        { error: 'Event type not found' },
        { status: 404 }
      )
    }

    // Fetch event with relations (server action handles auth)
    const event = await getEventWithRelations(event_id)
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Verify event belongs to correct event type
    if (event.event_type_id !== eventType.id) {
      return NextResponse.json(
        { error: 'Event type mismatch' },
        { status: 400 }
      )
    }

    // Fetch script with sections (server action handles auth)
    const script = await getScriptWithSections(script_id)
    if (!script) {
      return NextResponse.json(
        { error: 'Script not found' },
        { status: 404 }
      )
    }

    // Verify script belongs to event's event type
    if (script.event_type_id !== eventType.id) {
      return NextResponse.json(
        { error: 'Script does not belong to this event type' },
        { status: 400 }
      )
    }

    // Fetch input field definitions (server action handles auth)
    const inputFieldDefinitions = await getInputFieldDefinitions(eventType.id)

    // Build resolved entities from event.resolved_fields
    const resolvedEntities = {
      people: {} as Record<string, any>,
      locations: {} as Record<string, any>,
      groups: {} as Record<string, any>,
      listItems: {} as Record<string, any>,
      documents: {} as Record<string, any>
    }

    // Populate resolvedEntities from event.resolved_fields
    if (event.resolved_fields) {
      for (const [, fieldData] of Object.entries(event.resolved_fields)) {
        const typedFieldData = fieldData as { field_type: string; resolved_value: any; raw_value: any }
        if (typedFieldData.field_type === 'person' && typedFieldData.resolved_value) {
          resolvedEntities.people[typedFieldData.raw_value] = typedFieldData.resolved_value
        } else if (typedFieldData.field_type === 'location' && typedFieldData.resolved_value) {
          resolvedEntities.locations[typedFieldData.raw_value] = typedFieldData.resolved_value
        } else if (typedFieldData.field_type === 'group' && typedFieldData.resolved_value) {
          resolvedEntities.groups[typedFieldData.raw_value] = typedFieldData.resolved_value
        }
      }
    }

    // Build PDF content from sections
    const pdfContent: Content[] = []

    // Sort sections by order
    const sortedSections = (script.sections || []).sort((a: any, b: any) => a.order - b.order)

    for (const section of sortedSections) {
      // Add section title - centered to match HTML view
      if (section.name) {
        pdfContent.push({
          text: section.name,
          fontSize: 14,
          bold: true,
          alignment: 'center' as const,
          margin: [0, 12, 0, 6] as [number, number, number, number]
        })
      }

      // Convert section content (markdown) to PDF content
      const sectionContent = await markdownToPdfContent(section.content, {
        fieldValues: event.field_values || {},
        inputFieldDefinitions: inputFieldDefinitions || [],
        resolvedEntities,
        parish: event.parish,
        format: 'pdf'
      })

      pdfContent.push(...sectionContent)

      // Add page break if requested
      if (section.page_break_after) {
        pdfContent.push({
          text: '',
          pageBreak: 'after' as const
        })
      }
    }

    // Generate PDF
    const docDefinition: TDocumentDefinitions = {
      content: pdfContent,
      pageMargins: [72, 72, 72, 72], // 1 inch margins
      defaultStyle: {
        font: 'Roboto',
        fontSize: 11,
        lineHeight: 1.4
      }
    }

    const pdfDoc = printer.createPdfKitDocument(docDefinition)

    // Collect PDF buffer
    const chunks: Buffer[] = []
    pdfDoc.on('data', (chunk) => chunks.push(chunk))

    await new Promise<void>((resolve, reject) => {
      pdfDoc.on('end', () => resolve())
      pdfDoc.on('error', reject)
      pdfDoc.end()
    })

    const pdfBuffer = Buffer.concat(chunks)

    // Generate filename
    const filename = `${event.event_type.name}-${script.name}-${event_id.substring(0, 8)}.pdf`

    // Return PDF
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
