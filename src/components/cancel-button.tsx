'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface CancelButtonProps extends Omit<React.ComponentProps<typeof Button>, 'asChild' | 'type'> {
  href?: string
  onClick?: () => void
  children?: React.ReactNode
  showIcon?: boolean
}

export function CancelButton({
  href,
  onClick,
  children = "Cancel",
  showIcon = false,
  className,
  variant = "outline",
  ...props
}: CancelButtonProps) {
  // If onClick is provided, use button with onClick handler (for dialogs)
  if (onClick) {
    return (
      <Button
        type="button"
        variant={variant}
        onClick={onClick}
        className={cn(className)}
        {...props}
      >
        {showIcon && <X className="h-4 w-4 mr-2" />}
        {children}
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
      className={cn(className)}
      {...props}
    >
      <Link href={href}>
        {showIcon && <X className="h-4 w-4 mr-2" />}
        {children}
      </Link>
    </Button>
  )
}
