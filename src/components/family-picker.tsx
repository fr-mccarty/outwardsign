'use client'

import { useState, useEffect, useMemo } from 'react'
import { z } from 'zod'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users2 } from 'lucide-react'
import { getAllFamilies, createFamily, updateFamily, type Family } from '@/lib/actions/families'
import { toast } from 'sonner'
import { CorePicker } from '@/components/core-picker'
import { PickerFieldConfig } from '@/types/core-picker'
import { useDebounce } from '@/hooks/use-debounce'
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants'

interface FamilyPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (family: Family) => void
  placeholder?: string
  emptyMessage?: string
  selectedFamilyId?: string
  className?: string
  openToNewFamily?: boolean
  editMode?: boolean
  familyToEdit?: Family | null
}

// Empty object constant to prevent re-creation on every render
const EMPTY_FORM_DATA = {}

export function FamilyPicker({
  open,
  onOpenChange,
  onSelect,
  placeholder = 'Search for a family...',
  emptyMessage = 'No families found.',
  selectedFamilyId,
  className,
  openToNewFamily = false,
  editMode = false,
  familyToEdit = null,
}: FamilyPickerProps) {
  // Note: className prop available for future customization
  void className
  const [families, setFamilies] = useState<Family[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Debounce search
  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS)

  // Load families when dialog opens
  useEffect(() => {
    if (open) {
      loadFamilies()
    }
  }, [open])

  const loadFamilies = async () => {
    try {
      setLoading(true)
      const result = await getAllFamilies()
      // Filter to only show active families in the picker
      setFamilies(result.filter(f => f.active))
    } catch (error) {
      console.error('Error loading families:', error)
      toast.error('Failed to load families')
    } finally {
      setLoading(false)
    }
  }

  // Filter families based on search
  const filteredFamilies = useMemo(() => {
    if (!debouncedSearchQuery) return families
    const searchLower = debouncedSearchQuery.toLowerCase()
    return families.filter(family =>
      family.family_name.toLowerCase().includes(searchLower)
    )
  }, [families, debouncedSearchQuery])

  const getFamilyInitials = (family: Family) => {
    const words = family.family_name.split(' ')
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
    }
    return family.family_name.substring(0, 2).toUpperCase()
  }

  const selectedFamily = selectedFamilyId
    ? families.find((f) => f.id === selectedFamilyId)
    : null

  // Build create fields configuration
  const createFields: PickerFieldConfig[] = useMemo(() => [
    {
      key: 'family_name',
      label: 'Family Name',
      type: 'text',
      required: true,
      placeholder: 'e.g., Smith Family, The Johnsons',
      validation: z.string().min(1, 'Family name is required'),
    },
  ], [])

  // Handle creating a new family
  const handleCreateFamily = async (data: any): Promise<Family> => {
    const newFamily = await createFamily({
      family_name: data.family_name,
      active: true,
    })

    // Add to local list
    setFamilies((prev) => [newFamily, ...prev])

    return newFamily
  }

  // Handle updating an existing family
  const handleUpdateFamily = async (id: string, data: any): Promise<Family> => {
    const updatedFamily = await updateFamily(id, {
      family_name: data.family_name,
    })

    // Update local list
    setFamilies((prev) =>
      prev.map(f => f.id === updatedFamily.id ? updatedFamily : f)
    )

    return updatedFamily
  }

  // Handle search change
  const handleSearchChange = (search: string) => {
    setSearchQuery(search)
  }

  // Custom render for family list items
  const renderFamilyItem = (family: Family) => {
    const isSelected = selectedFamilyId === family.id

    return (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {getFamilyInitials(family)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{family.family_name}</span>
            {isSelected && (
              <Badge variant="secondary" className="text-xs">
                Selected
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users2 className="h-3 w-3" />
              <span>Family</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <CorePicker<Family>
      open={open}
      onOpenChange={onOpenChange}
      items={filteredFamilies}
      selectedItem={selectedFamily}
      onSelect={onSelect}
      title="Select Family"
      entityName="family"
      testId="family-picker-dialog"
      searchPlaceholder={placeholder}
      searchFields={['family_name']}
      getItemLabel={(family) => family.family_name}
      getItemId={(family) => family.id}
      renderItem={renderFamilyItem}
      enableCreate={true}
      createFields={createFields}
      onCreateSubmit={handleCreateFamily}
      createButtonLabel="Save Family"
      addNewButtonLabel="Add New Family"
      emptyMessage={emptyMessage}
      noResultsMessage="No families match your search"
      isLoading={loading}
      autoOpenCreateForm={openToNewFamily}
      defaultCreateFormData={EMPTY_FORM_DATA}
      editMode={editMode}
      entityToEdit={familyToEdit}
      onUpdateSubmit={handleUpdateFamily}
      updateButtonLabel="Update Family"
      onSearch={handleSearchChange}
    />
  )
}
