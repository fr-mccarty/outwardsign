import { NextRequest, NextResponse } from 'next/server'
import { getMassIntentionWithRelations } from '@/lib/actions/mass-intentions'
import { Document, Packer } from 'docx'
import { buildMassIntentionLiturgy } from '@/lib/content-builders/mass-intention'
import { renderWord } from '@/lib/renderers/word-renderer'
import { WORD_PAGE_MARGIN } from '@/lib/print-styles'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const massIntention = await getMassIntentionWithRelations(id)

    if (!massIntention) {
      return NextResponse.json({ error: 'Mass Intention not found' }, { status: 404 })
    }

    // Build liturgy content using centralized content builder
    const templateId = massIntention.mass_intention_template_id || 'mass-intention-summary-english'
    const liturgyDocument = buildMassIntentionLiturgy(massIntention, templateId)

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
    const requestedBy = massIntention.requested_by
      ? `${massIntention.requested_by.last_name || 'Unknown'}`
      : 'Unknown'
    const dateRequested = massIntention.date_requested
      ? new Date(massIntention.date_requested).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    const filename = `MassIntention-${requestedBy}-${dateRequested}.docx`

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
