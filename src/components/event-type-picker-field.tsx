'use client'

import { Tag } from 'lucide-react'
import { EventTypePicker } from '@/components/event-type-picker'
import { PickerField } from '@/components/picker-field'
import type { EventType } from '@/lib/types'

interface EventTypePickerFieldProps {
  label: string
  value: EventType | null
  onValueChange: (eventType: EventType | null) => void
  showPicker: boolean
  onShowPickerChange: (show: boolean) => void
  required?: boolean
  description?: string
  placeholder?: string
  openToNewEventType?: boolean
  error?: string
}

export function EventTypePickerField({
  label,
  value,
  onValueChange,
  showPicker,
  onShowPickerChange,
  required = false,
  description,
  placeholder = "Select an event type...",
  openToNewEventType = false,
  error,
}: EventTypePickerFieldProps) {
  const handleSelect = (eventType: EventType) => {
    onValueChange(eventType)
    onShowPickerChange(false)
  }

  return (
    <PickerField
      label={label}
      value={value}
      onValueChange={onValueChange}
      showPicker={showPicker}
      onShowPickerChange={onShowPickerChange}
      required={required}
      description={description}
      placeholder={placeholder}
      icon={Tag}
      renderValue={(eventType) => eventType.name}
      error={error}
    >
      <EventTypePicker
        open={showPicker}
        onOpenChange={onShowPickerChange}
        onSelect={handleSelect}
        selectedId={value?.id}
        openToNew={openToNewEventType}
      />
    </PickerField>
  )
}
