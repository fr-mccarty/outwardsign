/**
 * PDF Export API Route for Mass Scripts
 *
 * Generates a PDF document from a Mass script with sections, replacing
 * {{Field Name}} placeholders with actual Mass data.
 *
 * Route: /api/mass-liturgies/[mass_id]/scripts/[script_id]/export/pdf
 */

import { NextRequest, NextResponse } from 'next/server'
import PdfPrinter from 'pdfmake'
import { TDocumentDefinitions, Content } from 'pdfmake/interfaces'
import { replacePlaceholders, type RenderMarkdownOptions } from '@/lib/utils/content-renderer'
import { getMassWithRelations } from '@/lib/actions/mass-liturgies'
import { getScriptWithSections } from '@/lib/actions/scripts'
import { getInputFieldDefinitions } from '@/lib/actions/input-field-definitions'

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
 * Converts HTML content to pdfmake content array
 * Handles {red}text{/red} syntax and standard HTML tags
 */
function htmlToPdfContent(
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
  context: { params: Promise<{ id: string; script_id: string }> }
) {
  try {
    const params = await context.params
    const { id: massId, script_id: scriptId } = params

    // Fetch mass with relations (server action handles auth)
    const mass = await getMassWithRelations(massId)
    if (!mass) {
      return NextResponse.json(
        { error: 'Mass not found' },
        { status: 404 }
      )
    }

    // Verify Mass has an event type
    if (!mass.event_type_id) {
      return NextResponse.json(
        { error: 'Mass does not have an event type' },
        { status: 400 }
      )
    }

    // Fetch script with sections (server action handles auth)
    const script = await getScriptWithSections(scriptId)
    if (!script) {
      return NextResponse.json(
        { error: 'Script not found' },
        { status: 404 }
      )
    }

    // Verify script belongs to mass's event type
    if (script.event_type_id !== mass.event_type_id) {
      return NextResponse.json(
        { error: 'Script does not belong to this Mass event type' },
        { status: 400 }
      )
    }

    // Fetch input field definitions (server action handles auth)
    const inputFieldDefinitions = await getInputFieldDefinitions(mass.event_type_id)

    // Build resolved entities from mass.resolved_fields
    const resolvedEntities = {
      people: {} as Record<string, any>,
      locations: {} as Record<string, any>,
      groups: {} as Record<string, any>,
      listItems: {} as Record<string, any>,
      documents: {} as Record<string, any>,
      contents: {} as Record<string, any>
    }

    // Populate resolvedEntities from mass.resolved_fields
    if (mass.resolved_fields) {
      for (const [, fieldData] of Object.entries(mass.resolved_fields)) {
        const typedFieldData = fieldData as { field_type: string; resolved_value: any; raw_value: any }
        if (typedFieldData.field_type === 'person' && typedFieldData.resolved_value) {
          resolvedEntities.people[typedFieldData.raw_value] = typedFieldData.resolved_value
        } else if (typedFieldData.field_type === 'location' && typedFieldData.resolved_value) {
          resolvedEntities.locations[typedFieldData.raw_value] = typedFieldData.resolved_value
        } else if (typedFieldData.field_type === 'group' && typedFieldData.resolved_value) {
          resolvedEntities.groups[typedFieldData.raw_value] = typedFieldData.resolved_value
        } else if (typedFieldData.field_type === 'content' && typedFieldData.resolved_value) {
          resolvedEntities.contents[typedFieldData.raw_value] = typedFieldData.resolved_value
        } else if (typedFieldData.field_type === 'list_item' && typedFieldData.resolved_value) {
          resolvedEntities.listItems[typedFieldData.raw_value] = typedFieldData.resolved_value
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

      // Convert section content (HTML) to PDF content
      const sectionContent = htmlToPdfContent(section.content, {
        fieldValues: mass.field_values || {},
        inputFieldDefinitions: inputFieldDefinitions || [],
        resolvedEntities,
        parish: mass.calendar_events?.[0]?.location ? {
          name: 'Parish', // TODO: Get actual parish name if needed
          city: mass.calendar_events[0].location.city || '',
          state: mass.calendar_events[0].location.state || ''
        } : undefined,
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

    // Get filename from query params or generate default
    const url = new URL(request.url)
    const filename = url.searchParams.get('filename') || `Mass-${script.name}-${massId.substring(0, 8)}.pdf`

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
