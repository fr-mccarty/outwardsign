/**
 * Database client for MCP server
 *
 * Uses service role key to bypass RLS, with manual parish_id filtering.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

/**
 * Gets or creates a Supabase admin client.
 * Uses service role key to bypass RLS.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error(
        'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables'
      )
    }

    supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return supabaseClient
}

/**
 * Sets audit context for MCP operations.
 * Call this before any data mutations.
 */
export async function setMCPAuditContext(
  userId: string,
  userEmail?: string
): Promise<void> {
  const supabase = getSupabaseClient()

  await supabase.rpc('set_audit_context', {
    p_user_id: userId,
    p_user_email: userEmail || null,
    p_source: 'mcp',
    p_conversation_id: null,
    p_request_id: null,
  })
}
