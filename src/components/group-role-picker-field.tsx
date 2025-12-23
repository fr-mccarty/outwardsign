'use client'

import { GroupRolePicker } from '@/components/group-role-picker'
import { PickerField } from '@/components/picker-field'
import { UserCog } from 'lucide-react'
import type { GroupRole } from '@/lib/actions/group-roles'

interface GroupRolePickerFieldProps {
  label: string
  value: GroupRole | null
  onValueChange: (role: GroupRole | null) => void
  showPicker: boolean
  onShowPickerChange: (show: boolean) => void
  description?: string
  placeholder?: string
  required?: boolean
  visibleFields?: string[] // Optional fields to show: 'description', 'note', 'is_active', 'display_order'
  requiredFields?: string[] // Fields that should be marked as required
}

export function GroupRolePickerField({
  label,
  value,
  onValueChange,
  showPicker,
  onShowPickerChange,
  description,
  placeholder = 'Select Group Role',
  required = false,
  visibleFields,
  requiredFields,
}: GroupRolePickerFieldProps) {
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
      entityPath="/settings/group-roles"
      entityName="Group Role"
      getId={(role) => role.id}
    >
      <GroupRolePicker
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
