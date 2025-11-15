'use client'

import { cn } from '@/lib/utils'
import { EVENT_TYPE_LABELS } from '@/lib/constants'
import { useAppContext } from '@/contexts/AppContextProvider'

interface ParishEventItemWeekProps {
  event: {
    id: string
    title: string
    event_type?: string
  }
  onClick?: (e: React.MouseEvent) => void
}

export function ParishEventItemWeek({ event, onClick }: ParishEventItemWeekProps) {
  const { userSettings } = useAppContext()
  const userLanguage = (userSettings?.language || 'en') as 'en' | 'es'

  // Get translated event type label
  // 🔴 CRITICAL: Never display raw event_type values - only show if in EVENT_TYPE_LABELS
  const eventTypeLabel = event.event_type
    ? EVENT_TYPE_LABELS[event.event_type]?.[userLanguage]
    : undefined

  return (
    <div
      className={cn(
        "text-sm px-3 py-2 rounded cursor-pointer hover:brightness-110 transition-all",
        "bg-primary/20 text-primary border border-primary/30"
      )}
      onClick={onClick}
    >
      <div className="font-medium">{event.title}</div>
      {eventTypeLabel && (
        <div className="text-xs mt-1 opacity-80">
          {eventTypeLabel}
        </div>
      )}
    </div>
  )
}
