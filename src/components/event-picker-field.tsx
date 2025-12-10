'use client'

import { EventPicker } from '@/components/event-picker'
import { PickerField } from '@/components/picker-field'
import { Calendar, ExternalLink } from 'lucide-react'
import type { Event } from '@/lib/types'
import type { RelatedEventType } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ConfirmationDialog } from '@/components/confirmation-dialog'

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
  defaultRelatedEventType?: RelatedEventType
  defaultName?: string
  disableSearch?: boolean
  visibleFields?: string[] // Optional fields to show: 'location', 'note'
  requiredFields?: string[] // Fields that should be marked as required in the picker form
  defaultCreateFormData?: Record<string, any> // Default values for the create form (e.g., { name: "Smith-Jones Wedding" })
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
  defaultRelatedEventType,
  defaultName,
  disableSearch = false,
  visibleFields,
  requiredFields,
  defaultCreateFormData,
}: EventPickerFieldProps) {
  const router = useRouter()
  const [showNavigateConfirm, setShowNavigateConfirm] = useState(false)

  const handleNavigateToEvent = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowNavigateConfirm(true)
  }

  const confirmNavigate = () => {
    if (value?.id) {
      router.push(`/events/${value.event_type_id}/${value.id}`)
    }
    setShowNavigateConfirm(false)
  }

  return (
    <>
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
          <div className="flex flex-col gap-0.5">
            <span className="font-medium leading-tight">{formatEventDateTime(event)}</span>
            <span className="text-xs text-muted-foreground leading-tight">{event.name}</span>
          </div>
        )}
        displayLayout="multi-line"
        navigationButton={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleNavigateToEvent}
            title="View event details"
            data-testid="event-view-details"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        }
      >
        <EventPicker
          open={showPicker}
          onOpenChange={onShowPickerChange}
          onSelect={onValueChange}
          selectedEventId={value?.id}
          selectedEvent={value}
          openToNewEvent={openToNewEvent}
          defaultRelatedEventType={defaultRelatedEventType}
          defaultName={defaultName}
          disableSearch={disableSearch}
          visibleFields={visibleFields}
          requiredFields={requiredFields}
          defaultCreateFormData={defaultCreateFormData}
          editMode={value !== null}
          eventToEdit={value}
        />
      </PickerField>

      <ConfirmationDialog
        open={showNavigateConfirm}
        onOpenChange={setShowNavigateConfirm}
        onConfirm={confirmNavigate}
        title="Navigate to Event Details?"
        description="You will be taken to the event's detail page. Any unsaved changes on this form will be lost."
        confirmLabel="Go to Event"
        cancelLabel="Cancel"
      />
    </>
  )
}
