/**
 * Client-side Permission Helper Functions
 *
 * These functions can be safely imported in client components.
 * They operate on UserParishRole data passed from the server.
 */

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
 * Check if user can edit/delete module records
 * Only admin, staff, and ministry-leaders with module access can edit
 */
export function canEditModule(
  userParish: UserParishRole,
  moduleName: ModuleName
): boolean {
  return canAccessModule(userParish, moduleName)
}
