'use client'

interface FormSpacerProps {
  label: string
}

/**
 * FormSpacer Component
 *
 * Renders a visual section divider with heading text.
 * Used in forms when event_type has a 'spacer' field.
 * This is a non-data field - provides visual organization only.
 *
 * Per requirements (2025-12-11-mass-templating-via-event-types.md):
 * - Section header with label
 * - Medium-weight heading (text-lg font-medium)
 * - Top margin for spacing (mt-8 for visual separation)
 * - Muted text color (text-muted-foreground)
 * - Optional border-top for clear visual separation
 */
export function FormSpacer({ label }: FormSpacerProps) {
  return (
    <div className="mt-8 pt-6 border-t border-border">
      <h3 className="text-lg font-medium text-muted-foreground mb-4">
        {label}
      </h3>
    </div>
  )
}
