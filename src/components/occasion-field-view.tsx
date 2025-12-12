"use client"

import { useState } from "react"
import { DatePickerField } from "@/components/date-picker-field"
import { TimePickerField } from "@/components/time-picker-field"
import { LocationPickerField } from "@/components/location-picker-field"
import { toLocalDateString } from "@/lib/utils/formatters"
import type { Location } from "@/lib/types"

export interface OccasionFieldData {
  date: string
  time: string
  location_id: string | null
  location?: Location | null
}

interface OccasionFieldViewProps {
  label: string
  value: OccasionFieldData
  onValueChange: (value: OccasionFieldData) => void
  required?: boolean
  isPrimary?: boolean
}

export function OccasionFieldView({
  label,
  value,
  onValueChange,
  required = false,
  isPrimary = false
}: OccasionFieldViewProps) {
  const [showLocationPicker, setShowLocationPicker] = useState(false)

  const updateValue = (key: keyof OccasionFieldData, newValue: string | Location | null) => {
    if (key === 'location' && typeof newValue === 'object') {
      onValueChange({
        ...value,
        location: newValue,
        location_id: newValue?.id || null
      })
    } else if (key === 'date' || key === 'time') {
      onValueChange({
        ...value,
        [key]: typeof newValue === 'string' ? newValue : ''
      })
    }
  }

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
        {isPrimary && (
          <span className="text-xs text-muted-foreground">(Primary)</span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DatePickerField
          id={`${label}-date`}
          label="Date"
          value={value.date ? new Date(value.date + 'T12:00:00') : undefined}
          onValueChange={(date) => updateValue('date', date ? toLocalDateString(date) : '')}
          required={required}
          closeOnSelect
        />
        <TimePickerField
          id={`${label}-time`}
          label="Time"
          value={value.time || ''}
          onChange={(time) => updateValue('time', time)}
        />
      </div>
      <LocationPickerField
        label="Location"
        value={value.location || null}
        onValueChange={(location) => updateValue('location', location)}
        showPicker={showLocationPicker}
        onShowPickerChange={setShowLocationPicker}
        placeholder="Select location"
      />
    </div>
  )
}
