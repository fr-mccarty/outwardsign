import { NextRequest, NextResponse } from 'next/server'
import { getEventWithRelations } from '@/lib/actions/events'
import PdfPrinter from 'pdfmake'
import { TDocumentDefinitions } from 'pdfmake/interfaces'
import { pdfStyles } from '@/lib/styles/liturgy-styles'
import { buildEventLiturgy } from '@/lib/content-builders/event'
import { renderPDF } from '@/lib/renderers/pdf-renderer'

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const event = await getEventWithRelations(id)

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Build liturgy content using centralized content builder
    const templateId = event.event_template_id || 'event-full-script-english'
    const liturgyDocument = buildEventLiturgy(event, templateId)

    // Render to PDF format
    const content = renderPDF(liturgyDocument)

    // PDF Document definition
    const docDefinition: TDocumentDefinitions = {
      content,
      pageMargins: [pdfStyles.margins.page, pdfStyles.margins.page, pdfStyles.margins.page, pdfStyles.margins.page]
    }

    // Generate PDF
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
    const eventDate = event.start_date
      ? new Date(event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    const eventName = event.name.replace(/[^a-z0-9]/gi, '-').substring(0, 30)
    const filename = `event-${eventName}-${eventDate}.pdf`

    // Return PDF
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
