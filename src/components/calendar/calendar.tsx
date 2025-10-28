'use client'

import { Card, CardContent } from "@/components/ui/card"
import { CalendarHeader } from "./calendar-header"
import { CalendarGrid } from "./calendar-grid"
import { CalendarView, CalendarItem } from "./types"

export interface CalendarProps<T extends CalendarItem = CalendarItem> {
  currentDate: Date
  view: CalendarView
  items: T[]
  title: string
  onNavigate: (direction: 'prev' | 'next') => void
  onToday: () => void
  onDayClick?: (date: Date) => void
  onViewChange?: (view: CalendarView) => void
  renderDayContent?: (day: any) => React.ReactNode
  getItemColor?: (item: T) => string
  onItemClick?: (item: T, event: React.MouseEvent) => void
  maxItemsPerDay?: number
  showViewSelector?: boolean
  headerActions?: React.ReactNode
}

export function Calendar<T extends CalendarItem = CalendarItem>({
  currentDate,
  view,
  items,
  title,
  onNavigate,
  onToday,
  onDayClick,
  onViewChange,
  renderDayContent,
  getItemColor,
  onItemClick,
  maxItemsPerDay = 3,
  showViewSelector = false,
  headerActions
}: CalendarProps<T>) {
  return (
    <div className="space-y-6">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onNavigate={onNavigate}
        onToday={onToday}
        onViewChange={onViewChange}
        title={title}
        actions={headerActions}
        showViewSelector={showViewSelector}
      />

      <Card>
        <CardContent className="p-6">
          <CalendarGrid
            currentDate={currentDate}
            items={items}
            onDayClick={onDayClick}
            renderDayContent={renderDayContent}
            getItemColor={getItemColor}
            onItemClick={onItemClick}
            maxItemsPerDay={maxItemsPerDay}
          />
        </CardContent>
      </Card>
    </div>
  )
}