'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface LinkButtonProps extends Omit<React.ComponentProps<typeof Button>, 'asChild'> {
  href: string
  children: React.ReactNode
}

/**
 * LinkButton Component
 *
 * A button that navigates to a URL. Wraps Button with Link.
 *
 * Usage:
 * <LinkButton href="/settings/content-library/123/edit" variant="outline" size="sm">
 *   Edit Content
 * </LinkButton>
 */
export function LinkButton({
  href,
  children,
  className,
  variant = "outline",
  ...props
}: LinkButtonProps) {
  return (
    <Button
      variant={variant}
      asChild
      className={cn(className)}
      {...props}
    >
      <Link href={href}>{children}</Link>
    </Button>
  )
}
