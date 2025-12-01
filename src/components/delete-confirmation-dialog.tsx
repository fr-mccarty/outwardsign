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
  title = "Delete Item",
  itemName,
  description,
  actionLabel = "Delete",
  children,
}: DeleteConfirmationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description || (
              <>
                Are you sure you want to delete{" "}
                {itemName ? (
                  <>
                    &quot;<span className="font-medium">{itemName}</span>&quot;
                  </>
                ) : (
                  "this item"
                )}
                ? This action cannot be undone.
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
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? `${actionLabel.replace(/e$/, '')}ing...` : actionLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}