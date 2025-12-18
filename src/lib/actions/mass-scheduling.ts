'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { MassScheduleEntry } from '@/app/(main)/masses/schedule/steps/step-2-schedule-pattern'
import { getLiturgicalContextFromGrade, type LiturgicalContext } from '@/lib/constants'
import { toLocalDateString } from '@/lib/utils/formatters'
import { logInfo, logError } from '@/lib/utils/console'
import type { GlobalLiturgicalEvent } from '@/lib/actions/global-liturgical-events'
import type { EventType } from '@/lib/types'

// Role definition from event_types.role_definitions
interface RoleDefinition {
  id: string
  name: string
  required: boolean
  count?: number  // Number of people needed for this role
}

export interface ScheduleMassesParams {
  startDate: string
  endDate: string
  schedule: MassScheduleEntry[]
  eventTypeId?: string  // Optional specific mass event type
  selectedLiturgicalEventIds: string[]  // Selected liturgical events
  algorithmOptions: {
    balanceWorkload: boolean
    respectBlackoutDates: boolean
    allowManualAdjustments: boolean
  }
  proposedMasses?: Array<{
    id: string
    date: string
    time: string
    eventTypeId?: string
    liturgicalEventId?: string
    assignments?: Array<{
      roleId: string
      roleName: string
      personId?: string
      personName?: string
    }>
  }>
}

export interface ScheduleMassesResult {
  massesCreated: number
  totalRoles: number
  rolesAssigned: number
  rolesUnassigned: number
  masses: Array<{
    id: string
    date: string
    time: string
    language: string
    calendarEventId: string
    assignments: Array<{
      roleAssignmentId: string
      roleId: string
      roleName: string
      personId: string | null
      personName: string | null
      status: 'ASSIGNED' | 'UNASSIGNED' | 'CONFLICT'
      reason?: string
    }>
  }>
}

export async function scheduleMasses(
  params: ScheduleMassesParams
): Promise<ScheduleMassesResult> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  try {
    // Phase 1: Fetch selected liturgical events
    const { data: liturgicalEvents, error: liturgicalError } = await supabase
      .from('global_liturgical_events')
      .select('*')
      .in('id', params.selectedLiturgicalEventIds)

    if (liturgicalError) {
      logError('Error fetching liturgical events: ' + (liturgicalError instanceof Error ? liturgicalError.message : JSON.stringify(liturgicalError)))
      throw new Error('Failed to fetch liturgical events')
    }

    // Create a map of date -> liturgical event for quick lookup
    const liturgicalEventsByDate = new Map<string, GlobalLiturgicalEvent>()
    for (const event of liturgicalEvents || []) {
      liturgicalEventsByDate.set(event.date, event as GlobalLiturgicalEvent)
    }

    // Phase 2: Fetch mass event type with role definitions
    let massEventType: EventType | null = null

    if (params.eventTypeId) {
      const { data, error } = await supabase
        .from('event_types')
        .select('*')
        .eq('id', params.eventTypeId)
        .eq('parish_id', selectedParishId)
        .eq('system_type', 'mass')
        .is('deleted_at', null)
        .single()

      if (error) {
        logError('Error fetching specified event type: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
        throw new Error('Failed to fetch specified event type')
      }
      massEventType = data
    } else {
      // Find any mass event type for this parish
      const { data, error } = await supabase
        .from('event_types')
        .select('*')
        .eq('parish_id', selectedParishId)
        .eq('system_type', 'mass')
        .is('deleted_at', null)
        .limit(1)
        .single()

      if (error) {
        logError('Error fetching mass event type: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
        throw new Error('No mass event type configured for this parish')
      }
      massEventType = data
    }

    if (!massEventType) {
      throw new Error('No mass event type found')
    }

    // Get role definitions from event type
    const roleDefinitions: RoleDefinition[] = (massEventType.role_definitions as { roles?: RoleDefinition[] })?.roles || []

    // Phase 3: Get the primary calendar event input field definition
    const { data: primaryFieldDef, error: fieldDefError } = await supabase
      .from('input_field_definitions')
      .select('id')
      .eq('event_type_id', massEventType.id)
      .eq('type', 'calendar_event')
      .eq('is_primary', true)
      .is('deleted_at', null)
      .limit(1)
      .single()

    if (fieldDefError) {
      logError('Error fetching primary field definition: ' + (fieldDefError instanceof Error ? fieldDefError.message : JSON.stringify(fieldDefError)))
      throw new Error('No primary calendar event field defined for mass event type')
    }

    // Helper: Find matching liturgical context (for potential future template selection)
    const getLiturgicalContext = (liturgicalEvent: GlobalLiturgicalEvent | null, dayOfWeek: number): LiturgicalContext => {
      if (!liturgicalEvent) return 'ordinary' as LiturgicalContext
      const isSunday = dayOfWeek === 0
      const grade = liturgicalEvent.event_data?.grade || 7
      return getLiturgicalContextFromGrade(grade, isSunday)
    }

    // Phase 4: Generate dates and create Masses
    const massesToCreate: Array<{
      date: string
      time: string
      language: string
      scheduleEntry: MassScheduleEntry
      liturgicalEvent: GlobalLiturgicalEvent | null
      liturgicalContext: LiturgicalContext
      assignments?: Array<{
        roleId: string
        roleName: string
        personId?: string
        personName?: string
      }>
    }> = []

    // If proposedMasses are provided, use them directly instead of generating from schedule
    if (params.proposedMasses && params.proposedMasses.length > 0) {
      for (const proposedMass of params.proposedMasses) {
        const liturgicalEvent = liturgicalEventsByDate.get(proposedMass.date) || null
        const dayOfWeek = new Date(proposedMass.date).getDay()
        const liturgicalContext = getLiturgicalContext(liturgicalEvent, dayOfWeek)

        massesToCreate.push({
          date: proposedMass.date,
          time: proposedMass.time,
          language: 'ENGLISH', // Default language
          scheduleEntry: {
            id: proposedMass.id,
            dayOfWeek,
            time: proposedMass.time,
            language: 'ENGLISH'
          },
          liturgicalEvent,
          liturgicalContext,
          assignments: proposedMass.assignments
        })
      }
    } else {
      // Generate from schedule pattern
      const start = new Date(params.startDate)
      const end = new Date(params.endDate)
      const currentDate = new Date(start)

      while (currentDate <= end) {
        const dayOfWeek = currentDate.getDay()
        const dateStr = toLocalDateString(currentDate)

        // Find all schedule entries matching this day
        const matchingEntries = params.schedule.filter(
          (entry) => entry.dayOfWeek === dayOfWeek
        )

        // Get liturgical event for this date
        const liturgicalEvent = liturgicalEventsByDate.get(dateStr) || null
        const liturgicalContext = getLiturgicalContext(liturgicalEvent, dayOfWeek)

        for (const entry of matchingEntries) {
          massesToCreate.push({
            date: dateStr,
            time: entry.time,
            language: entry.language,
            scheduleEntry: entry,
            liturgicalEvent,
            liturgicalContext
          })
        }

        currentDate.setDate(currentDate.getDate() + 1)
      }
    }

    // Phase 5: Create master_events and calendar_events in batch
    const createdMasses: ScheduleMassesResult['masses'] = []

    for (const massData of massesToCreate) {
      // Normalize time format to ensure HH:MM:SS
      const normalizeTime = (time: string): string => {
        const parts = time.split(':')
        if (parts.length === 3) {
          return parts.map(p => p.padStart(2, '0')).join(':')
        }
        if (parts.length === 2) {
          return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`
        }
        return time
      }
      const normalizedTime = normalizeTime(massData.time)

      // Create datetime string
      const startDatetime = `${massData.date}T${normalizedTime}`

      // Create master_event
      const { data: masterEvent, error: masterEventError } = await supabase
        .from('master_events')
        .insert({
          parish_id: selectedParishId,
          event_type_id: massEventType.id,
          field_values: {
            liturgical_event_id: massData.liturgicalEvent?.id || null,
            liturgical_context: massData.liturgicalContext
          },
          status: 'SCHEDULED'
        })
        .select()
        .single()

      if (masterEventError) {
        logError('Error creating master event: ' + JSON.stringify({
          error: masterEventError,
          massData: {
            date: massData.date,
            time: massData.time,
            liturgicalEventId: massData.liturgicalEvent?.id
          }
        }))
        throw new Error(`Failed to create master event for ${massData.date} ${normalizedTime}: ${masterEventError.message}`)
      }

      // Create calendar_event linked to master_event
      const { data: calendarEvent, error: calendarEventError } = await supabase
        .from('calendar_events')
        .insert({
          master_event_id: masterEvent.id,
          parish_id: selectedParishId,
          input_field_definition_id: primaryFieldDef.id,
          start_datetime: startDatetime,
          is_primary: true,
          is_cancelled: false
        })
        .select()
        .single()

      if (calendarEventError) {
        logError('Error creating calendar event: ' + (calendarEventError instanceof Error ? calendarEventError.message : JSON.stringify(calendarEventError)))
        throw new Error(`Failed to create calendar event for ${massData.date} ${normalizedTime}`)
      }

      // Phase 6: Create role assignments for this Mass
      const roleAssignments: Array<{
        roleAssignmentId: string
        roleId: string
        roleName: string
        personId: string | null
        personName: string | null
        status: 'ASSIGNED' | 'UNASSIGNED' | 'CONFLICT'
        reason?: string
      }> = []

      // If we have assignments from proposedMasses, use those
      if (massData.assignments && massData.assignments.length > 0) {
        for (const assignment of massData.assignments) {
          if (assignment.personId) {
            // Create role assignment with person
            const { data: roleAssignment, error: roleError } = await supabase
              .from('master_event_roles')
              .insert({
                master_event_id: masterEvent.id,
                role_id: assignment.roleId,
                person_id: assignment.personId
              })
              .select()
              .single()

            if (roleError) {
              logError('Error creating role assignment: ' + (roleError instanceof Error ? roleError.message : JSON.stringify(roleError)))
              roleAssignments.push({
                roleAssignmentId: '',
                roleId: assignment.roleId,
                roleName: assignment.roleName,
                personId: null,
                personName: null,
                status: 'UNASSIGNED',
                reason: 'Failed to save assignment'
              })
            } else {
              roleAssignments.push({
                roleAssignmentId: roleAssignment.id,
                roleId: assignment.roleId,
                roleName: assignment.roleName,
                personId: assignment.personId,
                personName: assignment.personName || null,
                status: 'ASSIGNED'
              })
            }
          } else {
            // No person assigned - track as unassigned
            roleAssignments.push({
              roleAssignmentId: '',
              roleId: assignment.roleId,
              roleName: assignment.roleName,
              personId: null,
              personName: null,
              status: 'UNASSIGNED',
              reason: 'Not yet assigned'
            })
          }
        }
      } else {
        // Create empty assignments based on role definitions
        for (const roleDef of roleDefinitions) {
          const count = roleDef.count || 1
          for (let i = 0; i < count; i++) {
            roleAssignments.push({
              roleAssignmentId: '',
              roleId: roleDef.id,
              roleName: roleDef.name,
              personId: null,
              personName: null,
              status: 'UNASSIGNED',
              reason: 'Not yet assigned'
            })
          }
        }
      }

      // Add to result set
      createdMasses.push({
        id: masterEvent.id,
        date: massData.date,
        time: normalizedTime,
        language: massData.language,
        calendarEventId: calendarEvent.id,
        assignments: roleAssignments
      })
    }

    // Phase 7: Run auto-assignment algorithm if enabled and not using proposed masses
    let totalAssigned = 0
    let totalUnassigned = 0
    const totalRoles = createdMasses.reduce(
      (sum, mass) => sum + mass.assignments.length,
      0
    )

    // If proposedMasses were provided with assignments, we already have the assignments
    if (params.proposedMasses && params.proposedMasses.length > 0) {
      // Just count assigned/unassigned from what was created
      for (const mass of createdMasses) {
        for (const assignment of mass.assignments) {
          if (assignment.personId) {
            totalAssigned++
          } else {
            totalUnassigned++
          }
        }
      }
    } else if (params.algorithmOptions.respectBlackoutDates ||
        params.algorithmOptions.balanceWorkload) {

      // Run simplified auto-assignment algorithm
      for (const mass of createdMasses) {
        for (const assignment of mass.assignments) {
          const roleId = assignment.roleId

          if (!roleId) continue

          // Get eligible ministers
          let eligibleMinisters = await getAvailableMinisters(
            roleId,
            mass.date,
            mass.time,
            selectedParishId
          )

          // Check for double-booking conflicts
          const conflictFreeMinisters = []
          for (const minister of eligibleMinisters) {
            const conflict = await hasConflict(
              supabase,
              minister.id,
              mass.date,
              mass.time
            )

            if (!conflict.hasConflict) {
              conflictFreeMinisters.push(minister)
            }
          }

          eligibleMinisters = conflictFreeMinisters

          // Balance workload if enabled (sort by assignment count ascending)
          if (params.algorithmOptions.balanceWorkload) {
            eligibleMinisters.sort((a, b) => a.assignmentCount - b.assignmentCount)
          }

          // Assign first eligible minister
          if (eligibleMinisters.length > 0) {
            const selectedMinister = eligibleMinisters[0]

            // Create the role assignment
            const { data: roleAssignment, error: assignError } = await supabase
              .from('master_event_roles')
              .insert({
                master_event_id: mass.id,
                role_id: roleId,
                person_id: selectedMinister.id
              })
              .select()
              .single()

            if (!assignError && roleAssignment) {
              // Update assignment in result
              assignment.roleAssignmentId = roleAssignment.id
              assignment.personId = selectedMinister.id
              assignment.personName = selectedMinister.name
              assignment.status = 'ASSIGNED'
              totalAssigned++
            } else {
              logError('Error assigning minister: ' + (assignError instanceof Error ? assignError.message : JSON.stringify(assignError)))
              assignment.status = 'UNASSIGNED'
              assignment.reason = 'Failed to save assignment'
              totalUnassigned++
            }
          } else {
            // No eligible ministers found
            assignment.status = 'UNASSIGNED'
            assignment.reason = 'No eligible ministers available'
            totalUnassigned++
          }
        }
      }
    } else {
      totalUnassigned = totalRoles
    }

    // Revalidate masses page
    revalidatePath('/masses')

    return {
      massesCreated: createdMasses.length,
      totalRoles,
      rolesAssigned: totalAssigned,
      rolesUnassigned: totalUnassigned,
      masses: createdMasses,
    }
  } catch (error) {
    logError('Error in scheduleMasses: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw error
  }
}

/**
 * Get suggested minister assignment for a role at a specific date/time
 * Used for preview in Step 6 before actually creating Masses
 */
export async function getSuggestedMinister(
  roleId: string,
  date: string,
  time: string,
  balanceWorkload: boolean,
  alreadyAssignedPersonIds: string[] = []
): Promise<{ id: string; name: string } | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const ministers = await getAvailableMinisters(roleId, date, time, selectedParishId)

  // Filter out people already assigned to this Mass
  const available = ministers.filter(m => !alreadyAssignedPersonIds.includes(m.id))

  if (available.length === 0) return null

  // Balance workload if enabled (sort by assignment count ascending)
  if (balanceWorkload) {
    available.sort((a, b) => a.assignmentCount - b.assignmentCount)
  }

  // Return first eligible minister
  return { id: available[0].id, name: available[0].name }
}

/**
 * Preview minister assignments for proposed masses
 * Used in Step 6 to show assignment summary before actually creating Masses
 */
export async function previewMassAssignments(
  proposedMasses: Array<{
    id: string
    date: string
    time: string
    assignments: Array<{
      roleId: string
      roleName: string
      personId?: string
      personName?: string
    }>
  }>,
  balanceWorkload: boolean
): Promise<Array<{
  massId: string
  assignments: Array<{
    roleId: string
    roleName: string
    personId: string | null
    personName: string | null
  }>
}>> {
  const parishId = await requireSelectedParish()
  await ensureJWTClaims()

  logInfo('[previewMassAssignments] Starting with: ' + JSON.stringify({
    massCount: proposedMasses.length,
    balanceWorkload,
    parishId
  }))

  const result: Array<{
    massId: string
    assignments: Array<{
      roleId: string
      roleName: string
      personId: string | null
      personName: string | null
    }>
  }> = []

  // Track assignments across all masses for workload balancing
  const assignmentCounts = new Map<string, number>()

  for (const mass of proposedMasses) {
    const alreadyAssignedThisMass: string[] = []
    const massAssignments: Array<{
      roleId: string
      roleName: string
      personId: string | null
      personName: string | null
    }> = []

    for (const role of mass.assignments || []) {
      logInfo('[previewMassAssignments] Processing role: ' + JSON.stringify({ massId: mass.id, role }))
      try {
        const suggested = await getSuggestedMinister(
          role.roleId,
          mass.date,
          mass.time,
          balanceWorkload,
          alreadyAssignedThisMass
        )

        logInfo('[previewMassAssignments] Suggested minister: ' + suggested)

        if (suggested) {
          massAssignments.push({
            roleId: role.roleId,
            roleName: role.roleName,
            personId: suggested.id,
            personName: suggested.name
          })
          alreadyAssignedThisMass.push(suggested.id)

          // Track assignment count for workload balancing
          const currentCount = assignmentCounts.get(suggested.id) || 0
          assignmentCounts.set(suggested.id, currentCount + 1)
        } else {
          logInfo('[previewMassAssignments] No suggested minister found for role: ' + role.roleId)
          massAssignments.push({
            roleId: role.roleId,
            roleName: role.roleName,
            personId: null,
            personName: null
          })
        }
      } catch (error) {
        logError(`[previewMassAssignments] Error getting suggested minister for role ${role.roleId}: ` + (error instanceof Error ? error.message : JSON.stringify(error)))
        massAssignments.push({
          roleId: role.roleId,
          roleName: role.roleName,
          personId: null,
          personName: null
        })
      }
    }

    result.push({
      massId: mass.id,
      assignments: massAssignments
    })
  }

  return result
}

/**
 * Get available ministers for a specific role and date/time
 * Considers role membership, blackout dates, and existing assignments
 */
export async function getAvailableMinisters(
  roleId: string,
  date: string,
  time: string,
  parishId: string
): Promise<Array<{ id: string; name: string; assignmentCount: number }>> {
  const supabase = await createClient()

  // 1. Get all active members for this role from mass_role_members
  // Note: roleId here is the role_id from event_type.role_definitions
  // We need to find the corresponding mass_role that matches this role
  const { data: members, error: membersError } = await supabase
    .from('mass_role_members')
    .select(`
      person_id,
      person:people(id, first_name, last_name)
    `)
    .eq('parish_id', parishId)
    .eq('active', true)

  logInfo('[getAvailableMinisters] Query params: ' + JSON.stringify({ roleId, date, time, parishId }))
  logInfo('[getAvailableMinisters] Members query result: ' + JSON.stringify({ members: members?.length ?? 0, error: membersError }))

  if (!members || members.length === 0) {
    logInfo('[getAvailableMinisters] No members found for role: ' + roleId)
    return []
  }

  const ministers: Array<{ id: string; name: string; assignmentCount: number }> = []

  for (const member of members) {
    logInfo('[getAvailableMinisters] Processing member: ' + member)

    if (!member.person) {
      logInfo('[getAvailableMinisters] Skipping member - no person data: ' + member)
      continue
    }

    // Handle both array and object formats from Supabase
    const person = (Array.isArray(member.person) ? member.person[0] : member.person) as { id: string; first_name: string; last_name: string }

    if (!person || !person.id || !person.first_name || !person.last_name) {
      logInfo('[getAvailableMinisters] Skipping member - incomplete person data: ' + person)
      continue
    }

    logInfo('[getAvailableMinisters] Person extracted: ' + person)

    // 2. Check for blackout dates (person-centric, not role-specific)
    const { data: blackouts } = await supabase
      .from('person_blackout_dates')
      .select('*')
      .eq('person_id', person.id)
      .lte('start_date', date)
      .gte('end_date', date)

    // Skip if person has blackout on this date
    if (blackouts && blackouts.length > 0) {
      continue
    }

    // 3. Get assignment count for this person (for workload balancing)
    // Now uses master_event_roles instead of mass_assignment
    const { count } = await supabase
      .from('master_event_roles')
      .select('*', { count: 'exact', head: true })
      .eq('person_id', person.id)
      .is('deleted_at', null)

    const displayName = `${person.first_name} ${person.last_name}`

    ministers.push({
      id: person.id,
      name: displayName,
      assignmentCount: count || 0,
    })
  }

  logInfo('[getAvailableMinisters] Final ministers list: ' + ministers)
  return ministers
}

/**
 * Manually assign a minister to a role
 */
export async function assignMinisterToRole(
  masterEventId: string,
  roleId: string,
  personId: string
): Promise<void> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { error } = await supabase
    .from('master_event_roles')
    .insert({
      master_event_id: masterEventId,
      role_id: roleId,
      person_id: personId
    })

  if (error) {
    logError('Error assigning minister: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to assign minister to role')
  }

  revalidatePath('/masses')
  revalidatePath(`/masses/${masterEventId}`)
}

/**
 * Get scheduling conflicts for a person over a date range
 */
export async function getPersonSchedulingConflicts(
  personId: string,
  startDate: string,
  endDate: string
): Promise<Array<{ date: string; reason: string }>> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Check blackout dates (person-centric, not role-specific)
  const { data: blackoutDates } = await supabase
    .from('person_blackout_dates')
    .select('*')
    .eq('person_id', personId)
    .gte('end_date', startDate)
    .lte('start_date', endDate)

  const conflicts: Array<{ date: string; reason: string }> = []

  if (blackoutDates) {
    for (const blackout of blackoutDates) {
      const start = new Date(blackout.start_date)
      const end = new Date(blackout.end_date)
      const currentDate = new Date(start)

      while (currentDate <= end) {
        conflicts.push({
          date: toLocalDateString(currentDate),
          reason: blackout.reason || 'Blackout period',
        })
        currentDate.setDate(currentDate.getDate() + 1)
      }
    }
  }

  return conflicts
}


/**
 * Check if a person has a scheduling conflict for a specific date/time
 */
async function hasConflict(
  supabase: Awaited<ReturnType<typeof createClient>>,
  personId: string,
  date: string,
  time: string
): Promise<{ hasConflict: boolean; reason?: string }> {
  // Check if person is already assigned to a different role at same time
  // Now uses master_event_roles -> calendar_events instead of mass_assignment -> masses -> events
  const { data: existingAssignments } = await supabase
    .from('master_event_roles')
    .select(`
      id,
      master_event:master_events(
        id,
        calendar_events(
          start_datetime
        )
      )
    `)
    .eq('person_id', personId)
    .is('deleted_at', null)

  if (existingAssignments) {
    for (const assignment of existingAssignments) {
      if (!assignment.master_event) continue

      // Handle both array and single object from Supabase
      const masterEvent = Array.isArray(assignment.master_event)
        ? assignment.master_event[0]
        : assignment.master_event

      if (!masterEvent?.calendar_events) continue

      const calendarEvents = Array.isArray(masterEvent.calendar_events)
        ? masterEvent.calendar_events
        : [masterEvent.calendar_events]

      for (const calendarEvent of calendarEvents) {
        if (!calendarEvent?.start_datetime) continue

        // Parse datetime to compare
        const eventDatetime = new Date(calendarEvent.start_datetime)
        const checkDatetime = new Date(`${date}T${time}`)

        // Check if same date and time (within a reasonable tolerance)
        if (Math.abs(eventDatetime.getTime() - checkDatetime.getTime()) < 60000) { // Within 1 minute
          return { hasConflict: true, reason: 'Already assigned to another role at this Mass' }
        }
      }
    }
  }

  return { hasConflict: false }
}
