import { NextRequest, NextResponse } from 'next/server'
import { getFuneralWithRelations } from '@/lib/actions/funerals'
import { Document, Packer } from 'docx'
import { buildFuneralLiturgy } from '@/lib/content-builders/funeral'
import { renderWord } from '@/lib/renderers/word-renderer'
import { WORD_PAGE_MARGIN } from '@/lib/print-styles'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const funeral = await getFuneralWithRelations(id)

    if (!funeral) {
      return NextResponse.json({ error: 'Funeral not found' }, { status: 404 })
    }

    // Build liturgy content using centralized content builder
    // Use the template_id from the funeral record, defaulting to 'funeral-full-script-english'
    const templateId = funeral.funeral_template_id || 'funeral-full-script-english'
    const liturgyDocument = buildFuneralLiturgy(funeral, templateId)

    // Render to Word format
    const paragraphs = renderWord(liturgyDocument)

    // Create Word document
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: WORD_PAGE_MARGIN,
              right: WORD_PAGE_MARGIN,
              bottom: WORD_PAGE_MARGIN,
              left: WORD_PAGE_MARGIN,
            },
          },
        },
        children: paragraphs
      }]
    })

    // Generate Word document buffer
    const buffer = await Packer.toBuffer(doc)

    // Generate filename
    const deceasedLastName = funeral.deceased?.last_name || 'Deceased'
    const funeralDate = funeral.funeral_event?.start_date
      ? new Date(funeral.funeral_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    const filename = `${deceasedLastName}-Funeral-${funeralDate}.docx`

    // Return Word document
    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

  } catch (error) {
    console.error('Error generating Word document:', error)
    return NextResponse.json({ error: 'Failed to generate Word document' }, { status: 500 })
  }
}
