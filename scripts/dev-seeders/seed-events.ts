/**
 * Dev Seeder: Sample Dynamic Events
 *
 * Creates sample events for each event type (Baptisms, Quinceaneras, Parish Events, etc.)
 * Uses the unified event model: master_events + calendar_events
 *
 * NOTE: Weddings and Funerals are handled by seed-weddings-funerals.ts with readings.
 *
 * HOW EVENTS ARE CREATED:
 * =======================
 * 1. Fetches all event_types with their input_field_definitions
 * 2. For each event type, creates master_events with field_values
 * 3. Creates calendar_events linked to the primary calendar_event field
 *
 * FIELD_VALUES STRUCTURE:
 * -----------------------
 * The field_values JSONB column stores values keyed by property_name:
 * - Person fields: Store person ID (UUID)
 * - Text fields: Store string value
 * - Location fields: Store location ID (UUID)
 * - Content fields: Store content ID (UUID)
 *
 * EXAMPLE:
 * --------
 * {
 *   "child": "uuid-of-child",
 *   "mother": "uuid-of-mother",
 *   "father": "uuid-of-father",
 *   "presider": "uuid-of-presider"
 * }
 *
 * HOW TO FIND EVENTS:
 * -------------------
 * 1. Query master_events by event_type_id
 * 2. Join with calendar_events for date/time/location
 * 3. Look up field_values keys in input_field_definitions to understand the data
 */

import type { DevSeederContext } from './types'
import { logSuccess, logWarning, logInfo, logError } from '../../src/lib/utils/console'
import { LITURGICAL_COLOR_VALUES, type LiturgicalColor } from '../../src/lib/constants'

// Create a lookup object for liturgical colors from the constants array
const COLORS = LITURGICAL_COLOR_VALUES.reduce((acc, color) => {
  acc[color] = color
  return acc
}, {} as Record<LiturgicalColor, LiturgicalColor>)

interface LocationRefs {
  churchLocation: { id: string } | null
  hallLocation: { id: string } | null
  funeralHomeLocation: { id: string } | null
}

interface InputFieldDefinition {
  id: string
  name: string
  type: string
  is_primary: boolean
  deleted_at: string | null
}

export async function seedEvents(
  ctx: DevSeederContext,
  people: Array<{ id: string }> | null,
  locations: LocationRefs
) {
  const { supabase, parishId } = ctx
  const { churchLocation, hallLocation, funeralHomeLocation } = locations

  logInfo('')
  logInfo('Creating sample events for each event type...')

  // Fetch all event types with their input field definitions
  const { data: eventTypes } = await supabase
    .from('event_types')
    .select('*, input_field_definitions!input_field_definitions_event_type_id_fkey(*)')
    .eq('parish_id', parishId)
    .is('deleted_at', null)
    .order('order')

  if (!eventTypes || eventTypes.length === 0) {
    logWarning('No event types found, skipping event creation')
    return { success: false }
  }

  if (!people || people.length < 10) {
    logWarning('Not enough people to create events, skipping event creation')
    return { success: false }
  }

  const getFutureDate = (daysFromNow: number) => {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    return date.toISOString().split('T')[0]
  }

  const getPastDate = (daysAgo: number) => {
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    return date.toISOString().split('T')[0]
  }

  // Helper to find the primary calendar_event field for an event type
  const getPrimaryCalendarEventField = (eventType: { input_field_definitions?: InputFieldDefinition[] }) => {
    if (!eventType?.input_field_definitions) return null
    return eventType.input_field_definitions.find(
      (field: InputFieldDefinition) =>
        field.type === 'calendar_event' && field.is_primary && !field.deleted_at
    )
  }

  let totalEventsCreated = 0

  for (const eventType of eventTypes) {
    // Skip generic types and Mass types (handled by seed-masses)
    // Skip weddings and funerals (handled by seed-weddings-funerals with readings)
    if (
      eventType.slug === 'other' ||
      eventType.slug === 'sunday-mass' ||
      eventType.slug === 'daily-mass' ||
      eventType.slug === 'weddings' ||
      eventType.slug === 'funerals'
    ) {
      continue
    }

    // Get the primary calendar_event field for this event type
    const primaryCalendarEventField = getPrimaryCalendarEventField(eventType)
    if (!primaryCalendarEventField) {
      logWarning(`No primary calendar_event field for ${eventType.name}, skipping`)
      continue
    }

    const eventsData: Array<{
      field_values: Record<string, string | boolean>
      calendar_event: { date: string; time: string; location_id: string | null }
      liturgicalColor?: string
    }> = []

    // Use property_name values as keys (not display names)
    // Note: weddings and funerals are handled by seed-weddings-funerals.ts
    switch (eventType.slug) {
      case 'baptisms':
        eventsData.push({
          field_values: {
            child: people[4].id,
            mother: people[5].id,
            father: people[6].id,
            godmother: people[7].id,
            godfather: people[8].id,
            presider: people[0].id
          },
          calendar_event: { date: getFutureDate(14), time: '13:00:00', location_id: churchLocation?.id || null },
          liturgicalColor: COLORS.WHITE // Baptisms use white vestments
        })
        eventsData.push({
          field_values: {
            child: people[9].id,
            mother: people[13].id,
            father: people[14].id,
            godmother: people[15].id,
            godfather: people[16].id,
            presider: people[0].id
          },
          calendar_event: { date: getFutureDate(21), time: '14:00:00', location_id: churchLocation?.id || null },
          liturgicalColor: COLORS.WHITE
        })
        break

      case 'quinceaneras':
        eventsData.push({
          field_values: {
            quinceanera: people[5].id,
            mother: people[3].id,
            father: people[6].id,
            presider: people[0].id,
            reception_location: hallLocation?.id || ''
          },
          calendar_event: { date: getFutureDate(60), time: '15:00:00', location_id: churchLocation?.id || null },
          liturgicalColor: COLORS.WHITE // Quinceaneras typically use white
        })
        eventsData.push({
          field_values: {
            quinceanera: people[7].id,
            mother: people[11].id,
            father: people[10].id,
            presider: people[8].id,
            reception_location: hallLocation?.id || ''
          },
          calendar_event: { date: getFutureDate(75), time: '16:00:00', location_id: churchLocation?.id || null },
          liturgicalColor: COLORS.WHITE
        })
        break

      case 'presentations':
        eventsData.push({
          field_values: {
            child: people[4].id,
            mother: people[1].id,
            father: people[0].id,
            godmother: people[3].id,
            godfather: people[2].id,
            presider: people[8].id
          },
          calendar_event: { date: getFutureDate(30), time: '12:00:00', location_id: churchLocation?.id || null },
          liturgicalColor: COLORS.WHITE // Presentations use white vestments
        })
        eventsData.push({
          field_values: {
            child: people[9].id,
            mother: people[15].id,
            father: people[16].id,
            godmother: people[17].id,
            godfather: people[18].id,
            presider: people[0].id
          },
          calendar_event: { date: getFutureDate(35), time: '11:30:00', location_id: churchLocation?.id || null },
          liturgicalColor: COLORS.WHITE
        })
        break

      // =====================================================
      // Parish Events (system_type: 'event')
      // =====================================================

      case 'bible-studies':
        eventsData.push({
          field_values: {
            discussion_leader: people[0].id,
            topic: 'The Gospel of John',
            scripture_passage: 'John 1:1-18',
            expected_attendance: '15'
          },
          calendar_event: { date: getFutureDate(7), time: '19:00:00', location_id: hallLocation?.id || null }
        })
        eventsData.push({
          field_values: {
            discussion_leader: people[8].id,
            topic: 'The Beatitudes',
            scripture_passage: 'Matthew 5:1-12',
            expected_attendance: '20'
          },
          calendar_event: { date: getFutureDate(14), time: '19:00:00', location_id: hallLocation?.id || null }
        })
        break

      case 'fundraisers':
        eventsData.push({
          field_values: {
            event_coordinator: people[5].id,
            event_description: 'Annual parish picnic and silent auction to support youth ministry programs.',
            fundraising_goal: '5000'
          },
          calendar_event: { date: getFutureDate(60), time: '11:00:00', location_id: hallLocation?.id || null }
        })
        eventsData.push({
          field_values: {
            event_coordinator: people[11].id,
            event_description: 'Pancake breakfast fundraiser for the building fund.',
            fundraising_goal: '2000'
          },
          calendar_event: { date: getFutureDate(21), time: '08:00:00', location_id: hallLocation?.id || null }
        })
        break

      case 'religious-education':
        eventsData.push({
          field_values: {
            catechist: people[3].id,
            grade_level: 'First Communion',
            lesson_topic: 'Sacraments of Initiation - Lesson 5'
          },
          calendar_event: { date: getFutureDate(5), time: '10:00:00', location_id: hallLocation?.id || null }
        })
        eventsData.push({
          field_values: {
            catechist: people[7].id,
            grade_level: 'Confirmation',
            lesson_topic: 'The Gifts of the Holy Spirit'
          },
          calendar_event: { date: getFutureDate(12), time: '18:30:00', location_id: hallLocation?.id || null }
        })
        break

      case 'staff-meetings':
        eventsData.push({
          field_values: {
            meeting_leader: people[0].id,
            agenda: 'Monthly staff meeting to review parish activities and upcoming events. Please bring your department reports.'
          },
          calendar_event: { date: getFutureDate(3), time: '09:00:00', location_id: hallLocation?.id || null }
        })
        eventsData.push({
          field_values: {
            meeting_leader: people[8].id,
            agenda: 'Liturgy planning meeting for Advent season. Music ministry and lectors should attend.'
          },
          calendar_event: { date: getFutureDate(10), time: '14:00:00', location_id: hallLocation?.id || null }
        })
        break

      default:
        continue
    }

    // Insert events and calendar events using unified model
    for (const eventData of eventsData) {
      // Create master_event with ACTIVE status (so they show in list views)
      const { data: newEvent, error: eventError } = await supabase
        .from('master_events')
        .insert({
          parish_id: parishId,
          event_type_id: eventType.id,
          field_values: eventData.field_values,
          liturgical_color: eventData.liturgicalColor || null,
          status: 'ACTIVE'
        })
        .select()
        .single()

      if (eventError) {
        logError(`Error creating ${eventType.name} event: ${eventError.message}`)
        continue
      }

      // Create calendar_event with correct schema
      const startDatetime = new Date(`${eventData.calendar_event.date}T${eventData.calendar_event.time}`).toISOString()
      const { error: calendarEventError } = await supabase
        .from('calendar_events')
        .insert({
          parish_id: parishId,
          master_event_id: newEvent.id,
          input_field_definition_id: primaryCalendarEventField.id,
          start_datetime: startDatetime,
          location_id: eventData.calendar_event.location_id,
          show_on_calendar: true,
          is_cancelled: false
        })

      if (calendarEventError) {
        logError(`Error creating calendar_event for ${eventType.name}: ${calendarEventError.message}`)
        // Clean up the orphaned master_event
        await supabase.from('master_events').delete().eq('id', newEvent.id)
        continue
      }

      totalEventsCreated++
    }

    logSuccess(`Created 2 ${eventType.name} events`)
  }

  logSuccess(`Total events created: ${totalEventsCreated}`)
  return { success: true }
}
