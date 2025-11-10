import { NextRequest, NextResponse } from 'next/server'
import { getBaptismWithRelations } from '@/lib/actions/baptisms'
import PdfPrinter from 'pdfmake'
import { TDocumentDefinitions } from 'pdfmake/interfaces'
import { pdfStyles } from '@/lib/styles/liturgy-styles'
import { buildBaptismLiturgy } from '@/lib/content-builders/baptism'
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
    const baptism = await getBaptismWithRelations(id)

    if (!baptism) {
      return NextResponse.json({ error: 'Baptism not found' }, { status: 404 })
    }

    // Build liturgy content using centralized content builder
    // Use the template_id from the baptism record, defaulting to 'baptism-summary-english'
    const templateId = baptism.baptism_template_id || 'baptism-summary-english'
    const liturgyDocument = buildBaptismLiturgy(baptism, templateId)

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
    const childLastName = baptism.child?.last_name || 'Child'
    const baptismDate = baptism.baptism_event?.start_date
      ? new Date(baptism.baptism_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    const filename = `${childLastName}-Baptism-${baptismDate}.pdf`

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
