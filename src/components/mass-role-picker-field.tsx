'use client'

import { MassRolePicker } from '@/components/mass-role-picker'
import { PickerField } from '@/components/picker-field'
import { UserCog } from 'lucide-react'
import type { MassRole } from '@/lib/types'

interface MassRolePickerFieldProps {
  label: string
  value: MassRole | null
  onValueChange: (role: MassRole | null) => void
  showPicker: boolean
  onShowPickerChange: (show: boolean) => void
  description?: string
  placeholder?: string
  required?: boolean
  visibleFields?: string[] // Optional fields to show: 'description', 'note'
  requiredFields?: string[] // Fields that should be marked as required
}

export function MassRolePickerField({
  label,
  value,
  onValueChange,
  showPicker,
  onShowPickerChange,
  description,
  placeholder = 'Select Mass Role',
  required = false,
  visibleFields,
  requiredFields,
}: MassRolePickerFieldProps) {
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
      icon={UserCog}
      renderValue={(role) => role.name}
    >
      <MassRolePicker
        open={showPicker}
        onOpenChange={onShowPickerChange}
        onSelect={onValueChange}
        selectedRoleId={value?.id}
        visibleFields={visibleFields}
        requiredFields={requiredFields}
      />
    </PickerField>
  )
}
