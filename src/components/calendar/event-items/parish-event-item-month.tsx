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
        "text-xs px-2 py-1 rounded truncate cursor-pointer hover:brightness-110 transition-all",
        "bg-primary/20 text-primary border border-primary/30"
      )}
      onClick={onClick}
    >
      {event.title}
    </div>
  )
}
