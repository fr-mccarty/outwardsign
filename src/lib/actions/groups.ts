'use server'

import {
  createGroupSchema,
  updateGroupSchema,
  type CreateGroupData,
  type UpdateGroupData
} from '@/lib/schemas/groups'
import {
  createAuthenticatedClient,
  handleSupabaseError,
  isNotFoundError,
  isUniqueConstraintError,
  revalidateEntity,
  buildUpdateData,
} from '@/lib/actions/server-action-utils'

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
    full_name: string
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
  const { supabase } = await createAuthenticatedClient()

  const { count: totalCount, error: totalError } = await supabase
    .from('groups')
    .select('*', { count: 'exact', head: true })

  if (totalError) handleSupabaseError(totalError, 'fetching', 'total count')

  const { data: allGroups, error: allError } = await supabase
    .from('groups')
    .select('*')

  if (allError) handleSupabaseError(allError, 'fetching', 'groups for filtering')

  let filteredGroups = allGroups || []

  if (filters.status && filters.status !== 'all') {
    const isActive = filters.status === 'ACTIVE'
    filteredGroups = filteredGroups.filter(group => group.is_active === isActive)
  }

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
  const { supabase } = await createAuthenticatedClient()

  const { data, error } = await supabase
    .from('groups')
    .select('*')

  if (error) handleSupabaseError(error, 'fetching', 'groups')

  let groups = data || []

  if (filters.status && filters.status !== 'all') {
    const isActive = filters.status === 'ACTIVE'
    groups = groups.filter(group => group.is_active === isActive)
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    groups = groups.filter(group =>
      group.name.toLowerCase().includes(searchLower) ||
      (group.description && group.description.toLowerCase().includes(searchLower))
    )
  }

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

  if (filters.offset !== undefined && filters.limit !== undefined) {
    const start = filters.offset
    const end = start + filters.limit
    groups = groups.slice(start, end)
  }

  return groups
}

export async function getGroup(id: string): Promise<GroupWithMembers | null> {
  const { supabase } = await createAuthenticatedClient()

  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .eq('id', id)
    .single()

  if (groupError) {
    if (isNotFoundError(groupError)) return null
    handleSupabaseError(groupError, 'fetching', 'group')
  }

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

  if (membersError) handleSupabaseError(membersError, 'fetching', 'group members')

  return {
    ...group,
    members: members || []
  }
}

export async function createGroup(data: CreateGroupData): Promise<Group> {
  const { supabase, parishId } = await createAuthenticatedClient()

  const validatedData = createGroupSchema.parse(data)

  const { data: group, error } = await supabase
    .from('groups')
    .insert([
      {
        parish_id: parishId,
        name: validatedData.name,
        description: validatedData.description || null,
        is_active: validatedData.is_active ?? true,
      }
    ])
    .select()
    .single()

  if (error) handleSupabaseError(error, 'creating', 'group')

  revalidateEntity('groups')
  return group
}

export async function updateGroup(id: string, data: UpdateGroupData): Promise<Group> {
  const { supabase } = await createAuthenticatedClient()

  const validatedData = updateGroupSchema.parse(data)
  const updateData = buildUpdateData(validatedData)

  const { data: group, error } = await supabase
    .from('groups')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) handleSupabaseError(error, 'updating', 'group')

  revalidateEntity('groups', id)
  return group
}

export async function deleteGroup(id: string): Promise<void> {
  const { supabase } = await createAuthenticatedClient()

  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', id)

  if (error) handleSupabaseError(error, 'deleting', 'group')

  revalidateEntity('groups')
}

export async function addGroupMember(groupId: string, personId: string, groupRoleId?: string): Promise<GroupMember> {
  const { supabase } = await createAuthenticatedClient()

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
    if (isUniqueConstraintError(error)) {
      throw new Error('Person is already a member of this group')
    }
    handleSupabaseError(error, 'adding', 'group member')
  }

  revalidateEntity('groups', groupId)
  return member
}

export async function removeGroupMember(groupId: string, personId: string): Promise<void> {
  const { supabase } = await createAuthenticatedClient()

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

  if (error) handleSupabaseError(error, 'removing', 'group member')

  revalidateEntity('groups', groupId)
}

export async function updateGroupMemberRole(groupId: string, personId: string, groupRoleId?: string | null): Promise<GroupMember> {
  const { supabase } = await createAuthenticatedClient()

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

  if (error) handleSupabaseError(error, 'updating', 'group member role')

  revalidateEntity('groups', groupId)
  return member
}

export async function getActiveGroups(): Promise<Group[]> {
  const { supabase } = await createAuthenticatedClient()

  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) handleSupabaseError(error, 'fetching', 'active groups')

  return data || []
}

// ========== GROUP MEMBER DIRECTORY FUNCTIONS ==========

export interface GroupMemberWithDetails extends GroupMember {
  person: {
    id: string
    first_name: string
    last_name: string
    full_name: string
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
  const { supabase } = await createAuthenticatedClient()

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

  if (error) handleSupabaseError(error, 'fetching', 'people with group memberships')

  const peopleMap = new Map<string, PersonWithMemberships>()

  for (const membership of (data || [])) {
    const personId = membership.person_id
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

  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    result = result.filter(({ person }) => {
      const fullName = person.full_name?.toLowerCase() || ''
      const email = person.email?.toLowerCase() || ''
      return fullName.includes(searchLower) || email.includes(searchLower)
    })
  }

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
  const { supabase } = await createAuthenticatedClient()

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

  if (error) handleSupabaseError(error, 'fetching', 'person group memberships')

  const memberships: PersonGroupMembership[] = (data || []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    group_id: item.group_id as string,
    person_id: item.person_id as string,
    group_role_id: item.group_role_id as string | null | undefined,
    joined_at: item.joined_at as string,
    group: (Array.isArray(item.group) ? item.group[0] : item.group) as PersonGroupMembership['group'],
    group_role: item.group_role_id && item.group_role ? (Array.isArray(item.group_role) ? item.group_role[0] : item.group_role) as PersonGroupMembership['group_role'] : null
  }))

  return memberships
}

/**
 * Get people who are members of specified groups
 * Used for group-based PersonPicker filtering
 */
export interface PersonBasic {
  id: string
  first_name: string
  last_name: string
  full_name: string
  email?: string | null
  phone_number?: string | null
  avatar_url?: string | null
}

export async function getPeopleByGroupIds(groupIds: string[]): Promise<PersonBasic[]> {
  const { supabase } = await createAuthenticatedClient()

  if (!groupIds || groupIds.length === 0) {
    return []
  }

  // Fetch people who are members of ANY of the specified groups
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      person_id,
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
    .in('group_id', groupIds)

  if (error) handleSupabaseError(error, 'fetching', 'people by group IDs')

  // Deduplicate people (in case they're in multiple groups)
  const peopleMap = new Map<string, PersonBasic>()

  for (const membership of (data || [])) {
    const personData = Array.isArray(membership.person) ? membership.person[0] : membership.person
    if (personData && !peopleMap.has(personData.id)) {
      peopleMap.set(personData.id, personData as PersonBasic)
    }
  }

  // Return sorted by full_name
  return Array.from(peopleMap.values()).sort((a, b) =>
    (a.full_name || '').localeCompare(b.full_name || '')
  )
}
