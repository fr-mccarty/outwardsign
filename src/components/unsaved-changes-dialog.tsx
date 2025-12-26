"use client"

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

interface UnsavedChangesDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * UnsavedChangesDialog
 *
 * Warning dialog shown when user tries to navigate away from a form with unsaved changes.
 *
 * Usage:
 * <UnsavedChangesDialog
 *   open={showDialog}
 *   onConfirm={confirmNavigation}
 *   onCancel={cancelNavigation}
 * />
 */
export function UnsavedChangesDialog({
  open,
  onConfirm,
  onCancel,
}: UnsavedChangesDialogProps) {
  const t = useTranslations('common')

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('unsavedChanges')}</DialogTitle>
          <DialogDescription>{t('unsavedChangesDescription')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {t('stayOnPage')}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {t('leaveWithoutSaving')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
