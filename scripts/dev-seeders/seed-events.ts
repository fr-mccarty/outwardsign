/**
 * Dev Seeder: Sample Dynamic Events
 *
 * Creates 2 sample events for each event type (Weddings, Funerals, Baptisms, etc.)
 * Uses the unified event model: master_events + calendar_events
 */

import type { DevSeederContext } from './types'
import { logSuccess, logWarning, logInfo, logError } from '../../src/lib/utils/console'

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
    if (eventType.slug === 'other' || eventType.slug === 'sunday-mass' || eventType.slug === 'daily-mass') {
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
      occasion: { date: string; time: string; location_id: string | null }
    }> = []

    switch (eventType.slug) {
      case 'weddings':
        eventsData.push({
          field_values: {
            'Bride': people[1].id,
            'Groom': people[0].id,
            'Presider': people[8].id,
            'Reception Location': hallLocation?.id || '',
            'First Reading': 'Genesis 2:18-24',
            'Gospel Reading': 'John 2:1-11',
            'Unity Candle': true,
            'Special Instructions': 'Traditional ceremony with bilingual readings'
          },
          occasion: { date: getFutureDate(45), time: '14:00:00', location_id: churchLocation?.id || null }
        })
        eventsData.push({
          field_values: {
            'Bride': people[3].id,
            'Groom': people[2].id,
            'Presider': people[8].id,
            'Reception Location': hallLocation?.id || '',
            'First Reading': '1 Corinthians 13:1-13',
            'Gospel Reading': 'Matthew 19:3-6',
            'Unity Candle': false
          },
          occasion: { date: getFutureDate(90), time: '11:00:00', location_id: churchLocation?.id || null }
        })
        break

      case 'funerals':
        eventsData.push({
          field_values: {
            'Deceased': people[10].id,
            'Date of Death': getPastDate(3),
            'Presider': people[8].id,
            'Burial Location': funeralHomeLocation?.id || '',
            'First Reading': 'Wisdom 3:1-9',
            'Psalm': 'Psalm 23',
            'Gospel Reading': 'John 14:1-6',
            'Eulogy Speaker': people[11].id
          },
          occasion: { date: getFutureDate(2), time: '10:00:00', location_id: churchLocation?.id || null }
        })
        eventsData.push({
          field_values: {
            'Deceased': people[12].id,
            'Date of Death': getPastDate(1),
            'Presider': people[8].id,
            'First Reading': 'Romans 8:31-39',
            'Psalm': 'Psalm 116',
            'Gospel Reading': 'John 11:17-27'
          },
          occasion: { date: getFutureDate(5), time: '11:00:00', location_id: churchLocation?.id || null }
        })
        break

      case 'baptisms':
        eventsData.push({
          field_values: {
            'Child': people[4].id,
            'Mother': people[5].id,
            'Father': people[6].id,
            'Godmother': people[7].id,
            'Godfather': people[8].id,
            'Presider': people[0].id
          },
          occasion: { date: getFutureDate(14), time: '13:00:00', location_id: churchLocation?.id || null }
        })
        eventsData.push({
          field_values: {
            'Child': people[9].id,
            'Mother': people[13].id,
            'Father': people[14].id,
            'Godmother': people[15].id,
            'Godfather': people[16].id,
            'Presider': people[0].id
          },
          occasion: { date: getFutureDate(21), time: '14:00:00', location_id: churchLocation?.id || null }
        })
        break

      case 'quinceaneras':
        eventsData.push({
          field_values: {
            'Quinceañera': people[5].id,
            'Mother': people[3].id,
            'Father': people[6].id,
            'Presider': people[0].id,
            'Reception Location': hallLocation?.id || ''
          },
          occasion: { date: getFutureDate(60), time: '15:00:00', location_id: churchLocation?.id || null }
        })
        eventsData.push({
          field_values: {
            'Quinceañera': people[7].id,
            'Mother': people[11].id,
            'Father': people[10].id,
            'Presider': people[8].id,
            'Reception Location': hallLocation?.id || ''
          },
          occasion: { date: getFutureDate(75), time: '16:00:00', location_id: churchLocation?.id || null }
        })
        break

      case 'presentations':
        eventsData.push({
          field_values: {
            'Child': people[4].id,
            'Mother': people[1].id,
            'Father': people[0].id,
            'Godmother': people[3].id,
            'Godfather': people[2].id,
            'Presider': people[8].id
          },
          occasion: { date: getFutureDate(30), time: '12:00:00', location_id: churchLocation?.id || null }
        })
        eventsData.push({
          field_values: {
            'Child': people[9].id,
            'Mother': people[15].id,
            'Father': people[16].id,
            'Godmother': people[17].id,
            'Godfather': people[18].id,
            'Presider': people[0].id
          },
          occasion: { date: getFutureDate(35), time: '11:30:00', location_id: churchLocation?.id || null }
        })
        break

      // =====================================================
      // Parish Events (system_type: 'event')
      // =====================================================

      case 'bible-studies':
        eventsData.push({
          field_values: {
            'Discussion Leader': people[0].id,
            'Topic': 'The Gospel of John',
            'Scripture Passage': 'John 1:1-18',
            'Expected Attendance': '15'
          },
          occasion: { date: getFutureDate(7), time: '19:00:00', location_id: hallLocation?.id || null }
        })
        eventsData.push({
          field_values: {
            'Discussion Leader': people[8].id,
            'Topic': 'The Beatitudes',
            'Scripture Passage': 'Matthew 5:1-12',
            'Expected Attendance': '20'
          },
          occasion: { date: getFutureDate(14), time: '19:00:00', location_id: hallLocation?.id || null }
        })
        break

      case 'fundraisers':
        eventsData.push({
          field_values: {
            'Event Coordinator': people[5].id,
            'Event Description': 'Annual parish picnic and silent auction to support youth ministry programs.',
            'Fundraising Goal': '5000'
          },
          occasion: { date: getFutureDate(60), time: '11:00:00', location_id: hallLocation?.id || null }
        })
        eventsData.push({
          field_values: {
            'Event Coordinator': people[11].id,
            'Event Description': 'Pancake breakfast fundraiser for the building fund.',
            'Fundraising Goal': '2000'
          },
          occasion: { date: getFutureDate(21), time: '08:00:00', location_id: hallLocation?.id || null }
        })
        break

      case 'religious-education':
        eventsData.push({
          field_values: {
            'Catechist': people[3].id,
            'Grade Level': 'First Communion',
            'Lesson Topic': 'Sacraments of Initiation - Lesson 5'
          },
          occasion: { date: getFutureDate(5), time: '10:00:00', location_id: hallLocation?.id || null }
        })
        eventsData.push({
          field_values: {
            'Catechist': people[7].id,
            'Grade Level': 'Confirmation',
            'Lesson Topic': 'The Gifts of the Holy Spirit'
          },
          occasion: { date: getFutureDate(12), time: '18:30:00', location_id: hallLocation?.id || null }
        })
        break

      case 'staff-meetings':
        eventsData.push({
          field_values: {
            'Meeting Leader': people[0].id,
            'Agenda': 'Monthly staff meeting to review parish activities and upcoming events. Please bring your department reports.'
          },
          occasion: { date: getFutureDate(3), time: '09:00:00', location_id: hallLocation?.id || null }
        })
        eventsData.push({
          field_values: {
            'Meeting Leader': people[8].id,
            'Agenda': 'Liturgy planning meeting for Advent season. Music ministry and lectors should attend.'
          },
          occasion: { date: getFutureDate(10), time: '14:00:00', location_id: hallLocation?.id || null }
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
          status: 'ACTIVE'
        })
        .select()
        .single()

      if (eventError) {
        logError(`Error creating ${eventType.name} event: ${eventError.message}`)
        continue
      }

      // Create calendar_event with correct schema
      const startDatetime = new Date(`${eventData.occasion.date}T${eventData.occasion.time}`).toISOString()
      const { error: calendarEventError } = await supabase
        .from('calendar_events')
        .insert({
          parish_id: parishId,
          master_event_id: newEvent.id,
          input_field_definition_id: primaryCalendarEventField.id,
          start_datetime: startDatetime,
          location_id: eventData.occasion.location_id,
          is_primary: true,
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
