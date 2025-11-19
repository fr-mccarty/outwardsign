'use client'

import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface ModuleSaveButtonProps {
  moduleName: string
  isLoading: boolean
  isEditing?: boolean
  form?: string
  type?: 'submit' | 'button'
  onClick?: () => void
}

/**
 * ModuleSaveButton
 *
 * Standardized save button for all module forms.
 * Displays "Save [ModuleName]" for create or "Update [ModuleName]" for edit.
 *
 * Usage:
 * <ModuleSaveButton moduleName="Wedding" isLoading={isLoading} isEditing={isEditing} form="wedding-form" />
 */
export function ModuleSaveButton({
  moduleName,
  isLoading,
  isEditing = false,
  form,
  type = 'submit',
  onClick
}: ModuleSaveButtonProps) {
  const action = isEditing ? 'Update' : 'Save'

  return (
    <Button
      type={type}
      form={form}
      disabled={isLoading}
      onClick={onClick}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Saving...
        </>
      ) : (
        `${action} ${moduleName}`
      )}
    </Button>
  )
}
