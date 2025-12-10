/**
 * Permission Helper Functions (Server-side)
 *
 * Centralized permission checking for role-based access control.
 * For client-side usage, import from '@/lib/auth/permissions-client'.
 */

import { createClient } from '@/lib/supabase/server'
import type { UserParishRole, ModuleName } from './permissions-client'
import {
  AVAILABLE_MODULES,
  canAccessModule,
  canManageParishSettings,
  canManageParishioners,
  canInviteParishioners,
  canManageTemplates,
  canEditModule,
} from './permissions-client'

// Re-export types and client-safe functions
export type { ModuleName, UserParishRole } from './permissions-client'
export {
  AVAILABLE_MODULES,
  canAccessModule,
  canManageParishSettings,
  canManageParishioners,
  canInviteParishioners,
  canManageTemplates,
  canEditModule,
}

/**
 * Get user's parish membership with roles and enabled modules
 *
 * @param userId - User ID
 * @param parishId - Parish ID
 * @returns User's parish membership or null if not found
 */
export async function getUserParishRole(
  userId: string,
  parishId: string
): Promise<UserParishRole | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('parish_users')
    .select('roles, enabled_modules')
    .eq('user_id', userId)
    .eq('parish_id', parishId)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

/**
 * Require that a user can access a specific module
 * Throws an error if the user doesn't have permission
 *
 * @param userParish - User's parish membership
 * @param moduleName - Module to check access for
 * @throws Error if user cannot access the module
 */
export function requireModuleAccess(
  userParish: UserParishRole | null,
  moduleName: ModuleName
): void {
  if (!userParish) {
    throw new Error('User is not a member of this parish')
  }
  if (!canAccessModule(userParish, moduleName)) {
    throw new Error(`You do not have permission to access ${moduleName}`)
  }
}

/**
 * Check module access and redirect if unauthorized
 * This should be called at the top of every module page.
 * Combines auth, parish, and permission checks in one call.
 *
 * @param moduleName - Module to check access for
 * @returns UserParishRole if authorized, redirects if unauthorized
 */
export async function checkModuleAccess(
  moduleName: ModuleName
): Promise<UserParishRole> {
  const { redirect } = await import('next/navigation')
  const { requireSelectedParish } = await import('@/lib/auth/parish')

  const supabase = await createClient()

  // Check authentication (will redirect to /login if not authenticated)
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Check selected parish (will redirect to /select-parish if none selected)
  const parishId = await requireSelectedParish()

  // Get user's parish role (user is guaranteed to exist after redirect check above)
  const userParish = await getUserParishRole(user!.id, parishId)
  if (!userParish) {
    redirect('/dashboard?error=not_parish_member')
  }

  // Check module access permission (userParish is guaranteed to exist after redirect check above)
  if (!canAccessModule(userParish!, moduleName)) {
    redirect(`/dashboard?error=no_permission&module=${moduleName}`)
  }

  return userParish!
}

/**
 * Check if user can edit shared resources (people, locations, events, readings)
 * Admin, staff, and ministry-leaders can edit. Parishioners cannot.
 *
 * @param userId - User ID
 * @param parishId - Parish ID
 * @throws Error if user doesn't have permission
 */
export async function requireEditSharedResources(userId: string, parishId: string): Promise<void> {
  const userParish = await getUserParishRole(userId, parishId)

  if (!userParish) {
    throw new Error('User is not a member of this parish')
  }

  const { roles } = userParish

  // Admin, staff, and ministry-leaders can edit shared resources
  if (roles.includes('admin') || roles.includes('staff') || roles.includes('ministry-leader')) {
    return
  }

  // Parishioners cannot edit
  throw new Error('You do not have permission to edit shared resources')
}

/**
 * Check if user can manage parish settings (event types, custom lists, scripts)
 * Only admin role can manage parish settings.
 *
 * @param userId - User ID
 * @param parishId - Parish ID
 * @throws Error if user doesn't have permission
 */
export async function requireManageParishSettings(userId: string, parishId: string): Promise<void> {
  const userParish = await getUserParishRole(userId, parishId)

  if (!userParish) {
    throw new Error('User is not a member of this parish')
  }

  const { roles } = userParish

  // Only admin can manage parish settings
  if (roles.includes('admin')) {
    return
  }

  throw new Error('You do not have permission to manage parish settings')
}
