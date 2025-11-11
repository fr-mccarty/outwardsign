'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDebounce } from '@/hooks/use-debounce'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Building,
  Plus,
  MapPin,
  Phone,
  Save
} from 'lucide-react'
import { getLocations, createLocation } from '@/lib/actions/locations'
import type { Location } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Zod schema for inline "Add New Location" form
const newLocationSchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  description: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  phone_number: z.string().optional(),
})

type NewLocationFormData = z.infer<typeof newLocationSchema>

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
}

export function LocationPicker({
  open,
  onOpenChange,
  onSelect,
  placeholder = "Search for a location...",
  emptyMessage = "No locations found.",
  selectedLocationId,
  className,
  openToNewLocation = false,
  visibleFields,
}: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  // Determine which fields should be visible
  // If visibleFields is not provided, show all optional fields by default
  const defaultVisibleFields = ['description', 'street', 'city', 'state', 'country', 'phone_number']
  const isFieldVisible = (fieldName: string) => {
    if (!visibleFields) {
      // If not specified, show all fields
      return defaultVisibleFields.includes(fieldName)
    }
    return visibleFields.includes(fieldName)
  }

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<NewLocationFormData>({
    resolver: zodResolver(newLocationSchema),
    defaultValues: {
      name: '',
      description: '',
      street: '',
      city: '',
      state: '',
      country: '',
      phone_number: '',
    },
  })

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const searchLocationsCallback = useCallback(async (query: string) => {
    try {
      setLoading(true)
      const results = await getLocations(query ? { search: query } : undefined)
      setLocations(results)
    } catch (error) {
      console.error('Error searching locations:', error)
      toast.error('Failed to search locations')
    } finally {
      setLoading(false)
    }
  }, [])

  // Effect to search when debounced query changes
  useEffect(() => {
    if (open) {
      searchLocationsCallback(debouncedSearchQuery)
    }
  }, [debouncedSearchQuery, open, searchLocationsCallback])

  // Load initial data when dialog opens
  useEffect(() => {
    if (open && locations.length === 0) {
      searchLocationsCallback('')
    }
  }, [open, locations.length, searchLocationsCallback])

  // Auto-open add form when openToNewLocation is true
  useEffect(() => {
    if (open && openToNewLocation) {
      setShowAddForm(true)
    }
  }, [open, openToNewLocation])

  const handleLocationSelect = (location: Location) => {
    onSelect(location)
    onOpenChange(false)
    setSearchQuery('')
    setShowAddForm(false)
  }

  const handleAddNewLocation = () => {
    setShowAddForm(true)
  }

  const onSubmitNewLocation = async (data: NewLocationFormData, e?: React.BaseSyntheticEvent) => {
    // Prevent event from bubbling up to parent forms
    e?.preventDefault()
    e?.stopPropagation()

    try {
      const newLocation = await createLocation({
        name: data.name,
        description: data.description || undefined,
        street: data.street || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        country: data.country || undefined,
        phone_number: data.phone_number || undefined,
      })

      toast.success('Location created successfully')

      // Reset form
      reset()
      setShowAddForm(false)

      // Select the newly created location (this will close the picker)
      handleLocationSelect(newLocation)
    } catch (error) {
      console.error('Error creating location:', error)
      toast.error('Failed to add location')
    }
  }

  const handleCancelAddLocation = () => {
    setShowAddForm(false)
    reset()
  }

  const getLocationInitials = (location: Location) => {
    const words = location.name.split(' ')
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
    }
    return location.name.substring(0, 2).toUpperCase()
  }

  const isLocationSelected = (location: Location) => {
    return selectedLocationId === location.id
  }

  const getLocationAddress = (location: Location) => {
    const parts = [location.street, location.city, location.state].filter(Boolean)
    return parts.join(', ')
  }

  return (
    <>
      <CommandDialog open={open} onOpenChange={onOpenChange}>
        <DialogTitle className="sr-only">Select Location</DialogTitle>
      <Command className={cn("rounded-lg border shadow-md", className)}>
        <div className="flex items-center border-b px-3" onClick={(e) => e.stopPropagation()}>
          <CommandInput
            placeholder={placeholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <CommandList className="max-h-[400px]">
          {loading && (
            <div className="flex items-center justify-center py-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                Searching...
              </div>
            </div>
          )}

          {!loading && locations.length === 0 && (
            <CommandEmpty className="py-6 text-center text-sm">
              <div className="flex flex-col items-center gap-2">
                <Building className="h-8 w-8 text-muted-foreground" />
                <div>{emptyMessage}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddNewLocation}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Location
                </Button>
              </div>
            </CommandEmpty>
          )}

          {!loading && locations.length > 0 && (
            <>
              <CommandGroup heading="Locations">
                {locations.map((location) => {
                  const address = getLocationAddress(location)
                  return (
                    <CommandItem
                      key={location.id}
                      value={`${location.name} ${location.city || ''} ${location.state || ''}`}
                      onSelect={() => handleLocationSelect(location)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 cursor-pointer",
                        isLocationSelected(location) && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getLocationInitials(location)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {location.name}
                          </span>
                          {isLocationSelected(location) && (
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
                    </CommandItem>
                  )
                })}
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup>
                <CommandItem
                  onSelect={handleAddNewLocation}
                  className="flex items-center gap-2 px-3 py-3 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Location</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>

    {/* New Location Dialog */}
    <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Add New Location</DialogTitle>
          <DialogDescription>
            Create a new location record. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.stopPropagation()
            handleSubmit(onSubmitNewLocation)(e)
          }}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="grid gap-4 py-4 overflow-y-auto flex-1 -mx-6 px-6">
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="name" className="text-right pt-2">
                Name *
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  value={watch('name')}
                  onChange={(e) => setValue('name', e.target.value)}
                  className={cn(errors.name && "border-red-500")}
                  placeholder="St. Mary's Church"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>
            </div>
            {isFieldVisible('description') && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={watch('description') || ''}
                  onChange={(e) => setValue('description', e.target.value)}
                  className="col-span-3"
                  placeholder="Brief description..."
                  rows={2}
                />
              </div>
            )}
            {isFieldVisible('street') && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="street" className="text-right">
                  Street
                </Label>
                <Input
                  id="street"
                  value={watch('street') || ''}
                  onChange={(e) => setValue('street', e.target.value)}
                  className="col-span-3"
                  placeholder="123 Main St"
                />
              </div>
            )}
            {isFieldVisible('city') && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="city" className="text-right">
                  City
                </Label>
                <Input
                  id="city"
                  value={watch('city') || ''}
                  onChange={(e) => setValue('city', e.target.value)}
                  className="col-span-3"
                  placeholder="Springfield"
                />
              </div>
            )}
            {isFieldVisible('state') && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="state" className="text-right">
                  State
                </Label>
                <Input
                  id="state"
                  value={watch('state') || ''}
                  onChange={(e) => setValue('state', e.target.value)}
                  className="col-span-3"
                  placeholder="IL"
                />
              </div>
            )}
            {isFieldVisible('country') && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="country" className="text-right">
                  Country
                </Label>
                <Input
                  id="country"
                  value={watch('country') || ''}
                  onChange={(e) => setValue('country', e.target.value)}
                  className="col-span-3"
                  placeholder="USA"
                />
              </div>
            )}
            {isFieldVisible('phone_number') && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone_number" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={watch('phone_number') || ''}
                  onChange={(e) => setValue('phone_number', e.target.value)}
                  className="col-span-3"
                  placeholder="(555) 123-4567"
                />
              </div>
            )}
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelAddLocation}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Location
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
