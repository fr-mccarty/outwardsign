/**
 * Loading Component
 *
 * **Use Cases:**
 * - Route-level loading states → Use `variant="route"`
 * - Client component loading states (dialogs, modals) → Use `variant="spinner"`
 * - Inline loading indicators → Use `variant="spinner"` with `centered={false}`
 * - Skeleton states → Use `variant="skeleton-cards"`, `"skeleton-list"`, or `"skeleton-table"`
 *
 * **Variants:**
 * - `spinner` - Default spinning loader with optional message
 * - `route` - Full page layout skeleton (search bar + card grid) for route-level loading
 * - `skeleton-cards` - Card grid skeleton
 * - `skeleton-list` - List items skeleton
 * - `skeleton-table` - Table with search bar skeleton
 */

import { Loader2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PAGE_MAX_WIDTH_CLASS } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface LoadingProps {
  message?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  centered?: boolean
  variant?: 'spinner' | 'route' | 'skeleton-cards' | 'skeleton-list' | 'skeleton-table'
}

export function Loading({
  message = "Loading...",
  className,
  size = 'md',
  centered = true,
  variant = 'spinner'
}: LoadingProps) {
  const sizeClasses = {
    'sm': 'h-4 w-4',
    'md': 'h-6 w-6',
    'lg': 'h-8 w-8'
  }

  const containerClasses = cn(
    "flex items-center gap-2",
    centered && "justify-center py-8",
    className
  )

  if (variant === 'route') {
    return (
      <div className={`px-6 pt-8 pb-12`}>
        <div className={`space-y-6 ${PAGE_MAX_WIDTH_CLASS} mx-auto`}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-10 w-40" />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'skeleton-cards') {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'skeleton-list') {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'skeleton-table') {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Search bar skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Table skeleton */}
        <div className="border rounded-lg">
          {/* Table header */}
          <div className="border-b bg-muted/50 px-4 py-3">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20 hidden md:block" />
              <Skeleton className="h-4 w-16 hidden lg:block" />
              <div className="flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Table rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-b last:border-b-0 px-4 py-3">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16 hidden md:block" />
                <Skeleton className="h-4 w-20 hidden lg:block" />
                <div className="flex-1" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Default spinner variant
  return (
    <div className={containerClasses}>
      <Loader2 className={cn("animate-spin text-muted-foreground", sizeClasses[size])} />
      <span className="text-muted-foreground">{message}</span>
    </div>
  )
}
