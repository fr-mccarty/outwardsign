'use client'

import { PeoplePicker } from '@/components/people-picker'
import { PickerField } from '@/components/picker-field'
import { User, ExternalLink } from 'lucide-react'
import type { Person } from '@/lib/types'
import type { Sex } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ConfirmationDialog } from '@/components/confirmation-dialog'

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
  visibleFields?: string[] // Optional fields to show: 'email', 'phone_number', 'sex', 'note', 'first_name_pronunciation', 'last_name_pronunciation'
  requiredFields?: string[] // Fields that should be marked as required in the picker form
  autoSetSex?: Sex // Auto-set sex to this value and hide the field
  testId?: string // Optional override for data-testid
  showPronunciation?: boolean // Show pronunciation in the selected value display (only if it exists)
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
  showPronunciation = false,
}: PersonPickerFieldProps) {
  const router = useRouter()
  const [showNavigateConfirm, setShowNavigateConfirm] = useState(false)

  const renderPersonValue = (person: Person) => {
    const firstName = person.first_name
    const firstNamePronunciation = person.first_name_pronunciation
    const lastName = person.last_name
    const lastNamePronunciation = person.last_name_pronunciation

    if (!showPronunciation) {
      return `${firstName} ${lastName}`
    }

    // Build name with pronunciation only where it exists
    const firstPart = firstNamePronunciation
      ? `${firstName} (${firstNamePronunciation})`
      : firstName
    const lastPart = lastNamePronunciation
      ? `${lastName} (${lastNamePronunciation})`
      : lastName

    return `${firstPart} ${lastPart}`
  }

  const handleNavigateToPerson = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowNavigateConfirm(true)
  }

  const confirmNavigate = () => {
    if (value?.id) {
      router.push(`/people/${value.id}`)
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
        icon={User}
        renderValue={renderPersonValue}
        testId={testId}
        navigationButton={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleNavigateToPerson}
            title="View person details"
            data-testid={`${testId || 'person'}-view-details`}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        }
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

      <ConfirmationDialog
        open={showNavigateConfirm}
        onOpenChange={setShowNavigateConfirm}
        onConfirm={confirmNavigate}
        title="Navigate to Person Details?"
        description="You will be taken to the person's detail page. Any unsaved changes on this form will be lost."
        confirmLabel="Go to Person"
        cancelLabel="Cancel"
      />
    </>
  )
}
