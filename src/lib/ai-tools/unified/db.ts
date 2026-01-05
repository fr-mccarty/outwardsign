/**
 * Database client for AI Tools
 *
 * Uses service role key to bypass RLS, with manual parish_id filtering.
 * This allows tools to work across all consumers (staff, mcp, etc.)
 */

import { createAdminClient } from '@/lib/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ToolExecutionContext } from './types'

/**
 * Gets a Supabase admin client for tool execution.
 * Uses service role key to bypass RLS.
 * Each tool is responsible for filtering by parish_id.
 */
export function getSupabaseClient(): SupabaseClient {
  return createAdminClient()
}

/**
 * Sets audit context for tool operations.
 * Call this before any data mutations.
 */
export async function setAuditContext(context: ToolExecutionContext): Promise<void> {
  const supabase = getSupabaseClient()

  await supabase.rpc('set_audit_context', {
    p_user_id: context.userId || context.personId,
    p_user_email: context.userEmail || null,
    p_source: context.source,
    p_conversation_id: null,
    p_request_id: null,
  })
}
