'use client'

import { CalendarDay } from "./calendar-day"
import { CalendarGridProps, CalendarItem, CalendarDay as CalendarDayType } from "./types"

export function CalendarGrid<T extends CalendarItem = CalendarItem>({
  currentDate,
  items,
  view = 'month',
  onDayClick,
  renderDayContent,
  getItemColor,
  onItemClick,
  maxItemsPerDay = 3
}: CalendarGridProps<T>) {
  const getCalendarDays = (): CalendarDayType<T>[] => {
    const days: CalendarDayType<T>[] = []
    let startDate: Date
    let numDays: number

    switch (view) {
      case 'day':
        // Show just one day
        startDate = new Date(currentDate)
        numDays = 1
        break

      case 'week':
        // Show 7 days starting from Sunday
        startDate = new Date(currentDate)
        startDate.setDate(startDate.getDate() - startDate.getDay())
        numDays = 7
        break

      case 'month':
      default:
        // Show 6 weeks (42 days) starting from the Sunday before the first day of the month
        const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        startDate = new Date(firstDay)
        startDate.setDate(startDate.getDate() - startDate.getDay())
        numDays = 42
        break
    }

    const currentDateForLoop = new Date(startDate)

    for (let i = 0; i < numDays; i++) {
      const dayItems = items.filter(item => {
        if (!item.date) return false
        // Compare date strings directly to avoid timezone issues
        const currentDateStr = currentDateForLoop.toISOString().split('T')[0]
        return item.date === currentDateStr
      })

      days.push({
        date: new Date(currentDateForLoop),
        isCurrentMonth: currentDateForLoop.getMonth() === currentDate.getMonth(),
        isToday: currentDateForLoop.toDateString() === new Date().toDateString(),
        items: dayItems
      })

      currentDateForLoop.setDate(currentDateForLoop.getDate() + 1)
    }

    return days
  }

  const days = getCalendarDays()
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const gridCols = view === 'day' ? 'grid-cols-1' : 'grid-cols-7'

  return (
    <div className={`grid ${gridCols} gap-2`}>
      {view !== 'day' && weekDays.map((day) => (
        <div key={day} className="p-2 text-center text-sm font-semibold text-foreground/70 border-b border-border pb-3">
          {day}
        </div>
      ))}
      {days.map((day, index) => (
        <CalendarDay
          key={index}
          day={day}
          onClick={onDayClick}
          renderContent={renderDayContent}
          getItemColor={getItemColor}
          onItemClick={onItemClick}
          maxItemsPerDay={view === 'day' || view === 'week' ? 999 : maxItemsPerDay}
          view={view}
        />
      ))}
    </div>
  )
}