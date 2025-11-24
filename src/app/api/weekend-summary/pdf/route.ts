import { NextRequest, NextResponse } from 'next/server'
import PdfPrinter from 'pdfmake'
import { TDocumentDefinitions } from 'pdfmake/interfaces'
import { createClient } from '@/lib/supabase/server'
import { getWeekendSummaryData } from '@/lib/actions/weekend-summary'
import { buildWeekendSummary } from '@/lib/content-builders/weekend-summary'
import { renderPDF } from '@/lib/renderers/pdf-renderer'
import { pdfStyles } from '@/lib/styles/liturgy-styles'

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

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get search params
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    const filename = searchParams.get('filename') || 'Weekend-Summary.pdf'

    if (!date) {
      return NextResponse.json({ error: 'Missing date parameter' }, { status: 400 })
    }

    // Build params for data fetch
    const weekendParams = {
      sundayDate: date,
      includeSacraments: searchParams.get('sacraments') === 'true',
      includeMasses: searchParams.get('masses') === 'true',
      includeMassRoles: searchParams.get('massRoles') === 'true'
    }

    // Fetch weekend data
    const weekendData = await getWeekendSummaryData(weekendParams)

    // Build liturgy content
    const liturgyDocument = buildWeekendSummary(weekendData, weekendParams)

    // Render to PDF format
    const content = renderPDF(liturgyDocument)

    // PDF Document definition
    const docDefinition: TDocumentDefinitions = {
      content,
      pageMargins: [
        pdfStyles.margins.page,
        pdfStyles.margins.page,
        pdfStyles.margins.page,
        pdfStyles.margins.page
      ]
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

    // Return PDF
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Error generating weekend summary PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
