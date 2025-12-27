/**
 * Special Liturgies Seed Data - Sample special liturgies for onboarding
 *
 * Creates sample special liturgies for new parishes:
 * - Baptisms (2)
 * - Quinceañeras (2)
 * - Presentations (2)
 *
 * Note: Weddings and Funerals are NOT seeded here. They are seeded by the
 * dev seeder (seed-weddings-funerals.ts) because they require readings from
 * the content library which is only available in development.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { logInfo, logSuccess, logWarning, logError } from '@/lib/utils/console'

interface SeedSpecialLiturgiesResult {
  success: boolean
  liturgiesCreated: number
}

interface LocationRefs {
  churchLocationId: string | null
  hallLocationId: string | null
  funeralHomeLocationId: string | null
}

/**
 * Seeds sample special liturgies for a new parish.
 *
 * @param supabase - Any Supabase client (server, service role, etc.)
 * @param parishId - The parish ID to seed data for
 * @param locations - Location references for assigning default locations
 */
export async function seedSpecialLiturgiesForParish(
  supabase: SupabaseClient,
  parishId: string,
  locations: LocationRefs
): Promise<SeedSpecialLiturgiesResult> {
  const { churchLocationId, hallLocationId } = locations

  logInfo('Creating sample special liturgies...')

  // Get special liturgy event types with their field definitions
  const { data: eventTypes, error: eventTypesError } = await supabase
    .from('event_types')
    .select(`
      id, slug, name,
      input_field_definitions!input_field_definitions_event_type_id_fkey(
        id, name, property_name, type, is_primary
      )
    `)
    .eq('parish_id', parishId)
    .in('slug', ['baptisms', 'quinceaneras', 'presentations'])
    .is('deleted_at', null)

  if (eventTypesError || !eventTypes) {
    logError(`Error fetching event types: ${eventTypesError?.message}`)
    return { success: false, liturgiesCreated: 0 }
  }

  // Get sample people for participants
  const { data: samplePeople, error: peopleError } = await supabase
    .from('people')
    .select('id, full_name')
    .eq('parish_id', parishId)
    .limit(10)

  if (peopleError) {
    logWarning('No sample people found - special liturgies will have empty participant fields')
  }

  const eventTypeMap = new Map(eventTypes.map(et => [et.slug, et]))
  let totalCreated = 0

  // Helper to get future date
  const getFutureDate = (daysFromNow: number) => {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    return date.toISOString()
  }

  // Helper to find primary calendar field
  const getPrimaryCalendarField = (eventType: typeof eventTypes[0]) => {
    return eventType.input_field_definitions?.find(
      f => f.type === 'calendar_event' && f.is_primary
    )
  }

  // Helper to create a liturgy
  const createLiturgy = async (
    eventType: typeof eventTypes[0],
    fieldValues: Record<string, unknown>,
    startDatetime: string,
    locationId: string | null,
    liturgicalColor: string = 'WHITE'
  ) => {
    const calendarField = getPrimaryCalendarField(eventType)
    if (!calendarField) {
      logWarning(`No primary calendar field for ${eventType.name}`)
      return false
    }

    // Create master_event
    const { data: masterEvent, error: masterError } = await supabase
      .from('master_events')
      .insert({
        parish_id: parishId,
        event_type_id: eventType.id,
        field_values: fieldValues,
        liturgical_color: liturgicalColor,
        status: 'ACTIVE'
      })
      .select()
      .single()

    if (masterError) {
      logError(`Error creating ${eventType.name}: ${masterError.message}`)
      return false
    }

    // Create calendar_event
    const { error: calendarError } = await supabase
      .from('calendar_events')
      .insert({
        parish_id: parishId,
        master_event_id: masterEvent.id,
        input_field_definition_id: calendarField.id,
        start_datetime: startDatetime,
        location_id: locationId,
        show_on_calendar: true,
        is_cancelled: false
      })

    if (calendarError) {
      logError(`Error creating calendar event for ${eventType.name}: ${calendarError.message}`)
      // Clean up orphaned master_event
      await supabase.from('master_events').delete().eq('id', masterEvent.id)
      return false
    }

    return true
  }

  // Get person IDs (or null if no people)
  const personIds = (samplePeople || []).map(p => p.id)
  const getPerson = (index: number) => personIds[index % personIds.length] || null

  // =====================================================
  // Baptisms (2)
  // =====================================================
  const baptismType = eventTypeMap.get('baptisms')
  if (baptismType && personIds.length > 0) {
    if (await createLiturgy(
      baptismType,
      { child: getPerson(0), mother: getPerson(1), father: getPerson(2), godmother: getPerson(3), godfather: getPerson(4) },
      getFutureDate(14),
      churchLocationId,
      'WHITE'
    )) totalCreated++

    if (await createLiturgy(
      baptismType,
      { child: getPerson(5), mother: getPerson(6), father: getPerson(7), godmother: getPerson(8), godfather: getPerson(9) },
      getFutureDate(28),
      churchLocationId,
      'WHITE'
    )) totalCreated++

    logSuccess('Created 2 Baptisms')
  }

  // =====================================================
  // Quinceañeras (2)
  // =====================================================
  const quinceaneraType = eventTypeMap.get('quinceaneras')
  if (quinceaneraType && personIds.length > 0) {
    if (await createLiturgy(
      quinceaneraType,
      { quinceanera: getPerson(0), mother: getPerson(1), father: getPerson(2), reception_location: hallLocationId },
      getFutureDate(60),
      churchLocationId,
      'WHITE'
    )) totalCreated++

    if (await createLiturgy(
      quinceaneraType,
      { quinceanera: getPerson(3), mother: getPerson(4), father: getPerson(5), reception_location: hallLocationId },
      getFutureDate(90),
      churchLocationId,
      'WHITE'
    )) totalCreated++

    logSuccess('Created 2 Quinceañeras')
  }

  // =====================================================
  // Presentations (2)
  // =====================================================
  const presentationType = eventTypeMap.get('presentations')
  if (presentationType && personIds.length > 0) {
    if (await createLiturgy(
      presentationType,
      { child: getPerson(0), mother: getPerson(1), father: getPerson(2), godmother: getPerson(3), godfather: getPerson(4) },
      getFutureDate(21),
      churchLocationId,
      'WHITE'
    )) totalCreated++

    if (await createLiturgy(
      presentationType,
      { child: getPerson(5), mother: getPerson(6), father: getPerson(7), godmother: getPerson(8), godfather: getPerson(9) },
      getFutureDate(35),
      churchLocationId,
      'WHITE'
    )) totalCreated++

    logSuccess('Created 2 Presentations')
  }

  // Note: Weddings and Funerals are seeded by dev seeder (seed-weddings-funerals.ts)
  // because they require readings from the content library.

  logSuccess(`Total special liturgies created: ${totalCreated}`)
  return { success: true, liturgiesCreated: totalCreated }
}
