'use client'

import { GlobalLiturgicalEventPicker } from '@/components/global-liturgical-event-picker'
import { PickerField } from '@/components/picker-field'
import { Calendar } from 'lucide-react'
import type { GlobalLiturgicalEvent } from '@/lib/actions/global-liturgical-events'

interface LiturgicalEventPickerFieldProps {
  label: string
  value: GlobalLiturgicalEvent | null
  onValueChange: (event: GlobalLiturgicalEvent | null) => void
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
      displayLayout="multi-line"
      descriptionPosition="before"
      renderValue={(event) => (
        <>
          <p className="text-sm font-medium">{event.event_data?.name}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(event.date).toLocaleDateString()} - {event.event_data?.liturgical_season}
          </p>
        </>
      )}
    >
      <GlobalLiturgicalEventPicker
        open={showPicker}
        onOpenChange={onShowPickerChange}
        onSelect={onValueChange}
      />
    </PickerField>
  )
}
