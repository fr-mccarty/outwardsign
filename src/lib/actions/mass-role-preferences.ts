'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import type {
  MassRolePreference,
  MassRolePreferenceWithDetails,
  CreateMassRolePreferenceData,
  UpdateMassRolePreferenceData,
  MassRoleBlackoutDate,
  MassRoleBlackoutDateWithPerson,
  CreateMassRoleBlackoutDateData,
  UpdateMassRoleBlackoutDateData,
  PersonRoleStats,
  Person,
} from '@/lib/types'

// ========== MASS ROLE PREFERENCES ==========

/**
 * Get all mass role preferences for a specific person
 */
export async function getMassRolePreferences(personId: string): Promise<MassRolePreference[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_role_preferences')
    .select('*')
    .eq('parish_id', selectedParishId)
    .eq('person_id', personId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching mass role preferences:', error)
    throw new Error('Failed to fetch mass role preferences')
  }

  return data || []
}

/**
 * Get all mass role preferences with person and role details
 */
export async function getMassRolePreferencesWithDetails(
  personId: string
): Promise<MassRolePreferenceWithDetails[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_role_preferences')
    .select(`
      *,
      person:people(*),
      mass_role:mass_roles(*)
    `)
    .eq('parish_id', selectedParishId)
    .eq('person_id', personId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching mass role preferences with details:', error)
    throw new Error('Failed to fetch mass role preferences with details')
  }

  return data as MassRolePreferenceWithDetails[] || []
}

/**
 * Get a single mass role preference by ID
 */
export async function getMassRolePreference(id: string): Promise<MassRolePreference | null> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_role_preferences')
    .select('*')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching mass role preference:', error)
    throw new Error('Failed to fetch mass role preference')
  }

  return data
}

/**
 * Create a new mass role preference
 */
export async function createMassRolePreference(
  data: CreateMassRolePreferenceData
): Promise<MassRolePreference> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: preference, error } = await supabase
    .from('mass_role_preferences')
    .insert({
      parish_id: selectedParishId,
      person_id: data.person_id,
      mass_role_id: data.mass_role_id || null,
      preferred_days: data.preferred_days || null,
      available_days: data.available_days || null,
      unavailable_days: data.unavailable_days || null,
      preferred_times: data.preferred_times || null,
      unavailable_times: data.unavailable_times || null,
      desired_frequency: data.desired_frequency || null,
      max_per_month: data.max_per_month || null,
      languages: data.languages || null,
      notes: data.notes || null,
      active: data.active ?? true,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating mass role preference:', error)
    throw new Error('Failed to create mass role preference')
  }

  revalidatePath('/mass-role-directory')
  revalidatePath(`/mass-role-directory/${data.person_id}`)
  revalidatePath('/my-mass-roles')

  return preference
}

/**
 * Update an existing mass role preference
 */
export async function updateMassRolePreference(
  id: string,
  data: UpdateMassRolePreferenceData
): Promise<MassRolePreference> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {}

  if (data.mass_role_id !== undefined) updateData.mass_role_id = data.mass_role_id
  if (data.preferred_days !== undefined) updateData.preferred_days = data.preferred_days
  if (data.available_days !== undefined) updateData.available_days = data.available_days
  if (data.unavailable_days !== undefined) updateData.unavailable_days = data.unavailable_days
  if (data.preferred_times !== undefined) updateData.preferred_times = data.preferred_times
  if (data.unavailable_times !== undefined) updateData.unavailable_times = data.unavailable_times
  if (data.desired_frequency !== undefined) updateData.desired_frequency = data.desired_frequency
  if (data.max_per_month !== undefined) updateData.max_per_month = data.max_per_month
  if (data.languages !== undefined) updateData.languages = data.languages
  if (data.notes !== undefined) updateData.notes = data.notes
  if (data.active !== undefined) updateData.active = data.active

  const { data: preference, error } = await supabase
    .from('mass_role_preferences')
    .update(updateData)
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .select()
    .single()

  if (error) {
    console.error('Error updating mass role preference:', error)
    throw new Error('Failed to update mass role preference')
  }

  revalidatePath('/mass-role-directory')
  revalidatePath(`/mass-role-directory/${preference.person_id}`)
  revalidatePath('/my-mass-roles')

  return preference
}

/**
 * Delete a mass role preference
 */
export async function deleteMassRolePreference(id: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the preference first to revalidate paths
  const { data: preference } = await supabase
    .from('mass_role_preferences')
    .select('person_id')
    .eq('id', id)
    .eq('parish_id', selectedParishId)
    .single()

  const { error } = await supabase
    .from('mass_role_preferences')
    .delete()
    .eq('id', id)
    .eq('parish_id', selectedParishId)

  if (error) {
    console.error('Error deleting mass role preference:', error)
    throw new Error('Failed to delete mass role preference')
  }

  revalidatePath('/mass-role-directory')
  if (preference?.person_id) {
    revalidatePath(`/mass-role-directory/${preference.person_id}`)
  }
  revalidatePath('/my-mass-roles')
}

// ========== BLACKOUT DATES ==========

/**
 * Get all blackout dates for a specific person
 */
export async function getBlackoutDates(personId: string): Promise<MassRoleBlackoutDate[]> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_role_blackout_dates')
    .select('*')
    .eq('person_id', personId)
    .order('start_date', { ascending: true })

  if (error) {
    console.error('Error fetching blackout dates:', error)
    throw new Error('Failed to fetch blackout dates')
  }

  return data || []
}

/**
 * Get all blackout dates with person details
 */
export async function getBlackoutDatesWithPerson(
  personId: string
): Promise<MassRoleBlackoutDateWithPerson[]> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_role_blackout_dates')
    .select(`
      *,
      person:people(*)
    `)
    .eq('person_id', personId)
    .order('start_date', { ascending: true })

  if (error) {
    console.error('Error fetching blackout dates with person:', error)
    throw new Error('Failed to fetch blackout dates with person')
  }

  return data as MassRoleBlackoutDateWithPerson[] || []
}

/**
 * Get a single blackout date by ID
 */
export async function getBlackoutDate(id: string): Promise<MassRoleBlackoutDate | null> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_role_blackout_dates')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching blackout date:', error)
    throw new Error('Failed to fetch blackout date')
  }

  return data
}

/**
 * Create a new blackout date
 */
export async function createBlackoutDate(
  data: CreateMassRoleBlackoutDateData
): Promise<MassRoleBlackoutDate> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: blackoutDate, error } = await supabase
    .from('mass_role_blackout_dates')
    .insert({
      person_id: data.person_id,
      start_date: data.start_date,
      end_date: data.end_date,
      reason: data.reason || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating blackout date:', error)
    throw new Error('Failed to create blackout date')
  }

  revalidatePath('/mass-role-directory')
  revalidatePath(`/mass-role-directory/${data.person_id}`)
  revalidatePath('/my-mass-roles')

  return blackoutDate
}

/**
 * Update an existing blackout date
 */
export async function updateBlackoutDate(
  id: string,
  data: UpdateMassRoleBlackoutDateData
): Promise<MassRoleBlackoutDate> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {}

  if (data.start_date !== undefined) updateData.start_date = data.start_date
  if (data.end_date !== undefined) updateData.end_date = data.end_date
  if (data.reason !== undefined) updateData.reason = data.reason

  const { data: blackoutDate, error } = await supabase
    .from('mass_role_blackout_dates')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating blackout date:', error)
    throw new Error('Failed to update blackout date')
  }

  revalidatePath('/mass-role-directory')
  revalidatePath(`/mass-role-directory/${blackoutDate.person_id}`)
  revalidatePath('/my-mass-roles')

  return blackoutDate
}

/**
 * Delete a blackout date
 */
export async function deleteBlackoutDate(id: string): Promise<void> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get the blackout date first to revalidate paths
  const { data: blackoutDate } = await supabase
    .from('mass_role_blackout_dates')
    .select('person_id')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('mass_role_blackout_dates')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting blackout date:', error)
    throw new Error('Failed to delete blackout date')
  }

  revalidatePath('/mass-role-directory')
  if (blackoutDate?.person_id) {
    revalidatePath(`/mass-role-directory/${blackoutDate.person_id}`)
  }
  revalidatePath('/my-mass-roles')
}

// ========== PEOPLE WITH MASS ROLES ==========

export interface PersonWithMassRoles extends Person {
  role_names: string[]
  preference_count: number
}

/**
 * Get all people who have mass role preferences (serve in mass roles)
 * Returns people with their role names for display in the directory
 */
export async function getPeopleWithMassRolePreferences(): Promise<PersonWithMassRoles[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get all preferences with role details
  const { data: preferenceData, error: prefError } = await supabase
    .from('mass_role_preferences')
    .select(`
      person_id,
      mass_role:mass_roles(name)
    `)
    .eq('parish_id', selectedParishId)
    .eq('active', true)

  if (prefError) {
    console.error('Error fetching people with preferences:', prefError)
    throw new Error('Failed to fetch people with mass role preferences')
  }

  // Group by person and collect role names
  const personRoles = new Map<string, string[]>()

  preferenceData?.forEach((pref) => {
    if (!personRoles.has(pref.person_id)) {
      personRoles.set(pref.person_id, [])
    }
    // mass_role can be null if the preference is general (mass_role_id is null)
    // When not null, Supabase returns it as a single object (not array) due to foreign key
    const role = pref.mass_role as unknown as { name: string } | null
    if (role?.name) {
      personRoles.get(pref.person_id)!.push(role.name)
    }
  })

  const personIds = Array.from(personRoles.keys())

  if (personIds.length === 0) {
    return []
  }

  // Fetch the actual people records
  const { data: people, error: peopleError } = await supabase
    .from('people')
    .select('*')
    .eq('parish_id', selectedParishId)
    .in('id', personIds)
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })

  if (peopleError) {
    console.error('Error fetching people:', peopleError)
    throw new Error('Failed to fetch people')
  }

  // Combine people with their roles
  return people.map((person: Person) => ({
    ...person,
    role_names: personRoles.get(person.id) || [],
    preference_count: personRoles.get(person.id)?.length || 0
  }))
}

// ========== HELPER FUNCTIONS ==========

/**
 * Get all people who have preferences for a specific mass role
 */
export async function getPeopleWithRole(roleId: string): Promise<Person[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_role_preferences')
    .select('person:people(*)')
    .eq('parish_id', selectedParishId)
    .eq('mass_role_id', roleId)
    .eq('active', true)

  if (error) {
    console.error('Error fetching people with role:', error)
    throw new Error('Failed to fetch people with role')
  }

  // Extract person objects from the nested structure
  // Supabase returns person as an array when using select with join
  const people = data?.map((item: { person: Person | Person[] }) => {
    return Array.isArray(item.person) ? item.person[0] : item.person
  }).filter(Boolean) || []
  return people as Person[]
}

/**
 * Check if a person is available on a specific date
 * Returns true if available, false if blackout date exists
 */
export async function checkAvailability(personId: string, date: string): Promise<boolean> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('mass_role_blackout_dates')
    .select('id')
    .eq('person_id', personId)
    .lte('start_date', date)
    .gte('end_date', date)
    .limit(1)

  if (error) {
    console.error('Error checking availability:', error)
    throw new Error('Failed to check availability')
  }

  // If we found a blackout date, person is NOT available
  return !data || data.length === 0
}

/**
 * Get assignment statistics for a person
 */
export async function getPersonRoleStats(personId: string): Promise<PersonRoleStats> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  try {
    // For now, return empty stats since mass_role_instances is not being used yet
    // This is a placeholder implementation until the mass scheduling system is built
    // The mass_role_instances table tracks actual assignments of people to specific masses

    // TODO: Implement this query once mass scheduling is in place:
    // const { data: instances, error } = await supabase
    //   .from('mass_role_instances')
    //   .select(`
    //     *,
    //     mass:masses(date, parish_id),
    //     template_item:mass_roles_template_items(
    //       mass_role:mass_roles(name)
    //     )
    //   `)
    //   .eq('person_id', personId)

    // For now, just return empty stats
    return {
      total_assignments: 0,
      assignments_this_month: 0,
      assignments_this_year: 0,
      last_assignment_date: null,
      roles: [],
    }
  } catch (error) {
    console.error('Unexpected error in getPersonRoleStats:', error)
    // Return empty stats on any error
    return {
      total_assignments: 0,
      assignments_this_month: 0,
      assignments_this_year: 0,
      last_assignment_date: null,
      roles: [],
    }
  }
}
