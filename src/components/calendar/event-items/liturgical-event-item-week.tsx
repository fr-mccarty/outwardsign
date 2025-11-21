'use client'

import { cn } from '@/lib/utils'
import { GlobalLiturgicalEvent } from '@/lib/actions/global-liturgical-events'
import { getLiturgicalColorClasses, getLiturgicalCssVarValue } from '@/lib/utils/liturgical-colors'
import { CalendarTooltip } from '@/components/calendar/calendar-tooltip'
import { LITURGICAL_COLOR_BAR_TOTAL_WIDTH } from '@/lib/constants'

interface LiturgicalEventItemWeekProps {
  event: {
    id: string
    title: string
    liturgicalColor?: string
    liturgicalEvent?: GlobalLiturgicalEvent
  }
  onClick?: (e: React.MouseEvent) => void
}

export function LiturgicalEventItemWeek({ event, onClick }: LiturgicalEventItemWeekProps) {
  // Get all colors from the event
  const colors = event.liturgicalEvent?.event_data?.color || []
  const primaryColor = (colors[0] || event.liturgicalColor || '').toLowerCase()

  // Get liturgical color classes (handles empty/null internally)
  const colorStyles = getLiturgicalColorClasses(primaryColor, 10)

  // Total width of all liturgical bars combined (in pixels)
  const colorCount = colors.length > 0 ? colors.length : 1
  const liturgicalBarWidth = LITURGICAL_COLOR_BAR_TOTAL_WIDTH / colorCount

  return (
    <CalendarTooltip title={event.title}>
      <div
        className={cn(
          "relative text-sm py-2 rounded cursor-pointer hover:brightness-110 transition-all overflow-hidden",
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
        <div style={{ paddingLeft: `${LITURGICAL_COLOR_BAR_TOTAL_WIDTH + 12}px`, paddingRight: '12px' }}>
          <div className="font-medium truncate">{event.title}</div>
        </div>
      </div>
    </CalendarTooltip>
  )
}
