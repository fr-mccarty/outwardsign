import { NextRequest, NextResponse } from 'next/server'
import { getMassWithRelations } from '@/lib/actions/masses'
import { Document, Packer } from 'docx'
import { buildMassLiturgy } from '@/lib/content-builders/mass'
import { renderWord } from '@/lib/renderers/word-renderer'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const mass = await getMassWithRelations(id)

    if (!mass) {
      return NextResponse.json({ error: 'Mass not found' }, { status: 404 })
    }

    // Build liturgy content using centralized content builder
    // Use the template_id from the mass record, defaulting to 'mass-english'
    const templateId = mass.mass_template_id || 'mass-english'
    const liturgyDocument = buildMassLiturgy(mass, templateId)

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
    const presiderLastName = mass.presider?.last_name || 'Presider'
    const eventDate = mass.event?.start_date
      ? new Date(mass.event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    const filename = `mass-${presiderLastName}-${eventDate}.docx`

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
