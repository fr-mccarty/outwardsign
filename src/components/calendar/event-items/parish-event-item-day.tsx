'use client'

import { cn } from '@/lib/utils'

interface ParishEventItemDayProps {
  event: {
    id: string
    title: string
    event_type?: string
    description?: string
  }
  onClick?: (e: React.MouseEvent) => void
}

export function ParishEventItemDay({ event, onClick }: ParishEventItemDayProps) {
  return (
    <div
      className={cn(
        "px-4 py-3 rounded cursor-pointer hover:brightness-110 transition-all",
        "bg-primary/20 text-primary border border-primary/30"
      )}
      onClick={onClick}
    >
      <div className="font-semibold text-base">{event.title}</div>
      {(event.event_type || event.description) && (
        <div className="mt-2 space-y-1">
          {event.event_type && (
            <div className="text-sm font-medium opacity-90">
              {event.event_type}
            </div>
          )}
          {event.description && (
            <p className="text-sm opacity-80">{event.description}</p>
          )}
        </div>
      )}
    </div>
  )
}
