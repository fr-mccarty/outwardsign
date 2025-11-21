import { NextRequest, NextResponse } from 'next/server'
import { getPerson } from '@/lib/actions/people'
import { Document, Packer } from 'docx'
import { buildPersonContactCard } from '@/lib/content-builders/person'
import { renderWord } from '@/lib/renderers/word-renderer'
import { WORD_PAGE_MARGIN } from '@/lib/print-styles'
import { getPersonFilename } from '@/lib/utils/formatters'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const person = await getPerson(id)

    if (!person) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 })
    }

    // Build contact card content using centralized content builder
    const contactCardDocument = buildPersonContactCard(person)

    // Render to Word format
    const paragraphs = renderWord(contactCardDocument)

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
    const filename = getPersonFilename(person, 'docx')

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
