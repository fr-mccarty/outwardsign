'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Plus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { CorePickerProps, PickerFieldConfig } from '@/types/core-picker'
import { cn } from '@/lib/utils'

/**
 * STABLE DEFAULTS
 * Define these outside the component to prevent infinite re-render loops.
 * When these are defined inline as default parameters, they create new references
 * on every render, causing useEffect dependencies to trigger repeatedly.
 */
const EMPTY_CREATE_FIELDS: PickerFieldConfig[] = []
const EMPTY_FORM_DATA: Record<string, any> = {}

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
  const [createFormData, setCreateFormData] = useState<Record<string, any>>(defaultCreateFormData)
  const [createFormErrors, setCreateFormErrors] = useState<Record<string, string>>({})
  const [isCreating, setIsCreating] = useState(false)
  const [entityIdBeingEdited, setEntityIdBeingEdited] = useState<string | null>(null)

  // Track previous open state to detect transitions
  // Initialize to false so first open triggers initialization
  const previousOpenRef = useRef(false)

  // Determine if we're in edit mode
  const isEditMode = editMode && entityToEdit !== null

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
          if (value !== undefined && value !== null) {
            entityData[field.key] = value
          }
        })
        setCreateFormData(entityData)
        setEntityIdBeingEdited(getItemId(entityToEdit))
      } else {
        // Create mode: use default form data
        setCreateFormData(defaultCreateFormData)
        setEntityIdBeingEdited(null)
      }
      setCreateFormErrors({})
    }

    // Update the ref for next render
    previousOpenRef.current = open
  }, [open, isEditMode, entityToEdit, defaultCreateFormData, createFields, getItemId])

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
  const resetForm = () => {
    setShowCreateForm(false)
    setCreateFormData(defaultCreateFormData)
    setCreateFormErrors({})
    setEntityIdBeingEdited(null)
  }

  // Handle item selection
  const handleItemSelect = (item: T) => {
    onSelect(item)
    onOpenChange(false)
    setSearchQuery('')
    setShowCreateForm(false)
  }

  // Handle create form field change
  const handleCreateFieldChange = (key: string, value: any) => {
    setCreateFormData((prev) => ({ ...prev, [key]: value }))
    // Clear error for this field
    if (createFormErrors[key]) {
      setCreateFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
  }

  // Validate create form
  const validateCreateForm = (): boolean => {
    const errors: Record<string, string> = {}

    createFields.forEach((field) => {
      const value = createFormData[field.key]

      // Check required fields
      if (field.required && !value) {
        errors[field.key] = `${field.label} is required`
        return
      }

      // Run Zod validation if provided
      if (field.validation && value) {
        const result = field.validation.safeParse(value)
        if (!result.success) {
          errors[field.key] = result.error.issues[0].message
        }
      }
    })

    setCreateFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle create/update form submission
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent parent form submission

    if (!validateCreateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      setIsCreating(true)

      let resultItem: T

      if (isEditMode && entityIdBeingEdited && onUpdateSubmit) {
        // Update existing item
        resultItem = await onUpdateSubmit(entityIdBeingEdited, createFormData)
        toast.success(`${title} updated successfully`)
      } else if (onCreateSubmit) {
        // Create new item
        resultItem = await onCreateSubmit(createFormData)
        toast.success(`${title} created successfully`)
      } else {
        return
      }

      // Reset form and auto-select the created/updated item
      resetForm()
      handleItemSelect(resultItem)
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} item:`, error)
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} ${title.toLowerCase()}`)
    } finally {
      setIsCreating(false)
    }
  }

  // Render a form field based on configuration
  const renderFormField = (field: PickerFieldConfig) => {
    const value = createFormData[field.key] || ''
    const error = createFormErrors[field.key]
    const hasError = !!error

    // Custom field type
    if (field.type === 'custom' && field.render) {
      return (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key} className={cn(hasError && 'text-destructive')}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {field.render({
            value,
            onChange: (newValue) => handleCreateFieldChange(field.key, newValue),
            error,
          })}
          {field.description && !hasError && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
          {hasError && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )
    }

    // Select field
    if (field.type === 'select') {
      return (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key} className={cn(hasError && 'text-destructive')}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Select
            value={value}
            onValueChange={(newValue) => handleCreateFieldChange(field.key, newValue)}
          >
            <SelectTrigger
              id={field.key}
              className={cn(hasError && 'border-destructive focus-visible:ring-destructive')}
            >
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {field.description && !hasError && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
          {hasError && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )
    }

    // Textarea field
    if (field.type === 'textarea') {
      return (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key} className={cn(hasError && 'text-destructive')}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Textarea
            id={field.key}
            value={value}
            onChange={(e) => handleCreateFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={cn(hasError && 'border-destructive focus-visible:ring-destructive')}
          />
          {field.description && !hasError && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
          {hasError && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )
    }

    // Checkbox field
    if (field.type === 'checkbox') {
      const checked = value === true || value === 'true'
      return (
        <div key={field.key} className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.key}
              checked={checked}
              onCheckedChange={(newValue) => handleCreateFieldChange(field.key, newValue)}
              className={cn(hasError && 'border-destructive')}
            />
            <Label
              htmlFor={field.key}
              className={cn(
                'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                hasError && 'text-destructive'
              )}
            >
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
          </div>
          {field.description && !hasError && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
          {hasError && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )
    }

    // Standard input fields
    return (
      <div key={field.key} className="space-y-2">
        <Label htmlFor={field.key} className={cn(hasError && 'text-destructive')}>
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Input
          id={field.key}
          type={field.type}
          value={value}
          onChange={(e) => handleCreateFieldChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          className={cn(hasError && 'border-destructive focus-visible:ring-destructive')}
        />
        {field.description && !hasError && (
          <p className="text-sm text-muted-foreground">{field.description}</p>
        )}
        {hasError && <p className="text-sm text-destructive">{error}</p>}
      </div>
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
                variant="link"
                size="sm"
                onClick={resetForm}
                disabled={isCreating}
                className="h-auto p-0 text-sm"
              >
                Select from list instead
              </Button>
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Search input */}
        {!showCreateForm && (
          <div className="flex-shrink-0 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-1">
          {showCreateForm ? (
            /* Inline creation form */
            <form onSubmit={handleCreateSubmit} className="space-y-4 py-1">
              {CustomFormComponent ? (
                <CustomFormComponent
                  formData={createFormData}
                  setFormData={setCreateFormData}
                  errors={createFormErrors}
                  isEditMode={isEditMode}
                />
              ) : (
                createFields.map((field) => renderFormField(field))
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1"
                >
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditMode ? updateButtonLabel : createButtonLabel}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
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

        {/* Add new button (footer) - hide in edit mode */}
        {enableCreate && !showCreateForm && !isEditMode && (
          <div className={cn(
            'flex-shrink-0 pt-4',
            enablePagination ? '' : 'border-t'
          )}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateForm(true)}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              {addNewButtonLabel}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
