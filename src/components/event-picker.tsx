'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock } from 'lucide-react'
import { getEventsPaginated, createEvent, updateEvent } from '@/lib/actions/events'
import type { Event } from '@/lib/types'
import { toast } from 'sonner'
import { CorePicker } from '@/components/core-picker'
import { EventFormFields } from '@/components/event-form-fields'
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
  editMode?: boolean // Open directly to edit form
  eventToEdit?: Event | null // Event being edited
}

// Helper function to get default timezone
function getDefaultTimezone() {
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
  const usTimezones = ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles']
  // If detected timezone is one of our US timezones, use it
  if (usTimezones.includes(detected)) {
    return detected
  }
  // Default to Central if not detected or not a US timezone
  return 'America/Chicago'
}

// Default visible fields - defined outside component to prevent re-creation
const DEFAULT_VISIBLE_FIELDS = ['location', 'note']

// Default form data with timezone preset to Central Time
const DEFAULT_FORM_DATA = {
  timezone: 'America/Chicago'
}

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
  editMode = false,
  eventToEdit = null,
}: EventPickerProps) {
  const [events, setEvents] = useState<Event[]>([])
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

  // Load events when dialog opens or when page/search changes
  useEffect(() => {
    if (open) {
      loadEvents(currentPage, searchQuery)
    }
  }, [open, currentPage, searchQuery])

  const loadEvents = async (page: number, search: string) => {
    try {
      setLoading(true)
      const result = await getEventsPaginated({
        page,
        limit: PAGE_SIZE,
        search,
      })
      setEvents(result.items)
      setTotalCount(result.totalCount)
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

  // Validation configuration for CorePicker - memoized to prevent infinite re-renders
  const createFields = useMemo(() => {
    const fields = [
      {
        key: 'name',
        label: 'Name',
        type: 'text' as const,
        required: true,
        validation: z.string().min(1, 'Event name is required'),
      },
      {
        key: 'start_date',
        label: 'Date',
        type: 'date' as const,
        required: true,
        validation: z.string().min(1, 'Date is required'),
      },
      {
        key: 'start_time',
        label: 'Time',
        type: 'time' as const,
        required: true,
        validation: z.string().min(1, 'Time is required'),
      },
      {
        key: 'timezone',
        label: 'Time Zone',
        type: 'select' as const,
        required: true,
        validation: z.string().min(1, 'Timezone is required'),
      },
    ]

    // Add location validation if visible and required
    if (isFieldVisible('location') && isFieldRequired('location')) {
      fields.push({
        key: 'location_id',
        label: 'Location',
        type: 'text' as const,
        required: true,
        validation: z.string().min(1, 'Location is required'),
      })
    }

    // Add note validation if required
    if (isFieldVisible('note') && isFieldRequired('note')) {
      fields.push({
        key: 'note',
        label: 'Note',
        type: 'text' as const,
        required: true,
        validation: z.string().min(1, 'Note is required'),
      })
    }

    return fields
  }, [isFieldVisible, isFieldRequired])

  // Memoize merged default form data to prevent form resets on re-render
  const mergedDefaultFormData = useMemo(() => {
    return { ...DEFAULT_FORM_DATA, name: defaultName, ...defaultCreateFormData }
  }, [defaultName, defaultCreateFormData])

  // Handle creating a new event
  const handleCreateEvent = async (data: any): Promise<Event> => {
    const newEvent = await createEvent({
      name: data.name,
      event_type: defaultEventType,
      start_date: data.start_date,
      start_time: data.start_time,
      timezone: data.timezone || getDefaultTimezone(),
      location_id: data.location_id || undefined,
      note: data.note || undefined,
    })

    // Add to local list
    setEvents((prev) => [newEvent, ...prev])

    return newEvent
  }

  // Handle updating an existing event
  const handleUpdateEvent = async (id: string, data: any): Promise<Event> => {
    const updatedEvent = await updateEvent(id, {
      name: data.name,
      event_type: data.event_type || defaultEventType,
      start_date: data.start_date,
      start_time: data.start_time,
      timezone: data.timezone || getDefaultTimezone(),
      location_id: data.location_id || undefined,
      note: data.note || undefined,
    })

    // Update local list
    setEvents((prev) =>
      prev.map(e => e.id === updatedEvent.id ? updatedEvent : e)
    )

    return updatedEvent
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
    <CorePicker<Event>
      open={open}
      onOpenChange={onOpenChange}
      items={events}
      selectedItem={currentSelectedEvent}
      onSelect={onSelect}
      title="Select Event"
      testId="event-picker-dialog"
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
      defaultCreateFormData={mergedDefaultFormData}
      editMode={editMode}
      entityToEdit={eventToEdit}
      onUpdateSubmit={handleUpdateEvent}
      updateButtonLabel="Update Event"
      enablePagination={true}
      totalCount={totalCount}
      currentPage={currentPage}
      pageSize={PAGE_SIZE}
      onPageChange={handlePageChange}
      onSearch={handleSearchChange}
      CustomFormComponent={(props) => (
        <EventFormFields
          {...props}
          visibleFields={visibleFields}
          requiredFields={requiredFields}
        />
      )}
    />
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
