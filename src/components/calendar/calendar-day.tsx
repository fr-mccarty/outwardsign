'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { CalendarDayProps, CalendarItem } from "./types"
import type { CalendarDay } from "./types"
import {
  ParishEventItemMonth,
  ParishEventItemWeek,
  LiturgicalEventItemDay,
  ParishEventItemDay,
  LiturgicalEventItemWeek
} from './event-items'
import { DayEventsModal } from './day-events-modal'
import { Button } from '@/components/ui/button'

// Map liturgical colors to CSS color values
const LITURGICAL_BORDER_COLORS: Record<string, string> = {
  'purple': 'rgb(168, 85, 247)', // purple-500
  'white': 'rgb(209, 213, 219)', // gray-300
  'red': 'rgb(239, 68, 68)', // red-500
  'green': 'rgb(34, 197, 94)', // green-500
  'gold': 'rgb(234, 179, 8)', // yellow-500
  'rose': 'rgb(244, 114, 182)', // pink-400
  'black': 'rgb(0, 0, 0)',
}

export function CalendarDay<T extends CalendarItem = CalendarItem>({
  day,
  onClick,
  renderContent,
  getItemColor,
  onItemClick,
  maxItemsPerDay = 3,
  view = 'month'
}: CalendarDayProps<T>) {
  const [showAllEventsModal, setShowAllEventsModal] = useState(false)
  const defaultRenderContent = (day: CalendarDay<T>) => {
    const isLiturgicalEvent = (item: any) => item.isLiturgical === true

    // In month view, only show parish events (liturgical shown as color blocks)
    // In week/day views, show all events
    const itemsToShow = view === 'month'
      ? day.items.filter(item => !isLiturgicalEvent(item))
      : day.items

    return (
      <div className="space-y-1">
        {itemsToShow.slice(0, maxItemsPerDay).map((item) => {
          const handleClick = (e: React.MouseEvent) => {
            e.stopPropagation()
            onItemClick?.(item, e)
          }

          // Render liturgical event (only for week/day views)
          if (isLiturgicalEvent(item)) {
            switch (view) {
              case 'day':
                return <LiturgicalEventItemDay key={item.id} event={item} onClick={handleClick} />
              case 'week':
                return <LiturgicalEventItemWeek key={item.id} event={item} onClick={handleClick} />
              default:
                return null // Month view liturgical events shown as color blocks
            }
          }

          // Render parish event
          switch (view) {
            case 'day':
              return <ParishEventItemDay key={item.id} event={item} onClick={handleClick} />
            case 'week':
              return <ParishEventItemWeek key={item.id} event={item} onClick={handleClick} />
            default:
              return <ParishEventItemMonth key={item.id} event={item} onClick={handleClick} />
          }
        })}
        {itemsToShow.length > maxItemsPerDay && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-6 w-full text-muted-foreground hover:text-foreground hover:bg-accent"
            onClick={(e) => {
              e.stopPropagation()
              setShowAllEventsModal(true)
            }}
          >
            +{itemsToShow.length - maxItemsPerDay} more
          </Button>
        )}
      </div>
    )
  }

  const contentRenderer = renderContent || defaultRenderContent

  // Extract liturgical events for color block rendering (month view only)
  const isLiturgicalEvent = (item: any) => item.isLiturgical === true
  const liturgicalEvents = day.items.filter(isLiturgicalEvent)

  // Group colors by liturgical event (each event may have 1 or more colors)
  const liturgicalEventColorGroups: { colors: string[], event: any }[] = []
  liturgicalEvents.forEach((item: any) => {
    const colors = item.liturgicalEvent?.event_data?.color || []
    if (colors.length > 0) {
      liturgicalEventColorGroups.push({ colors, event: item })
    } else if (item.liturgicalColor) {
      liturgicalEventColorGroups.push({ colors: [item.liturgicalColor], event: item })
    }
  })

  // Format date for URL parameter (YYYY-MM-DD)
  const formattedDate = day.date.toISOString().split('T')[0]
  const dayViewUrl = `/calendar?view=day&date=${formattedDate}`

  return (
    <>
      <div
        className={cn(
          "min-h-[100px] border p-3 transition-colors rounded-sm",
          "bg-card",
          !day.isCurrentMonth && "bg-muted/30 text-muted-foreground opacity-60",
          day.isToday && "ring-2 ring-primary bg-primary/5"
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          <Link
            href={dayViewUrl}
            className={cn(
              "font-medium text-sm hover:bg-accent hover:text-accent-foreground rounded px-1.5 py-0.5 -ml-1.5 transition-colors",
              day.isToday && "text-primary font-bold"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {day.date.getDate()}
          </Link>

          {/* Liturgical color blocks (month view only) */}
          {view === 'month' && liturgicalEventColorGroups.length > 0 && (
            <div className="flex gap-1 items-center">
              {liturgicalEventColorGroups.map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className={cn(
                    "flex gap-0 cursor-pointer overflow-hidden rounded-[3px] transition-all hover:scale-110 hover:shadow-md",
                    group.colors.length > 1 && "border border-border"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    onItemClick?.(group.event, e)
                  }}
                >
                  {group.colors.map((color, colorIndex) => (
                    <div
                      key={colorIndex}
                      className="w-2 h-4"
                      style={{
                        backgroundColor: LITURGICAL_BORDER_COLORS[color.toLowerCase()] || 'rgb(156, 163, 175)',
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
        {contentRenderer(day)}
      </div>

      {/* Modal to show all events for this day (only for month view) */}
      {view === 'month' && (
        <DayEventsModal
          open={showAllEventsModal}
          onOpenChange={setShowAllEventsModal}
          date={day.date}
          items={day.items}
          onItemClick={onItemClick}
        />
      )}
    </>
  )
}