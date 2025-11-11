'use client'

import { LocationPicker } from '@/components/location-picker'
import { PickerField } from '@/components/picker-field'
import { MapPin } from 'lucide-react'
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
    <PickerField
      label={label}
      value={value}
      onValueChange={onValueChange}
      showPicker={showPicker}
      onShowPickerChange={onShowPickerChange}
      description={description}
      placeholder={placeholder}
      required={required}
      icon={MapPin}
      renderValue={getLocationDisplay}
    >
      <LocationPicker
        open={showPicker}
        onOpenChange={onShowPickerChange}
        onSelect={onValueChange}
        selectedLocationId={value?.id}
        openToNewLocation={openToNewLocation}
      />
    </PickerField>
  )
}
