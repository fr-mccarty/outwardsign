'use server'

/**
 * OAuth2 Authorization Server Actions
 *
 * Server actions for OAuth2 authorization flow, consent management,
 * and admin controls for user permissions.
 */

import bcrypt from 'bcryptjs'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  createAuthenticatedClient,
  createAuthenticatedClientWithPermissions,
  handleSupabaseError,
  revalidateEntity,
} from '@/lib/actions/server-action-utils'
import {
  generateAuthorizationCode,
  generateAccessToken,
  generateRefreshToken,
  validateClientSecret,
  verifyCodeChallenge,
  parseScopes,
  intersectScopes,
  getTokenExpiration,
  checkUserOAuthAccess,
} from '@/lib/oauth/server'
import type {
  OAuthScope,
  OAuthClient,
  OAuthUserConsent,
  OAuthUserPermissions,
  TokenResponse,
  ConsentContext,
} from '@/lib/oauth/types'

// ============================================================================
// CLIENT LOOKUP
// ============================================================================

/**
 * Get OAuth client details for the consent screen.
 * Returns null if client not found or inactive.
 */
export async function getOAuthClient(
  clientId: string
): Promise<Pick<OAuthClient, 'client_id' | 'name' | 'description' | 'logo_url' | 'allowed_scopes'> | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('oauth_clients')
    .select('client_id, name, description, logo_url, allowed_scopes')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .single()

  if (error || !data) return null

  return {
    client_id: data.client_id,
    name: data.name,
    description: data.description,
    logo_url: data.logo_url,
    allowed_scopes: data.allowed_scopes as OAuthScope[],
  }
}

/**
 * Validate that a redirect URI is allowed for a client.
 */
export async function validateRedirectUri(
  clientId: string,
  redirectUri: string
): Promise<boolean> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('oauth_clients')
    .select('redirect_uris')
    .eq('client_id', clientId)
    .eq('is_active', true)
    .single()

  if (error || !data) return false

  return data.redirect_uris.includes(redirectUri)
}

// ============================================================================
// CONSENT MANAGEMENT
// ============================================================================

/**
 * Build the consent context for the authorization screen.
 */
export async function buildConsentContext(params: {
  clientId: string
  redirectUri: string
  scope: string
  state: string | null
  codeChallenge: string | null
  codeChallengeMethod: 'S256' | 'plain' | null
}): Promise<ConsentContext | { error: string }> {
  const { supabase, parishId } = await createAuthenticatedClient()

  // Get user from session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Validate client exists and is active
  const client = await getOAuthClient(params.clientId)
  if (!client) {
    return { error: 'invalid_client' }
  }

  // Validate redirect URI
  const isValidRedirect = await validateRedirectUri(params.clientId, params.redirectUri)
  if (!isValidRedirect) {
    return { error: 'Invalid redirect URI' }
  }

  // Check user's OAuth access for this parish
  const userAccess = await checkUserOAuthAccess(user.id, parishId)
  if (!userAccess.enabled) {
    return { error: 'OAuth access is disabled for your account' }
  }

  // Parse requested scopes
  const requestedScopes = parseScopes(params.scope)

  // Calculate allowed scopes (intersection of client + user permissions)
  const allowedScopes = intersectScopes(
    intersectScopes(requestedScopes, client.allowed_scopes),
    userAccess.allowedScopes
  )

  if (allowedScopes.length === 0) {
    return { error: 'No valid scopes available' }
  }

  return {
    client: {
      client_id: client.client_id,
      name: client.name,
      description: client.description,
      logo_url: client.logo_url,
    },
    requestedScopes,
    allowedScopes,
    redirectUri: params.redirectUri,
    state: params.state,
    codeChallenge: params.codeChallenge,
    codeChallengeMethod: params.codeChallengeMethod,
  }
}

/**
 * Check if user has existing consent for a client.
 */
export async function getExistingConsent(
  clientId: string
): Promise<OAuthUserConsent | null> {
  const { supabase, parishId } = await createAuthenticatedClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('oauth_user_consents')
    .select('*')
    .eq('user_id', user.id)
    .eq('parish_id', parishId)
    .eq('client_id', clientId)
    .is('revoked_at', null)
    .single()

  if (error || !data) return null

  return data as OAuthUserConsent
}

/**
 * Grant consent and create authorization code.
 */
export async function grantConsent(params: {
  clientId: string
  redirectUri: string
  grantedScopes: OAuthScope[]
  state: string | null
  codeChallenge: string | null
  codeChallengeMethod: 'S256' | 'plain' | null
}): Promise<{ code: string; state: string | null } | { error: string }> {
  const { supabase, parishId } = await createAuthenticatedClient()
  const adminSupabase = createAdminClient()

  // Get user from session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Validate client and redirect
  const client = await getOAuthClient(params.clientId)
  if (!client) {
    return { error: 'invalid_client' }
  }

  const isValidRedirect = await validateRedirectUri(params.clientId, params.redirectUri)
  if (!isValidRedirect) {
    return { error: 'Invalid redirect URI' }
  }

  // Verify user can grant these scopes
  const userAccess = await checkUserOAuthAccess(user.id, parishId)
  if (!userAccess.enabled) {
    return { error: 'OAuth access disabled' }
  }

  const validScopes = intersectScopes(
    intersectScopes(params.grantedScopes, client.allowed_scopes),
    userAccess.allowedScopes
  )

  if (validScopes.length === 0) {
    return { error: 'No valid scopes' }
  }

  // Upsert consent record
  const { error: consentError } = await adminSupabase
    .from('oauth_user_consents')
    .upsert(
      {
        user_id: user.id,
        parish_id: parishId,
        client_id: params.clientId,
        granted_scopes: validScopes,
        granted_at: new Date().toISOString(),
        revoked_at: null,
      },
      { onConflict: 'user_id,parish_id,client_id' }
    )

  if (consentError) {
    console.error('Consent upsert error:', consentError)
    return { error: 'Failed to save consent' }
  }

  // Generate authorization code
  const authCode = await generateAuthorizationCode()

  const { error: codeError } = await adminSupabase
    .from('oauth_authorization_codes')
    .insert({
      code_hash: authCode.hash,
      code_prefix: authCode.prefix,
      client_id: params.clientId,
      user_id: user.id,
      parish_id: parishId,
      redirect_uri: params.redirectUri,
      scopes: validScopes,
      state: params.state,
      code_challenge: params.codeChallenge,
      code_challenge_method: params.codeChallengeMethod,
      expires_at: getTokenExpiration('AUTHORIZATION_CODE').toISOString(),
    })

  if (codeError) {
    console.error('Auth code insert error:', codeError)
    return { error: 'Failed to create authorization code' }
  }

  return {
    code: authCode.token,
    state: params.state,
  }
}

/**
 * Get all apps the current user has authorized.
 */
export async function getUserConsents(): Promise<Array<OAuthUserConsent & { client_name: string }>> {
  const { supabase, parishId } = await createAuthenticatedClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('oauth_user_consents')
    .select(`
      *,
      oauth_clients!inner(name)
    `)
    .eq('user_id', user.id)
    .eq('parish_id', parishId)
    .is('revoked_at', null)
    .order('granted_at', { ascending: false })

  if (error) handleSupabaseError(error, 'fetching', 'authorized apps')

  return (data || []).map((item) => ({
    ...item,
    client_name: (item.oauth_clients as { name: string }).name,
  }))
}

/**
 * Revoke consent for an app (also revokes all tokens).
 */
export async function revokeConsent(clientId: string): Promise<void> {
  const { supabase, parishId } = await createAuthenticatedClient()
  const adminSupabase = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Revoke consent
  const { error: consentError } = await supabase
    .from('oauth_user_consents')
    .update({ revoked_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('parish_id', parishId)
    .eq('client_id', clientId)

  if (consentError) handleSupabaseError(consentError, 'revoking', 'consent')

  // Revoke all access tokens
  await adminSupabase
    .from('oauth_access_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('parish_id', parishId)
    .eq('client_id', clientId)
    .is('revoked_at', null)

  // Revoke all refresh tokens
  await adminSupabase
    .from('oauth_refresh_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('parish_id', parishId)
    .eq('client_id', clientId)
    .is('revoked_at', null)

  revalidateEntity('settings/user/authorized-apps')
}

// ============================================================================
// TOKEN EXCHANGE
// ============================================================================

/**
 * Exchange authorization code for tokens.
 * Called by the /api/oauth/token endpoint.
 */
export async function exchangeCodeForTokens(params: {
  code: string
  clientId: string
  clientSecret?: string
  redirectUri: string
  codeVerifier?: string
}): Promise<TokenResponse | { error: string; error_description?: string }> {
  const supabase = createAdminClient()

  // Look up authorization code by prefix
  const codePrefix = params.code.substring(0, 8)

  const { data: authCode, error: codeError } = await supabase
    .from('oauth_authorization_codes')
    .select('*')
    .eq('code_prefix', codePrefix)
    .is('used_at', null)
    .single()

  if (codeError || !authCode) {
    return { error: 'invalid_grant', error_description: 'Authorization code not found or already used' }
  }

  // Check expiration
  if (new Date(authCode.expires_at) < new Date()) {
    return { error: 'invalid_grant', error_description: 'Authorization code expired' }
  }

  // Verify code hash
  const isValidCode = await bcrypt.compare(params.code, authCode.code_hash)
  if (!isValidCode) {
    return { error: 'invalid_grant', error_description: 'Invalid authorization code' }
  }

  // Verify client_id matches
  if (authCode.client_id !== params.clientId) {
    return { error: 'invalid_grant', error_description: 'Client ID mismatch' }
  }

  // Verify redirect_uri matches
  if (authCode.redirect_uri !== params.redirectUri) {
    return { error: 'invalid_grant', error_description: 'Redirect URI mismatch' }
  }

  // Verify PKCE if code_challenge was provided
  if (authCode.code_challenge) {
    if (!params.codeVerifier) {
      return { error: 'invalid_grant', error_description: 'code_verifier required' }
    }
    const pkceValid = verifyCodeChallenge(
      params.codeVerifier,
      authCode.code_challenge,
      authCode.code_challenge_method as 'S256' | 'plain'
    )
    if (!pkceValid) {
      return { error: 'invalid_grant', error_description: 'PKCE verification failed' }
    }
  } else if (params.clientSecret) {
    // Verify client secret for confidential clients
    const secretValid = await validateClientSecret(params.clientId, params.clientSecret)
    if (!secretValid) {
      return { error: 'invalid_client', error_description: 'Invalid client credentials' }
    }
  }

  // Mark authorization code as used
  await supabase
    .from('oauth_authorization_codes')
    .update({ used_at: new Date().toISOString() })
    .eq('id', authCode.id)

  // Generate tokens
  const accessToken = await generateAccessToken()
  const refreshToken = await generateRefreshToken()

  // Store access token
  const { data: storedAccessToken, error: accessError } = await supabase
    .from('oauth_access_tokens')
    .insert({
      token_hash: accessToken.hash,
      token_prefix: accessToken.prefix,
      client_id: authCode.client_id,
      user_id: authCode.user_id,
      parish_id: authCode.parish_id,
      scopes: authCode.scopes,
      expires_at: getTokenExpiration('ACCESS_TOKEN').toISOString(),
    })
    .select('id')
    .single()

  if (accessError) {
    console.error('Access token insert error:', accessError)
    return { error: 'server_error', error_description: 'Failed to create access token' }
  }

  // Store refresh token
  const { error: refreshError } = await supabase
    .from('oauth_refresh_tokens')
    .insert({
      token_hash: refreshToken.hash,
      token_prefix: refreshToken.prefix,
      access_token_id: storedAccessToken.id,
      client_id: authCode.client_id,
      user_id: authCode.user_id,
      parish_id: authCode.parish_id,
      scopes: authCode.scopes,
      expires_at: getTokenExpiration('REFRESH_TOKEN').toISOString(),
    })

  if (refreshError) {
    console.error('Refresh token insert error:', refreshError)
    return { error: 'server_error', error_description: 'Failed to create refresh token' }
  }

  return {
    access_token: accessToken.token,
    token_type: 'Bearer',
    expires_in: 3600, // 1 hour
    refresh_token: refreshToken.token,
    scope: (authCode.scopes as string[]).join(' '),
  }
}

/**
 * Refresh an access token using a refresh token.
 */
export async function refreshAccessToken(params: {
  refreshToken: string
  clientId: string
  clientSecret?: string
  scope?: string
}): Promise<TokenResponse | { error: string; error_description?: string }> {
  const supabase = createAdminClient()

  // Validate refresh token
  const tokenPrefix = params.refreshToken.substring(0, 12)

  const { data: storedRefresh, error: tokenError } = await supabase
    .from('oauth_refresh_tokens')
    .select('*')
    .eq('token_prefix', tokenPrefix)
    .is('revoked_at', null)
    .is('rotated_at', null)
    .single()

  if (tokenError || !storedRefresh) {
    return { error: 'invalid_grant', error_description: 'Refresh token not found or revoked' }
  }

  // Check expiration
  if (new Date(storedRefresh.expires_at) < new Date()) {
    return { error: 'invalid_grant', error_description: 'Refresh token expired' }
  }

  // Verify token hash
  const isValid = await bcrypt.compare(params.refreshToken, storedRefresh.token_hash)
  if (!isValid) {
    return { error: 'invalid_grant', error_description: 'Invalid refresh token' }
  }

  // Verify client_id
  if (storedRefresh.client_id !== params.clientId) {
    return { error: 'invalid_client', error_description: 'Client ID mismatch' }
  }

  // Verify client secret if provided
  if (params.clientSecret) {
    const secretValid = await validateClientSecret(params.clientId, params.clientSecret)
    if (!secretValid) {
      return { error: 'invalid_client', error_description: 'Invalid client credentials' }
    }
  }

  // Calculate new scopes (can only narrow, not expand)
  let newScopes = storedRefresh.scopes as OAuthScope[]
  if (params.scope) {
    const requestedScopes = parseScopes(params.scope)
    newScopes = intersectScopes(requestedScopes, newScopes)
    if (newScopes.length === 0) {
      return { error: 'invalid_scope', error_description: 'Requested scope exceeds original grant' }
    }
  }

  // Generate new tokens (token rotation)
  const newAccessToken = await generateAccessToken()
  const newRefreshToken = await generateRefreshToken()

  // Store new access token
  const { data: storedAccess, error: accessError } = await supabase
    .from('oauth_access_tokens')
    .insert({
      token_hash: newAccessToken.hash,
      token_prefix: newAccessToken.prefix,
      client_id: storedRefresh.client_id,
      user_id: storedRefresh.user_id,
      parish_id: storedRefresh.parish_id,
      scopes: newScopes,
      expires_at: getTokenExpiration('ACCESS_TOKEN').toISOString(),
    })
    .select('id')
    .single()

  if (accessError) {
    return { error: 'server_error', error_description: 'Failed to create access token' }
  }

  // Store new refresh token
  const { data: newStoredRefresh, error: refreshError } = await supabase
    .from('oauth_refresh_tokens')
    .insert({
      token_hash: newRefreshToken.hash,
      token_prefix: newRefreshToken.prefix,
      access_token_id: storedAccess.id,
      client_id: storedRefresh.client_id,
      user_id: storedRefresh.user_id,
      parish_id: storedRefresh.parish_id,
      scopes: newScopes,
      expires_at: getTokenExpiration('REFRESH_TOKEN').toISOString(),
    })
    .select('id')
    .single()

  if (refreshError) {
    return { error: 'server_error', error_description: 'Failed to create refresh token' }
  }

  // Mark old refresh token as rotated
  await supabase
    .from('oauth_refresh_tokens')
    .update({
      rotated_at: new Date().toISOString(),
      replaced_by_id: newStoredRefresh.id,
    })
    .eq('id', storedRefresh.id)

  return {
    access_token: newAccessToken.token,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: newRefreshToken.token,
    scope: newScopes.join(' '),
  }
}

/**
 * Revoke a token (access or refresh).
 */
export async function revokeToken(params: {
  token: string
  tokenTypeHint?: 'access_token' | 'refresh_token'
  clientId: string
  clientSecret?: string
}): Promise<{ success: boolean } | { error: string }> {
  const supabase = createAdminClient()

  // Verify client credentials if provided
  if (params.clientSecret) {
    const secretValid = await validateClientSecret(params.clientId, params.clientSecret)
    if (!secretValid) {
      return { error: 'invalid_client' }
    }
  }

  // Try to determine token type
  let tokenType: 'access' | 'refresh' | null = null
  if (params.tokenTypeHint === 'access_token' || params.token.startsWith('os_oauth_')) {
    tokenType = 'access'
  } else if (params.tokenTypeHint === 'refresh_token' || params.token.startsWith('os_refresh_')) {
    tokenType = 'refresh'
  }

  // Revoke access token
  if (tokenType === 'access' || tokenType === null) {
    const prefix = params.token.substring(0, 12)
    const { data: accessToken } = await supabase
      .from('oauth_access_tokens')
      .select('id, token_hash, client_id')
      .eq('token_prefix', prefix)
      .eq('client_id', params.clientId)
      .is('revoked_at', null)
      .single()

    if (accessToken) {
      const isValid = await bcrypt.compare(params.token, accessToken.token_hash)
      if (isValid) {
        await supabase
          .from('oauth_access_tokens')
          .update({ revoked_at: new Date().toISOString() })
          .eq('id', accessToken.id)
        return { success: true }
      }
    }
  }

  // Revoke refresh token
  if (tokenType === 'refresh' || tokenType === null) {
    const prefix = params.token.substring(0, 12)
    const { data: refreshToken } = await supabase
      .from('oauth_refresh_tokens')
      .select('id, token_hash, client_id')
      .eq('token_prefix', prefix)
      .eq('client_id', params.clientId)
      .is('revoked_at', null)
      .single()

    if (refreshToken) {
      const isValid = await bcrypt.compare(params.token, refreshToken.token_hash)
      if (isValid) {
        await supabase
          .from('oauth_refresh_tokens')
          .update({ revoked_at: new Date().toISOString() })
          .eq('id', refreshToken.id)
        return { success: true }
      }
    }
  }

  // Per RFC 7009, return success even if token wasn't found
  return { success: true }
}

// ============================================================================
// ADMIN: PARISH OAUTH SETTINGS
// ============================================================================

/**
 * Get parish OAuth settings.
 */
export async function getParishOAuthSettings(): Promise<{
  oauth_enabled: boolean
  oauth_default_user_scopes: OAuthScope[]
}> {
  const { supabase, parishId } = await createAuthenticatedClient()

  const { data, error } = await supabase
    .from('parish_settings')
    .select('oauth_enabled, oauth_default_user_scopes')
    .eq('parish_id', parishId)
    .single()

  if (error) handleSupabaseError(error, 'fetching', 'OAuth settings')

  return {
    oauth_enabled: data?.oauth_enabled ?? false,
    oauth_default_user_scopes: (data?.oauth_default_user_scopes ?? ['read', 'profile']) as OAuthScope[],
  }
}

/**
 * Update parish OAuth settings (admin only).
 */
export async function updateParishOAuthSettings(settings: {
  oauth_enabled?: boolean
  oauth_default_user_scopes?: OAuthScope[]
}): Promise<void> {
  const { supabase, parishId } = await createAuthenticatedClientWithPermissions()

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (settings.oauth_enabled !== undefined) {
    updateData.oauth_enabled = settings.oauth_enabled
  }
  if (settings.oauth_default_user_scopes !== undefined) {
    updateData.oauth_default_user_scopes = settings.oauth_default_user_scopes
  }

  const { error } = await supabase
    .from('parish_settings')
    .update(updateData)
    .eq('parish_id', parishId)

  if (error) handleSupabaseError(error, 'updating', 'OAuth settings')

  revalidateEntity('settings/parish/oauth-settings')
}

// ============================================================================
// ADMIN: USER OAUTH PERMISSIONS
// ============================================================================

/**
 * Get all user OAuth permissions for the parish (admin only).
 */
export async function getParishUserOAuthPermissions(): Promise<
  Array<OAuthUserPermissions & { user_email: string | null }>
> {
  const { supabase, parishId } = await createAuthenticatedClientWithPermissions()
  const adminSupabase = createAdminClient()

  // Get all permissions for parish
  const { data: permissions, error } = await supabase
    .from('oauth_user_permissions')
    .select('*')
    .eq('parish_id', parishId)
    .order('created_at', { ascending: false })

  if (error) handleSupabaseError(error, 'fetching', 'user permissions')

  // Get user emails
  const result = await Promise.all(
    (permissions || []).map(async (perm) => {
      const { data: user } = await adminSupabase.auth.admin.getUserById(perm.user_id)
      return {
        ...perm,
        user_email: user?.user?.email ?? null,
      } as OAuthUserPermissions & { user_email: string | null }
    })
  )

  return result
}

/**
 * Get OAuth permissions for a specific user.
 */
export async function getUserOAuthPermissions(userId: string): Promise<OAuthUserPermissions | null> {
  const { supabase, parishId } = await createAuthenticatedClientWithPermissions()

  const { data, error } = await supabase
    .from('oauth_user_permissions')
    .select('*')
    .eq('user_id', userId)
    .eq('parish_id', parishId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    handleSupabaseError(error, 'fetching', 'user permissions')
  }

  return data as OAuthUserPermissions
}

/**
 * Update OAuth permissions for a user (admin only).
 */
export async function updateUserOAuthPermissions(
  userId: string,
  permissions: {
    oauth_enabled?: boolean
    allowed_scopes?: OAuthScope[]
  }
): Promise<void> {
  const { supabase, parishId } = await createAuthenticatedClientWithPermissions()

  // Get current user for audit
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    updated_by: currentUser?.id,
  }

  if (permissions.oauth_enabled !== undefined) {
    updateData.oauth_enabled = permissions.oauth_enabled
  }
  if (permissions.allowed_scopes !== undefined) {
    updateData.allowed_scopes = permissions.allowed_scopes
  }

  // Upsert permissions
  const { error } = await supabase
    .from('oauth_user_permissions')
    .upsert(
      {
        user_id: userId,
        parish_id: parishId,
        ...updateData,
      },
      { onConflict: 'user_id,parish_id' }
    )

  if (error) handleSupabaseError(error, 'updating', 'user permissions')

  revalidateEntity('settings/parish/oauth-settings')
}

/**
 * Delete user OAuth permissions (revert to defaults).
 */
export async function deleteUserOAuthPermissions(userId: string): Promise<void> {
  const { supabase, parishId } = await createAuthenticatedClientWithPermissions()

  const { error } = await supabase
    .from('oauth_user_permissions')
    .delete()
    .eq('user_id', userId)
    .eq('parish_id', parishId)

  if (error) handleSupabaseError(error, 'deleting', 'user permissions')

  revalidateEntity('settings/parish/oauth-settings')
}

// ============================================================================
// ADMIN: TOKEN MANAGEMENT
// ============================================================================

/**
 * Get all active tokens for the parish (admin view).
 */
export async function getParishActiveTokens(): Promise<
  Array<{
    id: string
    type: 'access' | 'refresh'
    client_id: string
    client_name: string
    user_id: string
    user_email: string | null
    scopes: string[]
    created_at: string
    expires_at: string
    last_used_at: string | null
  }>
> {
  const { supabase, parishId } = await createAuthenticatedClientWithPermissions()
  const adminSupabase = createAdminClient()

  // Get active access tokens
  const { data: accessTokens, error: accessError } = await supabase
    .from('oauth_access_tokens')
    .select(`
      id,
      client_id,
      user_id,
      scopes,
      created_at,
      expires_at,
      last_used_at,
      oauth_clients!inner(name)
    `)
    .eq('parish_id', parishId)
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (accessError) handleSupabaseError(accessError, 'fetching', 'access tokens')

  // Get active refresh tokens
  const { data: refreshTokens, error: refreshError } = await supabase
    .from('oauth_refresh_tokens')
    .select(`
      id,
      client_id,
      user_id,
      scopes,
      created_at,
      expires_at,
      oauth_clients!inner(name)
    `)
    .eq('parish_id', parishId)
    .is('revoked_at', null)
    .is('rotated_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  if (refreshError) handleSupabaseError(refreshError, 'fetching', 'refresh tokens')

  // Get user emails
  const allUserIds = [
    ...new Set([
      ...(accessTokens || []).map((t) => t.user_id),
      ...(refreshTokens || []).map((t) => t.user_id),
    ]),
  ]

  const userEmails: Record<string, string | null> = {}
  await Promise.all(
    allUserIds.map(async (userId) => {
      const { data: user } = await adminSupabase.auth.admin.getUserById(userId)
      userEmails[userId] = user?.user?.email ?? null
    })
  )

  // Combine and format
  const tokens = [
    ...(accessTokens || []).map((t) => ({
      id: t.id,
      type: 'access' as const,
      client_id: t.client_id,
      client_name: (t.oauth_clients as unknown as { name: string }).name,
      user_id: t.user_id,
      user_email: userEmails[t.user_id],
      scopes: t.scopes as string[],
      created_at: t.created_at,
      expires_at: t.expires_at,
      last_used_at: t.last_used_at,
    })),
    ...(refreshTokens || []).map((t) => ({
      id: t.id,
      type: 'refresh' as const,
      client_id: t.client_id,
      client_name: (t.oauth_clients as unknown as { name: string }).name,
      user_id: t.user_id,
      user_email: userEmails[t.user_id],
      scopes: t.scopes as string[],
      created_at: t.created_at,
      expires_at: t.expires_at,
      last_used_at: null,
    })),
  ]

  return tokens.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

/**
 * Admin revoke a specific token.
 */
export async function adminRevokeToken(
  tokenId: string,
  tokenType: 'access' | 'refresh'
): Promise<void> {
  const { supabase, parishId } = await createAuthenticatedClientWithPermissions()

  const table = tokenType === 'access' ? 'oauth_access_tokens' : 'oauth_refresh_tokens'

  const { error } = await supabase
    .from(table)
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', tokenId)
    .eq('parish_id', parishId)

  if (error) handleSupabaseError(error, 'revoking', 'token')

  revalidateEntity('settings/parish/oauth-settings')
}

/**
 * Admin revoke all tokens for a user.
 */
export async function adminRevokeUserTokens(userId: string): Promise<void> {
  const { supabase, parishId } = await createAuthenticatedClientWithPermissions()

  // Revoke access tokens
  await supabase
    .from('oauth_access_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('parish_id', parishId)
    .is('revoked_at', null)

  // Revoke refresh tokens
  await supabase
    .from('oauth_refresh_tokens')
    .update({ revoked_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('parish_id', parishId)
    .is('revoked_at', null)

  revalidateEntity('settings/parish/oauth-settings')
}
