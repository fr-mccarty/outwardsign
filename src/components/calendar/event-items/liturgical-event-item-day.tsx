'use client'

import { cn } from '@/lib/utils'
import { GlobalLiturgicalEvent } from '@/lib/actions/global-liturgical-events'
import { getLiturgicalColorClasses, getLiturgicalCssVarValue } from '@/lib/utils/liturgical-colors'
import { LITURGICAL_COLOR_BAR_TOTAL_WIDTH } from '@/lib/constants'

interface LiturgicalEventItemDayProps {
  event: {
    id: string
    title: string
    liturgicalColor?: string
    liturgicalEvent?: GlobalLiturgicalEvent
  }
  onClick?: (e: React.MouseEvent) => void
}

export function LiturgicalEventItemDay({ event, onClick }: LiturgicalEventItemDayProps) {
  // Get all colors from the event
  const colors = event.liturgicalEvent?.event_data?.color || []
  const primaryColor = (colors[0] || event.liturgicalColor || '').toLowerCase()

  // Get liturgical color classes (handles empty/null internally)
  const colorStyles = getLiturgicalColorClasses(primaryColor, 10)

  // Total width of all liturgical bars combined (in pixels)
  const colorCount = colors.length > 0 ? colors.length : 1
  const liturgicalBarWidth = LITURGICAL_COLOR_BAR_TOTAL_WIDTH / colorCount

  return (
    <div
      className={cn(
        "relative py-3 rounded cursor-pointer hover:brightness-110 transition-all overflow-hidden",
        colorStyles
      )}
      onClick={onClick}
    >
      {/* Vertical liturgical bars on the left */}
      <div
        className="absolute left-0 top-0 bottom-0 flex flex-row"
        style={{ width: `${LITURGICAL_COLOR_BAR_TOTAL_WIDTH}px` }}
      >
        {colors.length > 0 ? (
          colors.map((color, index) => (
            <div
              key={index}
              style={{
                backgroundColor: getLiturgicalCssVarValue(color),
                width: `${liturgicalBarWidth}px`,
              }}
            />
          ))
        ) : primaryColor ? (
          <div
            style={{
              backgroundColor: getLiturgicalCssVarValue(primaryColor),
              width: `${liturgicalBarWidth}px`,
            }}
          />
        ) : null}
      </div>

      {/* Content with left padding to account for liturgical bars */}
      <div style={{ paddingLeft: `${LITURGICAL_COLOR_BAR_TOTAL_WIDTH + 16}px`, paddingRight: '16px' }}>
        <div className="font-semibold text-base">{event.title}</div>
        {event.liturgicalEvent && colors.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="text-xs opacity-75">
              Liturgical Color{colors.length > 1 ? 's' : ''}: {colors.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
