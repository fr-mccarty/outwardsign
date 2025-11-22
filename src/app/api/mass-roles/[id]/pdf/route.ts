import { NextRequest, NextResponse } from 'next/server'
import { getMassRoleWithRelations } from '@/lib/actions/mass-roles'
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

    // Build PDF content
    const content: Content[] = [
      // Title
      {
        text: massRole.name,
        style: 'title',
        alignment: 'center',
        margin: [0, 0, 0, 10]
      },
      // Subtitle
      {
        text: 'Member List',
        style: 'subtitle',
        alignment: 'center',
        margin: [0, 0, 0, 20]
      }
    ]

    // Description
    if (massRole.description) {
      content.push({
        text: massRole.description,
        italics: true,
        margin: [0, 0, 0, 15],
        color: '#333333'
      })
    }

    // Note
    if (massRole.note) {
      content.push({
        table: {
          widths: ['*'],
          body: [[{
            text: [
              { text: 'Note: ', bold: true },
              massRole.note
            ],
            fillColor: '#f9f9f9',
            margin: [5, 5, 5, 5]
          }]]
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 15]
      })
    }

    // Active Members Section
    content.push({
      text: `Active Members (${activeMembers.length})`,
      style: 'header',
      margin: [0, 15, 0, 10]
    })

    if (activeMembers.length === 0) {
      content.push({
        text: 'No active members assigned to this role.',
        margin: [0, 0, 0, 15]
      })
    } else {
      // Active members table
      const activeTableBody = [
        [
          { text: 'Name', bold: true },
          { text: 'Type', bold: true },
          { text: 'Email', bold: true },
          { text: 'Phone', bold: true }
        ],
        ...activeMembers.map(member => [
          member.person.full_name,
          {
            text: member.membership_type,
            fillColor: member.membership_type === 'LEADER' ? '#000000' : '#e0e0e0',
            color: member.membership_type === 'LEADER' ? '#ffffff' : '#000000'
          },
          member.person.email || '—',
          member.person.phone_number || '—'
        ])
      ]

      content.push({
        table: {
          headerRows: 1,
          widths: ['*', 'auto', '*', 'auto'],
          body: activeTableBody
        },
        layout: {
          fillColor: (rowIndex: number) => {
            return rowIndex === 0 ? '#f0f0f0' : null
          }
        },
        margin: [0, 0, 0, 20]
      })
    }

    // Inactive Members Section
    if (inactiveMembers.length > 0) {
      content.push({
        text: `Inactive Members (${inactiveMembers.length})`,
        style: 'header',
        margin: [0, 15, 0, 10],
        opacity: 0.6
      })

      const inactiveTableBody = [
        [
          { text: 'Name', bold: true },
          { text: 'Type', bold: true },
          { text: 'Email', bold: true },
          { text: 'Phone', bold: true }
        ],
        ...inactiveMembers.map(member => [
          member.person.full_name,
          member.membership_type,
          member.person.email || '—',
          member.person.phone_number || '—'
        ])
      ]

      content.push({
        table: {
          headerRows: 1,
          widths: ['*', 'auto', '*', 'auto'],
          body: inactiveTableBody
        },
        layout: {
          fillColor: (rowIndex: number) => {
            return rowIndex === 0 ? '#f0f0f0' : null
          }
        },
        opacity: 0.6,
        margin: [0, 0, 0, 20]
      })
    }

    // Footer
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    content.push({
      text: `Generated on ${currentDate}`,
      alignment: 'center',
      margin: [0, 30, 0, 0],
      fontSize: 10,
      color: '#666666'
    })

    // PDF Document definition
    const docDefinition: TDocumentDefinitions = {
      content,
      pageMargins: [72, 72, 72, 72],
      styles: {
        title: {
          fontSize: 20,
          bold: true
        },
        subtitle: {
          fontSize: 12,
          color: '#666666'
        },
        header: {
          fontSize: 16,
          bold: true
        }
      }
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
    const filename = `${massRole.name.replace(/\s+/g, '-')}-Members.pdf`

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
