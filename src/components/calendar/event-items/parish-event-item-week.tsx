'use client'

import { cn } from '@/lib/utils'
import { RELATED_EVENT_TYPE_LABELS } from '@/lib/constants'
import { useAppContext } from '@/contexts/AppContextProvider'
import { getModuleIcon } from '@/components/calendar/module-icons'
import { CalendarTooltip } from '@/components/calendar/calendar-tooltip'

interface ParishEventItemWeekProps {
  event: {
    id: string
    title: string
    event_type?: string
    moduleType?: string | null
    liturgicalColor?: string // Hex color from liturgical calendar
    [key: string]: any
  }
  onClick?: (e: React.MouseEvent) => void
}

export function ParishEventItemWeek({ event, onClick }: ParishEventItemWeekProps) {
  const { userSettings } = useAppContext()
  const userLanguage = (userSettings?.language || 'en') as 'en' | 'es'

  // Get translated event type label
  // 🔴 CRITICAL: Never display raw event_type values - only show if in RELATED_EVENT_TYPE_LABELS
  const eventTypeLabel = event.event_type
    ? RELATED_EVENT_TYPE_LABELS[event.event_type]?.[userLanguage]
    : undefined

  const ModuleIcon = event.moduleType ? getModuleIcon(event.moduleType as any) : null
  const liturgicalColor = event.liturgicalColor

  return (
    <CalendarTooltip title={event.title}>
      <div
        className={cn(
          "text-sm px-3 py-2 rounded cursor-pointer hover:shadow-md transition-all",
          "bg-card text-card-foreground border"
        )}
        onClick={onClick}
      >
        <div className="font-medium flex items-center gap-2 min-w-0">
          {ModuleIcon && <ModuleIcon className="h-4 w-4 flex-shrink-0" />}
          {liturgicalColor && (
            <div
              className="w-2.5 h-2.5 rounded-full border border-background shadow-sm flex-shrink-0"
              style={{ backgroundColor: liturgicalColor }}
            />
          )}
          <span className="truncate">{event.title}</span>
        </div>
        {eventTypeLabel && (
          <div className="text-xs mt-1 opacity-80">
            {eventTypeLabel}
          </div>
        )}
      </div>
    </CalendarTooltip>
  )
}
