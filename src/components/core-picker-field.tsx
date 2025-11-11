'use client'

import { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import { CorePicker } from '@/components/core-picker'
import { CorePickerFieldProps } from '@/types/core-picker'
import { cn } from '@/lib/utils'

/**
 * CorePickerField - FormField wrapper for CorePicker
 *
 * Features:
 * - Integrates with React Hook Form
 * - Displays validation errors with red border and error message
 * - Manages modal open state internally
 * - Passes selected value to form
 */
export function CorePickerField<T>({
  // Form configuration
  name,
  label,
  description,
  required,
  placeholder = 'Select an item',
  renderSelected,
  emptyText = 'None selected',

  // CorePicker props
  items,
  title,
  searchPlaceholder,
  searchFields,
  getItemLabel,
  getItemId,
  renderItem,
  enableCreate,
  createFields,
  onCreateSubmit,
  createButtonLabel,
  addNewButtonLabel,
  emptyMessage,
  noResultsMessage,
  isLoading,
}: CorePickerFieldProps<T>) {
  const [showPicker, setShowPicker] = useState(false)
  const form = useFormContext()

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error

        // Find the selected item from items array based on field.value
        const selectedItem = field.value
          ? items.find((item) => getItemId(item) === field.value)
          : null

        return (
          <FormItem>
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            <FormControl>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPicker(true)}
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !selectedItem && 'text-muted-foreground',
                  hasError && 'border-destructive focus-visible:ring-destructive'
                )}
              >
                {selectedItem ? (
                  renderSelected ? (
                    renderSelected(selectedItem)
                  ) : (
                    getItemLabel(selectedItem)
                  )
                ) : (
                  placeholder
                )}
              </Button>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />

            {/* CorePicker Modal */}
            <CorePicker<T>
              open={showPicker}
              onOpenChange={setShowPicker}
              items={items}
              selectedItem={selectedItem}
              onSelect={(item) => {
                field.onChange(getItemId(item))
              }}
              title={title}
              searchPlaceholder={searchPlaceholder}
              searchFields={searchFields}
              getItemLabel={getItemLabel}
              getItemId={getItemId}
              renderItem={renderItem}
              enableCreate={enableCreate}
              createFields={createFields}
              onCreateSubmit={onCreateSubmit}
              createButtonLabel={createButtonLabel}
              addNewButtonLabel={addNewButtonLabel}
              emptyMessage={emptyMessage}
              noResultsMessage={noResultsMessage}
              isLoading={isLoading}
            />
          </FormItem>
        )
      }}
    />
  )
}
