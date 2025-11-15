import { NextRequest, NextResponse } from 'next/server'
import { getWeddingWithRelations } from '@/lib/actions/weddings'
import { Document, Packer } from 'docx'
import { buildWeddingLiturgy } from '@/lib/content-builders/wedding'
import { renderWord } from '@/lib/renderers/word-renderer'
import { WORD_PAGE_MARGIN } from '@/lib/print-styles'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const wedding = await getWeddingWithRelations(id)

    if (!wedding) {
      return NextResponse.json({ error: 'Wedding not found' }, { status: 404 })
    }

    // Build liturgy content using centralized content builder
    // Use the template_id from the wedding record, defaulting to 'wedding-full-script-english'
    const templateId = wedding.wedding_template_id || 'wedding-full-script-english'
    const liturgyDocument = buildWeddingLiturgy(wedding, templateId)

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
    const brideLastName = wedding.bride?.last_name || 'Bride'
    const groomLastName = wedding.groom?.last_name || 'Groom'
    const weddingDate = wedding.wedding_event?.start_date
      ? new Date(wedding.wedding_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    const filename = `${brideLastName}-${groomLastName}-${weddingDate}.docx`

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
