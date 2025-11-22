import { NextRequest, NextResponse } from 'next/server'
import { getGroup } from '@/lib/actions/groups'
import { Document, Packer } from 'docx'
import { buildGroupMembersReport } from '@/lib/content-builders/group'
import { renderWord } from '@/lib/renderers/word-renderer'
import { WORD_PAGE_MARGIN } from '@/lib/print-styles'
import { getGroupFilename } from '@/lib/utils/formatters'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const group = await getGroup(id)

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Build members report using centralized content builder
    const reportDocument = buildGroupMembersReport(group)

    // Render to Word format
    const paragraphs = renderWord(reportDocument)

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
    const filename = getGroupFilename(group, 'docx')

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
