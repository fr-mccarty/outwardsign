import { NextRequest, NextResponse } from 'next/server'
import { Document, Packer } from 'docx'
import { createClient } from '@/lib/supabase/server'
import { getWeekendSummaryData } from '@/lib/actions/weekend-summary'
import { buildWeekendSummary } from '@/lib/content-builders/weekend-summary'
import { renderWord } from '@/lib/renderers/word-renderer'
import { WORD_PAGE_MARGIN } from '@/lib/print-styles'

export const dynamic = 'force-dynamic'

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
    const filename = searchParams.get('filename') || 'Weekend-Summary.docx'

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

    // Render to Word format
    const paragraphs = renderWord(liturgyDocument)

    // Create Word document
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: WORD_PAGE_MARGIN,
                right: WORD_PAGE_MARGIN,
                bottom: WORD_PAGE_MARGIN,
                left: WORD_PAGE_MARGIN
              }
            }
          },
          children: paragraphs
        }
      ]
    })

    // Generate Word document buffer
    const buffer = await Packer.toBuffer(doc)

    // Return Word document
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })
  } catch (error) {
    console.error('Error generating weekend summary Word document:', error)
    return NextResponse.json(
      { error: 'Failed to generate Word document' },
      { status: 500 }
    )
  }
}
