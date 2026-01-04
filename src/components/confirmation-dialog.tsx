"use client"

import { useState, ReactNode } from "react"
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

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "default" | "destructive"
  /** Optional preset for common patterns */
  preset?: "delete" | "remove"
  /** Item name for delete/remove presets */
  itemName?: string
  /** Optional additional content to display in the dialog body */
  children?: ReactNode
  /** Disable the confirm button */
  confirmDisabled?: boolean
}

/**
 * ConfirmationDialog
 *
 * Unified confirmation dialog for all confirmation needs.
 *
 * Usage:
 * - Default confirmation: <ConfirmationDialog title="Confirm" description="..." onConfirm={...} />
 * - Delete preset: <ConfirmationDialog preset="delete" itemName="Wedding" onConfirm={...} />
 * - Remove preset: <ConfirmationDialog preset="remove" itemName="member" onConfirm={...} />
 */
export function ConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "default",
  preset,
  itemName,
  children,
  confirmDisabled = false,
}: ConfirmationDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const t = useTranslations('common')

  // Determine final values based on preset
  const isDestructive = preset === "delete" || preset === "remove" || variant === "destructive"

  const getTitle = () => {
    if (title) return title
    if (preset === "delete") return t('deleteItem')
    if (preset === "remove") return "Remove Item"
    return "Confirm"
  }

  const getDescription = () => {
    if (description) return description
    if (preset === "delete" || preset === "remove") {
      const action = preset === "delete" ? "delete" : "remove"
      return (
        <>
          {t('areYouSure').replace("?", "")} you want to {action}{" "}
          {itemName ? (
            <>
              &quot;<span className="font-medium">{itemName}</span>&quot;
            </>
          ) : (
            t('thisItem')
          )}
          ? {preset === "delete" && t('cannotBeUndone')}
        </>
      )
    }
    return "Are you sure you want to proceed?"
  }

  const getConfirmLabel = () => {
    if (confirmLabel) return confirmLabel
    if (preset === "delete") return t('delete')
    if (preset === "remove") return "Remove"
    return "Confirm"
  }

  const getSubmittingLabel = () => {
    if (preset === "delete") return t('deleting')
    if (preset === "remove") return t('removing')
    // For custom confirmLabel, try to add "ing"
    const label = getConfirmLabel()
    return `${label}ing...`
  }

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
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {cancelLabel || t('cancel')}
          </Button>
          <Button
            variant={isDestructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isSubmitting || confirmDisabled}
          >
            {isSubmitting ? getSubmittingLabel() : getConfirmLabel()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
