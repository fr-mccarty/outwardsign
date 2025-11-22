import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getMassRoleWithRelations } from '@/lib/actions/mass-roles'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { id } = await params
    const massRole = await getMassRoleWithRelations(id)

    if (!massRole) {
      return new NextResponse('Mass role not found', { status: 404 })
    }

    // Build CSV content
    const headers = ['Name', 'Type', 'Status', 'Email', 'Phone', 'Notes']
    const rows = massRole.mass_role_members?.map(member => [
      member.person.full_name,
      member.membership_type,
      member.active ? 'Active' : 'Inactive',
      member.person.email || '',
      member.person.phone_number || '',
      member.notes || ''
    ]) || []

    // Format as CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // Escape cells that contain commas, quotes, or newlines
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          return `"${cell.replace(/"/g, '""')}"`
        }
        return cell
      }).join(','))
    ].join('\n')

    // Create response with CSV
    const filename = `${massRole.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_members.csv`

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Error generating mass role report:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
