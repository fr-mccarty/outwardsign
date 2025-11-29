'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { getUserParishRole, requireModuleAccess } from '@/lib/auth/permissions'
import { MassScheduleEntry } from '@/app/(main)/masses/schedule/steps/step-2-schedule-pattern'
import { getLiturgicalContextFromGrade, type LiturgicalContext } from '@/lib/constants'
import { toLocalDateString } from '@/lib/utils/formatters'
import type { GlobalLiturgicalEvent } from '@/lib/actions/global-liturgical-events'

export interface ScheduleMassesParams {
  startDate: string
  endDate: string
  schedule: MassScheduleEntry[]
  templateIds: string[]  // Multiple role templates
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
    templateId: string
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
    eventId: string
    assignments: Array<{
      roleInstanceId: string
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

  // Check permissions - only Admin and Staff can schedule masses
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'masses')

  try {
    // Phase 1: Fetch selected liturgical events
    const { data: liturgicalEvents, error: liturgicalError } = await supabase
      .from('global_liturgical_events')
      .select('*')
      .in('id', params.selectedLiturgicalEventIds)

    if (liturgicalError) {
      console.error('Error fetching liturgical events:', liturgicalError)
      throw new Error('Failed to fetch liturgical events')
    }

    // Create a map of date -> liturgical event for quick lookup
    const liturgicalEventsByDate = new Map<string, GlobalLiturgicalEvent>()
    for (const event of liturgicalEvents || []) {
      liturgicalEventsByDate.set(event.date, event as GlobalLiturgicalEvent)
    }

    // Phase 2: Fetch templates with their liturgical_contexts
    const { data: templates, error: templatesError } = await supabase
      .from('mass_roles_templates')
      .select('*')
      .in('id', params.templateIds)

    if (templatesError) {
      console.error('Error fetching templates:', templatesError)
      throw new Error('Failed to fetch templates')
    }

    if (!templates || templates.length === 0) {
      throw new Error('No templates selected')
    }

    // Helper: Find matching template for a liturgical context
    const findTemplateForContext = (context: LiturgicalContext): typeof templates[0] | null => {
      // Find template that includes this context
      const match = templates.find(t =>
        t.liturgical_contexts && t.liturgical_contexts.includes(context)
      )
      // Fallback to first template if no match
      return match || templates[0]
    }

    // Phase 3: Generate dates and create Masses with Events
    const massesToCreate: Array<{
      date: string
      time: string
      language: string
      scheduleEntry: MassScheduleEntry
      liturgicalEvent: GlobalLiturgicalEvent | null
      templateId: string
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

        massesToCreate.push({
          date: proposedMass.date,
          time: proposedMass.time,
          language: 'ENGLISH', // Default language, TODO: get from mass times template
          scheduleEntry: {
            id: proposedMass.id,
            dayOfWeek: new Date(proposedMass.date).getDay(),
            time: proposedMass.time,
            language: 'ENGLISH'
          },
          liturgicalEvent,
          templateId: proposedMass.templateId,
          assignments: proposedMass.assignments
        })
      }
    } else {
      // Fallback to old logic if no proposed masses
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

        // Determine liturgical context and matching template
        let templateId = templates[0].id
        if (liturgicalEvent) {
          const isSunday = dayOfWeek === 0
          const grade = liturgicalEvent.event_data?.grade || 7
          const context = getLiturgicalContextFromGrade(grade, isSunday)
          const matchingTemplate = findTemplateForContext(context)
          if (matchingTemplate) {
            templateId = matchingTemplate.id
          }
        }

        for (const entry of matchingEntries) {
          massesToCreate.push({
            date: dateStr,
            time: entry.time,
            language: entry.language,
            scheduleEntry: entry,
            liturgicalEvent,
            templateId,
          })
        }

        currentDate.setDate(currentDate.getDate() + 1)
      }
    }

    // Phase 4: Create Events and Masses in batch
    const createdMasses: ScheduleMassesResult['masses'] = []

    // Pre-fetch template items for all templates
    const templateItemsMap = new Map<string, any[]>()
    for (const template of templates) {
      const { data: items } = await supabase
        .from('mass_roles_template_items')
        .select(`*, mass_role:mass_roles(*)`)
        .eq('mass_roles_template_id', template.id)
        .order('position')
      templateItemsMap.set(template.id, items || [])
    }

    for (const massData of massesToCreate) {
      // Get template items for this mass's template
      const templateItems = templateItemsMap.get(massData.templateId) || []

      // Normalize time format to ensure HH:MM:SS
      // PostgreSQL TIME fields can sometimes return shortened formats like "9:0:0"
      // We need to ensure proper zero-padding: "09:00:00"
      const normalizeTime = (time: string): string => {
        const parts = time.split(':')
        if (parts.length === 3) {
          return parts.map(p => p.padStart(2, '0')).join(':')
        }
        return time
      }
      const normalizedTime = normalizeTime(massData.time)

      // Create Event first - use liturgical event name if available
      const eventName = massData.liturgicalEvent
        ? `${massData.liturgicalEvent.event_data.name} - ${normalizedTime}`
        : `Mass - ${massData.date} ${normalizedTime}`

      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          parish_id: selectedParishId,
          name: eventName,
          related_event_type: 'MASS',
          start_date: massData.date,
          start_time: normalizedTime,
          end_date: massData.date,
          language: massData.language,
        })
        .select()
        .single()

      if (eventError) {
        console.error('Error creating event:', {
          error: eventError,
          massData: {
            date: massData.date,
            time: massData.time,
            normalizedTime,
            templateId: massData.templateId,
            liturgicalEventId: massData.liturgicalEvent?.id
          },
          insertData: {
            parish_id: selectedParishId,
            name: eventName,
            related_event_type: 'MASS',
            start_date: massData.date,
            start_time: normalizedTime,
            end_date: massData.date,
            language: massData.language,
          }
        })
        throw new Error(`Failed to create event for ${massData.date} ${normalizedTime}: ${eventError.message || JSON.stringify(eventError)}`)
      }

      // Create Mass linked to Event
      const { data: mass, error: massError } = await supabase
        .from('masses')
        .insert({
          parish_id: selectedParishId,
          event_id: event.id,
          mass_roles_template_id: massData.templateId,
          liturgical_event_id: massData.liturgicalEvent?.id || null,
          status: 'SCHEDULED',
        })
        .select()
        .single()

      if (massError) {
        console.error('Error creating mass:', massError)
        throw new Error(`Failed to create mass for ${massData.date} ${massData.time}`)
      }

      // Phase 5: Create role instances for this Mass
      const roleInstances: Array<{
        mass_id: string
        person_id: string | null
        mass_roles_template_item_id: string
      }> = []

      // If we have assignments from proposedMasses, use those
      if (massData.assignments && massData.assignments.length > 0) {
        // Create role instances with assignments from proposed masses
        for (const assignment of massData.assignments) {
          // Find the matching template item for this role
          const templateItem = templateItems.find(item => item.mass_role?.id === assignment.roleId)
          if (templateItem) {
            roleInstances.push({
              mass_id: mass.id,
              person_id: assignment.personId || null,
              mass_roles_template_item_id: templateItem.id,
            })
          }
        }
      } else {
        // Fallback to creating empty instances from template
        for (const templateItem of templateItems) {
          // Create N instances based on count
          for (let i = 0; i < templateItem.count; i++) {
            roleInstances.push({
              mass_id: mass.id,
              person_id: null,
              mass_roles_template_item_id: templateItem.id,
            })
          }
        }
      }

      const { data: createdInstances, error: instanceError } = await supabase
        .from('mass_assignment')
        .insert(roleInstances)
        .select()

      if (instanceError) {
        console.error('Error creating role instances:', instanceError)
        throw new Error(`Failed to create role instances for mass ${mass.id}`)
      }

      // Add to result set
      createdMasses.push({
        id: mass.id,
        date: massData.date,
        time: normalizedTime,
        language: massData.language,
        eventId: event.id,
        assignments: createdInstances.map((instance) => {
          const templateItem = templateItems.find(
            (item) => item.id === instance.mass_roles_template_item_id
          )
          // Find matching assignment from proposed masses if available
          const proposedAssignment = massData.assignments?.find(a => a.roleId === templateItem?.mass_role.id)

          return {
            roleInstanceId: instance.id,
            roleId: templateItem?.mass_role.id || '',
            roleName: templateItem?.mass_role.name || 'Unknown Role',
            personId: instance.person_id,
            personName: proposedAssignment?.personName || null,
            status: instance.person_id ? 'ASSIGNED' as const : 'UNASSIGNED' as const,
            reason: instance.person_id ? undefined : 'Not yet assigned',
          }
        }),
      })
    }

    // Phase 5: Calculate assignment statistics
    let totalAssigned = 0
    let totalUnassigned = 0
    const totalRoles = createdMasses.reduce(
      (sum, mass) => sum + mass.assignments.length,
      0
    )

    // If proposedMasses were provided with assignments, we already have the assignments
    // Skip auto-assignment algorithm
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

      // Run simplified auto-assignment algorithm for old flow
      for (const mass of createdMasses) {
        for (const assignment of mass.assignments) {
          const roleId = assignment.roleId

          if (!roleId) continue

          // Get eligible ministers (already filters by active membership and blackout dates)
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

            // Update the role instance with person_id
            const { error: assignError } = await supabase
              .from('mass_assignment')
              .update({ person_id: selectedMinister.id })
              .eq('id', assignment.roleInstanceId)

            if (!assignError) {
              // Update assignment in result
              assignment.personId = selectedMinister.id
              assignment.personName = selectedMinister.name
              assignment.status = 'ASSIGNED'
              totalAssigned++
            } else {
              console.error('Error assigning minister:', assignError)
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
    console.error('Error in scheduleMasses:', error)
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
  alreadyAssignedPersonIds: string[] = [],
  massTimesTemplateItemId?: string
): Promise<{ id: string; name: string } | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const ministers = await getAvailableMinisters(roleId, date, time, selectedParishId, massTimesTemplateItemId)

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
    massTimesTemplateItemId?: string
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

  console.log('[previewMassAssignments] Starting with:', {
    massCount: proposedMasses.length,
    balanceWorkload,
    parishId
  })

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
      console.log('[previewMassAssignments] Processing role:', { massId: mass.id, role })
      try {
        const suggested = await getSuggestedMinister(
          role.roleId,
          mass.date,
          mass.time,
          balanceWorkload,
          alreadyAssignedThisMass,
          mass.massTimesTemplateItemId
        )

        console.log('[previewMassAssignments] Suggested minister:', suggested)

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
          console.log('[previewMassAssignments] No suggested minister found for role:', role.roleId)
          massAssignments.push({
            roleId: role.roleId,
            roleName: role.roleName,
            personId: null,
            personName: null
          })
        }
      } catch (error) {
        console.error(`[previewMassAssignments] Error getting suggested minister for role ${role.roleId}:`, error)
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
  parishId: string,
  massTimesTemplateItemId?: string
): Promise<Array<{ id: string; name: string; assignmentCount: number }>> {
  const supabase = await createClient()

  // 1. Get all active members for this role
  const { data: members, error: membersError } = await supabase
    .from('mass_role_members')
    .select(`
      person_id,
      person:people(id, first_name, last_name, mass_times_template_item_ids)
    `)
    .eq('parish_id', parishId)
    .eq('mass_role_id', roleId)
    .eq('active', true)

  console.log('[getAvailableMinisters] Query params:', { roleId, date, time, parishId, massTimesTemplateItemId })
  console.log('[getAvailableMinisters] Members query result:', { members, membersError })

  if (!members || members.length === 0) {
    console.log('[getAvailableMinisters] No members found for role:', roleId)
    return []
  }

  const ministers: Array<{ id: string; name: string; assignmentCount: number }> = []

  for (const member of members) {
    console.log('[getAvailableMinisters] Processing member:', member)

    if (!member.person) {
      console.log('[getAvailableMinisters] Skipping member - no person data:', member)
      continue
    }

    // Handle both array and object formats from Supabase
    const person = (Array.isArray(member.person) ? member.person[0] : member.person) as { id: string; first_name: string; last_name: string; mass_times_template_item_ids?: string[] }

    if (!person || !person.id || !person.first_name || !person.last_name) {
      console.log('[getAvailableMinisters] Skipping member - incomplete person data:', person)
      continue
    }

    console.log('[getAvailableMinisters] Person extracted:', person)

    // 2. Filter by preferred mass times (if specified)
    if (massTimesTemplateItemId && person.mass_times_template_item_ids && person.mass_times_template_item_ids.length > 0) {
      if (!person.mass_times_template_item_ids.includes(massTimesTemplateItemId)) {
        console.log('[getAvailableMinisters] Skipping person - not in preferred mass times:', {
          personId: person.id,
          personName: `${person.first_name} ${person.last_name}`,
          preferredMassTimes: person.mass_times_template_item_ids,
          requestedMassTime: massTimesTemplateItemId
        })
        continue
      }
    }

    // 3. Check for blackout dates (person-centric, not role-specific)
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

    // 4. Get assignment count for this person (for workload balancing)
    const { count } = await supabase
      .from('mass_assignment')
      .select('*', { count: 'exact', head: true })
      .eq('person_id', person.id)

    const displayName = `${person.first_name} ${person.last_name}`

    ministers.push({
      id: person.id,
      name: displayName,
      assignmentCount: count || 0,
    })
  }

  console.log('[getAvailableMinisters] Final ministers list:', ministers)
  return ministers
}

/**
 * Manually assign a minister to a role instance
 */
export async function assignMinisterToRole(
  massRoleInstanceId: string,
  personId: string
): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  const userParish = await getUserParishRole(user.id, selectedParishId)
  requireModuleAccess(userParish, 'masses')

  const { error } = await supabase
    .from('mass_assignment')
    .update({ person_id: personId })
    .eq('id', massRoleInstanceId)

  if (error) {
    console.error('Error assigning minister:', error)
    throw new Error('Failed to assign minister to role')
  }

  revalidatePath('/masses')
}

/**
 * Get scheduling conflicts for a person over a date range
 */
export async function getPersonSchedulingConflicts(
  personId: string,
  startDate: string,
  endDate: string
): Promise<Array<{ date: string; reason: string }>> {
  const selectedParishId = await requireSelectedParish()
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
  const { data: existingAssignments } = await supabase
    .from('mass_assignment')
    .select(`
      id,
      mass:masses(
        id,
        event:events(
          start_date,
          start_time
        )
      )
    `)
    .eq('person_id', personId)

  if (existingAssignments) {
    for (const assignment of existingAssignments) {
      if (!assignment.mass || !Array.isArray(assignment.mass) || assignment.mass.length === 0) continue
      const mass = assignment.mass[0] as any
      if (!mass?.event || !Array.isArray(mass.event) || mass.event.length === 0) continue
      const event = mass.event[0] as { start_date: string; start_time: string }
      if (event?.start_date === date && event?.start_time === time) {
        return { hasConflict: true, reason: 'Already assigned to another role at this Mass' }
      }
    }
  }

  return { hasConflict: false }
}

/**
 * Get assignment count for a person in a given month
 */
async function getMonthlyAssignmentCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  personId: string,
  date: string
): Promise<number> {
  const massDate = new Date(date)
  const startOfMonth = toLocalDateString(new Date(massDate.getFullYear(), massDate.getMonth(), 1))
  const endOfMonth = toLocalDateString(new Date(massDate.getFullYear(), massDate.getMonth() + 1, 0))

  const { count } = await supabase
    .from('mass_assignment')
    .select(`
      id,
      mass:masses!inner(
        event:events!inner(start_date)
      )
    `, { count: 'exact', head: true })
    .eq('person_id', personId)
    .gte('mass.event.start_date', startOfMonth)
    .lte('mass.event.start_date', endOfMonth)

  return count || 0
}
