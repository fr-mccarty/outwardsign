#!/usr/bin/env tsx
/**
 * Seeder Verification Script
 *
 * Verifies that seeded data is correct after running npm run db:fresh
 * Run with: npx tsx scripts/verify-seeder.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface VerificationResult {
  name: string
  passed: boolean
  message: string
}

const results: VerificationResult[] = []

function pass(name: string, message: string) {
  results.push({ name, passed: true, message })
  console.log(`✅ ${name}: ${message}`)
}

function fail(name: string, message: string) {
  results.push({ name, passed: false, message })
  console.log(`❌ ${name}: ${message}`)
}

async function verifyPsalmsUsePsalmReader() {
  const { data: psalms } = await supabase
    .from('contents')
    .select('title, body')
    .like('title', 'Psalm%')

  if (!psalms || psalms.length === 0) {
    fail('Psalms placeholder', 'No psalms found in database')
    return
  }

  const wrongPsalms = psalms.filter(p => p.body.includes('first_reader.full_name'))
  const correctPsalms = psalms.filter(p => p.body.includes('psalm_reader.full_name'))

  if (wrongPsalms.length > 0) {
    fail('Psalms placeholder', `${wrongPsalms.length} psalms still use first_reader: ${wrongPsalms.map(p => p.title).join(', ')}`)
  } else if (correctPsalms.length === psalms.length) {
    pass('Psalms placeholder', `All ${psalms.length} psalms correctly use psalm_reader.full_name`)
  } else {
    fail('Psalms placeholder', `Only ${correctPsalms.length}/${psalms.length} psalms use psalm_reader`)
  }
}

async function verifyEventTypesHavePsalmReader() {
  const { data: eventTypes } = await supabase
    .from('event_types')
    .select('name, id')
    .in('name', ['Wedding', 'Funeral'])

  if (!eventTypes) {
    fail('Event type fields', 'Could not fetch event types')
    return
  }

  for (const et of eventTypes) {
    const { data: fields } = await supabase
      .from('input_field_definitions')
      .select('property_name, type')
      .eq('event_type_id', et.id)
      .is('deleted_at', null)

    const psalmReaderField = fields?.find(f => f.property_name === 'psalm_reader' && f.type === 'person')

    if (psalmReaderField) {
      pass(`${et.name} psalm_reader field`, 'Field exists')
    } else {
      fail(`${et.name} psalm_reader field`, 'Missing psalm_reader person field')
    }
  }
}

async function verifyReadersAreDistinct() {
  const { data: assignments } = await supabase
    .from('people_event_assignments')
    .select(`
      master_event_id,
      person_id,
      field_definition:input_field_definitions!field_definition_id(property_name),
      person:people!person_id(full_name),
      master_event:master_events!master_event_id(
        event_type:event_types!event_type_id(name)
      )
    `)
    .is('deleted_at', null)

  if (!assignments) {
    fail('Reader assignments', 'Could not fetch assignments')
    return
  }

  // Group by master_event_id
  const eventGroups = new Map<string, typeof assignments>()
  for (const a of assignments) {
    const key = a.master_event_id
    if (!eventGroups.has(key)) eventGroups.set(key, [])
    eventGroups.get(key)!.push(a)
  }

  let allDistinct = true
  for (const [eventId, eventAssignments] of eventGroups) {
    const readerFields = eventAssignments.filter(a =>
      (a.field_definition as any)?.property_name?.includes('reader')
    )

    const personIds = readerFields.map(a => a.person_id)
    const uniquePersonIds = new Set(personIds)

    if (personIds.length !== uniquePersonIds.size) {
      allDistinct = false
      const eventType = (readerFields[0]?.master_event as any)?.event_type?.name || 'Unknown'
      fail('Distinct readers', `${eventType} event has duplicate reader assignments`)
    }
  }

  if (allDistinct) {
    pass('Distinct readers', 'All events have distinct people assigned to reader roles')
  }
}

async function verifyNoHardcodedNames() {
  // Check preset descriptions for hardcoded names
  const { data: presets } = await supabase
    .from('event_presets')
    .select('name, description')

  if (!presets) {
    fail('Hardcoded names', 'Could not fetch presets')
    return
  }

  const hardcodedPatterns = ['Fr. John', 'Fr. Martinez', 'Deacon Mike']
  const badPresets = presets.filter(p =>
    hardcodedPatterns.some(pattern => p.description?.includes(pattern))
  )

  if (badPresets.length > 0) {
    fail('Hardcoded names in presets', `Found hardcoded names in: ${badPresets.map(p => p.name).join(', ')}`)
  } else {
    pass('Hardcoded names in presets', 'No hardcoded names found in preset descriptions')
  }

  // Check notifications
  const { data: notifications } = await supabase
    .from('parishioner_notifications')
    .select('sender_name')

  const badNotifications = notifications?.filter(n =>
    hardcodedPatterns.some(pattern => n.sender_name?.includes(pattern))
  )

  if (badNotifications && badNotifications.length > 0) {
    fail('Hardcoded names in notifications', `Found hardcoded sender names`)
  } else {
    pass('Hardcoded names in notifications', 'No hardcoded names found')
  }
}

async function main() {
  console.log('\n========================================')
  console.log('Seeder Verification')
  console.log('========================================\n')

  await verifyPsalmsUsePsalmReader()
  await verifyEventTypesHavePsalmReader()
  await verifyReadersAreDistinct()
  await verifyNoHardcodedNames()

  console.log('\n========================================')
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length

  if (failed === 0) {
    console.log(`All ${passed} checks passed!`)
    console.log('========================================\n')
    process.exit(0)
  } else {
    console.log(`${passed} passed, ${failed} failed`)
    console.log('========================================\n')
    process.exit(1)
  }
}

main().catch(err => {
  console.error('Verification failed:', err)
  process.exit(1)
})
