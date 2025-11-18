'use client'

import { cn } from '@/lib/utils'
import { GlobalLiturgicalEvent } from '@/lib/actions/global-liturgical-events'
import { getLiturgicalColorClasses, getLiturgicalCssVarValue } from '@/lib/utils/liturgical-colors'

interface LiturgicalEventItemMonthProps {
  event: {
    id: string
    title: string
    liturgicalColor?: string
    liturgicalEvent?: GlobalLiturgicalEvent
  }
  onClick?: (e: React.MouseEvent) => void
}

export function LiturgicalEventItemMonth({ event, onClick }: LiturgicalEventItemMonthProps) {
  // Get all colors from the event
  const colors = event.liturgicalEvent?.event_data?.color || []
  const primaryColor = (colors[0] || event.liturgicalColor || '').toLowerCase()

  // Get liturgical color classes (handles empty/null internally)
  const bgStyles = getLiturgicalColorClasses(primaryColor, 10)

  // Width of each individual liturgical bar (in pixels)
  const liturgicalBarWidth = 6
  const totalBarsWidth = colors.length > 0 ? colors.length * liturgicalBarWidth : liturgicalBarWidth

  return (
    <div
      className={cn(
        "relative text-xs py-1 rounded truncate cursor-pointer hover:brightness-110 transition-all overflow-hidden",
        bgStyles
      )}
      onClick={onClick}
    >
      {/* Vertical liturgical bars on the left */}
      <div
        className="absolute left-0 top-0 bottom-0 flex flex-row"
        style={{ width: `${totalBarsWidth}px` }}
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
      <div style={{ paddingLeft: `${totalBarsWidth + 8}px`, paddingRight: '8px' }}>
        {event.title}
      </div>
    </div>
  )
}
