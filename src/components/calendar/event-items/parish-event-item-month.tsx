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
        "text-xs px-2 py-1 rounded truncate cursor-pointer transition-all",
        "bg-card text-card-foreground border",
        "hover:shadow-md hover:scale-[1.02] hover:border-primary/50 hover:bg-accent/50"
      )}
      onClick={onClick}
    >
      {event.title}
    </div>
  )
}
