'use client'

import { useState } from 'react'
import { LiturgicalCalendarEventPicker } from '@/components/liturgical-calendar-picker'
import { PickerField } from '@/components/picker-field'
import { LiturgicalEventPreview } from '@/components/liturgical-event-preview'
import { Calendar } from 'lucide-react'
import type { LiturgicalCalendarEvent } from '@/lib/actions/liturgical-calendar'

interface LiturgicalEventPickerFieldProps {
  label: string
  value: LiturgicalCalendarEvent | null
  onValueChange: (event: LiturgicalCalendarEvent | null) => void
  showPicker: boolean
  onShowPickerChange: (show: boolean) => void
  description?: string
  placeholder?: string
  required?: boolean
}

export function LiturgicalEventPickerField({
  label,
  value,
  onValueChange,
  showPicker,
  onShowPickerChange,
  description,
  placeholder = 'Select Liturgical Event',
  required = false,
}: LiturgicalEventPickerFieldProps) {
  const [previewOpen, setPreviewOpen] = useState(false)

  const handleValueClick = () => {
    if (value) {
      setPreviewOpen(true)
    }
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
        displayLayout="multi-line"
        descriptionPosition="before"
        onValueClick={handleValueClick}
        renderValue={(event) => (
          <>
            <p className="text-sm font-medium">{event.event_data?.name}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(event.date).toLocaleDateString()} - {event.event_data?.liturgical_season}
            </p>
          </>
        )}
      >
        <LiturgicalCalendarEventPicker
          open={showPicker}
          onOpenChange={onShowPickerChange}
          onSelect={onValueChange}
        />
      </PickerField>

      <LiturgicalEventPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        event={value}
      />
    </>
  )
}
