'use client'

import { SaveButton } from '@/components/save-button'
import { CancelButton } from '@/components/cancel-button'

interface FormBottomActionsProps {
  isEditing: boolean
  isLoading: boolean
  cancelHref: string
  moduleName: string
  /** Whether the form has unsaved changes */
  isDirty?: boolean
  /** Callback from useUnsavedChanges hook to handle navigation */
  onNavigate?: (href: string) => void
}

/**
 * FormBottomActions
 *
 * Standardized bottom actions for all module forms.
 *
 * Behavior:
 * - Both create and edit modes: Shows Save + Cancel buttons
 * - Save button also appears in header (via FormWrapper) for additional convenience
 * - Supports unsaved changes warning when isDirty and onNavigate are provided
 *
 * Usage:
 * <FormBottomActions
 *   isEditing={isEditing}
 *   isLoading={isLoading}
 *   cancelHref={isEditing ? `/module/${id}` : '/module'}
 *   moduleName="Wedding"
 *   isDirty={isDirty}
 *   onNavigate={unsavedChanges.handleNavigation}
 * />
 */
export function FormBottomActions({
  isEditing,
  isLoading,
  cancelHref,
  moduleName,
  isDirty,
  onNavigate,
}: FormBottomActionsProps) {
  // Both create and edit modes: Show Save + Cancel
  return (
    <div className="flex gap-4 justify-end">
      <CancelButton
        href={cancelHref}
        disabled={isLoading}
        isDirty={isDirty}
        onNavigate={onNavigate}
      />
      <SaveButton moduleName={moduleName} isLoading={isLoading} isEditing={isEditing} />
    </div>
  )
}
