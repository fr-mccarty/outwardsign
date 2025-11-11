import { z } from 'zod'

/**
 * Field type for picker inline creation forms
 */
export type PickerFieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'select'
  | 'textarea'
  | 'custom'

/**
 * Configuration for a single field in the picker's inline creation form
 */
export interface PickerFieldConfig {
  /** Field key matching the entity property name */
  key: string
  /** Display label for the field */
  label: string
  /** Input type */
  type: PickerFieldType
  /** Whether the field is required */
  required?: boolean
  /** Placeholder text */
  placeholder?: string
  /** Helper text description shown below the field */
  description?: string
  /** Zod validation schema for this field */
  validation?: z.ZodType<any>
  /** Options for select fields */
  options?: { value: string; label: string }[]
  /** Custom render function for custom field types */
  render?: (props: {
    value: any
    onChange: (value: any) => void
    error?: string
  }) => React.ReactNode
}

/**
 * Props for CorePicker component
 */
export interface CorePickerProps<T> {
  // Modal state
  /** Whether the picker modal is open */
  open: boolean
  /** Callback when modal open state changes */
  onOpenChange: (open: boolean) => void

  // Data
  /** Array of items to display and search */
  items: T[]
  /** Currently selected item (if any) */
  selectedItem?: T | null
  /** Callback when an item is selected */
  onSelect: (item: T) => void

  // Display configuration
  /** Modal title */
  title: string
  /** Search input placeholder */
  searchPlaceholder?: string
  /** Fields to include in search (array of property keys) */
  searchFields: (keyof T)[]
  /** Function to get display label for an item */
  getItemLabel: (item: T) => string
  /** Function to get unique ID for an item */
  getItemId: (item: T) => string
  /** Optional custom render function for list items */
  renderItem?: (item: T) => React.ReactNode

  // Inline creation
  /** Whether to show inline creation form */
  enableCreate?: boolean
  /** Field configuration for inline creation form */
  createFields?: PickerFieldConfig[]
  /** Callback when creating a new item */
  onCreateSubmit?: (data: any) => Promise<T>
  /** Label for the create button */
  createButtonLabel?: string
  /** Label for the "Add New" button that shows the form */
  addNewButtonLabel?: string
  /** Auto-open the create form when the picker opens */
  autoOpenCreateForm?: boolean
  /** Default values for the create form fields */
  defaultCreateFormData?: Record<string, any>
  /** Custom form component that replaces the default form fields rendering */
  CustomFormComponent?: React.ComponentType<{
    formData: Record<string, any>
    setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>
    errors: Record<string, string>
    isEditMode: boolean
  }>

  // Inline editing
  /** Whether to open in edit mode (skips selection list, goes straight to form) */
  editMode?: boolean
  /** The entity being edited */
  entityToEdit?: T | null
  /** Callback when updating an existing item */
  onUpdateSubmit?: (id: string, data: any) => Promise<T>
  /** Label for the update button */
  updateButtonLabel?: string

  // Empty states
  /** Message to show when no items exist */
  emptyMessage?: string
  /** Message to show when search returns no results */
  noResultsMessage?: string

  // Loading state
  /** Whether items are currently loading */
  isLoading?: boolean
}

/**
 * Props for CorePickerField wrapper component
 */
export interface CorePickerFieldProps<T> extends Omit<CorePickerProps<T>, 'open' | 'onOpenChange' | 'selectedItem' | 'onSelect'> {
  // Form integration
  /** Form field name (for React Hook Form) */
  name: string
  /** Field label */
  label: string
  /** Field description (helper text) */
  description?: string
  /** Whether the field is required */
  required?: boolean
  /** Placeholder for the trigger button when no item selected */
  placeholder?: string

  // Display configuration
  /** Function to render the selected item in the trigger button */
  renderSelected?: (item: T) => React.ReactNode
  /** Fallback text when no item selected */
  emptyText?: string
}
