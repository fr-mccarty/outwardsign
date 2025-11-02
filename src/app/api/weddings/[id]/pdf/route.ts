import { NextRequest, NextResponse } from 'next/server'
import { getWeddingWithRelations } from '@/lib/actions/weddings'
import PdfPrinter from 'pdfmake'
import { TDocumentDefinitions, Content } from 'pdfmake/interfaces'

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

// Helper to format person name
const formatPersonName = (person?: { first_name: string; last_name: string } | null): string => {
  return person ? `${person.first_name} ${person.last_name}` : ''
}

// Helper to format person with phone
const formatPersonWithPhone = (person?: { first_name: string; last_name: string; phone_number?: string } | null): string => {
  if (!person) return ''
  const name = `${person.first_name} ${person.last_name}`
  return person.phone_number ? `${name} (${person.phone_number})` : name
}

// Helper to format event datetime
const formatEventDateTimeString = (event?: { start_date?: string; start_time?: string } | null): string => {
  if (!event?.start_date) return ''
  const date = new Date(event.start_date).toLocaleDateString()
  return event.start_time ? `${date} at ${event.start_time}` : date
}

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

    // Prepare data
    const brideName = wedding.bride?.first_name || ''
    const groomName = wedding.groom?.first_name || ''
    const weddingTitle = wedding.bride && wedding.groom
      ? `${wedding.bride.first_name} ${wedding.bride.last_name} & ${wedding.groom.first_name} ${wedding.groom.last_name}`
      : 'Wedding'

    const eventDateTime = wedding.wedding_event?.start_date && wedding.wedding_event?.start_time
      ? formatEventDateTimeString(wedding.wedding_event)
      : 'Missing Date and Time'

    const customPetitions = wedding.petitions
      ? wedding.petitions.split('\n').filter(p => p.trim())
      : []

    const petitionsReader = wedding.petitions_read_by_second_reader && wedding.second_reader
      ? formatPersonName(wedding.second_reader)
      : wedding.petition_reader
      ? formatPersonName(wedding.petition_reader)
      : ''

    // Build PDF content
    const content: Content = []

    // Summary Section
    content.push(
      { text: weddingTitle, style: 'title', alignment: 'center' },
      { text: eventDateTime, style: 'subtitle', alignment: 'center', margin: [0, 5, 0, 20] }
    )

    // Rehearsal Section
    if (wedding.rehearsal_event || wedding.rehearsal_dinner_event) {
      content.push({ text: 'Rehearsal', style: 'sectionTitle' })

      if (wedding.rehearsal_event?.start_date) {
        content.push({
          columns: [
            { text: 'Rehearsal Date & Time:', bold: true, width: 150 },
            { text: formatEventDateTimeString(wedding.rehearsal_event), width: '*' }
          ],
          margin: [0, 2, 0, 2]
        })
      }

      if (wedding.rehearsal_event?.location) {
        content.push({
          columns: [
            { text: 'Rehearsal Location:', bold: true, width: 150 },
            { text: wedding.rehearsal_event.location, width: '*' }
          ],
          margin: [0, 2, 0, 2]
        })
      }

      if (wedding.rehearsal_dinner_event?.location) {
        content.push({
          columns: [
            { text: 'Rehearsal Dinner Location:', bold: true, width: 150 },
            { text: wedding.rehearsal_dinner_event.location, width: '*' }
          ],
          margin: [0, 2, 0, 10]
        })
      }
    }

    // Wedding Section
    content.push({ text: 'Wedding', style: 'sectionTitle' })

    const weddingInfo: { label: string; value: string }[] = []

    if (wedding.bride) {
      weddingInfo.push({ label: 'Bride:', value: formatPersonWithPhone(wedding.bride) })
    }
    if (wedding.groom) {
      weddingInfo.push({ label: 'Groom:', value: formatPersonWithPhone(wedding.groom) })
    }
    if (wedding.coordinator) {
      weddingInfo.push({ label: 'Coordinator:', value: formatPersonName(wedding.coordinator) })
    }
    if (wedding.presider) {
      weddingInfo.push({ label: 'Presider:', value: formatPersonName(wedding.presider) })
    }
    if (wedding.lead_musician) {
      weddingInfo.push({ label: 'Lead Musician:', value: formatPersonName(wedding.lead_musician) })
    }
    if (wedding.wedding_event?.location) {
      weddingInfo.push({ label: 'Wedding Location:', value: wedding.wedding_event.location })
    }
    if (wedding.reception_event?.location) {
      weddingInfo.push({ label: 'Reception Location:', value: wedding.reception_event.location })
    }
    if (wedding.witness_1) {
      weddingInfo.push({ label: 'Best Man:', value: formatPersonName(wedding.witness_1) })
    }
    if (wedding.witness_2) {
      weddingInfo.push({ label: 'Maid/Matron of Honor:', value: formatPersonName(wedding.witness_2) })
    }
    if (wedding.notes) {
      weddingInfo.push({ label: 'Wedding Note:', value: wedding.notes })
    }

    weddingInfo.forEach(info => {
      content.push({
        columns: [
          { text: info.label, bold: true, width: 150 },
          { text: info.value, width: '*' }
        ],
        margin: [0, 2, 0, 2]
      })
    })

    content.push({ text: '', margin: [0, 0, 0, 10] })

    // Sacred Liturgy Section
    content.push({ text: 'Sacred Liturgy', style: 'sectionTitle' })

    const liturgyInfo: { label: string; value: string }[] = []

    if (wedding.first_reading) {
      liturgyInfo.push({ label: 'First Reading:', value: wedding.first_reading.pericope || '' })
    }
    if (wedding.first_reader) {
      liturgyInfo.push({ label: 'First Reading Lector:', value: formatPersonName(wedding.first_reader) })
    }
    if (wedding.psalm) {
      liturgyInfo.push({ label: 'Psalm:', value: wedding.psalm.pericope || '' })
    }
    if (wedding.psalm_is_sung) {
      liturgyInfo.push({ label: 'Psalm Choice:', value: 'Sung' })
    } else if (wedding.psalm_reader) {
      liturgyInfo.push({ label: 'Psalm Lector:', value: formatPersonName(wedding.psalm_reader) })
    }
    if (wedding.second_reading) {
      liturgyInfo.push({ label: 'Second Reading:', value: wedding.second_reading.pericope || '' })
    }
    if (wedding.second_reader) {
      liturgyInfo.push({ label: 'Second Reading Lector:', value: formatPersonName(wedding.second_reader) })
    }
    if (wedding.gospel_reading) {
      liturgyInfo.push({ label: 'Gospel Reading:', value: wedding.gospel_reading.pericope || '' })
    }
    if (petitionsReader) {
      liturgyInfo.push({ label: 'Petitions Read By:', value: petitionsReader })
    }
    if (wedding.petitions) {
      liturgyInfo.push({ label: 'Additional Petitions:', value: wedding.petitions })
    }

    liturgyInfo.forEach(info => {
      content.push({
        columns: [
          { text: info.label, bold: true, width: 150 },
          { text: info.value, width: '*' }
        ],
        margin: [0, 2, 0, 2]
      })
    })

    // Page break before readings
    content.push({ text: '', pageBreak: 'after' })

    // Readings Section
    content.push(
      { text: weddingTitle, style: 'title', alignment: 'center' },
      { text: eventDateTime, style: 'subtitle', alignment: 'center', margin: [0, 5, 0, 20] }
    )

    // First Reading
    content.push({ text: 'FIRST READING', style: 'readingTitle' })
    if (wedding.first_reading) {
      content.push(
        { text: wedding.first_reading.pericope || 'No pericope', style: 'pericope' }
      )
      if (wedding.first_reader) {
        content.push({
          text: formatPersonName(wedding.first_reader),
          style: 'readerName'
        })
      }
      if (wedding.first_reading.introduction) {
        content.push({ text: wedding.first_reading.introduction, style: 'introduction' })
      }
      content.push({ text: wedding.first_reading.text || 'No reading text', style: 'readingText' })
      if (wedding.first_reading.conclusion) {
        content.push({ text: wedding.first_reading.conclusion, style: 'conclusion' })
      }
      content.push({ text: 'People: Thanks be to God.', style: 'response', margin: [0, 10, 0, 20] })
    } else {
      content.push({ text: 'None Selected', margin: [0, 5, 0, 20] })
    }

    // Psalm
    content.push({ text: 'Psalm', style: 'readingTitle' })
    if (wedding.psalm) {
      content.push({ text: wedding.psalm.pericope || 'No pericope', style: 'pericope' })
      if (wedding.psalm_is_sung) {
        content.push({ text: 'Sung', style: 'readerName' })
      } else if (wedding.psalm_reader) {
        content.push({ text: formatPersonName(wedding.psalm_reader), style: 'readerName' })
      }
      if (wedding.psalm.introduction) {
        content.push({ text: wedding.psalm.introduction, style: 'introduction' })
      }
      content.push({ text: wedding.psalm.text || 'No psalm text', style: 'readingText' })
      if (wedding.psalm.conclusion) {
        content.push({ text: wedding.psalm.conclusion, style: 'conclusion', margin: [0, 5, 0, 20] })
      } else {
        content.push({ text: '', margin: [0, 0, 0, 20] })
      }
    } else {
      content.push({ text: 'None Selected', margin: [0, 5, 0, 20] })
    }

    // Second Reading
    content.push({ text: 'Second Reading', style: 'readingTitle' })
    if (wedding.second_reading) {
      content.push({ text: wedding.second_reading.pericope || 'No pericope', style: 'pericope' })
      if (wedding.second_reader) {
        content.push({ text: formatPersonName(wedding.second_reader), style: 'readerName' })
      }
      if (wedding.second_reading.introduction) {
        content.push({ text: wedding.second_reading.introduction, style: 'introduction' })
      }
      content.push({ text: wedding.second_reading.text || 'No reading text', style: 'readingText' })
      if (wedding.second_reading.conclusion) {
        content.push({ text: wedding.second_reading.conclusion, style: 'conclusion' })
      }
      content.push({ text: 'People: Thanks be to God.', style: 'response', margin: [0, 10, 0, 20] })
    } else {
      content.push({ text: 'None Selected', margin: [0, 5, 0, 20] })
    }

    // Gospel
    content.push({ text: 'Gospel', style: 'readingTitle' })
    if (wedding.gospel_reading) {
      content.push({ text: wedding.gospel_reading.pericope || 'No pericope', style: 'pericope' })
      content.push({ text: 'Priest: The Lord be with you.', style: 'priestDialogue' })
      content.push({ text: 'People: And with your spirit.', style: 'response' })
      if (wedding.gospel_reading.introduction) {
        content.push({ text: wedding.gospel_reading.introduction, style: 'introduction' })
      }
      content.push({ text: wedding.gospel_reading.text || 'No gospel text', style: 'readingText' })
      if (wedding.gospel_reading.conclusion) {
        content.push({ text: wedding.gospel_reading.conclusion, style: 'conclusion' })
      }
      content.push({ text: 'People: Praise to you, Lord Jesus Christ.', style: 'response', margin: [0, 10, 0, 20] })
    } else {
      content.push({ text: 'None Selected', margin: [0, 5, 0, 20] })
    }

    // Page break before petitions
    content.push({ text: '', pageBreak: 'after' })

    // Petitions Section
    content.push({ text: 'Petitions', style: 'readingTitle' })
    if (petitionsReader) {
      content.push({ text: petitionsReader, style: 'readerName' })
    }

    content.push({ text: '', margin: [0, 0, 0, 10] })

    const petitionsContent: Content = [
      { text: 'Reader: The response is "Lord, hear our prayer." [Pause]', style: 'petition' },
      { text: `For ${brideName} and ${groomName}, joined now in marriage, that their love will grow and their commitment will deepen every day, let us pray to the Lord.`, style: 'petition' },
      { text: 'People: Lord, hear our prayer.', style: 'response', margin: [0, 5, 0, 10] },
      { text: `Reader: For the parents and grandparents of ${brideName} and ${groomName}, without whose dedication to God and family we would not be gathered here today, that they will be blessed as they gain a son or daughter, let us pray to the Lord.`, style: 'petition' },
      { text: 'People: Lord, hear our prayer.', style: 'response', margin: [0, 5, 0, 10] },
      { text: `Reader: For the families and friends of ${brideName} and ${groomName}, gathered here today, that they continue to enrich each other with love and support through the years, let us pray to the Lord.`, style: 'petition' },
      { text: 'People: Lord, hear our prayer.', style: 'response', margin: [0, 5, 0, 10] }
    ]

    customPetitions.forEach(petition => {
      petitionsContent.push(
        { text: `Reader: ${petition}, let us pray to the Lord.`, style: 'petition' },
        { text: 'People: Lord, hear our prayer.', style: 'response', margin: [0, 5, 0, 10] }
      )
    })

    content.push(...petitionsContent)

    // Announcements Section
    if (wedding.announcements) {
      content.push({ text: '', margin: [0, 0, 0, 20] })
      content.push({ text: 'Announcements', style: 'sectionTitle' })
      content.push({ text: wedding.announcements, style: 'readingText' })
    }

    // PDF Document definition
    const docDefinition: TDocumentDefinitions = {
      content,
      styles: {
        title: {
          fontSize: 20,
          bold: true,
          color: '#c41e3a'
        },
        subtitle: {
          fontSize: 14,
          color: '#666'
        },
        sectionTitle: {
          fontSize: 16,
          bold: true,
          color: '#c41e3a',
          margin: [0, 15, 0, 10]
        },
        readingTitle: {
          fontSize: 14,
          bold: true,
          color: '#c41e3a',
          margin: [0, 10, 0, 5]
        },
        pericope: {
          fontSize: 12,
          italics: true,
          color: '#c41e3a',
          margin: [0, 5, 0, 3]
        },
        readerName: {
          fontSize: 11,
          color: '#c41e3a',
          margin: [0, 0, 0, 10]
        },
        introduction: {
          fontSize: 11,
          italics: true,
          margin: [0, 5, 0, 5]
        },
        readingText: {
          fontSize: 11,
          lineHeight: 1.4,
          margin: [0, 5, 0, 5]
        },
        conclusion: {
          fontSize: 11,
          italics: true,
          margin: [0, 5, 0, 5]
        },
        response: {
          fontSize: 11,
          bold: true,
          margin: [0, 5, 0, 5]
        },
        priestDialogue: {
          fontSize: 11,
          margin: [0, 5, 0, 5]
        },
        petition: {
          fontSize: 11,
          lineHeight: 1.4,
          margin: [0, 5, 0, 5]
        }
      },
      pageMargins: [60, 60, 60, 60]
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
    const brideLastName = wedding.bride?.last_name || 'Bride'
    const groomLastName = wedding.groom?.last_name || 'Groom'
    const weddingDate = wedding.wedding_event?.start_date
      ? new Date(wedding.wedding_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    const filename = `${brideLastName}-${groomLastName}-${weddingDate}.pdf`

    // Return PDF
    return new NextResponse(pdfBuffer, {
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
