'use server'

import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { randomBytes, createHash } from 'crypto'
import { sendMagicLinkEmail } from '@/lib/email'

const MAGIC_LINK_EXPIRY_DAYS = 30
const RATE_LIMIT_MAX_REQUESTS = 3
const RATE_LIMIT_WINDOW_HOURS = 1

interface MagicLinkResult {
  success: boolean
  message: string
}

interface ValidateMagicLinkResult {
  success: boolean
  personId?: string
  parishId?: string
  error?: string
}

/**
 * Hash a token using SHA-256
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Validate email format
 */
function isValidEmail(input: string): boolean {
  return input.includes('@') && input.includes('.')
}

/**
 * Check rate limiting for magic link requests
 */
async function checkRateLimit(emailOrPhone: string): Promise<boolean> {
  const supabase = createAdminClient()

  const windowStart = new Date()
  windowStart.setHours(windowStart.getHours() - RATE_LIMIT_WINDOW_HOURS)

  const { count } = await supabase
    .from('parishioner_auth_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('email_or_phone', emailOrPhone)
    .gte('created_at', windowStart.toISOString())

  return (count || 0) < RATE_LIMIT_MAX_REQUESTS
}

/**
 * Generate magic link and send via email
 */
export async function generateMagicLink(
  email: string,
  parishId: string
): Promise<MagicLinkResult> {
  try {
    const supabase = createAdminClient()

    // Validate email format
    if (!isValidEmail(email)) {
      return {
        success: false,
        message: 'Please enter a valid email address.',
      }
    }

    // Check rate limiting
    const withinRateLimit = await checkRateLimit(email)
    if (!withinRateLimit) {
      return {
        success: false,
        message: 'Too many requests. Please try again later.',
      }
    }

    // Look up person by email
    const { data: person, error: personError } = await supabase
      .from('people')
      .select('id, parish_id, full_name, email, parishioner_portal_enabled')
      .eq('email', email)
      .eq('parish_id', parishId)
      .single()

    if (personError || !person) {
      // Don't expose if person exists for security
      return {
        success: true,
        message: 'If an account exists, you will receive a magic link shortly.',
      }
    }

    // Verify portal enabled
    if (!person.parishioner_portal_enabled) {
      return {
        success: true,
        message: 'If an account exists, you will receive a magic link shortly.',
      }
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex')
    const hashedToken = hashToken(token)

    // Create session
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + MAGIC_LINK_EXPIRY_DAYS)

    const { error: sessionError } = await supabase
      .from('parishioner_auth_sessions')
      .insert({
        token: hashedToken,
        person_id: person.id,
        parish_id: person.parish_id,
        email_or_phone: email,
        delivery_method: 'email',
        expires_at: expiresAt.toISOString(),
      })

    if (sessionError) {
      console.error('Error creating session:', sessionError)
      return {
        success: false,
        message: 'Unable to generate magic link. Please try again.',
      }
    }

    // Send email with magic link
    const magicLinkUrl = `${process.env.NEXT_PUBLIC_APP_URL}/parishioner/auth?token=${token}`

    // Determine language preference (default to English)
    // TODO: Add language preference field to people table
    const language: 'en' | 'es' = 'en'

    const sent = await sendMagicLinkEmail(person.email, magicLinkUrl, language)

    // Log for debugging (remove in production)
    if (!sent) {
      console.log('Magic link for', person.full_name, ':', magicLinkUrl)
    }

    return {
      success: true,
      message: 'Magic link sent! Check your email.',
    }
  } catch (error) {
    console.error('Error generating magic link:', error)
    return {
      success: false,
      message: 'An error occurred. Please try again.',
    }
  }
}

/**
 * Validate magic link token and create browser session
 */
export async function validateMagicLink(token: string): Promise<ValidateMagicLinkResult> {
  try {
    const supabase = createAdminClient()
    const hashedToken = hashToken(token)

    // Look up session
    const { data: session, error: sessionError } = await supabase
      .from('parishioner_auth_sessions')
      .select('*')
      .eq('token', hashedToken)
      .single()

    if (sessionError || !session) {
      return {
        success: false,
        error: 'Invalid or expired link. Please request a new one.',
      }
    }

    // Check if expired
    if (new Date(session.expires_at) < new Date()) {
      return {
        success: false,
        error: 'This link has expired. Please request a new one.',
      }
    }

    // Check if revoked
    if (session.is_revoked) {
      return {
        success: false,
        error: 'This link is no longer valid. Please request a new one.',
      }
    }

    // Update last_accessed_at
    await supabase
      .from('parishioner_auth_sessions')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', session.id)

    // Update last_portal_access for person
    await supabase
      .from('people')
      .update({ last_portal_access: new Date().toISOString() })
      .eq('id', session.person_id)

    // Create browser session cookie
    const cookieStore = await cookies()
    cookieStore.set('parishioner_session_id', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * MAGIC_LINK_EXPIRY_DAYS, // 30 days
      path: '/',
    })

    return {
      success: true,
      personId: session.person_id,
      parishId: session.parish_id,
    }
  } catch (error) {
    console.error('Error validating magic link:', error)
    return {
      success: false,
      error: 'An error occurred. Please try again.',
    }
  }
}

/**
 * Logout parishioner - revoke session and clear cookie
 */
export async function logoutParishioner(): Promise<void> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('parishioner_session_id')?.value

    if (sessionId) {
      const supabase = createAdminClient()

      // Revoke session
      await supabase
        .from('parishioner_auth_sessions')
        .update({ is_revoked: true })
        .eq('id', sessionId)
    }

    // Clear cookie
    cookieStore.delete('parishioner_session_id')
  } catch (error) {
    console.error('Error logging out:', error)
  }
}

/**
 * Get current parishioner session
 */
export async function getParishionerSession(): Promise<{
  personId: string
  parishId: string
} | null> {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('parishioner_session_id')?.value

    if (!sessionId) {
      return null
    }

    const supabase = createAdminClient()

    // Look up session
    const { data: session, error } = await supabase
      .from('parishioner_auth_sessions')
      .select('person_id, parish_id, expires_at, is_revoked')
      .eq('id', sessionId)
      .single()

    if (error || !session || session.is_revoked) {
      return null
    }

    // Check if expired
    if (new Date(session.expires_at) < new Date()) {
      return null
    }

    return {
      personId: session.person_id,
      parishId: session.parish_id,
    }
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}
