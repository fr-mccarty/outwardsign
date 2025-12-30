#!/usr/bin/env tsx
/**
 * Rendered Script Verification
 *
 * This script verifies that the ACTUAL RENDERED OUTPUT is correct,
 * not just that the data is seeded properly.
 *
 * It simulates what the script view page does:
 * 1. Fetches an event with resolved fields
 * 2. Gets the psalm content
 * 3. Processes placeholders
 * 4. Verifies the psalm shows the psalm_reader's name, NOT the first_reader's name
 *
 * Run with: npm run seed:verify:rendered
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function getEventWithReaders(eventTypeName: string) {
  // Get an event of the specified type
  const { data: events } = await supabase
    .from('master_events')
    .select(`
      id,
      event_type:event_types!inner(id, name)
    `)
    .eq('event_types.name', eventTypeName)
    .is('deleted_at', null)
    .limit(1)

  if (!events || events.length === 0) {
    return null
  }

  const event = events[0]

  // Get reader assignments for this event
  const { data: assignments } = await supabase
    .from('people_event_assignments')
    .select(`
      field_definition:input_field_definitions!field_definition_id(property_name),
      person:people!person_id(id, full_name)
    `)
    .eq('master_event_id', event.id)
    .is('deleted_at', null)

  const readers: Record<string, { id: string; full_name: string }> = {}
  for (const a of assignments || []) {
    const propName = (a.field_definition as any)?.property_name
    const person = a.person as any
    if (propName && person) {
      readers[propName] = { id: person.id, full_name: person.full_name }
    }
  }

  return { event, readers }
}

async function getPsalmContent() {
  const { data: psalms } = await supabase
    .from('contents')
    .select('id, title, body')
    .like('title', 'Psalm%')
    .limit(1)

  return psalms?.[0] || null
}

function processPlaceholders(content: string, resolvedFields: Record<string, any>): string {
  // Simple placeholder replacement matching what content-renderer does
  return content.replace(/\{\{(\w+)\.(\w+)\}\}/g, (match, fieldName, property) => {
    const field = resolvedFields[fieldName]
    if (field && field[property]) {
      return field[property]
    }
    return match // Leave unreplaced if not found
  })
}

async function main() {
  console.log('\n========================================')
  console.log('Rendered Script Verification')
  console.log('========================================\n')

  let passed = 0
  let failed = 0

  // Test Wedding
  console.log('Testing Wedding...')
  const weddingData = await getEventWithReaders('Wedding')

  if (!weddingData) {
    console.log('❌ No wedding event found')
    failed++
  } else {
    const { readers } = weddingData

    // Check that first_reader and psalm_reader are different people
    if (!readers.first_reader || !readers.psalm_reader) {
      console.log('❌ Wedding missing first_reader or psalm_reader assignment')
      console.log('   first_reader:', readers.first_reader?.full_name || 'NOT ASSIGNED')
      console.log('   psalm_reader:', readers.psalm_reader?.full_name || 'NOT ASSIGNED')
      failed++
    } else if (readers.first_reader.id === readers.psalm_reader.id) {
      console.log('❌ Wedding has SAME person for first_reader and psalm_reader')
      console.log('   Both are:', readers.first_reader.full_name)
      failed++
    } else {
      console.log('✅ Wedding has DIFFERENT readers:')
      console.log('   first_reader:', readers.first_reader.full_name)
      console.log('   psalm_reader:', readers.psalm_reader.full_name)
      passed++

      // Now test that psalm content renders with psalm_reader's name
      const psalm = await getPsalmContent()
      if (psalm) {
        const rendered = processPlaceholders(psalm.body, readers)

        if (rendered.includes(readers.psalm_reader.full_name)) {
          console.log('✅ Psalm renders with psalm_reader name:', readers.psalm_reader.full_name)
          passed++
        } else {
          console.log('❌ Psalm does NOT contain psalm_reader name')
          failed++
        }

        if (rendered.includes(readers.first_reader.full_name)) {
          console.log('❌ Psalm INCORRECTLY contains first_reader name:', readers.first_reader.full_name)
          failed++
        } else {
          console.log('✅ Psalm does NOT contain first_reader name (correct)')
          passed++
        }
      }
    }
  }

  // Test Funeral
  console.log('\nTesting Funeral...')
  const funeralData = await getEventWithReaders('Funeral')

  if (!funeralData) {
    console.log('❌ No funeral event found')
    failed++
  } else {
    const { readers } = funeralData

    if (!readers.first_reader || !readers.psalm_reader) {
      console.log('❌ Funeral missing first_reader or psalm_reader assignment')
      console.log('   first_reader:', readers.first_reader?.full_name || 'NOT ASSIGNED')
      console.log('   psalm_reader:', readers.psalm_reader?.full_name || 'NOT ASSIGNED')
      failed++
    } else if (readers.first_reader.id === readers.psalm_reader.id) {
      console.log('❌ Funeral has SAME person for first_reader and psalm_reader')
      failed++
    } else {
      console.log('✅ Funeral has DIFFERENT readers:')
      console.log('   first_reader:', readers.first_reader.full_name)
      console.log('   psalm_reader:', readers.psalm_reader.full_name)
      passed++
    }
  }

  console.log('\n========================================')
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
