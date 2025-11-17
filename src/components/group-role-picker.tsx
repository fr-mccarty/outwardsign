'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { UserCog } from 'lucide-react'
import { getGroupRolesPaginated, createGroupRole, updateGroupRole, type GroupRole } from '@/lib/actions/group-roles'
import { toast } from 'sonner'
import { CorePicker } from '@/components/core-picker'
import { PickerFieldConfig } from '@/types/core-picker'
import { isFieldVisible as checkFieldVisible, isFieldRequired as checkFieldRequired } from '@/types/picker'

interface GroupRolePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (role: GroupRole) => void
  placeholder?: string
  emptyMessage?: string
  selectedRoleId?: string
  className?: string
  visibleFields?: string[] // Optional fields to show: 'description', 'note', 'is_active', 'display_order'
  requiredFields?: string[] // Fields that should be marked as required
  autoOpenCreateForm?: boolean
  defaultCreateFormData?: Record<string, any>
  editMode?: boolean // Open directly to edit form
  roleToEdit?: GroupRole | null // Group role being edited
}

// Default visible fields - defined outside component to prevent re-creation
// Note: is_active and display_order are hidden and auto-managed
const DEFAULT_VISIBLE_FIELDS = ['description', 'note']

// Empty object constant to prevent re-creation on every render
const EMPTY_FORM_DATA = {}

export function GroupRolePicker({
  open,
  onOpenChange,
  onSelect,
  placeholder = 'Search for a group role...',
  emptyMessage = 'No group roles found.',
  selectedRoleId,

  visibleFields,
  requiredFields,
  autoOpenCreateForm = false,
  defaultCreateFormData,
  editMode = false,
  roleToEdit = null,
}: GroupRolePickerProps) {
  const [roles, setRoles] = useState<GroupRole[]>([])
  const [loading, setLoading] = useState(false)

  // Memoize helper functions to prevent unnecessary re-renders
  const isFieldVisible = useCallback(
    (fieldName: string) => checkFieldVisible(fieldName, visibleFields, DEFAULT_VISIBLE_FIELDS),
    [visibleFields]
  )
  const isFieldRequired = useCallback(
    (fieldName: string) => checkFieldRequired(fieldName, requiredFields),
    [requiredFields]
  )

  // Load all roles when dialog opens
  useEffect(() => {
    if (open) {
      loadRoles()
    }
  }, [open])

  const loadRoles = async () => {
    try {
      setLoading(true)
      // Fetch all group roles with a large limit
      const result = await getGroupRolesPaginated({
        page: 1,
        limit: 1000,
        search: '',
      })
      setRoles(result.items)
    } catch (error) {
      console.error('Error loading group roles:', error)
      toast.error('Failed to load group roles')
    } finally {
      setLoading(false)
    }
  }

  const selectedRole = selectedRoleId
    ? roles.find((r) => r.id === selectedRoleId)
    : null

  // Build create fields configuration dynamically - memoized to prevent infinite re-renders
  const createFields: PickerFieldConfig[] = useMemo(() => {
    const fields: PickerFieldConfig[] = [
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'Leader',
        validation: z.string().min(1, 'Group role name is required'),
      },
    ]

    if (isFieldVisible('description')) {
      fields.push({
        key: 'description',
        label: 'Description',
        type: 'text',
        required: isFieldRequired('description'),
        placeholder: 'Leads and coordinates the group',
      })
    }

    if (isFieldVisible('note')) {
      fields.push({
        key: 'note',
        label: 'Note',
        type: 'textarea',
        required: isFieldRequired('note'),
        placeholder: 'Additional notes...',
      })
    }

    if (isFieldVisible('is_active')) {
      fields.push({
        key: 'is_active',
        label: 'Active',
        type: 'checkbox',
        required: isFieldRequired('is_active'),
      })
    }

    if (isFieldVisible('display_order')) {
      fields.push({
        key: 'display_order',
        label: 'Display Order',
        type: 'number',
        required: isFieldRequired('display_order'),
        placeholder: '1',
      })
    }

    return fields
  }, [isFieldVisible, isFieldRequired])

  // Handle creating a new group role
  const handleCreateRole = async (data: any): Promise<GroupRole> => {
    // Calculate next display_order (max + 1)
    const maxDisplayOrder = roles.reduce((max, role) => {
      return role.display_order && role.display_order > max ? role.display_order : max
    }, 0)
    const nextDisplayOrder = maxDisplayOrder + 1

    const newRole = await createGroupRole({
      name: data.name,
      description: data.description || undefined,
      note: data.note || undefined,
      is_active: true, // Always active when created
      display_order: nextDisplayOrder,
    })

    // Add to local list
    setRoles((prev) => [newRole, ...prev])

    return newRole
  }

  // Handle updating an existing group role
  const handleUpdateRole = async (id: string, data: any): Promise<GroupRole> => {
    const updatedRole = await updateGroupRole(id, {
      name: data.name,
      description: data.description || undefined,
      note: data.note || undefined,
      is_active: data.is_active !== undefined ? data.is_active : undefined,
      display_order: data.display_order ? parseInt(data.display_order) : undefined,
    })

    // Update local list
    setRoles((prev) =>
      prev.map(r => r.id === updatedRole.id ? updatedRole : r)
    )

    return updatedRole
  }

  // Custom render for group role list items
  const renderRoleItem = (role: GroupRole) => {
    const isSelected = selectedRoleId === role.id

    return (
      <div className="flex items-center gap-3">
        <UserCog className="h-5 w-5 text-muted-foreground" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{role.name}</span>
            {isSelected && (
              <Badge variant="secondary" className="text-xs">
                Selected
              </Badge>
            )}
            {!role.is_active && (
              <Badge variant="outline" className="text-xs">
                Inactive
              </Badge>
            )}
          </div>

          {role.description && (
            <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
              {role.description}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <CorePicker<GroupRole>
      open={open}
      onOpenChange={onOpenChange}
      items={roles}
      selectedItem={selectedRole}
      onSelect={onSelect}
      title="Select Group Role"
      searchPlaceholder={placeholder}
      searchFields={['name', 'description']}
      getItemLabel={(role) => role.name}
      getItemId={(role) => role.id}
      renderItem={renderRoleItem}
      enableCreate={true}
      createFields={createFields}
      onCreateSubmit={handleCreateRole}
      createButtonLabel="Save Group Role"
      addNewButtonLabel="Add New Group Role"
      emptyMessage={emptyMessage}
      noResultsMessage="No group roles match your search"
      isLoading={loading}
      autoOpenCreateForm={autoOpenCreateForm}
      defaultCreateFormData={defaultCreateFormData || EMPTY_FORM_DATA}
      editMode={editMode}
      entityToEdit={roleToEdit}
      onUpdateSubmit={handleUpdateRole}
      updateButtonLabel="Update Group Role"
      enablePagination={false}
    />
  )
}

// Hook to use the group role picker
export function useGroupRolePicker() {
  const [open, setOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<GroupRole | null>(null)

  const openPicker = () => setOpen(true)
  const closePicker = () => setOpen(false)

  const handleSelect = (role: GroupRole) => {
    setSelectedRole(role)
    setOpen(false)
  }

  const clearSelection = () => {
    setSelectedRole(null)
  }

  return {
    open,
    openPicker,
    closePicker,
    selectedRole,
    handleSelect,
    clearSelection,
    setOpen,
  }
}
