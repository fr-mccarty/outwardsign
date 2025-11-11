'use client'

import { PeoplePicker } from '@/components/people-picker'
import { PickerField } from '@/components/picker-field'
import { User } from 'lucide-react'
import type { Person } from '@/lib/types'

interface PersonPickerFieldProps {
  label: string
  value: Person | null
  onValueChange: (person: Person | null) => void
  showPicker: boolean
  onShowPickerChange: (show: boolean) => void
  description?: string
  placeholder?: string
  required?: boolean
  openToNewPerson?: boolean
  visibleFields?: string[] // Optional fields to show: 'email', 'phone_number', 'sex', 'note'
  requiredFields?: string[] // Fields that should be marked as required in the picker form
}

export function PersonPickerField({
  label,
  value,
  onValueChange,
  showPicker,
  onShowPickerChange,
  description,
  placeholder = 'Select Person',
  required = false,
  openToNewPerson = false,
  visibleFields,
  requiredFields,
}: PersonPickerFieldProps) {
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
      icon={User}
      renderValue={(person) => `${person.first_name} ${person.last_name}`}
    >
      <PeoplePicker
        open={showPicker}
        onOpenChange={onShowPickerChange}
        onSelect={onValueChange}
        selectedPersonId={value?.id}
        openToNewPerson={openToNewPerson}
        visibleFields={visibleFields}
        requiredFields={requiredFields}
        editMode={value !== null}
        personToEdit={value}
      />
    </PickerField>
  )
}
