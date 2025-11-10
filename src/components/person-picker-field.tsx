'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PeoplePicker } from '@/components/people-picker'
import { X, User } from 'lucide-react'
import type { Person } from '@/lib/types'

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
}: PersonPickerFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {value ? (
        <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
          <span className="text-sm">
            {value.first_name} {value.last_name}
          </span>
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
          <User className="h-4 w-4 mr-2" />
          {placeholder}
        </Button>
      )}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {/* People Picker Modal */}
      <PeoplePicker
        open={showPicker}
        onOpenChange={onShowPickerChange}
        onSelect={onValueChange}
        selectedPersonId={value?.id}
        openToNewPerson={openToNewPerson}
      />
    </div>
  )
}
