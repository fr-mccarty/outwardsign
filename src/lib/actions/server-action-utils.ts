/**
 * Server Action Utilities
 *
 * This module provides shared utilities for all server actions to reduce
 * boilerplate and ensure consistent patterns across the codebase.
 *
 * Key utilities:
 * - createAuthenticatedClient(): Handles auth + parish validation + JWT claims
 * - handleSupabaseError(): Standardized error handling with logging
 * - createAuthenticatedClientWithPermissions(): For write operations with permission checks
 * - revalidateEntity(): Standardized path revalidation
 * - buildPaginatedResult(): Consistent pagination response format
 */

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireSelectedParish } from '@/lib/auth/parish'
import { ensureJWTClaims } from '@/lib/auth/jwt-claims'
import { requireEditSharedResources } from '@/lib/auth/permissions'
import { logError } from '@/lib/utils/console'
import type { SupabaseClient } from '@supabase/supabase-js'

// ============================================================================
// TYPES
// ============================================================================

export interface AuthenticatedClient {
  supabase: SupabaseClient
  parishId: string
}

export interface AuthenticatedClientWithUser extends AuthenticatedClient {
  userId: string
}

export interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginationParams {
  offset?: number
  limit?: number
}

// Common pagination params with search - used by most paginated endpoints
export interface PaginatedParams {
  offset?: number
  limit?: number
  search?: string
}

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

/**
 * Creates an authenticated Supabase client with parish validation.
 * This is the standard boilerplate for read operations.
 *
 * Replaces:
 * ```
 * const selectedParishId = await requireSelectedParish()
 * await ensureJWTClaims()
 * const supabase = await createClient()
 * ```
 *
 * @example
 * const { supabase, parishId } = await createAuthenticatedClient()
 */
export async function createAuthenticatedClient(): Promise<AuthenticatedClient> {
  const parishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  return { supabase, parishId }
}

/**
 * Creates an authenticated client with user ID for write operations.
 * Includes permission checking for shared resources.
 *
 * Replaces:
 * ```
 * const selectedParishId = await requireSelectedParish()
 * await ensureJWTClaims()
 * const supabase = await createClient()
 * const { data: { user } } = await supabase.auth.getUser()
 * if (!user) throw new Error('Not authenticated')
 * await requireEditSharedResources(user.id, selectedParishId)
 * ```
 *
 * @example
 * const { supabase, parishId, userId } = await createAuthenticatedClientWithPermissions()
 */
export async function createAuthenticatedClientWithPermissions(): Promise<AuthenticatedClientWithUser> {
  const parishId = await requireSelectedParish()
  await ensureJWTClaims()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  await requireEditSharedResources(user.id, parishId)

  return { supabase, parishId, userId: user.id }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Handles Supabase errors consistently across all server actions.
 * Logs the error and throws a user-friendly message.
 *
 * Replaces:
 * ```
 * if (error) {
 *   logError('Error fetching X: ' + (error instanceof Error ? error.message : JSON.stringify(error)))
 *   throw new Error('Failed to fetch X')
 * }
 * ```
 *
 * @example
 * if (error) handleSupabaseError(error, 'fetching', 'person')
 */
export function handleSupabaseError(
  error: unknown,
  operation: string,
  entityName: string
): never {
  const message = error instanceof Error
    ? error.message
    : JSON.stringify(error)

  logError(`Error ${operation} ${entityName}: ${message}`)
  throw new Error(`Failed to ${operation} ${entityName}`)
}

/**
 * Checks if a Supabase error is a "not found" error (PGRST116).
 * Useful for get-by-id operations that should return null instead of throwing.
 *
 * @example
 * if (error) {
 *   if (isNotFoundError(error)) return null
 *   handleSupabaseError(error, 'fetching', 'person')
 * }
 */
export function isNotFoundError(error: { code?: string }): boolean {
  return error?.code === 'PGRST116'
}

/**
 * Checks if a Supabase error is a unique constraint violation (23505).
 * Useful for handling duplicate entries gracefully.
 *
 * @example
 * if (error) {
 *   if (isUniqueConstraintError(error)) {
 *     throw new Error('This person is already a member of the group')
 *   }
 *   handleSupabaseError(error, 'adding', 'group member')
 * }
 */
export function isUniqueConstraintError(error: { code?: string }): boolean {
  return error?.code === '23505'
}

// ============================================================================
// REVALIDATION HELPERS
// ============================================================================

/**
 * Revalidates entity paths consistently.
 * Handles list page, detail page, and optionally edit page.
 *
 * Replaces:
 * ```
 * revalidatePath('/people')
 * revalidatePath(`/people/${id}`)
 * revalidatePath(`/people/${id}/edit`)
 * ```
 *
 * @example
 * revalidateEntity('people', person.id)
 * revalidateEntity('people', person.id, { includeEdit: true })
 * revalidateEntity('people') // Just list page
 */
export function revalidateEntity(
  entityType: string,
  id?: string,
  options?: { includeEdit?: boolean }
): void {
  revalidatePath(`/${entityType}`)

  if (id) {
    revalidatePath(`/${entityType}/${id}`)

    if (options?.includeEdit) {
      revalidatePath(`/${entityType}/${id}/edit`)
    }
  }
}

// ============================================================================
// PAGINATION HELPERS
// ============================================================================

/**
 * Builds a standardized paginated result object.
 *
 * Replaces:
 * ```
 * const totalCount = count || 0
 * const totalPages = Math.ceil(totalCount / limit)
 * const page = Math.floor(offset / limit) + 1
 * return { items: data || [], totalCount, page, limit, totalPages }
 * ```
 *
 * @example
 * return buildPaginatedResult(data, count, offset, limit)
 */
export function buildPaginatedResult<T>(
  items: T[] | null,
  totalCount: number | null,
  offset: number,
  limit: number
): PaginatedResult<T> {
  const total = totalCount || 0
  const totalPages = Math.ceil(total / limit)
  const page = Math.floor(offset / limit) + 1

  return {
    items: items || [],
    totalCount: total,
    page,
    limit,
    totalPages,
  }
}

/**
 * Default page size for list views.
 * Import this instead of hardcoding 50 or 10 everywhere.
 */
export const DEFAULT_PAGE_SIZE = 50
export const DEFAULT_PICKER_PAGE_SIZE = 10

// ============================================================================
// QUERY HELPERS
// ============================================================================

/**
 * Calculates the range for pagination.
 * Returns { from, to } for use with Supabase .range()
 *
 * @example
 * const { from, to } = getPaginationRange(offset, limit)
 * query = query.range(from, to)
 */
export function getPaginationRange(
  offset: number | undefined,
  limit: number | undefined,
  defaultLimit = DEFAULT_PAGE_SIZE
): { from: number; to: number } {
  const from = offset || 0
  const actualLimit = limit || defaultLimit
  const to = from + actualLimit - 1

  return { from, to }
}

// ============================================================================
// UPDATE HELPERS
// ============================================================================

/**
 * Builds an update object from validated data, excluding undefined values.
 * Converts empty strings to null for optional fields.
 *
 * Replaces:
 * ```
 * const updateData: Record<string, unknown> = {}
 * if (validatedData.first_name !== undefined) updateData.first_name = validatedData.first_name
 * if (validatedData.last_name !== undefined) updateData.last_name = validatedData.last_name
 * // ... repeated for every field
 * ```
 *
 * @example
 * const updateData = buildUpdateData(validatedData)
 */
export function buildUpdateData<T extends Record<string, unknown>>(
  data: T
): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      // Convert empty strings to null for optional fields
      result[key] = value === '' ? null : value
    }
  }

  return result
}
