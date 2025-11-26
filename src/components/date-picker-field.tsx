'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { formatDatePretty } from '@/lib/utils/formatters'
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
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false)
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-')

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
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? formatDatePretty(value.toISOString().split('T')[0]) : placeholder}
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
    </div>
  )
}
