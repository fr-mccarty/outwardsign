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

// Map liturgical colors to styling
const LITURGICAL_COLOR_STYLES: Record<string, string> = {
  'purple': 'bg-purple-50 dark:bg-purple-950/30 border-l-4 border-l-purple-500 text-purple-900 dark:text-purple-100',
  'white': 'bg-gray-50 dark:bg-gray-900/30 border-l-4 border-l-gray-300 text-gray-900 dark:text-gray-100',
  'red': 'bg-red-50 dark:bg-red-950/30 border-l-4 border-l-red-500 text-red-900 dark:text-red-100',
  'green': 'bg-green-50 dark:bg-green-950/30 border-l-4 border-l-green-500 text-green-900 dark:text-green-100',
  'gold': 'bg-yellow-50 dark:bg-yellow-950/30 border-l-4 border-l-yellow-500 text-yellow-900 dark:text-yellow-100',
  'rose': 'bg-pink-50 dark:bg-pink-950/30 border-l-4 border-l-pink-400 text-pink-900 dark:text-pink-100',
  'black': 'bg-gray-800 dark:bg-gray-950/50 border-l-4 border-l-black text-gray-100 dark:text-gray-200',
}

export function LiturgicalEventItemMonth({ event, onClick }: LiturgicalEventItemMonthProps) {
  const color = event.liturgicalColor?.toLowerCase() || ''
  const colorStyles = LITURGICAL_COLOR_STYLES[color] || 'bg-muted/50 border-l-4 border-l-muted text-foreground'

  return (
    <div
      className={cn(
        "text-xs px-2 py-1 rounded truncate cursor-pointer hover:brightness-110 transition-all",
        colorStyles
      )}
      onClick={onClick}
    >
      {event.title}
    </div>
  )
}
