/**
 * Dev Seeder: Sample Masses
 *
 * Creates 20 sample Masses (8 Sunday, 12 Daily) linked to Mass event types.
 * Mass event types are created by the onboarding seeder.
 */

import type { DevSeederContext } from './types'

export async function seedMasses(
  ctx: DevSeederContext,
  people: Array<{ id: string; first_name: string; last_name: string }> | null,
  churchLocation: { id: string } | null
) {
  const { supabase, parishId } = ctx

  // Fetch Mass event types (created by onboarding seeder)
  const { data: massEventTypes } = await supabase
    .from('event_types')
    .select('id, name, slug')
    .eq('parish_id', parishId)
    .in('slug', ['sunday-mass', 'daily-mass'])

  const sundayMassEventType = massEventTypes?.find(et => et.slug === 'sunday-mass') || null
  const dailyMassEventType = massEventTypes?.find(et => et.slug === 'daily-mass') || null

  if (!sundayMassEventType && !dailyMassEventType) {
    console.log('   ⚠️  No Mass event types found - skipping Mass creation')
    return { success: false }
  }

  if (!people || people.length === 0) {
    console.log('   ⚠️  No people found - skipping Mass creation')
    return { success: false }
  }

  if (!churchLocation) {
    console.log('   ⚠️  No church location found - skipping Mass creation')
    return { success: false }
  }

  console.log('')
  console.log('📅 Creating 20 sample Masses...')

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

  const massesToCreate: Array<{
    date: string
    time: string
    eventTypeId: string | null
    fieldValues: Record<string, string>
  }> = []

  // Create 8 Sunday Masses (next 8 weeks)
  if (sundayMassEventType) {
    for (let week = 0; week < 8; week++) {
      const massDate = getSundayDate(week)
      massesToCreate.push({
        date: massDate,
        time: '10:00:00',
        eventTypeId: sundayMassEventType.id,
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
        eventTypeId: dailyMassEventType.id,
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

  // Insert Masses
  let massesCreatedCount = 0
  for (const massData of massesToCreate) {
    const matchingLiturgicalEvent = liturgicalEvents?.find(le => le.date === massData.date)

    const { data: newMass, error: massError } = await supabase
      .from('masses')
      .insert({
        parish_id: parishId,
        event_type_id: massData.eventTypeId,
        field_values: massData.fieldValues,
        presider_id: people[0].id,
        liturgical_event_id: matchingLiturgicalEvent?.id || null,
        status: 'CONFIRMED',
        name: matchingLiturgicalEvent?.name || `Mass - ${massData.date}`,
        description: `${massData.time.substring(0, 5)} Mass`
      })
      .select()
      .single()

    if (massError) {
      console.error(`   ❌ Error creating Mass for ${massData.date}:`, massError.message)
      continue
    }

    // Create an occasion for this Mass
    if (newMass) {
      const { error: occasionError } = await supabase
        .from('occasions')
        .insert({
          mass_id: newMass.id,
          label: 'Mass',
          date: massData.date,
          time: massData.time,
          location_id: churchLocation.id,
          is_primary: true
        })

      if (!occasionError) {
        massesCreatedCount++
      }
    }
  }

  const sundayCount = massesToCreate.filter(m => m.eventTypeId === sundayMassEventType?.id).length
  const dailyCount = massesToCreate.filter(m => m.eventTypeId === dailyMassEventType?.id).length
  console.log(`   ✅ Created ${massesCreatedCount} sample Masses (${sundayCount} Sunday, ${dailyCount} Daily)`)

  return { success: true }
}
