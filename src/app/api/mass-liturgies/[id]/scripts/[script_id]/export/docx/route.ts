/**
 * Word (DOCX) Export API Route for Mass Scripts
 *
 * Generates a Word document from a Mass script with sections, replacing
 * {{Field Name}} placeholders with actual Mass data.
 *
 * Route: /api/mass-liturgies/[mass_id]/scripts/[script_id]/export/docx
 */

import { NextRequest, NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun, PageBreak, AlignmentType } from 'docx'
import { htmlToWordParagraphs, FONT_FAMILY, POINT_TO_HALF_POINT, POINT_TO_TWIP } from '@/lib/utils/export-helpers'
import { getMassWithRelations } from '@/lib/actions/mass-liturgies'
import { getScriptWithSections } from '@/lib/actions/scripts'
import { getInputFieldDefinitions } from '@/lib/actions/input-field-definitions'

/**
 * GET handler for Word (DOCX) export
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
        fieldValues: mass.field_values || {},
        inputFieldDefinitions: inputFieldDefinitions || [],
        resolvedEntities,
        parish: mass.calendar_events?.[0]?.location ? {
          name: 'Parish', // TODO: Get actual parish name if needed
          city: mass.calendar_events[0].location.city || '',
          state: mass.calendar_events[0].location.state || ''
        } : undefined,
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

    // Get filename from query params or generate default
    const url = new URL(request.url)
    const filename = url.searchParams.get('filename') || `Mass-${script.name}-${massId.substring(0, 8)}.docx`

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
