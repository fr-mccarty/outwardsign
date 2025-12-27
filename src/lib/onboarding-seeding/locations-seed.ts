/**
 * Locations Seed Data - Default locations for new parishes
 *
 * Creates default locations during onboarding:
 * - Parish Church: Main worship space
 * - Parish Hall: Event and reception space
 * - Local Funeral Home: For funeral-related events
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { logError, logSuccess } from '@/lib/utils/console'

interface Location {
  id: string
  name: string
  description: string | null
}

interface SeedLocationsResult {
  success: boolean
  locations: Location[]
  churchLocation: Location | null
  hallLocation: Location | null
  funeralHomeLocation: Location | null
}

/**
 * Seeds default locations for a new parish.
 *
 * @param supabase - Any Supabase client (server, service role, etc.)
 * @param parishId - The parish ID to seed data for
 * @returns The created locations with named references
 */
export async function seedLocationsForParish(
  supabase: SupabaseClient,
  parishId: string
): Promise<SeedLocationsResult> {
  const defaultLocations = [
    {
      parish_id: parishId,
      name: 'Parish Church',
      description: 'Main worship space for the parish'
    },
    {
      parish_id: parishId,
      name: 'Parish Hall',
      description: 'Parish event center and reception hall'
    },
    {
      parish_id: parishId,
      name: 'Local Funeral Home',
      description: 'Local funeral home for vigil services'
    }
  ]

  const { data: locations, error } = await supabase
    .from('locations')
    .insert(defaultLocations)
    .select()

  if (error) {
    logError(`Error creating default locations: ${error.message}`)
    return {
      success: false,
      locations: [],
      churchLocation: null,
      hallLocation: null,
      funeralHomeLocation: null
    }
  }

  // Find each location by name for easy reference
  const churchLocation = locations?.find(l => l.name === 'Parish Church') || null
  const hallLocation = locations?.find(l => l.name === 'Parish Hall') || null
  const funeralHomeLocation = locations?.find(l => l.name === 'Local Funeral Home') || null

  logSuccess(`Created ${locations?.length || 0} default locations`)

  return {
    success: true,
    locations: locations || [],
    churchLocation,
    hallLocation,
    funeralHomeLocation
  }
}
