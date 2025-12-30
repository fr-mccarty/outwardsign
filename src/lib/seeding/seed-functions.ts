/**
 * Shared Seeding Functions
 *
 * Core seeding logic used by both dev seeder and production seeder.
 * These functions handle all database operations for seeding sample data.
 *
 * Usage:
 * - Dev seeder: imports these and adds avatar uploads, dev user creation
 * - Production seeder: imports these directly via the server action
 */

import type { SeederContext, CreatedPerson, CreatedFamily } from './types'
import {
  SAMPLE_PEOPLE,
  SAMPLE_FAMILIES,
  INTENTION_TEXTS,
  ENTRANCE_HYMNS,
  OFFERTORY_HYMNS,
  COMMUNION_HYMNS,
  RECESSIONAL_HYMNS,
} from './sample-data'
import { LITURGICAL_COLOR_VALUES, type LiturgicalColor } from '@/lib/constants'

// Create a lookup object for liturgical colors
const COLORS = LITURGICAL_COLOR_VALUES.reduce((acc, color) => {
  acc[color] = color
  return acc
}, {} as Record<LiturgicalColor, LiturgicalColor>)

// =====================================================
// Seed People
// =====================================================

export async function seedPeople(ctx: SeederContext): Promise<{ people: CreatedPerson[] }> {
  const { supabase, parishId } = ctx

  const { data: people } = await supabase
    .from('people')
    .insert(
      SAMPLE_PEOPLE.map((person) => ({
        parish_id: parishId,
        first_name: person.firstName,
        last_name: person.lastName,
        email: person.email,
        phone_number: person.phone,
        sex: person.sex,
        city: person.city,
        state: person.state,
      }))
    )
    .select('id, first_name, last_name, full_name')

  return { people: people || [] }
}

// =====================================================
// Seed Families
// =====================================================

export async function seedFamilies(
  ctx: SeederContext,
  people: CreatedPerson[]
): Promise<{ families: CreatedFamily[]; membershipsCreated: number }> {
  const { supabase, parishId } = ctx

  // Create a map to find people by name
  const peopleByName = new Map<string, CreatedPerson>()
  for (const person of people) {
    const key = `${person.first_name}|${person.last_name}`
    peopleByName.set(key, person)
  }

  const createdFamilies: CreatedFamily[] = []
  let totalMemberships = 0

  for (const familyDef of SAMPLE_FAMILIES) {
    const { data: family, error: familyError } = await supabase
      .from('families')
      .insert({
        parish_id: parishId,
        family_name: familyDef.familyName,
        active: familyDef.active,
      })
      .select('id, family_name')
      .single()

    if (familyError || !family) continue

    createdFamilies.push(family)

    // Add family members
    for (const memberDef of familyDef.members) {
      const personKey = `${memberDef.firstName}|${memberDef.lastName}`
      const person = peopleByName.get(personKey)

      if (!person) continue

      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          person_id: person.id,
          relationship: memberDef.relationship,
          is_primary_contact: memberDef.isPrimaryContact,
        })

      if (!memberError) {
        totalMemberships++
      }
    }
  }

  return { families: createdFamilies, membershipsCreated: totalMemberships }
}

// =====================================================
// Seed Group Memberships
// =====================================================

export async function seedGroupMemberships(
  ctx: SeederContext,
  people: CreatedPerson[]
): Promise<{ membershipsCreated: number }> {
  const { supabase, parishId } = ctx

  if (people.length === 0) {
    return { membershipsCreated: 0 }
  }

  // Fetch groups and roles
  const { data: groups } = await supabase
    .from('groups')
    .select('id, name')
    .eq('parish_id', parishId)

  const { data: groupRoles } = await supabase
    .from('group_roles')
    .select('*')
    .eq('parish_id', parishId)

  if (!groups || groups.length < 4 || !groupRoles || groupRoles.length === 0) {
    return { membershipsCreated: 0 }
  }

  const leaderRole = groupRoles.find(r => r.name === 'Leader')
  const coordinatorRole = groupRoles.find(r => r.name === 'Coordinator')
  const secretaryRole = groupRoles.find(r => r.name === 'Secretary')
  const memberRole = groupRoles.find(r => r.name === 'Member')

  const memberships = [
    { group_id: groups[0].id, person_id: people[0].id, group_role_id: leaderRole?.id },
    { group_id: groups[0].id, person_id: people[1].id, group_role_id: memberRole?.id },
    { group_id: groups[1].id, person_id: people[2].id, group_role_id: coordinatorRole?.id },
    { group_id: groups[1].id, person_id: people[3].id, group_role_id: secretaryRole?.id },
    { group_id: groups[2].id, person_id: people[4].id, group_role_id: memberRole?.id },
    { group_id: groups[3].id, person_id: people[0].id, group_role_id: memberRole?.id },
    { group_id: groups[3].id, person_id: people[3].id, group_role_id: memberRole?.id },
  ]

  const { error } = await supabase.from('group_members').insert(memberships)

  return { membershipsCreated: error ? 0 : memberships.length }
}

// =====================================================
// Seed Masses
// =====================================================

interface InputFieldDef {
  id: string
  type: string
  property_name: string
  is_primary: boolean
  is_per_calendar_event: boolean
  deleted_at: string | null
}

export async function seedMasses(
  ctx: SeederContext,
  people: CreatedPerson[],
  churchLocation: { id: string } | null
): Promise<{ massesCreated: number; assignmentsCreated: number }> {
  const { supabase, parishId } = ctx

  if (!churchLocation || people.length === 0) {
    return { massesCreated: 0, assignmentsCreated: 0 }
  }

  // Fetch Mass event types
  const { data: massEventTypes } = await supabase
    .from('event_types')
    .select('id, name, slug, input_field_definitions!input_field_definitions_event_type_id_fkey(*)')
    .eq('parish_id', parishId)
    .in('slug', ['sunday-mass', 'daily-mass'])
    .is('deleted_at', null)

  const sundayMassEventType = massEventTypes?.find(et => et.slug === 'sunday-mass')
  const dailyMassEventType = massEventTypes?.find(et => et.slug === 'daily-mass')

  if (!sundayMassEventType && !dailyMassEventType) {
    return { massesCreated: 0, assignmentsCreated: 0 }
  }

  // Fetch mass times templates with their items and role_quantities
  // This is the source of truth for how many of each role is needed
  const { data: templates } = await supabase
    .from('mass_times_templates')
    .select(`
      id,
      name,
      day_of_week,
      mass_times_template_items (
        id,
        time,
        day_type,
        role_quantities
      )
    `)
    .eq('parish_id', parishId)
    .eq('is_active', true)

  // Build a lookup for role quantities by day and time
  type RoleQuantities = Record<string, number>
  const roleQuantitiesByDayTime: Record<string, RoleQuantities> = {}

  // Day of week mapping (JavaScript: 0=Sunday, database: SUNDAY, MONDAY, etc.)
  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

  if (templates) {
    for (const template of templates) {
      const dayOfWeek = template.day_of_week
      const items = template.mass_times_template_items as Array<{
        time: string
        day_type: string
        role_quantities: RoleQuantities | null
      }> | undefined

      if (items) {
        for (const item of items) {
          // Create a key like "SUNDAY_10:00:00" or "MONDAY_08:00:00"
          const key = `${dayOfWeek}_${item.time}`
          if (item.role_quantities) {
            roleQuantitiesByDayTime[key] = item.role_quantities
          }
        }
      }
    }
  }

  // Helper to get role quantities for a specific day/time, with fallback defaults
  const getRoleQuantities = (dayOfWeek: number, time: string, isSunday: boolean): RoleQuantities => {
    const dayName = dayNames[dayOfWeek]
    const key = `${dayName}_${time}`

    // Try to get from mass_times_template_items
    if (roleQuantitiesByDayTime[key]) {
      return roleQuantitiesByDayTime[key]
    }

    // Fallback: use minimal defaults (only 1 per role) if no template exists
    // This prevents overfilling when no quantities are defined
    if (isSunday) {
      return {
        presider: 1,
        homilist: 1,
        lector: 1,
        eucharistic_minister: 1,
        altar_server: 1,
        usher: 1,
        cantor: 1,
        musician: 1,
        sacristan: 1,
      }
    } else {
      return {
        presider: 1,
        homilist: 1,
        lector: 1,
        eucharistic_minister: 1,
        altar_server: 1,
        usher: 1,
        cantor: 1,
      }
    }
  }

  // Helper functions
  const getSundayDate = (weeksFromNow: number) => {
    const date = new Date()
    const dayOfWeek = date.getDay()
    const daysUntilSunday = (7 - dayOfWeek) % 7
    date.setDate(date.getDate() + daysUntilSunday + (weeksFromNow * 7))
    return date.toISOString().split('T')[0]
  }

  const getPrimaryCalendarEventField = (eventType: { input_field_definitions?: InputFieldDef[] }) => {
    if (!eventType?.input_field_definitions) return null
    return eventType.input_field_definitions.find(
      (field) => field.type === 'calendar_event' && field.is_primary && !field.deleted_at
    )
  }

  const getPersonFields = (eventType: { input_field_definitions?: InputFieldDef[] }) => {
    if (!eventType?.input_field_definitions) return []
    return eventType.input_field_definitions.filter(
      (field) => field.type === 'person' && !field.deleted_at
    )
  }

  // Track person index globally to distribute people across all masses
  let personIndex = 0
  const getNextPerson = () => {
    const person = people[personIndex % people.length]
    personIndex++
    return person
  }

  let massesCreated = 0
  let totalAssignments = 0

  // Create Sunday Masses (8 weeks)
  if (sundayMassEventType) {
    const primaryField = getPrimaryCalendarEventField(sundayMassEventType)
    if (primaryField) {
      for (let week = 0; week < 8; week++) {
        const massDate = getSundayDate(week)
        const colors = [COLORS.GREEN, COLORS.GREEN, COLORS.GREEN, COLORS.WHITE, COLORS.GREEN, COLORS.GREEN, COLORS.RED, COLORS.GREEN]

        const { data: newEvent, error: eventError } = await supabase
          .from('master_events')
          .insert({
            parish_id: parishId,
            event_type_id: sundayMassEventType.id,
            field_values: {
              announcements: week % 2 === 0
                ? 'Parish Picnic next Sunday after all Masses. Bring a side dish to share!'
                : 'Faith Formation registration is now open. Please visit the parish office.',
              entrance_hymn: ENTRANCE_HYMNS[week % 4],
              offertory_hymn: OFFERTORY_HYMNS[week % 4],
              communion_hymn: COMMUNION_HYMNS[week % 4],
              recessional_hymn: RECESSIONAL_HYMNS[week % 4],
            },
            liturgical_color: colors[week],
            status: 'ACTIVE'
          })
          .select()
          .single()

        if (eventError || !newEvent) continue

        const massTime = '10:00:00'
        const startDatetime = new Date(`${massDate}T${massTime}`).toISOString()
        const { data: newCalendarEvent, error: calendarError } = await supabase
          .from('calendar_events')
          .insert({
            parish_id: parishId,
            master_event_id: newEvent.id,
            input_field_definition_id: primaryField.id,
            start_datetime: startDatetime,
            location_id: churchLocation.id,
            show_on_calendar: true,
            is_cancelled: false
          })
          .select()
          .single()

        if (calendarError || !newCalendarEvent) {
          await supabase.from('master_events').delete().eq('id', newEvent.id)
          continue
        }

        massesCreated++

        // Get role quantities from the database (or fallback)
        // Sunday = dayOfWeek 0
        const roleQuantities = getRoleQuantities(0, massTime, true)

        // Assign ministers - fill positions based on actual role quantities from database
        const personFields = getPersonFields(sundayMassEventType)
        const assignments: Array<{
          master_event_id: string
          calendar_event_id: string | null
          field_definition_id: string
          person_id: string
        }> = []

        for (const field of personFields) {
          // Get quantity for this role from the database (default to 1 if not specified)
          const quantity = roleQuantities[field.property_name] || 1

          // Create assignments based on the quantity defined in role_quantities
          for (let i = 0; i < quantity; i++) {
            assignments.push({
              master_event_id: newEvent.id,
              calendar_event_id: field.is_per_calendar_event ? newCalendarEvent.id : null,
              field_definition_id: field.id,
              person_id: getNextPerson().id
            })
          }
        }

        if (assignments.length > 0) {
          const { error: assignmentError } = await supabase.from('people_event_assignments').insert(assignments)
          if (!assignmentError) {
            totalAssignments += assignments.length
          }
        }
      }
    }
  }

  // Create Daily Masses (next 12 weekdays)
  if (dailyMassEventType) {
    const primaryField = getPrimaryCalendarEventField(dailyMassEventType)
    if (primaryField) {
      let dayCount = 0
      for (let day = 1; day <= 20 && dayCount < 12; day++) {
        const date = new Date()
        date.setDate(date.getDate() + day)
        const dayOfWeek = date.getDay()

        if (dayOfWeek === 0 || dayOfWeek === 6) continue

        const massDate = date.toISOString().split('T')[0]
        const colors = [COLORS.GREEN, COLORS.GREEN, COLORS.WHITE, COLORS.GREEN, COLORS.GREEN, COLORS.RED, COLORS.GREEN, COLORS.GREEN, COLORS.GREEN, COLORS.WHITE, COLORS.GREEN, COLORS.GREEN]

        const { data: newEvent, error: eventError } = await supabase
          .from('master_events')
          .insert({
            parish_id: parishId,
            event_type_id: dailyMassEventType.id,
            field_values: {},
            liturgical_color: colors[dayCount],
            status: 'ACTIVE'
          })
          .select()
          .single()

        if (eventError || !newEvent) continue

        const massTime = '08:00:00'
        const startDatetime = new Date(`${massDate}T${massTime}`).toISOString()
        const { data: newCalendarEvent, error: calendarError } = await supabase
          .from('calendar_events')
          .insert({
            parish_id: parishId,
            master_event_id: newEvent.id,
            input_field_definition_id: primaryField.id,
            start_datetime: startDatetime,
            location_id: churchLocation.id,
            show_on_calendar: true,
            is_cancelled: false
          })
          .select()
          .single()

        if (calendarError || !newCalendarEvent) {
          await supabase.from('master_events').delete().eq('id', newEvent.id)
          continue
        }

        massesCreated++
        dayCount++

        // Get role quantities from the database (or fallback)
        const roleQuantities = getRoleQuantities(dayOfWeek, massTime, false)

        // Assign ministers for daily Mass - fill positions based on actual role quantities
        const personFields = getPersonFields(dailyMassEventType)
        const assignments: Array<{
          master_event_id: string
          calendar_event_id: string | null
          field_definition_id: string
          person_id: string
        }> = []

        for (const field of personFields) {
          // Get quantity for this role from the database (default to 1 if not specified)
          const quantity = roleQuantities[field.property_name] || 1

          // Create assignments based on the quantity defined in role_quantities
          for (let i = 0; i < quantity; i++) {
            assignments.push({
              master_event_id: newEvent.id,
              calendar_event_id: field.is_per_calendar_event ? newCalendarEvent.id : null,
              field_definition_id: field.id,
              person_id: getNextPerson().id
            })
          }
        }

        if (assignments.length > 0) {
          const { error: assignmentError } = await supabase.from('people_event_assignments').insert(assignments)
          if (!assignmentError) {
            totalAssignments += assignments.length
          }
        }
      }
    }
  }

  return { massesCreated, assignmentsCreated: totalAssignments }
}

// =====================================================
// Seed Mass Intentions
// =====================================================

export async function seedMassIntentions(
  ctx: SeederContext,
  people: CreatedPerson[]
): Promise<{ intentionsCreated: number }> {
  const { supabase, parishId } = ctx

  if (people.length < 5) {
    return { intentionsCreated: 0 }
  }

  // Get calendar events to link some intentions
  const { data: calendarEvents } = await supabase
    .from('calendar_events')
    .select('id')
    .eq('parish_id', parishId)
    .is('deleted_at', null)
    .limit(5)

  const calendarEventIds = calendarEvents?.map(ce => ce.id) || []

  const getDate = (daysOffset: number) => {
    const date = new Date()
    date.setDate(date.getDate() + daysOffset)
    return date.toISOString().split('T')[0]
  }

  const intentionsToCreate = []

  // Create linked intentions
  for (let i = 0; i < Math.min(5, calendarEventIds.length); i++) {
    const person = people[i]
    const requester = people[(i + 5) % people.length]
    intentionsToCreate.push({
      parish_id: parishId,
      calendar_event_id: calendarEventIds[i],
      mass_offered_for: `${INTENTION_TEXTS[i % INTENTION_TEXTS.length]} ${person.first_name} ${person.last_name}`,
      requested_by_id: requester.id,
      date_received: getDate(-7 - i),
      stipend_in_cents: [1000, 1500, 2000, 1000, 2500][i],
      status: 'SCHEDULED',
    })
  }

  // Create standalone intentions
  const statuses = ['REQUESTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED']
  for (let i = 0; i < 5; i++) {
    const person = people[(i + 3) % people.length]
    const requester = people[(i + 7) % people.length]
    intentionsToCreate.push({
      parish_id: parishId,
      calendar_event_id: null,
      mass_offered_for: `${INTENTION_TEXTS[(i + 3) % INTENTION_TEXTS.length]} ${person.first_name} ${person.last_name}`,
      requested_by_id: requester.id,
      date_received: getDate(-14 + i),
      stipend_in_cents: [1000, 0, 1500, 1000, 2000][i],
      status: statuses[i % 4],
    })
  }

  // Create historical completed intentions
  for (let i = 0; i < 2; i++) {
    const person = people[(i + 8) % people.length]
    const requester = people[(i + 2) % people.length]
    intentionsToCreate.push({
      parish_id: parishId,
      calendar_event_id: null,
      mass_offered_for: `${INTENTION_TEXTS[(i + 5) % INTENTION_TEXTS.length]} ${person.first_name} ${person.last_name}`,
      requested_by_id: requester.id,
      date_received: getDate(-30 - i * 7),
      stipend_in_cents: 1500,
      status: 'COMPLETED',
    })
  }

  const { data: inserted, error } = await supabase
    .from('mass_intentions')
    .insert(intentionsToCreate)
    .select('id')

  return { intentionsCreated: error ? 0 : (inserted?.length || 0) }
}

// =====================================================
// Seed Weddings and Funerals
// =====================================================

export async function seedWeddingsAndFunerals(
  ctx: SeederContext,
  people: CreatedPerson[],
  churchLocation: { id: string } | null
): Promise<{ weddingsCreated: number; funeralsCreated: number }> {
  const { supabase, parishId } = ctx

  if (!churchLocation || people.length < 15) {
    return { weddingsCreated: 0, funeralsCreated: 0 }
  }

  // Fetch event types
  const { data: eventTypes } = await supabase
    .from('event_types')
    .select('*, input_field_definitions!input_field_definitions_event_type_id_fkey(*)')
    .eq('parish_id', parishId)
    .is('deleted_at', null)
    .in('slug', ['weddings', 'funerals'])

  const weddingType = eventTypes?.find(et => et.slug === 'weddings')
  const funeralType = eventTypes?.find(et => et.slug === 'funerals')

  // Fetch locations
  const { data: locations } = await supabase
    .from('locations')
    .select('id, name')
    .eq('parish_id', parishId)

  const hallLocation = locations?.find(l => l.name.includes('Hall'))
  const funeralHomeLocation = locations?.find(l => l.name.includes('Funeral'))

  // Helper to get content IDs by tags
  const { data: tags } = await supabase
    .from('category_tags')
    .select('id, slug')
    .eq('parish_id', parishId)

  const tagMap = new Map(tags?.map(t => [t.slug, t.id]) || [])

  const getContentIdsByTags = async (sacramentSlug: string, sectionSlug: string): Promise<string[]> => {
    const sacramentTagId = tagMap.get(sacramentSlug)
    const sectionTagId = tagMap.get(sectionSlug)
    if (!sacramentTagId || !sectionTagId) return []

    const { data: sacramentAssignments } = await supabase
      .from('tag_assignments')
      .select('entity_id')
      .eq('tag_id', sacramentTagId)
      .eq('entity_type', 'content')

    if (!sacramentAssignments) return []

    const { data: sectionAssignments } = await supabase
      .from('tag_assignments')
      .select('entity_id')
      .eq('tag_id', sectionTagId)
      .eq('entity_type', 'content')
      .in('entity_id', sacramentAssignments.map(a => a.entity_id))

    return sectionAssignments?.map(a => a.entity_id) || []
  }

  const getFutureDate = (daysFromNow: number) => {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    return date.toISOString().split('T')[0]
  }

  const getPastDate = (daysAgo: number) => {
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    return date.toISOString().split('T')[0]
  }

  type FieldDefinition = {
    id: string
    type: string
    property_name: string
    is_primary: boolean
    is_per_calendar_event: boolean
    deleted_at: string | null
  }

  type EventTypeWithFields = {
    id: string
    input_field_definitions?: FieldDefinition[]
  }

  const getPrimaryField = (eventType: EventTypeWithFields) => {
    if (!eventType?.input_field_definitions) return null
    return eventType.input_field_definitions.find(
      f => f.type === 'calendar_event' && f.is_primary && !f.deleted_at
    )
  }

  const getPersonFields = (eventType: EventTypeWithFields) => {
    if (!eventType?.input_field_definitions) return []
    return eventType.input_field_definitions.filter(
      f => f.type === 'person' && !f.deleted_at
    )
  }

  // Track person index to distribute people across events
  let personIndex = 0
  const getNextPerson = () => {
    const person = people[personIndex % people.length]
    personIndex++
    return person
  }

  let weddingsCreated = 0
  let funeralsCreated = 0

  // Create two weddings
  if (weddingType) {
    const primaryField = getPrimaryField(weddingType)
    if (primaryField) {
      const weddingFirstReadings = await getContentIdsByTags('wedding', 'first-reading')
      const weddingPsalms = await getContentIdsByTags('wedding', 'psalm')
      const weddingSecondReadings = await getContentIdsByTags('wedding', 'second-reading')
      const weddingGospels = await getContentIdsByTags('wedding', 'gospel')

      // Wedding configurations: different dates and readings
      const weddingConfigs = [
        { daysFromNow: 45, time: '14:00:00', readingIndex: 0 },
        { daysFromNow: 75, time: '11:00:00', readingIndex: 1 },
      ]

      for (const config of weddingConfigs) {
        const { data: newWedding, error: weddingError } = await supabase
          .from('master_events')
          .insert({
            parish_id: parishId,
            event_type_id: weddingType.id,
            field_values: {
              reception_location: hallLocation?.id || '',
              first_reading: weddingFirstReadings[config.readingIndex] || weddingFirstReadings[0] || '',
              psalm: weddingPsalms[config.readingIndex] || weddingPsalms[0] || '',
              second_reading: weddingSecondReadings[config.readingIndex] || weddingSecondReadings[0] || '',
              gospel_reading: weddingGospels[config.readingIndex] || weddingGospels[0] || '',
            },
            liturgical_color: COLORS.WHITE,
            status: 'ACTIVE'
          })
          .select()
          .single()

        if (weddingError || !newWedding) continue

        const startDatetime = new Date(`${getFutureDate(config.daysFromNow)}T${config.time}`).toISOString()
        const { data: newCalendarEvent, error: calendarError } = await supabase
          .from('calendar_events')
          .insert({
            parish_id: parishId,
            master_event_id: newWedding.id,
            input_field_definition_id: primaryField.id,
            start_datetime: startDatetime,
            location_id: churchLocation.id,
            show_on_calendar: true,
            is_cancelled: false
          })
          .select()
          .single()

        if (calendarError || !newCalendarEvent) {
          await supabase.from('master_events').delete().eq('id', newWedding.id)
          continue
        }

        weddingsCreated++

        // Assign people to all person fields dynamically
        const personFields = getPersonFields(weddingType)
        const assignments: Array<{
          master_event_id: string
          calendar_event_id: string | null
          field_definition_id: string
          person_id: string
        }> = []

        for (const field of personFields) {
          assignments.push({
            master_event_id: newWedding.id,
            calendar_event_id: field.is_per_calendar_event ? newCalendarEvent.id : null,
            field_definition_id: field.id,
            person_id: getNextPerson().id
          })
        }

        if (assignments.length > 0) {
          await supabase.from('people_event_assignments').insert(assignments)
        }
      }
    }
  }

  // Create one funeral
  if (funeralType) {
    const primaryField = getPrimaryField(funeralType)
    if (primaryField) {
      const funeralFirstReadings = await getContentIdsByTags('funeral', 'first-reading')
      const funeralPsalms = await getContentIdsByTags('funeral', 'psalm')
      const funeralSecondReadings = await getContentIdsByTags('funeral', 'second-reading')
      const funeralGospels = await getContentIdsByTags('funeral', 'gospel')

      const { data: newFuneral, error: funeralError } = await supabase
        .from('master_events')
        .insert({
          parish_id: parishId,
          event_type_id: funeralType.id,
          field_values: {
            date_of_death: getPastDate(3),
            burial_location: funeralHomeLocation?.id || '',
            first_reading: funeralFirstReadings[0] || '',
            psalm: funeralPsalms[0] || '',
            second_reading: funeralSecondReadings[0] || '',
            gospel_reading: funeralGospels[0] || '',
          },
          liturgical_color: COLORS.WHITE,
          status: 'ACTIVE'
        })
        .select()
        .single()

      if (!funeralError && newFuneral) {
        const startDatetime = new Date(`${getFutureDate(5)}T10:00:00`).toISOString()
        const { data: newCalendarEvent, error: calendarError } = await supabase
          .from('calendar_events')
          .insert({
            parish_id: parishId,
            master_event_id: newFuneral.id,
            input_field_definition_id: primaryField.id,
            start_datetime: startDatetime,
            location_id: churchLocation.id,
            show_on_calendar: true,
            is_cancelled: false
          })
          .select()
          .single()

        if (!calendarError && newCalendarEvent) {
          funeralsCreated++

          // Assign people to all person fields dynamically
          const personFields = getPersonFields(funeralType)
          const assignments: Array<{
            master_event_id: string
            calendar_event_id: string | null
            field_definition_id: string
            person_id: string
          }> = []

          for (const field of personFields) {
            assignments.push({
              master_event_id: newFuneral.id,
              calendar_event_id: field.is_per_calendar_event ? newCalendarEvent.id : null,
              field_definition_id: field.id,
              person_id: getNextPerson().id
            })
          }

          if (assignments.length > 0) {
            await supabase.from('people_event_assignments').insert(assignments)
          }
        }
      }
    }
  }

  return { weddingsCreated, funeralsCreated }
}

// =====================================================
// Seed Parish Settings (JSONB columns)
// =====================================================

export async function seedParishSettings(ctx: SeederContext): Promise<{ updated: boolean }> {
  const { supabase, parishId } = ctx

  // Update parish_settings with JSONB data for quick amounts
  const { error } = await supabase
    .from('parish_settings')
    .update({
      mass_intention_offering_quick_amount: [10, 15, 20, 25, 50],
      donations_quick_amount: [25, 50, 100, 250, 500],
      liturgical_locale: 'en_US'
    })
    .eq('parish_id', parishId)

  return { updated: !error }
}

// =====================================================
// Seed Mass Times Role Quantities (JSONB)
// =====================================================

export async function seedMassTimesRoleQuantities(
  ctx: SeederContext,
  people: CreatedPerson[]
): Promise<{ itemsUpdated: number }> {
  const { supabase, parishId } = ctx

  // Fetch existing mass times template items
  const { data: templates } = await supabase
    .from('mass_times_templates')
    .select('id, name, day_of_week')
    .eq('parish_id', parishId)
    .eq('is_active', true)

  if (!templates || templates.length === 0) {
    return { itemsUpdated: 0 }
  }

  // Get church location for assignments
  const { data: locations } = await supabase
    .from('locations')
    .select('id, name')
    .eq('parish_id', parishId)

  const churchLocation = locations?.find(l => l.name.includes('Church'))

  let itemsUpdated = 0

  for (const template of templates) {
    const { data: items } = await supabase
      .from('mass_times_template_items')
      .select('id, time, day_type')
      .eq('mass_times_template_id', template.id)

    if (!items) continue

    for (const item of items) {
      // Define role quantities based on mass type
      const isSunday = template.day_of_week === 'SUNDAY'
      const isVigil = item.day_type === 'DAY_BEFORE'

      const roleQuantities = isSunday || isVigil
        ? {
            lector: 2,
            eucharistic_minister: 4,
            altar_server: 3,
            usher: 4,
            cantor: 1,
            musician: 2,
            sacristan: 1
          }
        : {
            lector: 1,
            eucharistic_minister: 2,
            altar_server: 2,
            usher: 2,
            cantor: 1
          }

      // Assign presider and location
      const presiderIndex = itemsUpdated % people.length
      const homilistIndex = (itemsUpdated + 1) % people.length

      const { error } = await supabase
        .from('mass_times_template_items')
        .update({
          role_quantities: roleQuantities,
          presider_id: people[presiderIndex]?.id || null,
          homilist_id: people[homilistIndex]?.id || null,
          location_id: churchLocation?.id || null,
          length_of_time: isSunday || isVigil ? 75 : 45
        })
        .eq('id', item.id)

      if (!error) {
        itemsUpdated++
      }
    }
  }

  return { itemsUpdated }
}

// =====================================================
// Seed Custom Lists and Items
// =====================================================

export async function seedCustomLists(ctx: SeederContext): Promise<{ listsCreated: number; itemsCreated: number }> {
  const { supabase, parishId } = ctx

  const customListsData = [
    {
      name: 'Music Styles',
      slug: 'music-styles',
      items: ['Traditional Hymn', 'Contemporary', 'Gregorian Chant', 'Gospel', 'Spanish Hymn', 'Instrumental Only']
    },
    {
      name: 'Flower Colors',
      slug: 'flower-colors',
      items: ['White', 'Red', 'Pink', 'Purple', 'Yellow', 'Mixed Seasonal', 'No Flowers']
    },
    {
      name: 'Reception Venues',
      slug: 'reception-venues',
      items: ['Parish Hall', 'Off-site Restaurant', 'Private Residence', 'No Reception', 'To Be Determined']
    },
    {
      name: 'Altar Server Positions',
      slug: 'altar-server-positions',
      items: ['Cross Bearer', 'Candle Bearer', 'Book Bearer', 'Thurifer', 'Boat Bearer', 'Bell Ringer']
    },
    {
      name: 'RCIA Stages',
      slug: 'rcia-stages',
      items: ['Inquiry', 'Catechumenate', 'Purification & Enlightenment', 'Mystagogy', 'Completed']
    },
    {
      name: 'Communion Methods',
      slug: 'communion-methods',
      items: ['Host Only', 'Host and Cup', 'Intinction', 'Under Both Species']
    }
  ]

  let listsCreated = 0
  let itemsCreated = 0

  for (const listDef of customListsData) {
    const { data: list, error: listError } = await supabase
      .from('custom_lists')
      .insert({
        parish_id: parishId,
        name: listDef.name,
        slug: listDef.slug
      })
      .select()
      .single()

    if (listError || !list) continue

    listsCreated++

    const itemsToInsert = listDef.items.map((value, index) => ({
      list_id: list.id,
      value,
      order: index
    }))

    const { data: insertedItems, error: itemsError } = await supabase
      .from('custom_list_items')
      .insert(itemsToInsert)
      .select()

    if (!itemsError && insertedItems) {
      itemsCreated += insertedItems.length
    }
  }

  return { listsCreated, itemsCreated }
}

// =====================================================
// Seed Person Blackout Dates
// =====================================================

export async function seedPersonBlackoutDates(
  ctx: SeederContext,
  people: CreatedPerson[]
): Promise<{ blackoutDatesCreated: number }> {
  const { supabase } = ctx

  if (people.length < 5) {
    return { blackoutDatesCreated: 0 }
  }

  const getDateString = (daysFromNow: number) => {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    return date.toISOString().split('T')[0]
  }

  const blackoutDates = [
    {
      person_id: people[0].id,
      start_date: getDateString(14),
      end_date: getDateString(21),
      reason: 'Family vacation'
    },
    {
      person_id: people[1].id,
      start_date: getDateString(7),
      end_date: getDateString(9),
      reason: 'Out of town for conference'
    },
    {
      person_id: people[2].id,
      start_date: getDateString(30),
      end_date: getDateString(45),
      reason: 'Medical leave'
    },
    {
      person_id: people[3].id,
      start_date: getDateString(60),
      end_date: getDateString(75),
      reason: 'Summer travel'
    },
    {
      person_id: people[4].id,
      start_date: getDateString(3),
      end_date: getDateString(5),
      reason: 'Personal commitment'
    },
    {
      person_id: people[5 % people.length].id,
      start_date: getDateString(90),
      end_date: getDateString(97),
      reason: 'Pilgrimage to Rome'
    },
    {
      person_id: people[6 % people.length].id,
      start_date: getDateString(120),
      end_date: getDateString(135),
      reason: 'Christmas holiday travel'
    }
  ]

  const { data: inserted, error } = await supabase
    .from('person_blackout_dates')
    .insert(blackoutDates)
    .select()

  return { blackoutDatesCreated: error ? 0 : (inserted?.length || 0) }
}

// =====================================================
// Seed Parishioner Notifications
// =====================================================

export async function seedParishionerNotifications(
  ctx: SeederContext,
  people: CreatedPerson[]
): Promise<{ notificationsCreated: number }> {
  const { supabase, parishId } = ctx

  if (people.length < 3) {
    return { notificationsCreated: 0 }
  }

  const notifications = [
    {
      parish_id: parishId,
      person_id: people[0].id,
      notification_type: 'ministry_message',
      title: 'Upcoming Lector Schedule',
      message: 'You have been scheduled to serve as lector for the 10:00 AM Mass this Sunday. Please arrive 15 minutes early for preparation.',
      sender_name: 'Parish Office',
      is_read: false
    },
    {
      parish_id: parishId,
      person_id: people[0].id,
      notification_type: 'schedule_update',
      title: 'Schedule Change',
      message: 'The Wednesday evening Mass time has been changed from 6:00 PM to 7:00 PM starting next week.',
      sender_name: people[0].full_name,
      is_read: true,
      read_at: new Date().toISOString()
    },
    {
      parish_id: parishId,
      person_id: people[1].id,
      notification_type: 'reminder',
      title: 'Volunteer Appreciation Dinner',
      message: 'Don\'t forget! The annual Volunteer Appreciation Dinner is this Friday at 6:30 PM in the Parish Hall.',
      sender_name: 'Ministry Coordinator',
      is_read: false
    },
    {
      parish_id: parishId,
      person_id: people[2].id,
      notification_type: 'system',
      title: 'Profile Updated',
      message: 'Your contact information has been updated successfully. If you did not make this change, please contact the parish office.',
      sender_name: 'System',
      is_read: true,
      read_at: new Date().toISOString()
    },
    {
      parish_id: parishId,
      person_id: people[1].id,
      notification_type: 'ministry_message',
      title: 'EMHC Training Session',
      message: 'A refresher training session for Extraordinary Ministers of Holy Communion will be held on Saturday at 9:00 AM. Your attendance is requested.',
      sender_name: people[1].full_name,
      is_read: false
    }
  ]

  const { data: inserted, error } = await supabase
    .from('parishioner_notifications')
    .insert(notifications)
    .select()

  return { notificationsCreated: error ? 0 : (inserted?.length || 0) }
}

// =====================================================
// Seed Enhanced Event Presets (JSONB preset_data)
// =====================================================

export async function seedEnhancedEventPresets(
  ctx: SeederContext,
  people: CreatedPerson[]
): Promise<{ presetsCreated: number }> {
  const { supabase, parishId } = ctx

  if (people.length < 5) {
    return { presetsCreated: 0 }
  }

  // Fetch event types with their field definitions - include more event types
  const { data: eventTypes } = await supabase
    .from('event_types')
    .select('id, name, slug, input_field_definitions!input_field_definitions_event_type_id_fkey(*)')
    .eq('parish_id', parishId)
    .is('deleted_at', null)
    .in('slug', ['weddings', 'funerals', 'sunday-mass', 'daily-mass', 'baptisms', 'quinceaneras'])

  if (!eventTypes || eventTypes.length === 0) {
    return { presetsCreated: 0 }
  }

  // Get all locations for variety
  const { data: locations } = await supabase
    .from('locations')
    .select('id, name')
    .eq('parish_id', parishId)

  const churchLocation = locations?.find(l => l.name.includes('Church'))
  const hallLocation = locations?.find(l => l.name.includes('Hall'))
  const chapelLocation = locations?.find(l => l.name.includes('Chapel'))
  const funeralHomeLocation = locations?.find(l => l.name.includes('Funeral'))

  type FieldDef = { id: string; type: string; is_primary: boolean; property_name: string; deleted_at: string | null }

  const getPrimaryField = (eventType: { input_field_definitions?: FieldDef[] }) => {
    if (!eventType?.input_field_definitions) return null
    return eventType.input_field_definitions.find(
      f => f.type === 'calendar_event' && f.is_primary && !f.deleted_at
    )
  }

  let presetsCreated = 0

  // =====================================================
  // WEDDING PRESETS - Multiple options with different presiders
  // =====================================================
  const weddingType = eventTypes.find(et => et.slug === 'weddings')
  if (weddingType) {
    const primaryField = getPrimaryField(weddingType)
    if (primaryField) {
      // Wedding Preset 1: Traditional with people[0]
      const { error: error1 } = await supabase
        .from('event_presets')
        .insert({
          parish_id: parishId,
          event_type_id: weddingType.id,
          name: 'Traditional Catholic Wedding',
          description: `Full nuptial Mass with traditional elements, presided by ${people[0]?.full_name}`,
          preset_data: {
            field_values: {
              reception_location: hallLocation?.id || '',
              notes: 'Includes full nuptial Mass, exchange of vows, blessing of rings, and unity candle ceremony.'
            },
            presider_id: people[0]?.id || null,
            homilist_id: people[0]?.id || null,
            calendar_events: {
              [primaryField.property_name]: {
                location_id: churchLocation?.id || null,
                is_all_day: false,
                duration_minutes: 90
              }
            }
          },
          created_by: null
        })
      if (!error1) presetsCreated++

      // Wedding Preset 2: Simple ceremony with people[1]
      const { error: error2 } = await supabase
        .from('event_presets')
        .insert({
          parish_id: parishId,
          event_type_id: weddingType.id,
          name: 'Simple Wedding Ceremony',
          description: `Ceremony without Mass, presided by ${people[1]?.full_name}`,
          preset_data: {
            field_values: {
              reception_location: '',
              notes: 'Simple wedding ceremony without Mass. Exchange of vows and blessing of rings only.'
            },
            presider_id: people[1]?.id || null,
            homilist_id: people[1]?.id || null,
            calendar_events: {
              [primaryField.property_name]: {
                location_id: chapelLocation?.id || churchLocation?.id || null,
                is_all_day: false,
                duration_minutes: 45
              }
            }
          },
          created_by: null
        })
      if (!error2) presetsCreated++

      // Wedding Preset 3: Bilingual wedding with people[2]
      const { error: error3 } = await supabase
        .from('event_presets')
        .insert({
          parish_id: parishId,
          event_type_id: weddingType.id,
          name: 'Bilingual Wedding Mass',
          description: `Nuptial Mass in English and Spanish, presided by ${people[2]?.full_name}`,
          preset_data: {
            field_values: {
              reception_location: hallLocation?.id || '',
              notes: 'Bilingual ceremony with readings in both English and Spanish. Mariachi welcome optional.'
            },
            presider_id: people[2]?.id || null,
            homilist_id: people[2]?.id || null,
            calendar_events: {
              [primaryField.property_name]: {
                location_id: churchLocation?.id || null,
                is_all_day: false,
                duration_minutes: 105
              }
            }
          },
          created_by: null
        })
      if (!error3) presetsCreated++
    }
  }

  // =====================================================
  // FUNERAL PRESETS - Multiple options with different locations
  // =====================================================
  const funeralType = eventTypes.find(et => et.slug === 'funerals')
  if (funeralType) {
    const primaryField = getPrimaryField(funeralType)
    if (primaryField) {
      // Funeral Preset 1: Full funeral Mass at church
      const { error: error1 } = await supabase
        .from('event_presets')
        .insert({
          parish_id: parishId,
          event_type_id: funeralType.id,
          name: 'Catholic Funeral Mass',
          description: `Full funeral Mass with vigil and committal, presided by ${people[0]?.full_name}`,
          preset_data: {
            field_values: {
              notes: 'Includes Vigil (wake), Funeral Mass, and Rite of Committal. Family may request specific readings and music.'
            },
            presider_id: people[0]?.id || null,
            homilist_id: people[0]?.id || null,
            calendar_events: {
              [primaryField.property_name]: {
                location_id: churchLocation?.id || null,
                is_all_day: false,
                duration_minutes: 75
              }
            }
          },
          created_by: null
        })
      if (!error1) presetsCreated++

      // Funeral Preset 2: Memorial service at funeral home
      const { error: error2 } = await supabase
        .from('event_presets')
        .insert({
          parish_id: parishId,
          event_type_id: funeralType.id,
          name: 'Memorial Service at Funeral Home',
          description: `Memorial service held at funeral home, led by ${people[1]?.full_name}`,
          preset_data: {
            field_values: {
              notes: 'Memorial service without body present. Includes scripture readings, prayers, and eulogy.'
            },
            presider_id: people[1]?.id || null,
            homilist_id: people[1]?.id || null,
            calendar_events: {
              [primaryField.property_name]: {
                location_id: funeralHomeLocation?.id || null,
                is_all_day: false,
                duration_minutes: 45
              }
            }
          },
          created_by: null
        })
      if (!error2) presetsCreated++

      // Funeral Preset 3: Graveside service only
      const { error: error3 } = await supabase
        .from('event_presets')
        .insert({
          parish_id: parishId,
          event_type_id: funeralType.id,
          name: 'Graveside Committal Service',
          description: `Simple graveside service, presided by ${people[2]?.full_name}`,
          preset_data: {
            field_values: {
              notes: 'Brief graveside service with committal prayers. No Mass. Approximately 20 minutes.'
            },
            presider_id: people[2]?.id || null,
            homilist_id: null,
            calendar_events: {
              [primaryField.property_name]: {
                location_id: null, // Cemetery - offsite
                is_all_day: false,
                duration_minutes: 20
              }
            }
          },
          created_by: null
        })
      if (!error3) presetsCreated++
    }
  }

  // =====================================================
  // SUNDAY MASS PRESETS - Different styles
  // =====================================================
  const sundayMassType = eventTypes.find(et => et.slug === 'sunday-mass')
  if (sundayMassType) {
    const primaryField = getPrimaryField(sundayMassType)
    if (primaryField) {
      // Sunday Mass Preset 1: Solemn High Mass
      const { error: error1 } = await supabase
        .from('event_presets')
        .insert({
          parish_id: parishId,
          event_type_id: sundayMassType.id,
          name: 'Solemn Sunday Mass',
          description: `High Mass with full choir and incense, presided by ${people[0]?.full_name}`,
          preset_data: {
            field_values: {
              entrance_hymn: 'Holy God We Praise Thy Name',
              offertory_hymn: 'We Bring the Sacrifice of Praise',
              communion_hymn: 'I Am the Bread of Life',
              recessional_hymn: 'Go Make a Difference',
              announcements: '',
              special_instructions: 'Full choir, thurifer and boat bearer required. Prepare incense for entrance, Gospel, and offertory.'
            },
            presider_id: people[0]?.id || null,
            homilist_id: people[0]?.id || null,
            calendar_events: {
              [primaryField.property_name]: {
                location_id: churchLocation?.id || null,
                is_all_day: false,
                duration_minutes: 90
              }
            }
          },
          created_by: null
        })
      if (!error1) presetsCreated++

      // Sunday Mass Preset 2: Contemporary/Youth Mass
      const { error: error2 } = await supabase
        .from('event_presets')
        .insert({
          parish_id: parishId,
          event_type_id: sundayMassType.id,
          name: 'Contemporary Youth Mass',
          description: `Youth-focused Mass with contemporary music, presided by ${people[2]?.full_name}`,
          preset_data: {
            field_values: {
              entrance_hymn: 'Open the Eyes of My Heart',
              offertory_hymn: 'Here I Am Lord',
              communion_hymn: 'One Bread One Body',
              recessional_hymn: 'City of God',
              announcements: '',
              special_instructions: 'Youth band plays. Encourage youth participation in liturgical ministries.'
            },
            presider_id: people[2]?.id || null,
            homilist_id: people[2]?.id || null,
            calendar_events: {
              [primaryField.property_name]: {
                location_id: churchLocation?.id || null,
                is_all_day: false,
                duration_minutes: 75
              }
            }
          },
          created_by: null
        })
      if (!error2) presetsCreated++

      // Sunday Mass Preset 3: Spanish Mass
      const { error: error3 } = await supabase
        .from('event_presets')
        .insert({
          parish_id: parishId,
          event_type_id: sundayMassType.id,
          name: 'Misa en Español',
          description: `Spanish language Mass with traditional hymns, presided by ${people[2]?.full_name}`,
          preset_data: {
            field_values: {
              entrance_hymn: 'Juntos Como Hermanos',
              offertory_hymn: 'Pan de Vida',
              communion_hymn: 'Pescador de Hombres',
              recessional_hymn: 'Resucitó',
              announcements: '',
              special_instructions: 'All readings and prayers in Spanish. Spanish choir leads music.'
            },
            presider_id: people[2]?.id || null,
            homilist_id: people[2]?.id || null,
            calendar_events: {
              [primaryField.property_name]: {
                location_id: churchLocation?.id || null,
                is_all_day: false,
                duration_minutes: 75
              }
            }
          },
          created_by: null
        })
      if (!error3) presetsCreated++
    }
  }

  // =====================================================
  // DAILY MASS PRESETS
  // =====================================================
  const dailyMassType = eventTypes.find(et => et.slug === 'daily-mass')
  if (dailyMassType) {
    const primaryField = getPrimaryField(dailyMassType)
    if (primaryField) {
      // Daily Mass Preset 1: Morning Mass
      const { error: error1 } = await supabase
        .from('event_presets')
        .insert({
          parish_id: parishId,
          event_type_id: dailyMassType.id,
          name: 'Morning Daily Mass',
          description: `Weekday morning Mass, presided by ${people[0]?.full_name}`,
          preset_data: {
            field_values: {
              special_instructions: 'Simple weekday Mass. Rosary before Mass optional.'
            },
            presider_id: people[0]?.id || null,
            homilist_id: people[0]?.id || null,
            calendar_events: {
              [primaryField.property_name]: {
                location_id: chapelLocation?.id || churchLocation?.id || null,
                is_all_day: false,
                duration_minutes: 30
              }
            }
          },
          created_by: null
        })
      if (!error1) presetsCreated++

      // Daily Mass Preset 2: Noon Mass
      const { error: error2 } = await supabase
        .from('event_presets')
        .insert({
          parish_id: parishId,
          event_type_id: dailyMassType.id,
          name: 'Noon Daily Mass',
          description: `Midday Mass for workers and visitors, presided by ${people[1]?.full_name}`,
          preset_data: {
            field_values: {
              special_instructions: 'Short homily. Communion service if no priest available.'
            },
            presider_id: people[1]?.id || null,
            homilist_id: people[1]?.id || null,
            calendar_events: {
              [primaryField.property_name]: {
                location_id: churchLocation?.id || null,
                is_all_day: false,
                duration_minutes: 25
              }
            }
          },
          created_by: null
        })
      if (!error2) presetsCreated++
    }
  }

  // =====================================================
  // BAPTISM PRESETS
  // =====================================================
  const baptismType = eventTypes.find(et => et.slug === 'baptisms')
  if (baptismType) {
    const primaryField = getPrimaryField(baptismType)
    if (primaryField) {
      // Baptism Preset 1: Individual baptism during Mass
      const { error: error1 } = await supabase
        .from('event_presets')
        .insert({
          parish_id: parishId,
          event_type_id: baptismType.id,
          name: 'Baptism During Sunday Mass',
          description: 'Individual baptism celebrated during Sunday Mass',
          preset_data: {
            field_values: {
              notes: 'Baptism integrated into Sunday Mass after the homily. Family presents child at beginning of Mass.'
            },
            presider_id: people[0]?.id || null,
            homilist_id: people[0]?.id || null,
            calendar_events: {
              [primaryField.property_name]: {
                location_id: churchLocation?.id || null,
                is_all_day: false,
                duration_minutes: 15
              }
            }
          },
          created_by: null
        })
      if (!error1) presetsCreated++

      // Baptism Preset 2: Saturday group baptism
      const { error: error2 } = await supabase
        .from('event_presets')
        .insert({
          parish_id: parishId,
          event_type_id: baptismType.id,
          name: 'Saturday Group Baptism',
          description: `Communal baptism for multiple families, led by ${people[1]?.full_name}`,
          preset_data: {
            field_values: {
              notes: 'Group baptism ceremony. Up to 4 families. Reception in hall after ceremony.'
            },
            presider_id: people[1]?.id || null,
            homilist_id: null,
            calendar_events: {
              [primaryField.property_name]: {
                location_id: churchLocation?.id || null,
                is_all_day: false,
                duration_minutes: 45
              }
            }
          },
          created_by: null
        })
      if (!error2) presetsCreated++

      // Baptism Preset 3: Spanish baptism
      const { error: error3 } = await supabase
        .from('event_presets')
        .insert({
          parish_id: parishId,
          event_type_id: baptismType.id,
          name: 'Bautismo en Español',
          description: `Spanish language baptism ceremony, presided by ${people[2]?.full_name}`,
          preset_data: {
            field_values: {
              notes: 'Ceremony conducted entirely in Spanish. Preparation class required in Spanish.'
            },
            presider_id: people[2]?.id || null,
            homilist_id: people[2]?.id || null,
            calendar_events: {
              [primaryField.property_name]: {
                location_id: churchLocation?.id || null,
                is_all_day: false,
                duration_minutes: 45
              }
            }
          },
          created_by: null
        })
      if (!error3) presetsCreated++
    }
  }

  // =====================================================
  // QUINCEAÑERA PRESETS
  // =====================================================
  const quinceaneraType = eventTypes.find(et => et.slug === 'quinceaneras')
  if (quinceaneraType) {
    const primaryField = getPrimaryField(quinceaneraType)
    if (primaryField) {
      // Quinceañera Preset 1: Full Mass celebration
      const { error: error1 } = await supabase
        .from('event_presets')
        .insert({
          parish_id: parishId,
          event_type_id: quinceaneraType.id,
          name: 'Traditional Quinceañera Mass',
          description: `Full Mass celebration with blessing of quinceañera, presided by ${people[2]?.full_name}`,
          preset_data: {
            field_values: {
              notes: 'Full Mass with special blessing, presentation of gifts (ring, crown, shoes), and thanksgiving prayer. Mariachi welcome recommended.'
            },
            presider_id: people[2]?.id || null,
            homilist_id: people[2]?.id || null,
            calendar_events: {
              [primaryField.property_name]: {
                location_id: churchLocation?.id || null,
                is_all_day: false,
                duration_minutes: 90
              }
            }
          },
          created_by: null
        })
      if (!error1) presetsCreated++

      // Quinceañera Preset 2: Simple blessing ceremony
      const { error: error2 } = await supabase
        .from('event_presets')
        .insert({
          parish_id: parishId,
          event_type_id: quinceaneraType.id,
          name: 'Quinceañera Blessing (No Mass)',
          description: `Simple blessing ceremony without Mass, led by ${people[1]?.full_name}`,
          preset_data: {
            field_values: {
              notes: 'Blessing ceremony only, approximately 30 minutes. Scripture reading, blessing, and presentation of gifts.'
            },
            presider_id: people[1]?.id || null,
            homilist_id: null,
            calendar_events: {
              [primaryField.property_name]: {
                location_id: chapelLocation?.id || churchLocation?.id || null,
                is_all_day: false,
                duration_minutes: 30
              }
            }
          },
          created_by: null
        })
      if (!error2) presetsCreated++
    }
  }

  return { presetsCreated }
}

// =====================================================
// Seed Calendar Event Visibility
// =====================================================

export async function seedCalendarEventVisibility(
  ctx: SeederContext,
  people: CreatedPerson[]
): Promise<{ visibilityRecordsCreated: number }> {
  const { supabase, parishId } = ctx

  // Get some calendar events to set visibility for
  const { data: calendarEvents } = await supabase
    .from('calendar_events')
    .select('id')
    .eq('parish_id', parishId)
    .eq('show_on_calendar', true)
    .limit(5)

  if (!calendarEvents || calendarEvents.length === 0) {
    return { visibilityRecordsCreated: 0 }
  }

  const visibilityRecords = calendarEvents.map((event, index) => ({
    parish_id: parishId,
    event_id: event.id,
    event_source: 'parish',
    is_public: index < 3, // First 3 are public
    visible_to_person_ids: index >= 3 ? people.slice(0, 5).map(p => p.id) : []
  }))

  const { data: inserted, error } = await supabase
    .from('parishioner_calendar_event_visibility')
    .insert(visibilityRecords)
    .select()

  return { visibilityRecordsCreated: error ? 0 : (inserted?.length || 0) }
}

