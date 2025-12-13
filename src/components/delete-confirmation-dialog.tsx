"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTranslations } from "next-intl"

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  title?: string
  itemName?: string
  description?: string
  /** Button label, defaults to "Delete". Use "Remove" for membership removals. */
  actionLabel?: string
  /** Optional additional content to display in the dialog body */
  children?: React.ReactNode
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  itemName,
  description,
  actionLabel,
  children,
}: DeleteConfirmationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const t = useTranslations('common')

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch {
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false)
    }
  }

  const dialogTitle = title || t('deleteItem')
  const deleteLabel = actionLabel || t('delete')
  const deletingLabel = isSubmitting
    ? actionLabel === "Remove"
      ? t('removing')
      : t('deleting')
    : deleteLabel

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {description || (
              <>
                {t('areYouSure').replace("?", "")} you want to delete{" "}
                {itemName ? (
                  <>
                    &quot;<span className="font-medium">{itemName}</span>&quot;
                  </>
                ) : (
                  t('thisItem')
                )}
                ? {t('cannotBeUndone')}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {deletingLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}