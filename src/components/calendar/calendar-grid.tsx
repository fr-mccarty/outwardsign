'use client'

import { CalendarDay } from "./calendar-day"
import { CalendarGridProps, CalendarItem, CalendarDay as CalendarDayType } from "./types"

export function CalendarGrid<T extends CalendarItem = CalendarItem>({
  currentDate,
  items,
  onDayClick,
  renderDayContent,
  getItemColor,
  onItemClick,
  maxItemsPerDay = 3
}: CalendarGridProps<T>) {
  const getMonthCalendarDays = (): CalendarDayType<T>[] => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - startDate.getDay())
    
    const days: CalendarDayType<T>[] = []
    const currentDateForLoop = new Date(startDate)
    
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      const dayItems = items.filter(item => {
        if (!item.date) return false
        const itemDate = new Date(item.date)
        return itemDate.toDateString() === currentDateForLoop.toDateString()
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

  const days = getMonthCalendarDays()
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="grid grid-cols-7 gap-1">
      {weekDays.map((day) => (
        <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
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
          maxItemsPerDay={maxItemsPerDay}
        />
      ))}
    </div>
  )
}