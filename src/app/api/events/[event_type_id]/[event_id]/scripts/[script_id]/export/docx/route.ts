/**
 * Word (DOCX) Export API Route for User-Defined Event Scripts
 *
 * Generates a Word document from a script with sections, replacing
 * {{Field Name}} placeholders with actual event data.
 *
 * Route: /api/events/[event_type_id]/[event_id]/scripts/[script_id]/export/docx
 * Note: event_type_id can be either a UUID or a slug
 */

import { NextRequest, NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, PageBreak, AlignmentType } from 'docx'
import { replacePlaceholders } from '@/lib/utils/markdown-renderer'
import type { RenderMarkdownOptions } from '@/lib/utils/markdown-renderer'
import { getEventWithRelations } from '@/lib/actions/master-events'
import { getScriptWithSections } from '@/lib/actions/scripts'
import { getEventTypeBySlug } from '@/lib/actions/event-types'
import { getInputFieldDefinitions } from '@/lib/actions/input-field-definitions'
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

/**
 * Creates styled text runs from content with inline formatting
 * Handles: <strong>, <b>, <em>, <i>, {red}...{/red}
 * Also strips: <a> tags (converting to plain text)
 */
function createStyledTextRuns(text: string, fontSize: number): TextRun[] {
  // First, strip <a> tags but keep their text content
  const cleanedText = text.replace(/<a[^>]*>(.*?)<\/a>/g, '$1')

  // If no formatting, return simple text run
  if (!/<\/?(?:strong|b|em|i)>/.test(cleanedText) && !/{red}/.test(cleanedText)) {
    return [
      new TextRun({
        text: cleanedText,
        font: FONT_FAMILY,
        size: fontSize * POINT_TO_HALF_POINT
      })
    ]
  }

  const runs: TextRun[] = []

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
        runs.push(
          new TextRun({
            text: beforeText,
            font: FONT_FAMILY,
            size: fontSize * POINT_TO_HALF_POINT
          })
        )
      }
    }

    if (match[1]) {
      // HTML tag match: match[1] is tag name, match[2] is content
      const tagName = match[1].toLowerCase()
      const content = match[2]

      if (tagName === 'strong' || tagName === 'b') {
        runs.push(
          new TextRun({
            text: content,
            font: FONT_FAMILY,
            size: fontSize * POINT_TO_HALF_POINT,
            bold: true
          })
        )
      } else if (tagName === 'em' || tagName === 'i') {
        runs.push(
          new TextRun({
            text: content,
            font: FONT_FAMILY,
            size: fontSize * POINT_TO_HALF_POINT,
            italics: true
          })
        )
      }
    } else if (match[3] !== undefined) {
      // Red tag match: match[3] is content
      runs.push(
        new TextRun({
          text: match[3],
          font: FONT_FAMILY,
          size: fontSize * POINT_TO_HALF_POINT,
          color: RED_COLOR
        })
      )
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text after last match
  if (lastIndex < cleanedText.length) {
    const afterText = cleanedText.slice(lastIndex)
    if (afterText) {
      runs.push(
        new TextRun({
          text: afterText,
          font: FONT_FAMILY,
          size: fontSize * POINT_TO_HALF_POINT
        })
      )
    }
  }

  return runs.length > 0 ? runs : [
    new TextRun({
      text: cleanedText,
      font: FONT_FAMILY,
      size: fontSize * POINT_TO_HALF_POINT
    })
  ]
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
      documents: {} as Record<string, any>,
      contents: {} as Record<string, any>
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
        } else if (typedFieldData.field_type === 'content' && typedFieldData.resolved_value) {
          resolvedEntities.contents[typedFieldData.raw_value] = typedFieldData.resolved_value
        }
      }
    }

    // Build Word paragraphs from sections
    const wordParagraphs: Paragraph[] = []

    // Sort sections by order
    const sortedSections = (script.sections || []).sort((a: any, b: any) => a.order - b.order)

    for (const section of sortedSections) {
      // Add section title - centered to match HTML view
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
            alignment: AlignmentType.CENTER,
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
        parish: event.parish,
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
