'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { z } from 'zod'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'
import { getGroups, createGroup, updateGroup, type Group, type GroupFilters } from '@/lib/actions/groups'
import { toast } from 'sonner'
import { CorePicker } from '@/components/core-picker'
import { PickerFieldConfig } from '@/types/core-picker'
import { useDebounce } from '@/hooks/use-debounce'
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants'

interface GroupPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (group: Group) => void
  placeholder?: string
  emptyMessage?: string
  selectedGroupId?: string
  className?: string
  openToNewGroup?: boolean
  editMode?: boolean
  groupToEdit?: Group | null
}

const EMPTY_FORM_DATA = {}

export function GroupPicker({
  open,
  onOpenChange,
  onSelect,
  placeholder = 'Search for a group...',
  emptyMessage = 'No groups found.',
  selectedGroupId,
  className,
  openToNewGroup = false,
  editMode = false,
  groupToEdit = null,
}: GroupPickerProps) {
  void className
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const PAGE_SIZE = 10

  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS)

  useEffect(() => {
    if (open) {
      loadGroups(currentPage, debouncedSearchQuery)
    }
  }, [open, currentPage, debouncedSearchQuery])

  const loadGroups = async (page: number, search: string) => {
    try {
      setLoading(true)
      const offset = (page - 1) * PAGE_SIZE
      const filters: GroupFilters = {
        offset,
        limit: PAGE_SIZE,
        search,
        status: 'ACTIVE',
      }
      const result = await getGroups(filters)
      setGroups(result)
      // For now, use result length as total (getGroups doesn't return total count)
      setTotalCount(result.length < PAGE_SIZE ? result.length : result.length + 1)
    } catch (error) {
      console.error('Error loading groups:', error)
      toast.error('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  const getGroupInitials = (group: Group) => {
    const words = group.name.split(' ')
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
    }
    return group.name.substring(0, 2).toUpperCase()
  }

  const selectedGroup = selectedGroupId
    ? groups.find((g) => g.id === selectedGroupId)
    : null

  const createFields: PickerFieldConfig[] = useMemo(() => [
    {
      key: 'name',
      label: 'Name',
      type: 'text',
      required: true,
      placeholder: 'RCIA Class 2025',
      validation: z.string().min(1, 'Group name is required'),
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Brief description...',
    },
  ], [])

  const handleCreateGroup = async (data: Record<string, unknown>): Promise<Group> => {
    const newGroup = await createGroup({
      name: data.name as string,
      description: (data.description as string) || undefined,
      is_active: true,
    })

    setGroups((prev) => [newGroup, ...prev])
    return newGroup
  }

  const handleUpdateGroup = async (id: string, data: Record<string, unknown>): Promise<Group> => {
    const updatedGroup = await updateGroup(id, {
      name: data.name as string,
      description: (data.description as string) || undefined,
    })

    setGroups((prev) =>
      prev.map(g => g.id === updatedGroup.id ? updatedGroup : g)
    )

    return updatedGroup
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSearchChange = useCallback((search: string) => {
    setSearchQuery(search)
    setCurrentPage(1)
  }, [])

  const renderGroupItem = (group: Group) => {
    const isSelected = selectedGroupId === group.id

    return (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {getGroupInitials(group)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{group.name}</span>
            {isSelected && (
              <Badge variant="secondary" className="text-xs">
                Selected
              </Badge>
            )}
          </div>

          {group.description && (
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span className="truncate">{group.description}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <CorePicker<Group>
      open={open}
      onOpenChange={onOpenChange}
      items={groups}
      selectedItem={selectedGroup}
      onSelect={onSelect}
      title="Select Group"
      entityName="group"
      testId="group-picker-dialog"
      searchPlaceholder={placeholder}
      searchFields={['name', 'description']}
      getItemLabel={(group) => group.name}
      getItemId={(group) => group.id}
      renderItem={renderGroupItem}
      enableCreate={true}
      createFields={createFields}
      onCreateSubmit={handleCreateGroup}
      createButtonLabel="Save Group"
      addNewButtonLabel="Add New Group"
      emptyMessage={emptyMessage}
      noResultsMessage="No groups match your search"
      isLoading={loading}
      autoOpenCreateForm={openToNewGroup}
      defaultCreateFormData={EMPTY_FORM_DATA}
      editMode={editMode}
      entityToEdit={groupToEdit}
      onUpdateSubmit={handleUpdateGroup}
      updateButtonLabel="Update Group"
      enablePagination={true}
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={PAGE_SIZE}
      onPageChange={handlePageChange}
      onSearch={handleSearchChange}
    />
  )
}
