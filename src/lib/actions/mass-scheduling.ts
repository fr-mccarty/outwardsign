'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { getUserParishRole, requireModuleAccess } from '@/lib/auth/permissions'
import { MassScheduleEntry } from '@/app/(main)/masses/schedule/steps/step-2-schedule-pattern'

export interface ScheduleMassesParams {
  startDate: string
  endDate: string
  schedule: MassScheduleEntry[]
  templateId: string
  algorithmOptions: {
    respectPreferences: boolean
    balanceWorkload: boolean
    respectBlackoutDates: boolean
    allowManualAdjustments: boolean
  }
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
    // Phase 1: Get template items (roles and counts)
    const { data: templateItems, error: templateError } = await supabase
      .from('mass_roles_template_items')
      .select(`
        *,
        mass_role:mass_roles(*)
      `)
      .eq('template_id', params.templateId)
      .order('position')

    if (templateError) {
      console.error('Error fetching template items:', templateError)
      throw new Error('Failed to fetch template items')
    }

    if (!templateItems || templateItems.length === 0) {
      throw new Error('Template has no role items defined')
    }

    // Phase 2: Generate dates and create Masses with Events
    const massesToCreate: Array<{
      date: string
      time: string
      language: string
      scheduleEntry: MassScheduleEntry
    }> = []

    const start = new Date(params.startDate)
    const end = new Date(params.endDate)
    const currentDate = new Date(start)

    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay()

      // Find all schedule entries matching this day
      const matchingEntries = params.schedule.filter(
        (entry) => entry.dayOfWeek === dayOfWeek
      )

      for (const entry of matchingEntries) {
        massesToCreate.push({
          date: currentDate.toISOString().split('T')[0],
          time: entry.time,
          language: entry.language,
          scheduleEntry: entry,
        })
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Phase 3: Create Events and Masses in batch
    const createdMasses: ScheduleMassesResult['masses'] = []

    for (const massData of massesToCreate) {
      // Create Event first
      const eventName = `Mass - ${massData.date} ${massData.time}`

      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          parish_id: selectedParishId,
          name: eventName,
          event_type: 'MASS',
          start_date: massData.date,
          start_time: massData.time,
          end_date: massData.date,
          language: massData.language,
          is_public: false, // Default to not public, user can change later
        })
        .select()
        .single()

      if (eventError) {
        console.error('Error creating event:', eventError)
        throw new Error(`Failed to create event for ${massData.date} ${massData.time}`)
      }

      // Create Mass linked to Event
      const { data: mass, error: massError } = await supabase
        .from('masses')
        .insert({
          parish_id: selectedParishId,
          event_id: event.id,
          mass_roles_template_id: params.templateId,
          status: 'SCHEDULED',
        })
        .select()
        .single()

      if (massError) {
        console.error('Error creating mass:', massError)
        throw new Error(`Failed to create mass for ${massData.date} ${massData.time}`)
      }

      // Phase 4: Create role instances for this Mass
      const roleInstances: Array<{
        mass_id: string
        person_id: string | null
        mass_roles_template_item_id: string
      }> = []

      for (const templateItem of templateItems) {
        // Create N instances based on count
        for (let i = 0; i < templateItem.count; i++) {
          roleInstances.push({
            mass_id: mass.id,
            person_id: null, // Will be assigned in Phase 5
            mass_roles_template_item_id: templateItem.id,
          })
        }
      }

      const { data: createdInstances, error: instanceError } = await supabase
        .from('mass_role_instances')
        .insert(roleInstances)
        .select()

      if (instanceError) {
        console.error('Error creating role instances:', instanceError)
        throw new Error(`Failed to create role instances for mass ${mass.id}`)
      }

      // Add to result set with placeholder assignments
      createdMasses.push({
        id: mass.id,
        date: massData.date,
        time: massData.time,
        language: massData.language,
        eventId: event.id,
        assignments: createdInstances.map((instance) => {
          const templateItem = templateItems.find(
            (item) => item.id === instance.mass_roles_template_item_id
          )
          return {
            roleInstanceId: instance.id,
            roleId: templateItem?.mass_role.id || '',
            roleName: templateItem?.mass_role.name || 'Unknown Role',
            personId: null,
            personName: null,
            status: 'UNASSIGNED' as const,
            reason: 'Not yet assigned',
          }
        }),
      })
    }

    // Phase 5: Auto-assignment (if enabled)
    let totalAssigned = 0
    let totalUnassigned = 0
    const totalRoles = createdMasses.reduce(
      (sum, mass) => sum + mass.assignments.length,
      0
    )

    if (params.algorithmOptions.respectPreferences ||
        params.algorithmOptions.balanceWorkload ||
        params.algorithmOptions.respectBlackoutDates) {

      // Run auto-assignment algorithm
      for (const mass of createdMasses) {
        for (const assignment of mass.assignments) {
          // Role ID is already in the assignment object
          const roleId = assignment.roleId

          if (!roleId) continue

          // Get eligible ministers for this role
          let eligibleMinisters = await getAvailableMinisters(
            roleId,
            mass.date,
            mass.time,
            selectedParishId
          )

          // Filter by preferences if enabled
          if (params.algorithmOptions.respectPreferences) {
            const filteredMinisters = []

            for (const minister of eligibleMinisters) {
              const prefCheck = await matchesPreferences(
                supabase,
                minister.id,
                roleId,
                selectedParishId,
                mass.date,
                mass.time,
                mass.language
              )

              // Only include if matches preferences (hard constraints)
              if (prefCheck.matches && !prefCheck.reason) {
                filteredMinisters.push(minister)
              } else if (prefCheck.matches && prefCheck.reason) {
                // Soft constraint violation - include but note
                filteredMinisters.push(minister)
              }
            }

            eligibleMinisters = filteredMinisters
          }

          // Check for conflicts
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

          // Check max per month limit if respecting preferences
          if (params.algorithmOptions.respectPreferences) {
            const withinLimitMinisters = []

            for (const minister of eligibleMinisters) {
              // Get preference for max per month
              const { data: pref } = await supabase
                .from('mass_role_preferences')
                .select('max_per_month')
                .eq('person_id', minister.id)
                .eq('parish_id', selectedParishId)
                .eq('mass_role_id', roleId)
                .single()

              if (pref && pref.max_per_month) {
                const monthlyCount = await getMonthlyAssignmentCount(
                  supabase,
                  minister.id,
                  mass.date
                )

                if (monthlyCount < pref.max_per_month) {
                  withinLimitMinisters.push(minister)
                }
              } else {
                // No limit set, include minister
                withinLimitMinisters.push(minister)
              }
            }

            eligibleMinisters = withinLimitMinisters
          }

          // Balance workload if enabled (sort by assignment count)
          if (params.algorithmOptions.balanceWorkload) {
            eligibleMinisters.sort((a, b) => a.assignmentCount - b.assignmentCount)
          }

          // Assign first eligible minister
          if (eligibleMinisters.length > 0) {
            const selectedMinister = eligibleMinisters[0]

            // Update the role instance with person_id
            const { error: assignError } = await supabase
              .from('mass_role_instances')
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
 * Get available ministers for a specific role and date/time
 * Considers blackout dates and existing assignments
 */
export async function getAvailableMinisters(
  roleId: string,
  date: string,
  time: string,
  parishId: string
): Promise<Array<{ id: string; name: string; assignmentCount: number }>> {
  const supabase = await createClient()

  // 1. Get all people with preferences for this role
  const { data: preferences } = await supabase
    .from('mass_role_preferences')
    .select(`
      person_id,
      person:people(id, first_name, last_name, preferred_name)
    `)
    .eq('parish_id', parishId)
    .eq('mass_role_id', roleId)
    .eq('active', true)

  if (!preferences || preferences.length === 0) {
    return []
  }

  const ministers: Array<{ id: string; name: string; assignmentCount: number }> = []

  for (const pref of preferences) {
    if (!pref.person || !Array.isArray(pref.person) || pref.person.length === 0) continue

    const person = pref.person[0] as { id: string; first_name: string; last_name: string; preferred_name: string | null }

    // 2. Check for blackout dates
    const { data: blackouts } = await supabase
      .from('mass_role_blackout_dates')
      .select('*')
      .eq('person_id', person.id)
      .lte('start_date', date)
      .gte('end_date', date)

    // Skip if person has blackout on this date
    if (blackouts && blackouts.length > 0) {
      continue
    }

    // 3. Get assignment count for this person (for workload balancing)
    const { count } = await supabase
      .from('mass_role_instances')
      .select('*', { count: 'exact', head: true })
      .eq('person_id', person.id)

    const displayName = person.preferred_name || `${person.first_name} ${person.last_name}`

    ministers.push({
      id: person.id,
      name: displayName,
      assignmentCount: count || 0,
    })
  }

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
    .from('mass_role_instances')
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

  // Check blackout dates
  const { data: blackoutDates } = await supabase
    .from('mass_role_blackout_dates')
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
          date: currentDate.toISOString().split('T')[0],
          reason: blackout.reason || 'Blackout period',
        })
        currentDate.setDate(currentDate.getDate() + 1)
      }
    }
  }

  return conflicts
}

/**
 * Check if a person matches preferences for a given Mass
 */
async function matchesPreferences(
  supabase: Awaited<ReturnType<typeof createClient>>,
  personId: string,
  roleId: string,
  parishId: string,
  date: string,
  time: string,
  language: string
): Promise<{ matches: boolean; reason?: string }> {
  // Get the person's preferences for this role
  const { data: pref } = await supabase
    .from('mass_role_preferences')
    .select('*')
    .eq('person_id', personId)
    .eq('parish_id', parishId)
    .eq('mass_role_id', roleId)
    .single()

  if (!pref) {
    return { matches: false, reason: 'No preferences set for this role' }
  }

  // Check preferred/available days
  const massDate = new Date(date)
  const dayOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][massDate.getDay()]

  if (pref.unavailable_days && Array.isArray(pref.unavailable_days) && pref.unavailable_days.includes(dayOfWeek)) {
    return { matches: false, reason: `Not available on ${dayOfWeek}s` }
  }

  // Check if within available days (soft constraint)
  const inPreferredDays = pref.preferred_days && Array.isArray(pref.preferred_days) && pref.preferred_days.includes(dayOfWeek)
  const inAvailableDays = pref.available_days && Array.isArray(pref.available_days) && pref.available_days.includes(dayOfWeek)

  if (!inPreferredDays && !inAvailableDays && (pref.preferred_days || pref.available_days)) {
    // Soft constraint - allow but with warning
    return { matches: true, reason: 'Outside preferred days' }
  }

  // Check language capability
  if (pref.languages && Array.isArray(pref.languages)) {
    const hasLanguage = pref.languages.some((lang: { language: string }) => {
      if (language.toLowerCase() === 'en') return lang.language === 'en'
      if (language.toLowerCase() === 'es') return lang.language === 'es'
      return false
    })

    if (!hasLanguage && language !== 'BILINGUAL') {
      return { matches: false, reason: `Does not speak ${language}` }
    }
  }

  return { matches: true }
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
    .from('mass_role_instances')
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
  const startOfMonth = new Date(massDate.getFullYear(), massDate.getMonth(), 1).toISOString().split('T')[0]
  const endOfMonth = new Date(massDate.getFullYear(), massDate.getMonth() + 1, 0).toISOString().split('T')[0]

  const { count } = await supabase
    .from('mass_role_instances')
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
