import { NextRequest, NextResponse } from 'next/server'
import { getEventWithRelations } from '@/lib/actions/events'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx'
import { EVENT_TYPE_LABELS } from '@/lib/constants'

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

    const formatDate = (dateString?: string) => {
      if (!dateString) return 'Not specified'
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    // Build Word document paragraphs
    const paragraphs: Paragraph[] = []

    // Header
    paragraphs.push(
      new Paragraph({
        text: event.name,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      }),
      new Paragraph({
        text: EVENT_TYPE_LABELS[event.event_type]?.en || event.event_type,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [
          new TextRun({
            text: EVENT_TYPE_LABELS[event.event_type]?.en || event.event_type,
            color: '666666',
            size: 24
          })
        ]
      })
    )

    // Description
    if (event.description) {
      paragraphs.push(
        new Paragraph({
          text: 'Description',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          text: event.description,
          spacing: { after: 300 }
        })
      )
    }

    // Event Details
    paragraphs.push(
      new Paragraph({
        text: 'Event Details',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      })
    )

    if (event.start_date) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Start Date: ', bold: true }),
            new TextRun({ text: formatDate(event.start_date) })
          ]
        })
      )
    }

    if (event.start_time) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Start Time: ', bold: true }),
            new TextRun({ text: event.start_time })
          ]
        })
      )
    }

    if (event.end_date) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'End Date: ', bold: true }),
            new TextRun({ text: formatDate(event.end_date) })
          ]
        })
      )
    }

    if (event.end_time) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'End Time: ', bold: true }),
            new TextRun({ text: event.end_time })
          ]
        })
      )
    }

    if (event.location) {
      const locationText = event.location.name +
        (event.location.street || event.location.city ?
          ` (${[event.location.street, event.location.city, event.location.state].filter(Boolean).join(', ')})` :
          '')
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Location: ', bold: true }),
            new TextRun({ text: locationText })
          ]
        })
      )
    }

    if (event.language) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Language: ', bold: true }),
            new TextRun({ text: event.language })
          ]
        })
      )
    }

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: 'Responsible Party: ', bold: true }),
          new TextRun({ text: event.responsible_party_id || 'N/A', size: 16, font: 'Courier New' })
        ],
        spacing: { after: 300 }
      })
    )

    // Notes
    if (event.note) {
      paragraphs.push(
        new Paragraph({
          text: 'Notes',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          text: event.note,
          spacing: { after: 300 }
        })
      )
    }

    // Metadata
    paragraphs.push(
      new Paragraph({
        text: '',
        spacing: { before: 400 },
        border: {
          top: {
            color: 'CCCCCC',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6
          }
        }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Created: ', bold: true, size: 18, color: '666666' }),
          new TextRun({
            text: new Date(event.created_at).toLocaleString('en-US', {
              dateStyle: 'long',
              timeStyle: 'short'
            }),
            size: 18,
            color: '666666'
          })
        ],
        spacing: { before: 200 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Last Updated: ', bold: true, size: 18, color: '666666' }),
          new TextRun({
            text: new Date(event.updated_at).toLocaleString('en-US', {
              dateStyle: 'long',
              timeStyle: 'short'
            }),
            size: 18,
            color: '666666'
          })
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({ text: 'Event ID: ', bold: true, size: 18, color: '666666' }),
          new TextRun({ text: event.id, size: 16, font: 'Courier New', color: '666666' })
        ]
      })
    )

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
