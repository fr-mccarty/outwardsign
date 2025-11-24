/**
 * Parish Seed Data - Shared seeding logic for onboarding and dev scripts
 *
 * This module contains the actual data seeding logic that can be used by:
 * - Server actions (parish-onboarding.ts)
 * - Dev seed scripts (scripts/dev-seed.ts)
 *
 * See docs/ONBOARDING.md for full documentation.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { readingsData } from '@/lib/data/readings'

// Import petition templates
import sundayEnglish from '@/lib/default-petition-templates/sunday-english'
import sundaySpanish from '@/lib/default-petition-templates/sunday-spanish'
import daily from '@/lib/default-petition-templates/daily'
import weddingEnglish from '@/lib/default-petition-templates/wedding-english'
import weddingSpanish from '@/lib/default-petition-templates/wedding-spanish'
import funeralEnglish from '@/lib/default-petition-templates/funeral-english'
import funeralSpanish from '@/lib/default-petition-templates/funeral-spanish'
import quinceaneraEnglish from '@/lib/default-petition-templates/quinceanera-english'
import quinceaneraSpanish from '@/lib/default-petition-templates/quinceanera-spanish'
import presentationEnglish from '@/lib/default-petition-templates/presentation-english'
import presentationSpanish from '@/lib/default-petition-templates/presentation-spanish'

/**
 * Seeds all initial data for a parish.
 * This is the single source of truth for parish onboarding data.
 *
 * @param supabase - Any Supabase client (server, service role, etc.)
 * @param parishId - The parish ID to seed data for
 */
export async function seedParishData(supabase: SupabaseClient, parishId: string) {
  // =====================================================
  // 1. Seed Readings
  // =====================================================
  const readingsToInsert = readingsData.map((reading) => ({
    parish_id: parishId,
    pericope: reading.pericope,
    text: reading.text,
    categories: reading.categories,
    language: reading.language,
    introduction: reading.introduction ?? null,
    conclusion: reading.conclusion ?? null
  }))

  const { data: readings, error: readingsError } = await supabase
    .from('readings')
    .insert(readingsToInsert)
    .select()

  if (readingsError) {
    console.error('Error creating readings:', readingsError)
    throw new Error(`Failed to create readings: ${readingsError.message}`)
  }

  // =====================================================
  // 2. Seed Petition Templates
  // =====================================================
  const defaultPetitionTemplates = [
    sundayEnglish,
    sundaySpanish,
    daily,
    weddingEnglish,
    weddingSpanish,
    funeralEnglish,
    funeralSpanish,
    quinceaneraEnglish,
    quinceaneraSpanish,
    presentationEnglish,
    presentationSpanish
  ]

  const petitionTemplatesToInsert = defaultPetitionTemplates.map((template) => ({
    parish_id: parishId,
    title: template.title,
    description: template.description,
    context: template.content,
    module: template.module,
    language: template.language,
    is_default: template.is_default
  }))

  const { data: petitionTemplates, error: petitionTemplatesError } = await supabase
    .from('petition_templates')
    .insert(petitionTemplatesToInsert)
    .select()

  if (petitionTemplatesError) {
    console.error('Error creating petition templates:', petitionTemplatesError)
    throw new Error(`Failed to create petition templates: ${petitionTemplatesError.message}`)
  }

  // =====================================================
  // 3. Seed Group Roles
  // =====================================================
  const defaultGroupRoles = [
    { parish_id: parishId, name: 'Leader', description: 'Leads and coordinates the group', is_active: true, display_order: 1 },
    { parish_id: parishId, name: 'Member', description: 'Active participant in the group', is_active: true, display_order: 2 },
    { parish_id: parishId, name: 'Secretary', description: 'Maintains records and communications', is_active: true, display_order: 3 },
    { parish_id: parishId, name: 'Treasurer', description: 'Manages group finances', is_active: true, display_order: 4 },
    { parish_id: parishId, name: 'Coordinator', description: 'Coordinates group activities and events', is_active: true, display_order: 5 },
  ]

  const { data: groupRoles, error: groupRolesError } = await supabase
    .from('group_roles')
    .insert(defaultGroupRoles)
    .select()

  if (groupRolesError) {
    console.error('Error creating default group roles:', groupRolesError)
    throw new Error(`Failed to create default group roles: ${groupRolesError.message}`)
  }

  // =====================================================
  // 4. Seed Mass Roles
  // =====================================================
  const defaultMassRoles = [
    { parish_id: parishId, name: 'Lector', description: 'Proclaims the Word of God during Mass', is_active: true, display_order: 1 },
    { parish_id: parishId, name: 'Eucharistic Minister', description: 'Distributes Holy Communion during Mass', is_active: true, display_order: 2 },
    { parish_id: parishId, name: 'Server', description: 'Assists the priest at the altar during Mass', is_active: true, display_order: 3 },
    { parish_id: parishId, name: 'Cantor', description: 'Leads the congregation in singing', is_active: true, display_order: 4 },
    { parish_id: parishId, name: 'Usher', description: 'Welcomes parishioners and assists with seating and collection', is_active: true, display_order: 5 },
    { parish_id: parishId, name: 'Sacristan', description: 'Prepares the sacred vessels and sanctuary for Mass', is_active: true, display_order: 6 },
    { parish_id: parishId, name: 'Music Minister', description: 'Provides music during the liturgy', is_active: true, display_order: 7 },
    { parish_id: parishId, name: 'Greeter', description: 'Welcomes parishioners as they arrive', is_active: true, display_order: 8 },
    { parish_id: parishId, name: 'Coordinator', description: 'Coordinates and oversees liturgical ministries', is_active: true, display_order: 9 },
    { parish_id: parishId, name: 'Gift Bearer', description: 'Brings up the gifts during the offertory', is_active: true, display_order: 10 },
    { parish_id: parishId, name: 'Pre-Mass Speaker', description: 'Makes announcements before Mass begins', is_active: true, display_order: 11 },
    { parish_id: parishId, name: 'Security Team', description: 'Ensures safety and security during Mass', is_active: true, display_order: 12 },
  ]

  const { data: massRoles, error: massRolesError } = await supabase
    .from('mass_roles')
    .insert(defaultMassRoles)
    .select('id, name')

  if (massRolesError) {
    console.error('Error creating default mass roles:', massRolesError)
    throw new Error(`Failed to create default mass roles: ${massRolesError.message}`)
  }

  // =====================================================
  // 5. Seed Mass Types
  // =====================================================
  const defaultMassTypes = [
    { name: 'Sunday Day', display_order: 1 },
    { name: 'Sunday Vigil', display_order: 2 },
    { name: 'Sunday Vigil - Spanish', display_order: 3 },
  ]

  const { error: massTypesError } = await supabase
    .from('mass_types')
    .insert(
      defaultMassTypes.map((mt) => ({
        parish_id: parishId,
        name: mt.name,
        display_order: mt.display_order,
        is_system: false,
        active: true,
      }))
    )

  if (massTypesError) {
    console.error('Error creating default mass types:', massTypesError)
    throw new Error(`Failed to create default mass types: ${massTypesError.message}`)
  }

  // =====================================================
  // 6. Seed Mass Role Template
  // =====================================================
  const roleMap = new Map((massRoles || []).map((r) => [r.name, r.id]))

  // Sunday Mass template - for Sundays and Solemnities
  const { data: sundayTemplate, error: sundayTemplateError } = await supabase
    .from('mass_roles_templates')
    .insert({
      parish_id: parishId,
      name: 'Sunday Mass',
      description: 'Full minister assignments for Sunday Mass and Solemnities',
      is_active: true,
      liturgical_contexts: ['SUNDAY', 'SOLEMNITY'],
    })
    .select()
    .single()

  if (sundayTemplateError) {
    console.error('Error creating Sunday role template:', sundayTemplateError)
    throw new Error(`Failed to create Sunday role template: ${sundayTemplateError.message}`)
  }

  // Daily Mass template - for weekdays, memorials, feasts
  const { data: dailyTemplate, error: dailyTemplateError } = await supabase
    .from('mass_roles_templates')
    .insert({
      parish_id: parishId,
      name: 'Daily Mass',
      description: 'Minimal minister assignments for weekday Mass',
      is_active: true,
      liturgical_contexts: ['FEAST', 'MEMORIAL', 'WEEKDAY'],
    })
    .select()
    .single()

  if (dailyTemplateError) {
    console.error('Error creating Daily role template:', dailyTemplateError)
    throw new Error(`Failed to create Daily role template: ${dailyTemplateError.message}`)
  }

  // Role template items with counts (for Sunday Mass)
  const sundayRoleTemplateItems = [
    { roleName: 'Lector', count: 1, position: 0 },
    { roleName: 'Server', count: 2, position: 1 },
    { roleName: 'Usher', count: 4, position: 2 },
    { roleName: 'Security Team', count: 2, position: 3 },
    { roleName: 'Eucharistic Minister', count: 3, position: 4 },
  ]

  const validSundayItems = sundayRoleTemplateItems
    .filter((item) => roleMap.has(item.roleName))
    .map((item) => ({
      mass_roles_template_id: sundayTemplate.id,
      mass_role_id: roleMap.get(item.roleName),
      count: item.count,
      position: item.position,
    }))

  if (validSundayItems.length > 0) {
    const { error: sundayItemsError } = await supabase
      .from('mass_roles_template_items')
      .insert(validSundayItems)

    if (sundayItemsError) {
      console.error('Error creating Sunday template items:', sundayItemsError)
      throw new Error(`Failed to create Sunday template items: ${sundayItemsError.message}`)
    }
  }

  // Role template items for Daily Mass (minimal)
  const dailyRoleTemplateItems = [
    { roleName: 'Lector', count: 1, position: 0 },
    { roleName: 'Server', count: 1, position: 1 },
    { roleName: 'Eucharistic Minister', count: 1, position: 2 },
  ]

  const validDailyItems = dailyRoleTemplateItems
    .filter((item) => roleMap.has(item.roleName))
    .map((item) => ({
      mass_roles_template_id: dailyTemplate.id,
      mass_role_id: roleMap.get(item.roleName),
      count: item.count,
      position: item.position,
    }))

  if (validDailyItems.length > 0) {
    const { error: dailyItemsError } = await supabase
      .from('mass_roles_template_items')
      .insert(validDailyItems)

    if (dailyItemsError) {
      console.error('Error creating Daily template items:', dailyItemsError)
      throw new Error(`Failed to create Daily template items: ${dailyItemsError.message}`)
    }
  }

  // =====================================================
  // 7. Seed Mass Times Templates
  // =====================================================
  const massTimesTemplatesData = [
    {
      name: 'Sunday',
      description: 'Regular Sunday Mass schedule',
      day_of_week: 'SUNDAY',
      is_active: true,
      items: [
        { time: '09:00:00', day_type: 'IS_DAY' as const },
        { time: '11:00:00', day_type: 'IS_DAY' as const },
        { time: '16:00:00', day_type: 'DAY_BEFORE' as const },
        { time: '17:30:00', day_type: 'DAY_BEFORE' as const },
      ],
    },
    {
      name: 'Holiday',
      description: 'Holiday Mass schedule',
      day_of_week: 'MOVABLE',
      is_active: true,
      items: [{ time: '09:00:00', day_type: 'IS_DAY' as const }],
    },
    {
      name: 'Monday',
      description: 'Monday Mass schedule',
      day_of_week: 'MONDAY',
      is_active: true,
      items: [{ time: '12:05:00', day_type: 'IS_DAY' as const }],
    },
    {
      name: 'Wednesday',
      description: 'Wednesday Mass schedule',
      day_of_week: 'WEDNESDAY',
      is_active: true,
      items: [{ time: '18:00:00', day_type: 'IS_DAY' as const }],
    },
    {
      name: 'Thursday',
      description: 'Thursday Mass schedule',
      day_of_week: 'THURSDAY',
      is_active: true,
      items: [{ time: '06:00:00', day_type: 'IS_DAY' as const }],
    },
    {
      name: 'Friday',
      description: 'Friday Mass schedule',
      day_of_week: 'FRIDAY',
      is_active: true,
      items: [{ time: '12:05:00', day_type: 'IS_DAY' as const }],
    },
  ]

  for (const template of massTimesTemplatesData) {
    const { data: createdTemplate, error: templateError } = await supabase
      .from('mass_times_templates')
      .insert({
        parish_id: parishId,
        name: template.name,
        description: template.description,
        day_of_week: template.day_of_week,
        is_active: template.is_active,
      })
      .select()
      .single()

    if (templateError) {
      console.error(`Error creating mass times template ${template.name}:`, templateError)
      throw new Error(`Failed to create mass times template ${template.name}: ${templateError.message}`)
    }

    const { error: itemsError } = await supabase
      .from('mass_times_template_items')
      .insert(
        template.items.map((item) => ({
          mass_times_template_id: createdTemplate.id,
          time: item.time,
          day_type: item.day_type,
        }))
      )

    if (itemsError) {
      console.error(`Error creating mass times template items for ${template.name}:`, itemsError)
      throw new Error(`Failed to create mass times template items for ${template.name}: ${itemsError.message}`)
    }
  }

  // =====================================================
  // 8. Seed Event Types
  // =====================================================
  const defaultEventTypes = [
    { name: 'Parish Meeting', description: 'Regular parish meetings and gatherings', display_order: 1 },
    { name: 'Parish Event', description: 'General parish events and activities', display_order: 2 },
    { name: 'Reception', description: 'Receptions and social gatherings', display_order: 3 },
    { name: 'Meal', description: 'Parish meals and potlucks', display_order: 4 },
    { name: 'Fundraiser', description: 'Fundraising events and activities', display_order: 5 },
    { name: 'Ministry Meeting', description: 'Ministry-specific meetings and planning sessions', display_order: 6 },
    { name: 'Community Service', description: 'Service projects and outreach activities', display_order: 7 },
    { name: 'Youth Event', description: 'Youth group activities and events', display_order: 8 },
    { name: 'Adult Formation', description: 'Adult faith formation and education', display_order: 9 },
    { name: 'Retreat', description: 'Parish retreats and days of reflection', display_order: 10 },
    { name: 'Concert', description: 'Musical performances and concerts', display_order: 11 },
    { name: 'Festival', description: 'Parish festivals and celebrations', display_order: 12 },
    { name: 'Other', description: 'Other parish events', display_order: 99 },
  ]

  const { data: eventTypes, error: eventTypesError } = await supabase
    .from('event_types')
    .insert(
      defaultEventTypes.map((et) => ({
        parish_id: parishId,
        name: et.name,
        description: et.description,
        display_order: et.display_order,
        is_active: true,
      }))
    )
    .select()

  if (eventTypesError) {
    console.error('Error creating default event types:', eventTypesError)
    throw new Error(`Failed to create default event types: ${eventTypesError.message}`)
  }

  return {
    success: true,
    readings: readings || [],
    petitionTemplates: petitionTemplates || [],
    groupRoles: groupRoles || [],
    massRoles: massRoles || [],
    eventTypes: eventTypes || []
  }
}
