'use client'

import { useState, useEffect, useMemo } from 'react'
import { CorePicker } from '@/components/core-picker'
import { getActiveEventTypes, createEventType } from '@/lib/actions/event-types'
import type { EventType } from '@/lib/types'
import type { PickerFieldConfig } from '@/types/core-picker'

interface EventTypePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (eventType: EventType) => void
  selectedId?: string
  openToNew?: boolean
}

export function EventTypePicker({
  open,
  onOpenChange,
  onSelect,
  selectedId,
  openToNew = false,
}: EventTypePickerProps) {
  const [items, setItems] = useState<EventType[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadEventTypes() {
      try {
        setIsLoading(true)
        const eventTypes = await getActiveEventTypes()
        setItems(eventTypes)
      } catch (error) {
        console.error('Failed to load event types:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (open) {
      loadEventTypes()
    }
  }, [open])

  const createFields: PickerFieldConfig[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'e.g., Parish Meeting, Fundraiser, etc.',
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        required: false,
        placeholder: 'Optional description of this event type...',
      },
      {
        key: 'is_active',
        label: 'Active',
        type: 'checkbox',
        required: false,
        description: 'Inactive types will not appear in event creation forms',
      },
    ],
    []
  )

  const handleCreate = async (formData: any): Promise<EventType> => {
    const newEventType = await createEventType({
      name: formData.name as string,
      description: formData.description as string | undefined,
      is_active: formData.is_active !== undefined ? (formData.is_active as boolean) : true,
    })

    // Add to local state
    setItems((prev) => [...prev, newEventType])

    return newEventType
  }

  const selectedEventType = items.find(item => item.id === selectedId) || null

  return (
    <CorePicker<EventType>
      open={open}
      onOpenChange={onOpenChange}
      items={items}
      isLoading={isLoading}
      selectedItem={selectedEventType}
      onSelect={onSelect}
      title="Select Event Type"
      entityName="event type"
      testId="event-type-picker-dialog"
      searchPlaceholder="Search event types..."
      searchFields={['name', 'description']}
      getItemLabel={(eventType) => eventType.name}
      getItemId={(eventType) => eventType.id}
      renderItem={(eventType) => (
        <div>
          <div className="font-medium">{eventType.name}</div>
          {eventType.description && (
            <div className="text-sm text-muted-foreground">{eventType.description}</div>
          )}
        </div>
      )}
      enableCreate={true}
      createFields={createFields}
      onCreateSubmit={handleCreate}
      createButtonLabel="Save Event Type"
      addNewButtonLabel="Add New Event Type"
      autoOpenCreateForm={openToNew}
      emptyMessage="No event types yet. Create one to get started."
      noResultsMessage="No event types match your search"
    />
  )
}
