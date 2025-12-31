import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Public Calendar Feed (.ics)
 *
 * Returns an iCalendar feed of future events for event types
 * that have show_on_public_calendar enabled.
 *
 * URL: /api/calendar/[parish_id]
 * Content-Type: text/calendar
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ parish_id: string }> }
) {
  const { parish_id } = await params

  // Use service role to bypass RLS for public calendar access
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get parish info for calendar name
  const { data: parish, error: parishError } = await supabase
    .from('parishes')
    .select('id, name, city, state')
    .eq('id', parish_id)
    .is('deleted_at', null)
    .single()

  if (parishError || !parish) {
    return new NextResponse('Parish not found', { status: 404 })
  }

  // Get future calendar events for event types with show_on_public_calendar = true
  const now = new Date().toISOString()

  const { data: calendarEvents, error: eventsError } = await supabase
    .from('calendar_events')
    .select(`
      id,
      start_datetime,
      end_datetime,
      is_all_day,
      is_cancelled,
      location:locations(name, street, city, state),
      master_event:master_events!inner(
        id,
        name,
        parish_event:parish_events!inner(
          id,
          event_type:event_types!inner(
            id,
            name,
            show_on_public_calendar
          )
        )
      )
    `)
    .eq('parish_id', parish_id)
    .eq('show_on_calendar', true)
    .is('deleted_at', null)
    .gte('start_datetime', now)
    .order('start_datetime', { ascending: true })

  if (eventsError) {
    console.error('Error fetching calendar events:', eventsError)
    return new NextResponse('Error fetching events', { status: 500 })
  }

  // Filter to only events with show_on_public_calendar = true
  const publicEvents = (calendarEvents || []).filter((event: any) => {
    return event.master_event?.parish_event?.event_type?.show_on_public_calendar === true
  })

  // Generate .ics content
  const icsContent = generateICS(parish, publicEvents)

  return new NextResponse(icsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${parish.name.replace(/[^a-zA-Z0-9]/g, '-')}.ics"`,
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
    },
  })
}

/**
 * Generate iCalendar (.ics) content
 */
function generateICS(
  parish: { id: string; name: string; city: string; state: string | null },
  events: any[]
): string {
  const lines: string[] = []

  // Calendar header
  lines.push('BEGIN:VCALENDAR')
  lines.push('VERSION:2.0')
  lines.push(`PRODID:-//Outward Sign//${parish.name}//EN`)
  lines.push(`X-WR-CALNAME:${escapeICS(parish.name)}`)
  lines.push('CALSCALE:GREGORIAN')
  lines.push('METHOD:PUBLISH')

  // Add each event
  for (const event of events) {
    const eventLines = generateEventICS(event)
    lines.push(...eventLines)
  }

  // Calendar footer
  lines.push('END:VCALENDAR')

  return lines.join('\r\n')
}

/**
 * Generate VEVENT block for a single calendar event
 */
function generateEventICS(event: any): string[] {
  const lines: string[] = []

  const masterEvent = event.master_event
  const eventType = masterEvent?.parish_event?.event_type
  const location = event.location

  // Event title: "Event Type Name: Event Name" or just "Event Name"
  const title = masterEvent?.name || eventType?.name || 'Event'

  // UID must be globally unique
  const uid = `${event.id}@outwardsign.church`

  // Timestamps
  const created = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const startDate = new Date(event.start_datetime)
  const endDate = event.end_datetime
    ? new Date(event.end_datetime)
    : new Date(startDate.getTime() + 60 * 60 * 1000) // Default 1 hour duration

  lines.push('BEGIN:VEVENT')
  lines.push(`UID:${uid}`)
  lines.push(`DTSTAMP:${created}`)

  if (event.is_all_day) {
    // All-day events use DATE format (no time)
    lines.push(`DTSTART;VALUE=DATE:${formatDateOnly(startDate)}`)
    if (event.end_datetime) {
      lines.push(`DTEND;VALUE=DATE:${formatDateOnly(endDate)}`)
    }
  } else {
    // Timed events use full datetime
    lines.push(`DTSTART:${formatDateTime(startDate)}`)
    lines.push(`DTEND:${formatDateTime(endDate)}`)
  }

  lines.push(`SUMMARY:${escapeICS(title)}`)

  // Location
  if (location) {
    const locationParts = [location.name]
    if (location.street) locationParts.push(location.street)
    if (location.city) locationParts.push(location.city)
    if (location.state) locationParts.push(location.state)
    lines.push(`LOCATION:${escapeICS(locationParts.join(', '))}`)
  }

  // Status
  if (event.is_cancelled) {
    lines.push('STATUS:CANCELLED')
  } else {
    lines.push('STATUS:CONFIRMED')
  }

  lines.push('END:VEVENT')

  return lines
}

/**
 * Format date for all-day events (YYYYMMDD)
 */
function formatDateOnly(date: Date): string {
  return date.toISOString().split('T')[0].replace(/-/g, '')
}

/**
 * Format datetime for timed events (YYYYMMDDTHHMMSSZ)
 */
function formatDateTime(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

/**
 * Escape special characters for iCalendar format
 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}
