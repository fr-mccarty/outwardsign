/**
 * Dev Seeder: Sample Mass Intentions
 *
 * Creates sample mass intentions - some linked to existing masses,
 * some standalone (not yet assigned to a mass).
 */

import type { DevSeederContext } from './types'
import { logSuccess, logInfo, logWarning } from '../../src/lib/utils/console'

// Sample intention texts
const INTENTION_TEXTS = [
  'For the repose of the soul of',
  'For the healing of',
  'In thanksgiving for blessings received by',
  'For the intentions of',
  'For peace and comfort for the family of',
  'In memory of',
  'For the special intentions of',
  'For the health and well-being of',
]

// Status options
const STATUSES = ['REQUESTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED']

export async function seedMassIntentions(
  ctx: DevSeederContext,
  people: Array<{ id: string; first_name: string; last_name: string }> | null
) {
  const { supabase, parishId } = ctx

  if (!people || people.length < 5) {
    logWarning('Not enough people found - skipping mass intentions creation')
    return { success: false }
  }

  logInfo('')
  logInfo('Creating sample mass intentions...')

  // Get existing masses (master_events with mass event types)
  const { data: massEventTypes } = await supabase
    .from('event_types')
    .select('id')
    .eq('parish_id', parishId)
    .in('slug', ['sunday-mass', 'daily-mass'])
    .is('deleted_at', null)

  const massEventTypeIds = massEventTypes?.map(et => et.id) || []

  // Get existing masses to link some intentions to
  const { data: existingMasses } = await supabase
    .from('master_events')
    .select('id')
    .eq('parish_id', parishId)
    .in('event_type_id', massEventTypeIds)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(10)

  const massIds = existingMasses?.map(m => m.id) || []

  // Helper to get a date in the past or future
  const getDate = (daysOffset: number) => {
    const date = new Date()
    date.setDate(date.getDate() + daysOffset)
    return date.toISOString().split('T')[0]
  }

  // Create mass intentions data
  const massIntentionsToCreate = []

  // 1. Create 5 mass intentions linked to existing masses
  for (let i = 0; i < Math.min(5, massIds.length); i++) {
    const person = people[i]
    const requester = people[(i + 5) % people.length]
    massIntentionsToCreate.push({
      parish_id: parishId,
      master_event_id: massIds[i],
      mass_offered_for: `${INTENTION_TEXTS[i % INTENTION_TEXTS.length]} ${person.first_name} ${person.last_name}`,
      requested_by_id: requester.id,
      date_received: getDate(-7 - i),
      date_requested: null, // Already scheduled
      stipend_in_cents: [1000, 1500, 2000, 1000, 2500][i],
      status: 'SCHEDULED',
      note: i === 0 ? 'Anniversary Mass' : null,
    })
  }

  // 2. Create 5 standalone mass intentions (not yet assigned to a mass)
  for (let i = 0; i < 5; i++) {
    const person = people[(i + 3) % people.length]
    const requester = people[(i + 7) % people.length]
    const statusIndex = i % 4
    massIntentionsToCreate.push({
      parish_id: parishId,
      master_event_id: null, // Standalone - not yet assigned
      mass_offered_for: `${INTENTION_TEXTS[(i + 3) % INTENTION_TEXTS.length]} ${person.first_name} ${person.last_name}`,
      requested_by_id: requester.id,
      date_received: getDate(-14 + i),
      date_requested: i < 3 ? getDate(7 + i * 7) : null, // Some have requested dates
      stipend_in_cents: [1000, 0, 1500, 1000, 2000][i],
      status: STATUSES[statusIndex],
      note: i === 2 ? 'Prefers weekend Mass if possible' : null,
    })
  }

  // 3. Create 2 completed mass intentions (historical)
  for (let i = 0; i < 2; i++) {
    const person = people[(i + 8) % people.length]
    const requester = people[(i + 2) % people.length]
    massIntentionsToCreate.push({
      parish_id: parishId,
      master_event_id: null,
      mass_offered_for: `${INTENTION_TEXTS[(i + 5) % INTENTION_TEXTS.length]} ${person.first_name} ${person.last_name}`,
      requested_by_id: requester.id,
      date_received: getDate(-30 - i * 7),
      date_requested: getDate(-21 - i * 7),
      stipend_in_cents: 1500,
      status: 'COMPLETED',
      note: null,
    })
  }

  // Insert all mass intentions
  const { data: insertedIntentions, error } = await supabase
    .from('mass_intentions')
    .insert(massIntentionsToCreate)
    .select('id, status, master_event_id')

  if (error) {
    logWarning(`Error creating mass intentions: ${error.message}`)
    return { success: false }
  }

  const linkedCount = insertedIntentions?.filter(i => i.master_event_id !== null).length || 0
  const standaloneCount = insertedIntentions?.filter(i => i.master_event_id === null).length || 0

  logSuccess(`Created ${insertedIntentions?.length || 0} mass intentions (${linkedCount} linked to masses, ${standaloneCount} standalone)`)

  return { success: true, count: insertedIntentions?.length || 0 }
}
