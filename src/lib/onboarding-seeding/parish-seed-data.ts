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
import { seedEventTypesForParish } from './event-types-seed'
import { seedMassEventTypesForParish } from './mass-event-types-seed'
import { seedSpecialLiturgyEventTypesForParish } from './special-liturgy-event-types-seed'
import { seedCategoryTagsForParish } from './category-tags-seed'
import { seedEventsForParish } from './events-seed'
import { seedLocationsForParish } from './locations-seed'
import { seedGroupsForParish } from './groups-seed'
import { seedEventPresetsForParish } from './event-presets-seed'
import { seedSpecialLiturgiesForParish } from './special-liturgies-seed'
import { seedNonReadingContentForParish } from './content-seed'
import { logError } from '@/lib/utils/console'

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
 * IDEMPOTENT: Safe to call multiple times - checks for existing data first.
 *
 * @param supabase - Any Supabase client (server, service role, etc.)
 * @param parishId - The parish ID to seed data for
 */
export async function seedParishData(supabase: SupabaseClient, parishId: string) {
  // =====================================================
  // CHECK FOR EXISTING DATA (make function idempotent)
  // =====================================================
  // Check if event types exist - if so, this parish has been seeded
  const { data: existingEventTypes } = await supabase
    .from('event_types')
    .select('id')
    .eq('parish_id', parishId)
    .limit(1)

  if (existingEventTypes && existingEventTypes.length > 0) {
    // Parish already has data - return existing counts
    const { data: petitionTemplates } = await supabase
      .from('petition_templates')
      .select('id')
      .eq('parish_id', parishId)

    const { data: groupRoles } = await supabase
      .from('group_roles')
      .select('id')
      .eq('parish_id', parishId)

    const { data: eventTypes } = await supabase
      .from('event_types')
      .select('id')
      .eq('parish_id', parishId)

    const { count: specialCount } = await supabase
      .from('event_types')
      .select('*', { count: 'exact', head: true })
      .eq('parish_id', parishId)
      .eq('system_type', 'special-liturgy')

    const { count: generalCount } = await supabase
      .from('event_types')
      .select('*', { count: 'exact', head: true })
      .eq('parish_id', parishId)
      .eq('system_type', 'parish-event')

    const { count: massCount } = await supabase
      .from('event_types')
      .select('*', { count: 'exact', head: true })
      .eq('parish_id', parishId)
      .eq('system_type', 'mass-liturgy')

    return {
      success: true,
      petitionTemplates: petitionTemplates || [],
      groupRoles: groupRoles || [],
      eventTypes: eventTypes || [],
      specialLiturgyEventTypesCount: specialCount || 0,
      generalEventTypesCount: generalCount || 0,
      massEventTypesCount: massCount || 0,
    }
  }

  // =====================================================
  // 1. Seed Petition Templates
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
    logError(`Error creating petition templates: ${petitionTemplatesError.message}`)
    throw new Error(`Failed to create petition templates: ${petitionTemplatesError.message}`)
  }

  // =====================================================
  // 2. Seed Group Roles
  // =====================================================
  const defaultGroupRoles = [
    { parish_id: parishId, name: 'Leader', description: 'Leads and coordinates the group', is_active: true, display_order: 1 },
    { parish_id: parishId, name: 'Member', description: 'Active participant in the group', is_active: true, display_order: 2 },
    { parish_id: parishId, name: 'Secretary', description: 'Maintains records and communications', is_active: true, display_order: 3 },
    { parish_id: parishId, name: 'Treasurer', description: 'Manages group finances', is_active: true, display_order: 4 },
    { parish_id: parishId, name: 'Coordinator', description: 'Coordinates group activities and events', is_active: true, display_order: 5 },
  ]

  // Use upsert to handle case when roles already exist (e.g., dev server restart)
  const { data: groupRoles, error: groupRolesError } = await supabase
    .from('group_roles')
    .upsert(defaultGroupRoles, { onConflict: 'parish_id,name', ignoreDuplicates: true })
    .select()

  if (groupRolesError) {
    logError(`Error creating default group roles: ${groupRolesError.message}`)
    throw new Error(`Failed to create default group roles: ${groupRolesError.message}`)
  }

  // =====================================================
  // 4. Seed Mass Times Templates
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
      logError(`Error creating mass times template ${template.name}: ${templateError.message}`)
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
      logError(`Error creating mass times template items for ${template.name}: ${itemsError.message}`)
      throw new Error(`Failed to create mass times template items for ${template.name}: ${itemsError.message}`)
    }
  }

  // =====================================================
  // 8. Seed User-Defined Event Types (Sacraments/Sacramentals)
  // =====================================================
  const userDefinedEventTypesResult = await seedEventTypesForParish(supabase, parishId)

  if (!userDefinedEventTypesResult.success) {
    logError('Error seeding user-defined event types')
    throw new Error('Failed to seed user-defined event types')
  }

  // =====================================================
  // 8b. Seed Mass Event Types (Sunday Mass, Daily Mass)
  // =====================================================
  const massEventTypesResult = await seedMassEventTypesForParish(supabase, parishId)

  if (!massEventTypesResult.success) {
    logError('Error seeding Mass event types')
    throw new Error('Failed to seed Mass event types')
  }

  // =====================================================
  // 8c. Seed Special Liturgy Event Types (Easter Vigil, Holy Thursday, Good Friday)
  // =====================================================
  const specialLiturgyEventTypesResult = await seedSpecialLiturgyEventTypesForParish(supabase, parishId)

  if (!specialLiturgyEventTypesResult.success) {
    logError('Error seeding Special Liturgy event types')
    throw new Error('Failed to seed Special Liturgy event types')
  }

  // =====================================================
  // 8d. Seed Default Locations (Parish Church, Hall, Funeral Home)
  // =====================================================
  const locationsResult = await seedLocationsForParish(supabase, parishId)
  const defaultLocationId = locationsResult.churchLocation?.id || null

  // =====================================================
  // 8e. Seed Event Presets (Religious Education, Staff Meeting)
  // =====================================================
  await seedEventPresetsForParish(supabase, {
    parishId,
    defaultLocationId
  })

  // =====================================================
  // 8f. Seed Default Groups (Parish Council, Finance Council, etc.)
  // =====================================================
  await seedGroupsForParish(supabase, parishId)

  // =====================================================
  // 9. Seed Category Tags
  // =====================================================
  await seedCategoryTagsForParish(supabase, parishId)

  // =====================================================
  // 9a. Seed Non-Reading Content (prayers, instructions, announcements)
  // Note: Scripture readings are seeded only in dev by seed-readings.ts
  // =====================================================
  await seedNonReadingContentForParish(supabase, parishId)

  // =====================================================
  // 9b. Seed Sample Parish Events (Bible Study, Fundraiser, etc.)
  // =====================================================
  await seedEventsForParish(supabase, parishId)

  // =====================================================
  // 9c. Seed Sample Special Liturgies (Baptisms, Quinceañeras, Presentations)
  // Note: Weddings and Funerals are seeded by dev seeder (they need readings)
  // =====================================================
  await seedSpecialLiturgiesForParish(supabase, parishId, {
    churchLocationId: locationsResult.churchLocation?.id || null,
    hallLocationId: locationsResult.hallLocation?.id || null,
    funeralHomeLocationId: locationsResult.funeralHomeLocation?.id || null
  })

  // =====================================================
  // 10. Assign Tags to Petition Templates
  // =====================================================
  // Now that category tags are created, we can assign them to petition templates
  const { data: categoryTags, error: categoryTagsError } = await supabase
    .from('category_tags')
    .select('id, slug')
    .eq('parish_id', parishId)

  if (categoryTagsError) {
    logError(`Error fetching category tags: ${categoryTagsError.message}`)
    // Don't throw - templates are created, just log the error
  }

  if (categoryTags && petitionTemplates) {
    // Create a map of slug -> tag id for quick lookup
    const tagSlugToId = new Map(categoryTags.map(t => [t.slug, t.id]))

    // Build tag assignments for petition templates
    const tagAssignments: { tag_id: string; entity_type: string; entity_id: string }[] = []

    for (let i = 0; i < petitionTemplates.length; i++) {
      const template = petitionTemplates[i]
      const templateDef = defaultPetitionTemplates[i]

      if (templateDef.tags && templateDef.tags.length > 0) {
        for (const tagSlug of templateDef.tags) {
          const tagId = tagSlugToId.get(tagSlug)
          if (tagId) {
            tagAssignments.push({
              tag_id: tagId,
              entity_type: 'petition_template',
              entity_id: template.id
            })
          }
        }
      }
    }

    if (tagAssignments.length > 0) {
      const { error: tagAssignmentsError } = await supabase
        .from('tag_assignments')
        .insert(tagAssignments)

      if (tagAssignmentsError) {
        logError(`Error creating petition template tag assignments: ${tagAssignmentsError.message}`)
        // Don't throw - templates are created, just log the error
      }
    }
  }

  return {
    success: true,
    petitionTemplates: petitionTemplates || [],
    groupRoles: groupRoles || [],
    eventTypes: [...userDefinedEventTypesResult.eventTypes, ...massEventTypesResult.eventTypes, ...specialLiturgyEventTypesResult.eventTypes],
    specialLiturgyEventTypesCount: (userDefinedEventTypesResult.specialLiturgyCount || 0) + specialLiturgyEventTypesResult.eventTypes.length,
    generalEventTypesCount: userDefinedEventTypesResult.generalEventCount || 0,
    massEventTypesCount: massEventTypesResult.eventTypes.length
  }
}
