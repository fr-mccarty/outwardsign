import { NextRequest, NextResponse } from 'next/server'
import { getPresentationWithRelations } from '@/lib/actions/presentations'
import { Document, Packer } from 'docx'
import { buildPresentationLiturgy } from '@/lib/content-builders/presentation'
import { renderWord } from '@/lib/renderers/word-renderer'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const presentation = await getPresentationWithRelations(id)

    if (!presentation) {
      return NextResponse.json({ error: 'Presentation not found' }, { status: 404 })
    }

    // Build liturgy content using centralized content builder
    // Use the template_id from the presentation record, defaulting to 'presentation-spanish'
    const templateId = presentation.presentation_template_id || 'presentation-spanish'
    const liturgyDocument = buildPresentationLiturgy(presentation, templateId)

    // Render to Word format
    const paragraphs = renderWord(liturgyDocument)

    // Create Word document
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
    })

    // Generate Word document buffer
    const buffer = await Packer.toBuffer(doc)

    // Generate filename
    const childLastName = presentation.child?.last_name || 'Child'
    const presentationDate = presentation.presentation_event?.start_date
      ? new Date(presentation.presentation_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    const filename = `presentation-${childLastName}-${presentationDate}.docx`

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
