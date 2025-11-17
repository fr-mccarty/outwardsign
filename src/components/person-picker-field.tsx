'use client'

import { PeoplePicker } from '@/components/people-picker'
import { PickerField } from '@/components/picker-field'
import { User } from 'lucide-react'
import type { Person } from '@/lib/types'
import type { Sex } from '@/lib/constants'

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
  autoSetSex?: Sex // Auto-set sex to this value and hide the field
  testId?: string // Optional override for data-testid
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
  autoSetSex,
  testId,
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
      testId={testId}
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
        autoSetSex={autoSetSex}
      />
    </PickerField>
  )
}
