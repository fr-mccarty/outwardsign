/**
 * Demo Data Cleanup
 *
 * Cleans up seeder-created demo data before re-seeding.
 * This allows the UI demo seeder to be pressed multiple times.
 *
 * PRESERVED (onboarding/infrastructure data):
 * - parishes, parish_users
 * - groups, group_roles
 * - event_types, input_field_definitions, scripts, script_sections
 * - locations, petition_templates, category_tags
 * - mass_times_templates, mass_times_template_items
 * - contents, event_presets
 *
 * DELETED (demo/sample data):
 * - people, families, family_members
 * - group_members
 * - parish_events, calendar_events
 * - people_event_assignments, mass_intentions
 * - person_blackout_dates, parishioner_notifications
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export interface CleanupResult {
  success: boolean
  deletedCounts: {
    peopleEventAssignments: number
    massIntentions: number
    calendarEvents: number
    parishEvents: number
    groupMembers: number
    familyMembers: number
    parishionerNotifications: number
    personBlackoutDates: number
    families: number
    people: number
  }
}

/**
 * Cleans up demo data for a parish before re-seeding.
 * Deletes in correct order to respect foreign key constraints.
 */
export async function cleanupDemoData(
  supabase: SupabaseClient,
  parishId: string
): Promise<CleanupResult> {
  const counts = {
    peopleEventAssignments: 0,
    massIntentions: 0,
    calendarEvents: 0,
    parishEvents: 0,
    groupMembers: 0,
    familyMembers: 0,
    parishionerNotifications: 0,
    personBlackoutDates: 0,
    families: 0,
    people: 0,
  }

  // 1. Delete people_event_assignments (references people, parish_events, calendar_events)
  const { count: peaCount } = await supabase
    .from('people_event_assignments')
    .delete({ count: 'exact' })
    .eq('parish_id', parishId)
  counts.peopleEventAssignments = peaCount || 0

  // 2. Delete mass_intentions (references people, parish_events, calendar_events)
  const { count: miCount } = await supabase
    .from('mass_intentions')
    .delete({ count: 'exact' })
    .eq('parish_id', parishId)
  counts.massIntentions = miCount || 0

  // 3. Delete calendar_events (references parish_events)
  // Calendar events don't have parish_id directly, delete via parish_events
  const { data: parishEventIds } = await supabase
    .from('parish_events')
    .select('id')
    .eq('parish_id', parishId)

  if (parishEventIds && parishEventIds.length > 0) {
    const eventIds = parishEventIds.map(e => e.id)
    const { count: ceCount } = await supabase
      .from('calendar_events')
      .delete({ count: 'exact' })
      .in('parish_event_id', eventIds)
    counts.calendarEvents = ceCount || 0
  }

  // 4. Delete parish_events (masses, weddings, funerals, etc.)
  const { count: peCount } = await supabase
    .from('parish_events')
    .delete({ count: 'exact' })
    .eq('parish_id', parishId)
  counts.parishEvents = peCount || 0

  // 5. Delete group_members (references people, groups)
  // Group members don't have parish_id, delete via people
  const { data: peopleIds } = await supabase
    .from('people')
    .select('id')
    .eq('parish_id', parishId)

  if (peopleIds && peopleIds.length > 0) {
    const personIds = peopleIds.map(p => p.id)
    const { count: gmCount } = await supabase
      .from('group_members')
      .delete({ count: 'exact' })
      .in('person_id', personIds)
    counts.groupMembers = gmCount || 0
  }

  // 6. Delete family_members (references people, families)
  const { data: familyIds } = await supabase
    .from('families')
    .select('id')
    .eq('parish_id', parishId)

  if (familyIds && familyIds.length > 0) {
    const famIds = familyIds.map(f => f.id)
    const { count: fmCount } = await supabase
      .from('family_members')
      .delete({ count: 'exact' })
      .in('family_id', famIds)
    counts.familyMembers = fmCount || 0
  }

  // 7. Delete parishioner_notifications (references people)
  if (peopleIds && peopleIds.length > 0) {
    const personIds = peopleIds.map(p => p.id)
    const { count: pnCount } = await supabase
      .from('parishioner_notifications')
      .delete({ count: 'exact' })
      .in('person_id', personIds)
    counts.parishionerNotifications = pnCount || 0
  }

  // 8. Delete person_blackout_dates (references people)
  if (peopleIds && peopleIds.length > 0) {
    const personIds = peopleIds.map(p => p.id)
    const { count: pbdCount } = await supabase
      .from('person_blackout_dates')
      .delete({ count: 'exact' })
      .in('person_id', personIds)
    counts.personBlackoutDates = pbdCount || 0
  }

  // 9. Delete families
  const { count: famCount } = await supabase
    .from('families')
    .delete({ count: 'exact' })
    .eq('parish_id', parishId)
  counts.families = famCount || 0

  // 10. Delete people
  const { count: pCount } = await supabase
    .from('people')
    .delete({ count: 'exact' })
    .eq('parish_id', parishId)
  counts.people = pCount || 0

  return {
    success: true,
    deletedCounts: counts,
  }
}
