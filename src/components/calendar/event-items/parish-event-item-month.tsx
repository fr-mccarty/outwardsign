'use client'

import { cn } from '@/lib/utils'
import { getModuleIcon, getIconByName } from '@/components/calendar/module-icons'
import { CalendarTooltip } from '@/components/calendar/calendar-tooltip'
import { formatTime } from '@/lib/utils/formatters'

interface ParishEventItemMonthProps {
  event: {
    id: string
    title: string
    moduleType?: string | null
    eventTypeIcon?: string | null  // Lucide icon name from event_type
    liturgicalColor?: string // Hex color from liturgical calendar
    start_time?: string | null
    [key: string]: any
  }
  onClick?: (e: React.MouseEvent) => void
}

export function ParishEventItemMonth({ event, onClick }: ParishEventItemMonthProps) {
  // Priority: module icon (for linked modules) > event type icon > default FileText
  const ModuleIcon = event.moduleType
    ? getModuleIcon(event.moduleType as any) || getIconByName(event.eventTypeIcon)
    : getIconByName(event.eventTypeIcon)

  // Extract liturgical color for left border
  const liturgicalColor = event.liturgicalColor

  // Format tooltip title with time if available
  const tooltipTitle = event.start_time
    ? `${event.title} - ${formatTime(event.start_time)}`
    : event.title

  return (
    <CalendarTooltip title={tooltipTitle}>
      <div
        className={cn(
          "text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded cursor-pointer transition-all flex items-center gap-0.5 sm:gap-1",
          "bg-card text-card-foreground border",
          "hover:shadow-md hover:scale-[1.02] hover:border-primary/50 hover:bg-accent"
        )}
        onClick={onClick}
      >
        <ModuleIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
        {liturgicalColor && (
          <div
            className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border border-background shadow-sm flex-shrink-0"
            style={{ backgroundColor: liturgicalColor }}
          />
        )}
        <span className="truncate">{event.title}</span>
      </div>
    </CalendarTooltip>
  )
}
