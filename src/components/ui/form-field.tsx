import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface BaseFormFieldProps {
  id: string
  label: string
  description?: string
  required?: boolean
  disabled?: boolean
  className?: string
  formFieldClassName?: string
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

type FormFieldProps = InputFieldProps | TextareaFieldProps | SelectFieldProps

export function FormField(props: FormFieldProps) {
  const { id, label, description, required = false, disabled = false, className = '' } = props

  const renderInput = () => {
    switch (props.inputType) {
      case 'textarea':
        const rows = (props as TextareaFieldProps).rows || 12
        return (
          <Textarea
            id={id}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder={(props as TextareaFieldProps).placeholder}
            rows={rows}
            className={`${(props as TextareaFieldProps).resize ? 'resize-y' : 'resize-none'}`}
            required={required}
            disabled={disabled}
          />
        )
      case 'select':
        return (
          <Select value={props.value} onValueChange={props.onChange} disabled={disabled}>
            <SelectTrigger>
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
        return (
          <Input
            id={id}
            type={props.inputType || 'text'}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder={(props as InputFieldProps).placeholder}
            min={(props as InputFieldProps).min}
            max={(props as InputFieldProps).max}
            step={(props as InputFieldProps).step}
            maxLength={(props as InputFieldProps).maxLength}
            required={required}
            disabled={disabled}
          />
        )
    }
  }

  return (
    <div className={className}>
      <Label htmlFor={id} className={`text-sm font-medium ${description ? '' : 'mb-1'}`}>{label}</Label>
      {description && (
        <p className="text-xs text-muted-foreground mb-1.5">{description}</p>
      )}
      {renderInput()}
    </div>
  )
}