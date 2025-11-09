'use client'

import { cn } from '@/lib/utils'

interface ParishEventItemWeekProps {
  event: {
    id: string
    title: string
    event_type?: string
  }
  onClick?: (e: React.MouseEvent) => void
}

export function ParishEventItemWeek({ event, onClick }: ParishEventItemWeekProps) {
  return (
    <div
      className={cn(
        "text-sm px-3 py-2 rounded cursor-pointer hover:brightness-110 transition-all",
        "bg-primary/20 text-primary border border-primary/30"
      )}
      onClick={onClick}
    >
      <div className="font-medium">{event.title}</div>
      {event.event_type && (
        <div className="text-xs mt-1 opacity-80">
          {event.event_type}
        </div>
      )}
    </div>
  )
}
