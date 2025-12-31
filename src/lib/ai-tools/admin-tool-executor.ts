/**
 * Admin Tool Executor for AI Chat
 *
 * Executes admin-only tools for managing parish settings.
 * All functions here require admin role validation before calling.
 */

import { successResponse, errorResponse, confirmationRequired, logAIActivity } from './shared'

// Import server actions
import {
  getCategoryTagById,
  createCategoryTag,
  updateCategoryTag,
  deleteCategoryTag,
  reorderCategoryTags,
} from '@/lib/actions/category-tags'
import {
  getCustomListWithItems,
  createCustomList,
  updateCustomList,
  deleteCustomList,
} from '@/lib/actions/custom-lists'
import {
  createCustomListItem,
  updateCustomListItem,
  deleteCustomListItem,
  reorderCustomListItems,
} from '@/lib/actions/custom-list-items'
import {
  getMassTime,
  createMassTime,
  updateMassTime,
  deleteMassTime,
} from '@/lib/actions/mass-times-templates'
import {
  getGroupRoles,
  getGroupRole,
  createGroupRole,
  updateGroupRole,
  deleteGroupRole,
} from '@/lib/actions/group-roles'
import {
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
} from '@/lib/actions/locations'
import {
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
} from '@/lib/actions/groups'

interface ExecutionContext {
  userId: string
  parishId: string
}

/**
 * Execute an admin-only tool.
 * Permission should be verified before calling this function.
 */
export async function executeAdminTool(
  toolName: string,
  toolInput: Record<string, unknown>,
  context: ExecutionContext
): Promise<string> {
  try {
    switch (toolName) {
      // ============================================================================
      // CATEGORY TAGS
      // ============================================================================
      case 'create_category_tag': {
        const tag = await createCategoryTag({
          name: toolInput.name as string,
          slug: toolInput.slug as string | undefined,
          color: toolInput.color as string | undefined,
          sort_order: toolInput.sort_order as number | undefined,
        })

        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'create',
          entityType: 'category_tag',
          entityId: tag.id,
          entityName: tag.name,
        })

        return successResponse(
          { id: tag.id, name: tag.name, slug: tag.slug, color: tag.color },
          undefined,
          `Successfully created category tag "${tag.name}"`
        )
      }

      case 'update_category_tag': {
        const existingTag = await getCategoryTagById(toolInput.id as string)
        if (!existingTag) {
          return errorResponse('Category tag not found')
        }

        const updateData: Record<string, unknown> = {}
        if (toolInput.name !== undefined) updateData.name = toolInput.name
        if (toolInput.slug !== undefined) updateData.slug = toolInput.slug
        if (toolInput.color !== undefined) updateData.color = toolInput.color
        if (toolInput.sort_order !== undefined) updateData.sort_order = toolInput.sort_order

        const tag = await updateCategoryTag(toolInput.id as string, updateData)

        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'update',
          entityType: 'category_tag',
          entityId: tag.id,
          entityName: tag.name,
        })

        return successResponse(
          { id: tag.id, name: tag.name, slug: tag.slug },
          undefined,
          `Successfully updated category tag "${tag.name}"`
        )
      }

      case 'delete_category_tag': {
        const confirmed = toolInput.confirmed as boolean
        const tagToDelete = await getCategoryTagById(toolInput.id as string)

        if (!tagToDelete) {
          return errorResponse('Category tag not found')
        }

        if (!confirmed) {
          return confirmationRequired(
            'delete_category_tag',
            { id: tagToDelete.id, name: tagToDelete.name, type: 'category_tag' },
            `This will permanently delete the category tag "${tagToDelete.name}". Tags assigned to content must be reassigned first.`
          )
        }

        await deleteCategoryTag(toolInput.id as string)

        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'delete',
          entityType: 'category_tag',
          entityId: tagToDelete.id,
          entityName: tagToDelete.name,
        })

        return successResponse(
          { id: tagToDelete.id, name: tagToDelete.name },
          undefined,
          `Successfully deleted category tag "${tagToDelete.name}"`
        )
      }

      case 'reorder_category_tags': {
        const tagIds = toolInput.tag_ids as string[]
        await reorderCategoryTags(tagIds)

        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'update',
          entityType: 'category_tag',
          entityId: 'bulk',
          entityName: 'Category tags order',
          details: { tagIds },
        })

        return successResponse(
          { reordered_count: tagIds.length },
          undefined,
          `Successfully reordered ${tagIds.length} category tags`
        )
      }

      // ============================================================================
      // CUSTOM LISTS
      // ============================================================================
      case 'create_custom_list': {
        const list = await createCustomList({
          name: toolInput.name as string,
        })

        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'create',
          entityType: 'custom_list',
          entityId: list.id,
          entityName: list.name,
        })

        return successResponse(
          { id: list.id, name: list.name, slug: list.slug },
          undefined,
          `Successfully created custom list "${list.name}"`
        )
      }

      case 'update_custom_list': {
        const existingList = await getCustomListWithItems(toolInput.id as string)
        if (!existingList) {
          return errorResponse('Custom list not found')
        }

        const list = await updateCustomList(toolInput.id as string, {
          name: toolInput.name as string,
        })

        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'update',
          entityType: 'custom_list',
          entityId: list.id,
          entityName: list.name,
        })

        return successResponse(
          { id: list.id, name: list.name, slug: list.slug },
          undefined,
          `Successfully updated custom list to "${list.name}"`
        )
      }

      case 'delete_custom_list': {
        const confirmed = toolInput.confirmed as boolean
        const listToDelete = await getCustomListWithItems(toolInput.id as string)

        if (!listToDelete) {
          return errorResponse('Custom list not found')
        }

        if (!confirmed) {
          return confirmationRequired(
            'delete_custom_list',
            { id: listToDelete.id, name: listToDelete.name, type: 'custom_list' },
            `This will permanently delete the custom list "${listToDelete.name}" and all its ${listToDelete.items?.length || 0} items.`
          )
        }

        await deleteCustomList(toolInput.id as string)

        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'delete',
          entityType: 'custom_list',
          entityId: listToDelete.id,
          entityName: listToDelete.name,
        })

        return successResponse(
          { id: listToDelete.id, name: listToDelete.name },
          undefined,
          `Successfully deleted custom list "${listToDelete.name}"`
        )
      }

      // ============================================================================
      // CUSTOM LIST ITEMS
      // ============================================================================
      case 'create_custom_list_item': {
        const item = await createCustomListItem(toolInput.list_id as string, {
          value: toolInput.value as string,
        })

        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'create',
          entityType: 'custom_list_item',
          entityId: item.id,
          entityName: item.value,
        })

        return successResponse(
          { id: item.id, value: item.value, list_id: item.list_id },
          undefined,
          `Successfully added "${item.value}" to the list`
        )
      }

      case 'update_custom_list_item': {
        const item = await updateCustomListItem(toolInput.id as string, {
          value: toolInput.value as string,
        })

        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'update',
          entityType: 'custom_list_item',
          entityId: item.id,
          entityName: item.value,
        })

        return successResponse(
          { id: item.id, value: item.value },
          undefined,
          `Successfully updated list item to "${item.value}"`
        )
      }

      case 'delete_custom_list_item': {
        const confirmed = toolInput.confirmed as boolean

        if (!confirmed) {
          return confirmationRequired(
            'delete_custom_list_item',
            { id: toolInput.id as string, name: 'list item', type: 'custom_list_item' },
            'This will permanently delete this list item. Events using this value will show empty.'
          )
        }

        await deleteCustomListItem(toolInput.id as string)

        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'delete',
          entityType: 'custom_list_item',
          entityId: toolInput.id as string,
          entityName: 'list item',
        })

        return successResponse(
          { id: toolInput.id },
          undefined,
          'Successfully deleted the list item'
        )
      }

      case 'reorder_custom_list_items': {
        const listId = toolInput.list_id as string
        const itemIds = toolInput.item_ids as string[]
        await reorderCustomListItems(listId, itemIds)

        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'update',
          entityType: 'custom_list_item',
          entityId: 'bulk',
          entityName: 'List items order',
          details: { listId, itemIds },
        })

        return successResponse(
          { reordered_count: itemIds.length },
          undefined,
          `Successfully reordered ${itemIds.length} list items`
        )
      }

      // ============================================================================
      // MASS TIMES TEMPLATES
      // ============================================================================
      case 'create_mass_times_template': {
        const template = await createMassTime({
          name: toolInput.name as string,
          description: toolInput.description as string | undefined,
          day_of_week: toolInput.day_of_week as string | undefined,
          is_active: toolInput.is_active as boolean | undefined,
        })

        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'create',
          entityType: 'mass_times_template',
          entityId: template.id,
          entityName: template.name,
        })

        return successResponse(
          { id: template.id, name: template.name, day_of_week: template.day_of_week, is_active: template.is_active },
          undefined,
          `Successfully created Mass times template "${template.name}"`
        )
      }

      case 'update_mass_times_template': {
        const existingTemplate = await getMassTime(toolInput.id as string)
        if (!existingTemplate) {
          return errorResponse('Mass times template not found')
        }

        const updateData: Record<string, unknown> = {}
        if (toolInput.name !== undefined) updateData.name = toolInput.name
        if (toolInput.description !== undefined) updateData.description = toolInput.description
        if (toolInput.day_of_week !== undefined) updateData.day_of_week = toolInput.day_of_week
        if (toolInput.is_active !== undefined) updateData.is_active = toolInput.is_active

        const template = await updateMassTime(toolInput.id as string, updateData)

        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'update',
          entityType: 'mass_times_template',
          entityId: template.id,
          entityName: template.name,
        })

        return successResponse(
          { id: template.id, name: template.name, is_active: template.is_active },
          undefined,
          `Successfully updated Mass times template "${template.name}"`
        )
      }

      case 'delete_mass_times_template': {
        const confirmed = toolInput.confirmed as boolean
        const templateToDelete = await getMassTime(toolInput.id as string)

        if (!templateToDelete) {
          return errorResponse('Mass times template not found')
        }

        if (!confirmed) {
          return confirmationRequired(
            'delete_mass_times_template',
            { id: templateToDelete.id, name: templateToDelete.name, type: 'mass_times_template' },
            `This will permanently delete the Mass times template "${templateToDelete.name}".`
          )
        }

        await deleteMassTime(toolInput.id as string)

        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'delete',
          entityType: 'mass_times_template',
          entityId: templateToDelete.id,
          entityName: templateToDelete.name,
        })

        return successResponse(
          { id: templateToDelete.id, name: templateToDelete.name },
          undefined,
          `Successfully deleted Mass times template "${templateToDelete.name}"`
        )
      }

      // ============================================================================
      // GROUP ROLES
      // ============================================================================
      case 'list_group_roles': {
        const roles = await getGroupRoles()
        return JSON.stringify({
          success: true,
          count: roles.length,
          roles: roles.map(r => ({
            id: r.id,
            name: r.name,
            description: r.description,
            is_active: r.is_active,
            display_order: r.display_order,
          })),
        })
      }

      case 'create_group_role': {
        const role = await createGroupRole({
          name: toolInput.name as string,
          description: toolInput.description as string | undefined,
          display_order: toolInput.display_order as number | undefined,
          is_active: toolInput.is_active as boolean | undefined,
        })

        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'create',
          entityType: 'group_role',
          entityId: role.id,
          entityName: role.name,
        })

        return successResponse(
          { id: role.id, name: role.name },
          undefined,
          `Successfully created group role "${role.name}"`
        )
      }

      case 'update_group_role': {
        const existingRole = await getGroupRole(toolInput.id as string)
        if (!existingRole) {
          return errorResponse('Group role not found')
        }

        const updateData: Record<string, unknown> = {}
        if (toolInput.name !== undefined) updateData.name = toolInput.name
        if (toolInput.description !== undefined) updateData.description = toolInput.description
        if (toolInput.display_order !== undefined) updateData.display_order = toolInput.display_order
        if (toolInput.is_active !== undefined) updateData.is_active = toolInput.is_active

        const role = await updateGroupRole(toolInput.id as string, updateData)

        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'update',
          entityType: 'group_role',
          entityId: role.id,
          entityName: role.name,
        })

        return successResponse(
          { id: role.id, name: role.name },
          undefined,
          `Successfully updated group role "${role.name}"`
        )
      }

      case 'delete_group_role': {
        const confirmed = toolInput.confirmed as boolean
        const roleToDelete = await getGroupRole(toolInput.id as string)

        if (!roleToDelete) {
          return errorResponse('Group role not found')
        }

        if (!confirmed) {
          return confirmationRequired(
            'delete_group_role',
            { id: roleToDelete.id, name: roleToDelete.name, type: 'group_role' },
            `This will permanently delete the group role "${roleToDelete.name}". Group members with this role will lose their role assignment.`
          )
        }

        await deleteGroupRole(toolInput.id as string)

        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'delete',
          entityType: 'group_role',
          entityId: roleToDelete.id,
          entityName: roleToDelete.name,
        })

        return successResponse(
          { id: roleToDelete.id, name: roleToDelete.name },
          undefined,
          `Successfully deleted group role "${roleToDelete.name}"`
        )
      }

      // ============================================================================
      // LOCATIONS
      // ============================================================================
      case 'create_location': {
        const location = await createLocation({
          name: toolInput.name as string,
          description: toolInput.description as string | undefined,
          street: toolInput.street as string | undefined,
          city: toolInput.city as string | undefined,
          state: toolInput.state as string | undefined,
          country: toolInput.country as string | undefined,
          phone_number: toolInput.phone_number as string | undefined,
        })

        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'create',
          entityType: 'location',
          entityId: location.id,
          entityName: location.name,
        })

        return successResponse(
          { id: location.id, name: location.name },
          undefined,
          `Successfully created location "${location.name}"`
        )
      }

      case 'update_location': {
        const existingLocation = await getLocation(toolInput.id as string)
        if (!existingLocation) {
          return errorResponse('Location not found')
        }

        const updateData: Record<string, unknown> = {}
        if (toolInput.name !== undefined) updateData.name = toolInput.name
        if (toolInput.description !== undefined) updateData.description = toolInput.description
        if (toolInput.street !== undefined) updateData.street = toolInput.street
        if (toolInput.city !== undefined) updateData.city = toolInput.city
        if (toolInput.state !== undefined) updateData.state = toolInput.state
        if (toolInput.country !== undefined) updateData.country = toolInput.country
        if (toolInput.phone_number !== undefined) updateData.phone_number = toolInput.phone_number

        const location = await updateLocation(toolInput.id as string, updateData)

        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'update',
          entityType: 'location',
          entityId: location.id,
          entityName: location.name,
        })

        return successResponse(
          { id: location.id, name: location.name },
          undefined,
          `Successfully updated location "${location.name}"`
        )
      }

      case 'delete_location': {
        const confirmed = toolInput.confirmed as boolean
        const locationToDelete = await getLocation(toolInput.id as string)

        if (!locationToDelete) {
          return errorResponse('Location not found')
        }

        if (!confirmed) {
          return confirmationRequired(
            'delete_location',
            { id: locationToDelete.id, name: locationToDelete.name, type: 'location' },
            `This will permanently delete the location "${locationToDelete.name}". Events using this location will show empty.`
          )
        }

        await deleteLocation(toolInput.id as string)

        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'delete',
          entityType: 'location',
          entityId: locationToDelete.id,
          entityName: locationToDelete.name,
        })

        return successResponse(
          { id: locationToDelete.id, name: locationToDelete.name },
          undefined,
          `Successfully deleted location "${locationToDelete.name}"`
        )
      }

      // ============================================================================
      // GROUPS
      // ============================================================================
      case 'create_group': {
        const group = await createGroup({
          name: toolInput.name as string,
          description: toolInput.description as string | undefined,
          is_active: toolInput.status === 'ACTIVE',
        })

        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'create',
          entityType: 'group',
          entityId: group.id,
          entityName: group.name,
        })

        return successResponse(
          { id: group.id, name: group.name },
          undefined,
          `Successfully created group "${group.name}"`
        )
      }

      case 'update_group': {
        const existingGroup = await getGroup(toolInput.id as string)
        if (!existingGroup) {
          return errorResponse('Group not found')
        }

        const updateData: Record<string, unknown> = {}
        if (toolInput.name !== undefined) updateData.name = toolInput.name
        if (toolInput.description !== undefined) updateData.description = toolInput.description
        if (toolInput.status !== undefined) updateData.is_active = toolInput.status === 'ACTIVE'

        const group = await updateGroup(toolInput.id as string, updateData)

        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'update',
          entityType: 'group',
          entityId: group.id,
          entityName: group.name,
        })

        return successResponse(
          { id: group.id, name: group.name },
          undefined,
          `Successfully updated group "${group.name}"`
        )
      }

      case 'delete_group': {
        const confirmed = toolInput.confirmed as boolean
        const groupToDelete = await getGroup(toolInput.id as string)

        if (!groupToDelete) {
          return errorResponse('Group not found')
        }

        if (!confirmed) {
          const memberCount = groupToDelete.members?.length || 0
          return confirmationRequired(
            'delete_group',
            { id: groupToDelete.id, name: groupToDelete.name, type: 'group' },
            `This will permanently delete the group "${groupToDelete.name}" with ${memberCount} member(s).`
          )
        }

        await deleteGroup(toolInput.id as string)

        await logAIActivity({
          parishId: context.parishId,
          source: 'staff_chat',
          initiatedByUserId: context.userId,
          action: 'delete',
          entityType: 'group',
          entityId: groupToDelete.id,
          entityName: groupToDelete.name,
        })

        return successResponse(
          { id: groupToDelete.id, name: groupToDelete.name },
          undefined,
          `Successfully deleted group "${groupToDelete.name}"`
        )
      }

      default:
        return errorResponse(`Unknown admin tool: ${toolName}`)
    }
  } catch (error) {
    console.error(`Error executing admin tool ${toolName}:`, error)
    return errorResponse(error instanceof Error ? error.message : 'Unknown error occurred')
  }
}
