'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import type { Event } from '@/lib/types'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MiniCalendarProps {
  events: Event[]
}

export function MiniCalendar({ events }: MiniCalendarProps) {
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = React.useState(new Date())

  // Get dates that have events
  const eventDates = React.useMemo(() => {
    const dateMap = new Map<string, Event[]>()
    events.forEach(event => {
      if (event.start_date) {
        const dateStr = format(new Date(event.start_date), 'yyyy-MM-dd')
        if (!dateMap.has(dateStr)) {
          dateMap.set(dateStr, [])
        }
        dateMap.get(dateStr)!.push(event)
      }
    })
    return dateMap
  }, [events])

  // Get calendar days for the current month
  const calendarDays = React.useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  }, [currentMonth])

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  // Handle day click - navigate to calendar view with the selected date
  const handleDayClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    router.push(`/calendar?view=day&date=${dateStr}`)
  }

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  return (
    <div className="mini-calendar w-full">
      {/* Header with month navigation */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={goToNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday headers */}
        {weekDays.map(day => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground pb-1"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {calendarDays.map((day, index) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const dayEvents = eventDates.get(dateStr) || []
          const hasEvents = dayEvents.length > 0
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isCurrentDay = isToday(day)

          return (
            <button
              key={index}
              onClick={() => handleDayClick(day)}
              className={cn(
                "aspect-square p-0 text-xs flex flex-col items-center justify-center relative rounded-md transition-colors",
                "hover:bg-accent",
                !isCurrentMonth && "text-muted-foreground opacity-50",
                isCurrentDay && "bg-accent font-semibold"
              )}
            >
              <span>{format(day, 'd')}</span>
              {hasEvents && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {dayEvents.slice(0, 3).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 h-1 rounded-full bg-primary"
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* View all link */}
      <div className="mt-3 text-center">
        <button
          onClick={() => router.push('/calendar?view=month')}
          className="text-xs text-primary hover:underline"
        >
          View full calendar
        </button>
      </div>
    </div>
  )
}
