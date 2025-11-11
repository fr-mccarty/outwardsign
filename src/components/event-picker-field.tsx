'use client'

import { EventPicker } from '@/components/event-picker'
import { PickerField } from '@/components/picker-field'
import { Calendar } from 'lucide-react'
import type { Event } from '@/lib/types'

interface EventPickerFieldProps {
  label: string
  value: Event | null
  onValueChange: (event: Event | null) => void
  showPicker: boolean
  onShowPickerChange: (show: boolean) => void
  description?: string
  placeholder?: string
  required?: boolean
  openToNewEvent?: boolean
  defaultEventType?: string
  defaultName?: string
  disableSearch?: boolean
}

// Helper function to format event date and time
const formatEventDateTime = (event: Event) => {
  const parts: string[] = []

  if (event.start_date) {
    const date = new Date(event.start_date + 'T00:00:00')
    parts.push(date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }))
  }

  if (event.start_time) {
    // Parse time string (HH:MM:SS format)
    const [hours, minutes] = event.start_time.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    parts.push(date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }))
  }

  return parts.length > 0 ? parts.join(' at ') : 'No date/time'
}

export function EventPickerField({
  label,
  value,
  onValueChange,
  showPicker,
  onShowPickerChange,
  description,
  placeholder = 'Select Event',
  required = false,
  openToNewEvent = false,
  defaultEventType,
  defaultName,
  disableSearch = false,
}: EventPickerFieldProps) {
  return (
    <PickerField
      label={label}
      value={value}
      onValueChange={onValueChange}
      showPicker={showPicker}
      onShowPickerChange={onShowPickerChange}
      description={description}
      placeholder={placeholder}
      required={required}
      icon={Calendar}
      renderValue={(event) => (
        <span className="leading-tight">{formatEventDateTime(event)}</span>
      )}
    >
      <EventPicker
        open={showPicker}
        onOpenChange={onShowPickerChange}
        onSelect={onValueChange}
        selectedEventId={value?.id}
        selectedEvent={value}
        openToNewEvent={openToNewEvent}
        defaultEventType={defaultEventType}
        defaultName={defaultName}
        disableSearch={disableSearch}
      />
    </PickerField>
  )
}
