/**
 * Word (DOCX) Export API Route for User-Defined Event Scripts
 *
 * Generates a Word document from a script with sections, replacing
 * {{Field Name}} placeholders with actual event data.
 *
 * Route: /api/events/[event_type_id]/[event_id]/scripts/[script_id]/export/docx
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak } from 'docx'
import { replacePlaceholders, extractTextSegments } from '@/lib/utils/markdown-renderer'
import type { RenderMarkdownOptions } from '@/lib/utils/markdown-renderer'
import { resolveFieldEntities } from '@/lib/utils/resolve-field-entities'
import { marked } from 'marked'

// Liturgical red color (without # prefix for Word)
const RED_COLOR = 'c41e3a'

// Font settings
const FONT_FAMILY = 'Times New Roman'

// Unit conversion helpers
const POINT_TO_HALF_POINT = 2 // Word uses half-points for font size
const POINT_TO_TWIP = 20 // Word uses twips (1/20 point) for spacing

/**
 * Converts markdown to Word paragraphs
 * Handles {red}text{/red} syntax and standard markdown
 */
async function markdownToWordParagraphs(
  markdown: string,
  options: RenderMarkdownOptions
): Promise<Paragraph[]> {
  // Step 1: Replace {{Field Name}} placeholders
  const content = replacePlaceholders(markdown, options)

  // Step 2: Parse markdown to HTML first
  const html = await marked.parse(content)

  // Step 3: Convert HTML to Word paragraphs
  const lines = html.split('\n').filter(line => line.trim())
  const paragraphs: Paragraph[] = []

  for (const line of lines) {
    // Handle headings
    if (line.startsWith('<h1>')) {
      const text = line.replace(/<\/?h1>/g, '')
      paragraphs.push(
        new Paragraph({
          children: createStyledTextRuns(text, 18),
          heading: HeadingLevel.HEADING_1,
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
          spacing: {
            after: 6 * POINT_TO_TWIP
          }
        })
      )
    } else if (line.startsWith('<ul>') || line.startsWith('<ol>')) {
      // Handle lists - simplified for now
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

/**
 * Creates styled text runs from content with {red}text{/red} syntax
 */
function createStyledTextRuns(text: string, fontSize: number): TextRun[] {
  const segments = extractTextSegments(text)

  return segments.map(segment =>
    new TextRun({
      text: segment.text,
      font: FONT_FAMILY,
      size: fontSize * POINT_TO_HALF_POINT,
      color: segment.isRed ? RED_COLOR : undefined
    })
  )
}

/**
 * GET handler for Word (DOCX) export
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

    // Build Word paragraphs from sections
    const wordParagraphs: Paragraph[] = []

    // Sort sections by order
    const sortedSections = (script.sections || []).sort((a: any, b: any) => a.order - b.order)

    for (const section of sortedSections) {
      // Add section title
      if (section.name) {
        wordParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: section.name,
                font: FONT_FAMILY,
                size: 14 * POINT_TO_HALF_POINT,
                bold: true
              })
            ],
            spacing: {
              before: 12 * POINT_TO_TWIP,
              after: 6 * POINT_TO_TWIP
            }
          })
        )
      }

      // Convert section content (markdown) to Word paragraphs
      const sectionParagraphs = await markdownToWordParagraphs(section.content, {
        fieldValues: event.field_values || {},
        inputFieldDefinitions: inputFieldDefinitions || [],
        resolvedEntities,
        format: 'word'
      })

      wordParagraphs.push(...sectionParagraphs)

      // Add page break if requested
      if (section.page_break_after) {
        wordParagraphs.push(
          new Paragraph({
            children: [new PageBreak()]
          })
        )
      }
    }

    // Create Word document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 72 * POINT_TO_TWIP,    // 1 inch
                right: 72 * POINT_TO_TWIP,
                bottom: 72 * POINT_TO_TWIP,
                left: 72 * POINT_TO_TWIP
              }
            }
          },
          children: wordParagraphs
        }
      ]
    })

    // Generate Word document buffer
    const buffer = await Packer.toBuffer(doc)

    // Generate filename
    const filename = `${event.event_type?.name || 'Event'}-${script.name}-${event_id.substring(0, 8)}.docx`

    // Return Word document
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Error generating Word document:', error)
    return NextResponse.json(
      { error: 'Failed to generate Word document' },
      { status: 500 }
    )
  }
}
