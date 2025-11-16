import { NextRequest, NextResponse } from 'next/server'
import { getEventWithRelations } from '@/lib/actions/events'
import { Document, Packer } from 'docx'
import { buildEventLiturgy } from '@/lib/content-builders/event'
import { renderWord } from '@/lib/renderers/word-renderer'
import { WORD_PAGE_MARGIN } from '@/lib/print-styles'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const event = await getEventWithRelations(id)

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Build liturgy content using centralized content builder
    const templateId = event.event_template_id || 'event-full-script-english'
    const liturgyDocument = buildEventLiturgy(event, templateId)

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
    const eventDate = event.start_date
      ? new Date(event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    const eventName = event.name.replace(/[^a-z0-9]/gi, '-').substring(0, 30)
    const filename = `event-${eventName}-${eventDate}.docx`

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
