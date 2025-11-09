'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { CalendarDayProps, CalendarItem } from "./types"
import type { CalendarDay } from "./types"
import {
  LiturgicalEventItemMonth,
  ParishEventItemMonth,
  LiturgicalEventItemWeek,
  ParishEventItemWeek,
  LiturgicalEventItemDay,
  ParishEventItemDay
} from './event-items'
import { DayEventsModal } from './day-events-modal'
import { Button } from '@/components/ui/button'

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

    return (
      <div className="space-y-1">
        {day.items.slice(0, maxItemsPerDay).map((item) => {
          const handleClick = (e: React.MouseEvent) => {
            e.stopPropagation()
            onItemClick?.(item, e)
          }

          // Render liturgical event
          if (isLiturgicalEvent(item)) {
            switch (view) {
              case 'day':
                return <LiturgicalEventItemDay key={item.id} event={item} onClick={handleClick} />
              case 'week':
                return <LiturgicalEventItemWeek key={item.id} event={item} onClick={handleClick} />
              default:
                return <LiturgicalEventItemMonth key={item.id} event={item} onClick={handleClick} />
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
        {day.items.length > maxItemsPerDay && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-6 w-full text-muted-foreground hover:text-foreground hover:bg-accent"
            onClick={(e) => {
              e.stopPropagation()
              setShowAllEventsModal(true)
            }}
          >
            +{day.items.length - maxItemsPerDay} more
          </Button>
        )}
      </div>
    )
  }

  const contentRenderer = renderContent || defaultRenderContent

  return (
    <>
      <div
        className={cn(
          "min-h-[100px] border p-3 cursor-pointer transition-colors rounded-sm",
          "bg-card hover:bg-accent/50",
          !day.isCurrentMonth && "bg-muted/30 text-muted-foreground opacity-60",
          day.isToday && "ring-2 ring-primary bg-primary/5"
        )}
        onClick={() => onClick?.(day.date)}
      >
        <div className={cn(
          "font-medium text-sm mb-2",
          day.isToday && "text-primary font-bold"
        )}>
          {day.date.getDate()}
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