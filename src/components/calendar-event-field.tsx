'use client'

import { useState, useEffect } from 'react'
import { DatePickerField } from '@/components/date-picker-field'
import { TimePickerField } from '@/components/time-picker-field'
import { LocationPickerField } from '@/components/location-picker-field'
import { Card, CardContent } from '@/components/content-card'
import { Label } from '@/components/ui/label'
import type { Location } from '@/lib/types'

interface CalendarEventFieldValue {
  start_date?: Date
  start_time?: string
  end_time?: string
  location_id?: string | null
  location?: Location | null
}

interface CalendarEventFieldProps {
  label: string
  value: CalendarEventFieldValue
  onValueChange: (value: CalendarEventFieldValue) => void
  description?: string
  required?: boolean
  showEndTime?: boolean
  error?: string
}

/**
 * CalendarEventField - Composite field for calendar event data
 *
 * Combines date, time, optional end time, and location pickers into a single field group.
 * Used for calendar_event input type fields in the unified event data model.
 *
 * Per FORMS.md: Uses semantic color tokens and supports dark mode.
 */
export function CalendarEventField({
  label,
  value,
  onValueChange,
  description,
  required = false,
  showEndTime = false,
  error,
}: CalendarEventFieldProps) {
  const [showLocationPicker, setShowLocationPicker] = useState(false)

  // Initialize location from location_id if needed
  useEffect(() => {
    // This effect would typically fetch the location data if we have location_id but no location object
    // For now, we assume location is passed in the value
  }, [value.location_id])

  const handleDateChange = (date: Date | undefined) => {
    onValueChange({
      ...value,
      start_date: date,
    })
  }

  const handleStartTimeChange = (time: string) => {
    onValueChange({
      ...value,
      start_time: time,
    })
  }

  const handleEndTimeChange = (time: string) => {
    onValueChange({
      ...value,
      end_time: time,
    })
  }

  const handleLocationChange = (location: Location | null) => {
    onValueChange({
      ...value,
      location_id: location?.id || null,
      location: location,
    })
  }

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <Card className="bg-card text-card-foreground border">
        <CardContent className="pt-6 space-y-4">
          {/* Date picker */}
          <DatePickerField
            label="Date"
            value={value.start_date}
            onValueChange={handleDateChange}
            placeholder="Select date"
            required={required}
            closeOnSelect={true}
          />

          {/* Time pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TimePickerField
              label="Start Time"
              value={value.start_time}
              onChange={handleStartTimeChange}
              placeholder="Select start time"
              required={required}
            />

            {showEndTime && (
              <TimePickerField
                label="End Time"
                value={value.end_time}
                onChange={handleEndTimeChange}
                placeholder="Select end time"
              />
            )}
          </div>

          {/* Location picker */}
          <LocationPickerField
            label="Location"
            value={value.location || null}
            onValueChange={handleLocationChange}
            showPicker={showLocationPicker}
            onShowPickerChange={setShowLocationPicker}
            placeholder="Select location"
            openToNewLocation={!value.location}
          />
        </CardContent>
      </Card>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
