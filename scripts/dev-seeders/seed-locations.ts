/**
 * Dev Seeder: Sample Locations
 *
 * Creates sample locations (Church, Parish Hall, Funeral Home) for development/testing.
 */

import type { DevSeederContext } from './types'

export interface LocationsResult {
  success: boolean
  churchLocation: { id: string } | null
  hallLocation: { id: string } | null
  funeralHomeLocation: { id: string } | null
}

export async function seedLocations(ctx: DevSeederContext): Promise<LocationsResult> {
  const { supabase, parishId } = ctx

  console.log('')
  console.log('📍 Creating sample locations...')

  let churchLocation: { id: string } | null = null
  let hallLocation: { id: string } | null = null
  let funeralHomeLocation: { id: string } | null = null

  // Check for existing locations
  const { data: existingLocations } = await supabase
    .from('locations')
    .select('id, name')
    .eq('parish_id', parishId)

  if (existingLocations && existingLocations.length >= 3) {
    churchLocation = existingLocations.find(l => l.name.includes('Church')) || existingLocations[0]
    hallLocation = existingLocations.find(l => l.name.includes('Hall')) || existingLocations[1]
    funeralHomeLocation = existingLocations.find(l => l.name.includes('Funeral')) || existingLocations[2]
    console.log(`   ✅ Using ${existingLocations.length} existing locations`)
  } else {
    // Create locations if they don't exist
    const locationsToCreate = [
      {
        parish_id: parishId,
        name: "St. Mary's Catholic Church",
        description: 'Main parish church and worship space',
        street: '100 Church Street',
        city: 'Springfield',
        state: 'IL',
        country: 'USA'
      },
      {
        parish_id: parishId,
        name: 'Parish Hall',
        description: 'Parish event center and reception hall',
        street: '102 Church Street',
        city: 'Springfield',
        state: 'IL',
        country: 'USA'
      },
      {
        parish_id: parishId,
        name: 'Springfield Funeral Home',
        description: 'Local funeral home for vigil services',
        street: '500 Memorial Drive',
        city: 'Springfield',
        state: 'IL',
        country: 'USA'
      }
    ]

    const { data: newLocations, error: locationsError } = await supabase
      .from('locations')
      .insert(locationsToCreate)
      .select()

    if (locationsError) {
      console.error('⚠️  Warning: Error creating locations:', locationsError.message)
    } else if (newLocations && newLocations.length === 3) {
      churchLocation = newLocations[0]
      hallLocation = newLocations[1]
      funeralHomeLocation = newLocations[2]
      console.log(`   ✅ Created 3 sample locations`)
    }
  }

  return {
    success: true,
    churchLocation,
    hallLocation,
    funeralHomeLocation
  }
}
