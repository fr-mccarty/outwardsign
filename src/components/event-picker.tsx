'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Calendar,
  CalendarPlus,
  Clock,
  Save,
  MapPin,
  X
} from 'lucide-react'
import { getEvents, createEvent, updateEvent } from '@/lib/actions/events'
import type { Event, Location } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { LocationPicker } from '@/components/location-picker'
import { FormField } from '@/components/ui/form-field'

// Zod schema for inline "Add New Event" form
const newEventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  event_type: z.string().min(1, 'Event type is required'),
  start_date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Time is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  note: z.string().optional(),
})

type NewEventFormData = z.infer<typeof newEventSchema>

interface EventPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (event: Event) => void
  placeholder?: string
  emptyMessage?: string
  selectedEventId?: string
  selectedEvent?: Event | null
  className?: string
  defaultEventType?: string
  defaultName?: string
  openToNewEvent?: boolean
  disableSearch?: boolean
}

// Custom hook for debounced search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Helper function to get default timezone
function getDefaultTimezone() {
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
  const usTimezones = ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles']
  // If detected timezone is one of our US timezones, use it
  if (usTimezones.includes(detected)) {
    return detected
  }
  // Default to Eastern if not detected or not a US timezone
  return 'America/New_York'
}

export function EventPicker({
  open,
  onOpenChange,
  onSelect,
  placeholder = "Search for an event...",
  emptyMessage = "No events found.",
  selectedEventId,
  selectedEvent,
  className,
  defaultEventType = "EVENT",
  defaultName = "",
  openToNewEvent = false,
  disableSearch = false,
}: EventPickerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [showLocationPicker, setShowLocationPicker] = useState(false)

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<NewEventFormData>({
    resolver: zodResolver(newEventSchema),
    defaultValues: {
      name: defaultName,
      event_type: defaultEventType,
      start_date: '',
      start_time: '',
      timezone: getDefaultTimezone(),
      note: '',
    },
  })

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const searchEventsCallback = useCallback(async (query: string) => {
    try {
      setLoading(true)
      const results = await getEvents(query ? { search: query } : undefined)
      setEvents(results)
    } catch (error) {
      console.error('Error searching events:', error)
      toast.error('Failed to search events')
    } finally {
      setLoading(false)
    }
  }, [])

  // Effect to search when debounced query changes
  useEffect(() => {
    if (open) {
      searchEventsCallback(debouncedSearchQuery)
    }
  }, [debouncedSearchQuery, open, searchEventsCallback])

  // Load initial data when dialog opens
  useEffect(() => {
    if (open && events.length === 0) {
      searchEventsCallback('')
    }
  }, [open, events.length, searchEventsCallback])

  // Update form defaults when they change
  useEffect(() => {
    setValue('name', defaultName)
    setValue('event_type', defaultEventType)
  }, [defaultName, defaultEventType, setValue])

  // Automatically show add form when openToNewEvent is true and dialog opens
  // OR when selectedEvent is provided (edit mode)
  // OR when disableSearch is true (always show form, never search)
  useEffect(() => {
    if (open) {
      if (disableSearch || selectedEvent || openToNewEvent) {
        // Determine if we're editing or creating
        if (selectedEvent) {
          // Edit mode: pre-fill form with selected event
          setIsEditMode(true)
          setEditingEventId(selectedEvent.id)
          reset({
            name: selectedEvent.name,
            event_type: selectedEvent.event_type || defaultEventType,
            start_date: selectedEvent.start_date || '',
            start_time: selectedEvent.start_time || '',
            timezone: (selectedEvent as any).timezone || getDefaultTimezone(),
            note: (selectedEvent as any).note || '',
          })
          // Load location if event has one
          if ((selectedEvent as any).location) {
            setSelectedLocation((selectedEvent as any).location)
          } else {
            setSelectedLocation(null)
          }
        } else {
          // Create new mode
          setIsEditMode(false)
          setEditingEventId(null)
          setSelectedLocation(null)
          reset({
            name: defaultName,
            event_type: defaultEventType,
            start_date: '',
            start_time: '',
            timezone: getDefaultTimezone(),
            note: '',
          })
        }
        setShowAddForm(true)
      } else {
        // Just browsing events
        setIsEditMode(false)
        setEditingEventId(null)
      }
    }
  }, [open, selectedEvent, openToNewEvent, disableSearch, defaultEventType, defaultName, reset])

  const handleEventSelect = (event: Event) => {
    onSelect(event)
    onOpenChange(false)
    setSearchQuery('')
    setShowAddForm(false)
  }

  const handleAddNewEvent = () => {
    setShowAddForm(true)
  }

  const onSubmitNewEvent = async (data: NewEventFormData, e?: React.BaseSyntheticEvent) => {
    // Prevent event from bubbling up to parent forms
    e?.preventDefault()
    e?.stopPropagation()

    try {
      let updatedEvent: Event

      if (isEditMode && editingEventId) {
        // Update existing event
        updatedEvent = await updateEvent(editingEventId, {
          name: data.name,
          event_type: data.event_type,
          start_date: data.start_date,
          start_time: data.start_time,
          timezone: data.timezone,
          location_id: selectedLocation?.id || undefined,
          note: data.note || undefined,
        })
        toast.success('Event updated successfully')
      } else {
        // Create new event
        updatedEvent = await createEvent({
          name: data.name,
          event_type: data.event_type,
          start_date: data.start_date,
          start_time: data.start_time,
          timezone: data.timezone,
          location_id: selectedLocation?.id || undefined,
          note: data.note || undefined,
        })
        toast.success('Event created successfully')
      }

      // Reset form
      reset({
        name: defaultName,
        event_type: defaultEventType,
        start_date: '',
        start_time: '',
        timezone: getDefaultTimezone(),
        note: '',
      })
      setSelectedLocation(null)
      setShowAddForm(false)
      setIsEditMode(false)
      setEditingEventId(null)

      // Select the created/updated event (this will close the picker)
      handleEventSelect(updatedEvent)
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} event:`, error)
      toast.error(`Failed to ${isEditMode ? 'update' : 'add'} event`)
    }
  }

  const handleCancelAddEvent = () => {
    setShowAddForm(false)
    setIsEditMode(false)
    setEditingEventId(null)
    setSelectedLocation(null)
    reset({
      name: defaultName,
      event_type: defaultEventType,
      start_date: '',
      start_time: '',
      timezone: getDefaultTimezone(),
      note: '',
    })
    // If search is disabled, close the entire picker when canceling
    if (disableSearch) {
      onOpenChange(false)
    }
  }

  const formatEventDateTime = (event: Event) => {
    const parts: string[] = []

    if (event.start_date) {
      const date = new Date(event.start_date)
      parts.push(date.toLocaleDateString())
    }

    if (event.start_time) {
      parts.push(event.start_time)
    }

    return parts.join(' at ') || 'No date/time'
  }

  const isEventSelected = (event: Event) => {
    return selectedEventId === event.id
  }

  return (
    <>
      <CommandDialog open={open && !showAddForm && !disableSearch} onOpenChange={onOpenChange}>
        <DialogTitle className="sr-only">Select Event</DialogTitle>
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

          {!loading && events.length === 0 && (
            <CommandEmpty className="py-6 text-center text-sm">
              <div className="flex flex-col items-center gap-2">
                <Calendar className="h-8 w-8 text-muted-foreground" />
                <div>{emptyMessage}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddNewEvent}
                  className="mt-2"
                >
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Add New Event
                </Button>
              </div>
            </CommandEmpty>
          )}

          {!loading && events.length > 0 && (
            <>
              <CommandGroup heading="Events">
                {events.map((event) => (
                  <CommandItem
                    key={event.id}
                    value={`${event.name} ${event.event_type || ''} ${event.start_date || ''}`}
                    onSelect={() => handleEventSelect(event)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 cursor-pointer",
                      isEventSelected(event) && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Calendar className="h-5 w-5 text-muted-foreground" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {event.name}
                        </span>
                        {isEventSelected(event) && (
                          <Badge variant="secondary" className="text-xs">
                            Selected
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatEventDateTime(event)}</span>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup>
                <CommandItem
                  onSelect={handleAddNewEvent}
                  className="flex items-center gap-2 px-3 py-3 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <CalendarPlus className="h-4 w-4" />
                  <span>Add New Event</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>

    {/* New Event Dialog */}
    <Dialog open={showAddForm} onOpenChange={(open) => {
      setShowAddForm(open)
      if (!open) {
        onOpenChange(false)
      }
    }}>
      <DialogContent className="sm:max-w-[425px] max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{isEditMode ? 'Edit Event' : 'Add New Event'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the event details below.' : 'Create a new event. Fill in the details below.'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.stopPropagation()
            handleSubmit(onSubmitNewEvent)(e)
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
                  placeholder="Wedding Ceremony"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="start_date" className="text-right pt-2">
                Date *
              </Label>
              <div className="col-span-3">
                <Input
                  id="start_date"
                  type="date"
                  value={watch('start_date')}
                  onChange={(e) => setValue('start_date', e.target.value)}
                  className={cn(errors.start_date && "border-red-500")}
                />
                {errors.start_date && (
                  <p className="text-sm text-red-500 mt-1">{errors.start_date.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="start_time" className="text-right pt-2">
                Time *
              </Label>
              <div className="col-span-3">
                <Input
                  id="start_time"
                  type="time"
                  value={watch('start_time')}
                  onChange={(e) => setValue('start_time', e.target.value)}
                  className={cn(errors.start_time && "border-red-500")}
                />
                {errors.start_time && (
                  <p className="text-sm text-red-500 mt-1">{errors.start_time.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="timezone" className="text-right pt-2">
                Time Zone *
              </Label>
              <div className="col-span-3">
                <Select
                  value={watch('timezone')}
                  onValueChange={(value) => setValue('timezone', value)}
                >
                  <SelectTrigger id="timezone" className={cn(errors.timezone && "border-red-500")}>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific (PT)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.timezone && (
                  <p className="text-sm text-red-500 mt-1">{errors.timezone.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <div className="col-span-3">
                {selectedLocation ? (
                  <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                    <span className="text-sm">
                      {selectedLocation.name}
                      {selectedLocation.city && `, ${selectedLocation.city}`}
                      {selectedLocation.state && `, ${selectedLocation.state}`}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLocation(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowLocationPicker(true)}
                    className="w-full justify-start"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Select Location
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="note" className="text-right pt-2">
                Note
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="note"
                  value={watch('note') || ''}
                  onChange={(e) => setValue('note', e.target.value)}
                  className={cn(errors.note && "border-red-500")}
                  placeholder="Add any notes about this event..."
                  rows={3}
                />
                {errors.note && (
                  <p className="text-sm text-red-500 mt-1">{errors.note.message}</p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelAddEvent}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2" />
                  {isEditMode ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Update Event' : 'Save Event'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    {/* Location Picker Modal */}
    <LocationPicker
      open={showLocationPicker}
      onOpenChange={setShowLocationPicker}
      onSelect={setSelectedLocation}
      selectedLocationId={selectedLocation?.id}
      openToNewLocation={false}
    />
    </>
  )
}

// Hook to use the event picker
export function useEventPicker() {
  const [open, setOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const openPicker = () => setOpen(true)
  const closePicker = () => setOpen(false)

  const handleSelect = (event: Event) => {
    setSelectedEvent(event)
    setOpen(false)
  }

  const clearSelection = () => {
    setSelectedEvent(null)
  }

  return {
    open,
    openPicker,
    closePicker,
    selectedEvent,
    handleSelect,
    clearSelection,
    setOpen,
  }
}
