'use server'

/**
 * MCP API Key Management Server Actions
 *
 * Server actions for creating, listing, and revoking MCP API keys.
 */

import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import {
  createAuthenticatedClient,
  createAuthenticatedClientWithPermissions,
  handleSupabaseError,
  revalidateEntity,
} from '@/lib/actions/server-action-utils'

// ============================================================================
// TYPES
// ============================================================================

export interface MCPApiKey {
  id: string
  parish_id: string
  user_id: string
  name: string
  key_prefix: string
  scopes: string[]
  last_used_at: string | null
  use_count: number
  expires_at: string | null
  is_active: boolean
  revoked_at: string | null
  created_at: string
}

export interface CreateApiKeyInput {
  name: string
  scopes: ('read' | 'write' | 'delete')[]
  expires_at?: string | null
}

export interface CreateApiKeyResult {
  id: string
  key: string // Full key - only returned once!
  key_prefix: string
  name: string
  scopes: string[]
  expires_at: string | null
}

// ============================================================================
// API KEY GENERATION
// ============================================================================

/**
 * Generate a new MCP API key.
 *
 * IMPORTANT: The full key is only returned once. Store it securely.
 *
 * @returns The new API key with the full key value (shown only once)
 */
export async function createMCPApiKey(
  input: CreateApiKeyInput
): Promise<CreateApiKeyResult> {
  const { supabase, parishId, userId } = await createAuthenticatedClientWithPermissions()

  // Generate secure random key
  const randomPart = randomBytes(24).toString('base64url')
  const fullKey = `os_live_${randomPart}`
  const keyPrefix = fullKey.substring(0, 12)

  // Hash the key for storage (bcrypt with cost factor 12)
  const keyHash = await bcrypt.hash(fullKey, 12)

  // Insert the API key record
  const { data, error } = await supabase
    .from('mcp_api_keys')
    .insert({
      parish_id: parishId,
      user_id: userId,
      name: input.name,
      key_prefix: keyPrefix,
      key_hash: keyHash,
      scopes: input.scopes,
      expires_at: input.expires_at || null,
    })
    .select('id, name, key_prefix, scopes, expires_at')
    .single()

  if (error) handleSupabaseError(error, 'creating', 'API key')

  revalidateEntity('settings/parish/api-keys')

  return {
    id: data.id,
    key: fullKey, // Only time the full key is available!
    key_prefix: data.key_prefix,
    name: data.name,
    scopes: data.scopes,
    expires_at: data.expires_at,
  }
}

// ============================================================================
// API KEY LISTING
// ============================================================================

/**
 * Get all API keys for the current user.
 * Does NOT include the full key (only prefix for display).
 */
export async function getUserApiKeys(): Promise<MCPApiKey[]> {
  const { supabase, parishId } = await createAuthenticatedClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('mcp_api_keys')
    .select('*')
    .eq('user_id', user.id)
    .eq('parish_id', parishId)
    .order('created_at', { ascending: false })

  if (error) handleSupabaseError(error, 'fetching', 'API keys')

  return (data as MCPApiKey[]) || []
}

/**
 * Get a single API key by ID.
 */
export async function getApiKeyById(id: string): Promise<MCPApiKey | null> {
  const { supabase } = await createAuthenticatedClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('mcp_api_keys')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    handleSupabaseError(error, 'fetching', 'API key')
  }

  return data as MCPApiKey
}

// ============================================================================
// API KEY MANAGEMENT
// ============================================================================

/**
 * Revoke an API key. This cannot be undone.
 */
export async function revokeApiKey(id: string): Promise<void> {
  const { supabase } = await createAuthenticatedClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('mcp_api_keys')
    .update({
      is_active: false,
      revoked_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) handleSupabaseError(error, 'revoking', 'API key')

  revalidateEntity('settings/parish/api-keys')
}

/**
 * Update an API key's name or scopes.
 */
export async function updateApiKey(
  id: string,
  updates: { name?: string; scopes?: ('read' | 'write' | 'delete')[] }
): Promise<MCPApiKey> {
  const { supabase } = await createAuthenticatedClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const updateData: Record<string, unknown> = {}
  if (updates.name !== undefined) updateData.name = updates.name
  if (updates.scopes !== undefined) updateData.scopes = updates.scopes

  const { data, error } = await supabase
    .from('mcp_api_keys')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .is('revoked_at', null)
    .select('*')
    .single()

  if (error) handleSupabaseError(error, 'updating', 'API key')

  revalidateEntity('settings/parish/api-keys')

  return data as MCPApiKey
}

/**
 * Delete an API key permanently.
 */
export async function deleteApiKey(id: string): Promise<void> {
  const { supabase } = await createAuthenticatedClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('mcp_api_keys')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) handleSupabaseError(error, 'deleting', 'API key')

  revalidateEntity('settings/parish/api-keys')
}
