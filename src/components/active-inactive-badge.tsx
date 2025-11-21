'use client'

import { CircleCheck, CircleX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ACTIVE_STATUS_LABELS, INACTIVE_STATUS_LABELS } from '@/lib/constants'

interface ActiveInactiveBadgeProps {
  isActive: boolean
  variant?: "default" | "secondary" | "outline" | "destructive"
  className?: string
  language?: 'en' | 'es'
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export function ActiveInactiveBadge({
  isActive,
  variant,
  className,
  language = 'en',
  showLabel = false,
  size = 'md'
}: ActiveInactiveBadgeProps) {
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  const label = isActive ? ACTIVE_STATUS_LABELS[language] : INACTIVE_STATUS_LABELS[language]

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5",
      isActive ? "text-green-600" : "text-muted-foreground",
      className
    )}>
      {isActive ? (
        <CircleCheck className={iconSize} />
      ) : (
        <CircleX className={iconSize} />
      )}
      {showLabel && (
        <span className="text-sm">
          {label}
        </span>
      )}
    </span>
  )
}
