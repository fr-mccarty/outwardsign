import { NextRequest, NextResponse } from 'next/server'
import { getBaptismWithRelations } from '@/lib/actions/baptisms'
import { Document, Packer } from 'docx'
import { buildBaptismLiturgy } from '@/lib/content-builders/baptism'
import { renderWord } from '@/lib/renderers/word-renderer'
import { WORD_PAGE_MARGIN } from '@/lib/print-styles'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const baptism = await getBaptismWithRelations(id)

    if (!baptism) {
      return NextResponse.json({ error: 'Baptism not found' }, { status: 404 })
    }

    // Build liturgy content using centralized content builder
    // Use the template_id from the baptism record, defaulting to 'baptism-summary-english'
    const templateId = baptism.baptism_template_id || 'baptism-summary-english'
    const liturgyDocument = buildBaptismLiturgy(baptism, templateId)

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
    const childLastName = baptism.child?.last_name || 'Child'
    const baptismDate = baptism.baptism_event?.start_date
      ? new Date(baptism.baptism_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    const filename = `${childLastName}-Baptism-${baptismDate}.docx`

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
