/**
 * OAuth2 Authorization Server Types
 */

// ============================================================
// SCOPES
// ============================================================

export const OAUTH_SCOPES = ['read', 'write', 'delete', 'profile'] as const
export type OAuthScope = (typeof OAUTH_SCOPES)[number]

export const SCOPE_DESCRIPTIONS: Record<OAuthScope, string> = {
  read: 'View parish data (people, events, masses, groups)',
  write: 'Create and update parish data',
  delete: 'Delete parish data',
  profile: 'Access your user profile information',
}

// ============================================================
// DATABASE TYPES
// ============================================================

export interface OAuthClient {
  id: string
  client_id: string
  client_secret_hash: string
  client_secret_prefix: string
  name: string
  description: string | null
  logo_url: string | null
  redirect_uris: string[]
  allowed_scopes: OAuthScope[]
  is_first_party: boolean
  is_confidential: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface OAuthAuthorizationCode {
  id: string
  code_hash: string
  code_prefix: string
  client_id: string
  user_id: string
  parish_id: string
  redirect_uri: string
  scopes: OAuthScope[]
  state: string | null
  code_challenge: string | null
  code_challenge_method: 'S256' | 'plain' | null
  expires_at: string
  used_at: string | null
  created_at: string
}

export interface OAuthAccessToken {
  id: string
  token_hash: string
  token_prefix: string
  client_id: string
  user_id: string
  parish_id: string
  scopes: OAuthScope[]
  last_used_at: string | null
  use_count: number
  expires_at: string
  revoked_at: string | null
  created_at: string
}

export interface OAuthRefreshToken {
  id: string
  token_hash: string
  token_prefix: string
  access_token_id: string | null
  client_id: string
  user_id: string
  parish_id: string
  scopes: OAuthScope[]
  expires_at: string
  revoked_at: string | null
  created_at: string
  rotated_at: string | null
  replaced_by_id: string | null
}

export interface OAuthUserConsent {
  id: string
  user_id: string
  parish_id: string
  client_id: string
  granted_scopes: OAuthScope[]
  granted_at: string
  revoked_at: string | null
}

export interface OAuthUserPermissions {
  id: string
  user_id: string
  parish_id: string
  oauth_enabled: boolean
  allowed_scopes: OAuthScope[]
  updated_by: string | null
  updated_at: string
  created_at: string
}

// ============================================================
// REQUEST/RESPONSE TYPES
// ============================================================

export interface AuthorizationRequest {
  response_type: 'code'
  client_id: string
  redirect_uri: string
  scope: string // Space-separated scopes
  state?: string
  code_challenge?: string
  code_challenge_method?: 'S256' | 'plain'
}

export interface TokenRequest {
  grant_type: 'authorization_code' | 'refresh_token'
  client_id: string
  client_secret?: string
  code?: string
  redirect_uri?: string
  code_verifier?: string
  refresh_token?: string
  scope?: string
}

export interface TokenResponse {
  access_token: string
  token_type: 'Bearer'
  expires_in: number
  refresh_token?: string
  scope: string
}

export interface TokenErrorResponse {
  error: OAuthError
  error_description?: string
  error_uri?: string
}

export type OAuthError =
  | 'invalid_request'
  | 'invalid_client'
  | 'invalid_grant'
  | 'unauthorized_client'
  | 'unsupported_grant_type'
  | 'invalid_scope'
  | 'access_denied'
  | 'server_error'

export interface UserInfoResponse {
  sub: string // User ID
  email?: string
  name?: string
  parish_id: string
  parish_name?: string
}

// ============================================================
// CONTEXT TYPES
// ============================================================

/**
 * Context returned when validating an OAuth access token
 * Used by API endpoints to check permissions
 */
export interface OAuthContext {
  userId: string
  userEmail: string | null
  parishId: string
  clientId: string
  scopes: OAuthScope[]
  tokenId: string
}

/**
 * Context for the consent screen
 */
export interface ConsentContext {
  client: Pick<OAuthClient, 'client_id' | 'name' | 'description' | 'logo_url'>
  requestedScopes: OAuthScope[]
  allowedScopes: OAuthScope[] // Intersection of client + user permissions
  redirectUri: string
  state: string | null
  codeChallenge: string | null
  codeChallengeMethod: 'S256' | 'plain' | null
}

// ============================================================
// ADMIN TYPES
// ============================================================

export interface OAuthSettingsUpdate {
  oauth_enabled?: boolean
  oauth_default_user_scopes?: OAuthScope[]
}

export interface UserOAuthPermissionsUpdate {
  oauth_enabled?: boolean
  allowed_scopes?: OAuthScope[]
}

// ============================================================
// TOKEN LIFETIMES (in seconds)
// ============================================================

export const TOKEN_LIFETIMES = {
  AUTHORIZATION_CODE: 10 * 60, // 10 minutes
  ACCESS_TOKEN: 60 * 60, // 1 hour
  REFRESH_TOKEN: 30 * 24 * 60 * 60, // 30 days
} as const
