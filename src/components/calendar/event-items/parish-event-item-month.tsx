'use client'

import { cn } from '@/lib/utils'

interface ParishEventItemMonthProps {
  event: {
    id: string
    title: string
  }
  onClick?: (e: React.MouseEvent) => void
}

export function ParishEventItemMonth({ event, onClick }: ParishEventItemMonthProps) {
  return (
    <div
      className={cn(
        "text-xs px-2 py-1 rounded truncate cursor-pointer hover:shadow-md transition-all",
        "bg-card text-card-foreground border"
      )}
      onClick={onClick}
    >
      {event.title}
    </div>
  )
}
