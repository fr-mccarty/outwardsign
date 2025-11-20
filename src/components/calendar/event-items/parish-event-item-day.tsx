'use client'

import { cn } from '@/lib/utils'
import { EVENT_TYPE_LABELS } from '@/lib/constants'
import { useAppContext } from '@/contexts/AppContextProvider'
import { getModuleIcon } from '@/components/calendar/module-icons'

interface ParishEventItemDayProps {
  event: {
    id: string
    title: string
    event_type?: string
    description?: string
    moduleType?: string | null
  }
  onClick?: (e: React.MouseEvent) => void
}

export function ParishEventItemDay({ event, onClick }: ParishEventItemDayProps) {
  const { userSettings } = useAppContext()
  const userLanguage = (userSettings?.language || 'en') as 'en' | 'es'

  // Get translated event type label
  // 🔴 CRITICAL: Never display raw event_type values - only show if in EVENT_TYPE_LABELS
  const eventTypeLabel = event.event_type
    ? EVENT_TYPE_LABELS[event.event_type]?.[userLanguage]
    : undefined

  const ModuleIcon = event.moduleType ? getModuleIcon(event.moduleType as any) : null

  return (
    <div
      className={cn(
        "px-4 py-3 rounded cursor-pointer hover:shadow-md transition-all",
        "bg-card text-card-foreground border"
      )}
      onClick={onClick}
    >
      <div className="font-semibold text-base flex items-center gap-2 min-w-0">
        {ModuleIcon && <ModuleIcon className="h-5 w-5 flex-shrink-0" />}
        <span className="truncate">{event.title}</span>
      </div>
      {(eventTypeLabel || event.description) && (
        <div className="mt-2 space-y-1">
          {eventTypeLabel && (
            <div className="text-sm font-medium opacity-90">
              {eventTypeLabel}
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
