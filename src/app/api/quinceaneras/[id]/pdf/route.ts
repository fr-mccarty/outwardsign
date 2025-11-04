import { NextRequest, NextResponse } from 'next/server'
import { getQuinceaneraWithRelations } from '@/lib/actions/quinceaneras'
import PdfPrinter from 'pdfmake'
import { TDocumentDefinitions } from 'pdfmake/interfaces'
import { pdfStyles } from '@/lib/styles/liturgy-styles'
import { buildQuinceaneraLiturgy } from '@/lib/content-builders/quinceanera'
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
    const quinceanera = await getQuinceaneraWithRelations(id)

    if (!quinceanera) {
      return NextResponse.json({ error: 'Quinceañera not found' }, { status: 404 })
    }

    // Build liturgy content using centralized content builder
    // Use the template_id from the quinceanera record, defaulting to 'quinceanera-full-script-english'
    const templateId = quinceanera.quinceanera_template_id || 'quinceanera-full-script-english'
    const liturgyDocument = buildQuinceaneraLiturgy(quinceanera, templateId)

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
    const quinceaneraLastName = quinceanera.quinceanera?.last_name || 'Quinceanera'
    const quinceaneraDate = quinceanera.quinceanera_event?.start_date
      ? new Date(quinceanera.quinceanera_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    const filename = `${quinceaneraLastName}-Quinceanera-${quinceaneraDate}.pdf`

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
