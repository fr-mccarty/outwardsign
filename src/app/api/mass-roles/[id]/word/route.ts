import { NextRequest, NextResponse } from 'next/server'
import { getMassRoleWithRelations } from '@/lib/actions/mass-roles'
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, TextRun, BorderStyle, ShadingType } from 'docx'
import { formatPersonName } from '@/lib/utils/formatters'
import { WORD_PAGE_MARGIN } from '@/lib/print-styles'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const massRole = await getMassRoleWithRelations(id)

    if (!massRole) {
      return NextResponse.json({ error: 'Mass role not found' }, { status: 404 })
    }

    // Separate active and inactive members
    const activeMembers = massRole.mass_role_members?.filter(m => m.active) || []
    const inactiveMembers = massRole.mass_role_members?.filter(m => !m.active) || []

    // Build Word document content
    const children: (Paragraph | Table)[] = []

    // Title
    children.push(
      new Paragraph({
        text: massRole.name,
        heading: 'Heading1',
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    )

    // Subtitle
    children.push(
      new Paragraph({
        text: 'Member List',
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        style: 'Subtitle'
      })
    )

    // Description
    if (massRole.description) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: massRole.description,
              italics: true,
              color: '333333'
            })
          ],
          spacing: { after: 300 }
        })
      )
    }

    // Note
    if (massRole.note) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Note: ',
              bold: true
            }),
            new TextRun({
              text: massRole.note
            })
          ],
          spacing: { after: 300 },
          shading: {
            type: ShadingType.SOLID,
            color: 'f9f9f9'
          }
        })
      )
    }

    // Active Members Section
    children.push(
      new Paragraph({
        text: `Active Members (${activeMembers.length})`,
        heading: 'Heading2',
        spacing: { before: 300, after: 200 }
      })
    )

    if (activeMembers.length === 0) {
      children.push(
        new Paragraph({
          text: 'No active members assigned to this role.',
          spacing: { after: 300 }
        })
      )
    } else {
      // Create active members table
      const activeTableRows = [
        // Header row
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Name', bold: true })] })],
              width: { size: 40, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.SOLID, color: 'f0f0f0' }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Type', bold: true })] })],
              width: { size: 15, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.SOLID, color: 'f0f0f0' }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Email', bold: true })] })],
              width: { size: 25, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.SOLID, color: 'f0f0f0' }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Phone', bold: true })] })],
              width: { size: 20, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.SOLID, color: 'f0f0f0' }
            })
          ]
        }),
        // Data rows
        ...activeMembers.map(member =>
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ text: formatPersonName(member.person) })]
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: member.membership_type,
                        bold: member.membership_type === 'LEADER'
                      })
                    ]
                  })
                ],
                shading: {
                  type: ShadingType.SOLID,
                  color: member.membership_type === 'LEADER' ? '000000' : 'e0e0e0'
                }
              }),
              new TableCell({
                children: [new Paragraph({ text: member.person.email || '—' })]
              }),
              new TableCell({
                children: [new Paragraph({ text: member.person.phone_number || '—' })]
              })
            ]
          })
        )
      ]

      children.push(
        new Table({
          rows: activeTableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: {
            top: 100,
            bottom: 100,
            left: 100,
            right: 100
          }
        })
      )

      children.push(new Paragraph({ text: '', spacing: { after: 400 } }))
    }

    // Inactive Members Section
    if (inactiveMembers.length > 0) {
      children.push(
        new Paragraph({
          text: `Inactive Members (${inactiveMembers.length})`,
          heading: 'Heading2',
          spacing: { before: 300, after: 200 }
        })
      )

      const inactiveTableRows = [
        // Header row
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Name', bold: true })] })],
              width: { size: 40, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.SOLID, color: 'f0f0f0' }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Type', bold: true })] })],
              width: { size: 15, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.SOLID, color: 'f0f0f0' }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Email', bold: true })] })],
              width: { size: 25, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.SOLID, color: 'f0f0f0' }
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Phone', bold: true })] })],
              width: { size: 20, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.SOLID, color: 'f0f0f0' }
            })
          ]
        }),
        // Data rows
        ...inactiveMembers.map(member =>
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ text: formatPersonName(member.person) })]
              }),
              new TableCell({
                children: [new Paragraph({ text: member.membership_type })]
              }),
              new TableCell({
                children: [new Paragraph({ text: member.person.email || '—' })]
              }),
              new TableCell({
                children: [new Paragraph({ text: member.person.phone_number || '—' })]
              })
            ]
          })
        )
      ]

      children.push(
        new Table({
          rows: inactiveTableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: {
            top: 100,
            bottom: 100,
            left: 100,
            right: 100
          }
        })
      )

      children.push(new Paragraph({ text: '', spacing: { after: 400 } }))
    }

    // Footer
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    children.push(
      new Paragraph({
        text: `Generated on ${currentDate}`,
        alignment: AlignmentType.CENTER,
        spacing: { before: 600 },
        style: 'Footer'
      })
    )

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
        children
      }]
    })

    // Generate Word document buffer
    const buffer = await Packer.toBuffer(doc)

    // Generate filename
    const filename = `${massRole.name.replace(/\s+/g, '-')}-Members.docx`

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
