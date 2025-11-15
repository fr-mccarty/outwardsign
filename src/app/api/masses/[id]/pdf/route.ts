import { NextRequest, NextResponse } from 'next/server'
import { getMassWithRelations } from '@/lib/actions/masses'
import PdfPrinter from 'pdfmake'
import { TDocumentDefinitions } from 'pdfmake/interfaces'
import { pdfStyles } from '@/lib/styles/liturgy-styles'
import { buildMassLiturgy } from '@/lib/content-builders/mass'
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
    const mass = await getMassWithRelations(id)

    if (!mass) {
      return NextResponse.json({ error: 'Mass not found' }, { status: 404 })
    }

    // Build liturgy content using centralized content builder
    // Use the template_id from the mass record, defaulting to 'mass-english'
    const templateId = mass.mass_template_id || 'mass-english'
    const liturgyDocument = buildMassLiturgy(mass, templateId)

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
    const presiderName = mass.presider
      ? `${mass.presider.first_name}-${mass.presider.last_name}`
      : 'Presider'
    const massDate = mass.event?.start_date
      ? new Date(mass.event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    const filename = `Mass-${presiderName}-${massDate}.pdf`

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
