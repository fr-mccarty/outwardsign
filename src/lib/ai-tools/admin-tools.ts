/**
 * Admin-Only Tool Definitions for AI Chat
 *
 * These tools require admin permission to execute.
 * They allow management of parish settings that would otherwise
 * need to be done through the Settings UI.
 *
 * NOTE: Parish-level settings (name, address, etc.) and user management
 * are NOT exposed as chat tools and must be done through the UI.
 */

import Anthropic from '@anthropic-ai/sdk'

export const adminTools: Anthropic.Tool[] = [
  // ============================================================================
  // CATEGORY TAGS MANAGEMENT (Admin Only)
  // ============================================================================
  {
    name: 'create_category_tag',
    description: 'Create a new category tag for organizing content (readings, prayers, etc.). Admin only.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'The name of the category tag' },
        slug: { type: 'string', description: 'URL-safe slug (auto-generated from name if not provided)' },
        color: { type: 'string', description: 'Optional hex color code for the tag (e.g., #FF5733)' },
        sort_order: { type: 'number', description: 'Display order (auto-assigned if not provided)' },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_category_tag',
    description: 'Update an existing category tag. Admin only.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the category tag to update' },
        name: { type: 'string', description: 'New name for the tag' },
        slug: { type: 'string', description: 'New slug for the tag' },
        color: { type: 'string', description: 'New color for the tag (hex code)' },
        sort_order: { type: 'number', description: 'New display order' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_category_tag',
    description: 'Delete a category tag. Admin only. REQUIRES CONFIRMATION. Cannot delete tags that are assigned to content.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the category tag to delete' },
        confirmed: { type: 'boolean', description: 'Set to true after user explicitly confirms deletion' },
      },
      required: ['id'],
    },
  },
  {
    name: 'reorder_category_tags',
    description: 'Reorder category tags by providing the tag IDs in the desired order. Admin only.',
    input_schema: {
      type: 'object',
      properties: {
        tag_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of tag UUIDs in the desired display order',
        },
      },
      required: ['tag_ids'],
    },
  },

  // ============================================================================
  // CUSTOM LISTS MANAGEMENT (Admin Only)
  // ============================================================================
  {
    name: 'create_custom_list',
    description: 'Create a new custom list (e.g., "Music Selections", "Flower Options"). Admin only.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'The name of the custom list' },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_custom_list',
    description: 'Update an existing custom list name. Admin only.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the custom list to update' },
        name: { type: 'string', description: 'New name for the list' },
      },
      required: ['id', 'name'],
    },
  },
  {
    name: 'delete_custom_list',
    description: 'Delete a custom list. Admin only. REQUIRES CONFIRMATION. Cannot delete lists used by field definitions.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the custom list to delete' },
        confirmed: { type: 'boolean', description: 'Set to true after user explicitly confirms deletion' },
      },
      required: ['id'],
    },
  },

  // ============================================================================
  // CUSTOM LIST ITEMS MANAGEMENT (Admin Only)
  // ============================================================================
  {
    name: 'create_custom_list_item',
    description: 'Add a new item to a custom list. Admin only.',
    input_schema: {
      type: 'object',
      properties: {
        list_id: { type: 'string', description: 'The UUID of the custom list to add the item to' },
        value: { type: 'string', description: 'The value/text of the list item' },
      },
      required: ['list_id', 'value'],
    },
  },
  {
    name: 'update_custom_list_item',
    description: 'Update an existing custom list item. Admin only.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the list item to update' },
        value: { type: 'string', description: 'New value for the list item' },
      },
      required: ['id', 'value'],
    },
  },
  {
    name: 'delete_custom_list_item',
    description: 'Delete a custom list item. Admin only. REQUIRES CONFIRMATION.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the list item to delete' },
        confirmed: { type: 'boolean', description: 'Set to true after user explicitly confirms deletion' },
      },
      required: ['id'],
    },
  },
  {
    name: 'reorder_custom_list_items',
    description: 'Reorder items in a custom list. Admin only.',
    input_schema: {
      type: 'object',
      properties: {
        list_id: { type: 'string', description: 'The UUID of the custom list' },
        item_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of item UUIDs in the desired order',
        },
      },
      required: ['list_id', 'item_ids'],
    },
  },

  // ============================================================================
  // MASS TIMES TEMPLATES MANAGEMENT (Admin Only)
  // ============================================================================
  {
    name: 'create_mass_times_template',
    description: 'Create a new Mass times schedule template. Admin only.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name for the template (e.g., "Regular Sunday Schedule")' },
        description: { type: 'string', description: 'Optional description of the template' },
        day_of_week: {
          type: 'string',
          enum: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'MOVABLE'],
          description: 'Day of week this template applies to (default: SUNDAY)',
        },
        is_active: { type: 'boolean', description: 'Whether the template is active (default: false)' },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_mass_times_template',
    description: 'Update a Mass times schedule template. Admin only.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the template to update' },
        name: { type: 'string', description: 'New name for the template' },
        description: { type: 'string', description: 'New description' },
        day_of_week: {
          type: 'string',
          enum: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'MOVABLE'],
          description: 'New day of week',
        },
        is_active: { type: 'boolean', description: 'Whether the template is active' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_mass_times_template',
    description: 'Delete a Mass times schedule template. Admin only. REQUIRES CONFIRMATION.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the template to delete' },
        confirmed: { type: 'boolean', description: 'Set to true after user explicitly confirms deletion' },
      },
      required: ['id'],
    },
  },

  // ============================================================================
  // GROUP ROLES MANAGEMENT (Admin Only)
  // ============================================================================
  {
    name: 'list_group_roles',
    description: 'List all group/ministry roles (e.g., "Leader", "Coordinator", "Member"). Admin only.',
    input_schema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search term to filter roles by name or description' },
      },
    },
  },
  {
    name: 'create_group_role',
    description: 'Create a new group/ministry role type. Admin only.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the role (e.g., "Leader", "Assistant")' },
        description: { type: 'string', description: 'Description of the role responsibilities' },
        display_order: { type: 'number', description: 'Display order for sorting' },
        is_active: { type: 'boolean', description: 'Whether the role is active (default: true)' },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_group_role',
    description: 'Update a group/ministry role. Admin only.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the role to update' },
        name: { type: 'string', description: 'New name for the role' },
        description: { type: 'string', description: 'New description' },
        display_order: { type: 'number', description: 'New display order' },
        is_active: { type: 'boolean', description: 'Whether the role is active' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_group_role',
    description: 'Delete a group/ministry role. Admin only. REQUIRES CONFIRMATION.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the role to delete' },
        confirmed: { type: 'boolean', description: 'Set to true after user explicitly confirms deletion' },
      },
      required: ['id'],
    },
  },

  // ============================================================================
  // LOCATIONS MANAGEMENT (Admin Only)
  // ============================================================================
  {
    name: 'create_location',
    description: 'Create a new parish location/venue. Admin only.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the location (e.g., "Main Church", "Parish Hall")' },
        description: { type: 'string', description: 'Description of the location' },
        street: { type: 'string', description: 'Street address' },
        city: { type: 'string', description: 'City' },
        state: { type: 'string', description: 'State' },
        country: { type: 'string', description: 'Country' },
        phone_number: { type: 'string', description: 'Contact phone number' },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_location',
    description: 'Update a parish location/venue. Admin only.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the location to update' },
        name: { type: 'string', description: 'New name' },
        description: { type: 'string', description: 'New description' },
        street: { type: 'string', description: 'New street address' },
        city: { type: 'string', description: 'New city' },
        state: { type: 'string', description: 'New state' },
        country: { type: 'string', description: 'New country' },
        phone_number: { type: 'string', description: 'New phone number' },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_location',
    description: 'Delete a parish location/venue. Admin only. REQUIRES CONFIRMATION.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the location to delete' },
        confirmed: { type: 'boolean', description: 'Set to true after user explicitly confirms deletion' },
      },
      required: ['id'],
    },
  },

  // ============================================================================
  // GROUPS MANAGEMENT (Admin Only for Create/Delete)
  // ============================================================================
  {
    name: 'create_group',
    description: 'Create a new group/ministry. Admin only.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the group (e.g., "Lectors", "Altar Servers")' },
        description: { type: 'string', description: 'Description of the group' },
        status: {
          type: 'string',
          enum: ['ACTIVE', 'INACTIVE'],
          description: 'Status of the group (default: ACTIVE)',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_group',
    description: 'Update a group/ministry. Admin only.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the group to update' },
        name: { type: 'string', description: 'New name for the group' },
        description: { type: 'string', description: 'New description' },
        status: {
          type: 'string',
          enum: ['ACTIVE', 'INACTIVE'],
          description: 'New status',
        },
      },
      required: ['id'],
    },
  },
  {
    name: 'delete_group',
    description: 'Delete a group/ministry. Admin only. REQUIRES CONFIRMATION.',
    input_schema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'The UUID of the group to delete' },
        confirmed: { type: 'boolean', description: 'Set to true after user explicitly confirms deletion' },
      },
      required: ['id'],
    },
  },
]
