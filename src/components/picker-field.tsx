'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
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
}: BasePickerFieldProps<T>) {
  const labelId = label.toLowerCase().replace(/\s+/g, '-')

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
          <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
            <span className="text-sm">{renderValue(value)}</span>
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
          <div className="flex items-center gap-2">
            <div className="flex-1 p-3 border rounded-md bg-muted/50">
              {renderValue(value)}
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
        )
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => onShowPickerChange(true)}
          className="w-full justify-start"
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
