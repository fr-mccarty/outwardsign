/**
 * Permission Helper Functions
 *
 * Centralized permission checking for role-based access control
 */

import { createClient } from '@/lib/supabase/server'

// Available modules that can be enabled/disabled for ministry-leaders
export const AVAILABLE_MODULES = [
  'masses',
  'weddings',
  'funerals',
  'baptisms',
  'presentations',
  'quinceaneras',
  'groups',
  'mass-intentions',
] as const

export type ModuleName = typeof AVAILABLE_MODULES[number]

export interface UserParishRole {
  roles: string[]
  enabled_modules: string[]
}

/**
 * Check if a user can access a specific module
 *
 * Permission hierarchy:
 * - admin: Full access to all modules
 * - staff: Full access to all modules
 * - ministry-leader: Access only to enabled modules (configured per user)
 * - parishioner: No direct module access (only shared content)
 *
 * @param userParish - User's parish membership with roles and enabled_modules
 * @param moduleName - Name of the module to check access for
 * @returns true if user can access the module, false otherwise
 */
export function canAccessModule(
  userParish: UserParishRole,
  moduleName: ModuleName
): boolean {
  const { roles, enabled_modules } = userParish

  // Admin and staff have full access to all modules
  if (roles.includes('admin') || roles.includes('staff')) {
    return true
  }

  // Ministry-leaders can only access their enabled modules
  if (roles.includes('ministry-leader')) {
    return enabled_modules?.includes(moduleName) || false
  }

  // Parishioners have no direct module access
  return false
}

/**
 * Check if a user can manage parish settings
 * Only admins can manage parish settings
 */
export function canManageParishSettings(userParish: UserParishRole): boolean {
  return userParish.roles.includes('admin')
}

/**
 * Check if a user can manage parishioners (invite, remove, update roles)
 * Only admins can manage parishioners
 */
export function canManageParishioners(userParish: UserParishRole): boolean {
  return userParish.roles.includes('admin')
}

/**
 * Check if a user can invite parishioners to the parish
 * Staff and admins can invite parishioners
 */
export function canInviteParishioners(userParish: UserParishRole): boolean {
  return userParish.roles.includes('admin') || userParish.roles.includes('staff')
}

/**
 * Check if a user can manage templates
 * Only admins can manage templates
 */
export function canManageTemplates(userParish: UserParishRole): boolean {
  return userParish.roles.includes('admin')
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
  userParish: UserParishRole,
  moduleName: ModuleName
): void {
  if (!canAccessModule(userParish, moduleName)) {
    throw new Error(`You do not have permission to access ${moduleName}`)
  }
}
