/**
 * OAuth2 Server Utilities
 *
 * Token generation, validation, and PKCE utilities for OAuth2 flow.
 */

import { randomBytes, createHash } from 'crypto'
import bcrypt from 'bcryptjs'
import { createAdminClient } from '@/lib/supabase/admin'
import type { OAuthContext, OAuthScope, TOKEN_LIFETIMES } from './types'

// ============================================================
// TOKEN GENERATION
// ============================================================

interface GeneratedToken {
  token: string
  prefix: string
  hash: string
}

/**
 * Generate a secure random token with prefix, hash, and full value.
 * The full token is only returned once - store it securely.
 */
async function generateToken(prefix: string, prefixLength: number = 12): Promise<GeneratedToken> {
  const randomPart = randomBytes(32).toString('base64url')
  const token = `${prefix}${randomPart}`
  const tokenPrefix = token.substring(0, prefixLength)
  const hash = await bcrypt.hash(token, 12)

  return { token, prefix: tokenPrefix, hash }
}

/**
 * Generate an OAuth access token.
 * Format: os_oauth_[random]
 */
export async function generateAccessToken(): Promise<GeneratedToken> {
  return generateToken('os_oauth_', 12)
}

/**
 * Generate an OAuth refresh token.
 * Format: os_refresh_[random]
 */
export async function generateRefreshToken(): Promise<GeneratedToken> {
  return generateToken('os_refresh_', 12)
}

/**
 * Generate an authorization code.
 * Format: os_code_[random]
 */
export async function generateAuthorizationCode(): Promise<GeneratedToken> {
  return generateToken('os_code_', 8)
}

/**
 * Generate a client secret.
 * Format: os_secret_[random]
 */
export async function generateClientSecret(): Promise<GeneratedToken> {
  return generateToken('os_secret_', 8)
}

// ============================================================
// PKCE UTILITIES
// ============================================================

/**
 * Verify a PKCE code challenge.
 *
 * @param verifier - The code_verifier sent with the token request
 * @param challenge - The code_challenge stored with the authorization code
 * @param method - The challenge method ('S256' or 'plain')
 */
export function verifyCodeChallenge(
  verifier: string,
  challenge: string,
  method: 'S256' | 'plain'
): boolean {
  if (method === 'plain') {
    return verifier === challenge
  }

  // S256: BASE64URL(SHA256(code_verifier)) == code_challenge
  const hash = createHash('sha256').update(verifier).digest()
  const computed = hash.toString('base64url')

  return computed === challenge
}

/**
 * Generate a PKCE code verifier and challenge for testing.
 */
export function generatePKCE(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString('base64url')
  const hash = createHash('sha256').update(verifier).digest()
  const challenge = hash.toString('base64url')

  return { verifier, challenge }
}

// ============================================================
// TOKEN VALIDATION
// ============================================================

/**
 * Validate an OAuth access token and return the context.
 *
 * @param token - The full access token (os_oauth_...)
 * @returns OAuthContext if valid, null if invalid/expired/revoked
 */
export async function validateAccessToken(token: string): Promise<OAuthContext | null> {
  if (!token || !token.startsWith('os_oauth_')) {
    return null
  }

  const supabase = createAdminClient()
  const tokenPrefix = token.substring(0, 12)

  // Look up token by prefix
  const { data: tokenRecord, error } = await supabase
    .from('oauth_access_tokens')
    .select(`
      id,
      token_hash,
      client_id,
      user_id,
      parish_id,
      scopes,
      expires_at,
      revoked_at,
      use_count
    `)
    .eq('token_prefix', tokenPrefix)
    .is('revoked_at', null)
    .single()

  if (error || !tokenRecord) {
    return null
  }

  // Check expiration
  if (new Date(tokenRecord.expires_at) < new Date()) {
    return null
  }

  // Verify token hash
  const isValid = await bcrypt.compare(token, tokenRecord.token_hash)
  if (!isValid) {
    return null
  }

  // Get user email
  const { data: user } = await supabase.auth.admin.getUserById(tokenRecord.user_id)

  // Update usage tracking
  await supabase
    .from('oauth_access_tokens')
    .update({
      last_used_at: new Date().toISOString(),
      use_count: tokenRecord.use_count + 1,
    })
    .eq('id', tokenRecord.id)

  return {
    userId: tokenRecord.user_id,
    userEmail: user?.user?.email ?? null,
    parishId: tokenRecord.parish_id,
    clientId: tokenRecord.client_id,
    scopes: tokenRecord.scopes as OAuthScope[],
    tokenId: tokenRecord.id,
  }
}

/**
 * Validate a refresh token.
 *
 * @param token - The full refresh token (os_refresh_...)
 * @returns Token record if valid, null if invalid/expired/revoked/rotated
 */
export async function validateRefreshToken(token: string): Promise<{
  id: string
  clientId: string
  userId: string
  parishId: string
  scopes: OAuthScope[]
} | null> {
  if (!token || !token.startsWith('os_refresh_')) {
    return null
  }

  const supabase = createAdminClient()
  const tokenPrefix = token.substring(0, 12)

  // Look up token by prefix
  const { data: tokenRecord, error } = await supabase
    .from('oauth_refresh_tokens')
    .select(`
      id,
      token_hash,
      client_id,
      user_id,
      parish_id,
      scopes,
      expires_at,
      revoked_at,
      rotated_at
    `)
    .eq('token_prefix', tokenPrefix)
    .is('revoked_at', null)
    .is('rotated_at', null)
    .single()

  if (error || !tokenRecord) {
    return null
  }

  // Check expiration
  if (new Date(tokenRecord.expires_at) < new Date()) {
    return null
  }

  // Verify token hash
  const isValid = await bcrypt.compare(token, tokenRecord.token_hash)
  if (!isValid) {
    return null
  }

  return {
    id: tokenRecord.id,
    clientId: tokenRecord.client_id,
    userId: tokenRecord.user_id,
    parishId: tokenRecord.parish_id,
    scopes: tokenRecord.scopes as OAuthScope[],
  }
}

/**
 * Validate a client secret.
 *
 * @param clientId - The client_id
 * @param clientSecret - The client secret to validate
 * @returns true if valid, false otherwise
 */
export async function validateClientSecret(
  clientId: string,
  clientSecret: string
): Promise<boolean> {
  const supabase = createAdminClient()

  const { data: client, error } = await supabase
    .from('oauth_clients')
    .select('client_secret_hash, is_active')
    .eq('client_id', clientId)
    .single()

  if (error || !client || !client.is_active) {
    return false
  }

  return bcrypt.compare(clientSecret, client.client_secret_hash)
}

// ============================================================
// SCOPE UTILITIES
// ============================================================

/**
 * Parse a space-separated scope string into an array.
 */
export function parseScopes(scopeString: string): OAuthScope[] {
  if (!scopeString) return []

  const validScopes: OAuthScope[] = ['read', 'write', 'delete', 'profile']

  return scopeString
    .split(' ')
    .filter((s): s is OAuthScope => validScopes.includes(s as OAuthScope))
}

/**
 * Check if a context has a required scope.
 * Follows hierarchy: delete > write > read
 */
export function hasScope(context: OAuthContext, requiredScope: OAuthScope): boolean {
  // Profile scope is standalone
  if (requiredScope === 'profile') {
    return context.scopes.includes('profile')
  }

  // Check hierarchy
  if (context.scopes.includes('delete')) {
    return true // delete implies write and read
  }

  if (context.scopes.includes('write')) {
    return requiredScope !== 'delete' // write implies read
  }

  return context.scopes.includes(requiredScope)
}

/**
 * Get the intersection of two scope arrays.
 */
export function intersectScopes(a: OAuthScope[], b: OAuthScope[]): OAuthScope[] {
  return a.filter(scope => b.includes(scope))
}

// ============================================================
// ACCESS CONTROL
// ============================================================

/**
 * Check if a user is allowed to use OAuth for a parish.
 *
 * Checks:
 * 1. Parish has OAuth enabled
 * 2. User has OAuth enabled (or no record = use defaults)
 *
 * @returns Object with enabled status and allowed scopes
 */
export async function checkUserOAuthAccess(
  userId: string,
  parishId: string
): Promise<{ enabled: boolean; allowedScopes: OAuthScope[] }> {
  const supabase = createAdminClient()

  // Check parish settings
  const { data: parishSettings } = await supabase
    .from('parish_settings')
    .select('oauth_enabled, oauth_default_user_scopes')
    .eq('parish_id', parishId)
    .single()

  if (!parishSettings?.oauth_enabled) {
    return { enabled: false, allowedScopes: [] }
  }

  // Check user-specific permissions
  const { data: userPermissions } = await supabase
    .from('oauth_user_permissions')
    .select('oauth_enabled, allowed_scopes')
    .eq('user_id', userId)
    .eq('parish_id', parishId)
    .single()

  if (userPermissions) {
    return {
      enabled: userPermissions.oauth_enabled,
      allowedScopes: userPermissions.allowed_scopes as OAuthScope[],
    }
  }

  // No user-specific settings, use parish defaults
  return {
    enabled: true,
    allowedScopes: (parishSettings.oauth_default_user_scopes ?? ['read', 'profile']) as OAuthScope[],
  }
}

// ============================================================
// TOKEN EXPIRATION HELPERS
// ============================================================

/**
 * Get expiration date for a token type.
 */
export function getTokenExpiration(
  type: keyof typeof TOKEN_LIFETIMES
): Date {
  const lifetimes = {
    AUTHORIZATION_CODE: 10 * 60,
    ACCESS_TOKEN: 60 * 60,
    REFRESH_TOKEN: 30 * 24 * 60 * 60,
  }

  const now = new Date()
  return new Date(now.getTime() + lifetimes[type] * 1000)
}
