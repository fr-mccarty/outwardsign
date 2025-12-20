/**
 * Dev Seeder: Weddings and Funerals
 *
 * Creates sample Wedding and Funeral events with readings assigned
 * from the content library.
 *
 * Each event includes:
 * - first_reading (content ID)
 * - psalm (content ID)
 * - second_reading (content ID)
 * - gospel_reading (content ID)
 *
 * HOW READINGS ARE SELECTED:
 * ==========================
 * Readings are fetched from the content library by querying tag_assignments:
 * 1. Find content tagged with the sacrament (e.g., 'wedding' or 'funeral')
 * 2. Filter by section tag (e.g., 'first-reading', 'psalm', 'gospel')
 * 3. Content must have BOTH tags to be selected
 *
 * TAG SLUGS USED:
 * ---------------
 * - Sacrament: 'wedding', 'funeral'
 * - Section: 'first-reading', 'second-reading', 'psalm', 'gospel'
 * (See category-tags-seed.ts for all available slugs)
 *
 * HOW TO FIND READINGS FOR AN EVENT:
 * ==================================
 * 1. Get the field_values from master_events
 * 2. Look up first_reading, psalm, second_reading, gospel_reading fields
 * 3. Each field contains a content ID (UUID)
 * 4. Query the contents table by ID to get the reading text
 *
 * EXAMPLE QUERY:
 * --------------
 * SELECT c.* FROM contents c
 * WHERE c.id = master_event.field_values->>'first_reading'
 */

import type { DevSeederContext } from './types'
import { logSuccess, logWarning, logInfo, logError } from '../../src/lib/utils/console'
import type { SupabaseClient } from '@supabase/supabase-js'

interface LocationRefs {
  churchLocation: { id: string } | null
  hallLocation: { id: string } | null
  funeralHomeLocation: { id: string } | null
}

interface ReadingSet {
  first_reading: string
  psalm: string
  second_reading: string
  gospel_reading: string
}

interface ReadingsByType {
  firstReadings: string[]
  psalms: string[]
  secondReadings: string[]
  gospels: string[]
}

/**
 * Fetches content IDs for readings by sacrament type
 */
async function getReadingsForSacrament(
  supabase: SupabaseClient,
  parishId: string,
  sacramentSlug: 'wedding' | 'funeral'
): Promise<ReadingsByType> {
  const result: ReadingsByType = {
    firstReadings: [],
    psalms: [],
    secondReadings: [],
    gospels: []
  }

  // Get all tags for this parish
  const { data: tags } = await supabase
    .from('category_tags')
    .select('id, slug')
    .eq('parish_id', parishId)

  if (!tags) return result

  const tagMap = new Map(tags.map(t => [t.slug, t.id]))
  const sacramentTagId = tagMap.get(sacramentSlug)

  if (!sacramentTagId) return result

  // Helper to get content IDs for a specific section
  const getContentIds = async (sectionSlug: string): Promise<string[]> => {
    const sectionTagId = tagMap.get(sectionSlug)
    if (!sectionTagId) return []

    // Find contents that have BOTH the sacrament tag AND the section tag
    const { data: sacramentAssignments } = await supabase
      .from('tag_assignments')
      .select('entity_id')
      .eq('tag_id', sacramentTagId)
      .eq('entity_type', 'content')

    if (!sacramentAssignments) return []

    const sacramentEntityIds = sacramentAssignments.map(a => a.entity_id)

    const { data: sectionAssignments } = await supabase
      .from('tag_assignments')
      .select('entity_id')
      .eq('tag_id', sectionTagId)
      .eq('entity_type', 'content')
      .in('entity_id', sacramentEntityIds)

    return sectionAssignments?.map(a => a.entity_id) || []
  }

  result.firstReadings = await getContentIds('first-reading')
  result.psalms = await getContentIds('psalm')
  result.secondReadings = await getContentIds('second-reading')
  result.gospels = await getContentIds('gospel')

  return result
}

/**
 * Build a reading set from available readings, using different indices
 */
function buildReadingSet(readings: ReadingsByType, index: number): ReadingSet {
  return {
    first_reading: readings.firstReadings[index % readings.firstReadings.length] || '',
    psalm: readings.psalms[index % readings.psalms.length] || '',
    second_reading: readings.secondReadings[index % readings.secondReadings.length] || '',
    gospel_reading: readings.gospels[index % readings.gospels.length] || ''
  }
}

export interface WeddingsFuneralsResult {
  success: boolean
  weddingsCreated: number
  funeralsCreated: number
}

export async function seedWeddingsAndFunerals(
  ctx: DevSeederContext,
  people: Array<{ id: string }> | null,
  locations: LocationRefs
): Promise<WeddingsFuneralsResult> {
  const { supabase, parishId } = ctx
  const { churchLocation, hallLocation, funeralHomeLocation } = locations

  logInfo('')
  logInfo('Creating sample weddings and funerals with readings...')

  if (!people || people.length < 15) {
    logWarning('Not enough people to create special liturgies, need at least 15')
    return { success: false, weddingsCreated: 0, funeralsCreated: 0 }
  }

  // Fetch readings from content library
  const weddingReadings = await getReadingsForSacrament(supabase, parishId, 'wedding')
  const funeralReadings = await getReadingsForSacrament(supabase, parishId, 'funeral')

  logInfo(`Wedding readings: ${weddingReadings.firstReadings.length} first, ${weddingReadings.psalms.length} psalms, ${weddingReadings.secondReadings.length} second, ${weddingReadings.gospels.length} gospels`)
  logInfo(`Funeral readings: ${funeralReadings.firstReadings.length} first, ${funeralReadings.psalms.length} psalms, ${funeralReadings.secondReadings.length} second, ${funeralReadings.gospels.length} gospels`)

  // Check if we have readings
  const hasWeddingReadings = weddingReadings.firstReadings.length > 0 && weddingReadings.gospels.length > 0
  const hasFuneralReadings = funeralReadings.firstReadings.length > 0 && funeralReadings.gospels.length > 0

  if (!hasWeddingReadings || !hasFuneralReadings) {
    logWarning('Missing readings in content library. Run seed:dev to seed readings first.')
    return { success: false, weddingsCreated: 0, funeralsCreated: 0 }
  }

  // Fetch event types
  const { data: eventTypes } = await supabase
    .from('event_types')
    .select('*, input_field_definitions!input_field_definitions_event_type_id_fkey(*)')
    .eq('parish_id', parishId)
    .is('deleted_at', null)
    .in('slug', ['weddings', 'funerals'])

  if (!eventTypes || eventTypes.length === 0) {
    logWarning('No wedding/funeral event types found')
    return { success: false, weddingsCreated: 0, funeralsCreated: 0 }
  }

  const weddingType = eventTypes.find(et => et.slug === 'weddings')
  const funeralType = eventTypes.find(et => et.slug === 'funerals')

  // Helper functions
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

  const getPrimaryCalendarEventField = (eventType: { input_field_definitions?: Array<{ id: string; type: string; is_primary: boolean; deleted_at: string | null }> }) => {
    if (!eventType?.input_field_definitions) return null
    return eventType.input_field_definitions.find(
      field => field.type === 'calendar_event' && field.is_primary && !field.deleted_at
    )
  }

  let weddingsCreated = 0
  let funeralsCreated = 0

  // =====================================================
  // Create Weddings
  // =====================================================
  if (weddingType) {
    const primaryField = getPrimaryCalendarEventField(weddingType)
    if (primaryField) {
      const weddings = [
        {
          field_values: {
            bride: people[1].id,
            groom: people[0].id,
            presider: people[8].id,
            reception_location: hallLocation?.id || '',
            ...buildReadingSet(weddingReadings, 0),
            unity_candle: true,
            special_instructions: 'Traditional ceremony with bilingual readings'
          },
          date: getFutureDate(45),
          time: '14:00:00'
        },
        {
          field_values: {
            bride: people[3].id,
            groom: people[2].id,
            presider: people[8].id,
            reception_location: hallLocation?.id || '',
            ...buildReadingSet(weddingReadings, 1),
            unity_candle: false,
            special_instructions: 'Simple ceremony'
          },
          date: getFutureDate(90),
          time: '11:00:00'
        },
        {
          field_values: {
            bride: people[5].id,
            groom: people[4].id,
            presider: people[8].id,
            reception_location: hallLocation?.id || '',
            ...buildReadingSet(weddingReadings, 2),
            unity_candle: true,
            special_instructions: 'Full Mass with Communion'
          },
          date: getFutureDate(120),
          time: '15:00:00'
        }
      ]

      for (const wedding of weddings) {
        const { data: newEvent, error: eventError } = await supabase
          .from('master_events')
          .insert({
            parish_id: parishId,
            event_type_id: weddingType.id,
            field_values: wedding.field_values,
            status: 'ACTIVE'
          })
          .select()
          .single()

        if (eventError) {
          logError(`Error creating wedding: ${eventError.message}`)
          continue
        }

        const startDatetime = new Date(`${wedding.date}T${wedding.time}`).toISOString()
        const { error: calendarError } = await supabase
          .from('calendar_events')
          .insert({
            parish_id: parishId,
            master_event_id: newEvent.id,
            input_field_definition_id: primaryField.id,
            start_datetime: startDatetime,
            location_id: churchLocation?.id || null,
            is_primary: true,
            is_cancelled: false
          })

        if (calendarError) {
          logError(`Error creating wedding calendar event: ${calendarError.message}`)
          await supabase.from('master_events').delete().eq('id', newEvent.id)
          continue
        }

        weddingsCreated++
      }

      logSuccess(`Created ${weddingsCreated} weddings with readings`)
    }
  }

  // =====================================================
  // Create Funerals
  // =====================================================
  if (funeralType) {
    const primaryField = getPrimaryCalendarEventField(funeralType)
    if (primaryField) {
      const funerals = [
        {
          field_values: {
            deceased: people[10].id,
            date_of_death: getPastDate(3),
            presider: people[8].id,
            burial_location: funeralHomeLocation?.id || '',
            ...buildReadingSet(funeralReadings, 0),
            eulogy_speaker: people[11].id
          },
          date: getFutureDate(2),
          time: '10:00:00'
        },
        {
          field_values: {
            deceased: people[12].id,
            date_of_death: getPastDate(1),
            presider: people[8].id,
            burial_location: funeralHomeLocation?.id || '',
            ...buildReadingSet(funeralReadings, 1)
          },
          date: getFutureDate(5),
          time: '11:00:00'
        },
        {
          field_values: {
            deceased: people[14].id,
            date_of_death: getPastDate(5),
            presider: people[8].id,
            burial_location: funeralHomeLocation?.id || '',
            ...buildReadingSet(funeralReadings, 2),
            eulogy_speaker: people[13].id
          },
          date: getFutureDate(7),
          time: '14:00:00'
        }
      ]

      for (const funeral of funerals) {
        const { data: newEvent, error: eventError } = await supabase
          .from('master_events')
          .insert({
            parish_id: parishId,
            event_type_id: funeralType.id,
            field_values: funeral.field_values,
            status: 'ACTIVE'
          })
          .select()
          .single()

        if (eventError) {
          logError(`Error creating funeral: ${eventError.message}`)
          continue
        }

        const startDatetime = new Date(`${funeral.date}T${funeral.time}`).toISOString()
        const { error: calendarError } = await supabase
          .from('calendar_events')
          .insert({
            parish_id: parishId,
            master_event_id: newEvent.id,
            input_field_definition_id: primaryField.id,
            start_datetime: startDatetime,
            location_id: churchLocation?.id || null,
            is_primary: true,
            is_cancelled: false
          })

        if (calendarError) {
          logError(`Error creating funeral calendar event: ${calendarError.message}`)
          await supabase.from('master_events').delete().eq('id', newEvent.id)
          continue
        }

        funeralsCreated++
      }

      logSuccess(`Created ${funeralsCreated} funerals with readings`)
    }
  }

  return {
    success: weddingsCreated > 0 || funeralsCreated > 0,
    weddingsCreated,
    funeralsCreated
  }
}
