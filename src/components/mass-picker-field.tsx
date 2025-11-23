'use client'

import { MassPicker } from '@/components/mass-picker'
import { PickerField } from '@/components/picker-field'
import { Calendar, ExternalLink } from 'lucide-react'
import type { MassWithNames } from '@/lib/actions/masses'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ConfirmationDialog } from '@/components/confirmation-dialog'

interface MassPickerFieldProps {
  label: string
  value: MassWithNames | null
  onValueChange: (mass: MassWithNames | null) => void
  showPicker: boolean
  onShowPickerChange: (show: boolean) => void
  description?: string
  placeholder?: string
  required?: boolean
}

export function MassPickerField({
  label,
  value,
  onValueChange,
  showPicker,
  onShowPickerChange,
  description,
  placeholder = 'Select Mass',
  required = false,
}: MassPickerFieldProps) {
  const router = useRouter()
  const [showNavigateConfirm, setShowNavigateConfirm] = useState(false)

  const formatMassDisplay = (mass: MassWithNames) => {
    const presiderName = mass.presider ? `${mass.presider.first_name} ${mass.presider.last_name}` : 'No Presider'
    const eventDate = mass.event?.start_date
      ? new Date(mass.event.start_date).toLocaleDateString()
      : 'No Date'
    return `${presiderName} - ${eventDate}`
  }

  const handleNavigateToMass = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowNavigateConfirm(true)
  }

  const confirmNavigate = () => {
    if (value?.id) {
      router.push(`/masses/${value.id}`)
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
        icon={Calendar}
        displayLayout="multi-line"
        renderValue={(mass) => (
          <>
            <p className="text-sm font-medium">
              {formatMassDisplay(mass)}
            </p>
            <p className="text-xs text-muted-foreground">
              {mass.status}
            </p>
          </>
        )}
        navigationButton={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleNavigateToMass}
            title="View mass details"
            data-testid="mass-view-details"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        }
      >
        <MassPicker
          open={showPicker}
          onOpenChange={onShowPickerChange}
          onSelect={onValueChange}
          selectedMassId={value?.id}
          editMode={value !== null}
          massToEdit={value}
        />
      </PickerField>

      <ConfirmationDialog
        open={showNavigateConfirm}
        onOpenChange={setShowNavigateConfirm}
        onConfirm={confirmNavigate}
        title="Navigate to Mass Details?"
        description="You will be taken to the mass's detail page. Any unsaved changes on this form will be lost."
        confirmLabel="Go to Mass"
        cancelLabel="Cancel"
      />
    </>
  )
}
