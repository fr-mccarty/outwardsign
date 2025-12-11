'use client'

import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface MassIntentionTextareaProps {
  fieldName: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  disabled?: boolean
}

/**
 * MassIntentionTextarea Component
 *
 * Renders a textarea input for Mass intentions field type.
 * Used in Mass forms when event_type has a 'mass-intention' field.
 *
 * Per requirements (2025-12-11-mass-templating-via-event-types.md):
 * - Simple textarea for MVP (4-6 rows)
 * - Placeholder text for guidance
 * - Supports required field validation
 */
export function MassIntentionTextarea({
  fieldName,
  value,
  onChange,
  required = false,
  disabled = false
}: MassIntentionTextareaProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={fieldName}>
        {fieldName}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Textarea
        id={fieldName}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder="Enter Mass intentions (one per line or as paragraph)..."
        required={required}
        disabled={disabled}
        className="resize-y"
      />
      {required && !value && (
        <p className="text-sm text-destructive">This field is required</p>
      )}
    </div>
  )
}
