'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Clock, MapPin, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LocationPicker } from '@/components/location-picker'
import { CommonTimesModal } from '@/components/common-times-modal'
import type { Location } from '@/lib/types'

interface EventFormFieldsProps {
  formData: Record<string, any>
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>
  errors: Record<string, string>
  isEditMode: boolean
  visibleFields?: string[]
  requiredFields?: string[]
}

export function EventFormFields({
  formData,
  setFormData,
  errors,
  visibleFields = ['location', 'note'],
  requiredFields = [],
}: EventFormFieldsProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [showLocationPicker, setShowLocationPicker] = useState(false)
  const [showCommonTimesModal, setShowCommonTimesModal] = useState(false)

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
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <>
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name" className={cn(errors.name && 'text-destructive')}>
          Name
          <span className="text-destructive ml-1">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          value={formData.name || ''}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Wedding Ceremony"
          className={cn(errors.name && 'border-destructive')}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      {/* Date Field */}
      <div className="space-y-2">
        <Label htmlFor="start_date" className={cn(errors.start_date && 'text-destructive')}>
          Date
          <span className="text-destructive ml-1">*</span>
        </Label>
        <Input
          id="start_date"
          type="date"
          value={formData.start_date || ''}
          onChange={(e) => updateField('start_date', e.target.value)}
          className={cn(errors.start_date && 'border-destructive')}
        />
        {errors.start_date && <p className="text-sm text-destructive">{errors.start_date}</p>}
      </div>

      {/* Time Field with Common Times Button */}
      <div className="space-y-2">
        <Label htmlFor="start_time" className={cn(errors.start_time && 'text-destructive')}>
          Time
          <span className="text-destructive ml-1">*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="start_time"
            type="time"
            value={formData.start_time || ''}
            onChange={(e) => updateField('start_time', e.target.value)}
            className={cn('flex-1', errors.start_time && 'border-destructive')}
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
        {errors.start_time && <p className="text-sm text-destructive">{errors.start_time}</p>}
      </div>

      {/* Timezone Field */}
      <div className="space-y-2">
        <Label htmlFor="timezone" className={cn(errors.timezone && 'text-destructive')}>
          Time Zone
          <span className="text-destructive ml-1">*</span>
        </Label>
        <Select
          value={formData.timezone || 'America/Chicago'}
          onValueChange={(value) => updateField('timezone', value)}
        >
          <SelectTrigger
            id="timezone"
            className={cn(errors.timezone && 'border-destructive')}
          >
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="America/New_York">Eastern (ET)</SelectItem>
            <SelectItem value="America/Chicago">Central (CT)</SelectItem>
            <SelectItem value="America/Denver">Mountain (MT)</SelectItem>
            <SelectItem value="America/Los_Angeles">Pacific (PT)</SelectItem>
          </SelectContent>
        </Select>
        {errors.timezone && <p className="text-sm text-destructive">{errors.timezone}</p>}
      </div>

      {/* Location Field */}
      {isFieldVisible('location') && (
        <div className="space-y-2">
          <Label htmlFor="location_id" className={cn(errors.location_id && 'text-destructive')}>
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
              className={cn('w-full justify-start', errors.location_id && 'border-destructive')}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Select Location
            </Button>
          )}
          {errors.location_id && <p className="text-sm text-destructive">{errors.location_id}</p>}
        </div>
      )}

      {/* Note Field */}
      {isFieldVisible('note') && (
        <div className="space-y-2">
          <Label htmlFor="note" className={cn(errors.note && 'text-destructive')}>
            Note
            {isFieldRequired('note') && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Textarea
            id="note"
            value={formData.note || ''}
            onChange={(e) => updateField('note', e.target.value)}
            placeholder="Add any notes about this event..."
            className={cn(errors.note && 'border-destructive')}
          />
          {errors.note && <p className="text-sm text-destructive">{errors.note}</p>}
        </div>
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
