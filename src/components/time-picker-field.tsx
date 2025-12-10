'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FormInput } from '@/components/form-input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimePickerFieldProps {
  id?: string
  label: string
  value?: string
  onChange?: (value: string) => void
  error?: string
  required?: boolean
  disabled?: boolean
  description?: string
  className?: string
  placeholder?: string
}

// Common times used in Catholic liturgical services
const COMMON_TIMES = [
  { label: '7:00 AM', value: '07:00' },
  { label: '8:00 AM', value: '08:00' },
  { label: '9:00 AM', value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '11:00 AM', value: '11:00' },
  { label: '12:00 PM', value: '12:00' },
  { label: '1:00 PM', value: '13:00' },
  { label: '2:00 PM', value: '14:00' },
  { label: '3:00 PM', value: '15:00' },
  { label: '4:00 PM', value: '16:00' },
  { label: '5:00 PM', value: '17:00' },
  { label: '6:00 PM', value: '18:00' },
  { label: '7:00 PM', value: '19:00' },
]

// Format 24-hour time to 12-hour display
function formatTime(time: string): string {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour}:${minutes} ${ampm}`
}

/**
 * TimePickerField - A clean time picker matching DatePickerField pattern
 *
 * Features:
 * - Button + Popover pattern (consistent with DatePickerField)
 * - Grid of common liturgical service times
 * - Manual time input at top of popover
 * - Mobile and desktop friendly
 * - Dark mode support via semantic tokens
 *
 * Per FORMS-CRITICAL.md: Uses system default font, borders, and backgrounds.
 */
export function TimePickerField({
  id,
  label,
  value = '',
  onChange,
  error,
  required = false,
  disabled = false,
  description,
  placeholder = 'Select a time',
}: TimePickerFieldProps) {
  const [open, setOpen] = useState(false)
  const [customHour, setCustomHour] = useState('')
  const [customMinute, setCustomMinute] = useState('')
  const [customPeriod, setCustomPeriod] = useState<'AM' | 'PM'>('AM')
  const [hourError, setHourError] = useState(false)
  const [minuteError, setMinuteError] = useState(false)
  const fieldId = id || label.toLowerCase().replace(/\s+/g, '-')
  const errorId = error ? `${fieldId}-error` : undefined
  const hasError = !!error

  // When popover opens, initialize custom inputs from current value
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && value) {
      // Parse the 24-hour time value to populate custom inputs
      const [hours24, minutes] = value.split(':')
      const hour24 = parseInt(hours24, 10)
      const isPM = hour24 >= 12
      let hour12 = hour24 % 12
      if (hour12 === 0) hour12 = 12

      setCustomHour(hour12.toString())
      setCustomMinute(minutes)
      setCustomPeriod(isPM ? 'PM' : 'AM')
      setHourError(false)
      setMinuteError(false)
    } else if (isOpen && !value) {
      // Reset to defaults if no value
      setCustomHour('')
      setCustomMinute('00')
      setCustomPeriod('AM')
      setHourError(false)
      setMinuteError(false)
    }
  }

  const handleSelect = (time: string) => {
    onChange?.(time)
    setOpen(false)
  }

  // Validate hour input (1-12)
  const validateHour = (value: string): boolean => {
    if (!value) return false
    const num = parseInt(value, 10)
    return !isNaN(num) && num >= 1 && num <= 12
  }

  // Validate minute input (0-59)
  const validateMinute = (value: string): boolean => {
    if (!value) return false
    const num = parseInt(value, 10)
    return !isNaN(num) && num >= 0 && num <= 59
  }

  // Handle hour input change
  const handleHourChange = (input: string) => {
    // Allow empty string or numeric values only
    if (input === '' || /^\d+$/.test(input)) {
      // Limit to 2 digits
      const trimmed = input.slice(0, 2)
      setCustomHour(trimmed)

      // Validate if not empty
      if (trimmed) {
        const isValid = validateHour(trimmed)
        setHourError(!isValid)
      } else {
        setHourError(false)
      }
    }
  }

  // Handle minute input change
  const handleMinuteChange = (input: string) => {
    // Allow empty string or numeric values only
    if (input === '' || /^\d+$/.test(input)) {
      // Limit to 2 digits
      const trimmed = input.slice(0, 2)
      setCustomMinute(trimmed)

      // Validate if not empty
      if (trimmed) {
        const isValid = validateMinute(trimmed)
        setMinuteError(!isValid)
      } else {
        setMinuteError(false)
      }
    }
  }

  const handleCustomTimeSubmit = () => {
    const hourValid = validateHour(customHour)
    const minuteValid = validateMinute(customMinute)

    setHourError(!hourValid)
    setMinuteError(!minuteValid)

    if (hourValid && minuteValid) {
      // Convert 12-hour format to 24-hour format
      let hour24 = parseInt(customHour, 10)
      if (customPeriod === 'PM' && hour24 !== 12) {
        hour24 += 12
      } else if (customPeriod === 'AM' && hour24 === 12) {
        hour24 = 0
      }
      const paddedMinute = customMinute.padStart(2, '0')
      const time24 = `${hour24.toString().padStart(2, '0')}:${paddedMinute}`
      onChange?.(time24)
      setOpen(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={fieldId}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id={fieldId}
            variant="outline"
            disabled={disabled}
            aria-describedby={errorId}
            aria-invalid={hasError}
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground',
              hasError && 'ring-2 ring-destructive-ring focus-visible:ring-destructive-ring'
            )}
          >
            <Clock className="mr-2 h-4 w-4" />
            {value ? formatTime(value) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          {/* Manual time input - Primary */}
          <div className="mb-4">
            <Label className="text-sm font-medium mb-2 block">
              Set Time
            </Label>
            <div className="flex gap-2 items-end">
              <div className="flex flex-col">
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="HH"
                  value={customHour}
                  onChange={(e) => handleHourChange(e.target.value)}
                  className={cn(
                    "w-16 text-center px-3",
                    hourError && "ring-2 ring-destructive"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCustomTimeSubmit()
                    }
                  }}
                  aria-label="Hour"
                  aria-invalid={hourError}
                />
                {hourError && (
                  <span className="text-xs text-destructive mt-1">1-12</span>
                )}
              </div>
              <span className="text-muted-foreground mb-2">:</span>
              <div className="flex flex-col">
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="MM"
                  value={customMinute}
                  onChange={(e) => handleMinuteChange(e.target.value)}
                  className={cn(
                    "w-16 text-center px-3",
                    minuteError && "ring-2 ring-destructive"
                  )}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCustomTimeSubmit()
                    }
                  }}
                  aria-label="Minute"
                  aria-invalid={minuteError}
                />
                {minuteError && (
                  <span className="text-xs text-destructive mt-1">0-59</span>
                )}
              </div>
              <div className="w-20">
                <FormInput
                  id="period-select"
                  label=""
                  inputType="select"
                  value={customPeriod}
                  onChange={(value) => setCustomPeriod(value as 'AM' | 'PM')}
                  hideLabel
                  options={[
                    { value: 'AM', label: 'AM' },
                    { value: 'PM', label: 'PM' }
                  ]}
                />
              </div>
              <Button
                type="button"
                onClick={handleCustomTimeSubmit}
                disabled={!customHour || !customMinute}
                className="ml-2"
              >
                Set
              </Button>
            </div>
          </div>

          {/* Common times grid - Secondary quick picks */}
          <div className="pt-3 border-t">
            <Label className="text-xs text-muted-foreground mb-2 block">
              Quick Pick
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {COMMON_TIMES.map((time) => (
                <Button
                  key={time.value}
                  type="button"
                  variant={value === time.value ? 'default' : 'outline'}
                  onClick={() => handleSelect(time.value)}
                  className="h-9 text-sm"
                >
                  {time.label}
                </Button>
              ))}
            </div>
          </div>
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
