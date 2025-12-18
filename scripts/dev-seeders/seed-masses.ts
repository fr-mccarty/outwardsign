/**
 * Dev Seeder: Sample Masses
 *
 * Creates 20 sample Masses (8 Sunday, 12 Daily) using the unified event model.
 * Uses master_events + calendar_events tables (NOT the legacy masses table).
 * Mass event types are created by the onboarding seeder.
 */

import type { DevSeederContext } from './types'
import { logSuccess, logWarning, logInfo, logError } from '../../src/lib/utils/console'

export async function seedMasses(
  ctx: DevSeederContext,
  people: Array<{ id: string; first_name: string; last_name: string }> | null,
  churchLocation: { id: string } | null
) {
  const { supabase, parishId } = ctx

  // Fetch Mass event types with their input field definitions
  const { data: massEventTypes } = await supabase
    .from('event_types')
    .select('id, name, slug, input_field_definitions!input_field_definitions_event_type_id_fkey(*)')
    .eq('parish_id', parishId)
    .in('slug', ['sunday-mass', 'daily-mass'])
    .is('deleted_at', null)

  const sundayMassEventType = massEventTypes?.find(et => et.slug === 'sunday-mass') || null
  const dailyMassEventType = massEventTypes?.find(et => et.slug === 'daily-mass') || null

  if (!sundayMassEventType && !dailyMassEventType) {
    logWarning('No Mass event types found - skipping Mass creation')
    return { success: false }
  }

  if (!people || people.length === 0) {
    logWarning('No people found - skipping Mass creation')
    return { success: false }
  }

  if (!churchLocation) {
    logWarning('No church location found - skipping Mass creation')
    return { success: false }
  }

  logInfo('')
  logInfo('Creating 20 sample Masses...')

  // Helper to get future date
  const getMassDate = (daysFromNow: number) => {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    return date.toISOString().split('T')[0]
  }

  // Get Sunday dates
  const getSundayDate = (weeksFromNow: number) => {
    const date = new Date()
    const dayOfWeek = date.getDay()
    const daysUntilSunday = (7 - dayOfWeek) % 7
    date.setDate(date.getDate() + daysUntilSunday + (weeksFromNow * 7))
    return date.toISOString().split('T')[0]
  }

  // Helper to find the primary calendar_event field for an event type
  const getPrimaryCalendarEventField = (eventType: typeof sundayMassEventType) => {
    if (!eventType?.input_field_definitions) return null
    return eventType.input_field_definitions.find(
      (field: { type: string; is_primary: boolean; deleted_at: string | null }) =>
        field.type === 'calendar_event' && field.is_primary && !field.deleted_at
    )
  }

  const massesToCreate: Array<{
    date: string
    time: string
    eventType: typeof sundayMassEventType
    fieldValues: Record<string, string>
  }> = []

  // Create 8 Sunday Masses (next 8 weeks)
  if (sundayMassEventType) {
    for (let week = 0; week < 8; week++) {
      const massDate = getSundayDate(week)
      massesToCreate.push({
        date: massDate,
        time: '10:00:00',
        eventType: sundayMassEventType,
        fieldValues: {
          'Announcements': week % 2 === 0
            ? `Parish Picnic next Sunday after all Masses. Bring a side dish to share! Sign up in the parish hall.`
            : `Faith Formation registration is now open. Please visit the parish office or register online.`,
          'Entrance Hymn': ['Holy God We Praise Thy Name', 'All Are Welcome', 'Here I Am Lord', 'Amazing Grace'][week % 4],
          'Offertory Hymn': ['We Bring the Sacrifice of Praise', 'Take and Eat', 'Gift of Finest Wheat', 'Come to the Feast'][week % 4],
          'Communion Hymn': ['I Am the Bread of Life', 'One Bread One Body', 'Eat This Bread', 'Here Is My Body'][week % 4],
          'Recessional Hymn': ['Go Make a Difference', 'City of God', 'We Are Called', 'Go Forth'][week % 4],
          'Mass Intentions': people[week % 10] ? `For the repose of the soul of ${people[week % 10].first_name} ${people[week % 10].last_name}` : 'For the intentions of the parish',
          'Special Instructions': week === 0 ? 'First Sunday of the month - Children\'s Mass' : ''
        }
      })
    }
  }

  // Create 12 Daily Masses (next 12 weekdays)
  if (dailyMassEventType) {
    let dayCount = 0
    for (let day = 1; day <= 20 && dayCount < 12; day++) {
      const date = new Date()
      date.setDate(date.getDate() + day)
      const dayOfWeek = date.getDay()

      // Skip Sundays (0) and Saturdays (6)
      if (dayOfWeek === 0 || dayOfWeek === 6) continue

      const massDate = date.toISOString().split('T')[0]
      massesToCreate.push({
        date: massDate,
        time: '08:00:00',
        eventType: dailyMassEventType,
        fieldValues: {
          'Mass Intentions': people[dayCount % 10] ? `For ${people[dayCount % 10].first_name} ${people[dayCount % 10].last_name} - Birthday blessings` : 'For vocations to the priesthood',
          'Special Instructions': ''
        }
      })
      dayCount++
    }
  }

  // Fetch liturgical events to link some Masses
  const { data: liturgicalEvents } = await supabase
    .from('global_liturgical_events')
    .select('id, date, name')
    .gte('date', getMassDate(0))
    .lte('date', getMassDate(60))
    .order('date')
    .limit(20)

  // Insert Masses using unified event model
  let massesCreatedCount = 0
  for (const massData of massesToCreate) {
    if (!massData.eventType) continue

    const primaryCalendarEventField = getPrimaryCalendarEventField(massData.eventType)
    if (!primaryCalendarEventField) {
      logError(`No primary calendar_event field found for ${massData.eventType.name}`)
      continue
    }

    const matchingLiturgicalEvent = liturgicalEvents?.find(le => le.date === massData.date)

    // Create master_event
    const { data: newMasterEvent, error: masterEventError } = await supabase
      .from('master_events')
      .insert({
        parish_id: parishId,
        event_type_id: massData.eventType.id,
        field_values: massData.fieldValues,
        presider_id: people[0].id
      })
      .select()
      .single()

    if (masterEventError) {
      logError(`Error creating master_event for ${massData.date}: ${masterEventError.message}`)
      continue
    }

    // Create calendar_event linked to the master_event
    const startDatetime = new Date(`${massData.date}T${massData.time}`).toISOString()
    const { error: calendarEventError } = await supabase
      .from('calendar_events')
      .insert({
        parish_id: parishId,
        master_event_id: newMasterEvent.id,
        input_field_definition_id: primaryCalendarEventField.id,
        start_datetime: startDatetime,
        location_id: churchLocation.id,
        is_primary: true,
        is_cancelled: false
      })

    if (calendarEventError) {
      logError(`Error creating calendar_event for ${massData.date}: ${calendarEventError.message}`)
      // Clean up the orphaned master_event
      await supabase.from('master_events').delete().eq('id', newMasterEvent.id)
      continue
    }

    massesCreatedCount++

    // Log liturgical event connection if applicable
    if (matchingLiturgicalEvent) {
      // Note: Liturgical event linking could be added to field_values or a separate table
      // For now, just counting successful creations
    }
  }

  const sundayCount = massesToCreate.filter(m => m.eventType?.slug === 'sunday-mass').length
  const dailyCount = massesToCreate.filter(m => m.eventType?.slug === 'daily-mass').length
  logSuccess(`Created ${massesCreatedCount} sample Masses (${sundayCount} Sunday, ${dailyCount} Daily)`)

  return { success: true }
}
