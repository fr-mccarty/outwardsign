/**
 * PDF Export API Route for User-Defined Event Scripts
 *
 * Generates a PDF document from a script with sections, replacing
 * {{Field Name}} placeholders with actual event data.
 *
 * Route: /api/events/[event_type_id]/[event_id]/scripts/[script_id]/export/pdf
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PdfPrinter from 'pdfmake'
import { TDocumentDefinitions, Content } from 'pdfmake/interfaces'
import { replacePlaceholders, extractTextSegments } from '@/lib/utils/markdown-renderer'
import type { RenderMarkdownOptions } from '@/lib/utils/markdown-renderer'
import { resolveFieldEntities } from '@/lib/utils/resolve-field-entities'
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
    // Handle headings
    if (line.startsWith('<h1>')) {
      const text = line.replace(/<\/?h1>/g, '')
      pdfContent.push({
        text: extractAndApplyRedText(text),
        fontSize: 18,
        bold: true,
        margin: [0, 12, 0, 6] as [number, number, number, number]
      })
    } else if (line.startsWith('<h2>')) {
      const text = line.replace(/<\/?h2>/g, '')
      pdfContent.push({
        text: extractAndApplyRedText(text),
        fontSize: 16,
        bold: true,
        margin: [0, 10, 0, 5] as [number, number, number, number]
      })
    } else if (line.startsWith('<h3>')) {
      const text = line.replace(/<\/?h3>/g, '')
      pdfContent.push({
        text: extractAndApplyRedText(text),
        fontSize: 14,
        bold: true,
        margin: [0, 8, 0, 4] as [number, number, number, number]
      })
    } else if (line.startsWith('<p>')) {
      const text = line.replace(/<\/?p>/g, '')
      pdfContent.push({
        text: extractAndApplyRedText(text),
        fontSize: 11,
        margin: [0, 0, 0, 6] as [number, number, number, number]
      })
    } else if (line.startsWith('<ul>') || line.startsWith('<ol>')) {
      // Handle lists - simplified for now
      continue
    } else if (line.startsWith('<li>')) {
      const text = line.replace(/<\/?li>/g, '')
      pdfContent.push({
        text: ['• ', extractAndApplyRedText(text)],
        fontSize: 11,
        margin: [20, 0, 0, 3] as [number, number, number, number]
      })
    } else if (line.trim()) {
      // Plain text line
      pdfContent.push({
        text: extractAndApplyRedText(line),
        fontSize: 11,
        margin: [0, 0, 0, 3] as [number, number, number, number]
      })
    }
  }

  return pdfContent
}

/**
 * Extracts {red}text{/red} and converts to pdfmake inline styles
 */
function extractAndApplyRedText(text: string): any {
  const segments = extractTextSegments(text)

  if (segments.length === 1 && !segments[0].isRed) {
    // No red text, return as plain string
    return text
  }

  // Multiple segments or has red text, return as array
  return segments.map(segment => ({
    text: segment.text,
    color: segment.isRed ? RED_COLOR : undefined
  }))
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

    // Authenticate user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }

    // Fetch event with related data
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select(`
        *,
        event_type:event_types (
          id,
          name,
          icon
        )
      `)
      .eq('id', event_id)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Fetch script with sections
    const { data: script, error: scriptError } = await supabase
      .from('scripts')
      .select(`
        *,
        sections (
          id,
          name,
          content,
          page_break_after,
          order
        )
      `)
      .eq('id', script_id)
      .eq('event_type_id', event_type_id)
      .single()

    if (scriptError || !script) {
      return NextResponse.json(
        { error: 'Script not found' },
        { status: 404 }
      )
    }

    // Fetch input field definitions for the event type
    const { data: inputFieldDefinitions, error: fieldsError } = await supabase
      .from('input_field_definitions')
      .select('*')
      .eq('event_type_id', event_type_id)
      .order('order', { ascending: true })

    if (fieldsError) {
      return NextResponse.json(
        { error: 'Failed to fetch field definitions' },
        { status: 500 }
      )
    }

    // Resolve entities referenced in field_values (people, locations, groups, etc.)
    const resolvedEntities = await resolveFieldEntities(
      supabase,
      event.field_values || {},
      inputFieldDefinitions || []
    )

    // Build PDF content from sections
    const pdfContent: Content[] = []

    // Sort sections by order
    const sortedSections = (script.sections || []).sort((a: any, b: any) => a.order - b.order)

    for (const section of sortedSections) {
      // Add section title
      if (section.name) {
        pdfContent.push({
          text: section.name,
          fontSize: 14,
          bold: true,
          margin: [0, 12, 0, 6] as [number, number, number, number]
        })
      }

      // Convert section content (markdown) to PDF content
      const sectionContent = await markdownToPdfContent(section.content, {
        fieldValues: event.field_values || {},
        inputFieldDefinitions: inputFieldDefinitions || [],
        resolvedEntities,
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
    const filename = `${event.event_type?.name || 'Event'}-${script.name}-${event_id.substring(0, 8)}.pdf`

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
