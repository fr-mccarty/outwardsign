/**
 * MCP Server Authentication
 *
 * Handles API key validation and context management.
 */

import bcrypt from 'bcryptjs'
import { getSupabaseClient } from './db.js'

export interface MCPContext {
  parishId: string
  userId: string
  userEmail: string | null
  scopes: string[]
  apiKeyId: string
}

/**
 * Validates an API key and returns the context if valid.
 */
export async function validateApiKey(apiKey: string): Promise<MCPContext | null> {
  if (!apiKey || !apiKey.startsWith('os_')) {
    return null
  }

  // Extract prefix for lookup (first 12 chars)
  const keyPrefix = apiKey.substring(0, 12)

  const supabase = getSupabaseClient()

  // Find key by prefix
  const { data: apiKeyRecord, error } = await supabase
    .from('mcp_api_keys')
    .select('*')
    .eq('key_prefix', keyPrefix)
    .eq('is_active', true)
    .is('revoked_at', null)
    .single()

  if (error || !apiKeyRecord) {
    return null
  }

  // Check expiration
  if (apiKeyRecord.expires_at) {
    const expiresAt = new Date(apiKeyRecord.expires_at)
    if (expiresAt < new Date()) {
      return null
    }
  }

  // Verify key hash
  const isValid = await bcrypt.compare(apiKey, apiKeyRecord.key_hash)
  if (!isValid) {
    return null
  }

  // Get user email
  let userEmail: string | null = null

  // Get email from auth.users
  const { data: authUser } = await supabase.auth.admin.getUserById(
    apiKeyRecord.user_id
  )
  if (authUser?.user) {
    userEmail = authUser.user.email || null
  }

  // Update last_used_at and increment use_count
  await supabase
    .from('mcp_api_keys')
    .update({
      last_used_at: new Date().toISOString(),
      use_count: (apiKeyRecord.use_count || 0) + 1,
    })
    .eq('id', apiKeyRecord.id)

  return {
    parishId: apiKeyRecord.parish_id,
    userId: apiKeyRecord.user_id,
    userEmail,
    scopes: apiKeyRecord.scopes || ['read'],
    apiKeyId: apiKeyRecord.id,
  }
}

/**
 * Checks if a context has the required scope.
 */
export function hasScope(context: MCPContext, requiredScope: string): boolean {
  // 'delete' scope implies 'write' and 'read'
  // 'write' scope implies 'read'
  if (context.scopes.includes('delete')) {
    return true
  }
  if (context.scopes.includes('write') && requiredScope !== 'delete') {
    return requiredScope === 'read' || requiredScope === 'write'
  }
  return context.scopes.includes(requiredScope)
}
