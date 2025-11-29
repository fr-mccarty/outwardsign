'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { formatDatePretty, toLocalDateString } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'

interface DatePickerFieldProps {
  id?: string
  label: string
  value: Date | undefined
  onValueChange: (date: Date | undefined) => void
  placeholder?: string
  description?: string
  required?: boolean
  disabled?: (date: Date) => boolean
  closeOnSelect?: boolean
  /** Validation error message from React Hook Form */
  error?: string
}

export function DatePickerField({
  id,
  label,
  value,
  onValueChange,
  placeholder = 'Select a date',
  description,
  required = false,
  disabled,
  closeOnSelect = false,
  error,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false)
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-')
  const errorId = error ? `${fieldId}-error` : undefined
  const hasError = !!error

  const handleSelect = (date: Date | undefined) => {
    onValueChange(date)
    if (closeOnSelect && date) {
      setOpen(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={fieldId}
            variant="outline"
            aria-describedby={errorId}
            aria-invalid={hasError}
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground',
              hasError && 'ring-2 ring-destructive-ring focus-visible:ring-destructive-ring'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? formatDatePretty(toLocalDateString(value)) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleSelect}
            disabled={disabled}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-destructive mt-1">
          {error}
        </p>
      )}
    </div>
  )
}
