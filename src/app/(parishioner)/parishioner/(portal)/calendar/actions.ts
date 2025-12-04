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

    // 2. Get parish events (via visibility settings)
    // TODO: Implement parish events fetching with visibility logic
    // For now, skip this to keep implementation simple

    // 3. Get liturgical events
    const { data: liturgicalEvents } = await supabase
      .from('global_liturgical_events')
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
          mass_type,
          location
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
            title: `${mass.mass_type || 'Mass'} - ${assignment.role}`,
            date: mass.date,
            time: mass.time,
            location: mass.location,
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
