'use server'

/**
 * Audit Log Server Actions
 *
 * Server actions for querying and managing audit logs.
 * These enable viewing change history and performing rollback operations.
 */

import {
  createAuthenticatedClient,
  handleSupabaseError,
  buildPaginatedResult,
  getPaginationRange,
  DEFAULT_PAGE_SIZE,
  type PaginatedResult,
} from '@/lib/actions/server-action-utils'
import { requireSelectedParish } from '@/lib/auth/parish'
import { getUserParishRole } from '@/lib/auth/permissions'
import { createClient } from '@/lib/supabase/server'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'

// ============================================================================
// TYPES
// ============================================================================

export interface AuditLog {
  id: string
  parish_id: string
  table_name: string
  record_id: string
  operation: 'INSERT' | 'UPDATE' | 'DELETE' | 'RESTORE'
  changes: Record<string, { old: unknown; new: unknown }>
  old_record: Record<string, unknown> | null
  new_record: Record<string, unknown> | null
  user_id: string | null
  user_email: string | null
  source: 'application' | 'ai_chat' | 'mcp' | 'system' | 'migration'
  conversation_id: string | null
  request_id: string | null
  is_restore: boolean
  restored_from_audit_id: string | null
  created_at: string
}

export interface AuditLogFilterParams {
  table_name?: string
  record_id?: string
  user_id?: string
  operation?: 'INSERT' | 'UPDATE' | 'DELETE' | 'RESTORE'
  source?: string
  date_from?: string
  date_to?: string
  offset?: number
  limit?: number
}

export interface AuditLogSummary {
  id: string
  table_name: string
  record_id: string
  operation: 'INSERT' | 'UPDATE' | 'DELETE' | 'RESTORE'
  user_email: string | null
  source: string
  created_at: string
  changed_field_count: number
}

// ============================================================================
// QUERY ACTIONS
// ============================================================================

/**
 * Get audit logs with optional filters.
 * Returns paginated results.
 */
export async function getAuditLogs(
  filters?: AuditLogFilterParams
): Promise<PaginatedResult<AuditLog>> {
  const { supabase, parishId } = await createAuthenticatedClient()

  const { from, to } = getPaginationRange(filters?.offset, filters?.limit)

  let query = supabase
    .from('audit_logs')
    .select('*', { count: 'exact' })
    .eq('parish_id', parishId)

  if (filters?.table_name) {
    query = query.eq('table_name', filters.table_name)
  }
  if (filters?.record_id) {
    query = query.eq('record_id', filters.record_id)
  }
  if (filters?.user_id) {
    query = query.eq('user_id', filters.user_id)
  }
  if (filters?.operation) {
    query = query.eq('operation', filters.operation)
  }
  if (filters?.source) {
    query = query.eq('source', filters.source)
  }
  if (filters?.date_from) {
    query = query.gte('created_at', filters.date_from)
  }
  if (filters?.date_to) {
    query = query.lte('created_at', filters.date_to)
  }

  query = query
    .order('created_at', { ascending: false })
    .range(from, to)

  const { data, error, count } = await query

  if (error) handleSupabaseError(error, 'fetching', 'audit logs')

  return buildPaginatedResult(
    data as AuditLog[],
    count,
    filters?.offset || 0,
    filters?.limit || DEFAULT_PAGE_SIZE
  )
}

/**
 * Get change history for a specific record.
 * Returns all audit log entries for the given table/record.
 */
export async function getRecordHistory(
  tableName: string,
  recordId: string
): Promise<AuditLog[]> {
  const { supabase, parishId } = await createAuthenticatedClient()

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('parish_id', parishId)
    .eq('table_name', tableName)
    .eq('record_id', recordId)
    .order('created_at', { ascending: false })

  if (error) handleSupabaseError(error, 'fetching', 'record history')

  return (data as AuditLog[]) || []
}

/**
 * Get a single audit log entry by ID.
 */
export async function getAuditLogById(auditLogId: string): Promise<AuditLog | null> {
  const { supabase, parishId } = await createAuthenticatedClient()

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('parish_id', parishId)
    .eq('id', auditLogId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    handleSupabaseError(error, 'fetching', 'audit log')
  }

  return data as AuditLog
}

/**
 * Get recent activity for a specific user.
 */
export async function getUserActivity(
  userId: string,
  limit: number = 50
): Promise<AuditLog[]> {
  const { supabase, parishId } = await createAuthenticatedClient()

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('parish_id', parishId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) handleSupabaseError(error, 'fetching', 'user activity')

  return (data as AuditLog[]) || []
}

/**
 * Get recent parish activity (for activity feed).
 * Returns summarized entries without full record snapshots.
 */
export async function getRecentParishActivity(
  limit: number = 50
): Promise<AuditLogSummary[]> {
  const { supabase, parishId } = await createAuthenticatedClient()

  const { data, error } = await supabase
    .from('audit_logs')
    .select('id, table_name, record_id, operation, user_email, source, created_at, changes')
    .eq('parish_id', parishId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) handleSupabaseError(error, 'fetching', 'parish activity')

  // Transform to summary format
  return (data || []).map((entry) => ({
    id: entry.id,
    table_name: entry.table_name,
    record_id: entry.record_id,
    operation: entry.operation as AuditLogSummary['operation'],
    user_email: entry.user_email,
    source: entry.source,
    created_at: entry.created_at,
    changed_field_count: Object.keys(entry.changes || {}).length,
  }))
}

// ============================================================================
// ROLLBACK ACTIONS
// ============================================================================

/**
 * Rollback a record to the state before the specified audit log entry.
 * Only admins can perform rollbacks.
 *
 * @returns The result of the rollback operation
 */
export async function rollbackToAuditLog(
  auditLogId: string
): Promise<{ success: boolean; action: string; message: string }> {
  const parishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Check admin permission
  const userParish = await getUserParishRole(user.id, parishId)
  if (!userParish?.roles.includes('admin')) {
    throw new Error('Only admins can perform rollbacks')
  }

  // Call the rollback function
  const { data, error } = await supabase.rpc('rollback_to_audit_log', {
    p_audit_log_id: auditLogId,
  })

  if (error) handleSupabaseError(error, 'rolling back', 'change')

  const result = data as { action: string; table?: string; record_id?: string }

  return {
    success: true,
    action: result.action,
    message: `Successfully ${result.action} record in ${result.table}`,
  }
}

/**
 * Check if the current user can restore a specific audit log entry.
 * Returns the permission result without performing the action.
 */
export async function canRestoreAuditLog(
  auditLogId: string
): Promise<{ canRestore: boolean; reason?: string }> {
  const parishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { canRestore: false, reason: 'Not authenticated' }
  }

  // Get the audit log entry
  const { data: auditLog, error } = await supabase
    .from('audit_logs')
    .select('user_id, created_at')
    .eq('id', auditLogId)
    .eq('parish_id', parishId)
    .single()

  if (error || !auditLog) {
    return { canRestore: false, reason: 'Audit log not found' }
  }

  // Check admin permission
  const userParish = await getUserParishRole(user.id, parishId)
  if (userParish?.roles.includes('admin')) {
    return { canRestore: true }
  }

  // Staff can restore their own edits within 24 hours
  if (userParish?.roles.includes('staff')) {
    const isOwnChange = auditLog.user_id === user.id
    const createdAt = new Date(auditLog.created_at)
    const hoursSinceChange = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60)

    if (isOwnChange && hoursSinceChange <= 24) {
      return { canRestore: true }
    }

    if (!isOwnChange) {
      return { canRestore: false, reason: 'Can only restore your own changes' }
    }

    return { canRestore: false, reason: 'Can only restore changes made within the last 24 hours' }
  }

  return { canRestore: false, reason: 'Insufficient permissions' }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get available table names that have audit logs.
 * Useful for building filter dropdowns.
 */
export async function getAuditedTableNames(): Promise<string[]> {
  const { supabase, parishId } = await createAuthenticatedClient()

  const { data, error } = await supabase
    .from('audit_logs')
    .select('table_name')
    .eq('parish_id', parishId)
    .limit(1000)

  if (error) handleSupabaseError(error, 'fetching', 'table names')

  // Get unique table names
  const uniqueTables = [...new Set((data || []).map((d) => d.table_name))]
  return uniqueTables.sort()
}

/**
 * Get count of changes by table name for a date range.
 * Useful for activity dashboards.
 */
export async function getChangeCountsByTable(
  dateFrom?: string,
  dateTo?: string
): Promise<Record<string, number>> {
  const { supabase, parishId } = await createAuthenticatedClient()

  let query = supabase
    .from('audit_logs')
    .select('table_name')
    .eq('parish_id', parishId)

  if (dateFrom) {
    query = query.gte('created_at', dateFrom)
  }
  if (dateTo) {
    query = query.lte('created_at', dateTo)
  }

  const { data, error } = await query

  if (error) handleSupabaseError(error, 'fetching', 'change counts')

  // Count by table
  const counts: Record<string, number> = {}
  for (const row of data || []) {
    counts[row.table_name] = (counts[row.table_name] || 0) + 1
  }

  return counts
}
