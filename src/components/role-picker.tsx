'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { UserCog } from 'lucide-react'
import { getRoles, createRole } from '@/lib/actions/roles'
import type { Role } from '@/lib/types'
import { toast } from 'sonner'
import { CorePicker } from '@/components/core-picker'
import { PickerFieldConfig } from '@/types/core-picker'
import { isFieldVisible as checkFieldVisible, isFieldRequired as checkFieldRequired } from '@/types/picker'

interface RolePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (role: Role) => void
  placeholder?: string
  emptyMessage?: string
  selectedRoleId?: string
  className?: string
  visibleFields?: string[] // Optional fields to show: 'description', 'note'
  requiredFields?: string[] // Fields that should be marked as required
  autoOpenCreateForm?: boolean
  defaultCreateFormData?: Record<string, any>
}

// Default visible fields - defined outside component to prevent re-creation
const DEFAULT_VISIBLE_FIELDS = ['description', 'note']

// Empty object constant to prevent re-creation on every render
const EMPTY_FORM_DATA = {}

export function RolePicker({
  open,
  onOpenChange,
  onSelect,
  placeholder = 'Search for a role...',
  emptyMessage = 'No roles found.',
  selectedRoleId,
  className,
  visibleFields,
  requiredFields,
  autoOpenCreateForm = false,
  defaultCreateFormData,
}: RolePickerProps) {
  const [roles, setRoles] = useState<Role[]>([])
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

  // Load roles when dialog opens
  useEffect(() => {
    if (open) {
      loadRoles()
    }
  }, [open])

  const loadRoles = async () => {
    try {
      setLoading(true)
      const results = await getRoles()
      setRoles(results)
    } catch (error) {
      console.error('Error loading roles:', error)
      toast.error('Failed to load roles')
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
        placeholder: 'Lector',
        validation: z.string().min(1, 'Role name is required'),
      },
    ]

    if (isFieldVisible('description')) {
      fields.push({
        key: 'description',
        label: 'Description',
        type: 'text',
        required: isFieldRequired('description'),
        placeholder: 'Proclaims the Word of God',
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

    return fields
  }, [isFieldVisible, isFieldRequired])

  // Handle creating a new role
  const handleCreateRole = async (data: any): Promise<Role> => {
    const newRole = await createRole({
      name: data.name,
      description: data.description || undefined,
      note: data.note || undefined,
    })

    // Add to local list
    setRoles((prev) => [newRole, ...prev])

    return newRole
  }

  // Custom render for role list items
  const renderRoleItem = (role: Role) => {
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
    <CorePicker<Role>
      open={open}
      onOpenChange={onOpenChange}
      items={roles}
      selectedItem={selectedRole}
      onSelect={onSelect}
      title="Select Role"
      searchPlaceholder={placeholder}
      searchFields={['name', 'description']}
      getItemLabel={(role) => role.name}
      getItemId={(role) => role.id}
      renderItem={renderRoleItem}
      enableCreate={true}
      createFields={createFields}
      onCreateSubmit={handleCreateRole}
      createButtonLabel="Save Role"
      addNewButtonLabel="Add New Role"
      emptyMessage={emptyMessage}
      noResultsMessage="No roles match your search"
      isLoading={loading}
      autoOpenCreateForm={autoOpenCreateForm}
      defaultCreateFormData={defaultCreateFormData || EMPTY_FORM_DATA}
    />
  )
}

// Hook to use the role picker
export function useRolePicker() {
  const [open, setOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const openPicker = () => setOpen(true)
  const closePicker = () => setOpen(false)

  const handleSelect = (role: Role) => {
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
