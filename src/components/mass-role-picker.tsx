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

  visibleFields,
  requiredFields,
  autoOpenCreateForm = false,
  defaultCreateFormData,
  editMode = false,
  roleToEdit = null,
}: MassRolePickerProps) {
  const [massRoles, setMassRoles] = useState<MassRole[]>([])
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

  // Load mass roles when dialog opens or when page/search changes
  useEffect(() => {
    if (open) {
      loadMassRoles(currentPage, searchQuery)
    }
  }, [open, currentPage, searchQuery])

  const loadMassRoles = async (page: number, search: string) => {
    try {
      setLoading(true)
      const offset = (page - 1) * PAGE_SIZE
      const result = await getMassRolesPaginated({
        offset,
        limit: PAGE_SIZE,
        search,
      })
      setMassRoles(result.items)
      setTotalCount(result.totalCount)
    } catch (error) {
      console.error('Error loading mass roles:', error)
      toast.error('Failed to load mass roles')
    } finally {
      setLoading(false)
    }
  }

  const selectedRole = selectedRoleId
    ? massRoles.find((r) => r.id === selectedRoleId)
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
  const handleCreateMassRole = async (data: any): Promise<MassRole> => {
    const newMassRole = await createMassRole({
      name: data.name,
      description: data.description || undefined,
      note: data.note || undefined,
    })

    // Add to local list
    setMassRoles((prev) => [newMassRole, ...prev])

    return newMassRole
  }

  // Handle updating an existing mass role
  const handleUpdateMassRole = async (id: string, data: any): Promise<MassRole> => {
    const updatedMassRole = await updateMassRole(id, {
      name: data.name,
      description: data.description || undefined,
      note: data.note || undefined,
    })

    // Update local list
    setMassRoles((prev) =>
      prev.map(r => r.id === updatedMassRole.id ? updatedMassRole : r)
    )

    return updatedMassRole
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
  const renderMassRoleItem = (massRole: MassRole) => {
    const isSelected = selectedRoleId === massRole.id

    return (
      <div className="flex items-center gap-3">
        <UserCog className="h-5 w-5 text-muted-foreground" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{massRole.name}</span>
            {isSelected && (
              <Badge variant="secondary" className="text-xs">
                Selected
              </Badge>
            )}
          </div>

          {massRole.description && (
            <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
              {massRole.description}
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
      items={massRoles}
      selectedItem={selectedRole}
      onSelect={onSelect}
      title="Select Mass Role"
      entityName="mass role"
      searchPlaceholder={placeholder}
      searchFields={['name', 'description']}
      getItemLabel={(massRole) => massRole.name}
      getItemId={(massRole) => massRole.id}
      renderItem={renderMassRoleItem}
      enableCreate={true}
      createFields={createFields}
      onCreateSubmit={handleCreateMassRole}
      createButtonLabel="Save Mass Role"
      addNewButtonLabel="Add New Mass Role"
      emptyMessage={emptyMessage}
      noResultsMessage="No mass roles match your search"
      isLoading={loading}
      autoOpenCreateForm={autoOpenCreateForm}
      defaultCreateFormData={defaultCreateFormData || EMPTY_FORM_DATA}
      editMode={editMode}
      entityToEdit={roleToEdit}
      onUpdateSubmit={handleUpdateMassRole}
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
  const [selectedMassRole, setSelectedMassRole] = useState<MassRole | null>(null)

  const openPicker = () => setOpen(true)
  const closePicker = () => setOpen(false)

  const handleSelect = (massRole: MassRole) => {
    setSelectedMassRole(massRole)
    setOpen(false)
  }

  const clearSelection = () => {
    setSelectedMassRole(null)
  }

  return {
    open,
    openPicker,
    closePicker,
    selectedMassRole,
    handleSelect,
    clearSelection,
    setOpen,
  }
}
