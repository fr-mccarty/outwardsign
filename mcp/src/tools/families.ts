/**
 * Families Tools
 *
 * Tools for managing families and family membership.
 * Used by: Staff Chat, Parishioner Chat (limited), MCP Server
 */

import type { UnifiedToolDefinition } from '../types.js'
import { getSupabaseClient, setMCPAuditContext } from '../db.js'

// ============================================================================
// READ TOOLS
// ============================================================================

const listFamilies: UnifiedToolDefinition = {
  name: 'list_families',
  description:
    'Search and list families in the parish. Returns family name and member count.',
  inputSchema: {
    type: 'object',
    properties: {
      search: {
        type: 'string',
        description: 'Search term to filter by family name',
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
  allowedConsumers: ['staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    const limit = Math.min((args.limit as number) || 20, 100)
    const offset = (args.offset as number) || 0

    let query = supabase
      .from('families')
      .select('id, family_name, active, created_at', { count: 'exact' })
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .order('family_name')
      .range(offset, offset + limit - 1)

    if (args.search) {
      query = query.ilike('family_name', `%${args.search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      return { success: false, error: `Failed to fetch families: ${error.message}` }
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

const getFamily: UnifiedToolDefinition = {
  name: 'get_family',
  description: 'Get detailed information about a family including all members.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The UUID of the family to retrieve',
      },
    },
    required: ['id'],
  },
  requiredScope: 'read',
  allowedConsumers: ['staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    // Get family with members
    const { data: family, error: familyError } = await supabase
      .from('families')
      .select('id, family_name, active, created_at, updated_at')
      .eq('id', args.id as string)
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .single()

    if (familyError) {
      if (familyError.code === 'PGRST116') {
        return { success: false, error: 'Family not found' }
      }
      return { success: false, error: `Failed to fetch family: ${familyError.message}` }
    }

    // Get members
    const { data: members, error: membersError } = await supabase
      .from('family_members')
      .select(`
        id,
        is_primary_contact,
        relationship,
        person:people(id, first_name, last_name, full_name, email, phone_number)
      `)
      .eq('family_id', args.id as string)
      .is('deleted_at', null)

    if (membersError) {
      return { success: false, error: `Failed to fetch family members: ${membersError.message}` }
    }

    return {
      success: true,
      data: {
        ...family,
        members: members || [],
        member_count: members?.length || 0,
      },
    }
  },
}

// Parishioner: Get my family
const getMyFamily: UnifiedToolDefinition = {
  name: 'get_my_family',
  description: 'Get information about your family and family members.',
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

    // Find families this person belongs to
    const { data: memberships, error: membershipError } = await supabase
      .from('family_members')
      .select(`
        family:families(id, family_name, active)
      `)
      .eq('person_id', context.personId)
      .is('deleted_at', null)

    if (membershipError) {
      return { success: false, error: 'Could not retrieve your family information' }
    }

    if (!memberships || memberships.length === 0) {
      return {
        success: true,
        message: 'You are not currently assigned to any family',
        data: { families: [] },
      }
    }

    // Get full details for each family
    const families = []
    for (const membership of memberships) {
      if (!membership.family) continue

      const { data: members } = await supabase
        .from('family_members')
        .select(`
          relationship,
          is_primary_contact,
          person:people(id, first_name, last_name, full_name)
        `)
        .eq('family_id', (membership.family as { id: string }).id)
        .is('deleted_at', null)

      families.push({
        ...(membership.family as object),
        members: members || [],
      })
    }

    return {
      success: true,
      data: { families },
    }
  },
}

// ============================================================================
// WRITE TOOLS
// ============================================================================

const createFamily: UnifiedToolDefinition = {
  name: 'create_family',
  description: 'Create a new family. Optionally add initial members.',
  inputSchema: {
    type: 'object',
    properties: {
      family_name: {
        type: 'string',
        description: 'The family name (e.g., "Smith Family")',
      },
      member_ids: {
        type: 'array',
        items: { type: 'string' },
        description: 'Optional array of person IDs to add as initial members',
      },
    },
    required: ['family_name'],
  },
  requiredScope: 'write',
  allowedConsumers: ['staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    await setMCPAuditContext(context.userId!, context.userEmail || undefined)

    // Create family
    const { data: family, error: familyError } = await supabase
      .from('families')
      .insert({
        parish_id: context.parishId,
        family_name: args.family_name as string,
        active: true,
      })
      .select('id, family_name')
      .single()

    if (familyError) {
      return { success: false, error: `Failed to create family: ${familyError.message}` }
    }

    // Add initial members if provided
    const memberIds = args.member_ids as string[] | undefined
    if (memberIds && memberIds.length > 0) {
      const memberInserts = memberIds.map((personId, index) => ({
        family_id: family.id,
        person_id: personId,
        parish_id: context.parishId,
        is_primary_contact: index === 0, // First member is primary
      }))

      const { error: membersError } = await supabase
        .from('family_members')
        .insert(memberInserts)

      if (membersError) {
        // Family created but members failed - still return success with warning
        return {
          success: true,
          message: `Created family "${family.family_name}" but failed to add some members`,
          data: family,
        }
      }
    }

    return {
      success: true,
      message: `Created family: ${family.family_name}`,
      data: family,
    }
  },
}

const addFamilyMember: UnifiedToolDefinition = {
  name: 'add_family_member',
  description: 'Add a person to a family.',
  inputSchema: {
    type: 'object',
    properties: {
      family_id: {
        type: 'string',
        description: 'The UUID of the family',
      },
      person_id: {
        type: 'string',
        description: 'The UUID of the person to add',
      },
      relationship: {
        type: 'string',
        description: 'Relationship to family head (e.g., "spouse", "child", "parent")',
      },
      is_primary_contact: {
        type: 'boolean',
        description: 'Whether this person is the primary contact for the family',
      },
    },
    required: ['family_id', 'person_id'],
  },
  requiredScope: 'write',
  allowedConsumers: ['staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    await setMCPAuditContext(context.userId!, context.userEmail || undefined)

    // Verify family exists
    const { data: family, error: familyError } = await supabase
      .from('families')
      .select('id, family_name')
      .eq('id', args.family_id as string)
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .single()

    if (familyError || !family) {
      return { success: false, error: 'Family not found' }
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
      .from('family_members')
      .select('id')
      .eq('family_id', args.family_id as string)
      .eq('person_id', args.person_id as string)
      .is('deleted_at', null)
      .single()

    if (existing) {
      return { success: false, error: `${person.full_name} is already a member of this family` }
    }

    // Add member
    const { error: insertError } = await supabase
      .from('family_members')
      .insert({
        family_id: args.family_id as string,
        person_id: args.person_id as string,
        parish_id: context.parishId,
        relationship: (args.relationship as string) || null,
        is_primary_contact: (args.is_primary_contact as boolean) || false,
      })

    if (insertError) {
      return { success: false, error: `Failed to add family member: ${insertError.message}` }
    }

    return {
      success: true,
      message: `Added ${person.full_name} to ${family.family_name}`,
      data: { family_id: family.id, person_id: person.id, person_name: person.full_name },
    }
  },
}

const removeFamilyMember: UnifiedToolDefinition = {
  name: 'remove_family_member',
  description: 'Remove a person from a family.',
  inputSchema: {
    type: 'object',
    properties: {
      family_id: {
        type: 'string',
        description: 'The UUID of the family',
      },
      person_id: {
        type: 'string',
        description: 'The UUID of the person to remove',
      },
    },
    required: ['family_id', 'person_id'],
  },
  requiredScope: 'write',
  allowedConsumers: ['staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    await setMCPAuditContext(context.userId!, context.userEmail || undefined)

    // Get the membership record with person name
    const { data: membership, error: membershipError } = await supabase
      .from('family_members')
      .select(`
        id,
        person:people(full_name),
        family:families(family_name)
      `)
      .eq('family_id', args.family_id as string)
      .eq('person_id', args.person_id as string)
      .is('deleted_at', null)
      .single()

    if (membershipError || !membership) {
      return { success: false, error: 'Family membership not found' }
    }

    // Soft delete
    const { error: deleteError } = await supabase
      .from('family_members')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', membership.id)

    if (deleteError) {
      return { success: false, error: `Failed to remove family member: ${deleteError.message}` }
    }

    const personName = (membership.person as { full_name: string })?.full_name || 'Person'
    const familyName = (membership.family as { family_name: string })?.family_name || 'family'

    return {
      success: true,
      message: `Removed ${personName} from ${familyName}`,
      data: { family_id: args.family_id, person_id: args.person_id },
    }
  },
}

const setFamilyPrimaryContact: UnifiedToolDefinition = {
  name: 'set_family_primary_contact',
  description: 'Set a family member as the primary contact for the family.',
  inputSchema: {
    type: 'object',
    properties: {
      family_id: {
        type: 'string',
        description: 'The UUID of the family',
      },
      person_id: {
        type: 'string',
        description: 'The UUID of the person to set as primary contact',
      },
    },
    required: ['family_id', 'person_id'],
  },
  requiredScope: 'write',
  allowedConsumers: ['staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()
    await setMCPAuditContext(context.userId!, context.userEmail || undefined)

    // Verify the person is a member of this family
    const { data: membership, error: membershipError } = await supabase
      .from('family_members')
      .select('id, person:people(full_name)')
      .eq('family_id', args.family_id as string)
      .eq('person_id', args.person_id as string)
      .is('deleted_at', null)
      .single()

    if (membershipError || !membership) {
      return { success: false, error: 'Person is not a member of this family' }
    }

    // Clear existing primary contact
    await supabase
      .from('family_members')
      .update({ is_primary_contact: false })
      .eq('family_id', args.family_id as string)
      .is('deleted_at', null)

    // Set new primary contact
    const { error: updateError } = await supabase
      .from('family_members')
      .update({ is_primary_contact: true })
      .eq('id', membership.id)

    if (updateError) {
      return { success: false, error: `Failed to set primary contact: ${updateError.message}` }
    }

    const personName = (membership.person as { full_name: string })?.full_name || 'Person'

    return {
      success: true,
      message: `Set ${personName} as the primary contact`,
      data: { family_id: args.family_id, person_id: args.person_id },
    }
  },
}

// ============================================================================
// DELETE TOOLS
// ============================================================================

const deleteFamily: UnifiedToolDefinition = {
  name: 'delete_family',
  description: 'Soft-delete a family. This action requires confirmation.',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'The UUID of the family to delete',
      },
      confirmed: {
        type: 'boolean',
        description: 'Set to true to confirm deletion',
      },
    },
    required: ['id'],
  },
  requiredScope: 'delete',
  allowedConsumers: ['staff', 'mcp'],
  async execute(args, context) {
    const supabase = getSupabaseClient()

    // Get family details
    const { data: family, error: fetchError } = await supabase
      .from('families')
      .select('id, family_name')
      .eq('id', args.id as string)
      .eq('parish_id', context.parishId)
      .is('deleted_at', null)
      .single()

    if (fetchError || !family) {
      return { success: false, error: 'Family not found' }
    }

    // Require confirmation
    if (!args.confirmed) {
      return {
        success: true,
        requires_confirmation: true,
        action: 'delete_family',
        target: {
          type: 'family',
          id: family.id,
          name: family.family_name,
        },
        message: `Are you sure you want to delete ${family.family_name}? This will remove all family member associations.`,
      }
    }

    await setMCPAuditContext(context.userId!, context.userEmail || undefined)

    // Soft delete family (cascade will handle members via trigger or we do it manually)
    const { error: deleteError } = await supabase
      .from('families')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', args.id as string)

    if (deleteError) {
      return { success: false, error: `Failed to delete family: ${deleteError.message}` }
    }

    // Also soft-delete all family members
    await supabase
      .from('family_members')
      .update({ deleted_at: new Date().toISOString() })
      .eq('family_id', args.id as string)
      .is('deleted_at', null)

    return {
      success: true,
      message: `Deleted family: ${family.family_name}`,
      data: { id: family.id, name: family.family_name },
    }
  },
}

// ============================================================================
// EXPORTS
// ============================================================================

export const familiesTools: UnifiedToolDefinition[] = [
  // Read tools
  listFamilies,
  getFamily,
  getMyFamily,
  // Write tools
  createFamily,
  addFamilyMember,
  removeFamilyMember,
  setFamilyPrimaryContact,
  // Delete tools
  deleteFamily,
]
