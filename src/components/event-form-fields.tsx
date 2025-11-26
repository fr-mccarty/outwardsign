'use client'

import { useState, useEffect } from 'react'
import { UseFormReturn, FieldErrors } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Clock, MapPin, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LocationPicker } from '@/components/location-picker'
import { CommonTimesModal } from '@/components/common-times-modal'
import { FormInput } from '@/components/form-input'
import type { Location } from '@/lib/types'

// Timezone options for the select field
const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern (ET)' },
  { value: 'America/Chicago', label: 'Central (CT)' },
  { value: 'America/Denver', label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
]

interface EventFormFieldsProps {
  form: UseFormReturn<Record<string, any>>
  errors: FieldErrors<Record<string, any>>
  isEditMode: boolean
  visibleFields?: string[]
  requiredFields?: string[]
}

export function EventFormFields({
  form,
  errors,
  visibleFields = ['location', 'note'],
  requiredFields = [],
}: EventFormFieldsProps) {
  const { watch, setValue } = form
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [showCommonTimesModal, setShowCommonTimesModal] = useState(false)

  // Watch form values
  const formData = {
    name: watch('name') ?? '',
    start_date: watch('start_date') ?? '',
    start_time: watch('start_time') ?? '',
    timezone: watch('timezone') ?? 'America/Chicago',
    location_id: watch('location_id'),
    location: watch('location'),
    note: watch('note') ?? '',
  }

  // Initialize selectedLocation from formData.location if it exists
  useEffect(() => {
    if (formData.location && typeof formData.location === 'object') {
      setSelectedLocation(formData.location as Location)
    } else if (!formData.location_id) {
      // If there's no location_id, clear the selected location
      setSelectedLocation(null)
    }
  }, [formData.location, formData.location_id])

  const isFieldVisible = (fieldName: string) => {
    if (!visibleFields) return true
    return visibleFields.includes(fieldName)
  }

  const isFieldRequired = (fieldName: string) => {
    if (!requiredFields) return false
    return requiredFields.includes(fieldName)
  }

  const updateField = (key: string, value: any) => {
    setValue(key, value, { shouldValidate: true })
  }

  // Helper to get error message from FieldErrors
  // Ensures we only ever return a string, never an object
  const getErrorMessage = (fieldName: string): string | undefined => {
    const error = errors[fieldName]
    if (!error) return undefined
    const message = error.message
    // Ensure message is a string (defensive check)
    return typeof message === 'string' ? message : undefined
  }

  return (
    <>
      {/* Name Field */}
      <FormInput
        id="name"
        label="Name"
        value={formData.name}
        onChange={(value) => updateField('name', value)}
        placeholder="Wedding Ceremony"
        required
        error={getErrorMessage('name')}
      />

      {/* Date Field */}
      <FormInput
        id="start_date"
        label="Date"
        inputType="date"
        value={formData.start_date}
        onChange={(value) => updateField('start_date', value)}
        required
        error={getErrorMessage('start_date')}
      />

      {/* Time Field with Common Times Button - Custom layout since FormInput doesn't support adjacent buttons */}
      <div>
        <Label htmlFor="start_time" className="text-sm font-medium mb-1">
          Time
          <span className="text-destructive ml-1">*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="start_time"
            type="time"
            value={formData.start_time}
            onChange={(e) => updateField('start_time', e.target.value)}
            className={cn('flex-1', getErrorMessage('start_time') && 'ring-2 ring-destructive-ring focus-visible:ring-destructive-ring')}
            aria-invalid={!!getErrorMessage('start_time')}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowCommonTimesModal(true)
            }}
            title="Select common time"
          >
            <Clock className="h-4 w-4" />
          </Button>
        </div>
        {getErrorMessage('start_time') && (
          <p className="text-sm text-destructive mt-1">{getErrorMessage('start_time')}</p>
        )}
      </div>

      {/* Timezone Field */}
      <FormInput
        id="timezone"
        label="Time Zone"
        inputType="select"
        value={formData.timezone}
        onChange={(value) => updateField('timezone', value)}
        options={TIMEZONE_OPTIONS}
        required
        error={getErrorMessage('timezone')}
      />

      {/* Location Field - Custom since it uses LocationPicker */}
      {isFieldVisible('location') && (
        <div>
          <Label htmlFor="location_id" className="text-sm font-medium mb-1">
            Location
            {isFieldRequired('location') && <span className="text-destructive ml-1">*</span>}
          </Label>
          {selectedLocation ? (
            <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50" data-testid="event-location-selected">
              <span className="text-sm">
                {selectedLocation.name}
                {selectedLocation.city && `, ${selectedLocation.city}`}
                {selectedLocation.state && `, ${selectedLocation.state}`}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSelectedLocation(null)
                  updateField('location_id', null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowLocationPicker(true)
              }}
              className={cn('w-full justify-start', getErrorMessage('location_id') && 'ring-2 ring-destructive-ring')}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Select Location
            </Button>
          )}
          {getErrorMessage('location_id') && (
            <p className="text-sm text-destructive mt-1">{getErrorMessage('location_id')}</p>
          )}
        </div>
      )}

      {/* Note Field */}
      {isFieldVisible('note') && (
        <FormInput
          id="note"
          label="Note"
          inputType="textarea"
          value={formData.note}
          onChange={(value) => updateField('note', value)}
          placeholder="Add any notes about this event..."
          required={isFieldRequired('note')}
          error={getErrorMessage('note')}
        />
      )}

      {/* Common Times Modal */}
      <CommonTimesModal
        open={showCommonTimesModal}
        onOpenChange={setShowCommonTimesModal}
        onSelectTime={(time) => {
          updateField('start_time', time)
        }}
      />

      {/* Location Picker Modal */}
      <LocationPicker
        open={showLocationPicker}
        onOpenChange={setShowLocationPicker}
        onSelect={(location) => {
          setSelectedLocation(location)
          updateField('location_id', location.id)
        }}
        selectedLocationId={selectedLocation?.id}
        openToNewLocation={false}
      />
    </>
  )
}
