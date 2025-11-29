import { NextResponse } from 'next/server'
import { getPeople } from '@/lib/actions/people'
import { createClient } from '@/lib/supabase/server'
import { toLocalDateString } from '@/lib/utils/formatters'

export async function GET() {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all people
    const people = await getPeople()

    // Define CSV headers
    const headers = [
      'First Name',
      'Last Name',
      'Email',
      'Phone Number',
      'Street',
      'City',
      'State',
      'Zipcode',
      'Sex',
      'Notes',
      'Created Date'
    ]

    // Convert people to CSV rows
    const csvRows = [
      headers.join(','), // Header row
      ...people.map(person => [
        escapeCSV(person.first_name),
        escapeCSV(person.last_name),
        escapeCSV(person.email || ''),
        escapeCSV(person.phone_number || ''),
        escapeCSV(person.street || ''),
        escapeCSV(person.city || ''),
        escapeCSV(person.state || ''),
        escapeCSV(person.zipcode || ''),
        escapeCSV(person.sex || ''),
        escapeCSV(person.note || ''),
        escapeCSV(new Date(person.created_at).toLocaleDateString())
      ].join(','))
    ]

    const csvContent = csvRows.join('\n')

    // Generate filename with current date
    const currentDate = toLocalDateString(new Date()).replace(/-/g, '')
    const filename = `people-${currentDate}.csv`

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

  } catch (error) {
    console.error('Error generating CSV:', error)
    return NextResponse.json({ error: 'Failed to generate CSV' }, { status: 500 })
  }
}

// Helper function to escape CSV values
function escapeCSV(value: string): string {
  if (value === null || value === undefined) {
    return ''
  }

  const stringValue = String(value)

  // If value contains comma, quote, or newline, wrap in quotes and escape existing quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}
