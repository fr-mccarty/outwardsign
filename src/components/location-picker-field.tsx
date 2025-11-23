'use client'

import { LocationPicker } from '@/components/location-picker'
import { PickerField } from '@/components/picker-field'
import { MapPin, ExternalLink } from 'lucide-react'
import type { Location } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ConfirmationDialog } from '@/components/confirmation-dialog'

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
  visibleFields?: string[] // Optional fields to show: 'description', 'street', 'city', 'state', 'country', 'phone_number'
  requiredFields?: string[] // Fields that should be marked as required in the picker form
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
  visibleFields,
  requiredFields,
}: LocationPickerFieldProps) {
  const router = useRouter()
  const [showNavigateConfirm, setShowNavigateConfirm] = useState(false)

  const getLocationDisplay = (location: Location) => {
    const parts = [location.name]
    if (location.city) parts.push(location.city)
    if (location.state) parts.push(location.state)
    return parts.join(', ')
  }

  const handleNavigateToLocation = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowNavigateConfirm(true)
  }

  const confirmNavigate = () => {
    if (value?.id) {
      router.push(`/locations/${value.id}`)
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
        icon={MapPin}
        renderValue={getLocationDisplay}
        navigationButton={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleNavigateToLocation}
            title="View location details"
            data-testid="location-view-details"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        }
      >
        <LocationPicker
          open={showPicker}
          onOpenChange={onShowPickerChange}
          onSelect={onValueChange}
          selectedLocationId={value?.id}
          openToNewLocation={openToNewLocation}
          visibleFields={visibleFields}
          requiredFields={requiredFields}
        />
      </PickerField>

      <ConfirmationDialog
        open={showNavigateConfirm}
        onOpenChange={setShowNavigateConfirm}
        onConfirm={confirmNavigate}
        title="Navigate to Location Details?"
        description="You will be taken to the location's detail page. Any unsaved changes on this form will be lost."
        confirmLabel="Go to Location"
        cancelLabel="Cancel"
      />
    </>
  )
}
