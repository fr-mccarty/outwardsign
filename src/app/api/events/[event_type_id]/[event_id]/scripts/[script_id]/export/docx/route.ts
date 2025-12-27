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
import { Document, Packer, Paragraph, TextRun, PageBreak, AlignmentType } from 'docx'
import { htmlToWordParagraphs, FONT_FAMILY, POINT_TO_HALF_POINT, POINT_TO_TWIP } from '@/lib/utils/export-helpers'
import { getEventWithRelations } from '@/lib/actions/parish-events'
import { getScriptWithSections } from '@/lib/actions/scripts'
import { getEventTypeBySlug } from '@/lib/actions/event-types'
import { getInputFieldDefinitions } from '@/lib/actions/input-field-definitions'

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

      // Convert section content (HTML) to Word paragraphs
      const sectionParagraphs = htmlToWordParagraphs(section.content, {
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
