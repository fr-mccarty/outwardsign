'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

type LinkProps = React.ComponentProps<typeof Link>
type ButtonProps = React.ComponentProps<typeof Button>

interface LinkButtonProps extends Omit<ButtonProps, 'asChild'> {
  href: string
  children: React.ReactNode
  /** Open link in new tab */
  target?: LinkProps['target']
  /** Relationship for external links */
  rel?: LinkProps['rel']
  /** Prefetch behavior */
  prefetch?: LinkProps['prefetch']
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
 *
 * External link:
 * <LinkButton href="/docs/help" target="_blank" rel="noopener noreferrer">
 *   Help Documentation
 * </LinkButton>
 */
export function LinkButton({
  href,
  children,
  className,
  variant = "outline",
  target,
  rel,
  prefetch,
  ...props
}: LinkButtonProps) {
  return (
    <Button
      variant={variant}
      asChild
      className={cn(className)}
      {...props}
    >
      <Link href={href} target={target} rel={rel} prefetch={prefetch}>{children}</Link>
    </Button>
  )
}
