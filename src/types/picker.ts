/**
 * Base picker props interface that all pickers should extend
 * Provides common properties for modal state, selection, and UI customization
 */
export interface BasePickerProps<T> {
  /** Control modal visibility */
  open: boolean
  /** Modal state change handler */
  onOpenChange: (open: boolean) => void
  /** Callback when item is selected */
  onSelect: (item: T) => void
  /** Search placeholder text */
  placeholder?: string
  /** Empty state message */
  emptyMessage?: string
  /** ID of currently selected item (for highlighting) */
  selectedId?: string
  /** Additional CSS classes */
  className?: string
}

/**
 * Props for pickers that support inline creation forms
 * Extends BasePickerProps with form-specific options
 */
export interface BasePickerWithFormProps<T> extends BasePickerProps<T> {
  /** Auto-open the create form (useful for create mode) */
  openToNewItem?: boolean
  /** Array of optional fields to show in the form */
  visibleFields?: string[]
  /** Array of fields that should be marked as required */
  requiredFields?: string[]
}

/**
 * Helper function to check if a field is visible
 * @param fieldName - The field to check
 * @param visibleFields - Array of visible fields (undefined = all visible)
 * @param defaultVisibleFields - Default fields to show when visibleFields is undefined
 */
export function isFieldVisible(
  fieldName: string,
  visibleFields: string[] | undefined,
  defaultVisibleFields: string[]
): boolean {
  if (!visibleFields) {
    return defaultVisibleFields.includes(fieldName)
  }
  return visibleFields.includes(fieldName)
}

/**
 * Helper function to check if a field is required
 * @param fieldName - The field to check
 * @param requiredFields - Array of required fields (undefined = none required except always-required fields)
 */
export function isFieldRequired(
  fieldName: string,
  requiredFields: string[] | undefined
): boolean {
  if (!requiredFields) {
    return false
  }
  return requiredFields.includes(fieldName)
}
