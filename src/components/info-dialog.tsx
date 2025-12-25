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
import Link from 'next/link'

interface InfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  /** Optional content to render in the dialog body */
  children?: ReactNode
  /** Primary action configuration - if href provided, renders as Link */
  primaryAction?: {
    label: string
    href?: string
    onClick?: () => void
    icon?: ReactNode
  }
  /** Label for dismiss button. Defaults to 'Close' */
  dismissLabel?: string
  /** Hide the dismiss button (useful when only primary action matters) */
  hideDismiss?: boolean
}

/**
 * InfoDialog
 *
 * Dialog for displaying informational content to users.
 * Use this for help text, instructions, feature explanations, etc.
 *
 * For confirmations (delete, proceed, etc.), use ConfirmationDialog instead.
 *
 * @example Basic info dialog
 * <InfoDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="How to Use This Feature"
 *   description="This feature allows you to..."
 * />
 *
 * @example With primary action link
 * <InfoDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Get Started"
 *   description="Create your first item to begin."
 *   primaryAction={{ label: "Create Item", href: "/items/create" }}
 * />
 *
 * @example With custom content
 * <InfoDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Steps to Complete"
 * >
 *   <ol className="list-decimal list-inside space-y-2">
 *     <li>Step one</li>
 *     <li>Step two</li>
 *   </ol>
 * </InfoDialog>
 */
export function InfoDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  primaryAction,
  dismissLabel,
  hideDismiss = false,
}: InfoDialogProps) {
  const t = useTranslations('common')

  const handleDismiss = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        {children}

        <DialogFooter>
          {!hideDismiss && (
            <Button variant="ghost" onClick={handleDismiss}>
              {dismissLabel || t('close')}
            </Button>
          )}
          {primaryAction && (
            primaryAction.href ? (
              <Button asChild>
                <Link href={primaryAction.href}>
                  {primaryAction.label}
                  {primaryAction.icon}
                </Link>
              </Button>
            ) : (
              <Button onClick={primaryAction.onClick}>
                {primaryAction.label}
                {primaryAction.icon}
              </Button>
            )
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
