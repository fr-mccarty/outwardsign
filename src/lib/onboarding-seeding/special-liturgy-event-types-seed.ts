/**
 * Special Liturgy Event Types Seed Data - Onboarding data for special liturgies
 *
 * This module creates starter special liturgy event types for new parishes:
 * - Easter Vigil
 * - Holy Thursday
 * - Good Friday
 *
 * These event types enable parishes to manage special liturgical celebrations
 * with custom fields and script generation.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Seeds special liturgy event types for a new parish
 *
 * @param supabase - Any Supabase client (server, service role, etc.)
 * @param parishId - The parish ID to seed data for
 */
export async function seedSpecialLiturgyEventTypesForParish(supabase: SupabaseClient, parishId: string) {
  const createdEventTypes: { id: string; name: string }[] = []

  // =====================================================
  // 1. Create Easter Vigil Event Type
  // =====================================================
  const { data: easterVigilType, error: easterVigilTypeError } = await supabase
    .from('event_types')
    .insert({
      parish_id: parishId,
      name: 'Easter Vigil',
      description: 'The Great Vigil of Easter - the most solemn celebration of the liturgical year',
      icon: 'Flame',
      slug: 'easter-vigil',
      system_type: 'special-liturgy',
      show_on_public_calendar: true,
      order: 201
    })
    .select()
    .single()

  if (easterVigilTypeError) {
    console.error('Error creating Easter Vigil event type:', easterVigilTypeError)
    throw new Error(`Failed to create Easter Vigil event type: ${easterVigilTypeError.message}`)
  }

  createdEventTypes.push({ id: easterVigilType.id, name: 'Easter Vigil' })

  // Create input field definitions for Easter Vigil
  const easterVigilFields = [
    { name: 'Easter Vigil Mass', property_name: 'easter_vigil_mass', type: 'calendar_event', required: true, is_primary: true, order: 0 },
    { name: 'Presider', property_name: 'presider', type: 'person', required: false, order: 1 },
    { name: 'Deacon', property_name: 'deacon', type: 'person', required: false, order: 2 },
    { name: '---', property_name: 'spacer_1', type: 'spacer', required: false, order: 3 },
    { name: 'Number of Catechumens', property_name: 'number_of_catechumens', type: 'number', required: false, order: 4 },
    { name: 'Number of Candidates', property_name: 'number_of_candidates', type: 'number', required: false, order: 5 },
    { name: '---', property_name: 'spacer_2', type: 'spacer', required: false, order: 6 },
    { name: 'Opening Hymn', property_name: 'opening_hymn', type: 'text', required: false, order: 7 },
    { name: 'Responsorial Psalm', property_name: 'responsorial_psalm', type: 'text', required: false, order: 8 },
    { name: 'Gospel Acclamation', property_name: 'gospel_acclamation', type: 'text', required: false, order: 9 },
    { name: 'Offertory Hymn', property_name: 'offertory_hymn', type: 'text', required: false, order: 10 },
    { name: 'Communion Hymn', property_name: 'communion_hymn', type: 'text', required: false, order: 11 },
    { name: 'Recessional Hymn', property_name: 'recessional_hymn', type: 'text', required: false, order: 12 },
    { name: '---', property_name: 'spacer_3', type: 'spacer', required: false, order: 13 },
    { name: 'Special Instructions', property_name: 'special_instructions', type: 'rich_text', required: false, order: 14 }
  ]

  const { error: easterVigilFieldsError } = await supabase
    .from('input_field_definitions')
    .insert(
      easterVigilFields.map(field => ({
        event_type_id: easterVigilType.id,
        ...field,
        is_primary: field.is_primary ?? false
      }))
    )

  if (easterVigilFieldsError) {
    console.error('Error creating Easter Vigil input fields:', easterVigilFieldsError)
    throw new Error(`Failed to create Easter Vigil input fields: ${easterVigilFieldsError.message}`)
  }

  // Create Presider Script for Easter Vigil
  const { data: easterVigilScript, error: easterVigilScriptError } = await supabase
    .from('scripts')
    .insert({
      event_type_id: easterVigilType.id,
      name: 'Presider Script',
      description: 'Complete script for the Easter Vigil presider',
      order: 1
    })
    .select()
    .single()

  if (easterVigilScriptError) {
    console.error('Error creating Easter Vigil script:', easterVigilScriptError)
    throw new Error(`Failed to create Easter Vigil script: ${easterVigilScriptError.message}`)
  }

  // Create sections for Easter Vigil Presider Script
  // Note: Placeholders use property_name format (snake_case) with dot notation for nested fields
  const easterVigilScriptSections = [
    {
      name: 'Liturgy Information',
      order: 1,
      content: '# Easter Vigil\n\n**Date:** {{easter_vigil_mass.date}}\n**Time:** {{easter_vigil_mass.time}}\n**Presider:** {{presider.full_name}}\n**Deacon:** {{deacon.full_name}}\n\n## Initiation\n- Catechumens: {{number_of_catechumens}}\n- Candidates: {{number_of_candidates}}'
    },
    {
      name: 'Music',
      order: 2,
      content: '# Music\n\n**Opening Hymn:** {{opening_hymn}}\n**Responsorial Psalm:** {{responsorial_psalm}}\n**Gospel Acclamation:** {{gospel_acclamation}}\n**Offertory:** {{offertory_hymn}}\n**Communion:** {{communion_hymn}}\n**Recessional:** {{recessional_hymn}}'
    },
    {
      name: 'Special Instructions',
      order: 3,
      content: '# Special Instructions\n\n{{special_instructions}}'
    }
  ]

  const { error: easterVigilSectionsError } = await supabase
    .from('sections')
    .insert(
      easterVigilScriptSections.map(section => ({
        script_id: easterVigilScript.id,
        name: section.name,
        order: section.order,
        content: section.content
      }))
    )

  if (easterVigilSectionsError) {
    console.error('Error creating Easter Vigil script sections:', easterVigilSectionsError)
    throw new Error(`Failed to create Easter Vigil script sections: ${easterVigilSectionsError.message}`)
  }

  // =====================================================
  // 2. Create Holy Thursday Event Type
  // =====================================================
  const { data: holyThursdayType, error: holyThursdayTypeError } = await supabase
    .from('event_types')
    .insert({
      parish_id: parishId,
      name: 'Holy Thursday',
      description: 'Mass of the Lord\'s Supper - beginning of the Sacred Triduum',
      icon: 'Wheat',
      slug: 'holy-thursday',
      system_type: 'special-liturgy',
      show_on_public_calendar: true,
      order: 202
    })
    .select()
    .single()

  if (holyThursdayTypeError) {
    console.error('Error creating Holy Thursday event type:', holyThursdayTypeError)
    throw new Error(`Failed to create Holy Thursday event type: ${holyThursdayTypeError.message}`)
  }

  createdEventTypes.push({ id: holyThursdayType.id, name: 'Holy Thursday' })

  // Create input field definitions for Holy Thursday
  const holyThursdayFields = [
    { name: 'Holy Thursday Mass', property_name: 'holy_thursday_mass', type: 'calendar_event', required: true, is_primary: true, order: 0 },
    { name: 'Presider', property_name: 'presider', type: 'person', required: false, order: 1 },
    { name: 'Deacon', property_name: 'deacon', type: 'person', required: false, order: 2 },
    { name: '---', property_name: 'spacer_1', type: 'spacer', required: false, order: 3 },
    { name: 'Foot Washing Participants', property_name: 'foot_washing_participants', type: 'number', required: false, order: 4 },
    { name: '---', property_name: 'spacer_2', type: 'spacer', required: false, order: 5 },
    { name: 'Opening Hymn', property_name: 'opening_hymn', type: 'text', required: false, order: 6 },
    { name: 'Responsorial Psalm', property_name: 'responsorial_psalm', type: 'text', required: false, order: 7 },
    { name: 'Gospel Acclamation', property_name: 'gospel_acclamation', type: 'text', required: false, order: 8 },
    { name: 'Washing of Feet Hymn', property_name: 'washing_of_feet_hymn', type: 'text', required: false, order: 9 },
    { name: 'Offertory Hymn', property_name: 'offertory_hymn', type: 'text', required: false, order: 10 },
    { name: 'Communion Hymn', property_name: 'communion_hymn', type: 'text', required: false, order: 11 },
    { name: 'Transfer of Eucharist Hymn', property_name: 'transfer_of_eucharist_hymn', type: 'text', required: false, order: 12 },
    { name: '---', property_name: 'spacer_3', type: 'spacer', required: false, order: 13 },
    { name: 'Special Instructions', property_name: 'special_instructions', type: 'rich_text', required: false, order: 14 }
  ]

  const { error: holyThursdayFieldsError } = await supabase
    .from('input_field_definitions')
    .insert(
      holyThursdayFields.map(field => ({
        event_type_id: holyThursdayType.id,
        ...field,
        is_primary: field.is_primary ?? false
      }))
    )

  if (holyThursdayFieldsError) {
    console.error('Error creating Holy Thursday input fields:', holyThursdayFieldsError)
    throw new Error(`Failed to create Holy Thursday input fields: ${holyThursdayFieldsError.message}`)
  }

  // Create Presider Script for Holy Thursday
  const { data: holyThursdayScript, error: holyThursdayScriptError } = await supabase
    .from('scripts')
    .insert({
      event_type_id: holyThursdayType.id,
      name: 'Presider Script',
      description: 'Complete script for the Holy Thursday presider',
      order: 1
    })
    .select()
    .single()

  if (holyThursdayScriptError) {
    console.error('Error creating Holy Thursday script:', holyThursdayScriptError)
    throw new Error(`Failed to create Holy Thursday script: ${holyThursdayScriptError.message}`)
  }

  // Create sections for Holy Thursday Presider Script
  // Note: Placeholders use property_name format (snake_case) with dot notation for nested fields
  const holyThursdayScriptSections = [
    {
      name: 'Liturgy Information',
      order: 1,
      content: '# Mass of the Lord\'s Supper\n\n**Date:** {{holy_thursday_mass.date}}\n**Time:** {{holy_thursday_mass.time}}\n**Presider:** {{presider.full_name}}\n**Deacon:** {{deacon.full_name}}\n\n## Foot Washing\n- Participants: {{foot_washing_participants}}'
    },
    {
      name: 'Music',
      order: 2,
      content: '# Music\n\n**Opening Hymn:** {{opening_hymn}}\n**Responsorial Psalm:** {{responsorial_psalm}}\n**Gospel Acclamation:** {{gospel_acclamation}}\n**Washing of Feet:** {{washing_of_feet_hymn}}\n**Offertory:** {{offertory_hymn}}\n**Communion:** {{communion_hymn}}\n**Transfer of Eucharist:** {{transfer_of_eucharist_hymn}}'
    },
    {
      name: 'Special Instructions',
      order: 3,
      content: '# Special Instructions\n\n{{special_instructions}}'
    }
  ]

  const { error: holyThursdaySectionsError } = await supabase
    .from('sections')
    .insert(
      holyThursdayScriptSections.map(section => ({
        script_id: holyThursdayScript.id,
        name: section.name,
        order: section.order,
        content: section.content
      }))
    )

  if (holyThursdaySectionsError) {
    console.error('Error creating Holy Thursday script sections:', holyThursdaySectionsError)
    throw new Error(`Failed to create Holy Thursday script sections: ${holyThursdaySectionsError.message}`)
  }

  // =====================================================
  // 3. Create Good Friday Event Type
  // =====================================================
  const { data: goodFridayType, error: goodFridayTypeError } = await supabase
    .from('event_types')
    .insert({
      parish_id: parishId,
      name: 'Good Friday',
      description: 'Celebration of the Lord\'s Passion - second day of the Sacred Triduum',
      icon: 'Cross',
      slug: 'good-friday',
      system_type: 'special-liturgy',
      show_on_public_calendar: true,
      order: 203
    })
    .select()
    .single()

  if (goodFridayTypeError) {
    console.error('Error creating Good Friday event type:', goodFridayTypeError)
    throw new Error(`Failed to create Good Friday event type: ${goodFridayTypeError.message}`)
  }

  createdEventTypes.push({ id: goodFridayType.id, name: 'Good Friday' })

  // Create input field definitions for Good Friday
  const goodFridayFields = [
    { name: 'Good Friday Service', property_name: 'good_friday_service', type: 'calendar_event', required: true, is_primary: true, order: 0 },
    { name: 'Presider', property_name: 'presider', type: 'person', required: false, order: 1 },
    { name: 'Deacon', property_name: 'deacon', type: 'person', required: false, order: 2 },
    { name: '---', property_name: 'spacer_1', type: 'spacer', required: false, order: 3 },
    { name: 'Opening Hymn', property_name: 'opening_hymn', type: 'text', required: false, order: 4 },
    { name: 'Responsorial Psalm', property_name: 'responsorial_psalm', type: 'text', required: false, order: 5 },
    { name: 'Gospel Acclamation', property_name: 'gospel_acclamation', type: 'text', required: false, order: 6 },
    { name: 'Veneration of Cross Hymn', property_name: 'veneration_of_cross_hymn', type: 'text', required: false, order: 7 },
    { name: 'Communion Hymn', property_name: 'communion_hymn', type: 'text', required: false, order: 8 },
    { name: 'Closing Hymn', property_name: 'closing_hymn', type: 'text', required: false, order: 9 },
    { name: '---', property_name: 'spacer_2', type: 'spacer', required: false, order: 10 },
    { name: 'Special Instructions', property_name: 'special_instructions', type: 'rich_text', required: false, order: 11 }
  ]

  const { error: goodFridayFieldsError } = await supabase
    .from('input_field_definitions')
    .insert(
      goodFridayFields.map(field => ({
        event_type_id: goodFridayType.id,
        ...field,
        is_primary: field.is_primary ?? false
      }))
    )

  if (goodFridayFieldsError) {
    console.error('Error creating Good Friday input fields:', goodFridayFieldsError)
    throw new Error(`Failed to create Good Friday input fields: ${goodFridayFieldsError.message}`)
  }

  // Create Presider Script for Good Friday
  const { data: goodFridayScript, error: goodFridayScriptError } = await supabase
    .from('scripts')
    .insert({
      event_type_id: goodFridayType.id,
      name: 'Presider Script',
      description: 'Complete script for the Good Friday presider',
      order: 1
    })
    .select()
    .single()

  if (goodFridayScriptError) {
    console.error('Error creating Good Friday script:', goodFridayScriptError)
    throw new Error(`Failed to create Good Friday script: ${goodFridayScriptError.message}`)
  }

  // Create sections for Good Friday Presider Script
  // Note: Placeholders use property_name format (snake_case) with dot notation for nested fields
  const goodFridayScriptSections = [
    {
      name: 'Liturgy Information',
      order: 1,
      content: '# Celebration of the Lord\'s Passion\n\n**Date:** {{good_friday_service.date}}\n**Time:** {{good_friday_service.time}}\n**Presider:** {{presider.full_name}}\n**Deacon:** {{deacon.full_name}}'
    },
    {
      name: 'Music',
      order: 2,
      content: '# Music\n\n**Opening Hymn:** {{opening_hymn}}\n**Responsorial Psalm:** {{responsorial_psalm}}\n**Gospel Acclamation:** {{gospel_acclamation}}\n**Veneration of Cross:** {{veneration_of_cross_hymn}}\n**Communion:** {{communion_hymn}}\n**Closing:** {{closing_hymn}}'
    },
    {
      name: 'Special Instructions',
      order: 3,
      content: '# Special Instructions\n\n{{special_instructions}}'
    }
  ]

  const { error: goodFridaySectionsError } = await supabase
    .from('sections')
    .insert(
      goodFridayScriptSections.map(section => ({
        script_id: goodFridayScript.id,
        name: section.name,
        order: section.order,
        content: section.content
      }))
    )

  if (goodFridaySectionsError) {
    console.error('Error creating Good Friday script sections:', goodFridaySectionsError)
    throw new Error(`Failed to create Good Friday script sections: ${goodFridaySectionsError.message}`)
  }

  return {
    success: true,
    eventTypes: createdEventTypes
  }
}
