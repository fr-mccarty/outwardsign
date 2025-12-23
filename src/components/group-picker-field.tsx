'use client'

import { GroupPicker } from '@/components/group-picker'
import { PickerField } from '@/components/picker-field'
import { Users } from 'lucide-react'
import type { Group } from '@/lib/actions/groups'

interface GroupPickerFieldProps {
  label: string
  value: Group | null
  onValueChange: (group: Group | null) => void
  showPicker: boolean
  onShowPickerChange: (show: boolean) => void
  description?: string
  placeholder?: string
  required?: boolean
  openToNewGroup?: boolean
  testId?: string
  error?: string // Validation error message
}

export function GroupPickerField({
  label,
  value,
  onValueChange,
  showPicker,
  onShowPickerChange,
  description,
  placeholder = 'Select Group',
  required = false,
  openToNewGroup = false,
  testId,
  error,
}: GroupPickerFieldProps) {
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
      icon={Users}
      renderValue={(group) => group.name}
      testId={testId}
      error={error}
      entityPath="/groups"
      entityName="Group"
      getId={(group) => group.id}
    >
      <GroupPicker
        open={showPicker}
        onOpenChange={onShowPickerChange}
        onSelect={onValueChange}
        selectedGroupId={value?.id}
        openToNewGroup={openToNewGroup}
        editMode={value !== null}
        groupToEdit={value}
      />
    </PickerField>
  )
}
