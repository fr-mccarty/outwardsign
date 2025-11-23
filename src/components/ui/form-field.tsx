import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface BaseFormFieldProps {
  id: string
  label: string
  description?: string
  required?: boolean
  disabled?: boolean
  className?: string
  formFieldClassName?: string
  error?: string  // Validation error message
}

interface InputFieldProps extends BaseFormFieldProps {
  inputType?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  min?: string
  max?: string
  step?: string
  maxLength?: number
  autoFocus?: boolean
}

interface TextareaFieldProps extends BaseFormFieldProps {
  inputType: 'textarea'
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  resize?: boolean
}

interface SelectFieldProps extends BaseFormFieldProps {
  inputType: 'select'
  value: string
  onChange: (value: string) => void
  children?: React.ReactNode
  options?: Array<{value: string; label: string}>
}

interface CheckboxFieldProps extends BaseFormFieldProps {
  inputType: 'checkbox'
  value: boolean
  onChange: (value: boolean) => void
}

type FormFieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps | CheckboxFieldProps

export function FormField(props: FormFieldProps) {
  const { id, label, description, required = false, disabled = false, className = '', error } = props
  const errorId = error ? `${id}-error` : undefined

  const renderInput = () => {
    const hasError = !!error

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
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder={(props as TextareaFieldProps).placeholder}
            rows={rows}
            className={cn(
              (props as TextareaFieldProps).resize ? 'resize-y' : 'resize-none',
              hasError && 'border-destructive focus-visible:ring-destructive'
            )}
            required={required}
            disabled={disabled}
            aria-describedby={errorId}
            aria-invalid={hasError}
          />
        )
      case 'select':
        return (
          <Select value={props.value} onValueChange={props.onChange} disabled={disabled}>
            <SelectTrigger
              id={id}
              className={cn(hasError && 'border-destructive focus:ring-destructive')}
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
            type={inputProps.inputType || 'text'}
            value={inputProps.value}
            onChange={(e) => inputProps.onChange(e.target.value)}
            placeholder={inputProps.placeholder}
            min={inputProps.min}
            max={inputProps.max}
            step={inputProps.step}
            maxLength={inputProps.maxLength}
            autoFocus={inputProps.autoFocus}
            className={cn(hasError && 'border-destructive focus-visible:ring-destructive')}
            required={required}
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
      <Label htmlFor={id} className={`text-sm font-medium ${description ? '' : 'mb-1'}`}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {description && (
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
