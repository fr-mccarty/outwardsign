'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'
import { UserCog } from 'lucide-react'
import { getMassRolesPaginated, createMassRole, updateMassRole } from '@/lib/actions/mass-roles'
import type { MassRole } from '@/lib/types'
import { toast } from 'sonner'
import { CorePicker } from '@/components/core-picker'
import { PickerFieldConfig } from '@/types/core-picker'
import { isFieldVisible as checkFieldVisible, isFieldRequired as checkFieldRequired } from '@/types/picker'

interface MassRolePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (role: MassRole) => void
  placeholder?: string
  emptyMessage?: string
  selectedRoleId?: string
  className?: string
  visibleFields?: string[] // Optional fields to show: 'description', 'note'
  requiredFields?: string[] // Fields that should be marked as required
  autoOpenCreateForm?: boolean
  defaultCreateFormData?: Record<string, any>
  editMode?: boolean // Open directly to edit form
  roleToEdit?: MassRole | null // Mass role being edited
}

// Default visible fields - defined outside component to prevent re-creation
const DEFAULT_VISIBLE_FIELDS = ['description', 'note']

// Empty object constant to prevent re-creation on every render
const EMPTY_FORM_DATA = {}

export function MassRolePicker({
  open,
  onOpenChange,
  onSelect,
  placeholder = 'Search for a mass role...',
  emptyMessage = 'No mass roles found.',
  selectedRoleId,
  className,
  visibleFields,
  requiredFields,
  autoOpenCreateForm = false,
  defaultCreateFormData,
  editMode = false,
  roleToEdit = null,
}: MassRolePickerProps) {
  const [roles, setRoles] = useState<MassRole[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const PAGE_SIZE = 10

  // Memoize helper functions to prevent unnecessary re-renders
  const isFieldVisible = useCallback(
    (fieldName: string) => checkFieldVisible(fieldName, visibleFields, DEFAULT_VISIBLE_FIELDS),
    [visibleFields]
  )
  const isFieldRequired = useCallback(
    (fieldName: string) => checkFieldRequired(fieldName, requiredFields),
    [requiredFields]
  )

  // Load roles when dialog opens or when page/search changes
  useEffect(() => {
    if (open) {
      loadRoles(currentPage, searchQuery)
    }
  }, [open, currentPage, searchQuery])

  const loadRoles = async (page: number, search: string) => {
    try {
      setLoading(true)
      const result = await getMassRolesPaginated({
        page,
        limit: PAGE_SIZE,
        search,
      })
      setRoles(result.items)
      setTotalCount(result.totalCount)
    } catch (error) {
      console.error('Error loading mass roles:', error)
      toast.error('Failed to load mass roles')
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
        validation: z.string().min(1, 'Mass role name is required'),
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

  // Handle creating a new mass role
  const handleCreateRole = async (data: any): Promise<MassRole> => {
    const newRole = await createMassRole({
      name: data.name,
      description: data.description || undefined,
      note: data.note || undefined,
    })

    // Add to local list
    setRoles((prev) => [newRole, ...prev])

    return newRole
  }

  // Handle updating an existing mass role
  const handleUpdateRole = async (id: string, data: any): Promise<MassRole> => {
    const updatedRole = await updateMassRole(id, {
      name: data.name,
      description: data.description || undefined,
      note: data.note || undefined,
    })

    // Update local list
    setRoles((prev) =>
      prev.map(r => r.id === updatedRole.id ? updatedRole : r)
    )

    return updatedRole
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Handle search change
  const handleSearchChange = (search: string) => {
    setSearchQuery(search)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Custom render for mass role list items
  const renderRoleItem = (role: MassRole) => {
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
    <CorePicker<MassRole>
      open={open}
      onOpenChange={onOpenChange}
      items={roles}
      selectedItem={selectedRole}
      onSelect={onSelect}
      title="Select Mass Role"
      searchPlaceholder={placeholder}
      searchFields={['name', 'description']}
      getItemLabel={(role) => role.name}
      getItemId={(role) => role.id}
      renderItem={renderRoleItem}
      enableCreate={true}
      createFields={createFields}
      onCreateSubmit={handleCreateRole}
      createButtonLabel="Save Mass Role"
      addNewButtonLabel="Add New Mass Role"
      emptyMessage={emptyMessage}
      noResultsMessage="No mass roles match your search"
      isLoading={loading}
      autoOpenCreateForm={autoOpenCreateForm}
      defaultCreateFormData={defaultCreateFormData || EMPTY_FORM_DATA}
      editMode={editMode}
      entityToEdit={roleToEdit}
      onUpdateSubmit={handleUpdateRole}
      updateButtonLabel="Update Mass Role"
      enablePagination={true}
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={PAGE_SIZE}
      onPageChange={handlePageChange}
      onSearch={handleSearchChange}
    />
  )
}

// Hook to use the mass role picker
export function useMassRolePicker() {
  const [open, setOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<MassRole | null>(null)

  const openPicker = () => setOpen(true)
  const closePicker = () => setOpen(false)

  const handleSelect = (role: MassRole) => {
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
