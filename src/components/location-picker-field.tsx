'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { LocationPicker } from '@/components/location-picker'
import { X, MapPin } from 'lucide-react'
import type { Location } from '@/lib/types'

interface LocationPickerFieldProps {
  label: string
  value: Location | null
  onValueChange: (location: Location | null) => void
  showPicker: boolean
  onShowPickerChange: (show: boolean) => void
  description?: string
  placeholder?: string
  required?: boolean
  openToNewLocation?: boolean
}

export function LocationPickerField({
  label,
  value,
  onValueChange,
  showPicker,
  onShowPickerChange,
  description,
  placeholder = 'Select Location',
  required = false,
  openToNewLocation = false,
}: LocationPickerFieldProps) {
  const getLocationDisplay = (location: Location) => {
    const parts = [location.name]
    if (location.city) parts.push(location.city)
    if (location.state) parts.push(location.state)
    return parts.join(', ')
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {value ? (
        <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
          <span className="text-sm">{getLocationDisplay(value)}</span>
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
          <MapPin className="h-4 w-4 mr-2" />
          {placeholder}
        </Button>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {/* Location Picker Modal */}
      <LocationPicker
        open={showPicker}
        onOpenChange={onShowPickerChange}
        onSelect={onValueChange}
        selectedLocationId={value?.id}
        openToNewLocation={openToNewLocation}
      />
    </div>
  )
}
