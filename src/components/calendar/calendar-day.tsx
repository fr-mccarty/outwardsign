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
  const defaultGetItemColor = (item: T) => "bg-blue-100 text-blue-800"
  const itemColorFn = getItemColor || defaultGetItemColor

  const defaultRenderContent = (day: CalendarDay<T>) => (
    <div className="space-y-1">
      {day.items.slice(0, maxItemsPerDay).map((item) => (
        <div
          key={item.id}
          className={cn(
            "text-xs px-2 py-1 rounded truncate cursor-pointer hover:brightness-95",
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
        "min-h-[100px] border border-gray-200 p-2 cursor-pointer hover:bg-gray-50",
        !day.isCurrentMonth && "bg-gray-50 text-muted-foreground",
        day.isToday && "bg-blue-50 border-blue-300"
      )}
      onClick={() => onClick?.(day.date)}
    >
      <div className="font-medium text-sm mb-1">
        {day.date.getDate()}
      </div>
      {contentRenderer(day)}
    </div>
  )
}