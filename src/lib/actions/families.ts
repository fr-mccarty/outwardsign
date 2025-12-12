'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import {
  createFamilySchema,
  updateFamilySchema,
  addFamilyMemberSchema,
  updateFamilyMemberSchema,
  type CreateFamilyData,
  type UpdateFamilyData,
  type AddFamilyMemberData,
  type UpdateFamilyMemberData
} from '@/lib/schemas/families'

// ========== TYPE DEFINITIONS ==========

export interface Family {
  id: string
  parish_id: string
  family_name: string
  active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface FamilyMember {
  id: string
  family_id: string
  person_id: string
  relationship: string | null
  is_primary_contact: boolean
  created_at: string
  person?: {
    id: string
    first_name: string
    last_name: string
    full_name: string
    email?: string | null
    phone_number?: string | null
    avatar_url?: string | null
  }
}

export interface FamilyWithMembers extends Family {
  members: FamilyMember[]
}

export interface FamilyFilters {
  search?: string
  sort?: string
  offset?: number
  limit?: number
  activeOnly?: boolean  // true = active only, false = inactive only, undefined = all
}

export interface FamilyStats {
  total: number
  filtered: number
}

// ========== FAMILY CRUD OPERATIONS ==========

export async function getFamilyStats(filters: FamilyFilters = {}): Promise<FamilyStats> {
  await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Get total count
  const { count: totalCount, error: totalError } = await supabase
    .from('families')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null)

  if (totalError) {
    console.error('Error fetching total count:', totalError)
    throw new Error('Failed to fetch total count')
  }

  // Get filtered count
  const { data: allFamilies, error: allError } = await supabase
    .from('families')
    .select('*')
    .is('deleted_at', null)

  if (allError) {
    console.error('Error fetching families for filtering:', allError)
    throw new Error('Failed to fetch families for filtering')
  }

  let filteredFamilies = allFamilies || []

  // Apply active filter (application-level)
  // true = active only, false = inactive only, undefined = all
  if (filters.activeOnly === true) {
    filteredFamilies = filteredFamilies.filter(family => family.active)
  } else if (filters.activeOnly === false) {
    filteredFamilies = filteredFamilies.filter(family => !family.active)
  }

  // Apply search filter (application-level)
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filteredFamilies = filteredFamilies.filter(family =>
      family.family_name.toLowerCase().includes(searchLower)
    )
  }

  return {
    total: totalCount || 0,
    filtered: filteredFamilies.length
  }
}

export async function getFamilies(filters: FamilyFilters = {}): Promise<Family[]> {
  await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('families')
    .select('*')
    .is('deleted_at', null)

  if (error) {
    console.error('Error fetching families:', error)
    throw new Error('Failed to fetch families')
  }

  let families = data || []

  // Apply active filter (application-level)
  // true = active only, false = inactive only, undefined = all
  if (filters.activeOnly === true) {
    families = families.filter(family => family.active)
  } else if (filters.activeOnly === false) {
    families = families.filter(family => !family.active)
  }

  // Apply search filter (application-level)
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    families = families.filter(family =>
      family.family_name.toLowerCase().includes(searchLower)
    )
  }

  // Apply sorting (application-level)
  const sort = filters.sort || 'name_asc'
  families.sort((a, b) => {
    switch (sort) {
      case 'name_desc':
        return b.family_name.localeCompare(a.family_name)
      case 'created_asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'created_desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'name_asc':
      default:
        return a.family_name.localeCompare(b.family_name)
    }
  })

  // Apply pagination (application-level)
  if (filters.offset !== undefined && filters.limit !== undefined) {
    const start = filters.offset
    const end = start + filters.limit
    families = families.slice(start, end)
  }

  return families
}

export async function getFamily(id: string): Promise<FamilyWithMembers | null> {
  await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  const { data: family, error: familyError } = await supabase
    .from('families')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (familyError) {
    if (familyError.code === 'PGRST116') {
      return null // Not found
    }
    console.error('Error fetching family:', familyError)
    throw new Error('Failed to fetch family')
  }

  // Get family members with person details
  const { data: members, error: membersError } = await supabase
    .from('family_members')
    .select(`
      id,
      family_id,
      person_id,
      relationship,
      is_primary_contact,
      created_at,
      person:person_id (
        id,
        first_name,
        last_name,
        full_name,
        email,
        phone_number,
        avatar_url
      )
    `)
    .eq('family_id', id)
    .order('is_primary_contact', { ascending: false })
    .order('created_at', { ascending: true })

  if (membersError) {
    console.error('Error fetching family members:', membersError)
    throw new Error('Failed to fetch family members')
  }

  // Transform the members data to handle Supabase's array return
  const transformedMembers: FamilyMember[] = (members || []).map((member: any) => ({
    id: member.id,
    family_id: member.family_id,
    person_id: member.person_id,
    relationship: member.relationship,
    is_primary_contact: member.is_primary_contact,
    created_at: member.created_at,
    person: Array.isArray(member.person) ? member.person[0] : member.person
  }))

  return {
    ...family,
    members: transformedMembers
  }
}

export async function createFamily(data: CreateFamilyData): Promise<Family> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Server-side validation
  const validatedData = createFamilySchema.parse(data)

  const { data: family, error } = await supabase
    .from('families')
    .insert([
      {
        parish_id: selectedParishId,
        family_name: validatedData.family_name,
        active: validatedData.active ?? true,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating family:', error)
    throw new Error('Failed to create family')
  }

  revalidatePath('/families')
  return family
}

export async function updateFamily(id: string, data: UpdateFamilyData): Promise<Family> {
  await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Server-side validation
  const validatedData = updateFamilySchema.parse(data)

  const updateData: Record<string, unknown> = {}
  if (validatedData.family_name !== undefined) updateData.family_name = validatedData.family_name
  if (validatedData.active !== undefined) updateData.active = validatedData.active

  const { data: family, error } = await supabase
    .from('families')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating family:', error)
    throw new Error('Failed to update family')
  }

  revalidatePath('/families')
  revalidatePath(`/families/${id}`)
  return family
}

export async function deleteFamily(id: string): Promise<void> {
  await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Soft delete
  const { error } = await supabase
    .from('families')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error deleting family:', error)
    throw new Error('Failed to delete family')
  }

  revalidatePath('/families')
}

// ========== FAMILY MEMBER OPERATIONS ==========

export async function addFamilyMember(familyId: string, data: AddFamilyMemberData): Promise<FamilyMember> {
  await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Server-side validation
  const validatedData = addFamilyMemberSchema.parse(data)

  // Verify family exists
  const { data: family, error: familyError } = await supabase
    .from('families')
    .select('id')
    .eq('id', familyId)
    .is('deleted_at', null)
    .single()

  if (familyError || !family) {
    throw new Error('Family not found or access denied')
  }

  // If this member is set as primary contact, remove primary from others
  if (validatedData.is_primary_contact) {
    await supabase
      .from('family_members')
      .update({ is_primary_contact: false })
      .eq('family_id', familyId)
  }

  const { data: member, error } = await supabase
    .from('family_members')
    .insert([
      {
        family_id: familyId,
        person_id: validatedData.person_id,
        relationship: validatedData.relationship || null,
        is_primary_contact: validatedData.is_primary_contact || false,
      }
    ])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('Person is already a member of this family')
    }
    console.error('Error adding family member:', error)
    throw new Error('Failed to add family member')
  }

  revalidatePath('/families')
  revalidatePath(`/families/${familyId}`)
  return member
}

export async function updateFamilyMember(
  familyId: string,
  personId: string,
  data: UpdateFamilyMemberData
): Promise<FamilyMember> {
  await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Server-side validation
  const validatedData = updateFamilyMemberSchema.parse(data)

  // If setting as primary contact, remove primary from others first
  if (validatedData.is_primary_contact) {
    await supabase
      .from('family_members')
      .update({ is_primary_contact: false })
      .eq('family_id', familyId)
  }

  const updateData: Record<string, unknown> = {}
  if (validatedData.relationship !== undefined) updateData.relationship = validatedData.relationship
  if (validatedData.is_primary_contact !== undefined) updateData.is_primary_contact = validatedData.is_primary_contact

  const { data: member, error } = await supabase
    .from('family_members')
    .update(updateData)
    .eq('family_id', familyId)
    .eq('person_id', personId)
    .select()
    .single()

  if (error) {
    console.error('Error updating family member:', error)
    throw new Error('Failed to update family member')
  }

  revalidatePath('/families')
  revalidatePath(`/families/${familyId}`)
  return member
}

export async function removeFamilyMember(familyId: string, personId: string): Promise<void> {
  await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  const { error } = await supabase
    .from('family_members')
    .delete()
    .eq('family_id', familyId)
    .eq('person_id', personId)

  if (error) {
    console.error('Error removing family member:', error)
    throw new Error('Failed to remove family member')
  }

  revalidatePath('/families')
  revalidatePath(`/families/${familyId}`)
}

export async function setPrimaryContact(familyId: string, personId: string): Promise<void> {
  await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Remove primary from all members first
  await supabase
    .from('family_members')
    .update({ is_primary_contact: false })
    .eq('family_id', familyId)

  // Set new primary
  const { error } = await supabase
    .from('family_members')
    .update({ is_primary_contact: true })
    .eq('family_id', familyId)
    .eq('person_id', personId)

  if (error) {
    console.error('Error setting primary contact:', error)
    throw new Error('Failed to set primary contact')
  }

  revalidatePath('/families')
  revalidatePath(`/families/${familyId}`)
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Get all families (for picker components)
 */
export async function getAllFamilies(): Promise<Family[]> {
  await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('families')
    .select('*')
    .is('deleted_at', null)
    .order('family_name', { ascending: true })

  if (error) {
    console.error('Error fetching all families:', error)
    throw new Error('Failed to fetch families')
  }

  return data || []
}

/**
 * Get family info for multiple people (optimized batch query)
 * Returns a map of person ID to their family memberships
 */
export async function getFamilyMembershipsForPeople(personIds: string[]): Promise<Map<string, Array<{
  family_id: string
  family_name: string
  relationship: string | null
  is_primary_contact: boolean
  other_members: Array<{
    person_id: string
    full_name: string
    relationship: string | null
  }>
}>>> {
  if (personIds.length === 0) {
    return new Map()
  }

  await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Get all family memberships for these people
  const { data: memberships, error: membershipError } = await supabase
    .from('family_members')
    .select(`
      family_id,
      person_id,
      relationship,
      is_primary_contact,
      family:family_id (
        id,
        family_name,
        deleted_at
      )
    `)
    .in('person_id', personIds)

  if (membershipError) {
    console.error('Error fetching family memberships:', membershipError)
    return new Map()
  }

  if (!memberships || memberships.length === 0) {
    return new Map()
  }

  // Get unique family IDs (excluding deleted families)
  const familyIds = [...new Set(memberships
    .filter(m => {
      const family = Array.isArray(m.family) ? m.family[0] : m.family
      return family && !family.deleted_at
    })
    .map(m => m.family_id))]

  if (familyIds.length === 0) {
    return new Map()
  }

  // Get all members of these families (for showing "other members")
  const { data: allFamilyMembers, error: allMembersError } = await supabase
    .from('family_members')
    .select(`
      family_id,
      person_id,
      relationship,
      person:person_id (
        id,
        full_name
      )
    `)
    .in('family_id', familyIds)

  if (allMembersError) {
    console.error('Error fetching all family members:', allMembersError)
    return new Map()
  }

  // Build result map
  const resultMap = new Map<string, Array<{
    family_id: string
    family_name: string
    relationship: string | null
    is_primary_contact: boolean
    other_members: Array<{
      person_id: string
      full_name: string
      relationship: string | null
    }>
  }>>()

  for (const membership of memberships) {
    const family = Array.isArray(membership.family) ? membership.family[0] : membership.family
    if (!family || family.deleted_at) continue

    const personId = membership.person_id

    // Get other members of this family (excluding the current person)
    const otherMembers = (allFamilyMembers || [])
      .filter(m => m.family_id === membership.family_id && m.person_id !== personId)
      .map(m => {
        const person = Array.isArray(m.person) ? m.person[0] : m.person
        return {
          person_id: m.person_id,
          full_name: person?.full_name || 'Unknown',
          relationship: m.relationship
        }
      })

    const familyInfo = {
      family_id: membership.family_id,
      family_name: family.family_name,
      relationship: membership.relationship,
      is_primary_contact: membership.is_primary_contact,
      other_members: otherMembers
    }

    if (!resultMap.has(personId)) {
      resultMap.set(personId, [])
    }
    resultMap.get(personId)!.push(familyInfo)
  }

  return resultMap
}

/**
 * Get blackout dates for family members on a specific date
 * Returns a map of person ID to their family members' blackout dates for that date
 */
export async function getFamilyBlackoutDatesForPeople(
  personIds: string[],
  targetDate: string
): Promise<Map<string, Array<{
  person_id: string
  full_name: string
  relationship: string | null
  blackout_reason: string | null
}>>> {
  if (personIds.length === 0) {
    return new Map()
  }

  await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // First, get all family IDs for these people
  const { data: memberships, error: membershipError } = await supabase
    .from('family_members')
    .select(`
      family_id,
      person_id,
      family:family_id (
        id,
        deleted_at
      )
    `)
    .in('person_id', personIds)

  if (membershipError) {
    console.error('Error fetching family memberships for blackout:', membershipError)
    return new Map()
  }

  if (!memberships || memberships.length === 0) {
    return new Map()
  }

  // Get unique family IDs (excluding deleted families)
  const familyIds = [...new Set(memberships
    .filter(m => {
      const family = Array.isArray(m.family) ? m.family[0] : m.family
      return family && !family.deleted_at
    })
    .map(m => m.family_id))]

  if (familyIds.length === 0) {
    return new Map()
  }

  // Get all members of these families with their person details
  const { data: allFamilyMembers, error: allMembersError } = await supabase
    .from('family_members')
    .select(`
      family_id,
      person_id,
      relationship,
      person:person_id (
        id,
        full_name
      )
    `)
    .in('family_id', familyIds)

  if (allMembersError) {
    console.error('Error fetching all family members for blackout:', allMembersError)
    return new Map()
  }

  // Get person IDs of all family members (excluding the original people)
  const familyMemberPersonIds = [...new Set((allFamilyMembers || [])
    .map(m => m.person_id)
    .filter(id => !personIds.includes(id)))]

  if (familyMemberPersonIds.length === 0) {
    return new Map()
  }

  // Get blackout dates for family members that include the target date
  const { data: blackoutDates, error: blackoutError } = await supabase
    .from('person_blackout_dates')
    .select('person_id, reason')
    .in('person_id', familyMemberPersonIds)
    .lte('start_date', targetDate)
    .gte('end_date', targetDate)

  if (blackoutError) {
    console.error('Error fetching blackout dates:', blackoutError)
    return new Map()
  }

  // Create a set of person IDs with blackout dates on target date
  const blackoutByPersonId = new Map<string, string | null>()
  for (const bd of blackoutDates || []) {
    blackoutByPersonId.set(bd.person_id, bd.reason)
  }

  // Build result map: for each original person, list their family members with blackout dates
  const resultMap = new Map<string, Array<{
    person_id: string
    full_name: string
    relationship: string | null
    blackout_reason: string | null
  }>>()

  for (const membership of memberships) {
    const family = Array.isArray(membership.family) ? membership.family[0] : membership.family
    if (!family || family.deleted_at) continue

    const personId = membership.person_id

    // Find family members in this family (excluding the current person)
    const familyMembersWithBlackout = (allFamilyMembers || [])
      .filter(m => m.family_id === membership.family_id && m.person_id !== personId)
      .filter(m => blackoutByPersonId.has(m.person_id))
      .map(m => {
        const person = Array.isArray(m.person) ? m.person[0] : m.person
        return {
          person_id: m.person_id,
          full_name: person?.full_name || 'Unknown',
          relationship: m.relationship,
          blackout_reason: blackoutByPersonId.get(m.person_id) || null
        }
      })

    if (familyMembersWithBlackout.length > 0) {
      if (!resultMap.has(personId)) {
        resultMap.set(personId, [])
      }
      // Add only unique entries (in case person is in multiple families)
      const existing = resultMap.get(personId)!
      for (const member of familyMembersWithBlackout) {
        if (!existing.some(e => e.person_id === member.person_id)) {
          existing.push(member)
        }
      }
    }
  }

  return resultMap
}

/**
 * Get families for a specific person
 */
export async function getPersonFamilies(personId: string): Promise<FamilyWithMembers[]> {
  await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Get family IDs for this person
  const { data: memberships, error: membershipError } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('person_id', personId)

  if (membershipError) {
    console.error('Error fetching person family memberships:', membershipError)
    throw new Error('Failed to fetch person family memberships')
  }

  if (!memberships || memberships.length === 0) {
    return []
  }

  const familyIds = memberships.map(m => m.family_id)

  // Fetch each family with members
  const families: FamilyWithMembers[] = []
  for (const familyId of familyIds) {
    const family = await getFamily(familyId)
    if (family) {
      families.push(family)
    }
  }

  return families
}
