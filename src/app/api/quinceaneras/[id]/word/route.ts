import { NextRequest, NextResponse } from 'next/server'
import { getQuinceaneraWithRelations } from '@/lib/actions/quinceaneras'
import { Document, Packer } from 'docx'
import { buildQuinceaneraLiturgy } from '@/lib/content-builders/quinceanera'
import { renderWord } from '@/lib/renderers/word-renderer'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const quinceanera = await getQuinceaneraWithRelations(id)

    if (!quinceanera) {
      return NextResponse.json({ error: 'Quinceañera not found' }, { status: 404 })
    }

    // Build liturgy content using centralized content builder
    // Use the template_id from the quinceanera record, defaulting to 'quinceanera-full-script-english'
    const templateId = quinceanera.quinceanera_template_id || 'quinceanera-full-script-english'
    const liturgyDocument = buildQuinceaneraLiturgy(quinceanera, templateId)

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
    const quinceaneraLastName = quinceanera.quinceanera?.last_name || 'Quinceanera'
    const quinceaneraDate = quinceanera.quinceanera_event?.start_date
      ? new Date(quinceanera.quinceanera_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    const filename = `${quinceaneraLastName}-Quinceanera-${quinceaneraDate}.docx`

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
