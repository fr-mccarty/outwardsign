import { NextRequest, NextResponse } from 'next/server'
import { getWeddingWithRelations } from '@/lib/actions/weddings'
import { Document, Packer, Paragraph, TextRun } from 'docx'
import { createTextRun, paragraphStyles } from '@/lib/utils/word-styles'

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

    // Build document content
    const children: Paragraph[] = []

    // ===== TITLE AND DATE =====
    children.push(
      new Paragraph({
        children: [new TextRun(createTextRun.eventTitle(weddingTitle))],
        ...paragraphStyles.eventTitle()
      }),
      new Paragraph({
        children: [new TextRun(createTextRun.eventDateTime(eventDateTime))],
        ...paragraphStyles.eventDateTime()
      })
    )

    // ===== REHEARSAL SECTION =====
    if (wedding.rehearsal_event || wedding.rehearsal_dinner_event) {
      children.push(
        new Paragraph({
          children: [new TextRun(createTextRun.sectionTitle('Rehearsal'))],
          ...paragraphStyles.sectionTitle()
        })
      )

      if (wedding.rehearsal_event?.start_date) {
        children.push(
          new Paragraph({
            children: [
              new TextRun(createTextRun.infoLabel('Rehearsal Date & Time: ')),
              new TextRun(createTextRun.normal(formatEventDateTimeString(wedding.rehearsal_event)))
            ],
            ...paragraphStyles.infoItem()
          })
        )
      }

      if (wedding.rehearsal_event?.location) {
        children.push(
          new Paragraph({
            children: [
              new TextRun(createTextRun.infoLabel('Rehearsal Location: ')),
              new TextRun(createTextRun.normal(wedding.rehearsal_event.location))
            ],
            ...paragraphStyles.infoItem()
          })
        )
      }

      if (wedding.rehearsal_dinner_event?.location) {
        children.push(
          new Paragraph({
            children: [
              new TextRun(createTextRun.infoLabel('Rehearsal Dinner Location: ')),
              new TextRun(createTextRun.normal(wedding.rehearsal_dinner_event.location))
            ],
            ...paragraphStyles.infoItem()
          })
        )
      }
    }

    // ===== WEDDING SECTION =====
    children.push(
      new Paragraph({
        children: [new TextRun(createTextRun.sectionTitle('Wedding'))],
        ...paragraphStyles.sectionTitle()
      })
    )

    // Wedding info
    const weddingInfo: Array<{ label: string; value: string }> = []

    if (wedding.bride) weddingInfo.push({ label: 'Bride:', value: formatPersonWithPhone(wedding.bride) })
    if (wedding.groom) weddingInfo.push({ label: 'Groom:', value: formatPersonWithPhone(wedding.groom) })
    if (wedding.coordinator) weddingInfo.push({ label: 'Coordinator:', value: formatPersonName(wedding.coordinator) })
    if (wedding.presider) weddingInfo.push({ label: 'Presider:', value: formatPersonName(wedding.presider) })
    if (wedding.lead_musician) weddingInfo.push({ label: 'Lead Musician:', value: formatPersonName(wedding.lead_musician) })
    if (wedding.wedding_event?.location) weddingInfo.push({ label: 'Wedding Location:', value: wedding.wedding_event.location })
    if (wedding.reception_event?.location) weddingInfo.push({ label: 'Reception Location:', value: wedding.reception_event.location })
    if (wedding.witness_1) weddingInfo.push({ label: 'Best Man:', value: formatPersonName(wedding.witness_1) })
    if (wedding.witness_2) weddingInfo.push({ label: 'Maid/Matron of Honor:', value: formatPersonName(wedding.witness_2) })
    if (wedding.notes) weddingInfo.push({ label: 'Wedding Note:', value: wedding.notes })

    weddingInfo.forEach(info => {
      children.push(
        new Paragraph({
          children: [
            new TextRun(createTextRun.infoLabel(`${info.label} `)),
            new TextRun(createTextRun.normal(info.value))
          ],
          ...paragraphStyles.infoItem()
        })
      )
    })

    // ===== SACRED LITURGY SECTION =====
    children.push(
      new Paragraph({
        children: [new TextRun(createTextRun.sectionTitle('Sacred Liturgy'))],
        ...paragraphStyles.sectionTitle()
      })
    )

    const liturgyInfo: Array<{ label: string; value: string }> = []

    if (wedding.first_reading) liturgyInfo.push({ label: 'First Reading:', value: wedding.first_reading.pericope || '' })
    if (wedding.first_reader) liturgyInfo.push({ label: 'First Reading Lector:', value: formatPersonName(wedding.first_reader) })
    if (wedding.psalm) liturgyInfo.push({ label: 'Psalm:', value: wedding.psalm.pericope || '' })
    if (wedding.psalm_is_sung) {
      liturgyInfo.push({ label: 'Psalm Choice:', value: 'Sung' })
    } else if (wedding.psalm_reader) {
      liturgyInfo.push({ label: 'Psalm Lector:', value: formatPersonName(wedding.psalm_reader) })
    }
    if (wedding.second_reading) liturgyInfo.push({ label: 'Second Reading:', value: wedding.second_reading.pericope || '' })
    if (wedding.second_reader) liturgyInfo.push({ label: 'Second Reading Lector:', value: formatPersonName(wedding.second_reader) })
    if (wedding.gospel_reading) liturgyInfo.push({ label: 'Gospel Reading:', value: wedding.gospel_reading.pericope || '' })
    if (petitionsReader) liturgyInfo.push({ label: 'Petitions Read By:', value: petitionsReader })
    if (wedding.petitions) liturgyInfo.push({ label: 'Additional Petitions:', value: wedding.petitions })

    liturgyInfo.forEach(info => {
      children.push(
        new Paragraph({
          children: [
            new TextRun(createTextRun.infoLabel(`${info.label} `)),
            new TextRun(createTextRun.normal(info.value))
          ],
          ...paragraphStyles.infoItem()
        })
      )
    })

    // ===== PAGE BREAK BEFORE READINGS =====
    children.push(new Paragraph({ text: '', ...paragraphStyles.pageBreak() }))

    // ===== READINGS SECTION HEADER =====
    children.push(
      new Paragraph({
        children: [new TextRun(createTextRun.eventTitle(weddingTitle))],
        ...paragraphStyles.eventTitle()
      }),
      new Paragraph({
        children: [new TextRun(createTextRun.eventDateTime(eventDateTime))],
        ...paragraphStyles.eventDateTime()
      })
    )

    // ===== FIRST READING =====
    children.push(
      new Paragraph({
        children: [new TextRun(createTextRun.readingTitle('FIRST READING'))],
        ...paragraphStyles.readingTitle()
      })
    )

    if (wedding.first_reading) {
      children.push(
        new Paragraph({
          children: [new TextRun(createTextRun.pericope(wedding.first_reading.pericope || 'No pericope'))],
          ...paragraphStyles.pericope()
        })
      )

      if (wedding.first_reader) {
        children.push(
          new Paragraph({
            children: [new TextRun(createTextRun.readerName(formatPersonName(wedding.first_reader)))],
            ...paragraphStyles.readerName()
          })
        )
      }

      if (wedding.first_reading.introduction) {
        children.push(
          new Paragraph({
            children: [new TextRun(createTextRun.introduction(wedding.first_reading.introduction))],
            ...paragraphStyles.introduction()
          })
        )
      }

      children.push(
        new Paragraph({
          children: [new TextRun(createTextRun.text(wedding.first_reading.text || 'No reading text'))],
          ...paragraphStyles.text()
        })
      )

      if (wedding.first_reading.conclusion) {
        children.push(
          new Paragraph({
            children: [new TextRun(createTextRun.conclusion(wedding.first_reading.conclusion))],
            ...paragraphStyles.conclusion()
          })
        )
      }

      children.push(
        new Paragraph({
          children: [
            new TextRun(createTextRun.responseLabel('People: ')),
            new TextRun(createTextRun.response('Thanks be to God.'))
          ],
          ...paragraphStyles.response()
        })
      )
    } else {
      children.push(new Paragraph({ text: 'None Selected', ...paragraphStyles.text() }))
    }

    // ===== PSALM =====
    children.push(
      new Paragraph({
        children: [new TextRun(createTextRun.readingTitle('Psalm'))],
        ...paragraphStyles.readingTitle()
      })
    )

    if (wedding.psalm) {
      children.push(
        new Paragraph({
          children: [new TextRun(createTextRun.pericope(wedding.psalm.pericope || 'No pericope'))],
          ...paragraphStyles.pericope()
        })
      )

      if (wedding.psalm_is_sung) {
        children.push(
          new Paragraph({
            children: [new TextRun(createTextRun.readerName('Sung'))],
            ...paragraphStyles.readerName()
          })
        )
      } else if (wedding.psalm_reader) {
        children.push(
          new Paragraph({
            children: [new TextRun(createTextRun.readerName(formatPersonName(wedding.psalm_reader)))],
            ...paragraphStyles.readerName()
          })
        )
      }

      if (wedding.psalm.introduction) {
        children.push(
          new Paragraph({
            children: [new TextRun(createTextRun.introduction(wedding.psalm.introduction))],
            ...paragraphStyles.introduction()
          })
        )
      }

      children.push(
        new Paragraph({
          children: [new TextRun(createTextRun.text(wedding.psalm.text || 'No psalm text'))],
          ...paragraphStyles.text()
        })
      )

      if (wedding.psalm.conclusion) {
        children.push(
          new Paragraph({
            children: [new TextRun(createTextRun.conclusion(wedding.psalm.conclusion))],
            ...paragraphStyles.response()
          })
        )
      }
    } else {
      children.push(new Paragraph({ text: 'None Selected', ...paragraphStyles.text() }))
    }

    // ===== SECOND READING =====
    children.push(
      new Paragraph({
        children: [new TextRun(createTextRun.readingTitle('Second Reading'))],
        ...paragraphStyles.readingTitle()
      })
    )

    if (wedding.second_reading) {
      children.push(
        new Paragraph({
          children: [new TextRun(createTextRun.pericope(wedding.second_reading.pericope || 'No pericope'))],
          ...paragraphStyles.pericope()
        })
      )

      if (wedding.second_reader) {
        children.push(
          new Paragraph({
            children: [new TextRun(createTextRun.readerName(formatPersonName(wedding.second_reader)))],
            ...paragraphStyles.readerName()
          })
        )
      }

      if (wedding.second_reading.introduction) {
        children.push(
          new Paragraph({
            children: [new TextRun(createTextRun.introduction(wedding.second_reading.introduction))],
            ...paragraphStyles.introduction()
          })
        )
      }

      children.push(
        new Paragraph({
          children: [new TextRun(createTextRun.text(wedding.second_reading.text || 'No reading text'))],
          ...paragraphStyles.text()
        })
      )

      if (wedding.second_reading.conclusion) {
        children.push(
          new Paragraph({
            children: [new TextRun(createTextRun.conclusion(wedding.second_reading.conclusion))],
            ...paragraphStyles.conclusion()
          })
        )
      }

      children.push(
        new Paragraph({
          children: [
            new TextRun(createTextRun.responseLabel('People: ')),
            new TextRun(createTextRun.response('Thanks be to God.'))
          ],
          ...paragraphStyles.response()
        })
      )
    } else {
      children.push(new Paragraph({ text: 'None Selected', ...paragraphStyles.text() }))
    }

    // ===== GOSPEL =====
    children.push(
      new Paragraph({
        children: [new TextRun(createTextRun.readingTitle('Gospel'))],
        ...paragraphStyles.readingTitle()
      })
    )

    if (wedding.gospel_reading) {
      children.push(
        new Paragraph({
          children: [new TextRun(createTextRun.pericope(wedding.gospel_reading.pericope || 'No pericope'))],
          ...paragraphStyles.pericope()
        })
      )

      children.push(
        new Paragraph({
          children: [new TextRun(createTextRun.normal('Priest: The Lord be with you.'))],
          ...paragraphStyles.text()
        }),
        new Paragraph({
          children: [
            new TextRun(createTextRun.responseLabel('People: ')),
            new TextRun(createTextRun.response('And with your spirit.'))
          ],
          ...paragraphStyles.text()
        })
      )

      if (wedding.gospel_reading.introduction) {
        children.push(
          new Paragraph({
            children: [new TextRun(createTextRun.introduction(wedding.gospel_reading.introduction))],
            ...paragraphStyles.introduction()
          })
        )
      }

      children.push(
        new Paragraph({
          children: [new TextRun(createTextRun.text(wedding.gospel_reading.text || 'No gospel text'))],
          ...paragraphStyles.text()
        })
      )

      if (wedding.gospel_reading.conclusion) {
        children.push(
          new Paragraph({
            children: [new TextRun(createTextRun.conclusion(wedding.gospel_reading.conclusion))],
            ...paragraphStyles.conclusion()
          })
        )
      }

      children.push(
        new Paragraph({
          children: [
            new TextRun(createTextRun.responseLabel('People: ')),
            new TextRun(createTextRun.response('Praise to you, Lord Jesus Christ.'))
          ],
          ...paragraphStyles.response()
        })
      )
    } else {
      children.push(new Paragraph({ text: 'None Selected', ...paragraphStyles.text() }))
    }

    // ===== PAGE BREAK BEFORE PETITIONS =====
    children.push(new Paragraph({ text: '', ...paragraphStyles.pageBreak() }))

    // ===== PETITIONS SECTION =====
    children.push(
      new Paragraph({
        children: [new TextRun(createTextRun.readingTitle('Petitions'))],
        ...paragraphStyles.readingTitle()
      })
    )

    if (petitionsReader) {
      children.push(
        new Paragraph({
          children: [new TextRun(createTextRun.readerName(petitionsReader))],
          ...paragraphStyles.readerName()
        })
      )
    }

    // Petitions
    children.push(
      new Paragraph({
        children: [
          new TextRun(createTextRun.petitionReader('Reader: ')),
          new TextRun(createTextRun.petitionText('The response is "Lord, hear our prayer." ')),
          new TextRun(createTextRun.petitionPause('[Pause]'))
        ],
        ...paragraphStyles.petition()
      }),
      new Paragraph({
        children: [
          new TextRun(createTextRun.petitionReader('Reader: ')),
          new TextRun(createTextRun.petitionText(`For ${brideName} and ${groomName}, joined now in marriage, that their love will grow and their commitment will deepen every day, let us pray to the Lord.`))
        ],
        ...paragraphStyles.petition()
      }),
      new Paragraph({
        children: [
          new TextRun(createTextRun.responseLabel('People: ')),
          new TextRun(createTextRun.response('Lord, hear our prayer.'))
        ],
        ...paragraphStyles.text()
      }),
      new Paragraph({
        children: [
          new TextRun(createTextRun.petitionReader('Reader: ')),
          new TextRun(createTextRun.petitionText(`For the parents and grandparents of ${brideName} and ${groomName}, without whose dedication to God and family we would not be gathered here today, that they will be blessed as they gain a son or daughter, let us pray to the Lord.`))
        ],
        ...paragraphStyles.petition()
      }),
      new Paragraph({
        children: [
          new TextRun(createTextRun.responseLabel('People: ')),
          new TextRun(createTextRun.response('Lord, hear our prayer.'))
        ],
        ...paragraphStyles.text()
      }),
      new Paragraph({
        children: [
          new TextRun(createTextRun.petitionReader('Reader: ')),
          new TextRun(createTextRun.petitionText(`For the families and friends of ${brideName} and ${groomName}, gathered here today, that they continue to enrich each other with love and support through the years, let us pray to the Lord.`))
        ],
        ...paragraphStyles.petition()
      }),
      new Paragraph({
        children: [
          new TextRun(createTextRun.responseLabel('People: ')),
          new TextRun(createTextRun.response('Lord, hear our prayer.'))
        ],
        ...paragraphStyles.text()
      })
    )

    // Custom petitions
    customPetitions.forEach(petition => {
      children.push(
        new Paragraph({
          children: [
            new TextRun(createTextRun.petitionReader('Reader: ')),
            new TextRun(createTextRun.petitionText(`${petition}, let us pray to the Lord.`))
          ],
          ...paragraphStyles.petition()
        }),
        new Paragraph({
          children: [
            new TextRun(createTextRun.responseLabel('People: ')),
            new TextRun(createTextRun.response('Lord, hear our prayer.'))
          ],
          ...paragraphStyles.text()
        })
      )
    })

    // ===== ANNOUNCEMENTS SECTION =====
    if (wedding.announcements) {
      children.push(
        new Paragraph({
          children: [new TextRun(createTextRun.sectionTitle('Announcements'))],
          spacing: { before: 400, after: 200 }
        }),
        new Paragraph({
          children: [new TextRun(createTextRun.text(wedding.announcements))],
          ...paragraphStyles.text()
        })
      )
    }

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children
      }]
    })

    // Generate Word document buffer
    const buffer = await Packer.toBuffer(doc)

    // Generate filename
    const brideLastName = wedding.bride?.last_name || 'Bride'
    const groomLastName = wedding.groom?.last_name || 'Groom'
    const weddingDate = wedding.wedding_event?.start_date
      ? new Date(wedding.wedding_event.start_date).toISOString().split('T')[0].replace(/-/g, '')
      : 'NoDate'
    const filename = `${brideLastName}-${groomLastName}-${weddingDate}.docx`

    // Return Word document
    return new NextResponse(buffer, {
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
