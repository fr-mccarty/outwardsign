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
import { htmlToPdfContent } from '@/lib/utils/export-helpers'
import { getEventWithRelations } from '@/lib/actions/master-events'
import { getScriptWithSections } from '@/lib/actions/scripts'
import { getEventTypeBySlug } from '@/lib/actions/event-types'
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
