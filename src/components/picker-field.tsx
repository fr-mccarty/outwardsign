'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X, Pencil } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface BasePickerFieldProps<T> {
  label: string
  value: T | null
  onValueChange: (value: T | null) => void
  showPicker: boolean
  onShowPickerChange: (show: boolean) => void
  description?: string
  placeholder?: string
  required?: boolean
  icon: LucideIcon
  renderValue: (value: T) => ReactNode
  children: ReactNode
  descriptionPosition?: 'before' | 'after'
  displayLayout?: 'single-line' | 'multi-line'
  testId?: string // Optional override for data-testid
  onValueClick?: () => void // Optional custom click handler for the value display
}

export function PickerField<T>({
  label,
  value,
  onValueChange,
  showPicker,
  onShowPickerChange,
  description,
  placeholder = 'Select',
  required = false,
  icon: Icon,
  renderValue,
  children,
  descriptionPosition = 'after',
  displayLayout = 'single-line',
  testId,
  onValueClick,
}: BasePickerFieldProps<T>) {
  const labelId = testId || label.toLowerCase().replace(/\s+/g, '-')

  const handleValueClick = () => {
    if (onValueClick) {
      onValueClick()
    } else {
      onShowPickerChange(true)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={labelId}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      {descriptionPosition === 'before' && description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {value ? (
        displayLayout === 'single-line' ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleValueClick}
              className="flex-1 flex items-center justify-between p-3 border rounded-md bg-muted/50 hover:bg-muted transition-colors text-left"
              data-testid={`${labelId}-selected-value`}
            >
              <span className="text-sm">{renderValue(value)}</span>
              <Pencil className="h-4 w-4 text-muted-foreground ml-2" />
            </button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onValueChange(null)}
              data-testid={`${labelId}-clear`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleValueClick}
              className="flex-1 p-3 border rounded-md bg-muted/50 hover:bg-muted transition-colors text-left"
              data-testid={`${labelId}-selected-value`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">{renderValue(value)}</div>
                <Pencil className="h-4 w-4 text-muted-foreground ml-2" />
              </div>
            </button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onValueChange(null)}
              data-testid={`${labelId}-clear`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => onShowPickerChange(true)}
          className="w-full justify-start"
          data-testid={`${labelId}-trigger`}
        >
          <Icon className="h-4 w-4 mr-2" />
          {placeholder}
        </Button>
      )}

      {descriptionPosition === 'after' && description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {/* Picker Modal - passed as children */}
      {children}
    </div>
  )
}
