import { NextRequest, NextResponse } from 'next/server'
import { getEventWithRelations } from '@/lib/actions/events'
import PdfPrinter from 'pdfmake'
import { TDocumentDefinitions, Content } from 'pdfmake/interfaces'
import { EVENT_TYPE_LABELS } from '@/lib/constants'

// Define fonts for pdfmake
const fonts = {
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
}

const printer = new PdfPrinter(fonts)

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

    // Build PDF content
    const content: Content = [
      // Header
      {
        text: event.name,
        style: 'header',
        alignment: 'center'
      },
      {
        text: EVENT_TYPE_LABELS[event.event_type]?.en || event.event_type,
        style: 'subheader',
        alignment: 'center',
        margin: [0, 0, 0, 20]
      }
    ]

    // Description
    if (event.description) {
      content.push(
        { text: 'Description', style: 'sectionHeader' },
        {
          text: event.description,
          style: 'description',
          margin: [0, 0, 0, 15]
        }
      )
    }

    // Event Details
    content.push({ text: 'Event Details', style: 'sectionHeader' })

    const details: any[] = []

    if (event.start_date) {
      details.push([
        { text: 'Start Date:', bold: true, width: 120 },
        { text: formatDate(event.start_date) }
      ])
    }

    if (event.start_time) {
      details.push([
        { text: 'Start Time:', bold: true, width: 120 },
        { text: event.start_time }
      ])
    }

    if (event.end_date) {
      details.push([
        { text: 'End Date:', bold: true, width: 120 },
        { text: formatDate(event.end_date) }
      ])
    }

    if (event.end_time) {
      details.push([
        { text: 'End Time:', bold: true, width: 120 },
        { text: event.end_time }
      ])
    }

    if (event.location) {
      const locationText = event.location.name +
        (event.location.street || event.location.city ?
          ` (${[event.location.street, event.location.city, event.location.state].filter(Boolean).join(', ')})` :
          '')
      details.push([
        { text: 'Location:', bold: true, width: 120 },
        { text: locationText }
      ])
    }

    if (event.language) {
      details.push([
        { text: 'Language:', bold: true, width: 120 },
        { text: event.language }
      ])
    }

    details.push([
      { text: 'Responsible Party:', bold: true, width: 120 },
      { text: event.responsible_party_id, fontSize: 8, font: 'Courier' }
    ])

    content.push({
      layout: 'noBorders',
      table: {
        widths: [120, '*'],
        body: details
      },
      margin: [0, 0, 0, 15]
    })

    // Notes
    if (event.note) {
      content.push(
        { text: 'Notes', style: 'sectionHeader' },
        {
          text: event.note,
          style: 'description',
          margin: [0, 0, 0, 15]
        }
      )
    }

    // Metadata
    content.push(
      { text: '', margin: [0, 20, 0, 0] },
      {
        layout: 'noBorders',
        table: {
          widths: [120, '*'],
          body: [
            [
              { text: 'Created:', bold: true, fontSize: 9, color: '#666666' },
              {
                text: new Date(event.created_at).toLocaleString('en-US', {
                  dateStyle: 'long',
                  timeStyle: 'short'
                }),
                fontSize: 9,
                color: '#666666'
              }
            ],
            [
              { text: 'Last Updated:', bold: true, fontSize: 9, color: '#666666' },
              {
                text: new Date(event.updated_at).toLocaleString('en-US', {
                  dateStyle: 'long',
                  timeStyle: 'short'
                }),
                fontSize: 9,
                color: '#666666'
              }
            ],
            [
              { text: 'Event ID:', bold: true, fontSize: 9, color: '#666666' },
              { text: event.id, fontSize: 8, font: 'Courier', color: '#666666' }
            ]
          ]
        }
      }
    )

    // PDF Document definition
    const docDefinition: TDocumentDefinitions = {
      content,
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 14,
          color: '#666666'
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          decoration: 'underline',
          margin: [0, 10, 0, 5]
        },
        description: {
          fontSize: 11,
          lineHeight: 1.5,
          background: '#f9f9f9',
          margin: [10, 5, 10, 5]
        }
      },
      pageMargins: [50, 50, 50, 50]
    }

    // Generate PDF
    const pdfDoc = printer.createPdfKitDocument(docDefinition)

    // Collect PDF buffer
    const chunks: Buffer[] = []
    pdfDoc.on('data', (chunk) => chunks.push(chunk))

    await new Promise<void>((resolve, reject) => {
      pdfDoc.on('end', () => resolve())
      pdfDoc.on('error', reject)
      pdfDoc.end()
    })

    const pdfBuffer = Buffer.concat(chunks)

    // Generate filename
    const eventDate = event.start_date
      ? new Date(event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    const eventName = event.name.replace(/[^a-z0-9]/gi, '-').substring(0, 30)
    const filename = `event-${eventName}-${eventDate}.pdf`

    // Return PDF
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
