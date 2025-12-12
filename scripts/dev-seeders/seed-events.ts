/**
 * Dev Seeder: Sample Dynamic Events
 *
 * Creates 2 sample events for each event type (Weddings, Funerals, Baptisms, etc.)
 */

import type { DevSeederContext } from './types'

interface LocationRefs {
  churchLocation: { id: string } | null
  hallLocation: { id: string } | null
  funeralHomeLocation: { id: string } | null
}

export async function seedEvents(
  ctx: DevSeederContext,
  people: Array<{ id: string }> | null,
  locations: LocationRefs
) {
  const { supabase, parishId } = ctx
  const { churchLocation, hallLocation, funeralHomeLocation } = locations

  console.log('')
  console.log('📅 Creating sample events for each event type...')

  // Fetch all event types
  const { data: eventTypes } = await supabase
    .from('event_types')
    .select('*, input_field_definitions!input_field_definitions_event_type_id_fkey(*)')
    .eq('parish_id', parishId)
    .is('deleted_at', null)
    .order('order')

  if (!eventTypes || eventTypes.length === 0) {
    console.log('   ⚠️  No event types found, skipping event creation')
    return { success: false }
  }

  if (!people || people.length < 10) {
    console.log('   ⚠️  Not enough people to create events, skipping event creation')
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

  let totalEventsCreated = 0

  for (const eventType of eventTypes) {
    // Skip generic types and Mass types
    if (eventType.slug === 'other' || eventType.slug === 'sunday-mass' || eventType.slug === 'daily-mass') {
      continue
    }

    const eventsData: Array<{
      field_values: Record<string, string | boolean>
      occasion: { label: string; date: string; time: string; location_id: string | null }
    }> = []

    switch (eventType.slug) {
      case 'weddings':
        // Note: Occasion label must match the input field name 'Wedding Ceremony'
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
          occasion: { label: 'Wedding Ceremony', date: getFutureDate(45), time: '14:00:00', location_id: churchLocation?.id || null }
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
          occasion: { label: 'Wedding Ceremony', date: getFutureDate(90), time: '11:00:00', location_id: churchLocation?.id || null }
        })
        break

      case 'funerals':
        // Note: Occasion label must match the input field name 'Funeral Mass'
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
          occasion: { label: 'Funeral Mass', date: getFutureDate(2), time: '10:00:00', location_id: churchLocation?.id || null }
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
          occasion: { label: 'Funeral Mass', date: getFutureDate(5), time: '11:00:00', location_id: churchLocation?.id || null }
        })
        break

      case 'baptisms':
        // Note: Occasion label must match the input field name 'Baptism'
        eventsData.push({
          field_values: {
            'Child': people[4].id,
            'Mother': people[5].id,
            'Father': people[6].id,
            'Godmother': people[7].id,
            'Godfather': people[8].id,
            'Presider': people[0].id
          },
          occasion: { label: 'Baptism', date: getFutureDate(14), time: '13:00:00', location_id: churchLocation?.id || null }
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
          occasion: { label: 'Baptism', date: getFutureDate(21), time: '14:00:00', location_id: churchLocation?.id || null }
        })
        break

      case 'quinceaneras':
        // Note: Occasion label must match the input field name 'Quinceañera Mass'
        eventsData.push({
          field_values: {
            'Quinceañera': people[5].id,
            'Mother': people[3].id,
            'Father': people[6].id,
            'Presider': people[0].id,
            'Reception Location': hallLocation?.id || ''
          },
          occasion: { label: 'Quinceañera Mass', date: getFutureDate(60), time: '15:00:00', location_id: churchLocation?.id || null }
        })
        eventsData.push({
          field_values: {
            'Quinceañera': people[7].id,
            'Mother': people[11].id,
            'Father': people[10].id,
            'Presider': people[8].id,
            'Reception Location': hallLocation?.id || ''
          },
          occasion: { label: 'Quinceañera Mass', date: getFutureDate(75), time: '16:00:00', location_id: churchLocation?.id || null }
        })
        break

      case 'presentations':
        // Note: Occasion label must match the input field name 'Presentation'
        eventsData.push({
          field_values: {
            'Child': people[4].id,
            'Mother': people[1].id,
            'Father': people[0].id,
            'Godmother': people[3].id,
            'Godfather': people[2].id,
            'Presider': people[8].id
          },
          occasion: { label: 'Presentation', date: getFutureDate(30), time: '12:00:00', location_id: churchLocation?.id || null }
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
          occasion: { label: 'Presentation', date: getFutureDate(35), time: '11:30:00', location_id: churchLocation?.id || null }
        })
        break

      default:
        continue
    }

    // Insert events and occasions
    for (const eventData of eventsData) {
      const { data: newEvent, error: eventError } = await supabase
        .from('dynamic_events')
        .insert({
          parish_id: parishId,
          event_type_id: eventType.id,
          field_values: eventData.field_values
        })
        .select()
        .single()

      if (eventError) {
        console.error(`   ❌ Error creating ${eventType.name} event:`, eventError.message)
        continue
      }

      const { error: occasionError } = await supabase
        .from('occasions')
        .insert({
          event_id: newEvent.id,
          label: eventData.occasion.label,
          date: eventData.occasion.date,
          time: eventData.occasion.time,
          location_id: eventData.occasion.location_id,
          is_primary: true
        })

      if (occasionError) {
        await supabase.from('dynamic_events').delete().eq('id', newEvent.id)
        continue
      }

      totalEventsCreated++
    }

    console.log(`   ✅ Created 2 ${eventType.name} events`)
  }

  console.log(`   📊 Total events created: ${totalEventsCreated}`)
  return { success: true }
}
