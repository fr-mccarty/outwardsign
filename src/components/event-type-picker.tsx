'use client'

import { useState, useEffect, useMemo } from 'react'
import { CorePicker } from '@/components/core-picker'
import { getActiveEventTypes, createEventType } from '@/lib/actions/event-types'
import { getLucideIcon, LUCIDE_ICON_MAP } from '@/lib/utils/lucide-icons'
import type { EventType } from '@/lib/types'
import type { PickerFieldConfig } from '@/types/core-picker'

// Generate icon options from the LUCIDE_ICON_MAP
const EVENT_TYPE_ICONS = Object.keys(LUCIDE_ICON_MAP).map((iconName) => ({
  value: iconName,
  label: iconName.replace(/([A-Z])/g, ' $1').trim(), // Convert camelCase to spaces
}))

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
        key: 'icon',
        label: 'Icon',
        type: 'select',
        required: true,
        options: EVENT_TYPE_ICONS,
        description: 'Icon to display for this event type',
      },
      {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        required: false,
        placeholder: 'Optional description of this event type...',
      },
    ],
    []
  )

  const handleCreate = async (formData: any): Promise<EventType> => {
    const newEventType = await createEventType({
      name: formData.name as string,
      icon: formData.icon as string,
      description: formData.description as string | undefined,
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
      renderItem={(eventType) => {
        const Icon = eventType.icon ? getLucideIcon(eventType.icon) : null
        return (
          <div className="flex items-start gap-3">
            {Icon && <Icon className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />}
            <div>
              <div className="font-medium">{eventType.name}</div>
              {eventType.description && (
                <div className="text-sm text-muted-foreground">{eventType.description}</div>
              )}
            </div>
          </div>
        )
      }}
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
