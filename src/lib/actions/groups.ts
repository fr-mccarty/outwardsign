'use server'

import { createClient } from '@/lib/supabase/server'
// redirect import removed - not used
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import {
  createGroupSchema,
  updateGroupSchema,
  type CreateGroupData,
  type UpdateGroupData
} from '@/lib/schemas/groups'
import { logError } from '@/lib/utils/console'

export interface Group {
  id: string
  parish_id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  person_id: string
  group_role_id?: string | null
  joined_at: string
  person?: {
    id: string
    first_name: string
    last_name: string
    full_name: string  // Auto-generated: first_name || ' ' || last_name
    email?: string
  }
  group_role?: {
    id: string
    name: string
    description?: string
  } | null
}

export interface GroupWithMembers extends Group {
  members: GroupMember[]
}

// Note: Import CreateGroupData and UpdateGroupData from '@/lib/schemas/groups' instead

export interface GroupFilters {
  search?: string
  status?: string
  sort?: string
  offset?: number
  limit?: number
}

export interface GroupStats {
  total: number
  filtered: number
}

export async function getGroupStats(filters: GroupFilters = {}): Promise<GroupStats> {
  await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Get total count
  const { count: totalCount, error: totalError } = await supabase
    .from('groups')
    .select('*', { count: 'exact', head: true })

  if (totalError) {
    logError('Error fetching total count: ' + (totalError instanceof Error ? totalError.message : JSON.stringify(totalError)))
    throw new Error('Failed to fetch total count')
  }

  // Get filtered count (all groups, no search applied)
  const { data: allGroups, error: allError } = await supabase
    .from('groups')
    .select('*')

  if (allError) {
    logError('Error fetching groups for filtering: ' + (allError instanceof Error ? allError.message : JSON.stringify(allError)))
    throw new Error('Failed to fetch groups for filtering')
  }

  let filteredGroups = allGroups || []

  // Apply status filter (application-level)
  if (filters.status && filters.status !== 'all') {
    const isActive = filters.status === 'ACTIVE'
    filteredGroups = filteredGroups.filter(group => group.is_active === isActive)
  }

  // Apply search filter (application-level)
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filteredGroups = filteredGroups.filter(group =>
      group.name.toLowerCase().includes(searchLower) ||
      (group.description && group.description.toLowerCase().includes(searchLower))
    )
  }

  return {
    total: totalCount || 0,
    filtered: filteredGroups.length
  }
}

export async function getGroups(filters: GroupFilters = {}): Promise<Group[]> {
  await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('groups')
    .select('*')

  if (error) {
    logError('Error fetching groups: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch groups')
  }

  let groups = data || []

  // Apply status filter (application-level)
  if (filters.status && filters.status !== 'all') {
    const isActive = filters.status === 'ACTIVE'
    groups = groups.filter(group => group.is_active === isActive)
  }

  // Apply search filter (application-level)
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    groups = groups.filter(group =>
      group.name.toLowerCase().includes(searchLower) ||
      (group.description && group.description.toLowerCase().includes(searchLower))
    )
  }

  // Apply sorting (application-level)
  const sort = filters.sort || 'name_asc'
  groups.sort((a, b) => {
    switch (sort) {
      case 'name_desc':
        return b.name.localeCompare(a.name)
      case 'created_asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'created_desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'name_asc':
      default:
        return a.name.localeCompare(b.name)
    }
  })

  // Apply pagination (application-level)
  if (filters.offset !== undefined && filters.limit !== undefined) {
    const start = filters.offset
    const end = start + filters.limit
    groups = groups.slice(start, end)
  }

  return groups
}

export async function getGroup(id: string): Promise<GroupWithMembers | null> {
  await requireSelectedParish()
  await ensureJWTClaims()
  
  const supabase = await createClient()

  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .eq('id', id)
    .single()

  if (groupError) {
    if (groupError.code === 'PGRST116') {
      return null // Not found
    }
    logError('Error fetching group: ' + (groupError instanceof Error ? groupError.message : JSON.stringify(groupError)))
    throw new Error('Failed to fetch group')
  }

  // Get group members with person details and group role
  const { data: members, error: membersError } = await supabase
    .from('group_members')
    .select(`
      id,
      group_id,
      person_id,
      group_role_id,
      joined_at,
      person:person_id (
        id,
        first_name,
        last_name,
        full_name,
        email
      ),
      group_role:group_role_id (
        id,
        name,
        description
      )
    `)
    .eq('group_id', id)
    .order('joined_at', { ascending: true })

  if (membersError) {
    logError('Error fetching group members: ' + (membersError instanceof Error ? membersError.message : JSON.stringify(membersError)))
    throw new Error('Failed to fetch group members')
  }

  return {
    ...group,
    members: members || []
  }
}

export async function createGroup(data: CreateGroupData): Promise<Group> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // REQUIRED: Server-side validation (security boundary)
  const validatedData = createGroupSchema.parse(data)

  const { data: group, error } = await supabase
    .from('groups')
    .insert([
      {
        parish_id: selectedParishId,
        name: validatedData.name,
        description: validatedData.description || null,
        is_active: validatedData.is_active ?? true,
      }
    ])
    .select()
    .single()

  if (error) {
    logError('Error creating group: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to create group')
  }

  revalidatePath('/groups')
  return group
}

export async function updateGroup(id: string, data: UpdateGroupData): Promise<Group> {
  await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // REQUIRED: Server-side validation (security boundary)
  const validatedData = updateGroupSchema.parse(data)

  const updateData: Record<string, unknown> = {}
  if (validatedData.name !== undefined) updateData.name = validatedData.name
  if (validatedData.description !== undefined) updateData.description = validatedData.description || null
  if (validatedData.is_active !== undefined) updateData.is_active = validatedData.is_active

  const { data: group, error } = await supabase
    .from('groups')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    logError('Error updating group: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to update group')
  }

  revalidatePath('/groups')
  revalidatePath(`/groups/${id}`)
  return group
}

export async function deleteGroup(id: string): Promise<void> {
  await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', id)

  if (error) {
    logError('Error deleting group: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to delete group')
  }

  revalidatePath('/groups')
}

export async function addGroupMember(groupId: string, personId: string, groupRoleId?: string): Promise<GroupMember> {
  await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Verify group exists (RLS will handle access control)
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('id')
    .eq('id', groupId)
    .single()

  if (groupError || !group) {
    throw new Error('Group not found or access denied')
  }

  const { data: member, error } = await supabase
    .from('group_members')
    .insert([
      {
        group_id: groupId,
        person_id: personId,
        group_role_id: groupRoleId || null,
      }
    ])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('Person is already a member of this group')
    }
    logError('Error adding group member: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to add group member')
  }

  revalidatePath('/groups')
  revalidatePath(`/groups/${groupId}`)
  return member
}

export async function removeGroupMember(groupId: string, personId: string): Promise<void> {
  await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Verify group exists (RLS will handle access control)
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('id')
    .eq('id', groupId)
    .single()

  if (groupError || !group) {
    throw new Error('Group not found or access denied')
  }

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('person_id', personId)

  if (error) {
    logError('Error removing group member: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to remove group member')
  }

  revalidatePath('/groups')
  revalidatePath(`/groups/${groupId}`)
}

export async function updateGroupMemberRole(groupId: string, personId: string, groupRoleId?: string | null): Promise<GroupMember> {
  await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  // Verify group exists (RLS will handle access control)
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('id')
    .eq('id', groupId)
    .single()

  if (groupError || !group) {
    throw new Error('Group not found or access denied')
  }

  const { data: member, error } = await supabase
    .from('group_members')
    .update({ group_role_id: groupRoleId })
    .eq('group_id', groupId)
    .eq('person_id', personId)
    .select()
    .single()

  if (error) {
    logError('Error updating group member role: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to update group member role')
  }

  revalidatePath('/groups')
  revalidatePath(`/groups/${groupId}`)
  return member
}

export async function getActiveGroups(): Promise<Group[]> {
  await requireSelectedParish()
  await ensureJWTClaims()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    logError('Error fetching active groups: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch active groups')
  }

  return data || []
}

// ========== GROUP MEMBER DIRECTORY FUNCTIONS ==========

export interface GroupMemberWithDetails extends GroupMember {
  person: {
    id: string
    first_name: string
    last_name: string
    full_name: string  // Auto-generated: first_name || ' ' || last_name
    email?: string
    phone_number?: string
  }
  group_role: {
    id: string
    name: string
    description?: string
  } | null
}

export interface PersonGroupMembership {
  id: string
  group_id: string
  person_id: string
  group_role_id?: string | null
  joined_at: string
  group: {
    id: string
    name: string
    description?: string
    is_active: boolean
  }
  group_role: {
    id: string
    name: string
    description?: string
  } | null
}

export interface GroupMemberFilters {
  search?: string
  sort?: 'name_asc' | 'name_desc' | 'groups_asc' | 'groups_desc' | 'created_asc' | 'created_desc'
  offset?: number
  limit?: number
}

export interface GroupMemberStats {
  total: number
  filtered: number
}

export interface PersonWithMemberships {
  person: {
    id: string
    first_name: string
    last_name: string
    full_name: string
    email?: string | null
    phone_number?: string | null
    avatar_url?: string | null
  }
  memberships: Array<{
    id: string
    group_id: string
    group_role_id?: string | null
    joined_at: string
    group_role: {
      id: string
      name: string
      description?: string
    } | null
  }>
}

export async function getGroupMemberStats(filters: GroupMemberFilters = {}): Promise<GroupMemberStats> {
  const allPeople = await getPeopleWithGroupMemberships({})
  const filteredPeople = await getPeopleWithGroupMemberships(filters)

  return {
    total: allPeople.length,
    filtered: filteredPeople.length
  }
}

export async function getPeopleWithGroupMemberships(filters: GroupMemberFilters = {}): Promise<PersonWithMemberships[]> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('group_members')
    .select(`
      id,
      group_id,
      person_id,
      group_role_id,
      joined_at,
      person:person_id (
        id,
        first_name,
        last_name,
        full_name,
        email,
        phone_number,
        avatar_url
      ),
      group_role:group_role_id (
        id,
        name,
        description
      )
    `)
    .order('joined_at', { ascending: false })

  if (error) {
    logError('Error fetching people with group memberships: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch people with group memberships')
  }

  // Group by person
  const peopleMap = new Map<string, PersonWithMemberships>()

  for (const membership of (data || [])) {
    const personId = membership.person_id
    // Supabase returns relations as arrays, get first element
    const personData = Array.isArray(membership.person) ? membership.person[0] : membership.person
    const groupRoleData = Array.isArray(membership.group_role) ? membership.group_role[0] : membership.group_role

    if (!personData) continue

    if (!peopleMap.has(personId)) {
      peopleMap.set(personId, {
        person: personData as PersonWithMemberships['person'],
        memberships: []
      })
    }
    peopleMap.get(personId)!.memberships.push({
      id: membership.id,
      group_id: membership.group_id,
      group_role_id: membership.group_role_id,
      joined_at: membership.joined_at,
      group_role: groupRoleData as PersonWithMemberships['memberships'][0]['group_role']
    })
  }

  let result = Array.from(peopleMap.values())

  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    result = result.filter(({ person }) => {
      const fullName = person.full_name?.toLowerCase() || ''
      const email = person.email?.toLowerCase() || ''
      return fullName.includes(searchLower) || email.includes(searchLower)
    })
  }

  // Apply sorting
  if (filters.sort) {
    switch (filters.sort) {
      case 'name_asc':
        result.sort((a, b) => (a.person.full_name || '').localeCompare(b.person.full_name || ''))
        break
      case 'name_desc':
        result.sort((a, b) => (b.person.full_name || '').localeCompare(a.person.full_name || ''))
        break
      case 'groups_asc':
        result.sort((a, b) => a.memberships.length - b.memberships.length)
        break
      case 'groups_desc':
        result.sort((a, b) => b.memberships.length - a.memberships.length)
        break
      case 'created_asc':
        result.sort((a, b) => {
          const aDate = a.memberships[0]?.joined_at || ''
          const bDate = b.memberships[0]?.joined_at || ''
          return aDate.localeCompare(bDate)
        })
        break
      case 'created_desc':
        result.sort((a, b) => {
          const aDate = a.memberships[0]?.joined_at || ''
          const bDate = b.memberships[0]?.joined_at || ''
          return bDate.localeCompare(aDate)
        })
        break
    }
  }

  return result
}

export async function getPersonGroupMemberships(personId: string): Promise<PersonGroupMembership[]> {
  await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('group_members')
    .select(`
      id,
      group_id,
      person_id,
      group_role_id,
      joined_at,
      group:group_id (
        id,
        name,
        description,
        is_active
      ),
      group_role:group_role_id (
        id,
        name,
        description
      )
    `)
    .eq('person_id', personId)
    .order('joined_at', { ascending: false })

  if (error) {
    logError('Error fetching person group memberships: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
    throw new Error('Failed to fetch person group memberships')
  }

  // Transform the data to match the expected type
  const memberships: PersonGroupMembership[] = (data || []).map((item: any) => ({
    id: item.id,
    group_id: item.group_id,
    person_id: item.person_id,
    group_role_id: item.group_role_id,
    joined_at: item.joined_at,
    group: Array.isArray(item.group) ? item.group[0] : item.group,
    group_role: item.group_role_id && item.group_role ? (Array.isArray(item.group_role) ? item.group_role[0] : item.group_role) : undefined
  }))

  return memberships
}