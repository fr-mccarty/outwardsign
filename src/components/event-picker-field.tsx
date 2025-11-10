'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { EventPicker } from '@/components/event-picker'
import { X, Calendar } from 'lucide-react'
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
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {value ? (
        <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
          <span className="text-sm leading-tight">{formatEventDateTime(value)}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onValueChange(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => onShowPickerChange(true)}
          className="w-full justify-start"
        >
          <Calendar className="h-4 w-4 mr-2" />
          {placeholder}
        </Button>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {/* Event Picker Modal */}
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
    </div>
  )
}
