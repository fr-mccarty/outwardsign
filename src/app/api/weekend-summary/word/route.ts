import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getWeekendSummaryData } from '@/lib/actions/weekend-summary'
import { buildWeekendSummary } from '@/lib/content-builders/weekend-summary'
import { renderWord } from '@/lib/renderers/word-renderer'

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
    const filename = searchParams.get('filename') || 'Weekend-Summary.docx'

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

    // Render to Word
    const wordBuffer = await renderWord(liturgyDoc)

    // Return Word document
    return new Response(wordBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating weekend summary Word document:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
