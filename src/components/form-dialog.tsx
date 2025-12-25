'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  /** Form content */
  children: ReactNode
  /** Submit button handler */
  onSubmit: () => void | Promise<void>
  /** Submit button label. Defaults to "Save" */
  submitLabel?: string
  /** Cancel button label. Defaults to "Cancel" */
  cancelLabel?: string
  /** Loading state - disables buttons and shows loading text */
  isLoading?: boolean
  /** Loading label shown on submit button. Defaults to "Saving..." */
  loadingLabel?: string
  /** Disable submit button (e.g., for validation) */
  submitDisabled?: boolean
  /** Custom className for DialogContent */
  contentClassName?: string
  /** Whether the footer should use flex-col on mobile. Defaults to true */
  stackFooterOnMobile?: boolean
}

/**
 * FormDialog
 *
 * Standard dialog wrapper for forms. Provides consistent layout with
 * title, description, form content area, and Cancel/Submit buttons.
 *
 * Use this for any dialog that contains a form requiring user input.
 * For confirmations (delete/proceed), use ConfirmationDialog instead.
 * For informational content, use InfoDialog instead.
 *
 * @example Basic form dialog
 * <FormDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Add Member"
 *   description="Add a new member to the group."
 *   onSubmit={handleSubmit}
 *   isLoading={isSubmitting}
 * >
 *   <FormInput id="name" label="Name" value={name} onChange={setName} />
 *   <FormInput id="email" label="Email" value={email} onChange={setEmail} />
 * </FormDialog>
 *
 * @example With custom labels
 * <FormDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Invite User"
 *   onSubmit={handleInvite}
 *   submitLabel="Send Invite"
 *   loadingLabel="Sending..."
 *   isLoading={isSending}
 * >
 *   ...
 * </FormDialog>
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSubmit,
  submitLabel,
  cancelLabel,
  isLoading = false,
  loadingLabel,
  submitDisabled = false,
  contentClassName,
  stackFooterOnMobile = true,
}: FormDialogProps) {
  const t = useTranslations('common')

  const handleSubmit = async () => {
    await onSubmit()
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={contentClassName}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        {children}

        <DialogFooter className={cn(!stackFooterOnMobile && 'sm:flex-row')}>
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelLabel || t('cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || submitDisabled}
          >
            {isLoading
              ? (loadingLabel || t('saving'))
              : (submitLabel || t('save'))
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
