'use client'

import { useState, useEffect } from 'react'
import { PeoplePicker } from '@/components/people-picker'
import { PickerField } from '@/components/picker-field'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { User, ExternalLink } from 'lucide-react'
import type { Person } from '@/lib/types'
import type { Sex } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { getPersonAvatarSignedUrl } from '@/lib/actions/people'

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
  additionalVisibleFields?: string[] // Additional fields to show: 'email', 'phone_number', 'sex', 'note'
  requiredFields?: string[] // Fields that should be marked as required in the picker form
  autoSetSex?: Sex // Auto-set sex to this value and hide the field
  testId?: string // Optional override for data-testid
  error?: string // Validation error message
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
  additionalVisibleFields,
  requiredFields,
  autoSetSex,
  testId,
  error,
}: PersonPickerFieldProps) {
  const router = useRouter()
  const [showNavigateConfirm, setShowNavigateConfirm] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // Fetch signed URL for avatar when value changes
  useEffect(() => {
    async function fetchAvatarUrl() {
      if (value?.avatar_url) {
        try {
          const url = await getPersonAvatarSignedUrl(value.avatar_url)
          setAvatarUrl(url)
        } catch (error) {
          console.error('Failed to get avatar URL:', error)
          setAvatarUrl(null)
        }
      } else {
        setAvatarUrl(null)
      }
    }
    fetchAvatarUrl()
  }, [value?.avatar_url, value?.id])

  // Get initials for avatar fallback
  const getInitials = (person: Person) => {
    const first = person.first_name?.charAt(0) || ''
    const last = person.last_name?.charAt(0) || ''
    return (first + last).toUpperCase() || '?'
  }

  // Format name with pronunciation
  const formatPersonName = (person: Person) => {
    const firstName = person.first_name
    const firstNamePronunciation = person.first_name_pronunciation
    const lastName = person.last_name
    const lastNamePronunciation = person.last_name_pronunciation

    // Always show pronunciation if the person has it
    if (!firstNamePronunciation && !lastNamePronunciation) {
      return `${firstName} ${lastName}`
    }

    // Build name with pronunciation where it exists
    const firstPart = firstNamePronunciation
      ? `${firstName} (${firstNamePronunciation})`
      : firstName
    const lastPart = lastNamePronunciation
      ? `${lastName} (${lastNamePronunciation})`
      : lastName

    return `${firstPart} ${lastPart}`
  }

  const renderPersonValue = (person: Person) => {
    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6 flex-shrink-0">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={person.full_name} />}
          <AvatarFallback className="text-xs">{getInitials(person)}</AvatarFallback>
        </Avatar>
        <span>{formatPersonName(person)}</span>
      </div>
    )
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
        error={error}
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
          additionalVisibleFields={additionalVisibleFields}
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
