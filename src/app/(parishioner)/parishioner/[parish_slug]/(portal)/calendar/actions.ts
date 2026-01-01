'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getParishionerSession } from '@/lib/parishioner-auth/actions'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'

export interface CalendarEvent {
  id: string
  type: 'parish' | 'liturgical' | 'assignment' | 'blackout'
  title: string
  date: string
  time?: string
  location?: string
  role?: string
  description?: string
}

/**
 * Fetch all calendar events for person (parish, liturgical, assignments, blackout dates)
 */
export async function getCalendarEvents(
  personId: string,
  startDate: string,
  endDate: string
): Promise<CalendarEvent[]> {
  // Verify session
  const session = await getParishionerSession()
  if (!session || session.personId !== personId) {
    console.error('Unauthorized access attempt to calendar events')
    return []
  }

  // Rate limiting check
  const rateLimitResult = rateLimit(`calendar:${personId}`, RATE_LIMITS.calendar)
  if (!rateLimitResult.success) {
    console.warn('Rate limit exceeded for calendar events:', personId)
    return []
  }

  const supabase = createAdminClient()
  const events: CalendarEvent[] = []

  try {
    // 1. Get person's family members
    const { data: familyMembers } = await supabase
      .from('family_members')
      .select('person_id')
      .eq('person_id', personId)

    const familyPersonIds = familyMembers?.map((fm) => fm.person_id) || []
    const allPersonIds = [personId, ...familyPersonIds]

    // 2. Get parish events (calendar_events where show_on_calendar = true)
    const { data: parishEvents } = await supabase
      .from('calendar_events')
      .select(`
        id,
        start_datetime,
        end_datetime,
        is_all_day,
        is_cancelled,
        location:locations (name),
        master_event:master_events (
          id,
          event_type:event_types (name)
        )
      `)
      .eq('parish_id', session.parishId)
      .eq('show_on_calendar', true)
      .eq('is_cancelled', false)
      .is('deleted_at', null)
      .gte('start_datetime', startDate)
      .lte('start_datetime', endDate)
      .order('start_datetime', { ascending: true })

    if (parishEvents) {
      for (const parishEvent of parishEvents) {
        const masterEvent = parishEvent.master_event as any
        const location = parishEvent.location as any
        const eventTypeName = masterEvent?.event_type?.name || 'Event'
        const eventStart = new Date(parishEvent.start_datetime)

        events.push({
          id: parishEvent.id,
          type: 'parish' as const,
          title: eventTypeName,
          date: eventStart.toISOString().split('T')[0],
          time: parishEvent.is_all_day ? undefined : eventStart.toTimeString().slice(0, 5),
          location: location?.name,
        })
      }
    }

    // 3. Get liturgical events
    const { data: liturgicalEvents } = await supabase
      .from('liturgical_calendar')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .eq('locale', 'en-US')

    if (liturgicalEvents) {
      events.push(
        ...liturgicalEvents.map((event) => ({
          id: event.id,
          type: 'liturgical' as const,
          title: event.name_en,
          date: event.date,
          description: event.type,
        }))
      )
    }

    // 4. Get mass assignments for person + family
    const { data: massAssignments } = await supabase
      .from('mass_assignments')
      .select(`
        id,
        role,
        mass:masses (
          id,
          date,
          time,
          name
        )
      `)
      .in('person_id', allPersonIds)

    if (massAssignments) {
      for (const assignment of massAssignments) {
        const mass = assignment.mass as any
        if (mass && mass.date >= startDate && mass.date <= endDate) {
          events.push({
            id: assignment.id,
            type: 'assignment' as const,
            title: `${mass.name || 'Mass'} - ${assignment.role}`,
            date: mass.date,
            time: mass.time,
            role: assignment.role,
          })
        }
      }
    }

    // 5. Get blackout dates for person
    const { data: blackoutDates } = await supabase
      .from('person_blackout_dates')
      .select('*')
      .eq('person_id', personId)
      .lte('start_date', endDate)
      .gte('end_date', startDate)

    if (blackoutDates) {
      for (const blackout of blackoutDates) {
        events.push({
          id: blackout.id,
          type: 'blackout' as const,
          title: 'Unavailable',
          date: blackout.start_date,
          description: blackout.reason || 'Blackout date',
        })
      }
    }

    // Sort events by date
    events.sort((a, b) => {
      const dateA = new Date(a.date + (a.time || ''))
      const dateB = new Date(b.date + (b.time || ''))
      return dateA.getTime() - dateB.getTime()
    })

    return events
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return []
  }
}
