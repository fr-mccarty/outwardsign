'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar, Clock, MapPin, X } from 'lucide-react'
import { getEvents, createEvent } from '@/lib/actions/events'
import type { Event, Location } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { CorePicker } from '@/components/core-picker'
import { PickerFieldConfig } from '@/types/core-picker'
import { LocationPicker } from '@/components/location-picker'
import { isFieldVisible as checkFieldVisible, isFieldRequired as checkFieldRequired } from '@/types/picker'

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
  visibleFields?: string[] // Optional fields to show: 'location', 'note'
  requiredFields?: string[] // Fields that should be marked as required: 'location', 'note'
  autoOpenCreateForm?: boolean // Auto-open the create form when picker opens
  defaultCreateFormData?: Record<string, any> // Default values for the create form (e.g., { name: "Smith-Jones Wedding" })
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

// Default visible fields - defined outside component to prevent re-creation
const DEFAULT_VISIBLE_FIELDS = ['location', 'note']

// Empty object constant to prevent re-creation on every render
const EMPTY_FORM_DATA = {}

export function EventPicker({
  open,
  onOpenChange,
  onSelect,
  placeholder = 'Search for an event...',
  emptyMessage = 'No events found.',
  selectedEventId,
  selectedEvent,
  className,
  defaultEventType = 'EVENT',
  defaultName = '',
  openToNewEvent = false,
  disableSearch = false,
  visibleFields,
  requiredFields,
  autoOpenCreateForm = false,
  defaultCreateFormData,
}: EventPickerProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [showLocationPicker, setShowLocationPicker] = useState(false)

  // Memoize helper functions to prevent unnecessary re-renders
  const isFieldVisible = useCallback(
    (fieldName: string) => checkFieldVisible(fieldName, visibleFields, DEFAULT_VISIBLE_FIELDS),
    [visibleFields]
  )
  const isFieldRequired = useCallback(
    (fieldName: string) => checkFieldRequired(fieldName, requiredFields),
    [requiredFields]
  )

  // Load events when dialog opens
  useEffect(() => {
    if (open) {
      loadEvents()
    }
  }, [open])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const results = await getEvents()
      setEvents(results)
    } catch (error) {
      console.error('Error loading events:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
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

  const currentSelectedEvent = selectedEventId
    ? events.find((evt) => evt.id === selectedEventId)
    : null

  // Build create fields configuration dynamically - memoized to prevent infinite re-renders
  const createFields: PickerFieldConfig[] = useMemo(() => {
    const fields: PickerFieldConfig[] = [
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'Wedding Ceremony',
        validation: z.string().min(1, 'Event name is required'),
      },
      {
        key: 'start_date',
        label: 'Date',
        type: 'date',
        required: true,
        validation: z.string().min(1, 'Date is required'),
      },
      {
        key: 'start_time',
        label: 'Time',
        type: 'time',
        required: true,
        validation: z.string().min(1, 'Time is required'),
      },
      {
        key: 'timezone',
        label: 'Time Zone',
        type: 'select',
        required: true,
        options: [
          { value: 'America/New_York', label: 'Eastern (ET)' },
          { value: 'America/Chicago', label: 'Central (CT)' },
          { value: 'America/Denver', label: 'Mountain (MT)' },
          { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
        ],
        validation: z.string().min(1, 'Timezone is required'),
      },
    ]

    // Add location field if visible (custom field with nested picker)
    if (isFieldVisible('location')) {
      fields.push({
        key: 'location_id',
        label: 'Location',
        type: 'custom',
        required: isFieldRequired('location'),
        render: ({ value, onChange, error }) => (
          <div>
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
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSelectedLocation(null)
                    onChange(null)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setShowLocationPicker(true)
                }}
                className={cn('w-full justify-start', error && 'border-destructive')}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Select Location
              </Button>
            )}
          </div>
        ),
      })
    }

    // Add note field if visible
    if (isFieldVisible('note')) {
      fields.push({
        key: 'note',
        label: 'Note',
        type: 'textarea',
        required: isFieldRequired('note'),
        placeholder: 'Add any notes about this event...',
      })
    }

    return fields
  }, [selectedLocation, isFieldVisible, isFieldRequired])

  // Handle creating a new event
  const handleCreateEvent = async (data: any): Promise<Event> => {
    const newEvent = await createEvent({
      name: data.name,
      event_type: defaultEventType,
      start_date: data.start_date,
      start_time: data.start_time,
      timezone: data.timezone || getDefaultTimezone(),
      location_id: selectedLocation?.id || undefined,
      note: data.note || undefined,
    })

    // Reset location after creation
    setSelectedLocation(null)

    // Add to local list
    setEvents((prev) => [newEvent, ...prev])

    return newEvent
  }

  // Custom render for event list items
  const renderEventItem = (event: Event) => {
    const isSelected = selectedEventId === event.id

    return (
      <div className="flex items-center gap-3">
        <Calendar className="h-5 w-5 text-muted-foreground" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">{event.name}</span>
            {isSelected && (
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
      </div>
    )
  }

  return (
    <>
      <CorePicker<Event>
        open={open}
        onOpenChange={onOpenChange}
        items={events}
        selectedItem={currentSelectedEvent}
        onSelect={onSelect}
        title="Select Event"
        searchPlaceholder={placeholder}
        searchFields={['name', 'event_type', 'start_date']}
        getItemLabel={(event) => event.name}
        getItemId={(event) => event.id}
        renderItem={renderEventItem}
        enableCreate={true}
        createFields={createFields}
        onCreateSubmit={handleCreateEvent}
        createButtonLabel="Save Event"
        addNewButtonLabel="Add New Event"
        emptyMessage={emptyMessage}
        noResultsMessage="No events match your search"
        isLoading={loading}
        autoOpenCreateForm={openToNewEvent || autoOpenCreateForm}
        defaultCreateFormData={defaultCreateFormData || EMPTY_FORM_DATA}
      />

      {/* Nested Location Picker Modal */}
      <LocationPicker
        open={showLocationPicker}
        onOpenChange={setShowLocationPicker}
        onSelect={(location) => {
          setSelectedLocation(location)
          setShowLocationPicker(false)
        }}
        selectedLocationId={selectedLocation?.id}
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
