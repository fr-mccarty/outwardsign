'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/link-button"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations } from 'next-intl'

interface CancelButtonProps extends Omit<React.ComponentProps<typeof Button>, 'asChild' | 'type'> {
  href?: string
  onClick?: () => void
  children?: React.ReactNode
  showIcon?: boolean
  /** When true with onNavigate, shows confirmation before navigating */
  isDirty?: boolean
  /** Callback to handle navigation with unsaved changes check */
  onNavigate?: (href: string) => void
}

/**
 * CancelButton Component
 *
 * Unified cancel button for all forms and dialogs.
 *
 * Usage:
 * - Navigation: <CancelButton href="/weddings" />
 * - Dialog: <CancelButton onClick={() => setOpen(false)} />
 * - Custom: <CancelButton href="/home">Go Back</CancelButton>
 * - With unsaved changes: <CancelButton href="/home" isDirty={isDirty} onNavigate={handleNavigation} />
 */
export function CancelButton({
  href,
  onClick,
  children,
  showIcon = false,
  className,
  variant = "outline",
  disabled,
  isDirty,
  onNavigate,
  ...props
}: CancelButtonProps) {
  const t = useTranslations('components.buttons')

  const buttonContent = (
    <>
      {showIcon && <X className="h-4 w-4 mr-2" />}
      {children || t('cancel')}
    </>
  )

  // If onClick is provided, use button with onClick handler (for dialogs)
  if (onClick) {
    return (
      <Button
        type="button"
        variant={variant}
        onClick={onClick}
        disabled={disabled}
        className={cn(className)}
        {...props}
      >
        {buttonContent}
      </Button>
    )
  }

  // Otherwise, use Link for navigation (for forms)
  if (!href) {
    throw new Error('CancelButton requires either href or onClick prop')
  }

  // If isDirty and onNavigate are provided, use button with click handler
  // to intercept navigation and show confirmation dialog
  if (isDirty && onNavigate) {
    return (
      <Button
        type="button"
        variant={variant}
        onClick={() => onNavigate(href)}
        disabled={disabled}
        className={cn(className)}
        {...props}
      >
        {buttonContent}
      </Button>
    )
  }

  return (
    <LinkButton
      href={href}
      variant={variant}
      disabled={disabled}
      className={cn(className)}
      {...props}
    >
      {buttonContent}
    </LinkButton>
  )
}
