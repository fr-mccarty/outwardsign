/**
 * Tool Permission Configuration for AI Chat
 *
 * Defines which tools require which permission level.
 * Tools not listed default to 'staff' (available to staff and admin).
 *
 * Permission Levels:
 * - 'staff': Available to staff and admin users
 * - 'admin': Available only to admin users
 *
 * NOTE: Parish settings and user settings are NOT available via chat tools
 * and must be managed through the UI.
 */

export type ToolPermissionLevel = 'staff' | 'admin'

/**
 * Tools that require admin permission to execute.
 * All other tools default to staff permission.
 */
export const ADMIN_ONLY_TOOLS: Set<string> = new Set([
  // Category Tags Management
  'create_category_tag',
  'update_category_tag',
  'delete_category_tag',
  'reorder_category_tags',

  // Custom Lists Management
  'create_custom_list',
  'update_custom_list',
  'delete_custom_list',

  // Custom List Items Management
  'create_custom_list_item',
  'update_custom_list_item',
  'delete_custom_list_item',
  'reorder_custom_list_items',

  // Mass Times Templates Management
  'create_mass_times_template',
  'update_mass_times_template',
  'delete_mass_times_template',

  // Mass Times Template Items Management
  'create_mass_times_template_item',
  'update_mass_times_template_item',
  'delete_mass_times_template_item',

  // Event Presets Management
  'create_event_preset',
  'update_event_preset',
  'delete_event_preset',

  // Group Roles Management
  'create_group_role',
  'update_group_role',
  'delete_group_role',

  // Groups Management (create/delete - update is staff)
  'create_group',
  'delete_group',

  // Locations Management
  'create_location',
  'update_location',
  'delete_location',
])

/**
 * Tools that are explicitly staff-level (staff and admin).
 * Listed here for documentation purposes; unlisted tools also default to staff.
 */
export const STAFF_TOOLS: Set<string> = new Set([
  // People Management
  'list_people',
  'get_person',
  'create_person',
  'update_person',
  'delete_person',

  // Families Management
  'list_families',
  'get_family',
  'create_family',
  'add_family_member',
  'remove_family_member',
  'set_family_primary_contact',
  'delete_family',

  // Groups Management
  'list_groups',
  'get_group',
  'get_person_groups',
  'add_to_group',
  'remove_from_group',
  'update_group_member_role',

  // Events Management
  'list_events',
  'get_calendar_events',
  'delete_event',

  // Masses Management
  'list_masses',
  'get_mass',
  'get_mass_assignments',
  'assign_to_mass',
  'remove_mass_assignment',

  // Mass Intentions (read-only for chat)
  'list_mass_intentions',
  'get_mass_intention',

  // Availability Management
  'get_person_availability',
  'check_availability',
  'add_blackout_date',
  'remove_blackout_date',

  // Content Library
  'list_contents',
  'get_content',
  'search_content',

  // Read-only Settings
  'list_event_types',
  'get_event_type',
  'list_custom_lists',
  'get_custom_list',
  'list_category_tags',
  'list_event_presets',
  'get_mass_templates',

  // Coverage Tools
  'find_mass_assignment_gaps',
  'find_ministry_coverage_needs',

  // Locations (read-only for staff)
  'list_locations',

  // Documentation
  'search_documentation',
])

/**
 * Get the required permission level for a tool.
 *
 * @param toolName - The name of the tool
 * @returns The required permission level ('admin' or 'staff')
 */
export function getToolPermissionLevel(toolName: string): ToolPermissionLevel {
  if (ADMIN_ONLY_TOOLS.has(toolName)) {
    return 'admin'
  }
  return 'staff'
}

/**
 * Check if a user can execute a specific tool based on their roles.
 *
 * @param toolName - The name of the tool
 * @param userRoles - Array of the user's roles
 * @returns true if the user can execute the tool
 */
export function canExecuteTool(toolName: string, userRoles: string[]): boolean {
  const requiredLevel = getToolPermissionLevel(toolName)

  if (requiredLevel === 'admin') {
    return userRoles.includes('admin')
  }

  // Staff level - admin or staff can execute
  return userRoles.includes('admin') || userRoles.includes('staff')
}

/**
 * Filter tools array to only include tools the user can access.
 *
 * @param tools - Array of tool definitions
 * @param userRoles - Array of the user's roles
 * @returns Filtered array of tools the user can access
 */
export function filterToolsByPermission<T extends { name: string }>(
  tools: T[],
  userRoles: string[]
): T[] {
  return tools.filter((tool) => canExecuteTool(tool.name, userRoles))
}

/**
 * Get human-readable description of why a tool is restricted.
 */
export function getToolRestrictionMessage(toolName: string): string {
  if (ADMIN_ONLY_TOOLS.has(toolName)) {
    return `The tool '${toolName}' requires admin permissions. Please contact an administrator or use the Settings UI to make this change.`
  }
  return `You do not have permission to use the tool '${toolName}'.`
}
