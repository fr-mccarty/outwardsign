'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface CancelButtonProps extends Omit<React.ComponentProps<typeof Button>, 'asChild' | 'type'> {
  href: string
  children?: React.ReactNode
  showIcon?: boolean
}

export function CancelButton({
  href,
  children = "Cancel",
  showIcon = false,
  className,
  variant = "outline",
  ...props
}: CancelButtonProps) {
  return (
    <Button
      type="button"
      variant={variant}
      asChild
      className={cn(className)}
      {...props}
    >
      <Link href={href}>
        {showIcon && <X className="h-4 w-4" />}
        {children}
      </Link>
    </Button>
  )
}
