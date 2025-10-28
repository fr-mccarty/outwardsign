'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageContainer } from '@/components/page-container'
import { 
  Clock,
  Heart,
  Plus,
  List,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useBreadcrumbs } from '@/components/breadcrumb-context'
import { getCurrentParish } from '@/lib/auth/parish'
import { 
  getMassIntentionsByDateRange,
  type MassIntentionWithDetails
} from '@/lib/actions/mass-intentions'
import { Parish } from '@/lib/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Calendar, CalendarView, CalendarItem } from '@/components/calendar'
import type { CalendarDay } from '@/components/calendar/types'

// Extend MassIntentionWithDetails to match CalendarItem interface
interface MassIntentionCalendarItem extends MassIntentionWithDetails, CalendarItem {
  date: string // event_date mapped to date
  title: string // mass_offered_for mapped to title
}

export function MassIntentionsCalendar() {
  const [, setCurrentParish] = useState<Parish | null>(null)
  const [intentions, setIntentions] = useState<MassIntentionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [calendarView, setCalendarView] = useState<CalendarView>('month')
  const { setBreadcrumbs } = useBreadcrumbs()

  useEffect(() => {
    setBreadcrumbs([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Mass Intentions", href: "/mass-intentions" },
      { label: "Calendar" }
    ])
  }, [setBreadcrumbs])

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, calendarView])

  async function loadData() {
    try {
      setLoading(true)
      const parish = await getCurrentParish()
      if (parish) {
        setCurrentParish(parish)
        await loadIntentions()
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load calendar data')
    } finally {
      setLoading(false)
    }
  }

  async function loadIntentions() {
    try {
      const { startDate, endDate } = getDateRange()
      const data = await getMassIntentionsByDateRange(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      )
      setIntentions(data)
    } catch (error) {
      console.error('Error loading intentions:', error)
      toast.error('Failed to load Mass intentions')
    }
  }

  const getDateRange = () => {
    const start = new Date(currentDate)
    const end = new Date(currentDate)

    switch (calendarView) {
      case 'month':
        start.setDate(1)
        start.setDate(start.getDate() - start.getDay()) // Start of week containing first day
        end.setMonth(end.getMonth() + 1, 0) // Last day of month
        end.setDate(end.getDate() + (6 - end.getDay())) // End of week containing last day
        break
      case 'week':
        start.setDate(start.getDate() - start.getDay()) // Start of week
        end.setDate(start.getDate() + 6) // End of week
        break
      case 'day':
        // For day view, we'll load a week's worth of data
        start.setDate(start.getDate() - 3)
        end.setDate(start.getDate() + 6)
        break
    }

    return { startDate: start, endDate: end }
  }

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    
    switch (calendarView) {
      case 'month':
        newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
        break
      case 'week':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
        break
      case 'day':
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1))
        break
    }
    
    setCurrentDate(newDate)
  }

  const getMonthCalendarDays = (): CalendarDay[] => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - startDate.getDay())
    
    const days: CalendarDay[] = []
    const currentDateForLoop = new Date(startDate)
    
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      const dayIntentions = intentions.filter(intention => {
        if (!intention.event_date) return false
        const intentionDate = new Date(intention.event_date)
        return intentionDate.toDateString() === currentDateForLoop.toDateString()
      })

      days.push({
        date: new Date(currentDateForLoop),
        isCurrentMonth: currentDateForLoop.getMonth() === currentDate.getMonth(),
        isToday: currentDateForLoop.toDateString() === new Date().toDateString(),
        items: [] // TODO: Fix transformation of dayIntentions to CalendarItem[]
      })
      
      currentDateForLoop.setDate(currentDateForLoop.getDate() + 1)
    }
    
    return days
  }

  const getWeekDays = (): CalendarDay[] => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    
    const days: CalendarDay[] = []
    
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek)
      dayDate.setDate(startOfWeek.getDate() + i)
      
      const dayIntentions = intentions.filter(intention => {
        if (!intention.event_date) return false
        const intentionDate = new Date(intention.event_date)
        return intentionDate.toDateString() === dayDate.toDateString()
      })

      days.push({
        date: dayDate,
        isCurrentMonth: true,
        isToday: dayDate.toDateString() === new Date().toDateString(),
        items: [] // TODO: Fix transformation of dayIntentions to CalendarItem[]
      })
    }
    
    return days
  }

  const getDayIntentions = (): MassIntentionWithDetails[] => {
    return intentions.filter(intention => {
      if (!intention.event_date) return false
      const intentionDate = new Date(intention.event_date)
      return intentionDate.toDateString() === currentDate.toDateString()
    })
  }

  const formatTime = (timeString: string | null) => {
    if (!timeString) return ''
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit' 
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-green-100 text-green-800'
      case 'unscheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'conflicted':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <CheckCircle2 className="h-3 w-3" />
      case 'unscheduled':
        return <Clock className="h-3 w-3" />
      case 'conflicted':
        return <AlertCircle className="h-3 w-3" />
      default:
        return null
    }
  }

  const formatPeriodTitle = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long'
    }
    
    switch (calendarView) {
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

  const renderMonthView = () => {
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
          <div
            key={index}
            className={cn(
              "min-h-[100px] border border-gray-200 p-2 cursor-pointer hover:bg-gray-50",
              !day.isCurrentMonth && "bg-gray-50 text-muted-foreground",
              day.isToday && "bg-blue-50 border-blue-300"
            )}
            onClick={() => setSelectedDate(day.date)}
          >
            <div className="font-medium text-sm mb-1">
              {day.date.getDate()}
            </div>
            <div className="space-y-1">
              {day.items.slice(0, 3).map((intention) => (
                <div
                  key={intention.id}
                  className={cn(
                    "text-xs px-2 py-1 rounded truncate",
                    getStatusColor(intention.status)
                  )}
                >
                  {formatTime(intention.start_time)} {intention.mass_offered_for}
                </div>
              ))}
              {day.items.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{day.items.length - 3} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderWeekView = () => {
    const days = getWeekDays()
    
    return (
      <div className="grid grid-cols-7 gap-4">
        {days.map((day, index) => (
          <Card key={index} className={cn(day.isToday && "border-blue-300")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {day.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {day.items.map((intention) => (
                  <div
                    key={intention.id}
                    className={cn(
                      "text-xs px-2 py-1 rounded",
                      getStatusColor(intention.status)
                    )}
                  >
                    <div className="font-medium">{formatTime(intention.start_time)}</div>
                    <div className="truncate">{intention.mass_offered_for}</div>
                    {intention.donor_name && (
                      <div className="text-xs opacity-75">by {intention.donor_name}</div>
                    )}
                  </div>
                ))}
                {day.items.length === 0 && (
                  <div className="text-xs text-muted-foreground">No intentions</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderDayView = () => {
    const dayIntentions = getDayIntentions()
    
    return (
      <div className="space-y-4">
        {dayIntentions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Mass Intentions</h3>
              <p className="text-muted-foreground mb-4">
                No Mass intentions are scheduled for this day.
              </p>
              <Button onClick={() => window.location.href = '/mass-intentions/create'}>
                <Plus className="h-4 w-4 mr-2" />
                Create Mass Intention
              </Button>
            </CardContent>
          </Card>
        ) : (
          dayIntentions.map((intention) => (
            <Card key={intention.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={cn("text-xs", getStatusColor(intention.status))}>
                        {getStatusIcon(intention.status)}
                        <span className="ml-1 capitalize">{intention.status}</span>
                      </Badge>
                      <span className="text-sm font-medium">
                        {formatTime(intention.start_time)} - {intention.event_name}
                      </span>
                    </div>
                    <h3 className="font-medium mb-1">{intention.mass_offered_for}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Donor:</span> {intention.donor_name || 'Not specified'}
                      </div>
                      <div>
                        <span className="font-medium">Celebrant:</span> {intention.celebrant_name || 'Not assigned'}
                      </div>
                    </div>
                    {intention.note && (
                      <p className="text-sm text-muted-foreground mt-2">{intention.note}</p>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = `/mass-intentions/${intention.id}`}
                  >
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <PageContainer
        title="Mass Intentions Calendar"
        description="View Mass intentions in calendar format"
        maxWidth="7xl"
      >
        <div className="space-y-6">Loading calendar...</div>
      </PageContainer>
    )
  }

  return (
    <PageContainer
      title="Mass Intentions Calendar"
      description="View Mass intentions in calendar format"
      maxWidth="7xl"
    >
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigatePeriod('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold min-w-[200px] text-center">
                {formatPeriodTitle()}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigatePeriod('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={calendarView} onValueChange={(value: CalendarView) => setCalendarView(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="day">Day</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => window.location.href = '/mass-intentions'}
            >
              <List className="h-4 w-4 mr-2" />
              List View
            </Button>
            
            <Button onClick={() => window.location.href = '/mass-intentions/create'}>
              <Plus className="h-4 w-4 mr-2" />
              New Intention
            </Button>
          </div>
        </div>

        {/* Calendar Content */}
        <Card>
          <CardContent className="p-6">
            {calendarView === 'month' && renderMonthView()}
            {calendarView === 'week' && renderWeekView()}
            {calendarView === 'day' && renderDayView()}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded"></div>
                <span>Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 rounded"></div>
                <span>Unscheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 rounded"></div>
                <span>Conflicted</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Modal/Panel - TODO: Add if needed */}
        {selectedDate && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>
                Mass Intentions for {selectedDate.toLocaleDateString()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Show intentions for selected date */}
              <div className="space-y-2">
                {intentions
                  .filter(intention => 
                    intention.event_date && 
                    new Date(intention.event_date).toDateString() === selectedDate.toDateString()
                  )
                  .map((intention) => (
                    <div key={intention.id} className="p-3 border rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={cn("text-xs", getStatusColor(intention.status))}>
                          {getStatusIcon(intention.status)}
                          <span className="ml-1 capitalize">{intention.status}</span>
                        </Badge>
                        <span className="text-sm font-medium">
                          {formatTime(intention.start_time)}
                        </span>
                      </div>
                      <p className="font-medium">{intention.mass_offered_for}</p>
                      <p className="text-sm text-muted-foreground">
                        Donor: {intention.donor_name || 'Not specified'}
                      </p>
                    </div>
                  ))}
              </div>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => setSelectedDate(null)}
              >
                Close
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PageContainer>
  )
}