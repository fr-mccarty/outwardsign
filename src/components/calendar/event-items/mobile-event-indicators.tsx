'use client'

import { getModuleIcon } from '@/components/calendar/module-icons'

interface MobileEventIndicatorsProps {
  parishEvents: Array<{
    id: string
    moduleType?: string | null
    [key: string]: any
  }>
  maxItems?: number
  onClick?: () => void
}

export function MobileEventIndicators({
  parishEvents,
  maxItems = 5,
  onClick
}: MobileEventIndicatorsProps) {
  if (parishEvents.length === 0) return null

  const showCount = parishEvents.length > maxItems
  const itemsToShow = showCount ? maxItems - 1 : parishEvents.length
  const hiddenCount = parishEvents.length - itemsToShow

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 p-1 -m-1 rounded hover:bg-accent/50 active:bg-accent transition-colors"
      aria-label={`${parishEvents.length} event${parishEvents.length !== 1 ? 's' : ''}`}
    >
      {/* Parish event icons */}
      {parishEvents.slice(0, itemsToShow).map((event, index) => {
        const ModuleIcon = event.moduleType ? getModuleIcon(event.moduleType as any) : null

        if (!ModuleIcon) {
          // Fallback dot if no icon
          return (
            <div
              key={event.id || `parish-${index}`}
              className="w-2 h-2 rounded-full bg-muted-foreground flex-shrink-0"
            />
          )
        }

        return (
          <ModuleIcon
            key={event.id || `parish-${index}`}
            className="h-3.5 w-3.5 flex-shrink-0 text-foreground/70"
          />
        )
      })}

      {/* Count for hidden items */}
      {hiddenCount > 0 && (
        <span className="text-[9px] font-medium text-muted-foreground ml-0.5">
          +{hiddenCount}
        </span>
      )}
    </button>
  )
}
