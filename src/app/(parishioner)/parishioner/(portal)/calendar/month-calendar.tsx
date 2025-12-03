'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import type { CalendarEvent } from './actions'

interface MonthCalendarProps {
  events: CalendarEvent[]
  onDateClick?: (date: Date) => void
}

export function MonthCalendar({ events, onDateClick }: MonthCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isCollapsed, setIsCollapsed] = useState(false)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()

    return { daysInMonth, startDayOfWeek, year, month }
  }

  const { daysInMonth, startDayOfWeek, year, month } = getDaysInMonth(currentMonth)

  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const jumpToToday = () => {
    setCurrentMonth(new Date())
  }

  const hasEventOnDate = (day: number, type: 'assignment' | 'blackout') => {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.some((event) => event.date === dateString && event.type === type)
  }

  const handleDateClick = (day: number) => {
    if (onDateClick) {
      const date = new Date(year, month, day)
      onDateClick(date)
    }
  }

  if (isCollapsed) {
    return (
      <Card className="p-4">
        <Button variant="outline" className="w-full" onClick={() => setIsCollapsed(false)}>
          <CalendarDays className="h-4 w-4 mr-2" />
          Show Month Calendar
        </Button>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={jumpToToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(true)}
              className="md:hidden"
            >
              Hide
            </Button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const hasAssignment = hasEventOnDate(day, 'assignment')
            const hasBlackout = hasEventOnDate(day, 'blackout')
            const isToday =
              new Date().getDate() === day &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`
                  aspect-square p-1 rounded-lg text-sm
                  ${isToday ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-accent'}
                  ${hasAssignment || hasBlackout ? 'font-medium' : ''}
                `}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span>{day}</span>
                  <div className="flex gap-0.5 mt-0.5">
                    {hasAssignment && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Scheduled" />
                    )}
                    {hasBlackout && (
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" title="Unavailable" />
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs text-muted-foreground justify-center">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Scheduled</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Unavailable</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
