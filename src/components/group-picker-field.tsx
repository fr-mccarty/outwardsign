'use client'

import { useState } from 'react'
import { GroupPicker } from '@/components/group-picker'
import { PickerField } from '@/components/picker-field'
import { Users, ExternalLink } from 'lucide-react'
import type { Group } from '@/lib/actions/groups'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ConfirmationDialog } from '@/components/confirmation-dialog'

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
}: GroupPickerFieldProps) {
  const router = useRouter()
  const [showNavigateConfirm, setShowNavigateConfirm] = useState(false)

  const getGroupDisplay = (group: Group) => {
    return group.name
  }

  const handleNavigateToGroup = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowNavigateConfirm(true)
  }

  const confirmNavigate = () => {
    if (value?.id) {
      router.push(`/groups/${value.id}`)
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
        icon={Users}
        renderValue={getGroupDisplay}
        testId={testId}
        navigationButton={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleNavigateToGroup}
            title="View group details"
            data-testid={`${testId || 'group'}-view-details`}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        }
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

      <ConfirmationDialog
        open={showNavigateConfirm}
        onOpenChange={setShowNavigateConfirm}
        onConfirm={confirmNavigate}
        title="Navigate to Group Details?"
        description="You will be taken to the group's detail page. Any unsaved changes on this form will be lost."
        confirmLabel="Go to Group"
        cancelLabel="Cancel"
      />
    </>
  )
}
