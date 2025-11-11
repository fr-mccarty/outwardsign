'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { GlobalLiturgicalEventPicker } from '@/components/global-liturgical-event-picker'
import { X, Calendar } from 'lucide-react'
import type { GlobalLiturgicalEvent } from '@/lib/actions/global-liturgical-events'

interface LiturgicalEventPickerFieldProps {
  label: string
  value: GlobalLiturgicalEvent | null
  onValueChange: (event: GlobalLiturgicalEvent | null) => void
  showPicker: boolean
  onShowPickerChange: (show: boolean) => void
  description?: string
  placeholder?: string
  required?: boolean
}

export function LiturgicalEventPickerField({
  label,
  value,
  onValueChange,
  showPicker,
  onShowPickerChange,
  description,
  placeholder = 'Select Liturgical Event',
  required = false,
}: LiturgicalEventPickerFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {value ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 p-3 border rounded-md bg-muted/50">
            <p className="text-sm font-medium">{value.event_data?.name}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(value.date).toLocaleDateString()} - {value.event_data?.liturgical_season}
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

      {/* Liturgical Event Picker Modal */}
      <GlobalLiturgicalEventPicker
        open={showPicker}
        onOpenChange={onShowPickerChange}
        onSelect={(event) => {
          onValueChange(event)
          onShowPickerChange(false)
        }}
      />
    </div>
  )
}
