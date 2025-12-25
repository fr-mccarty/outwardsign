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
import { htmlToPdfContent } from '@/lib/utils/export-helpers'
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
