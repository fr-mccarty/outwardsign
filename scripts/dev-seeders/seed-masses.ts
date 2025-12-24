/**
 * Dev Seeder: Sample Masses
 *
 * Creates 20 sample Masses (8 Sunday, 12 Daily) using the unified event model.
 * Uses master_events + calendar_events tables (NOT the legacy masses table).
 * Mass event types are created by the onboarding seeder.
 *
 * Also assigns ministers to each Mass using people_event_assignments:
 * - Template-level: presider, homilist (calendar_event_id = NULL)
 * - Occurrence-level: lector, emhc, altar_server, cantor, usher (calendar_event_id populated)
 */

import type { DevSeederContext } from './types'
import { logSuccess, logWarning, logInfo, logError } from '../../src/lib/utils/console'
import { LITURGICAL_COLOR_VALUES, type LiturgicalColor } from '../../src/lib/constants'

// Create a lookup object for liturgical colors from the constants array
const COLORS = LITURGICAL_COLOR_VALUES.reduce((acc, color) => {
  acc[color] = color
  return acc
}, {} as Record<LiturgicalColor, LiturgicalColor>)

// Type for input field definitions
interface InputFieldDef {
  id: string
  type: string
  property_name: string
  is_primary: boolean
  is_per_calendar_event: boolean
  deleted_at: string | null
}

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
    return (eventType.input_field_definitions as InputFieldDef[]).find(
      (field) => field.type === 'calendar_event' && field.is_primary && !field.deleted_at
    )
  }

  // Helper to get person-type field definitions for an event type
  const getPersonFields = (eventType: typeof sundayMassEventType) => {
    if (!eventType?.input_field_definitions) return []
    return (eventType.input_field_definitions as InputFieldDef[]).filter(
      (field) => field.type === 'person' && !field.deleted_at
    )
  }

  // Helper to randomly pick a person from the list
  const getRandomPerson = (index: number, offset = 0) => {
    return people![(index + offset) % people!.length]
  }

  const massesToCreate: Array<{
    date: string
    time: string
    eventType: typeof sundayMassEventType
    fieldValues: Record<string, string>
    liturgicalColor?: string
  }> = []

  // Create 8 Sunday Masses (next 8 weeks)
  // Use property_name values as keys (not display names)
  // Liturgical colors: green (ordinary time), purple (advent/lent), white (easter/christmas), red (pentecost/martyrs)
  if (sundayMassEventType) {
    for (let week = 0; week < 8; week++) {
      const massDate = getSundayDate(week)
      // Rotate through colors to show variety (in real usage, this would come from liturgical calendar)
      const colors = [COLORS.GREEN, COLORS.GREEN, COLORS.GREEN, COLORS.WHITE, COLORS.GREEN, COLORS.GREEN, COLORS.RED, COLORS.GREEN]
      massesToCreate.push({
        date: massDate,
        time: '10:00:00',
        eventType: sundayMassEventType,
        liturgicalColor: colors[week],
        fieldValues: {
          announcements: week % 2 === 0
            ? `Parish Picnic next Sunday after all Masses. Bring a side dish to share! Sign up in the parish hall.`
            : `Faith Formation registration is now open. Please visit the parish office or register online.`,
          entrance_hymn: ['Holy God We Praise Thy Name', 'All Are Welcome', 'Here I Am Lord', 'Amazing Grace'][week % 4],
          offertory_hymn: ['We Bring the Sacrifice of Praise', 'Take and Eat', 'Gift of Finest Wheat', 'Come to the Feast'][week % 4],
          communion_hymn: ['I Am the Bread of Life', 'One Bread One Body', 'Eat This Bread', 'Here Is My Body'][week % 4],
          recessional_hymn: ['Go Make a Difference', 'City of God', 'We Are Called', 'Go Forth'][week % 4],
          mass_intentions: people[week % 10] ? `For the repose of the soul of ${people[week % 10].first_name} ${people[week % 10].last_name}` : 'For the intentions of the parish',
          special_instructions: week === 0 ? 'First Sunday of the month - Children\'s Mass' : ''
        }
      })
    }
  }

  // Create 12 Daily Masses (next 12 weekdays)
  // Use property_name values as keys (not display names)
  // Daily Masses typically use green (ordinary time) unless a feast day
  if (dailyMassEventType) {
    let dayCount = 0
    for (let day = 1; day <= 20 && dayCount < 12; day++) {
      const date = new Date()
      date.setDate(date.getDate() + day)
      const dayOfWeek = date.getDay()

      // Skip Sundays (0) and Saturdays (6)
      if (dayOfWeek === 0 || dayOfWeek === 6) continue

      const massDate = date.toISOString().split('T')[0]
      // Mostly green with occasional white/red for feast days
      const colors = [COLORS.GREEN, COLORS.GREEN, COLORS.WHITE, COLORS.GREEN, COLORS.GREEN, COLORS.RED, COLORS.GREEN, COLORS.GREEN, COLORS.GREEN, COLORS.WHITE, COLORS.GREEN, COLORS.GREEN]
      massesToCreate.push({
        date: massDate,
        time: '08:00:00',
        eventType: dailyMassEventType,
        liturgicalColor: colors[dayCount],
        fieldValues: {
          mass_intentions: people[dayCount % 10] ? `For ${people[dayCount % 10].first_name} ${people[dayCount % 10].last_name} - Birthday blessings` : 'For vocations to the priesthood',
          special_instructions: ''
        }
      })
      dayCount++
    }
  }

  // Insert Masses using unified event model
  let massesCreatedCount = 0
  for (const massData of massesToCreate) {
    if (!massData.eventType) continue

    const primaryCalendarEventField = getPrimaryCalendarEventField(massData.eventType)
    if (!primaryCalendarEventField) {
      logError(`No primary calendar_event field found for ${massData.eventType.name}`)
      continue
    }

    // Create master_event
    const { data: newMasterEvent, error: masterEventError } = await supabase
      .from('master_events')
      .insert({
        parish_id: parishId,
        event_type_id: massData.eventType.id,
        field_values: massData.fieldValues,
        liturgical_color: massData.liturgicalColor || null,
        status: 'ACTIVE'
      })
      .select()
      .single()

    if (masterEventError) {
      logError(`Error creating master_event for ${massData.date}: ${masterEventError.message}`)
      continue
    }

    // Create calendar_event linked to the master_event
    const startDatetime = new Date(`${massData.date}T${massData.time}`).toISOString()
    const { data: newCalendarEvent, error: calendarEventError } = await supabase
      .from('calendar_events')
      .insert({
        parish_id: parishId,
        master_event_id: newMasterEvent.id,
        input_field_definition_id: primaryCalendarEventField.id,
        start_datetime: startDatetime,
        location_id: churchLocation.id,
        show_on_calendar: true,
        is_cancelled: false
      })
      .select()
      .single()

    if (calendarEventError || !newCalendarEvent) {
      logError(`Error creating calendar_event for ${massData.date}: ${calendarEventError?.message}`)
      // Clean up the orphaned master_event
      await supabase.from('master_events').delete().eq('id', newMasterEvent.id)
      continue
    }

    massesCreatedCount++

    // Assign ministers using people_event_assignments
    const personFields = getPersonFields(massData.eventType)
    const assignments: Array<{
      master_event_id: string
      calendar_event_id: string | null
      field_definition_id: string
      person_id: string
    }> = []

    for (let fieldIndex = 0; fieldIndex < personFields.length; fieldIndex++) {
      const field = personFields[fieldIndex]
      const person = getRandomPerson(massesCreatedCount, fieldIndex)

      assignments.push({
        master_event_id: newMasterEvent.id,
        // Template-level (presider, homilist) = NULL, Occurrence-level = calendar_event_id
        calendar_event_id: field.is_per_calendar_event ? newCalendarEvent.id : null,
        field_definition_id: field.id,
        person_id: person.id
      })
    }

    if (assignments.length > 0) {
      const { error: assignmentError } = await supabase
        .from('people_event_assignments')
        .insert(assignments)

      if (assignmentError) {
        logWarning(`Error creating assignments for Mass ${massData.date}: ${assignmentError.message}`)
      }
    }
  }

  const sundayCount = massesToCreate.filter(m => m.eventType?.slug === 'sunday-mass').length
  const dailyCount = massesToCreate.filter(m => m.eventType?.slug === 'daily-mass').length
  logSuccess(`Created ${massesCreatedCount} sample Masses (${sundayCount} Sunday, ${dailyCount} Daily) with minister assignments`)

  return { success: true }
}
