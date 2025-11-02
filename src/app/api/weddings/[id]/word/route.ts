import { NextRequest, NextResponse } from 'next/server'
import { getWeddingWithRelations } from '@/lib/actions/weddings'
import { Document, Packer, Paragraph, TextRun, PageBreak, AlignmentType, HeadingLevel } from 'docx'

// Liturgy red color
const LITURGY_RED = 'c41e3a'

// Font family
const FONT_FAMILY = 'Helvetica'

// Spacing values in twentieths of a point (twips)
// 1 point = 20 twips, so 12pt = 240 twips
const SPACING = {
  small: 60,     // 3pt
  medium: 120,   // 6pt
  large: 180,    // 9pt
  xlarge: 240    // 12pt
}

// Paragraph spacing constants
const PARAGRAPH_SPACING = {
  before: 0,          // 3pt before paragraphs
  after: 80,          // 6pt after paragraphs
  afterResponse: 80,  // 9pt after responses
  beforeSection: 0,  // 12pt before section headers
  afterSection: 80    // 6pt after section headers
}

// Line spacing (within paragraphs)
// 276 = single spacing, 360 = 1.5 spacing, 480 = double spacing
const LINE_SPACING = 300  // Slightly more than single spacing

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
        children: [new TextRun({ font: FONT_FAMILY, text: weddingTitle, size: 36, bold: true })],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({ text: '' }), // Empty line for spacing
      new Paragraph({
        children: [new TextRun({ font: FONT_FAMILY, text: eventDateTime, size: 28 })],
        alignment: AlignmentType.CENTER
      }),
      new Paragraph({ text: '' }), // Empty line for spacing
      new Paragraph({ text: '' }) // Empty line for spacing
    )

    // ===== REHEARSAL SECTION =====
    if (wedding.rehearsal_event || wedding.rehearsal_dinner_event) {
      children.push(
        new Paragraph({
          children: [new TextRun({ font: FONT_FAMILY, text: 'Rehearsal', size: 28, bold: true })],
          spacing: { before: PARAGRAPH_SPACING.beforeSection, after: PARAGRAPH_SPACING.afterSection }
        })
      )

      if (wedding.rehearsal_event?.start_date) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ font: FONT_FAMILY, text: 'Rehearsal Date & Time: ', bold: true }),
              new TextRun({ font: FONT_FAMILY, text: formatEventDateTimeString(wedding.rehearsal_event) })
            ],
            spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
          })
        )
      }

      if (wedding.rehearsal_event?.location) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ font: FONT_FAMILY, text: 'Rehearsal Location: ', bold: true }),
              new TextRun({ font: FONT_FAMILY, text: wedding.rehearsal_event.location })
            ],
            spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
          })
        )
      }

      if (wedding.rehearsal_dinner_event?.location) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ font: FONT_FAMILY, text: 'Rehearsal Dinner Location: ', bold: true }),
              new TextRun({ font: FONT_FAMILY, text: wedding.rehearsal_dinner_event.location })
            ],
            spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
          })
        )
      }
    }

    // ===== WEDDING SECTION =====
    children.push(
      new Paragraph({
        children: [new TextRun({ font: FONT_FAMILY, text: 'Wedding', size: 28, bold: true })],
        spacing: { before: PARAGRAPH_SPACING.beforeSection, after: PARAGRAPH_SPACING.afterSection }
      })
    )

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
            new TextRun({ font: FONT_FAMILY, text: `${info.label} `, bold: true }),
            new TextRun({ font: FONT_FAMILY, text: info.value })
          ],
          spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
        })
      )
    })

    // ===== SACRED LITURGY SECTION =====
    children.push(
      new Paragraph({
        children: [new TextRun({ font: FONT_FAMILY, text: 'Sacred Liturgy', size: 28, bold: true })],
        spacing: { before: PARAGRAPH_SPACING.beforeSection, after: PARAGRAPH_SPACING.afterSection }
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
            new TextRun({ font: FONT_FAMILY, text: `${info.label} `, bold: true }),
            new TextRun({ font: FONT_FAMILY, text: info.value })
          ],
          spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
        })
      )
    })

    // ===== PAGE BREAK BEFORE READINGS =====
    children.push(new Paragraph({ children: [new PageBreak()] }))

    // ===== READINGS SECTION HEADER =====
    children.push(
      new Paragraph({
        children: [new TextRun({ font: FONT_FAMILY, text: weddingTitle, size: 36, bold: true })],
        alignment: AlignmentType.CENTER,
        spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before }
      }),
      new Paragraph({
        children: [new TextRun({ font: FONT_FAMILY, text: eventDateTime, size: 28 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: PARAGRAPH_SPACING.beforeSection, before: PARAGRAPH_SPACING.before }
      })
    )

    // ===== FIRST READING =====
    children.push(
      new Paragraph({
        children: [new TextRun({ font: FONT_FAMILY, text: 'FIRST READING', size: 28, bold: true, color: LITURGY_RED })],
        alignment: AlignmentType.RIGHT,
        spacing: { before: PARAGRAPH_SPACING.beforeSection, after: PARAGRAPH_SPACING.afterSection }
      })
    )

    if (wedding.first_reading) {
      children.push(
        new Paragraph({
          children: [new TextRun({ font: FONT_FAMILY, text: wedding.first_reading.pericope || 'No pericope', size: 28, bold: true, italics: true, color: LITURGY_RED })],
          alignment: AlignmentType.RIGHT,
          spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before }
        })
      )

      if (wedding.first_reader) {
        children.push(
          new Paragraph({
            children: [new TextRun({ font: FONT_FAMILY, text: formatPersonName(wedding.first_reader), size: 28, bold: true, color: LITURGY_RED })],
            alignment: AlignmentType.RIGHT,
            spacing: { after: PARAGRAPH_SPACING.afterResponse, before: PARAGRAPH_SPACING.before }
          })
        )
      }

      if (wedding.first_reading.introduction) {
        children.push(
          new Paragraph({
            children: [new TextRun({ font: FONT_FAMILY, text: wedding.first_reading.introduction, bold: true })],
            spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
          })
        )
      }

      children.push(
        new Paragraph({
          children: [new TextRun({ font: FONT_FAMILY, text: wedding.first_reading.text || 'No reading text' })],
          spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
        })
      )

      if (wedding.first_reading.conclusion) {
        children.push(
          new Paragraph({
            children: [new TextRun({ font: FONT_FAMILY, text: wedding.first_reading.conclusion, bold: true })],
            spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
          })
        )
      }

      children.push(
        new Paragraph({
          children: [
            new TextRun({ font: FONT_FAMILY, text: 'People: ', bold: true }),
            new TextRun({ font: FONT_FAMILY, text: 'Thanks be to God.', italics: true })
          ],
          spacing: { after: PARAGRAPH_SPACING.afterResponse, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
        })
      )
    } else {
      children.push(new Paragraph({ text: 'None Selected', spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before } }))
    }

    // ===== PAGE BREAK BEFORE PSALM =====
    if (wedding.psalm) {
      children.push(new Paragraph({ children: [new PageBreak()] }))
    }

    // ===== PSALM =====
    children.push(
      new Paragraph({
        children: [new TextRun({ font: FONT_FAMILY, text: 'Psalm', size: 28, bold: true, color: LITURGY_RED })],
        alignment: AlignmentType.RIGHT,
        spacing: { before: PARAGRAPH_SPACING.beforeSection, after: PARAGRAPH_SPACING.afterSection }
      })
    )

    if (wedding.psalm) {
      children.push(
        new Paragraph({
          children: [new TextRun({ font: FONT_FAMILY, text: wedding.psalm.pericope || 'No pericope', size: 28, bold: true, italics: true, color: LITURGY_RED })],
          alignment: AlignmentType.RIGHT,
          spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before }
        })
      )

      if (wedding.psalm_is_sung) {
        children.push(
          new Paragraph({
            children: [new TextRun({ font: FONT_FAMILY, text: 'Sung', size: 28, bold: true, color: LITURGY_RED })],
            alignment: AlignmentType.RIGHT,
            spacing: { after: PARAGRAPH_SPACING.afterResponse, before: PARAGRAPH_SPACING.before }
          })
        )
      } else if (wedding.psalm_reader) {
        children.push(
          new Paragraph({
            children: [new TextRun({ font: FONT_FAMILY, text: formatPersonName(wedding.psalm_reader), size: 28, bold: true, color: LITURGY_RED })],
            alignment: AlignmentType.RIGHT,
            spacing: { after: PARAGRAPH_SPACING.afterResponse, before: PARAGRAPH_SPACING.before }
          })
        )
      }

      if (wedding.psalm.introduction) {
        children.push(
          new Paragraph({
            children: [new TextRun({ font: FONT_FAMILY, text: wedding.psalm.introduction, bold: true })],
            spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
          })
        )
      }

      children.push(
        new Paragraph({
          children: [new TextRun({ font: FONT_FAMILY, text: wedding.psalm.text || 'No psalm text' })],
          spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
        })
      )

      if (wedding.psalm.conclusion) {
        children.push(
          new Paragraph({
            children: [new TextRun({ font: FONT_FAMILY, text: wedding.psalm.conclusion, bold: true })],
            spacing: { after: PARAGRAPH_SPACING.afterResponse, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
          })
        )
      }
    } else {
      children.push(new Paragraph({ text: 'None Selected', spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before } }))
    }

    // ===== PAGE BREAK BEFORE SECOND READING =====
    if (wedding.second_reading) {
      children.push(new Paragraph({ children: [new PageBreak()] }))
    }

    // ===== SECOND READING =====
    children.push(
      new Paragraph({
        children: [new TextRun({ font: FONT_FAMILY, text: 'Second Reading', size: 28, bold: true, color: LITURGY_RED })],
        alignment: AlignmentType.RIGHT,
        spacing: { before: PARAGRAPH_SPACING.beforeSection, after: PARAGRAPH_SPACING.afterSection }
      })
    )

    if (wedding.second_reading) {
      children.push(
        new Paragraph({
          children: [new TextRun({ font: FONT_FAMILY, text: wedding.second_reading.pericope || 'No pericope', size: 28, bold: true, italics: true, color: LITURGY_RED })],
          alignment: AlignmentType.RIGHT,
          spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before }
        })
      )

      if (wedding.second_reader) {
        children.push(
          new Paragraph({
            children: [new TextRun({ font: FONT_FAMILY, text: formatPersonName(wedding.second_reader), size: 28, bold: true, color: LITURGY_RED })],
            alignment: AlignmentType.RIGHT,
            spacing: { after: PARAGRAPH_SPACING.afterResponse, before: PARAGRAPH_SPACING.before }
          })
        )
      }

      if (wedding.second_reading.introduction) {
        children.push(
          new Paragraph({
            children: [new TextRun({ font: FONT_FAMILY, text: wedding.second_reading.introduction, bold: true })],
            spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
          })
        )
      }

      children.push(
        new Paragraph({
          children: [new TextRun({ font: FONT_FAMILY, text: wedding.second_reading.text || 'No reading text' })],
          spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
        })
      )

      if (wedding.second_reading.conclusion) {
        children.push(
          new Paragraph({
            children: [new TextRun({ font: FONT_FAMILY, text: wedding.second_reading.conclusion, bold: true })],
            spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
          })
        )
      }

      children.push(
        new Paragraph({
          children: [
            new TextRun({ font: FONT_FAMILY, text: 'People: ', bold: true }),
            new TextRun({ font: FONT_FAMILY, text: 'Thanks be to God.', italics: true })
          ],
          spacing: { after: PARAGRAPH_SPACING.afterResponse, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
        })
      )
    } else {
      children.push(new Paragraph({ text: 'None Selected', spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before } }))
    }

    // ===== PAGE BREAK BEFORE GOSPEL =====
    if (wedding.gospel_reading) {
      children.push(new Paragraph({ children: [new PageBreak()] }))
    }

    // ===== GOSPEL =====
    children.push(
      new Paragraph({
        children: [new TextRun({ font: FONT_FAMILY, text: 'Gospel', size: 28, bold: true, color: LITURGY_RED })],
        alignment: AlignmentType.RIGHT,
        spacing: { before: PARAGRAPH_SPACING.beforeSection, after: PARAGRAPH_SPACING.afterSection }
      })
    )

    if (wedding.gospel_reading) {
      children.push(
        new Paragraph({
          children: [new TextRun({ font: FONT_FAMILY, text: wedding.gospel_reading.pericope || 'No pericope', size: 28, bold: true, italics: true, color: LITURGY_RED })],
          alignment: AlignmentType.RIGHT,
          spacing: { after: PARAGRAPH_SPACING.afterResponse, before: PARAGRAPH_SPACING.before }
        })
      )

      children.push(
        new Paragraph({
          children: [new TextRun({ font: FONT_FAMILY, text: 'Priest: The Lord be with you.' })],
          spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
        }),
        new Paragraph({
          children: [
            new TextRun({ font: FONT_FAMILY, text: 'People: ', bold: true }),
            new TextRun({ font: FONT_FAMILY, text: 'And with your spirit.', italics: true })
          ],
          spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
        })
      )

      if (wedding.gospel_reading.introduction) {
        children.push(
          new Paragraph({
            children: [new TextRun({ font: FONT_FAMILY, text: wedding.gospel_reading.introduction, bold: true })],
            spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
          })
        )
      }

      children.push(
        new Paragraph({
          children: [new TextRun({ font: FONT_FAMILY, text: wedding.gospel_reading.text || 'No gospel text' })],
          spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
        })
      )

      if (wedding.gospel_reading.conclusion) {
        children.push(
          new Paragraph({
            children: [new TextRun({ font: FONT_FAMILY, text: wedding.gospel_reading.conclusion, bold: true })],
            spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
          })
        )
      }

      children.push(
        new Paragraph({
          children: [
            new TextRun({ font: FONT_FAMILY, text: 'People: ', bold: true }),
            new TextRun({ font: FONT_FAMILY, text: 'Praise to you, Lord Jesus Christ.', italics: true })
          ],
          spacing: { after: PARAGRAPH_SPACING.afterResponse, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
        })
      )
    } else {
      children.push(new Paragraph({ text: 'None Selected', spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before } }))
    }

    // ===== PAGE BREAK BEFORE PETITIONS =====
    children.push(new Paragraph({ children: [new PageBreak()] }))

    // ===== PETITIONS SECTION =====
    children.push(
      new Paragraph({
        children: [new TextRun({ font: FONT_FAMILY, text: 'Petitions', size: 28, bold: true, color: LITURGY_RED })],
        alignment: AlignmentType.RIGHT,
        spacing: { before: PARAGRAPH_SPACING.beforeSection, after: PARAGRAPH_SPACING.afterSection }
      })
    )

    if (petitionsReader) {
      children.push(
        new Paragraph({
          children: [new TextRun({ font: FONT_FAMILY, text: petitionsReader, size: 28, bold: true, color: LITURGY_RED })],
          alignment: AlignmentType.RIGHT,
          spacing: { after: PARAGRAPH_SPACING.afterResponse, before: PARAGRAPH_SPACING.before }
        })
      )
    }

    // Petitions
    children.push(
      new Paragraph({
        children: [
          new TextRun({ font: FONT_FAMILY, text: 'Reader: ', bold: true }),
          new TextRun({ font: FONT_FAMILY, text: 'The response is "Lord, hear our prayer." ', bold: true }),
          new TextRun({ font: FONT_FAMILY, text: '[Pause]', bold: true, color: LITURGY_RED })
        ],
        spacing: { after: 480, before: 240, line: LINE_SPACING }
      }),
      new Paragraph({
        children: [
          new TextRun({ font: FONT_FAMILY, text: 'Reader: ', bold: true }),
          new TextRun({ font: FONT_FAMILY, text: `For ${brideName} and ${groomName}, joined now in marriage, that their love will grow and their commitment will deepen every day, let us pray to the Lord.`, bold: true })
        ],
        spacing: { after: 480, before: 240, line: LINE_SPACING }
      }),
      new Paragraph({
        children: [
          new TextRun({ font: FONT_FAMILY, text: 'People: ', bold: true }),
          new TextRun({ font: FONT_FAMILY, text: 'Lord, hear our prayer.', italics: true })
        ],
        spacing: { after: 480, before: 240, line: LINE_SPACING }
      }),
      new Paragraph({
        children: [
          new TextRun({ font: FONT_FAMILY, text: 'Reader: ', bold: true }),
          new TextRun({ font: FONT_FAMILY, text: `For the parents and grandparents of ${brideName} and ${groomName}, without whose dedication to God and family we would not be gathered here today, that they will be blessed as they gain a son or daughter, let us pray to the Lord.`, bold: true })
        ],
        spacing: { after: 480, before: 240, line: LINE_SPACING }
      }),
      new Paragraph({
        children: [
          new TextRun({ font: FONT_FAMILY, text: 'People: ', bold: true }),
          new TextRun({ font: FONT_FAMILY, text: 'Lord, hear our prayer.', italics: true })
        ],
        spacing: { after: 480, before: 240, line: LINE_SPACING }
      }),
      new Paragraph({
        children: [
          new TextRun({ font: FONT_FAMILY, text: 'Reader: ', bold: true }),
          new TextRun({ font: FONT_FAMILY, text: `For the families and friends of ${brideName} and ${groomName}, gathered here today, that they continue to enrich each other with love and support through the years, let us pray to the Lord.`, bold: true })
        ],
        spacing: { after: 480, before: 240, line: LINE_SPACING }
      }),
      new Paragraph({
        children: [
          new TextRun({ font: FONT_FAMILY, text: 'People: ', bold: true }),
          new TextRun({ font: FONT_FAMILY, text: 'Lord, hear our prayer.', italics: true })
        ],
        spacing: { after: 480, before: 240, line: LINE_SPACING }
      })
    )

    // Custom petitions
    customPetitions.forEach(petition => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ font: FONT_FAMILY, text: 'Reader: ', bold: true }),
            new TextRun({ font: FONT_FAMILY, text: `${petition}, let us pray to the Lord.`, bold: true })
          ],
          spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
        }),
        new Paragraph({
          children: [
            new TextRun({ font: FONT_FAMILY, text: 'People: ', bold: true }),
            new TextRun({ font: FONT_FAMILY, text: 'Lord, hear our prayer.', italics: true })
          ],
          spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
        })
      )
    })

    // ===== ANNOUNCEMENTS SECTION =====
    if (wedding.announcements) {
      children.push(
        new Paragraph({
          children: [new TextRun({ font: FONT_FAMILY, text: 'Announcements', size: 28, bold: true })],
          spacing: { before: PARAGRAPH_SPACING.beforeSection, after: PARAGRAPH_SPACING.afterSection }
        }),
        new Paragraph({
          children: [new TextRun({ font: FONT_FAMILY, text: wedding.announcements })],
          spacing: { after: PARAGRAPH_SPACING.after, before: PARAGRAPH_SPACING.before, line: LINE_SPACING }
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
