/**
 * Groups Seed Data - Default groups for new parishes
 *
 * Creates common parish groups during onboarding:
 * - Parish Council
 * - Finance Council
 * - Maintenance Committee
 * - Parish Leadership Team (PLT)
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { logError, logSuccess } from '@/lib/utils/console'

interface Group {
  id: string
  name: string
  description: string | null
}

interface SeedGroupsResult {
  success: boolean
  groups: Group[]
}

/**
 * Seeds default groups for a new parish.
 *
 * @param supabase - Any Supabase client (server, service role, etc.)
 * @param parishId - The parish ID to seed data for
 */
export async function seedGroupsForParish(
  supabase: SupabaseClient,
  parishId: string
): Promise<SeedGroupsResult> {
  const defaultGroups = [
    {
      parish_id: parishId,
      name: 'Parish Council',
      description: 'Advisory body for parish leadership and planning',
      is_active: true
    },
    {
      parish_id: parishId,
      name: 'Finance Council',
      description: 'Oversight of parish finances and budgeting',
      is_active: true
    },
    {
      parish_id: parishId,
      name: 'Maintenance Committee',
      description: 'Care and upkeep of parish facilities',
      is_active: true
    },
    {
      parish_id: parishId,
      name: 'Parish Leadership Team',
      description: 'Core leadership team for parish direction and planning',
      is_active: true
    }
  ]

  const { data: groups, error } = await supabase
    .from('groups')
    .insert(defaultGroups)
    .select()

  if (error) {
    logError(`Error creating default groups: ${error.message}`)
    return { success: false, groups: [] }
  }

  logSuccess(`Created ${groups?.length || 0} default groups`)

  return {
    success: true,
    groups: groups || []
  }
}
