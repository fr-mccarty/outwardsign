"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ContentCard } from "@/components/content-card"

interface EmptyStateProps {
  /** Icon to display (typically a Lucide icon) */
  icon?: React.ReactNode
  /** Main heading text */
  title: string
  /** Description text below the title */
  description?: string
  /** Action button or link */
  action?: React.ReactNode
  /** Additional className for the outer container */
  className?: string
}

/**
 * EmptyState - Consistent empty state display in a card
 *
 * Combines ContentCard with centered content and extra vertical padding.
 * Use this for empty list states, no-data states, and loading-complete-but-empty states.
 *
 * Usage:
 * <EmptyState
 *   icon={<Users className="h-16 w-16" />}
 *   title="No users yet"
 *   description="Get started by adding your first user"
 *   action={<Button>Add User</Button>}
 * />
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <ContentCard className={cn("text-center py-12", className)}>
      {icon && (
        <div className="mx-auto mb-4 flex justify-center text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      {description && (
        <p className={cn("text-muted-foreground", action && "mb-6")}>{description}</p>
      )}
      {action && <div className="flex flex-col sm:flex-row gap-3 justify-center">{action}</div>}
    </ContentCard>
  )
}
