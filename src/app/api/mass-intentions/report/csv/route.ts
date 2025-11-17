import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getMassIntentionsByDateRange } from '@/lib/actions/mass-intentions'
import { formatDatePretty } from '@/lib/utils/date-format'
import { getStatusLabel } from '@/lib/content-builders/shared/helpers'

export async function GET(request: Request) {
  const supabase = await createClient()

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Get query parameters
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  if (!startDate || !endDate) {
    return new NextResponse('Start date and end date are required', { status: 400 })
  }

  try {
    const intentions = await getMassIntentionsByDateRange(startDate, endDate)

    // Build CSV content
    const headers = [
      'Mass Date',
      'Intention',
      'Requested By',
      'Stipend',
      'Status',
      'Date Received',
      'Date Requested',
      'Notes'
    ]

    const formatStipend = (cents: number | null | undefined) => {
      if (!cents) return '$0.00'
      return `$${(cents / 100).toFixed(2)}`
    }

    const escapeCSV = (value: string | null | undefined) => {
      if (!value) return ''
      // Escape double quotes and wrap in quotes if contains comma, newline, or quote
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }

    const rows = intentions.map(intention => [
      escapeCSV(intention.mass?.event?.start_date ? formatDatePretty(intention.mass.event.start_date) : 'N/A'),
      escapeCSV(intention.mass_offered_for || 'N/A'),
      escapeCSV(
        intention.requested_by
          ? `${intention.requested_by.first_name} ${intention.requested_by.last_name}`
          : 'N/A'
      ),
      formatStipend(intention.stipend_in_cents),
      escapeCSV(getStatusLabel(intention.status, 'en')),
      escapeCSV(intention.date_received ? formatDatePretty(intention.date_received) : 'N/A'),
      escapeCSV(intention.date_requested ? formatDatePretty(intention.date_requested) : 'N/A'),
      escapeCSV(intention.note || '')
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="mass-intentions-report-${startDate}-to-${endDate}.csv"`
      }
    })
  } catch (error) {
    console.error('Error generating CSV:', error)
    return new NextResponse('Failed to generate CSV', { status: 500 })
  }
}
