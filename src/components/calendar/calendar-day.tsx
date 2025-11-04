'use client'

import { cn } from '@/lib/utils'
import { CalendarDayProps, CalendarItem } from "./types"
import type { CalendarDay } from "./types"

export function CalendarDay<T extends CalendarItem = CalendarItem>({
  day,
  onClick,
  renderContent,
  getItemColor,
  onItemClick,
  maxItemsPerDay = 3
}: CalendarDayProps<T>) {
  const defaultGetItemColor = (item: T) => "bg-primary/20 text-primary border border-primary/30"
  const itemColorFn = getItemColor || defaultGetItemColor

  const defaultRenderContent = (day: CalendarDay<T>) => (
    <div className="space-y-1">
      {day.items.slice(0, maxItemsPerDay).map((item) => (
        <div
          key={item.id}
          className={cn(
            "text-xs px-2 py-1 rounded truncate cursor-pointer hover:brightness-110 transition-all",
            itemColorFn(item)
          )}
          onClick={(e) => {
            e.stopPropagation()
            onItemClick?.(item, e)
          }}
        >
          {item.title}
        </div>
      ))}
      {day.items.length > maxItemsPerDay && (
        <div className="text-xs text-muted-foreground">
          +{day.items.length - maxItemsPerDay} more
        </div>
      )}
    </div>
  )

  const contentRenderer = renderContent || defaultRenderContent

  return (
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
  )
}