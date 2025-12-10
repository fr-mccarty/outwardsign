'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { CorePickerProps, PickerFieldConfig } from '@/types/core-picker'
import { cn } from '@/lib/utils'
import { capitalizeFirstLetter } from '@/lib/utils/formatters'
import { FormInput } from '@/components/form-input'
import { SaveButton } from '@/components/save-button'
import { CancelButton } from '@/components/cancel-button'

/**
 * STABLE DEFAULTS
 * Define these outside the component to prevent infinite re-render loops.
 * When these are defined inline as default parameters, they create new references
 * on every render, causing useEffect dependencies to trigger repeatedly.
 */
const EMPTY_CREATE_FIELDS: PickerFieldConfig[] = []
const EMPTY_FORM_DATA: Record<string, any> = {}

/**
 * Build a Zod schema from createFields configuration
 * This allows us to use React Hook Form's zodResolver for validation
 */
function buildSchemaFromFields(fields: PickerFieldConfig[]): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {}

  fields.forEach((field) => {
    // Use the field's custom validation if provided
    if (field.validation) {
      shape[field.key] = field.required
        ? field.validation
        : field.validation.optional()
    } else {
      // Build default schema based on field type
      let fieldSchema: z.ZodTypeAny

      switch (field.type) {
        case 'email':
          fieldSchema = z.string().email('Invalid email address')
          break
        case 'number':
          fieldSchema = z.coerce.number()
          break
        case 'checkbox':
          fieldSchema = z.boolean()
          break
        case 'date':
        case 'time':
        case 'datetime-local':
        case 'text':
        case 'tel':
        case 'textarea':
        case 'select':
        case 'custom':
        default:
          fieldSchema = z.string()
          break
      }

      // Apply required/optional
      if (field.required) {
        if (field.type === 'checkbox') {
          // Checkboxes don't need min length
          shape[field.key] = fieldSchema
        } else {
          // String fields need min(1) to be truly required
          shape[field.key] = fieldSchema.refine(
            (val) => val !== undefined && val !== null && val !== '',
            { message: `${field.label} is required` }
          )
        }
      } else {
        shape[field.key] = fieldSchema.optional().or(z.literal(''))
      }
    }
  })

  return z.object(shape)
}

/**
 * CorePicker - Reusable picker modal component
 *
 * Features:
 * - Client-side search across multiple fields
 * - Optional inline creation form
 * - Custom list item rendering
 * - Support for nested pickers via custom field rendering
 * - Single-select mode
 */
export function CorePicker<T>({
  // Modal state
  open,
  onOpenChange,

  // Data
  items,
  selectedItem,
  onSelect,

  // Display configuration
  title,
  entityName,
  searchPlaceholder = 'Search...',
  searchFields,
  getItemLabel,
  getItemId,
  renderItem,

  // Inline creation
  enableCreate = false,
  createFields = EMPTY_CREATE_FIELDS,
  onCreateSubmit,
  createButtonLabel = 'Create',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addNewButtonLabel = 'Add New',
  autoOpenCreateForm = false,
  defaultCreateFormData = EMPTY_FORM_DATA,
  CustomFormComponent,

  // Inline editing
  editMode = false,
  entityToEdit = null,
  onUpdateSubmit,
  updateButtonLabel = 'Update',

  // Empty states
  emptyMessage = 'No items found',
  noResultsMessage = 'No results found',

  // Loading state
  isLoading = false,

  // Testing
  testId,

  // Pagination
  enablePagination = false,
  totalCount = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onSearch,

  // Custom content
  children,
}: CorePickerProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [entityIdBeingEdited, setEntityIdBeingEdited] = useState<string | null>(null)

  // Track previous open state to detect transitions
  // Initialize to false so first open triggers initialization
  const previousOpenRef = useRef(false)

  // Determine if we're in edit mode
  const isEditMode = editMode && entityToEdit !== null

  // Build Zod schema from createFields - memoized for performance
  const formSchema = useMemo(() => buildSchemaFromFields(createFields), [createFields])

  // Build default values from createFields and defaultCreateFormData
  const defaultValues = useMemo(() => {
    const values: Record<string, any> = {}
    createFields.forEach((field) => {
      values[field.key] = field.type === 'checkbox' ? false : ''
    })
    return { ...values, ...defaultCreateFormData }
  }, [createFields, defaultCreateFormData])

  // Initialize React Hook Form
  const form = useForm<Record<string, any>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const {
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = form

  // Auto-open create form when picker opens (or edit form in edit mode)
  useEffect(() => {
    if (open) {
      if (isEditMode) {
        // Edit mode: auto-open form with entity data
        setShowCreateForm(true)
      } else if (autoOpenCreateForm && enableCreate) {
        // Create mode: auto-open empty form
        setShowCreateForm(true)
      }
    }
  }, [open, autoOpenCreateForm, enableCreate, isEditMode])

  // Initialize form data when picker opens
  // CRITICAL: Only reset form data when picker transitions from closed to open
  // Otherwise, nested pickers (like LocationPicker within EventPicker) will
  // cause the parent form to reset when they open/close
  useEffect(() => {
    const wasOpen = previousOpenRef.current
    const isOpening = !wasOpen && open

    // Only reset form data when transitioning from closed to open
    if (isOpening) {
      if (isEditMode && entityToEdit) {
        // Edit mode: pre-populate form with entity data
        const entityData: Record<string, any> = {}
        createFields.forEach((field) => {
          const value = (entityToEdit as any)[field.key]
          entityData[field.key] = value !== undefined && value !== null ? value : (field.type === 'checkbox' ? false : '')
        })
        reset(entityData)
        setEntityIdBeingEdited(getItemId(entityToEdit))
      } else {
        // Create mode: use default form data
        reset(defaultValues)
        setEntityIdBeingEdited(null)
      }
    }

    // Update the ref for next render
    previousOpenRef.current = open
  }, [open, isEditMode, entityToEdit, defaultValues, createFields, getItemId, reset])

  // Client-side search across multiple fields (only when pagination is disabled)
  const filteredItems = useMemo(() => {
    // When pagination is enabled, parent handles filtering
    if (enablePagination) return items

    // Client-side filtering for non-paginated mode
    if (!searchQuery.trim()) return items

    const query = searchQuery.toLowerCase()
    return items.filter((item) => {
      return searchFields.some((field) => {
        const value = item[field]
        if (value == null) return false
        return String(value).toLowerCase().includes(query)
      })
    })
  }, [items, searchQuery, searchFields, enablePagination])

  // Handle search query change
  const handleSearchChange = (newQuery: string) => {
    setSearchQuery(newQuery)

    // When pagination is enabled, notify parent of search change
    if (enablePagination && onSearch) {
      onSearch(newQuery)
    }
  }

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setShowCreateForm(false)
    reset(defaultValues)
    setEntityIdBeingEdited(null)
  }, [reset, defaultValues])

  // Handle item selection
  const handleItemSelect = (item: T) => {
    onSelect(item)
    onOpenChange(false)
    setSearchQuery('')
    setShowCreateForm(false)
  }

  // Handle create/update form submission (called by React Hook Form's handleSubmit)
  const onFormSubmit = async (formData: Record<string, any>) => {
    try {
      setIsCreating(true)

      let resultItem: T

      if (isEditMode && entityIdBeingEdited && onUpdateSubmit) {
        // Update existing item
        resultItem = await onUpdateSubmit(entityIdBeingEdited, formData)
        toast.success(`${capitalizeFirstLetter(entityName)} updated successfully`)
      } else if (onCreateSubmit) {
        // Create new item
        resultItem = await onCreateSubmit(formData)
        toast.success(`${capitalizeFirstLetter(entityName)} created successfully`)
      } else {
        return
      }

      // Reset form and auto-select the created/updated item
      resetForm()
      handleItemSelect(resultItem)
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} item:`, error)
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} ${entityName}`)
    } finally {
      setIsCreating(false)
    }
  }

  // Wrapper for form submission that prevents parent form bubbling
  const handleFormSubmit = (e: React.FormEvent) => {
    e.stopPropagation() // Prevent parent form submission
    handleSubmit(onFormSubmit)(e)
  }

  // Helper to safely extract error message as string
  const getFieldErrorMessage = (fieldKey: string): string | undefined => {
    const error = errors[fieldKey]
    if (!error) return undefined
    const message = error.message
    return typeof message === 'string' ? message : undefined
  }

  // Render a form field based on configuration using FormInput
  const renderFormField = (field: PickerFieldConfig) => {
    const value = watch(field.key)
    const errorMessage = getFieldErrorMessage(field.key)

    // Custom field type - FormInput doesn't support custom rendering
    if (field.type === 'custom' && field.render) {
      const hasError = !!errorMessage
      return (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key} className={cn(hasError && 'text-destructive')}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {field.render({
            value: value ?? '',
            onChange: (newValue) => setValue(field.key, newValue, { shouldValidate: true }),
            error: errorMessage,
          })}
          {field.description && !hasError && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
          {hasError && <p className="text-sm text-destructive">{errorMessage}</p>}
        </div>
      )
    }

    // Select field
    if (field.type === 'select') {
      return (
        <FormInput
          key={field.key}
          id={field.key}
          label={field.label}
          inputType="select"
          value={value ?? ''}
          onChange={(newValue) => setValue(field.key, newValue, { shouldValidate: true })}
          options={field.options}
          description={field.description}
          required={field.required}
          error={errorMessage}
        />
      )
    }

    // Textarea field
    if (field.type === 'textarea') {
      return (
        <FormInput
          key={field.key}
          id={field.key}
          label={field.label}
          inputType="textarea"
          value={value ?? ''}
          onChange={(newValue) => setValue(field.key, newValue, { shouldValidate: true })}
          placeholder={field.placeholder}
          description={field.description}
          required={field.required}
          error={errorMessage}
        />
      )
    }

    // Checkbox field
    if (field.type === 'checkbox') {
      const checked = value === true || value === 'true'
      return (
        <FormInput
          key={field.key}
          id={field.key}
          label={field.label}
          inputType="checkbox"
          value={checked}
          onChange={(newValue) => setValue(field.key, newValue, { shouldValidate: true })}
          description={field.description}
          required={field.required}
          error={errorMessage}
        />
      )
    }

    // Standard input fields (text, email, tel, date, time, datetime-local, number)
    return (
      <FormInput
        key={field.key}
        id={field.key}
        label={field.label}
        inputType={field.type}
        value={value ?? ''}
        onChange={(newValue) => setValue(field.key, newValue, { shouldValidate: true })}
        placeholder={field.placeholder}
        description={field.description}
        required={field.required}
        error={errorMessage}
      />
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col max-w-2xl max-h-[80vh]" data-testid={testId}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
          {showCreateForm && isEditMode && (
            <DialogDescription>Update the details below.</DialogDescription>
          )}
          {showCreateForm && !isEditMode && (
            <DialogDescription>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetForm}
                disabled={isCreating}
                className="h-6 px-2 text-xs"
              >
                Select from list instead
              </Button>
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Search input with inline "New" button */}
        {!showCreateForm && (
          <div className="flex-shrink-0 flex gap-2 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* Inline "New" button - only show if create is enabled and not in edit mode */}
            {enableCreate && !isEditMode && (
              <Button
                type="button"
                variant="default"
                onClick={() => setShowCreateForm(true)}
                className="flex-shrink-0"
              >
                New {capitalizeFirstLetter(entityName)}
              </Button>
            )}
          </div>
        )}

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-1">
          {showCreateForm ? (
            /* Inline creation form */
            <form onSubmit={handleFormSubmit} className="space-y-4 py-1">
              {CustomFormComponent ? (
                <CustomFormComponent
                  form={form}
                  errors={errors}
                  isEditMode={isEditMode}
                />
              ) : (
                createFields.map((field) => renderFormField(field))
              )}

              <div className="flex gap-2 pt-4 justify-end">
                <CancelButton
                  onClick={resetForm}
                  disabled={isCreating}
                >
                  Cancel
                </CancelButton>
                <SaveButton
                  isLoading={isCreating}
                  loadingText="Saving..."
                  disabled={isCreating}
                >
                  {isEditMode ? updateButtonLabel : createButtonLabel}
                </SaveButton>
              </div>
            </form>
          ) : (
            /* List of items */
            <>
              {/* Custom content (e.g., filters) */}
              {children}

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {items.length === 0 ? emptyMessage : noResultsMessage}
                </div>
              ) : (
                <div className="space-y-2 py-1">
                  {filteredItems.map((item) => {
                    const itemId = getItemId(item)
                    const isSelected = selectedItem && getItemId(selectedItem) === itemId
                    const itemLabel = getItemLabel(item)

                    return (
                      <button
                        key={itemId}
                        type="button"
                        onClick={() => handleItemSelect(item)}
                        aria-label={itemLabel}
                        data-testid={testId ? `${testId}-${itemId}` : undefined}
                        className={cn(
                          'w-full text-left p-3 rounded-md border transition-colors',
                          'hover:bg-accent hover:text-accent-foreground',
                          isSelected && 'bg-accent border-primary'
                        )}
                      >
                        {renderItem ? renderItem(item) : itemLabel}
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination controls */}
        {enablePagination && !showCreateForm && onPageChange && (
          <div className="flex-shrink-0 pt-4 border-t">
            <div className="flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {Math.ceil(totalCount / pageSize) || 1}
                {totalCount > 0 && ` (${totalCount} total)`}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= Math.ceil(totalCount / pageSize) || isLoading}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
