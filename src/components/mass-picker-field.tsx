'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { MassPicker } from '@/components/mass-picker'
import { X, Calendar } from 'lucide-react'
import type { MassWithNames } from '@/lib/actions/masses'

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
  const formatMassDisplay = (mass: MassWithNames) => {
    const presiderName = mass.presider ? `${mass.presider.first_name} ${mass.presider.last_name}` : 'No Presider'
    const eventDate = mass.event?.start_date
      ? new Date(mass.event.start_date).toLocaleDateString()
      : 'No Date'
    return `${presiderName} - ${eventDate}`
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {value ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 p-3 border rounded-md bg-muted/50">
            <p className="text-sm font-medium">
              {formatMassDisplay(value)}
            </p>
            <p className="text-xs text-muted-foreground">
              {value.status}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onValueChange(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => onShowPickerChange(true)}
          className="w-full justify-start"
        >
          <Calendar className="h-4 w-4 mr-2" />
          {placeholder}
        </Button>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {/* Mass Picker Modal */}
      <MassPicker
        open={showPicker}
        onOpenChange={onShowPickerChange}
        onSelect={onValueChange}
        selectedMassId={value?.id}
      />
    </div>
  )
}
