'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations } from 'next-intl'

interface SaveButtonProps extends Omit<React.ComponentProps<typeof Button>, 'children'> {
  isLoading?: boolean
  loadingText?: string
  children?: React.ReactNode
  showIcon?: boolean
  /** Optional: Module name for standardized text like "Save Wedding" or "Update Wedding" */
  moduleName?: string
  /** When true, displays "Update" instead of "Save" */
  isEditing?: boolean
  /** Form ID to associate with the button (for form attribute) */
  form?: string
}

/**
 * SaveButton Component
 *
 * Unified save button for all forms and modules.
 *
 * Usage:
 * - Simple: <SaveButton isLoading={isLoading}>Save</SaveButton>
 * - Module: <SaveButton isLoading={isLoading} moduleName="Wedding" isEditing={false} />
 * - Custom: <SaveButton isLoading={isLoading} loadingText="Processing...">Submit</SaveButton>
 */
export function SaveButton({
  isLoading = false,
  loadingText,
  children,
  showIcon = true,
  moduleName,
  isEditing = false,
  className,
  disabled,
  form,
  type = 'submit',
  ...props
}: SaveButtonProps) {
  const t = useTranslations('components.buttons')
  const tCommon = useTranslations('common')

  // Determine button text
  const getButtonText = () => {
    if (children) return children
    if (moduleName) {
      const action = isEditing ? t('update') : t('save')
      return `${action} ${moduleName}`
    }
    return isEditing ? t('update') : t('save')
  }

  // Determine loading text
  const getLoadingText = () => {
    if (loadingText) return loadingText
    return tCommon('saving')
  }

  return (
    <Button
      type={type}
      form={form}
      disabled={isLoading || disabled}
      className={cn(className)}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {getLoadingText()}
        </>
      ) : (
        <>
          {showIcon && <Save className="h-4 w-4 mr-2" />}
          {getButtonText()}
        </>
      )}
    </Button>
  )
}
