'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useTranslations } from 'next-intl'

interface CancelButtonProps extends Omit<React.ComponentProps<typeof Button>, 'asChild' | 'type'> {
  href?: string
  onClick?: () => void
  children?: React.ReactNode
  showIcon?: boolean
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
 */
export function CancelButton({
  href,
  onClick,
  children,
  showIcon = false,
  className,
  variant = "outline",
  disabled,
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

  return (
    <Button
      type="button"
      variant={variant}
      asChild
      disabled={disabled}
      className={cn(className)}
      {...props}
    >
      <Link href={href}>{buttonContent}</Link>
    </Button>
  )
}
