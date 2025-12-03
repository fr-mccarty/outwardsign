import React, { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BaseFormInputProps {
  id: string
  label: string
  description?: string
  required?: boolean
  disabled?: boolean
  className?: string
  formFieldClassName?: string
  error?: string  // Validation error message
  onBlur?: () => void
  /** Hide label visually but keep it accessible for screen readers */
  hideLabel?: boolean
}

interface InputFieldProps extends BaseFormInputProps {
  inputType?: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  min?: string
  max?: string
  step?: string
  maxLength?: number
  autoFocus?: boolean
  // React Hook Form support
  name?: string
  defaultValue?: string
}

interface TextareaFieldProps extends BaseFormInputProps {
  inputType: 'textarea'
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  rows?: number
  resize?: boolean
  // React Hook Form support
  name?: string
  defaultValue?: string
}

interface SelectFieldProps extends BaseFormInputProps {
  inputType: 'select'
  value?: string
  onChange?: (value: string) => void
  children?: React.ReactNode
  options?: Array<{value: string; label: string}>
  // React Hook Form support
  name?: string
  defaultValue?: string
}

interface CheckboxFieldProps extends BaseFormInputProps {
  inputType: 'checkbox'
  value?: boolean
  onChange?: (value: boolean) => void
  // React Hook Form support
  name?: string
  defaultValue?: boolean
}

type FormInputProps = InputFieldProps | TextareaFieldProps | SelectFieldProps | CheckboxFieldProps

export function FormInput(props: FormInputProps) {
  const { id, label, description, required = false, disabled = false, className = '', error, onBlur, hideLabel = false } = props
  const errorId = error ? `${id}-error` : undefined
  const hasError = !!error

  const renderInput = () => {
    switch (props.inputType) {
      case 'checkbox':
        return (
          <Checkbox
            id={id}
            checked={(props as CheckboxFieldProps).value}
            onCheckedChange={(props as CheckboxFieldProps).onChange}
            disabled={disabled}
            aria-describedby={errorId}
            aria-invalid={hasError}
          />
        )
      case 'textarea':
        const rows = (props as TextareaFieldProps).rows || 12
        return (
          <Textarea
            id={id}
            name={(props as TextareaFieldProps).name}
            value={(props as TextareaFieldProps).value}
            defaultValue={(props as TextareaFieldProps).defaultValue}
            onChange={(e) => (props as TextareaFieldProps).onChange?.(e.target.value)}
            onBlur={onBlur}
            placeholder={(props as TextareaFieldProps).placeholder}
            rows={rows}
            className={cn(
              (props as TextareaFieldProps).resize ? 'resize-y' : 'resize-none',
              hasError && 'ring-2 ring-destructive-ring focus-visible:ring-destructive-ring'
            )}
            disabled={disabled}
            aria-describedby={errorId}
            aria-invalid={hasError}
          />
        )
      case 'select':
        return (
          <Select
            value={(props as SelectFieldProps).value}
            defaultValue={(props as SelectFieldProps).defaultValue}
            onValueChange={(props as SelectFieldProps).onChange}
            disabled={disabled}
          >
            <SelectTrigger
              id={id}
              className={cn(hasError && 'ring-2 ring-destructive-ring focus:ring-destructive-ring')}
              aria-describedby={errorId}
              aria-invalid={hasError}
            >
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {(props as SelectFieldProps).options ? (
                (props as SelectFieldProps).options!.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))
              ) : (
                (props as SelectFieldProps).children
              )}
            </SelectContent>
          </Select>
        )
      default:
        const inputProps = props as InputFieldProps
        return (
          <Input
            id={id}
            name={inputProps.name}
            type={inputProps.inputType || 'text'}
            value={inputProps.value}
            defaultValue={inputProps.defaultValue}
            onChange={(e) => inputProps.onChange?.(e.target.value)}
            onBlur={onBlur}
            placeholder={inputProps.placeholder}
            min={inputProps.min}
            max={inputProps.max}
            step={inputProps.step}
            maxLength={inputProps.maxLength}
            autoFocus={inputProps.autoFocus}
            className={cn(hasError && 'ring-2 ring-destructive-ring focus-visible:ring-destructive-ring')}
            disabled={disabled}
            aria-describedby={errorId}
            aria-invalid={hasError}
          />
        )
    }
  }

  // Checkbox has a different layout - label next to checkbox
  if (props.inputType === 'checkbox') {
    return (
      <div className={cn('flex items-start space-x-3', className)}>
        <div className="flex items-center h-6">
          {renderInput()}
        </div>
        <div className="flex-1">
          <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
          {error && (
            <p id={errorId} className="text-sm text-destructive mt-1">
              {error}
            </p>
          )}
        </div>
      </div>
    )
  }

  // Standard layout for other input types
  return (
    <div className={className}>
      {label && (
        <Label
          htmlFor={id}
          className={cn(
            'text-sm font-medium',
            description ? '' : 'mb-1',
            hideLabel && 'sr-only'
          )}
        >
          {label}
          {required && !hideLabel && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {description && !hideLabel && (
        <p className="text-xs text-muted-foreground mb-1.5">{description}</p>
      )}
      {renderInput()}
      {error && (
        <p id={errorId} className="text-sm text-destructive mt-1">
          {error}
        </p>
      )}
    </div>
  )
}