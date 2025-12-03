'use client'

import { FormInput } from "@/components/form-input"
import { MODULE_STATUS_VALUES } from "@/lib/constants"
import { getStatusLabel } from "@/lib/content-builders/shared/helpers"
import { SelectItem } from "@/components/ui/select"

interface StatusFilterProps {
  value: string
  onChange: (value: string) => void
  id?: string
  label?: string
  hideLabel?: boolean
  className?: string
  /** Optional custom status values (defaults to MODULE_STATUS_VALUES) */
  statusValues?: readonly string[]
}

/**
 * StatusFilter Component
 *
 * A reusable status filter using FormInput with select type.
 * Displays "All Status" option plus all status values.
 *
 * @example
 * ```tsx
 * <StatusFilter
 *   value={filters.getFilterValue('status')}
 *   onChange={(value) => filters.updateFilter('status', value)}
 *   hideLabel  // Optional: hides label visually but keeps for screen readers
 * />
 *
 * // With custom status values (e.g., for masses)
 * <StatusFilter
 *   value={filters.getFilterValue('status')}
 *   onChange={(value) => filters.updateFilter('status', value)}
 *   statusValues={MASS_STATUS_VALUES}
 *   hideLabel
 * />
 * ```
 */
export function StatusFilter({
  value,
  onChange,
  id = 'status-filter',
  label = 'Status',
  hideLabel = false,
  className,
  statusValues = MODULE_STATUS_VALUES
}: StatusFilterProps) {
  return (
    <FormInput
      id={id}
      label={label}
      hideLabel={hideLabel}
      inputType="select"
      value={value}
      onChange={onChange}
      className={className}
    >
      <SelectItem value="all">All Status</SelectItem>
      {statusValues.map((status) => (
        <SelectItem key={status} value={status}>
          {getStatusLabel(status, 'en')}
        </SelectItem>
      ))}
    </FormInput>
  )
}
