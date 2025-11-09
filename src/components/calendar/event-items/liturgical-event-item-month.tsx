'use client'

import { cn } from '@/lib/utils'
import { GlobalLiturgicalEvent } from '@/lib/actions/global-liturgical-events'

interface LiturgicalEventItemMonthProps {
  event: {
    id: string
    title: string
    liturgicalColor?: string
    liturgicalEvent?: GlobalLiturgicalEvent
  }
  onClick?: (e: React.MouseEvent) => void
}

// Map liturgical colors to background/text styling (without border)
const LITURGICAL_COLOR_BG: Record<string, string> = {
  'purple': 'bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-100',
  'white': 'bg-gray-50 dark:bg-gray-900/30 text-gray-900 dark:text-gray-100',
  'red': 'bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-100',
  'green': 'bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-100',
  'gold': 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-900 dark:text-yellow-100',
  'rose': 'bg-pink-50 dark:bg-pink-950/30 text-pink-900 dark:text-pink-100',
  'black': 'bg-gray-800 dark:bg-gray-950/50 text-gray-100 dark:text-gray-200',
}

// Map liturgical colors to CSS color values for borders
const LITURGICAL_BORDER_COLORS: Record<string, string> = {
  'purple': 'rgb(168, 85, 247)', // purple-500
  'white': 'rgb(209, 213, 219)', // gray-300
  'red': 'rgb(239, 68, 68)', // red-500
  'green': 'rgb(34, 197, 94)', // green-500
  'gold': 'rgb(234, 179, 8)', // yellow-500
  'rose': 'rgb(244, 114, 182)', // pink-400
  'black': 'rgb(0, 0, 0)',
}

export function LiturgicalEventItemMonth({ event, onClick }: LiturgicalEventItemMonthProps) {
  // Get all colors from the event
  const colors = event.liturgicalEvent?.event_data?.color || []
  const primaryColor = (colors[0] || event.liturgicalColor || '').toLowerCase()

  // Get background styling from primary color
  const bgStyles = LITURGICAL_COLOR_BG[primaryColor] || 'bg-muted/50 text-foreground'

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
                backgroundColor: LITURGICAL_BORDER_COLORS[color.toLowerCase()] || 'rgb(156, 163, 175)',
                width: `${liturgicalBarWidth}px`,
              }}
            />
          ))
        ) : primaryColor ? (
          <div
            style={{
              backgroundColor: LITURGICAL_BORDER_COLORS[primaryColor] || 'rgb(156, 163, 175)',
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
