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
      category: 'special_liturgy',
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
    { name: 'Easter Vigil Mass', type: 'occasion', required: true, is_primary: true, order: 0 },
    { name: 'Presider', type: 'person', required: false, order: 1 },
    { name: 'Deacon', type: 'person', required: false, order: 2 },
    { name: '---', type: 'spacer', required: false, order: 3 },
    { name: 'Number of Catechumens', type: 'number', required: false, order: 4 },
    { name: 'Number of Candidates', type: 'number', required: false, order: 5 },
    { name: '---', type: 'spacer', required: false, order: 6 },
    { name: 'Opening Hymn', type: 'text', required: false, order: 7 },
    { name: 'Responsorial Psalm', type: 'text', required: false, order: 8 },
    { name: 'Gospel Acclamation', type: 'text', required: false, order: 9 },
    { name: 'Offertory Hymn', type: 'text', required: false, order: 10 },
    { name: 'Communion Hymn', type: 'text', required: false, order: 11 },
    { name: 'Recessional Hymn', type: 'text', required: false, order: 12 },
    { name: '---', type: 'spacer', required: false, order: 13 },
    { name: 'Special Instructions', type: 'rich_text', required: false, order: 14 }
  ]

  const { error: easterVigilFieldsError } = await supabase
    .from('input_field_definitions')
    .insert(
      easterVigilFields.map(field => ({
        event_type_id: easterVigilType.id,
        name: field.name,
        type: field.type,
        required: field.required,
        is_primary: field.is_primary ?? false,
        order: field.order
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
  const easterVigilScriptSections = [
    {
      name: 'Liturgy Information',
      order: 1,
      content: {
        en: '# Easter Vigil\n\n**Date:** {{date}}\n**Time:** {{time}}\n**Presider:** {{presider}}\n**Deacon:** {{deacon}}\n\n## Initiation\n- Catechumens: {{Number of Catechumens}}\n- Candidates: {{Number of Candidates}}',
        es: '# Vigilia Pascual\n\n**Fecha:** {{date}}\n**Hora:** {{time}}\n**Presidente:** {{presider}}\n**Diácono:** {{deacon}}\n\n## Iniciación\n- Catecúmenos: {{Number of Catechumens}}\n- Candidatos: {{Number of Candidates}}'
      }
    },
    {
      name: 'Music',
      order: 2,
      content: {
        en: '# Music\n\n**Opening Hymn:** {{Opening Hymn}}\n**Responsorial Psalm:** {{Responsorial Psalm}}\n**Gospel Acclamation:** {{Gospel Acclamation}}\n**Offertory:** {{Offertory Hymn}}\n**Communion:** {{Communion Hymn}}\n**Recessional:** {{Recessional Hymn}}',
        es: '# Música\n\n**Himno de Apertura:** {{Opening Hymn}}\n**Salmo Responsorial:** {{Responsorial Psalm}}\n**Aclamación del Evangelio:** {{Gospel Acclamation}}\n**Ofertorio:** {{Offertory Hymn}}\n**Comunión:** {{Communion Hymn}}\n**Salida:** {{Recessional Hymn}}'
      }
    },
    {
      name: 'Special Instructions',
      order: 3,
      content: {
        en: '# Special Instructions\n\n{{Special Instructions}}',
        es: '# Instrucciones Especiales\n\n{{Special Instructions}}'
      }
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
      category: 'special_liturgy',
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
    { name: 'Holy Thursday Mass', type: 'occasion', required: true, is_primary: true, order: 0 },
    { name: 'Presider', type: 'person', required: false, order: 1 },
    { name: 'Deacon', type: 'person', required: false, order: 2 },
    { name: '---', type: 'spacer', required: false, order: 3 },
    { name: 'Foot Washing Participants', type: 'number', required: false, order: 4 },
    { name: '---', type: 'spacer', required: false, order: 5 },
    { name: 'Opening Hymn', type: 'text', required: false, order: 6 },
    { name: 'Responsorial Psalm', type: 'text', required: false, order: 7 },
    { name: 'Gospel Acclamation', type: 'text', required: false, order: 8 },
    { name: 'Washing of Feet Hymn', type: 'text', required: false, order: 9 },
    { name: 'Offertory Hymn', type: 'text', required: false, order: 10 },
    { name: 'Communion Hymn', type: 'text', required: false, order: 11 },
    { name: 'Transfer of Eucharist Hymn', type: 'text', required: false, order: 12 },
    { name: '---', type: 'spacer', required: false, order: 13 },
    { name: 'Special Instructions', type: 'rich_text', required: false, order: 14 }
  ]

  const { error: holyThursdayFieldsError } = await supabase
    .from('input_field_definitions')
    .insert(
      holyThursdayFields.map(field => ({
        event_type_id: holyThursdayType.id,
        name: field.name,
        type: field.type,
        required: field.required,
        is_primary: field.is_primary ?? false,
        order: field.order
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
  const holyThursdayScriptSections = [
    {
      name: 'Liturgy Information',
      order: 1,
      content: {
        en: '# Mass of the Lord\'s Supper\n\n**Date:** {{date}}\n**Time:** {{time}}\n**Presider:** {{presider}}\n**Deacon:** {{deacon}}\n\n## Foot Washing\n- Participants: {{Foot Washing Participants}}',
        es: '# Misa de la Cena del Señor\n\n**Fecha:** {{date}}\n**Hora:** {{time}}\n**Presidente:** {{presider}}\n**Diácono:** {{deacon}}\n\n## Lavatorio de los Pies\n- Participantes: {{Foot Washing Participants}}'
      }
    },
    {
      name: 'Music',
      order: 2,
      content: {
        en: '# Music\n\n**Opening Hymn:** {{Opening Hymn}}\n**Responsorial Psalm:** {{Responsorial Psalm}}\n**Gospel Acclamation:** {{Gospel Acclamation}}\n**Washing of Feet:** {{Washing of Feet Hymn}}\n**Offertory:** {{Offertory Hymn}}\n**Communion:** {{Communion Hymn}}\n**Transfer of Eucharist:** {{Transfer of Eucharist Hymn}}',
        es: '# Música\n\n**Himno de Apertura:** {{Opening Hymn}}\n**Salmo Responsorial:** {{Responsorial Psalm}}\n**Aclamación del Evangelio:** {{Gospel Acclamation}}\n**Lavatorio de los Pies:** {{Washing of Feet Hymn}}\n**Ofertorio:** {{Offertory Hymn}}\n**Comunión:** {{Communion Hymn}}\n**Traslado de la Eucaristía:** {{Transfer of Eucharist Hymn}}'
      }
    },
    {
      name: 'Special Instructions',
      order: 3,
      content: {
        en: '# Special Instructions\n\n{{Special Instructions}}',
        es: '# Instrucciones Especiales\n\n{{Special Instructions}}'
      }
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
      category: 'special_liturgy',
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
    { name: 'Good Friday Service', type: 'occasion', required: true, is_primary: true, order: 0 },
    { name: 'Presider', type: 'person', required: false, order: 1 },
    { name: 'Deacon', type: 'person', required: false, order: 2 },
    { name: '---', type: 'spacer', required: false, order: 3 },
    { name: 'Opening Hymn', type: 'text', required: false, order: 4 },
    { name: 'Responsorial Psalm', type: 'text', required: false, order: 5 },
    { name: 'Gospel Acclamation', type: 'text', required: false, order: 6 },
    { name: 'Veneration of Cross Hymn', type: 'text', required: false, order: 7 },
    { name: 'Communion Hymn', type: 'text', required: false, order: 8 },
    { name: 'Closing Hymn', type: 'text', required: false, order: 9 },
    { name: '---', type: 'spacer', required: false, order: 10 },
    { name: 'Special Instructions', type: 'rich_text', required: false, order: 11 }
  ]

  const { error: goodFridayFieldsError } = await supabase
    .from('input_field_definitions')
    .insert(
      goodFridayFields.map(field => ({
        event_type_id: goodFridayType.id,
        name: field.name,
        type: field.type,
        required: field.required,
        is_primary: field.is_primary ?? false,
        order: field.order
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
  const goodFridayScriptSections = [
    {
      name: 'Liturgy Information',
      order: 1,
      content: {
        en: '# Celebration of the Lord\'s Passion\n\n**Date:** {{date}}\n**Time:** {{time}}\n**Presider:** {{presider}}\n**Deacon:** {{deacon}}',
        es: '# Celebración de la Pasión del Señor\n\n**Fecha:** {{date}}\n**Hora:** {{time}}\n**Presidente:** {{presider}}\n**Diácono:** {{deacon}}'
      }
    },
    {
      name: 'Music',
      order: 2,
      content: {
        en: '# Music\n\n**Opening Hymn:** {{Opening Hymn}}\n**Responsorial Psalm:** {{Responsorial Psalm}}\n**Gospel Acclamation:** {{Gospel Acclamation}}\n**Veneration of Cross:** {{Veneration of Cross Hymn}}\n**Communion:** {{Communion Hymn}}\n**Closing:** {{Closing Hymn}}',
        es: '# Música\n\n**Himno de Apertura:** {{Opening Hymn}}\n**Salmo Responsorial:** {{Responsorial Psalm}}\n**Aclamación del Evangelio:** {{Gospel Acclamation}}\n**Adoración de la Cruz:** {{Veneration of Cross Hymn}}\n**Comunión:** {{Communion Hymn}}\n**Cierre:** {{Closing Hymn}}'
      }
    },
    {
      name: 'Special Instructions',
      order: 3,
      content: {
        en: '# Special Instructions\n\n{{Special Instructions}}',
        es: '# Instrucciones Especiales\n\n{{Special Instructions}}'
      }
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
