'use client'

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { CalendarHeaderProps, CalendarView } from "./types"

export function CalendarHeader({
  currentDate,
  view,
  onNavigate,
  onToday,
  onViewChange,
  title,
  actions,
  showViewSelector = false
}: CalendarHeaderProps) {
  const formatPeriodTitle = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long'
    }
    
    switch (view) {
      case 'month':
        return currentDate.toLocaleDateString(undefined, options)
      case 'week':
        const startOfWeek = new Date(currentDate)
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`
      case 'day':
        return currentDate.toLocaleDateString(undefined, { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold min-w-[200px] text-center">
            {formatPeriodTitle()}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
        >
          Today
        </Button>
      </div>
      
      <div className="flex items-center gap-3">
        {showViewSelector && onViewChange && (
          <Select value={view} onValueChange={(value: CalendarView) => onViewChange(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
        )}
        
        {actions}
      </div>
    </div>
  )
}