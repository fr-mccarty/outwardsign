'use client'

import { GroupRolePicker } from '@/components/group-role-picker'
import { PickerField } from '@/components/picker-field'
import { UserCog, ExternalLink } from 'lucide-react'
import type { GroupRole } from '@/lib/actions/group-roles'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ConfirmationDialog } from '@/components/confirmation-dialog'

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
  const router = useRouter()
  const [showNavigateConfirm, setShowNavigateConfirm] = useState(false)

  const handleNavigateToGroupRole = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowNavigateConfirm(true)
  }

  const confirmNavigate = () => {
    if (value?.id) {
      router.push(`/group-roles/${value.id}`)
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
        icon={UserCog}
        renderValue={(role) => role.name}
        navigationButton={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleNavigateToGroupRole}
            title="View group role details"
            data-testid="group-role-view-details"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        }
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

      <ConfirmationDialog
        open={showNavigateConfirm}
        onOpenChange={setShowNavigateConfirm}
        onConfirm={confirmNavigate}
        title="Navigate to Group Role Details?"
        description="You will be taken to the group role's detail page. Any unsaved changes on this form will be lost."
        confirmLabel="Go to Group Role"
        cancelLabel="Cancel"
      />
    </>
  )
}
