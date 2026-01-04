/**
 * Groups Tools
 *
 * Tools for managing groups/ministries and membership.
 * Used by: Staff Chat, Parishioner Chat, MCP Server
 */

import type { UnifiedToolDefinition } from '../types.js'
import { getSupabaseClient, setMCPAuditContext } from '../db.js'

// ============================================================================
// READ TOOLS
// ============================================================================

const listGroups: UnifiedToolDefinition = {
  name: 'list_groups',
  description: 'Search and list groups/ministries in the parish.',
  inputSchema: {
    type: 'object',
    properties: {
      search: {
        type: 'string',
        description: 'Search term to filter by group name',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results (default: 20, max: 100)',
      },
      offset: {
        type: 'number',
        description: 'Number of results to skip for pagination',
      },
    },
  },
  requiredScope: 'read',
  allowedConsumers: ['staff', 'parishioner', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    const limit = Math.min((args.limit as number) || 20, 100)
    const offset = (args.offset as number) || 0

    let query = supabase
      .from('groups')
      .select('id, name, description, created_at', { count: 'exact' })
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .order('name')
      .range(offset, offset + limit - 1)

    if (args.search) {
      query = query.ilike('name', `%${args.search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      return { success: false, error: `Failed to fetch groups: ${error.message}` }
    }

    return {
      success: true,
      total_count: count || 0,
      count: data?.length || 0,
      offset,
      limit,
      data: data || [],
    }
  },
}

const getGroup: UnifiedToolDefinition = {
  name: 'get_group',
  description: 'Get detailed information about a group including all members.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The UUID of the group to retrieve',
      },
    },
    required: ['id'],
  },
  requiredScope: 'read',
  allowedConsumers: ['staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, name, description, created_at, updated_at')
      .eq('id', args.id as string)
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .single()

    if (groupError) {
      if (groupError.code === 'PGRST116') {
        return { success: false, error: 'Group not found' }
      }
      return { success: false, error: `Failed to fetch group: ${groupError.message}` }
    }

    // Get members with roles
    const { data: members, error: membersError } = await supabase
      .from('group_members')
      .select(`
        id,
        role:group_roles(id, name),
        person:people(id, first_name, last_name, full_name, email, phone_number)
      `)
      .eq('group_id', args.id as string)
      .is('deleted_at', null)

    if (membersError) {
      return { success: false, error: `Failed to fetch group members: ${membersError.message}` }
    }

    return {
      success: true,
      data: {
        ...group,
        members: members || [],
        member_count: members?.length || 0,
      },
    }
  },
}

const getPersonGroups: UnifiedToolDefinition = {
  name: 'get_person_groups',
  description: 'Get all groups/ministries a person belongs to.',
  inputSchema: {
    type: 'object',
    properties: {
      person_id: {
        type: 'string',
        description: 'The UUID of the person',
      },
    },
    required: ['person_id'],
  },
  requiredScope: 'read',
  allowedConsumers: ['staff', 'mcp'],
  async execute(args) {
    const supabase = getSupabaseClient()

    const { data: memberships, error } = await supabase
      .from('group_members')
      .select(`
        id,
        role:group_roles(id, name),
        group:groups(id, name, description)
      `)
      .eq('person_id', args.person_id as string)
      .is('deleted_at', null)

    if (error) {
      return { success: false, error: `Failed to fetch person's groups: ${error.message}` }
    }

    return {
      success: true,
      count: memberships?.length || 0,
      data: memberships || [],
    }
  },
}

// Parishioner: Get my groups
const getMyGroups: UnifiedToolDefinition = {
  name: 'get_my_groups',
  description: 'Get the groups/ministries you belong to.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  requiredScope: 'read',
  allowedConsumers: ['parishioner'],
  async execute(args, context) {
    if (!context.personId) {
      return { success: false, error: 'Person context required' }
    }

    const supabase = getSupabaseClient()

    const { data: memberships, error } = await supabase
      .from('group_members')
      .select(`
        id,
        role:group_roles(id, name),
        group:groups(id, name, description)
      `)
      .eq('person_id', context.personId)
      .is('deleted_at', null)

    if (error) {
      return { success: false, error: 'Could not retrieve your groups' }
    }

    if (!memberships || memberships.length === 0) {
      return {
        success: true,
        message: 'You are not currently a member of any groups',
        data: [],
      }
    }

    return {
      success: true,
      count: memberships.length,
      data: memberships,
    }
  },
}

// Parishioner: List available groups to join
const listAvailableGroups: UnifiedToolDefinition = {
  name: 'list_available_groups',
  description: 'List groups/ministries you can join.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  requiredScope: 'read',
  allowedConsumers: ['parishioner'],
  async execute(args, context) {
    if (!context.personId) {
      return { success: false, error: 'Person context required' }
    }

    const supabase = getSupabaseClient()

    // Get all groups
    const { data: allGroups, error: groupsError } = await supabase
      .from('groups')
      .select('id, name, description')
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .order('name')

    if (groupsError) {
      return { success: false, error: 'Could not retrieve available groups' }
    }

    // Get groups person is already in
    const { data: myMemberships } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('person_id', context.personId)
      .is('deleted_at', null)

    const myGroupIds = new Set((myMemberships || []).map((m) => m.group_id))

    // Filter to groups not already joined
    const availableGroups = (allGroups || []).filter((g) => !myGroupIds.has(g.id))

    return {
      success: true,
      count: availableGroups.length,
      data: availableGroups,
    }
  },
}

// ============================================================================
// WRITE TOOLS
// ============================================================================

const addToGroup: UnifiedToolDefinition = {
  name: 'add_to_group',
  description: 'Add a person to a group/ministry.',
  inputSchema: {
    type: 'object',
    properties: {
      group_id: {
        type: 'string',
        description: 'The UUID of the group',
      },
      person_id: {
        type: 'string',
        description: 'The UUID of the person to add',
      },
      role_id: {
        type: 'string',
        description: 'Optional UUID of the role to assign',
      },
    },
    required: ['group_id', 'person_id'],
  },
  requiredScope: 'write',
  allowedConsumers: ['staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    await setMCPAuditContext(context.userId!, context.userEmail || undefined)

    // Verify group exists
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, name')
      .eq('id', args.group_id as string)
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .single()

    if (groupError || !group) {
      return { success: false, error: 'Group not found' }
    }

    // Verify person exists
    const { data: person, error: personError } = await supabase
      .from('people')
      .select('id, full_name')
      .eq('id', args.person_id as string)
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .single()

    if (personError || !person) {
      return { success: false, error: 'Person not found' }
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', args.group_id as string)
      .eq('person_id', args.person_id as string)
      .is('deleted_at', null)
      .single()

    if (existing) {
      return { success: false, error: `${person.full_name} is already a member of ${group.name}` }
    }

    // Add member
    const insertData: Record<string, unknown> = {
      group_id: args.group_id,
      person_id: args.person_id,
      parish_id: context.parishId,
    }
    if (args.role_id) {
      insertData.role_id = args.role_id
    }

    const { error: insertError } = await supabase.from('group_members').insert(insertData)

    if (insertError) {
      return { success: false, error: `Failed to add to group: ${insertError.message}` }
    }

    return {
      success: true,
      message: `Added ${person.full_name} to ${group.name}`,
      data: { group_id: group.id, group_name: group.name, person_id: person.id },
    }
  },
}

const removeFromGroup: UnifiedToolDefinition = {
  name: 'remove_from_group',
  description: 'Remove a person from a group/ministry.',
  inputSchema: {
    type: 'object',
    properties: {
      group_id: {
        type: 'string',
        description: 'The UUID of the group',
      },
      person_id: {
        type: 'string',
        description: 'The UUID of the person to remove',
      },
    },
    required: ['group_id', 'person_id'],
  },
  requiredScope: 'write',
  allowedConsumers: ['staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    await setMCPAuditContext(context.userId!, context.userEmail || undefined)

    const { data: membership, error: membershipError } = await supabase
      .from('group_members')
      .select(`
        id,
        person:people(full_name),
        group:groups(name)
      `)
      .eq('group_id', args.group_id as string)
      .eq('person_id', args.person_id as string)
      .is('deleted_at', null)
      .single()

    if (membershipError || !membership) {
      return { success: false, error: 'Group membership not found' }
    }

    const { error: deleteError } = await supabase
      .from('group_members')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', membership.id)

    if (deleteError) {
      return { success: false, error: `Failed to remove from group: ${deleteError.message}` }
    }

    const personName = (membership.person as { full_name: string })?.full_name || 'Person'
    const groupName = (membership.group as { name: string })?.name || 'group'

    return {
      success: true,
      message: `Removed ${personName} from ${groupName}`,
      data: { group_id: args.group_id, person_id: args.person_id },
    }
  },
}

const updateGroupMemberRole: UnifiedToolDefinition = {
  name: 'update_group_member_role',
  description: "Update a group member's role.",
  inputSchema: {
    type: 'object',
    properties: {
      group_id: {
        type: 'string',
        description: 'The UUID of the group',
      },
      person_id: {
        type: 'string',
        description: 'The UUID of the person',
      },
      role_id: {
        type: 'string',
        description: 'The UUID of the new role (or null to remove role)',
      },
    },
    required: ['group_id', 'person_id'],
  },
  requiredScope: 'write',
  allowedConsumers: ['staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    await setMCPAuditContext(context.userId!, context.userEmail || undefined)

    const { data: membership, error: membershipError } = await supabase
      .from('group_members')
      .select('id, person:people(full_name)')
      .eq('group_id', args.group_id as string)
      .eq('person_id', args.person_id as string)
      .is('deleted_at', null)
      .single()

    if (membershipError || !membership) {
      return { success: false, error: 'Group membership not found' }
    }

    const { error: updateError } = await supabase
      .from('group_members')
      .update({ role_id: (args.role_id as string) || null })
      .eq('id', membership.id)

    if (updateError) {
      return { success: false, error: `Failed to update role: ${updateError.message}` }
    }

    const personName = (membership.person as { full_name: string })?.full_name || 'Member'

    return {
      success: true,
      message: `Updated role for ${personName}`,
      data: { group_id: args.group_id, person_id: args.person_id, role_id: args.role_id },
    }
  },
}

// Parishioner: Join a group
const joinGroup: UnifiedToolDefinition = {
  name: 'join_group',
  description: 'Join a group/ministry.',
  inputSchema: {
    type: 'object',
    properties: {
      group_id: {
        type: 'string',
        description: 'The UUID of the group to join',
      },
    },
    required: ['group_id'],
  },
  requiredScope: 'write_self',
  allowedConsumers: ['parishioner'],
  async execute(args, context) {
    if (!context.personId) {
      return { success: false, error: 'Person context required' }
    }

    const supabase = getSupabaseClient()
    await setMCPAuditContext(context.personId, context.userEmail || undefined)

    // Verify group exists
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .select('id, name')
      .eq('id', args.group_id as string)
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .single()

    if (groupError || !group) {
      return { success: false, error: 'Group not found' }
    }

    // Check if already a member
    const { data: existing } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', args.group_id as string)
      .eq('person_id', context.personId)
      .is('deleted_at', null)
      .single()

    if (existing) {
      return { success: false, error: `You are already a member of ${group.name}` }
    }

    // Join
    const { error: insertError } = await supabase.from('group_members').insert({
      group_id: args.group_id,
      person_id: context.personId,
      parish_id: context.parishId,
    })

    if (insertError) {
      return { success: false, error: `Failed to join group: ${insertError.message}` }
    }

    return {
      success: true,
      message: `You have joined ${group.name}`,
      data: { group_id: group.id, group_name: group.name },
    }
  },
}

// Parishioner: Leave a group
const leaveGroup: UnifiedToolDefinition = {
  name: 'leave_group',
  description: 'Leave a group/ministry.',
  inputSchema: {
    type: 'object',
    properties: {
      group_id: {
        type: 'string',
        description: 'The UUID of the group to leave',
      },
    },
    required: ['group_id'],
  },
  requiredScope: 'write_self',
  allowedConsumers: ['parishioner'],
  async execute(args, context) {
    if (!context.personId) {
      return { success: false, error: 'Person context required' }
    }

    const supabase = getSupabaseClient()
    await setMCPAuditContext(context.personId, context.userEmail || undefined)

    const { data: membership, error: membershipError } = await supabase
      .from('group_members')
      .select('id, group:groups(name)')
      .eq('group_id', args.group_id as string)
      .eq('person_id', context.personId)
      .is('deleted_at', null)
      .single()

    if (membershipError || !membership) {
      return { success: false, error: 'You are not a member of this group' }
    }

    const { error: deleteError } = await supabase
      .from('group_members')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', membership.id)

    if (deleteError) {
      return { success: false, error: `Failed to leave group: ${deleteError.message}` }
    }

    const groupName = (membership.group as { name: string })?.name || 'the group'

    return {
      success: true,
      message: `You have left ${groupName}`,
      data: { group_id: args.group_id },
    }
  },
}

// ============================================================================
// EXPORTS
// ============================================================================

export const groupsTools: UnifiedToolDefinition[] = [
  // Read tools
  listGroups,
  getGroup,
  getPersonGroups,
  getMyGroups,
  listAvailableGroups,
  // Write tools
  addToGroup,
  removeFromGroup,
  updateGroupMemberRole,
  joinGroup,
  leaveGroup,
]
