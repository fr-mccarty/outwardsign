/**
 * Developer Tools
 *
 * Special tools only available to developers (fr.mccarty@gmail.com).
 * These tools are used for demo management and development purposes.
 */

import type { UnifiedToolDefinition } from '../types.js'
import { getSupabaseClient, setMCPAuditContext } from '../db.js'

// Developer email addresses that have access to developer features
const DEVELOPER_EMAILS = ['fr.mccarty@gmail.com'] as const

// The demo parish ID used for developer testing and demos
const DEMO_PARISH_ID = '00000000-0000-0000-0000-000000000001'

/**
 * Check if an email address belongs to a developer
 */
function isDeveloperEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return DEVELOPER_EMAILS.includes(email.toLowerCase() as typeof DEVELOPER_EMAILS[number])
}

// ============================================================================
// DEVELOPER-ONLY TOOLS
// ============================================================================

const inviteToDemoParish: UnifiedToolDefinition = {
  name: 'invite_to_demo_parish',
  description:
    'Invite a user to the demo parish. Developer only. Creates an invitation with admin access that expires in 7 days.',
  inputSchema: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        description: 'Email address of the person to invite',
      },
      roles: {
        type: 'array',
        items: { type: 'string' },
        description:
          'Roles to assign (admin, staff, ministry-leader, parishioner). Default: admin',
      },
    },
    required: ['email'],
  },
  requiredScope: 'write',
  allowedConsumers: ['mcp'],
  async execute(args, context) {
    // Check if the caller is a developer
    if (!isDeveloperEmail(context.userEmail)) {
      return {
        success: false,
        error: 'This tool is only available to developers',
      }
    }

    const supabase = getSupabaseClient()

    // Set audit context
    await setMCPAuditContext(context.userId!, context.userEmail || undefined)

    const email = (args.email as string).toLowerCase()
    const roles = (args.roles as string[]) || ['admin']

    // Validate roles
    const validRoles = ['admin', 'staff', 'ministry-leader', 'parishioner']
    const invalidRoles = roles.filter((r) => !validRoles.includes(r))
    if (invalidRoles.length > 0) {
      return {
        success: false,
        error: `Invalid roles: ${invalidRoles.join(', ')}. Valid roles are: ${validRoles.join(', ')}`,
      }
    }

    // Check if user already has access to demo parish
    const { data: existingAccess } = await supabase
      .from('parish_users')
      .select('id, roles')
      .eq('parish_id', DEMO_PARISH_ID)
      .eq('user_id', context.userId)
      .single()

    if (existingAccess) {
      return {
        success: false,
        error: `User with this email already has access to the demo parish with roles: ${existingAccess.roles.join(', ')}`,
      }
    }

    // Check if there's already a pending invitation
    const { data: existingInvitation } = await supabase
      .from('parish_invitations')
      .select('id, expires_at')
      .eq('parish_id', DEMO_PARISH_ID)
      .eq('email', email)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (existingInvitation) {
      return {
        success: false,
        error: 'There is already a pending invitation for this email address',
      }
    }

    // Generate unique token
    const token = crypto.randomUUID()

    // Set expiration to 7 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Create the invitation
    const { data: invitation, error } = await supabase
      .from('parish_invitations')
      .insert({
        parish_id: DEMO_PARISH_ID,
        email,
        token,
        roles,
        enabled_modules: [],
        expires_at: expiresAt.toISOString(),
        invited_by_user_id: context.userId,
      })
      .select('id, email, roles, token, expires_at')
      .single()

    if (error) {
      return {
        success: false,
        error: `Failed to create invitation: ${error.message}`,
      }
    }

    // Build the invitation link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://outwardsign.church'
    const invitationLink = `${appUrl}/accept-invitation?token=${token}`

    return {
      success: true,
      message: `Invitation sent to ${email} with roles: ${roles.join(', ')}`,
      data: {
        id: invitation.id,
        email: invitation.email,
        roles: invitation.roles,
        expires_at: invitation.expires_at,
        invitation_link: invitationLink,
      },
    }
  },
}

const listDemoParishInvitations: UnifiedToolDefinition = {
  name: 'list_demo_parish_invitations',
  description:
    'List all pending invitations for the demo parish. Developer only.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  requiredScope: 'read',
  allowedConsumers: ['mcp'],
  async execute(args, context) {
    // Check if the caller is a developer
    if (!isDeveloperEmail(context.userEmail)) {
      return {
        success: false,
        error: 'This tool is only available to developers',
      }
    }

    const supabase = getSupabaseClient()

    const { data: invitations, error } = await supabase
      .from('parish_invitations')
      .select('id, email, roles, created_at, expires_at, accepted_at')
      .eq('parish_id', DEMO_PARISH_ID)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return {
        success: false,
        error: `Failed to fetch invitations: ${error.message}`,
      }
    }

    const pending = invitations.filter(
      (i) => !i.accepted_at && new Date(i.expires_at) > new Date()
    )
    const accepted = invitations.filter((i) => !!i.accepted_at)
    const expired = invitations.filter(
      (i) => !i.accepted_at && new Date(i.expires_at) <= new Date()
    )

    return {
      success: true,
      data: {
        pending,
        accepted,
        expired,
      },
      count: invitations.length,
    }
  },
}

const revokeDemoParishInvitation: UnifiedToolDefinition = {
  name: 'revoke_demo_parish_invitation',
  description:
    'Revoke a pending invitation for the demo parish. Developer only.',
  inputSchema: {
    type: 'object',
    properties: {
      invitation_id: {
        type: 'string',
        description: 'The UUID of the invitation to revoke',
      },
    },
    required: ['invitation_id'],
  },
  requiredScope: 'delete',
  allowedConsumers: ['mcp'],
  async execute(args, context) {
    // Check if the caller is a developer
    if (!isDeveloperEmail(context.userEmail)) {
      return {
        success: false,
        error: 'This tool is only available to developers',
      }
    }

    const supabase = getSupabaseClient()

    // Set audit context
    await setMCPAuditContext(context.userId!, context.userEmail || undefined)

    const invitationId = args.invitation_id as string

    // Get the invitation first
    const { data: invitation, error: fetchError } = await supabase
      .from('parish_invitations')
      .select('id, email')
      .eq('id', invitationId)
      .eq('parish_id', DEMO_PARISH_ID)
      .is('accepted_at', null)
      .single()

    if (fetchError || !invitation) {
      return {
        success: false,
        error: 'Invitation not found or already accepted',
      }
    }

    // Delete the invitation
    const { error } = await supabase
      .from('parish_invitations')
      .delete()
      .eq('id', invitationId)
      .eq('parish_id', DEMO_PARISH_ID)

    if (error) {
      return {
        success: false,
        error: `Failed to revoke invitation: ${error.message}`,
      }
    }

    return {
      success: true,
      message: `Revoked invitation for ${invitation.email}`,
    }
  },
}

// ============================================================================
// EXPORTS
// ============================================================================

export const developerTools: UnifiedToolDefinition[] = [
  inviteToDemoParish,
  listDemoParishInvitations,
  revokeDemoParishInvitation,
]
