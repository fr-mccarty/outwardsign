'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import {
  createAuthenticatedClient,
  revalidateEntity,
} from '@/lib/actions/server-action-utils'
import { generateMagicLink } from '@/lib/parishioner-auth/actions'

// ============================================================================
// TYPES
// ============================================================================

export interface ParishionerSession {
  id: string
  person_id: string
  parish_id: string
  email_or_phone: string
  delivery_method: string
  expires_at: string
  last_accessed_at: string | null
  is_revoked: boolean
  created_at: string
  person: {
    id: string
    full_name: string
    email: string | null
  }
}

export interface PortalEnabledParishioner {
  id: string
  full_name: string
  email: string | null
  phone_number: string | null
  parishioner_portal_enabled: boolean
  last_portal_access: string | null
}

export interface PortalStats {
  totalEnabled: number
  activeSessions: number
  recentLogins: number
}

// ============================================================================
// PERSON VIEW PAGE ACTIONS
// ============================================================================

/**
 * Toggle parishioner portal access for a person
 */
export async function toggleParishionerPortalAccess(
  personId: string,
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, parishId } = await createAuthenticatedClient()

    const { error } = await supabase
      .from('people')
      .update({ parishioner_portal_enabled: enabled })
      .eq('id', personId)
      .eq('parish_id', parishId)

    if (error) {
      console.error('Error toggling portal access:', error)
      return { success: false, error: 'Failed to update portal access' }
    }

    // If disabling, revoke all active sessions
    if (!enabled) {
      await revokeParishionerSessions(personId)
    }

    revalidateEntity('people', personId)
    return { success: true }
  } catch (error) {
    console.error('Error toggling portal access:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Send magic link email to a parishioner
 */
export async function sendParishionerMagicLink(
  personId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { supabase, parishId } = await createAuthenticatedClient()

    // Get person details
    const { data: person, error: personError } = await supabase
      .from('people')
      .select('id, email, parishioner_portal_enabled, parish_id')
      .eq('id', personId)
      .eq('parish_id', parishId)
      .single()

    if (personError || !person) {
      return { success: false, message: 'Person not found' }
    }

    if (!person.email) {
      return { success: false, message: 'This person does not have an email address' }
    }

    if (!person.parishioner_portal_enabled) {
      return { success: false, message: 'Portal access is not enabled for this person' }
    }

    // Get parish slug for the magic link URL
    const { data: parish } = await supabase
      .from('parishes')
      .select('slug')
      .eq('id', parishId)
      .single()

    // Use existing magic link generation
    const result = await generateMagicLink(person.email, parishId, parish?.slug)

    return result
  } catch (error) {
    console.error('Error sending magic link:', error)
    return { success: false, message: 'Failed to send magic link' }
  }
}

/**
 * Revoke all active sessions for a person
 */
export async function revokeParishionerSessions(
  personId: string
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const { parishId } = await createAuthenticatedClient()
    const supabase = createAdminClient()

    // Revoke all non-revoked sessions for this person in this parish
    const { data, error } = await supabase
      .from('parishioner_auth_sessions')
      .update({ is_revoked: true })
      .eq('person_id', personId)
      .eq('parish_id', parishId)
      .eq('is_revoked', false)
      .select('id')

    if (error) {
      console.error('Error revoking sessions:', error)
      return { success: false, count: 0, error: 'Failed to revoke sessions' }
    }

    return { success: true, count: data?.length || 0 }
  } catch (error) {
    console.error('Error revoking sessions:', error)
    return { success: false, count: 0, error: 'An unexpected error occurred' }
  }
}

// ============================================================================
// SETTINGS PAGE ACTIONS
// ============================================================================

/**
 * Get portal statistics for the parish
 */
export async function getParishionerPortalStats(): Promise<PortalStats> {
  try {
    const { supabase, parishId } = await createAuthenticatedClient()
    const adminClient = createAdminClient()

    // Count portal-enabled people
    const { count: totalEnabled } = await supabase
      .from('people')
      .select('*', { count: 'exact', head: true })
      .eq('parish_id', parishId)
      .eq('parishioner_portal_enabled', true)
      .is('deleted_at', null)

    // Count active sessions (not expired, not revoked)
    const { count: activeSessions } = await adminClient
      .from('parishioner_auth_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('parish_id', parishId)
      .eq('is_revoked', false)
      .gte('expires_at', new Date().toISOString())

    // Count recent logins (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: recentLogins } = await adminClient
      .from('parishioner_auth_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('parish_id', parishId)
      .gte('last_accessed_at', sevenDaysAgo.toISOString())

    return {
      totalEnabled: totalEnabled || 0,
      activeSessions: activeSessions || 0,
      recentLogins: recentLogins || 0,
    }
  } catch (error) {
    console.error('Error getting portal stats:', error)
    return { totalEnabled: 0, activeSessions: 0, recentLogins: 0 }
  }
}

/**
 * Get all active parishioner sessions for the parish
 */
export async function getActiveParishionerSessions(): Promise<ParishionerSession[]> {
  try {
    const { parishId } = await createAuthenticatedClient()
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('parishioner_auth_sessions')
      .select(`
        id,
        person_id,
        parish_id,
        email_or_phone,
        delivery_method,
        expires_at,
        last_accessed_at,
        is_revoked,
        created_at,
        person:people(id, full_name, email)
      `)
      .eq('parish_id', parishId)
      .eq('is_revoked', false)
      .gte('expires_at', new Date().toISOString())
      .order('last_accessed_at', { ascending: false, nullsFirst: false })

    if (error) {
      console.error('Error getting active sessions:', error)
      return []
    }

    return (data || []).map(session => ({
      ...session,
      person: session.person as unknown as ParishionerSession['person']
    }))
  } catch (error) {
    console.error('Error getting active sessions:', error)
    return []
  }
}

/**
 * Get all portal-enabled parishioners
 */
export async function getPortalEnabledParishioners(): Promise<PortalEnabledParishioner[]> {
  try {
    const { supabase, parishId } = await createAuthenticatedClient()

    const { data, error } = await supabase
      .from('people')
      .select('id, full_name, email, phone_number, parishioner_portal_enabled, last_portal_access')
      .eq('parish_id', parishId)
      .eq('parishioner_portal_enabled', true)
      .is('deleted_at', null)
      .order('full_name')

    if (error) {
      console.error('Error getting portal-enabled parishioners:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error getting portal-enabled parishioners:', error)
    return []
  }
}

/**
 * Revoke a single session by ID
 */
export async function revokeSession(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { parishId } = await createAuthenticatedClient()
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('parishioner_auth_sessions')
      .update({ is_revoked: true })
      .eq('id', sessionId)
      .eq('parish_id', parishId)

    if (error) {
      console.error('Error revoking session:', error)
      return { success: false, error: 'Failed to revoke session' }
    }

    return { success: true }
  } catch (error) {
    console.error('Error revoking session:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Revoke all sessions for the parish
 */
export async function revokeAllSessions(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const { parishId } = await createAuthenticatedClient()
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('parishioner_auth_sessions')
      .update({ is_revoked: true })
      .eq('parish_id', parishId)
      .eq('is_revoked', false)
      .select('id')

    if (error) {
      console.error('Error revoking all sessions:', error)
      return { success: false, count: 0, error: 'Failed to revoke sessions' }
    }

    return { success: true, count: data?.length || 0 }
  } catch (error) {
    console.error('Error revoking all sessions:', error)
    return { success: false, count: 0, error: 'An unexpected error occurred' }
  }
}

/**
 * Get session count for a specific person
 */
export async function getPersonSessionCount(personId: string): Promise<number> {
  try {
    const { parishId } = await createAuthenticatedClient()
    const supabase = createAdminClient()

    const { count } = await supabase
      .from('parishioner_auth_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('person_id', personId)
      .eq('parish_id', parishId)
      .eq('is_revoked', false)
      .gte('expires_at', new Date().toISOString())

    return count || 0
  } catch (error) {
    console.error('Error getting session count:', error)
    return 0
  }
}
