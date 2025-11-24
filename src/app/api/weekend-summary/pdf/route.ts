import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getWeekendSummaryData } from '@/lib/actions/weekend-summary'
import { buildWeekendSummary } from '@/lib/content-builders/weekend-summary'
import { renderHTML } from '@/lib/renderers/html-renderer'
import { convertHTMLToPDF } from '@/lib/pdf-converter'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Get search params
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    const filename = searchParams.get('filename') || 'Weekend-Summary.pdf'

    if (!date) {
      return new Response('Missing date parameter', { status: 400 })
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

    // Build content
    const liturgyDoc = buildWeekendSummary(weekendData, weekendParams)

    // Render to HTML
    const htmlContent = renderHTML(liturgyDoc)

    // Convert to PDF
    const pdfBuffer = await convertHTMLToPDF(htmlContent)

    // Return PDF
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating weekend summary PDF:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
