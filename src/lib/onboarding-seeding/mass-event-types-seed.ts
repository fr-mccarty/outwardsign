/**
 * Mass Event Types Seed Data - Onboarding data for Mass templating
 *
 * This module creates starter Mass event types for new parishes with:
 * - Sunday Mass event type (with hymns, announcements, intentions)
 * - Daily Mass event type (minimal fields)
 * - Input field definitions for each type
 * - Default scripts with sections
 *
 * These event types enable the Mass templating feature where Masses
 * can be linked to event types for custom fields and script generation.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Seeds Mass event types for a new parish with starter templates
 *
 * @param supabase - Any Supabase client (server, service role, etc.)
 * @param parishId - The parish ID to seed data for
 */
export async function seedMassEventTypesForParish(supabase: SupabaseClient, parishId: string) {
  const createdEventTypes: { id: string; name: string }[] = []

  // =====================================================
  // 1. Create Sunday Mass Event Type
  // =====================================================
  // Note: Role definitions are now stored as input_field_definitions with type='person'
  // and is_per_calendar_event=true for occurrence-level assignments (per unified-event-assignments requirements)

  const { data: sundayMassType, error: sundayMassTypeError } = await supabase
    .from('event_types')
    .insert({
      parish_id: parishId,
      name: 'Sunday Mass',
      description: 'Sunday celebration with full music and announcements',
      icon: 'Church',
      slug: 'sunday-mass',
      system_type: 'mass-liturgy',
      order: 100 // After other event types
    })
    .select()
    .single()

  if (sundayMassTypeError) {
    console.error('Error creating Sunday Mass event type:', sundayMassTypeError)
    throw new Error(`Failed to create Sunday Mass event type: ${sundayMassTypeError.message}`)
  }

  createdEventTypes.push({ id: sundayMassType.id, name: 'Sunday Mass' })

  // Create input field definitions for Sunday Mass
  // Note: Fields with is_per_calendar_event=true are minister roles assigned per Mass time
  const sundayMassFields = [
    { name: 'Mass', property_name: 'mass', type: 'calendar_event', required: true, is_primary: true, order: 0 },
    { name: 'Presider', property_name: 'presider', type: 'person', required: false, order: 1 },
    { name: 'Homilist', property_name: 'homilist', type: 'person', required: false, order: 2 },
    // Minister roles (is_per_calendar_event=true means assigned per Mass time)
    { name: 'Lector', property_name: 'lector', type: 'person', required: false, is_per_calendar_event: true, order: 3 },
    { name: 'EMHC', property_name: 'emhc', type: 'person', required: false, is_per_calendar_event: true, order: 4 },
    { name: 'Altar Server', property_name: 'altar_server', type: 'person', required: false, is_per_calendar_event: true, order: 5 },
    { name: 'Cantor', property_name: 'cantor', type: 'person', required: false, is_per_calendar_event: true, order: 6 },
    { name: 'Usher', property_name: 'usher', type: 'person', required: false, is_per_calendar_event: true, order: 7 },
    // Other fields
    { name: 'Announcements', property_name: 'announcements', type: 'rich_text', required: false, order: 8 },
    { name: 'Entrance Hymn', property_name: 'entrance_hymn', type: 'text', required: false, order: 9 },
    { name: 'Offertory Hymn', property_name: 'offertory_hymn', type: 'text', required: false, order: 10 },
    { name: 'Communion Hymn', property_name: 'communion_hymn', type: 'text', required: false, order: 11 },
    { name: 'Recessional Hymn', property_name: 'recessional_hymn', type: 'text', required: false, order: 12 },
    { name: 'Mass Intentions', property_name: 'mass_intentions', type: 'mass-intention', required: false, order: 13 },
    { name: 'Special Instructions', property_name: 'special_instructions', type: 'rich_text', required: false, order: 14 }
  ]

  const { error: sundayFieldsError } = await supabase
    .from('input_field_definitions')
    .insert(
      sundayMassFields.map(field => ({
        event_type_id: sundayMassType.id,
        ...field,
        is_primary: field.is_primary ?? false,
        is_per_calendar_event: field.is_per_calendar_event ?? false
      }))
    )

  if (sundayFieldsError) {
    console.error('Error creating Sunday Mass input fields:', sundayFieldsError)
    throw new Error(`Failed to create Sunday Mass input fields: ${sundayFieldsError.message}`)
  }

  // Create Presider Script for Sunday Mass
  const { data: sundayScript, error: sundayScriptError } = await supabase
    .from('scripts')
    .insert({
      event_type_id: sundayMassType.id,
      name: 'Presider Script',
      description: 'Complete script for the presider with all Mass details',
      order: 1
    })
    .select()
    .single()

  if (sundayScriptError) {
    console.error('Error creating Sunday Mass script:', sundayScriptError)
    throw new Error(`Failed to create Sunday Mass script: ${sundayScriptError.message}`)
  }

  // Create sections for Sunday Mass Presider Script
  // Note: Placeholders use property_name format (snake_case) to match resolved_fields keys
  // - calendar_event fields use dot notation: {{mass.date}}, {{mass.time}}
  // - person fields use dot notation for specific properties: {{presider.full_name}}
  const sundayScriptSections = [
    {
      name: 'Mass Information',
      order: 1,
      content: '# Mass Information\n\n**Date:** {{mass.date}}\n**Time:** {{mass.time}}\n**Presider:** {{presider.full_name}}\n\n## Mass Intentions\n{{mass_intention.mass_offered_for}}'
    },
    {
      name: 'Music',
      order: 2,
      content: '# Music\n\n**Entrance:** {{entrance_hymn}}\n**Offertory:** {{offertory_hymn}}\n**Communion:** {{communion_hymn}}\n**Recessional:** {{recessional_hymn}}'
    },
    {
      name: 'Announcements',
      order: 3,
      content: '# Announcements\n\n{{announcements}}'
    },
    {
      name: 'Special Instructions',
      order: 4,
      content: '# Special Instructions\n\n{{special_instructions}}'
    }
  ]

  const { error: sundaySectionsError } = await supabase
    .from('sections')
    .insert(
      sundayScriptSections.map(section => ({
        script_id: sundayScript.id,
        name: section.name,
        order: section.order,
        content: section.content
      }))
    )

  if (sundaySectionsError) {
    console.error('Error creating Sunday Mass script sections:', sundaySectionsError)
    throw new Error(`Failed to create Sunday Mass script sections: ${sundaySectionsError.message}`)
  }

  // =====================================================
  // 2. Create Daily Mass Event Type
  // =====================================================
  // Note: Role definitions are now stored as input_field_definitions with type='person'
  // and is_per_calendar_event=true for occurrence-level assignments (per unified-event-assignments requirements)

  const { data: dailyMassType, error: dailyMassTypeError } = await supabase
    .from('event_types')
    .insert({
      parish_id: parishId,
      name: 'Daily Mass',
      description: 'Weekday celebration with minimal music',
      icon: 'CalendarDays',
      slug: 'daily-mass',
      system_type: 'mass-liturgy',
      order: 101
    })
    .select()
    .single()

  if (dailyMassTypeError) {
    console.error('Error creating Daily Mass event type:', dailyMassTypeError)
    throw new Error(`Failed to create Daily Mass event type: ${dailyMassTypeError.message}`)
  }

  createdEventTypes.push({ id: dailyMassType.id, name: 'Daily Mass' })

  // Create input field definitions for Daily Mass (minimal, but with some minister roles)
  // Note: Fields with is_per_calendar_event=true are minister roles assigned per Mass time
  const dailyMassFields = [
    { name: 'Mass', property_name: 'mass', type: 'calendar_event', required: true, is_primary: true, order: 0 },
    { name: 'Presider', property_name: 'presider', type: 'person', required: false, order: 1 },
    // Minister roles (is_per_calendar_event=true means assigned per Mass time)
    { name: 'Lector', property_name: 'lector', type: 'person', required: false, is_per_calendar_event: true, order: 2 },
    { name: 'EMHC', property_name: 'emhc', type: 'person', required: false, is_per_calendar_event: true, order: 3 },
    { name: 'Altar Server', property_name: 'altar_server', type: 'person', required: false, is_per_calendar_event: true, order: 4 },
    // Other fields
    { name: 'Mass Intentions', property_name: 'mass_intentions', type: 'mass-intention', required: false, order: 5 },
    { name: 'Special Instructions', property_name: 'special_instructions', type: 'rich_text', required: false, order: 6 }
  ]

  const { error: dailyFieldsError } = await supabase
    .from('input_field_definitions')
    .insert(
      dailyMassFields.map(field => ({
        event_type_id: dailyMassType.id,
        ...field,
        is_primary: field.is_primary ?? false,
        is_per_calendar_event: field.is_per_calendar_event ?? false
      }))
    )

  if (dailyFieldsError) {
    console.error('Error creating Daily Mass input fields:', dailyFieldsError)
    throw new Error(`Failed to create Daily Mass input fields: ${dailyFieldsError.message}`)
  }

  // Create Presider Script for Daily Mass
  const { data: dailyScript, error: dailyScriptError } = await supabase
    .from('scripts')
    .insert({
      event_type_id: dailyMassType.id,
      name: 'Presider Script',
      description: 'Simple script for weekday Mass',
      order: 1
    })
    .select()
    .single()

  if (dailyScriptError) {
    console.error('Error creating Daily Mass script:', dailyScriptError)
    throw new Error(`Failed to create Daily Mass script: ${dailyScriptError.message}`)
  }

  // Create sections for Daily Mass Presider Script
  // Note: Placeholders use property_name format (snake_case) to match resolved_fields keys
  // - calendar_event fields use dot notation: {{mass.date}}, {{mass.time}}
  // - person fields use dot notation for specific properties: {{presider.full_name}}
  const dailyScriptSections = [
    {
      name: 'Mass Information',
      order: 1,
      content: '# Mass Information\n\n**Date:** {{mass.date}}\n**Time:** {{mass.time}}\n**Presider:** {{presider.full_name}}\n\n## Mass Intentions\n{{mass_intention.mass_offered_for}}\n\n## Special Instructions\n{{special_instructions}}'
    }
  ]

  const { error: dailySectionsError } = await supabase
    .from('sections')
    .insert(
      dailyScriptSections.map(section => ({
        script_id: dailyScript.id,
        name: section.name,
        order: section.order,
        content: section.content
      }))
    )

  if (dailySectionsError) {
    console.error('Error creating Daily Mass script sections:', dailySectionsError)
    throw new Error(`Failed to create Daily Mass script sections: ${dailySectionsError.message}`)
  }

  return {
    success: true,
    eventTypes: createdEventTypes
  }
}
