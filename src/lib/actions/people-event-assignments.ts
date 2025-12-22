'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { logError } from '@/lib/utils/console'
import type { Person, InputFieldDefinition } from '@/lib/types'

// ============================================================================
// TYPES
// ============================================================================

export interface PeopleEventAssignment {
  id: string
  master_event_id: string
  calendar_event_id: string | null  // NULL for template, populated for occurrence
  field_definition_id: string
  person_id: string
  notes: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface PeopleEventAssignmentWithPerson extends PeopleEventAssignment {
  person: Person
  field_definition: InputFieldDefinition
}

export interface CreatePeopleEventAssignmentData {
  master_event_id: string
  calendar_event_id?: string | null
  field_definition_id: string
  person_id: string
  notes?: string | null
}

export interface UpdatePeopleEventAssignmentData {
  person_id?: string
  notes?: string | null
}

// ============================================================================
// CREATE
// ============================================================================

/**
 * Create a new people-event assignment
 * Validates occurrence-level enforcement based on field definition
 */
export async function createPeopleEventAssignment(
  data: CreatePeopleEventAssignmentData
): Promise<PeopleEventAssignment> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Fetch field definition to check is_per_calendar_event
  const { data: fieldDef, error: fieldDefError } = await supabase
    .from('input_field_definitions')
    .select('id, type, is_per_calendar_event, event_type_id')
    .eq('id', data.field_definition_id)
    .is('deleted_at', null)
    .single()

  if (fieldDefError || !fieldDef) {
    logError('Error fetching field definition: ' + (fieldDefError instanceof Error ? fieldDefError.message : JSON.stringify(fieldDefError)))
    throw new Error('Field definition not found')
  }

  // Validate field type
  if (fieldDef.type !== 'person') {
    throw new Error('Field definition must be type "person"')
  }

  // Validate occurrence-level enforcement
  if (fieldDef.is_per_calendar_event) {
    // Occurrence-level: calendar_event_id MUST be provided
    if (!data.calendar_event_id) {
      throw new Error('Occurrence-level assignments require calendar_event_id')
    }
  } else {
    // Template-level: calendar_event_id MUST be NULL
    if (data.calendar_event_id) {
      throw new Error('Template-level assignments must have calendar_event_id = NULL')
    }
  }

  // Verify master_event belongs to selected parish
  const { data: masterEvent, error: masterEventError } = await supabase
    .from('master_events')
    .select('parish_id, event_type_id')
    .eq('id', data.master_event_id)
    .is('deleted_at', null)
    .single()

  if (masterEventError || !masterEvent) {
    logError('Error fetching master event: ' + (masterEventError instanceof Error ? masterEventError.message : JSON.stringify(masterEventError)))
    throw new Error('Event not found')
  }

  if (masterEvent.parish_id !== selectedParishId) {
    throw new Error('Event does not belong to selected parish')
  }

  // Verify field_definition belongs to master_event's event_type
  if (fieldDef.event_type_id !== masterEvent.event_type_id) {
    throw new Error('Field definition does not belong to this event type')
  }

  // Verify person belongs to selected parish
  const { data: person, error: personError } = await supabase
    .from('people')
    .select('id')
    .eq('id', data.person_id)
    .eq('parish_id', selectedParishId)
    .single()

  if (personError || !person) {
    logError('Error fetching person: ' + (personError instanceof Error ? personError.message : JSON.stringify(personError)))
    throw new Error('Person not found in parish')
  }

  // Check for existing assignment (soft-deleted or active)
  const { data: existingAssignments } = await supabase
    .from('people_event_assignments')
    .select('id, deleted_at')
    .eq('master_event_id', data.master_event_id)
    .eq('field_definition_id', data.field_definition_id)
    .eq('person_id', data.person_id)
    .limit(1)

  if (existingAssignments && existingAssignments.length > 0) {
    const existing = existingAssignments[0]

    if (existing.deleted_at) {
      // Restore soft-deleted assignment
      const { data: restored, error: restoreError } = await supabase
        .from('people_event_assignments')
        .update({
          deleted_at: null,
          notes: data.notes || null
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (restoreError) {
        logError('Error restoring assignment: ' + (restoreError instanceof Error ? restoreError.message : JSON.stringify(restoreError)))
        throw new Error('Failed to restore assignment')
      }

      revalidatePath(`/events/${masterEvent.event_type_id}/${data.master_event_id}`)
      return restored
    } else {
      // Active assignment already exists
      throw new Error('Person already assigned to this role')
    }
  }

  // Insert new assignment
  const { data: assignment, error } = await supabase
    .from('people_event_assignments')
    .insert([
      {
        master_event_id: data.master_event_id,
        calendar_event_id: data.calendar_event_id || null,
        field_definition_id: data.field_definition_id,
        person_id: data.person_id,
        notes: data.notes || null
      }
    ])
    .select()
    .single()

  if (error) {
    logError('Error creating assignment: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to create assignment')
  }

  revalidatePath(`/events/${masterEvent.event_type_id}/${data.master_event_id}`)
  return assignment
}

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Update an existing people-event assignment
 * Can update person_id and/or notes
 */
export async function updatePeopleEventAssignment(
  id: string,
  data: UpdatePeopleEventAssignmentData
): Promise<PeopleEventAssignment> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get existing assignment to verify access
  const { data: existingAssignment, error: fetchError } = await supabase
    .from('people_event_assignments')
    .select('master_event_id, person_id')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (fetchError || !existingAssignment) {
    logError('Error fetching assignment: ' + (fetchError instanceof Error ? fetchError.message : JSON.stringify(fetchError)))
    throw new Error('Assignment not found')
  }

  // Verify master_event belongs to selected parish
  const { data: masterEvent, error: masterEventError } = await supabase
    .from('master_events')
    .select('parish_id, event_type_id')
    .eq('id', existingAssignment.master_event_id)
    .is('deleted_at', null)
    .single()

  if (masterEventError || !masterEvent) {
    logError('Error fetching master event: ' + (masterEventError instanceof Error ? masterEventError.message : JSON.stringify(masterEventError)))
    throw new Error('Event not found')
  }

  if (masterEvent.parish_id !== selectedParishId) {
    throw new Error('Access denied')
  }

  // If updating person_id, verify new person belongs to parish
  if (data.person_id && data.person_id !== existingAssignment.person_id) {
    const { data: person, error: personError } = await supabase
      .from('people')
      .select('id')
      .eq('id', data.person_id)
      .eq('parish_id', selectedParishId)
      .single()

    if (personError || !person) {
      logError('Error fetching person: ' + (personError instanceof Error ? personError.message : JSON.stringify(personError)))
      throw new Error('Person not found in parish')
    }
  }

  // Build update object
  const updateData: Partial<PeopleEventAssignment> = {}
  if (data.person_id !== undefined) {
    updateData.person_id = data.person_id
  }
  if (data.notes !== undefined) {
    updateData.notes = data.notes
  }

  // Update assignment
  const { data: updated, error } = await supabase
    .from('people_event_assignments')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    logError('Error updating assignment: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to update assignment')
  }

  revalidatePath(`/events/${masterEvent.event_type_id}/${existingAssignment.master_event_id}`)
  return updated
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Delete a people-event assignment (soft delete)
 */
export async function deletePeopleEventAssignment(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get assignment to verify access and get master_event_id for revalidation
  const { data: assignment, error: fetchError } = await supabase
    .from('people_event_assignments')
    .select('master_event_id')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (fetchError || !assignment) {
    logError('Error fetching assignment: ' + (fetchError instanceof Error ? fetchError.message : JSON.stringify(fetchError)))
    throw new Error('Assignment not found')
  }

  // Verify master_event belongs to selected parish
  const { data: masterEvent, error: masterEventError } = await supabase
    .from('master_events')
    .select('parish_id, event_type_id')
    .eq('id', assignment.master_event_id)
    .is('deleted_at', null)
    .single()

  if (masterEventError || !masterEvent) {
    logError('Error fetching master event: ' + (masterEventError instanceof Error ? masterEventError.message : JSON.stringify(masterEventError)))
    throw new Error('Event not found')
  }

  if (masterEvent.parish_id !== selectedParishId) {
    throw new Error('Access denied')
  }

  // Soft delete
  const { error } = await supabase
    .from('people_event_assignments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    logError('Error deleting assignment: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to delete assignment')
  }

  revalidatePath(`/events/${masterEvent.event_type_id}/${assignment.master_event_id}`)
}

// ============================================================================
// QUERY
// ============================================================================

/**
 * Get people-event assignments with filters
 */
export async function getPeopleEventAssignments(filters?: {
  master_event_id?: string
  calendar_event_id?: string
  person_id?: string
}): Promise<PeopleEventAssignmentWithPerson[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  let query = supabase
    .from('people_event_assignments')
    .select('*, person:people(*), field_definition:input_field_definitions(*)')
    .is('deleted_at', null)

  // Apply filters
  if (filters?.master_event_id) {
    query = query.eq('master_event_id', filters.master_event_id)
  }
  if (filters?.calendar_event_id) {
    query = query.eq('calendar_event_id', filters.calendar_event_id)
  }
  if (filters?.person_id) {
    query = query.eq('person_id', filters.person_id)
  }

  const { data, error } = await query

  if (error) {
    logError('Error fetching assignments: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch assignments')
  }

  // Filter by parish (via master_event)
  const assignments = data || []
  const masterEventIds = [...new Set(assignments.map(a => a.master_event_id))]

  if (masterEventIds.length > 0) {
    const { data: masterEvents } = await supabase
      .from('master_events')
      .select('id, parish_id')
      .in('id', masterEventIds)
      .eq('parish_id', selectedParishId)
      .is('deleted_at', null)

    const validEventIds = new Set(masterEvents?.map(e => e.id) || [])
    return assignments.filter(a => validEventIds.has(a.master_event_id)) as PeopleEventAssignmentWithPerson[]
  }

  return []
}

/**
 * Get all assignments for a person across all events
 */
export async function getPersonAssignments(personId: string): Promise<PeopleEventAssignmentWithPerson[]> {
  return getPeopleEventAssignments({ person_id: personId })
}

/**
 * Get all assignments (template + occurrence) for a master event
 */
export async function getMasterEventAssignments(masterEventId: string): Promise<PeopleEventAssignmentWithPerson[]> {
  return getPeopleEventAssignments({ master_event_id: masterEventId })
}

/**
 * Get occurrence-level assignments for a calendar event
 */
export async function getCalendarEventAssignments(calendarEventId: string): Promise<PeopleEventAssignmentWithPerson[]> {
  return getPeopleEventAssignments({ calendar_event_id: calendarEventId })
}
