'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { z } from 'zod'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone } from 'lucide-react'
import { getLocationsPaginated, createLocation, updateLocation, type Location } from '@/lib/actions/locations'
import { toast } from 'sonner'
import { CorePicker } from '@/components/core-picker'
import { PickerFieldConfig } from '@/types/core-picker'
import { isFieldVisible as checkFieldVisible, isFieldRequired as checkFieldRequired } from '@/types/picker'
import { useDebounce } from '@/hooks/use-debounce'
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants'

interface LocationPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (location: Location) => void
  placeholder?: string
  emptyMessage?: string
  selectedLocationId?: string
  className?: string
  openToNewLocation?: boolean
  visibleFields?: string[] // Optional fields to show: 'description', 'street', 'city', 'state', 'country', 'phone_number'
  requiredFields?: string[] // Fields that should be marked as required
  editMode?: boolean // Open directly to edit form
  locationToEdit?: Location | null // Location being edited
}

// Default visible fields - defined outside component to prevent re-creation
const DEFAULT_VISIBLE_FIELDS = ['description', 'street', 'city', 'state', 'country', 'phone_number']

// Empty object constant to prevent re-creation on every render
const EMPTY_FORM_DATA = {}

export function LocationPicker({
  open,
  onOpenChange,
  onSelect,
  placeholder = 'Search for a location...',
  emptyMessage = 'No locations found.',
  selectedLocationId,
  className,
  openToNewLocation = false,
  visibleFields,
  requiredFields,
  editMode = false,
  locationToEdit = null,
}: LocationPickerProps) {
  // Note: className prop available for future customization
  void className
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const PAGE_SIZE = 10

  // Debounce search
  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_MS)

  // Memoize helper functions to prevent unnecessary re-renders
  const isFieldVisible = useCallback(
    (fieldName: string) => checkFieldVisible(fieldName, visibleFields, DEFAULT_VISIBLE_FIELDS),
    [visibleFields]
  )
  const isFieldRequired = useCallback(
    (fieldName: string) => checkFieldRequired(fieldName, requiredFields),
    [requiredFields]
  )

  // Load locations when dialog opens or when page/search changes
  useEffect(() => {
    if (open) {
      loadLocations(currentPage, debouncedSearchQuery)
    }
  }, [open, currentPage, debouncedSearchQuery])

  const loadLocations = async (page: number, search: string) => {
    try {
      setLoading(true)
      const offset = (page - 1) * PAGE_SIZE
      const result = await getLocationsPaginated({
        offset,
        limit: PAGE_SIZE,
        search,
      })
      setLocations(result.items)
      setTotalCount(result.totalCount)
    } catch (error) {
      console.error('Error loading locations:', error)
      toast.error('Failed to load locations')
    } finally {
      setLoading(false)
    }
  }

  const getLocationInitials = (location: Location) => {
    const words = location.name.split(' ')
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
    }
    return location.name.substring(0, 2).toUpperCase()
  }

  const getLocationAddress = (location: Location) => {
    const parts = [location.street, location.city, location.state].filter(Boolean)
    return parts.join(', ')
  }

  const selectedLocation = selectedLocationId
    ? locations.find((loc) => loc.id === selectedLocationId)
    : null

  // Build create fields configuration dynamically - memoized to prevent infinite re-renders
  const createFields: PickerFieldConfig[] = useMemo(() => {
    const fields: PickerFieldConfig[] = [
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: "St. Mary's Church",
        validation: z.string().min(1, 'Location name is required'),
      },
    ]

    if (isFieldVisible('description')) {
      fields.push({
        key: 'description',
        label: 'Description',
        type: 'textarea',
        required: isFieldRequired('description'),
        placeholder: 'Brief description...',
      })
    }

    if (isFieldVisible('street')) {
      fields.push({
        key: 'street',
        label: 'Street',
        type: 'text',
        required: isFieldRequired('street'),
        placeholder: '123 Main St',
      })
    }

    if (isFieldVisible('city')) {
      fields.push({
        key: 'city',
        label: 'City',
        type: 'text',
        required: isFieldRequired('city'),
        placeholder: 'Springfield',
      })
    }

    if (isFieldVisible('state')) {
      fields.push({
        key: 'state',
        label: 'State',
        type: 'text',
        required: isFieldRequired('state'),
        placeholder: 'IL',
      })
    }

    if (isFieldVisible('country')) {
      fields.push({
        key: 'country',
        label: 'Country',
        type: 'text',
        required: isFieldRequired('country'),
        placeholder: 'USA',
      })
    }

    if (isFieldVisible('phone_number')) {
      fields.push({
        key: 'phone_number',
        label: 'Phone',
        type: 'tel',
        required: isFieldRequired('phone_number'),
        placeholder: '(555) 123-4567',
      })
    }

    return fields
  }, [isFieldVisible, isFieldRequired])

  // Handle creating a new location
  const handleCreateLocation = async (data: any): Promise<Location> => {
    const newLocation = await createLocation({
      name: data.name,
      description: data.description || undefined,
      street: data.street || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      country: data.country || undefined,
      phone_number: data.phone_number || undefined,
    })

    // Add to local list
    setLocations((prev) => [newLocation, ...prev])

    return newLocation
  }

  // Handle updating an existing location
  const handleUpdateLocation = async (id: string, data: any): Promise<Location> => {
    const updatedLocation = await updateLocation(id, {
      name: data.name,
      description: data.description || undefined,
      street: data.street || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      country: data.country || undefined,
      phone_number: data.phone_number || undefined,
    })

    // Update local list
    setLocations((prev) =>
      prev.map(loc => loc.id === updatedLocation.id ? updatedLocation : loc)
    )

    return updatedLocation
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

  // Custom render for location list items
  const renderLocationItem = (location: Location) => {
    const address = getLocationAddress(location)
    const isSelected = selectedLocationId === location.id

    return (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {getLocationInitials(location)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{location.name}</span>
            {isSelected && (
              <Badge variant="secondary" className="text-xs">
                Selected
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
            {address && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{address}</span>
              </div>
            )}
            {location.phone_number && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{location.phone_number}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <CorePicker<Location>
      open={open}
      onOpenChange={onOpenChange}
      items={locations}
      selectedItem={selectedLocation}
      onSelect={onSelect}
      title="Select Location"
      entityName="location"
      testId="location-picker-dialog"
      searchPlaceholder={placeholder}
      searchFields={['name', 'city', 'state', 'street']}
      getItemLabel={(location) => location.name}
      getItemId={(location) => location.id}
      renderItem={renderLocationItem}
      enableCreate={true}
      createFields={createFields}
      onCreateSubmit={handleCreateLocation}
      createButtonLabel="Save Location"
      addNewButtonLabel="Add New Location"
      emptyMessage={emptyMessage}
      noResultsMessage="No locations match your search"
      isLoading={loading}
      autoOpenCreateForm={openToNewLocation}
      defaultCreateFormData={EMPTY_FORM_DATA}
      editMode={editMode}
      entityToEdit={locationToEdit}
      onUpdateSubmit={handleUpdateLocation}
      updateButtonLabel="Update Location"
      enablePagination={true}
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={PAGE_SIZE}
      onPageChange={handlePageChange}
      onSearch={handleSearchChange}
    />
  )
}
