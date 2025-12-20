'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { logError } from '@/lib/utils/console'
import type {
  MasterEvent,
  Person,
  CalendarEvent,
  EventType,
  InputFieldDefinition,
  ResolvedFieldValue,
  Group,
  Location,
  CustomListItem,
  Document,
  Content,
  Petition
} from '@/lib/types'
import type { PaginatedParams, PaginatedResult } from './people'
import { LIST_VIEW_PAGE_SIZE } from '@/lib/constants'

// Note: Types must be imported from @/lib/schemas/masses directly (not re-exported from "use server" files)
import {
  createMassSchema,
  updateMassSchema,
  type CreateMassData,
  type UpdateMassData,
  type MassFilterParams,
  type MassStats,
  type MassWithNames,
  type MassWithRelations,
  type MasterEventRoleWithRelations,
  type CreateMassRoleData,
} from '@/lib/schemas/masses'

/**
 * Get all masses for the parish
 * Masses are master_events where event_type.system_type = 'mass'
 */
export async function getMasses(filters?: MassFilterParams): Promise<MassWithNames[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const offset = filters?.offset || 0
  const limit = filters?.limit || LIST_VIEW_PAGE_SIZE

  // Build query - filter by system_type = 'mass'
  let query = supabase
    .from('master_events')
    .select('*, event_type:event_types!inner(*)')
    .eq('parish_id', selectedParishId)
    .eq('event_type.system_type', 'mass')
    .is('deleted_at', null)

  // Apply status filter at database level
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  // Handle sorting by created_at at database level
  if (filters?.sort === 'created_asc') {
    query = query.order('created_at', { ascending: true })
  } else if (filters?.sort === 'created_desc') {
    query = query.order('created_at', { ascending: false })
  } else {
    // Default sort: most recent first
    query = query.order('created_at', { ascending: false })
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1)

  const { data: events, error } = await query

  if (error) {
    logError('Error fetching masses: ' + error)
    throw new Error('Failed to fetch masses')
  }

  if (!events || events.length === 0) {
    return []
  }

  // Fetch primary calendar events and presiders/homilist for all events
  const eventIds = events.map(e => e.id)
  const presiderIds = events.map(e => e.presider_id).filter(Boolean) as string[]
  const homilistIds = events.map(e => e.homilist_id).filter(Boolean) as string[]

  const [calendarEventsData, presidersData, homilistsData] = await Promise.all([
    supabase
      .from('calendar_events')
      .select('*, location:locations(*)')
      .in('master_event_id', eventIds)
      .eq('is_primary', true)
      .is('deleted_at', null),
    presiderIds.length > 0
      ? supabase.from('people').select('*').in('id', presiderIds)
      : Promise.resolve({ data: [] }),
    homilistIds.length > 0
      ? supabase.from('people').select('*').in('id', homilistIds)
      : Promise.resolve({ data: [] })
  ])

  // Create lookup maps
  const calendarEventMap = new Map(calendarEventsData.data?.map(ce => [ce.master_event_id, ce]) || [])
  const presiderMap = new Map(presidersData.data?.map(p => [p.id, p]) || [])
  const homilistMap = new Map(homilistsData.data?.map(p => [p.id, p]) || [])

  // Combine events with related data
  let masses: MassWithNames[] = events.map(event => ({
    ...event,
    primary_calendar_event: calendarEventMap.get(event.id) || undefined,
    presider: event.presider_id ? presiderMap.get(event.presider_id) || null : null,
    homilist: event.homilist_id ? homilistMap.get(event.homilist_id) || null : null
  }))

  // Apply date range filters (post-fetch since calendar events are separate)
  if (filters?.start_date) {
    masses = masses.filter(mass =>
      mass.primary_calendar_event?.start_datetime &&
      mass.primary_calendar_event.start_datetime >= filters.start_date!
    )
  }
  if (filters?.end_date) {
    masses = masses.filter(mass =>
      mass.primary_calendar_event?.start_datetime &&
      mass.primary_calendar_event.start_datetime <= filters.end_date!
    )
  }

  // Apply search filter
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase()
    masses = masses.filter(mass => {
      const presiderName = mass.presider?.full_name?.toLowerCase() || ''
      const homilistName = mass.homilist?.full_name?.toLowerCase() || ''
      const eventTypeName = mass.event_type?.name?.toLowerCase() || ''

      return (
        presiderName.includes(searchTerm) ||
        homilistName.includes(searchTerm) ||
        eventTypeName.includes(searchTerm)
      )
    })
  }

  // Apply date sorting if requested
  if (filters?.sort === 'date_asc') {
    masses.sort((a, b) => {
      const dateA = a.primary_calendar_event?.start_datetime || ''
      const dateB = b.primary_calendar_event?.start_datetime || ''
      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1
      return dateA.localeCompare(dateB)
    })
  } else if (filters?.sort === 'date_desc') {
    masses.sort((a, b) => {
      const dateA = a.primary_calendar_event?.start_datetime || ''
      const dateB = b.primary_calendar_event?.start_datetime || ''
      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1
      return dateB.localeCompare(dateA)
    })
  }

  return masses
}

export async function getMassStats(filters?: MassFilterParams): Promise<MassStats> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get all masses for stats calculation
  const { data: allMasses, error } = await supabase
    .from('master_events')
    .select('*, event_type:event_types!inner(*)')
    .eq('parish_id', selectedParishId)
    .eq('event_type.system_type', 'mass')
    .is('deleted_at', null)

  if (error) {
    logError('Error fetching masses for stats: ' + error)
    throw new Error('Failed to fetch masses for stats')
  }

  const total = allMasses?.length || 0

  // Fetch primary calendar events to calculate upcoming/past
  const eventIds = allMasses?.map(e => e.id) || []
  let upcoming = 0
  let past = 0

  if (eventIds.length > 0) {
    const { data: calendarEvents } = await supabase
      .from('calendar_events')
      .select('master_event_id, start_datetime')
      .in('master_event_id', eventIds)
      .eq('is_primary', true)
      .is('deleted_at', null)

    const now = new Date()
    const calendarEventMap = new Map(calendarEvents?.map(ce => [ce.master_event_id, ce.start_datetime]) || [])

    upcoming = eventIds.filter(id => {
      const datetime = calendarEventMap.get(id)
      return datetime && new Date(datetime) >= now
    }).length

    past = eventIds.filter(id => {
      const datetime = calendarEventMap.get(id)
      return datetime && new Date(datetime) < now
    }).length
  }

  // Get filtered masses using the same getMasses function
  const filteredMasses = await getMasses(filters)
  const filtered = filteredMasses.length

  return {
    total,
    upcoming,
    past,
    filtered
  }
}

export async function getMassesPaginated(params?: PaginatedParams): Promise<PaginatedResult<MassWithNames>> {
  await requireSelectedParish()
  await ensureJWTClaims()

  const offset = params?.offset || 0
  const limit = params?.limit || 10

  // Use getMasses with pagination
  const masses = await getMasses({
    offset,
    limit,
    search: params?.search
  })

  // For total count, get all masses without pagination
  const allMasses = await getMasses({ limit: 1000 }) // Use high limit for count

  const totalCount = allMasses.length
  const totalPages = Math.ceil(totalCount / limit)
  const page = Math.floor(offset / limit) + 1

  return {
    items: masses,
    totalCount,
    page,
    limit,
    totalPages,
  }
}

export async function getMass(id: string): Promise<MasterEvent | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('master_events')
    .select('*, event_type:event_types!inner(*)')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .eq('event_type.system_type', 'mass')
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    logError('Error fetching mass: ' + error)
    throw new Error('Failed to fetch mass')
  }

  return data
}

export async function getMassWithRelations(id: string): Promise<MassWithRelations | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the master event with event type check
  const { data: event, error } = await supabase
    .from('master_events')
    .select('*')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    logError('Error fetching mass: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch mass')
  }

  // Fetch event type, calendar events, presider, homilist, mass intention, roles, and parish in parallel
  const [eventTypeData, calendarEventsData, presiderData, homilistData, massIntentionData, rolesData, parishData] = await Promise.all([
    supabase
      .from('event_types')
      .select('*, input_field_definitions!input_field_definitions_event_type_id_fkey(*)')
      .eq('id', event.event_type_id)
      .eq('parish_id', selectedParishId)
      .eq('system_type', 'mass')
      .is('deleted_at', null)
      .single(),
    supabase
      .from('calendar_events')
      .select('*, location:locations(*)')
      .eq('master_event_id', id)
      .is('deleted_at', null)
      .order('start_datetime', { ascending: true }),
    event.presider_id
      ? supabase.from('people').select('*').eq('id', event.presider_id).single()
      : Promise.resolve({ data: null, error: null }),
    event.homilist_id
      ? supabase.from('people').select('*').eq('id', event.homilist_id).single()
      : Promise.resolve({ data: null, error: null }),
    supabase
      .from('mass_intentions')
      .select('*, requested_by:people!requested_by_id(*)')
      .eq('master_event_id', id)
      .maybeSingle(),
    supabase
      .from('master_event_roles')
      .select('*')
      .eq('master_event_id', id)
      .is('deleted_at', null),
    supabase
      .from('parishes')
      .select('name, city, state')
      .eq('id', selectedParishId)
      .single()
  ])

  if (eventTypeData.error) {
    logError('Error fetching event type: ' + (eventTypeData.error instanceof Error ? eventTypeData.error.message : JSON.stringify(eventTypeData.error)))
    // Event exists but is not a mass type
    return null
  }

  if (calendarEventsData.error) {
    logError('Error fetching calendar events: ' + (calendarEventsData.error instanceof Error ? calendarEventsData.error.message : JSON.stringify(calendarEventsData.error)))
    throw new Error('Failed to fetch calendar events')
  }

  const eventType = eventTypeData.data as EventType
  const calendarEvents = calendarEventsData.data as CalendarEvent[]
  const presider = presiderData.data as Person | null
  const homilist = homilistData.data as Person | null
  const inputFieldDefinitions = eventTypeData.data.input_field_definitions as InputFieldDefinition[]

  // Resolve field values
  // Note: field_values uses property_name as keys (e.g., "entrance_hymn")
  // while resolved_fields uses name as keys (e.g., "Entrance Hymn") to match script placeholders
  const resolvedFields: Record<string, ResolvedFieldValue> = {}

  for (const fieldDef of inputFieldDefinitions) {
    // Look up by property_name (snake_case) since that's what forms and seeders use
    const rawValue = event.field_values?.[fieldDef.property_name]

    const resolvedField: ResolvedFieldValue = {
      field_name: fieldDef.name,
      field_type: fieldDef.type,
      raw_value: rawValue
    }

    // Resolve references based on field type
    if (rawValue) {
      try {
        switch (fieldDef.type) {
          case 'person': {
            const { data: person } = await supabase
              .from('people')
              .select('*')
              .eq('id', rawValue)
              .single()
            resolvedField.resolved_value = person as Person | null
            break
          }
          case 'group': {
            const { data: group } = await supabase
              .from('groups')
              .select('*')
              .eq('id', rawValue)
              .single()
            resolvedField.resolved_value = group as Group | null
            break
          }
          case 'location': {
            const { data: location } = await supabase
              .from('locations')
              .select('*')
              .eq('id', rawValue)
              .single()
            resolvedField.resolved_value = location as Location | null
            break
          }
          case 'list_item': {
            const { data: listItem } = await supabase
              .from('custom_list_items')
              .select('*')
              .eq('id', rawValue)
              .is('deleted_at', null)
              .single()
            resolvedField.resolved_value = listItem as CustomListItem | null
            break
          }
          case 'document': {
            const { data: document } = await supabase
              .from('documents')
              .select('*')
              .eq('id', rawValue)
              .is('deleted_at', null)
              .single()
            resolvedField.resolved_value = document as Document | null
            break
          }
          case 'content': {
            const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            const isUUID = typeof rawValue === 'string' && UUID_REGEX.test(rawValue)
            if (isUUID) {
              const { data: content } = await supabase
                .from('contents')
                .select('*')
                .eq('id', rawValue)
                .single()
              resolvedField.resolved_value = content as Content | null
            }
            break
          }
          case 'petition': {
            const { data: petition } = await supabase
              .from('petitions')
              .select('*')
              .eq('id', rawValue)
              .single()
            resolvedField.resolved_value = petition as Petition | null
            break
          }
          default:
            break
        }
      } catch (err) {
        logError(`Error resolving field ${fieldDef.name}: ` + err)
      }
    }

    // Key by property_name for consistency with master-events.ts and script placeholders
    resolvedFields[fieldDef.property_name] = resolvedField
  }

  // Add special built-in fields used in script templates
  // These are not input field definitions but are expected by templates
  const primaryCalendarEvent = calendarEvents.find(ce => ce.is_primary) || calendarEvents[0]
  if (primaryCalendarEvent?.start_datetime) {
    const startDate = new Date(primaryCalendarEvent.start_datetime)
    resolvedFields['date'] = {
      field_name: 'date',
      field_type: 'date',
      raw_value: startDate.toISOString().split('T')[0]
    }
    resolvedFields['time'] = {
      field_name: 'time',
      field_type: 'time',
      raw_value: startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    }
  }
  if (presider) {
    resolvedFields['presider'] = {
      field_name: 'presider',
      field_type: 'person',
      raw_value: presider.id,
      resolved_value: presider
    }
  }

  return {
    ...event,
    event_type: {
      ...eventType,
      input_field_definitions: inputFieldDefinitions,
      scripts: [] // Scripts loaded separately if needed
    },
    calendar_events: calendarEvents,
    presider: presider || undefined,
    homilist: homilist || undefined,
    roles: rolesData.data || [],
    resolved_fields: resolvedFields,
    mass_intention: massIntentionData.data || null,
    parish: parishData.data ? {
      name: parishData.data.name,
      city: parishData.data.city,
      state: parishData.data.state
    } : undefined
  }
}

export async function createMass(data: CreateMassData): Promise<MasterEvent> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Validate data with Zod schema
  const validatedData = createMassSchema.parse(data)

  // Find a mass event type for this parish
  const { data: massEventType, error: eventTypeError } = await supabase
    .from('event_types')
    .select('id')
    .eq('parish_id', selectedParishId)
    .eq('system_type', 'mass')
    .is('deleted_at', null)
    .limit(1)
    .single()

  if (eventTypeError || !massEventType) {
    logError('Error finding mass event type: ' + (eventTypeError instanceof Error ? eventTypeError.message : JSON.stringify(eventTypeError)))
    throw new Error('No mass event type configured for this parish')
  }

  // Create master event
  const { data: mass, error } = await supabase
    .from('master_events')
    .insert([
      {
        parish_id: selectedParishId,
        event_type_id: massEventType.id,
        presider_id: validatedData.presider_id || null,
        homilist_id: validatedData.homilist_id || null,
        field_values: validatedData.field_values || {},
        status: validatedData.status || 'PLANNING'
      }
    ])
    .select()
    .single()

  if (error) {
    logError('Error creating mass: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to create mass')
  }

  // Create primary calendar event if date info provided
  if (validatedData.event_id) {
    // Get the event to extract date info
    const { data: eventData } = await supabase
      .from('events')
      .select('start_date, start_time, end_date, end_time, location_id')
      .eq('id', validatedData.event_id)
      .single()

    if (eventData && eventData.start_date) {
      // Find or create an input field definition for the primary calendar event
      const { data: primaryFieldDef } = await supabase
        .from('input_field_definitions')
        .select('id')
        .eq('event_type_id', massEventType.id)
        .eq('type', 'calendar_event')
        .eq('is_primary', true)
        .is('deleted_at', null)
        .limit(1)
        .single()

      if (primaryFieldDef) {
        const startDatetime = eventData.start_time
          ? `${eventData.start_date}T${eventData.start_time}`
          : `${eventData.start_date}T00:00:00`

        const endDatetime = eventData.end_date && eventData.end_time
          ? `${eventData.end_date}T${eventData.end_time}`
          : null

        await supabase
          .from('calendar_events')
          .insert([
            {
              master_event_id: mass.id,
              parish_id: selectedParishId,
              input_field_definition_id: primaryFieldDef.id,
              start_datetime: startDatetime,
              end_datetime: endDatetime,
              location_id: eventData.location_id || null,
              is_primary: true,
              is_cancelled: false
            }
          ])
      }
    }
  }

  revalidatePath('/masses')
  return mass
}

export async function updateMass(id: string, data: UpdateMassData): Promise<MasterEvent> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Validate data with Zod schema
  const validatedData = updateMassSchema.parse(data)

  // Build update object from only defined values
  const updateData: Partial<MasterEvent> = {}

  if (validatedData.presider_id !== undefined) {
    updateData.presider_id = validatedData.presider_id
  }
  if (validatedData.homilist_id !== undefined) {
    updateData.homilist_id = validatedData.homilist_id
  }
  if (validatedData.field_values !== undefined) {
    updateData.field_values = validatedData.field_values ?? {}
  }
  if (validatedData.status !== undefined && validatedData.status !== null) {
    updateData.status = validatedData.status
  }

  const { data: mass, error } = await supabase
    .from('master_events')
    .update(updateData)
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .is('deleted_at', null)
    .select()
    .single()

  if (error) {
    logError('Error updating mass: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to update mass')
  }

  revalidatePath('/masses')
  revalidatePath(`/masses/${id}`)
  revalidatePath(`/masses/${id}/edit`)
  return mass
}

export async function deleteMass(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Hard delete (will cascade to calendar events)
  const { error } = await supabase
    .from('master_events')
    .delete()
    .eq('id', id)
    .eq('parish_id', selectedParishId)

  if (error) {
    logError('Error deleting mass: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to delete mass')
  }

  revalidatePath('/masses')
}

// ============================================================================
// MASS INTENTION LINKING
// ============================================================================

// Link a mass intention to a mass (master_event)
export async function linkMassIntention(massId: string, massIntentionId: string): Promise<void> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Update the mass intention to link it to this master_event
  const { error } = await supabase
    .from('mass_intentions')
    .update({ master_event_id: massId })
    .eq('id', massIntentionId)

  if (error) {
    logError('Error linking mass intention: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to link mass intention')
  }

  revalidatePath('/masses')
  revalidatePath(`/masses/${massId}`)
  revalidatePath(`/masses/${massId}/edit`)
  revalidatePath('/mass-intentions')
  revalidatePath(`/mass-intentions/${massIntentionId}`)
}

// Unlink a mass intention from a mass
export async function unlinkMassIntention(massIntentionId: string): Promise<void> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the master_event_id before unlinking for revalidation
  const { data: intentionData } = await supabase
    .from('mass_intentions')
    .select('master_event_id')
    .eq('id', massIntentionId)
    .single()

  // Update the mass intention to unlink it
  const { error } = await supabase
    .from('mass_intentions')
    .update({ master_event_id: null })
    .eq('id', massIntentionId)

  if (error) {
    logError('Error unlinking mass intention: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to unlink mass intention')
  }

  if (intentionData?.master_event_id) {
    revalidatePath('/masses')
    revalidatePath(`/masses/${intentionData.master_event_id}`)
    revalidatePath(`/masses/${intentionData.master_event_id}/edit`)
  }
  revalidatePath('/mass-intentions')
  revalidatePath(`/mass-intentions/${massIntentionId}`)
}

// ============================================================================
// MASS ROLE MANAGEMENT (uses master_event_roles table)
// ============================================================================

// Get all role assignments for a mass
export async function getMassRoles(massId: string): Promise<MasterEventRoleWithRelations[]> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: roles, error } = await supabase
    .from('master_event_roles')
    .select('*, person:people(*)')
    .eq('master_event_id', massId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (error) {
    logError('Error fetching mass roles: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch mass roles')
  }

  return roles as MasterEventRoleWithRelations[]
}

// Create a role assignment for a mass
export async function createMassRole(data: CreateMassRoleData): Promise<MasterEventRoleWithRelations> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: role, error } = await supabase
    .from('master_event_roles')
    .insert([{
      master_event_id: data.master_event_id,
      role_id: data.role_id,
      person_id: data.person_id,
      notes: data.notes || null
    }])
    .select('*, person:people(*)')
    .single()

  if (error) {
    logError('Error creating mass role: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to create mass role assignment')
  }

  revalidatePath('/masses')
  revalidatePath(`/masses/${data.master_event_id}`)
  revalidatePath(`/masses/${data.master_event_id}/edit`)

  return role as MasterEventRoleWithRelations
}

// Delete a role assignment (soft delete)
export async function deleteMassRole(roleId: string): Promise<void> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the master_event_id for revalidation before deleting
  const { data: roleData } = await supabase
    .from('master_event_roles')
    .select('master_event_id')
    .eq('id', roleId)
    .single()

  // Soft delete by setting deleted_at
  const { error } = await supabase
    .from('master_event_roles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', roleId)

  if (error) {
    logError('Error deleting mass role: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to delete mass role assignment')
  }

  if (roleData?.master_event_id) {
    revalidatePath('/masses')
    revalidatePath(`/masses/${roleData.master_event_id}`)
    revalidatePath(`/masses/${roleData.master_event_id}/edit`)
  }
}

// Bulk delete all role assignments for a mass
export async function deleteAllMassRoles(massId: string): Promise<void> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Soft delete all roles for this mass
  const { error } = await supabase
    .from('master_event_roles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('master_event_id', massId)
    .is('deleted_at', null)

  if (error) {
    logError('Error deleting mass roles: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to delete mass role assignments')
  }

  revalidatePath('/masses')
  revalidatePath(`/masses/${massId}`)
  revalidatePath(`/masses/${massId}/edit`)
}
