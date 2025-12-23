'use client'

import { SaveButton } from '@/components/save-button'
import { CancelButton } from '@/components/cancel-button'

interface FormBottomActionsProps {
  isEditing: boolean
  isLoading: boolean
  cancelHref: string
  moduleName: string
}

/**
 * FormBottomActions
 *
 * Standardized bottom actions for all module forms.
 *
 * Behavior:
 * - Both create and edit modes: Shows Save + Cancel buttons
 * - Save button also appears in header (via FormWrapper) for additional convenience
 *
 * Usage:
 * <FormBottomActions
 *   isEditing={isEditing}
 *   isLoading={isLoading}
 *   cancelHref={isEditing ? `/module/${id}` : '/module'}
 *   moduleName="Wedding"
 * />
 */
export function FormBottomActions({
  isEditing,
  isLoading,
  cancelHref,
  moduleName
}: FormBottomActionsProps) {
  // Both create and edit modes: Show Save + Cancel
  return (
    <div className="flex gap-4 justify-end">
      <CancelButton href={cancelHref} disabled={isLoading} />
      <SaveButton moduleName={moduleName} isLoading={isLoading} isEditing={isEditing} />
    </div>
  )
}
