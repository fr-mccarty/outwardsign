'use client'

import { MassPicker } from '@/components/mass-picker'
import { PickerField } from '@/components/picker-field'
import { Calendar } from 'lucide-react'
import type { MassWithNames } from '@/lib/schemas/mass-liturgies'

interface MassPickerFieldProps {
  label: string
  value: MassWithNames | null
  onValueChange: (mass: MassWithNames | null) => void
  showPicker: boolean
  onShowPickerChange: (show: boolean) => void
  description?: string
  placeholder?: string
  required?: boolean
}

export function MassPickerField({
  label,
  value,
  onValueChange,
  showPicker,
  onShowPickerChange,
  description,
  placeholder = 'Select Mass',
  required = false,
}: MassPickerFieldProps) {
  const formatMassDisplay = (mass: MassWithNames) => {
    const presiderName = mass.presider ? `${mass.presider.first_name} ${mass.presider.last_name}` : 'No Presider'
    const eventDate = mass.primary_calendar_event?.start_datetime
      ? new Date(mass.primary_calendar_event.start_datetime).toLocaleDateString()
      : 'No Date'
    return `${presiderName} - ${eventDate}`
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
      icon={Calendar}
      displayLayout="multi-line"
      renderValue={(mass) => (
        <>
          <p className="text-sm font-medium">
            {formatMassDisplay(mass)}
          </p>
          <p className="text-xs text-muted-foreground">
            {mass.status}
          </p>
        </>
      )}
      entityPath="/masses"
      entityName="Mass"
      getId={(mass) => mass.id}
    >
      <MassPicker
        open={showPicker}
        onOpenChange={onShowPickerChange}
        onSelect={onValueChange}
        selectedMassId={value?.id}
        editMode={value !== null}
        massToEdit={value}
      />
    </PickerField>
  )
}
