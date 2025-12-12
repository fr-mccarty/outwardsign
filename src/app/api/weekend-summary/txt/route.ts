import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getWeekendSummaryData } from '@/lib/actions/weekend-summary'
import { buildWeekendSummary } from '@/lib/content-builders/weekend-summary'
import { renderText } from '@/lib/renderers/text-renderer'

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
    const filename = searchParams.get('filename') || 'Weekend-Summary.txt'

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

    // Render to plain text format
    const textContent = renderText(liturgyDocument)

    // Return plain text
    return new NextResponse(textContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Error generating weekend summary text:', error)
    return NextResponse.json(
      { error: 'Failed to generate text file' },
      { status: 500 }
    )
  }
}
