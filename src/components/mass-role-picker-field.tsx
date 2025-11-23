'use client'

import { MassRolePicker } from '@/components/mass-role-picker'
import { PickerField } from '@/components/picker-field'
import { UserCog, ExternalLink } from 'lucide-react'
import type { MassRole } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ConfirmationDialog } from '@/components/confirmation-dialog'

interface MassRolePickerFieldProps {
  label: string
  value: MassRole | null
  onValueChange: (massRole: MassRole | null) => void
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
  const router = useRouter()
  const [showNavigateConfirm, setShowNavigateConfirm] = useState(false)

  const handleNavigateToMassRole = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowNavigateConfirm(true)
  }

  const confirmNavigate = () => {
    if (value?.id) {
      router.push(`/mass-roles/${value.id}`)
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
        renderValue={(massRole) => massRole.name}
        navigationButton={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleNavigateToMassRole}
            title="View mass role details"
            data-testid="mass-role-view-details"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        }
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

      <ConfirmationDialog
        open={showNavigateConfirm}
        onOpenChange={setShowNavigateConfirm}
        onConfirm={confirmNavigate}
        title="Navigate to Mass Role Details?"
        description="You will be taken to the mass role's detail page. Any unsaved changes on this form will be lost."
        confirmLabel="Go to Mass Role"
        cancelLabel="Cancel"
      />
    </>
  )
}
