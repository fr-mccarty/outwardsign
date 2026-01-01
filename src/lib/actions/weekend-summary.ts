'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { getMasses, getMassRoles } from './mass-liturgies'
import type { MassWithNames, ParishEventRoleWithRelations } from '@/lib/schemas/mass-liturgies'
import { toLocalDateString } from '@/lib/utils/formatters'

// Sacrament event interface for weekend summary
export interface SacramentEvent {
  id: string
  eventType: string       // "Wedding", "Baptism", "Funeral", etc.
  eventTypeSlug: string   // "wedding", "baptism", "funeral"
  title: string           // Dynamic title from key persons (e.g., "Smith-Johnson")
  startDatetime: string   // ISO datetime
  location?: string
}

export interface WeekendSummaryParams {
  sundayDate: string // ISO date string (YYYY-MM-DD)
  includeSacraments: boolean
  includeMasses: boolean
  includeMassRoles: boolean
}

export interface WeekendSummaryData {
  sundayDate: string
  saturdayDate: string

  // Sacraments from dynamic events system
  sacraments: SacramentEvent[]

  // Masses
  masses: MassWithNames[]

  // Mass Roles (grouped by mass)
  massRoles: {
    massId: string
    massTitle: string
    roles: ParishEventRoleWithRelations[]
  }[]
}

/**
 * Fetches all weekend data (Saturday through Sunday) based on the selected Sunday date
 */
export async function getWeekendSummaryData(
  params: WeekendSummaryParams
): Promise<WeekendSummaryData> {
  await requireSelectedParish()
  await ensureJWTClaims()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _supabase = await createClient()

  // Calculate Saturday (day before Sunday)
  const sunday = new Date(params.sundayDate + 'T00:00:00')
  const saturday = new Date(sunday)
  saturday.setDate(saturday.getDate() - 1)

  const saturdayDate = toLocalDateString(saturday)
  const sundayDate = params.sundayDate

  // Initialize result
  const result: WeekendSummaryData = {
    sundayDate,
    saturdayDate,
    sacraments: [],
    masses: [],
    massRoles: []
  }

  // Fetch sacraments from dynamic events system
  if (params.includeSacraments) {
    const supabase = await createClient()

    // Get special-liturgy and parish-event types that occur on the weekend
    const { data: calendarEvents } = await supabase
      .from('calendar_events')
      .select(`
        id,
        start_datetime,
        location:locations (name),
        master_event:master_events!inner (
          id,
          field_values,
          event_type:event_types!inner (
            id,
            name,
            slug,
            system_type,
            input_field_definitions (
              id,
              name,
              property_name,
              type,
              is_key_person
            )
          )
        )
      `)
      .gte('start_datetime', `${saturdayDate}T00:00:00`)
      .lte('start_datetime', `${sundayDate}T23:59:59`)
      .eq('show_on_calendar', true)
      .eq('is_cancelled', false)
      .is('deleted_at', null)
      .in('master_event.event_type.system_type', ['special-liturgy', 'parish-event'])
      .order('start_datetime', { ascending: true })

    if (calendarEvents) {
      for (const event of calendarEvents) {
        const masterEvent = event.master_event as any
        const eventType = masterEvent?.event_type
        const location = event.location as any

        if (!eventType) continue

        // Build title from key person fields
        const keyPersonFields = eventType.input_field_definitions?.filter(
          (f: any) => f.is_key_person && f.type === 'person'
        ) || []

        let title = ''
        if (keyPersonFields.length > 0 && masterEvent.field_values) {
          // For now, just use the field values directly
          // In a full implementation, we'd resolve person IDs to names
          const keyNames: string[] = []
          for (const field of keyPersonFields) {
            const personId = masterEvent.field_values[field.property_name]
            if (personId) {
              // We'd need to resolve person names here - for now use a placeholder
              keyNames.push(field.name)
            }
          }
          title = keyNames.join('-')
        }

        result.sacraments.push({
          id: event.id,
          eventType: eventType.name,
          eventTypeSlug: eventType.slug,
          title: title || eventType.name,
          startDatetime: event.start_datetime,
          location: location?.name,
        })
      }
    }
  }

  // Fetch masses if requested
  if (params.includeMasses) {
    const masses = await getMasses({
      start_date: saturdayDate,
      end_date: sundayDate
    })

    result.masses = masses.filter(m => {
      // Extract date portion from primary_calendar_event's start_datetime
      const startDatetime = m.primary_calendar_event?.start_datetime
      if (!startDatetime) return false
      const eventDate = startDatetime.split('T')[0] // Get YYYY-MM-DD from ISO datetime
      return eventDate === saturdayDate || eventDate === sundayDate
    })
  }

  // Fetch mass roles if requested
  if (params.includeMassRoles && result.masses.length > 0) {
    // Get role assignments for each mass
    const massRolePromises = result.masses.map(async (mass) => {
      const roles = await getMassRoles(mass.id)
      // Build mass title from primary calendar event datetime
      const startDatetime = mass.primary_calendar_event?.start_datetime
      const massTitle = startDatetime
        ? new Date(startDatetime).toLocaleString()
        : 'Unknown date'
      return {
        massId: mass.id,
        massTitle,
        roles
      }
    })

    result.massRoles = await Promise.all(massRolePromises)
  }

  return result
}
