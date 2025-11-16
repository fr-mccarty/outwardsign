import { NextRequest, NextResponse } from 'next/server'
import { getMassIntentionWithRelations } from '@/lib/actions/mass-intentions'
import PdfPrinter from 'pdfmake'
import { TDocumentDefinitions } from 'pdfmake/interfaces'
import { pdfStyles } from '@/lib/styles/liturgy-styles'
import { buildMassIntentionLiturgy } from '@/lib/content-builders/mass-intention'
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
    const massIntention = await getMassIntentionWithRelations(id)

    if (!massIntention) {
      return NextResponse.json({ error: 'Mass Intention not found' }, { status: 404 })
    }

    // Build liturgy content using centralized content builder
    const templateId = massIntention.mass_intention_template_id || 'mass-intention-summary-english'
    const liturgyDocument = buildMassIntentionLiturgy(massIntention, templateId)

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
    const requestedBy = massIntention.requested_by
      ? `${massIntention.requested_by.last_name || 'Unknown'}`
      : 'Unknown'
    const dateRequested = massIntention.date_requested
      ? new Date(massIntention.date_requested).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    const filename = `MassIntention-${requestedBy}-${dateRequested}.pdf`

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
