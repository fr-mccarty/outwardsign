'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { revalidatePath } from 'next/cache'
import { sendParishInvitationEmail } from '@/lib/email/ses-client'
import { logInfo, logError } from '@/lib/utils/console'
import type { UserParishRoleType } from '@/lib/constants'

export interface ParishInvitation {
  id: string
  parish_id: string
  email: string
  token: string
  roles: string[]
  enabled_modules: string[]
  expires_at: string
  accepted_at: string | null
  invited_by_user_id: string
  created_at: string
}

export interface CreateParishInvitationData {
  email: string
  roles: UserParishRoleType[]
  enabled_modules?: string[] // Only used for ministry-leader role
}

export interface ParishInvitationWithDetails extends ParishInvitation {
  parish?: {
    id: string
    name: string
    city: string
    state: string
  } | null
  invited_by?: {
    id: string
    email: string | null
  } | null
}

/**
 * Get all pending invitations for the current parish
 */
export async function getParishInvitations(): Promise<ParishInvitation[]> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: invitations, error } = await supabase
    .from('parish_invitations')
    .select('*')
    .eq('parish_id', selectedParishId)
    .is('accepted_at', null) // Only pending invitations
    .order('created_at', { ascending: false })

  if (error) {
    logError('Error fetching parish invitations:', error)
    throw new Error('Failed to fetch parish invitations')
  }

  return invitations
}

/**
 * Get invitation details by token (public - used for invitation acceptance)
 */
export async function getInvitationByToken(token: string): Promise<ParishInvitationWithDetails | null> {
  const supabase = await createClient()

  const { data: invitation, error } = await supabase
    .from('parish_invitations')
    .select(`
      *,
      parish:parishes(id, name, city, state)
    `)
    .eq('token', token)
    .is('accepted_at', null) // Only pending invitations
    .single()

  if (error) {
    logError('Error fetching invitation by token:', error)
    return null
  }

  // Check if invitation is expired
  if (new Date(invitation.expires_at) < new Date()) {
    return null
  }

  // Fetch inviter user data separately from auth.users
  const { data: inviterData } = await supabase.auth.admin.getUserById(invitation.invited_by_user_id)

  const invitedByUser = inviterData?.user ? {
    id: inviterData.user.id,
    email: inviterData.user.email,
  } : null

  return {
    ...invitation,
    invited_by: invitedByUser
  }
}

/**
 * Create a new parish invitation
 */
export async function createParishInvitation(data: CreateParishInvitationData): Promise<ParishInvitation> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Get current user ID
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Get parish details for email
  const { data: parish } = await supabase
    .from('parishes')
    .select('name')
    .eq('id', selectedParishId)
    .single()

  if (!parish) {
    throw new Error('Parish not found')
  }

  // Validate that enabled_modules is only provided for ministry-leader role
  const enabledModules = data.roles.includes('ministry-leader')
    ? (data.enabled_modules || [])
    : []

  // Generate unique token
  const token = crypto.randomUUID()

  // Set expiration to 7 days from now
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const { data: invitation, error } = await supabase
    .from('parish_invitations')
    .insert({
      parish_id: selectedParishId,
      email: data.email.toLowerCase(),
      token,
      roles: data.roles,
      enabled_modules: enabledModules,
      expires_at: expiresAt.toISOString(),
      invited_by_user_id: user.id
    })
    .select()
    .single()

  if (error) {
    logError('Error creating parish invitation:', error)
    throw new Error('Failed to create parish invitation')
  }

  // Send invitation email
  const inviterName = user.email || 'A parish member'
  const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/accept-invitation?token=${token}`

  logInfo('[Invitation Email] Attempting to send invitation email:', {
    to: data.email,
    parish: parish.name,
    inviter: inviterName,
    link: invitationLink,
  })

  const emailResult = await sendParishInvitationEmail(
    data.email,
    parish.name,
    inviterName,
    invitationLink
  )

  if (emailResult.success) {
    logInfo('[Invitation Email] Successfully sent:', {
      to: data.email,
      messageId: emailResult.messageId,
    })
  } else {
    logError('[Invitation Email] Failed to send:', emailResult.error)
    // Don't throw - invitation was created successfully, email is secondary
  }

  revalidatePath('/settings/parish')
  return invitation
}

/**
 * Resend an invitation (creates a new token with new expiration)
 */
export async function resendParishInvitation(invitationId: string): Promise<ParishInvitation> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  // Generate new token and expiration
  const token = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const { data: invitation, error } = await supabase
    .from('parish_invitations')
    .update({
      token,
      expires_at: expiresAt.toISOString()
    })
    .eq('id', invitationId)
    .eq('parish_id', selectedParishId)
    .is('accepted_at', null) // Only update pending invitations
    .select()
    .single()

  if (error) {
    logError('Error resending parish invitation:', error)
    throw new Error('Failed to resend parish invitation')
  }

  revalidatePath('/settings/parish')
  return invitation
}

/**
 * Revoke (delete) a parish invitation
 */
export async function revokeParishInvitation(invitationId: string): Promise<void> {
  const selectedParishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { error } = await supabase
    .from('parish_invitations')
    .delete()
    .eq('id', invitationId)
    .eq('parish_id', selectedParishId)
    .is('accepted_at', null) // Only delete pending invitations

  if (error) {
    logError('Error revoking parish invitation:', error)
    throw new Error('Failed to revoke parish invitation')
  }

  revalidatePath('/settings/parish')
}

/**
 * Accept a parish invitation (marks it as accepted and creates parish_users record)
 */
export async function acceptParishInvitation(token: string, userId: string): Promise<void> {
  const supabase = await createClient()

  // Get invitation details
  const { data: invitation, error: fetchError } = await supabase
    .from('parish_invitations')
    .select('*')
    .eq('token', token)
    .is('accepted_at', null)
    .single()

  if (fetchError || !invitation) {
    logError('Error fetching invitation:', fetchError)
    throw new Error('Invalid or expired invitation')
  }

  // Check if invitation is expired
  if (new Date(invitation.expires_at) < new Date()) {
    throw new Error('Invitation has expired')
  }

  // Create parish_users record
  const { error: insertError } = await supabase
    .from('parish_users')
    .insert({
      user_id: userId,
      parish_id: invitation.parish_id,
      roles: invitation.roles,
      enabled_modules: invitation.enabled_modules
    })

  if (insertError) {
    logError('Error creating parish_users record:', insertError)
    throw new Error('Failed to join parish')
  }

  // Mark invitation as accepted
  const { error: updateError } = await supabase
    .from('parish_invitations')
    .update({
      accepted_at: new Date().toISOString()
    })
    .eq('id', invitation.id)

  if (updateError) {
    logError('Error marking invitation as accepted:', updateError)
    // Don't throw here - the user was successfully added to the parish
  }
}
