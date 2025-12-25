#!/usr/bin/env tsx
/**
 * Test Script Render
 *
 * Tests the rendering of a wedding script to verify formatting.
 * Run: npx dotenv -e .env.local -- npx tsx scripts/test-render.ts
 */

import { createClient } from '@supabase/supabase-js'
import { renderMarkdownToText } from '../src/lib/utils/content-renderer'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  console.log('\n' + '='.repeat(70))
  console.log('TEST RENDER')
  console.log('='.repeat(70))

  // Get wedding type and wedding
  const { data: weddingType } = await supabase
    .from('event_types')
    .select('id')
    .eq('slug', 'weddings')
    .single()

  const { data: wedding } = await supabase
    .from('master_events')
    .select('*, parish:parishes(name, city, state)')
    .eq('event_type_id', weddingType!.id)
    .limit(1)
    .single()

  const { data: inputFields } = await supabase
    .from('input_field_definitions')
    .select('*')
    .eq('event_type_id', weddingType!.id)
    .is('deleted_at', null)

  let fieldValues = { ...(wedding!.field_values as Record<string, any>) }

  // Assign readers if missing
  if (!fieldValues.first_reader || !fieldValues.second_reader) {
    const { data: people } = await supabase
      .from('people')
      .select('id, first_name, last_name')
      .eq('parish_id', wedding!.parish_id)
      .limit(10)

    const usedIds = new Set([fieldValues.bride, fieldValues.groom, fieldValues.presider].filter(Boolean))
    const available = (people || []).filter(p => !usedIds.has(p.id))

    if (available.length >= 2) {
      fieldValues.first_reader = available[0].id
      fieldValues.second_reader = available[1].id
      await supabase.from('master_events').update({ field_values: fieldValues }).eq('id', wedding!.id)
      console.log(`\nAssigned readers: ${available[0].first_name}, ${available[1].first_name}`)
    }
  }

  // Resolve entities
  const resolvedEntities: { people: Record<string, any>; contents: Record<string, any> } = { people: {}, contents: {} }

  for (const field of inputFields || []) {
    const value = fieldValues[field.property_name]
    if (!value) continue

    if (field.type === 'person') {
      const { data } = await supabase.from('people').select('*').eq('id', value).single()
      if (data) resolvedEntities.people[value] = data
    } else if (field.type === 'content') {
      const { data } = await supabase.from('contents').select('*').eq('id', value).single()
      if (data) resolvedEntities.contents[value] = data
    }
  }

  // Get Worship Aid script
  const { data: script } = await supabase
    .from('scripts')
    .select('*, sections(*)')
    .eq('event_type_id', weddingType!.id)
    .ilike('name', '%Worship%')
    .single()

  if (!script) {
    console.log('No Worship Aid script found')
    return
  }

  console.log(`\nScript: ${script.name}`)
  console.log(`Sections: ${script.sections?.length}`)

  // Render each section
  const sections = (script.sections || []).sort((a: any, b: any) => a.order - b.order)

  for (const section of sections) {
    console.log('\n' + '─'.repeat(70))
    console.log(`SECTION: ${section.name} (page_break_after: ${section.page_break_after})`)
    console.log('─'.repeat(70))

    const rendered = renderMarkdownToText(section.content, {
      fieldValues,
      inputFieldDefinitions: inputFields || [],
      resolvedEntities,
      parish: wedding!.parish,
      format: 'text'
    })

    console.log(rendered.trim())
  }

  console.log('\n' + '='.repeat(70))
  console.log('DONE')
  console.log('='.repeat(70))
}

main().catch(console.error)
